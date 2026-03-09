import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { prisma } from "../../config/database";
import { getCache, setCache } from "../../config/redis";

export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const cacheKey = `dashboard:${req.user!.id}`;
        const cached = await getCache(cacheKey);
        if (cached) { res.json({ success: true, data: cached, cached: true }); return; }

        const userId = req.user!.id;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const campaigns = await prisma.campaign.findMany({
            where: { userId },
            include: { adSets: { include: { ads: { include: { metrics: { where: { date: { gte: thirtyDaysAgo } } } } } } } },
        });

        let totalImpressions = 0, totalClicks = 0, totalSpend = 0, totalRevenue = 0, totalConversions = 0;
        const metricsTimeline: Record<string, { impressions: number; clicks: number; spend: number; revenue: number }> = {};

        campaigns.forEach((c: any) => {
            c.adSets.forEach((as: any) => {
                as.ads.forEach((ad: any) => {
                    ad.metrics.forEach((m: any) => {
                        totalImpressions += m.impressions;
                        totalClicks += m.clicks;
                        totalSpend += m.spend;
                        totalRevenue += m.revenue;
                        totalConversions += m.conversions;
                        const day = m.date.toISOString().split("T")[0];
                        if (!metricsTimeline[day]) metricsTimeline[day] = { impressions: 0, clicks: 0, spend: 0, revenue: 0 };
                        metricsTimeline[day].impressions += m.impressions;
                        metricsTimeline[day].clicks += m.clicks;
                        metricsTimeline[day].spend += m.spend;
                        metricsTimeline[day].revenue += m.revenue;
                    });
                });
            });
        });

        const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

        const [activeCampaigns, aiRecsCount, topAds] = await Promise.all([
            prisma.campaign.count({ where: { userId, status: "ACTIVE" } }),
            prisma.aiRecommendation.count({ where: { userId, isRead: false } }),
            prisma.ad.findMany({
                where: { adSet: { campaign: { userId } } },
                include: { metrics: { orderBy: { date: "desc" }, take: 1 } },
                take: 5,
                orderBy: { createdAt: "desc" },
            }),
        ]);

        const timeline = Object.entries(metricsTimeline)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, data]) => ({
                date,
                ctr: data.impressions > 0 ? ((data.clicks / data.impressions) * 100).toFixed(2) : "0",
                ...data,
            }));

        const dashboard = {
            kpi: {
                totalImpressions, totalClicks, totalSpend, totalRevenue, totalConversions,
                avgCtr: avgCtr.toFixed(2), roas: roas.toFixed(2), activeCampaigns, unreadInsights: aiRecsCount,
            },
            timeline,
            topAds,
        };

        await setCache(cacheKey, dashboard, 300);
        res.json({ success: true, data: dashboard });
    } catch (err) {
        next(err);
    }
}

export async function listReports(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const reports = await prisma.analyticsReport.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, data: reports });
    } catch (err) {
        next(err);
    }
}

export async function generateReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const { title, dateFrom, dateTo } = req.body;
        const metrics = await prisma.metric.findMany({
            where: {
                ad: { adSet: { campaign: { userId: req.user!.id } } },
                date: { gte: new Date(dateFrom), lte: new Date(dateTo) },
            },
        });

        const agg = metrics.reduce(
            (acc: any, m: any) => ({
                impressions: acc.impressions + m.impressions,
                clicks: acc.clicks + m.clicks,
                spend: acc.spend + m.spend,
                revenue: acc.revenue + m.revenue,
                conversions: acc.conversions + m.conversions,
            }),
            { impressions: 0, clicks: 0, spend: 0, revenue: 0, conversions: 0 }
        );

        const report = await prisma.analyticsReport.create({
            data: {
                userId: req.user!.id,
                title: title || `Report ${new Date().toLocaleDateString()}`,
                data: { ...agg, ctr: agg.impressions > 0 ? (agg.clicks / agg.impressions) * 100 : 0, roas: agg.spend > 0 ? agg.revenue / agg.spend : 0 },
                dateFrom: new Date(dateFrom),
                dateTo: new Date(dateTo),
            },
        });
        res.status(201).json({ success: true, data: report });
    } catch (err) {
        next(err);
    }
}

export async function getAdMetrics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const metrics = await prisma.metric.findMany({
            where: { adId: req.params.adId },
            orderBy: { date: "asc" },
        });
        res.json({ success: true, data: metrics });
    } catch (err) {
        next(err);
    }
}

export async function ingestMetrics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const metric = await prisma.metric.create({ data: req.body });
        res.status(201).json({ success: true, data: metric });
    } catch (err) {
        next(err);
    }
}

export async function getTopAds(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const top = await prisma.ad.findMany({
            where: { adSet: { campaign: { userId: req.user!.id } } },
            include: { metrics: { take: 1, orderBy: { date: "desc" } } },
            take: 10,
        });
        res.json({ success: true, data: top });
    } catch (err) {
        next(err);
    }
}
