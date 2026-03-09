import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { prisma } from "../../config/database";
import { createError } from "../../middlewares/errorHandler";

export async function listCourses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const courses = await prisma.course.findMany({
            where: { isPublished: true },
            include: {
                _count: { select: { modules: true, enrollments: true } },
                enrollments: { where: { userId: req.user!.id }, select: { completedAt: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, data: courses });
    } catch (err) {
        next(err);
    }
}

export async function getCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const course = await prisma.course.findUnique({
            where: { id: req.params.id },
            include: {
                modules: {
                    orderBy: { order: "asc" },
                    include: { lessons: { orderBy: { order: "asc" }, include: { progress: { where: { userId: req.user!.id } } } } },
                },
                enrollments: { where: { userId: req.user!.id } },
                _count: { select: { enrollments: true } },
            },
        });
        if (!course) throw createError("Course not found", 404);
        res.json({ success: true, data: course });
    } catch (err) {
        next(err);
    }
}

export async function enroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const course = await prisma.course.findUnique({ where: { id: req.params.id } });
        if (!course) throw createError("Course not found", 404);

        const enrollment = await prisma.enrollment.upsert({
            where: { userId_courseId: { userId: req.user!.id, courseId: req.params.id } },
            update: {},
            create: { userId: req.user!.id, courseId: req.params.id },
        });
        res.json({ success: true, data: enrollment });
    } catch (err) {
        next(err);
    }
}

export async function updateProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const { completed, watchedSecs } = req.body;
        const progress = await prisma.lessonProgress.upsert({
            where: { userId_lessonId: { userId: req.user!.id, lessonId: req.params.lessonId } },
            update: { ...(completed !== undefined && { completed }), ...(watchedSecs !== undefined && { watchedSecs }) },
            create: { userId: req.user!.id, lessonId: req.params.lessonId, completed: completed || false, watchedSecs: watchedSecs || 0 },
        });
        res.json({ success: true, data: progress });
    } catch (err) {
        next(err);
    }
}

export async function getMyEnrollments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: req.user!.id },
            include: { course: { include: { _count: { select: { modules: true } } } } },
        });
        res.json({ success: true, data: enrollments });
    } catch (err) {
        next(err);
    }
}
