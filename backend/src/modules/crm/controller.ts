import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { prisma } from "../../config/database";
import { createError } from "../../middlewares/errorHandler";

export async function listLeads(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where: { userId: req.user!.id, ...(status && { status: status as any }) },
                orderBy: { createdAt: "desc" },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                include: { _count: { select: { interactions: true } } },
            }),
            prisma.lead.count({ where: { userId: req.user!.id } }),
        ]);
        res.json({ success: true, data: leads, meta: { total, page: Number(page) } });
    } catch (err) { next(err); }
}

export async function createLead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const lead = await prisma.lead.create({
            data: { ...req.body, userId: req.user!.id },
        });
        res.status(201).json({ success: true, data: lead });
    } catch (err) { next(err); }
}

export async function getLead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const lead = await prisma.lead.findFirst({
            where: { id: req.params.id, userId: req.user!.id },
            include: { interactions: { orderBy: { createdAt: "desc" } } },
        });
        if (!lead) throw createError("Lead not found", 404);
        res.json({ success: true, data: lead });
    } catch (err) { next(err); }
}

export async function updateLead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const lead = await prisma.lead.updateMany({
            where: { id: req.params.id, userId: req.user!.id },
            data: req.body,
        });
        res.json({ success: true, data: lead });
    } catch (err) { next(err); }
}

export async function deleteLead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        await prisma.lead.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
        res.json({ success: true, message: "Lead deleted" });
    } catch (err) { next(err); }
}

export async function addInteraction(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const lead = await prisma.lead.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
        if (!lead) throw createError("Lead not found", 404);
        const interaction = await prisma.crmInteraction.create({
            data: { leadId: req.params.id, userId: req.user!.id, type: req.body.type, notes: req.body.notes },
        });
        res.status(201).json({ success: true, data: interaction });
    } catch (err) { next(err); }
}

export async function getInteractions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const interactions = await prisma.crmInteraction.findMany({
            where: { leadId: req.params.id },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, data: interactions });
    } catch (err) { next(err); }
}
