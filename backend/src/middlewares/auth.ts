import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        planId?: string | null;
    };
}

export async function authenticate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized: No token provided" });
            return;
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
            userId: string;
            email: string;
            role: string;
        };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true, planId: true },
        });

        if (!user) {
            res.status(401).json({ error: "Unauthorized: User not found" });
            return;
        }

        req.user = { id: user.id, email: user.email, role: user.role, planId: user.planId };
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: "Token expired" });
            return;
        }
        res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
}

export function authorize(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: "Forbidden: Insufficient permissions" });
            return;
        }
        next();
    };
}
