import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../../config/database";
import { redis, isRedisAvailable } from "../../config/redis";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { createError } from "../../middlewares/errorHandler";
import { AuthRequest } from "../../middlewares/auth";

const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: "Password must contain uppercase, lowercase, and number",
    }),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = registerSchema.parse(req.body);

        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw createError("Email already registered", 409);
        }

        const freePlan = await prisma.plan.findUnique({ where: { name: "FREE" } });
        const passwordHash = await bcrypt.hash(data.password, 10);

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
                planId: freePlan?.id,
                aiCredits: 10,
            },
            select: { id: true, name: true, email: true, role: true, planId: true, createdAt: true },
        });

        const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
        const refreshToken = generateRefreshToken(user.id);

        try {
            if (isRedisAvailable()) {
                await redis.setex(`refresh:${user.id}`, 7 * 24 * 60 * 60, refreshToken);
            }
        } catch { /* Redis unavailable, skip token storage */ }

        res.status(201).json({ success: true, data: { user, accessToken, refreshToken } });
    } catch (err) {
        next(err);
    }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user) throw createError("Invalid credentials", 401);

        const valid = await bcrypt.compare(data.password, user.passwordHash);
        if (!valid) throw createError("Invalid credentials", 401);

        const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
        const refreshToken = generateRefreshToken(user.id);

        try {
            if (isRedisAvailable()) {
                await redis.setex(`refresh:${user.id}`, 7 * 24 * 60 * 60, refreshToken);
            }
        } catch { /* Redis unavailable, skip token storage */ }

        res.json({
            success: true,
            data: {
                user: { id: user.id, name: user.name, email: user.email, role: user.role, planId: user.planId },
                accessToken,
                refreshToken,
            },
        });
    } catch (err) {
        next(err);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) throw createError("Refresh token required", 400);

        const payload = verifyRefreshToken(refreshToken);

        // If Redis is available, validate stored token; otherwise just verify JWT signature
        if (isRedisAvailable()) {
            try {
                const stored = await redis.get(`refresh:${payload.userId}`);
                if (!stored || stored !== refreshToken) throw createError("Invalid refresh token", 401);
            } catch (redisErr: any) {
                if (redisErr?.status === 401) throw redisErr;
                // Redis error, fall through to JWT-only validation
            }
        }

        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) throw createError("User not found", 401);

        const newAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
        const newRefreshToken = generateRefreshToken(user.id);

        try {
            if (isRedisAvailable()) {
                await redis.setex(`refresh:${user.id}`, 7 * 24 * 60 * 60, newRefreshToken);
            }
        } catch { /* Redis unavailable */ }

        res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
    } catch (err) {
        next(err);
    }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.user?.id && isRedisAvailable()) {
            try { await redis.del(`refresh:${req.user.id}`); } catch { /* ignore */ }
        }
        res.json({ success: true, message: "Logged out" });
    } catch (err) {
        next(err);
    }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true, name: true, email: true, role: true, avatar: true,
                aiCredits: true, isVerified: true, createdAt: true,
                plan: { select: { name: true, price: true, maxAiCredits: true, features: true } },
                _count: { select: { campaigns: true, enrollments: true } },
            },
        });
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const { name, avatar } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: { ...(name && { name }), ...(avatar && { avatar }) },
            select: { id: true, name: true, email: true, avatar: true },
        });
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
}
