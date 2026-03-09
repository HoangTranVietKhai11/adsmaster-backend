import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { prisma } from "../../config/database";
import { createError } from "../../middlewares/errorHandler";
import { v4 as uuidv4 } from "uuid";

export async function getAffiliateDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const affiliate = await prisma.affiliate.findUnique({
            where: { userId: req.user!.id },
            include: {
                referrals: { orderBy: { createdAt: "desc" }, take: 10 },
            },
        });

        if (!affiliate) {
            res.json({ success: true, data: null, message: "Not yet an affiliate" });
            return;
        }

        const stats = {
            totalReferrals: await prisma.referral.count({ where: { affiliateId: affiliate.id } }),
            pendingCommissions: await prisma.referral.aggregate({
                where: { affiliateId: affiliate.id, status: "PENDING" },
                _sum: { commission: true },
            }),
            totalEarned: affiliate.totalEarned,
            totalPaid: affiliate.totalPaid,
            balance: affiliate.totalEarned - affiliate.totalPaid,
            referralLink: `${process.env.FRONTEND_URL}/ref/${affiliate.code}`,
        };

        res.json({ success: true, data: { affiliate, stats } });
    } catch (err) {
        next(err);
    }
}

export async function joinAffiliateProgram(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const existing = await prisma.affiliate.findUnique({ where: { userId: req.user!.id } });
        if (existing) throw createError("Already an affiliate", 409);

        const code = req.user!.id.slice(0, 8) + uuidv4().slice(0, 4);
        const affiliate = await prisma.affiliate.create({
            data: {
                userId: req.user!.id,
                code,
                status: "ACTIVE",
                commissionRate: Number(process.env.AFFILIATE_COMMISSION_RATE || 0.30),
            },
        });

        res.status(201).json({ success: true, data: affiliate });
    } catch (err) {
        next(err);
    }
}

export async function getMyReferrals(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const affiliate = await prisma.affiliate.findUnique({ where: { userId: req.user!.id } });
        if (!affiliate) throw createError("Not an affiliate", 404);

        const referrals = await prisma.referral.findMany({
            where: { affiliateId: affiliate.id },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, data: referrals });
    } catch (err) {
        next(err);
    }
}

export async function trackReferral(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { code } = req.params;
        const affiliate = await prisma.affiliate.findUnique({ where: { code } });
        if (affiliate) {
            // Could set a cookie to track conversion later
            res.json({ success: true, affiliateId: affiliate.id });
        } else {
            res.status(404).json({ error: "Invalid referral code" });
        }
    } catch (err) {
        next(err);
    }
}
