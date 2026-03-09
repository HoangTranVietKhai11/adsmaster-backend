import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../middlewares/auth";
import { prisma } from "../../config/database";
import { createError } from "../../middlewares/errorHandler";

const campaignSchema = z.object({
    name: z.string().min(1).max(200),
    objective: z.enum(["AWARENESS", "TRAFFIC", "ENGAGEMENT", "LEADS", "SALES", "APP_PROMOTION"]).default("TRAFFIC"),
    budget: z.number().positive(),
    dailyBudget: z.number().positive().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
});

export async function listCampaigns(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [campaigns, total] = await Promise.all([
            prisma.campaign.findMany({
                where: {
                    userId: req.user!.id,
                    ...(status && { status: status as any }),
                },
                include: {
                    adSets: { include: { ads: { include: { _count: { select: { metrics: true } } } } } },
                    _count: { select: { adSets: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: Number(limit),
            }),
            prisma.campaign.count({ where: { userId: req.user!.id } }),
        ]);

        res.json({ success: true, data: campaigns, meta: { total, page: Number(page), limit: Number(limit) } });
    } catch (err) {
        next(err);
    }
}

export async function getCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const campaign = await prisma.campaign.findFirst({
            where: { id: req.params.id, userId: req.user!.id },
            include: {
                adSets: {
                    include: {
                        ads: { include: { metrics: { orderBy: { date: "desc" }, take: 30 } } },
                    },
                },
            },
        });
        if (!campaign) throw createError("Campaign not found", 404);
        res.json({ success: true, data: campaign });
    } catch (err) {
        next(err);
    }
}

export async function createCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = campaignSchema.parse(req.body);
        const campaign = await prisma.campaign.create({
            data: {
                ...data,
                userId: req.user!.id,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
        res.status(201).json({ success: true, data: campaign });
    } catch (err) {
        next(err);
    }
}

export async function updateCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const existing = await prisma.campaign.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
        if (!existing) throw createError("Campaign not found", 404);
        const data = campaignSchema.partial().parse(req.body);
        const campaign = await prisma.campaign.update({ where: { id: req.params.id }, data });
        res.json({ success: true, data: campaign });
    } catch (err) {
        next(err);
    }
}

export async function deleteCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const existing = await prisma.campaign.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
        if (!existing) throw createError("Campaign not found", 404);
        await prisma.campaign.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: "Campaign deleted" });
    } catch (err) {
        next(err);
    }
}

export async function createAdSet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const campaign = await prisma.campaign.findFirst({ where: { id: req.params.campaignId, userId: req.user!.id } });
        if (!campaign) throw createError("Campaign not found", 404);
        const adSet = await prisma.adSet.create({
            data: {
                campaignId: req.params.campaignId,
                name: req.body.name,
                targeting: req.body.targeting,
                budget: req.body.budget,
                bidStrategy: req.body.bidStrategy,
            },
        });
        res.status(201).json({ success: true, data: adSet });
    } catch (err) {
        next(err);
    }
}

export async function updateAdSet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const adSet = await prisma.adSet.update({
            where: { id: req.params.adSetId },
            data: req.body,
        });
        res.json({ success: true, data: adSet });
    } catch (err) {
        next(err);
    }
}

export async function deleteAdSet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        await prisma.adSet.delete({ where: { id: req.params.adSetId } });
        res.json({ success: true, message: "Ad Set deleted" });
    } catch (err) {
        next(err);
    }
}

export async function createAd(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const ad = await prisma.ad.create({
            data: {
                adSetId: req.params.adSetId,
                name: req.body.name,
                headline: req.body.headline,
                primaryText: req.body.primaryText,
                cta: req.body.cta,
                imageUrl: req.body.imageUrl,
                videoUrl: req.body.videoUrl,
                status: req.body.status || "DRAFT",
            },
        });
        res.status(201).json({ success: true, data: ad });
    } catch (err) {
        next(err);
    }
}

export async function updateAd(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const ad = await prisma.ad.update({ where: { id: req.params.adId }, data: req.body });
        res.json({ success: true, data: ad });
    } catch (err) {
        next(err);
    }
}

export async function deleteAd(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        await prisma.ad.delete({ where: { id: req.params.adId } });
        res.json({ success: true, message: "Ad deleted" });
    } catch (err) {
        next(err);
    }
}
