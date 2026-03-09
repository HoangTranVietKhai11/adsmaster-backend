import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { prisma } from "../../config/database";

export async function listNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        const unreadCount = await prisma.notification.count({ where: { userId: req.user!.id, isRead: false } });
        res.json({ success: true, data: notifications, unreadCount });
    } catch (err) { next(err); }
}

export async function markRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user!.id }, data: { isRead: true } });
        res.json({ success: true });
    } catch (err) { next(err); }
}

export async function markAllRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        await prisma.notification.updateMany({ where: { userId: req.user!.id, isRead: false }, data: { isRead: true } });
        res.json({ success: true });
    } catch (err) { next(err); }
}
