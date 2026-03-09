import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { prisma } from "../../config/database";

export async function getAdminStats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const [totalUsers, totalCampaigns, totalRevenue, totalAffiliates, recentPayments, userGrowth] = await Promise.all([
            prisma.user.count(),
            prisma.campaign.count(),
            prisma.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amount: true } }),
            prisma.affiliate.count(),
            prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { name: true, email: true } } } }),
            prisma.user.groupBy({
                by: ["createdAt"],
                _count: { id: true },
                orderBy: { createdAt: "asc" },
            }),
        ]);

        res.json({
            success: true,
            data: {
                totalUsers, totalCampaigns, totalAffiliates,
                totalRevenue: totalRevenue._sum.amount || 0,
                recentPayments, userGrowth,
            },
        });
    } catch (err) { next(err); }
}

export async function listUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: search ? { OR: [{ name: { contains: String(search), mode: "insensitive" } }, { email: { contains: String(search), mode: "insensitive" } }] } : {},
                select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true, plan: { select: { name: true } }, _count: { select: { campaigns: true } } },
                skip: (Number(page) - 1) * Number(limit), take: Number(limit),
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.count(),
        ]);
        res.json({ success: true, data: users, meta: { total, page: Number(page) } });
    } catch (err) { next(err); }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = await prisma.user.update({ where: { id: req.params.id }, data: req.body });
        res.json({ success: true, data: user });
    } catch (err) { next(err); }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: "User deleted" });
    } catch (err) { next(err); }
}

export async function listCourses(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const courses = await prisma.course.findMany({ include: { _count: { select: { enrollments: true, modules: true } } }, orderBy: { createdAt: "desc" } });
        res.json({ success: true, data: courses });
    } catch (err) { next(err); }
}

export async function createCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const course = await prisma.course.create({ data: { ...req.body, instructorId: req.user!.id } });
        res.status(201).json({ success: true, data: course });
    } catch (err) { next(err); }
}

export async function updateCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const course = await prisma.course.update({ where: { id: req.params.id }, data: req.body });
        res.json({ success: true, data: course });
    } catch (err) { next(err); }
}

export async function deleteCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        await prisma.course.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: "Course deleted" });
    } catch (err) { next(err); }
}

export async function listPayments(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const payments = await prisma.payment.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
        res.json({ success: true, data: payments });
    } catch (err) { next(err); }
}

export async function listAffiliates(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const affiliates = await prisma.affiliate.findMany({ include: { user: { select: { name: true, email: true } }, _count: { select: { referrals: true } } }, orderBy: { totalEarned: "desc" } });
        res.json({ success: true, data: affiliates });
    } catch (err) { next(err); }
}

export async function approveAffiliate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const affiliate = await prisma.affiliate.update({ where: { id: req.params.id }, data: { status: "ACTIVE" } });
        res.json({ success: true, data: affiliate });
    } catch (err) { next(err); }
}
