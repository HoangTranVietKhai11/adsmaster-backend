import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../middlewares/auth";
import { openai } from "../../config/openai";
import { prisma } from "../../config/database";
import { createError } from "../../middlewares/errorHandler";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract JSON from a response that might contain markdown fences */
function extractJSON(text: string): string {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) return fenced[1].trim();
    const braced = text.match(/\{[\s\S]*\}/);
    if (braced) return braced[0];
    return text;
}

// ─── Industry Benchmarks (ported from Python ai-engine) ───────────────────────

const BENCHMARKS = {
    ctr: { low: 0.5, avg: 1.5, high: 3.0 },        // %
    cpc: { low: 0.5, avg: 1.5, high: 5.0 },         // USD
    cpa: { low: 5, avg: 25, high: 100 },             // USD
    roas: { low: 1.5, avg: 3.0, high: 6.0 },        // x
    frequency: { warning: 3.5, critical: 5.0 },
};

const RECOMMENDATION_TEMPLATES: Record<string, Record<string, { title: string; actions: string[] }>> = {
    LOW_CTR: {
        WARNING: {
            title: "CTR Below Industry Average — Action Required",
            actions: [
                "Pause underperforming ads and reallocate budget",
                "Run A/B test with 3-5 creative variations",
                "Narrow audience targeting for better relevance",
                "Refresh ad copy with urgency-driven language",
            ],
        },
        CRITICAL: {
            title: "🚨 Critical: CTR Critically Low",
            actions: [
                "Immediately pause this ad",
                "Audit your ad creative — replace with proven formats",
                "Revisit targeting — audience may be too broad or irrelevant",
                "Check ad placement and consider excluding low-quality placements",
            ],
        },
    },
    HIGH_CPA: {
        WARNING: {
            title: "Cost Per Acquisition Is Too High",
            actions: [
                "Optimize your landing page conversion rate",
                "Review your checkout/funnel for friction points",
                "Test different CTA buttons and page layouts",
                "Refine audience to higher-intent segments",
            ],
        },
        CRITICAL: {
            title: "🚨 Critical: CPA Is Unsustainable",
            actions: [
                "Pause or reduce budget immediately",
                "Switch to manual bidding with lower caps",
                "Require landing page CRO audit",
                "Test retargeting warm audiences instead of cold traffic",
            ],
        },
    },
    LOW_ROAS: {
        CRITICAL: {
            title: "🚨 ROAS Below Break-Even — Stop Spending",
            actions: [
                "Pause the campaign immediately to stop losses",
                "Review product pricing vs. ad costs",
                "Focus budget on highest converting ad sets only",
                "Implement proper conversion tracking if not done",
            ],
        },
    },
    CREATIVE_FATIGUE: {
        WARNING: {
            title: "Audience Fatigue Detected",
            actions: [
                "Introduce 2-3 new creative variations this week",
                "Expand your target audience to reduce frequency",
                "Schedule creative rotation on a weekly basis",
                "Try different ad formats (carousel, video, collection)",
            ],
        },
        CRITICAL: {
            title: "🚨 Severe Creative Fatigue — Rotate Now",
            actions: [
                "Immediately swap all creatives",
                "Create a lookalike audience from recent converters",
                "Expand geographic targeting",
                "Reset campaign with fresh creative and new audience seeds",
            ],
        },
    },
    HIGH_CPC: {
        WARNING: {
            title: "High Cost Per Click",
            actions: [
                "Improve ad relevance score by matching copy to audience interests",
                "Test broader audiences to reduce competition",
                "Try automatic placements to find cheaper inventory",
                "Use engagement objective first to build social proof",
            ],
        },
    },
};

// ─── Pure TypeScript Analytics Engine (ported from Python ai-engine) ──────────

interface MetricRecord {
    ad_id: string;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpa: number;
    roas: number;
    spend: number;
    revenue: number;
    conversions: number;
    reach: number;
    frequency: number;
    date?: string;
}

interface Issue {
    type: string;
    severity: string;
    metric: string;
    value: number;
    benchmark: number;
    message: string;
}

function analyzeSingleAd(row: MetricRecord): Issue[] {
    const issues: Issue[] = [];

    // CTR check
    if (row.ctr < BENCHMARKS.ctr.low) {
        issues.push({ type: "LOW_CTR", severity: "CRITICAL", metric: "ctr", value: +row.ctr.toFixed(2), benchmark: BENCHMARKS.ctr.avg, message: `CTR ${row.ctr.toFixed(2)}% is critically below industry average ${BENCHMARKS.ctr.avg}%. Test new creatives immediately.` });
    } else if (row.ctr < BENCHMARKS.ctr.avg) {
        issues.push({ type: "LOW_CTR", severity: "WARNING", metric: "ctr", value: +row.ctr.toFixed(2), benchmark: BENCHMARKS.ctr.avg, message: `CTR ${row.ctr.toFixed(2)}% is below average. Consider refreshing ad creative or copy.` });
    }

    // CPA check
    if (row.cpa > BENCHMARKS.cpa.high) {
        issues.push({ type: "HIGH_CPA", severity: "CRITICAL", metric: "cpa", value: +row.cpa.toFixed(2), benchmark: BENCHMARKS.cpa.avg, message: `CPA $${row.cpa.toFixed(2)} is too high. Review targeting and funnel conversion.` });
    } else if (row.cpa > BENCHMARKS.cpa.avg) {
        issues.push({ type: "HIGH_CPA", severity: "WARNING", metric: "cpa", value: +row.cpa.toFixed(2), benchmark: BENCHMARKS.cpa.avg, message: `CPA $${row.cpa.toFixed(2)} is above average. Optimize landing page and targeting.` });
    }

    // ROAS check
    if (row.roas > 0 && row.roas < BENCHMARKS.roas.low) {
        issues.push({ type: "LOW_ROAS", severity: "CRITICAL", metric: "roas", value: +row.roas.toFixed(2), benchmark: BENCHMARKS.roas.avg, message: `ROAS ${row.roas.toFixed(2)}x means you're losing money. Pause this ad and review strategy.` });
    }

    // Frequency (creative fatigue)
    if (row.frequency >= BENCHMARKS.frequency.critical) {
        issues.push({ type: "CREATIVE_FATIGUE", severity: "CRITICAL", metric: "frequency", value: +row.frequency.toFixed(2), benchmark: BENCHMARKS.frequency.warning, message: `Frequency ${row.frequency.toFixed(1)} indicates severe creative fatigue. Rotate creatives immediately.` });
    } else if (row.frequency >= BENCHMARKS.frequency.warning) {
        issues.push({ type: "CREATIVE_FATIGUE", severity: "WARNING", metric: "frequency", value: +row.frequency.toFixed(2), benchmark: BENCHMARKS.frequency.warning, message: `Frequency ${row.frequency.toFixed(1)} suggests audience fatigue. Introduce new creatives.` });
    }

    // CPC check
    if (row.cpc > BENCHMARKS.cpc.high) {
        issues.push({ type: "HIGH_CPC", severity: "WARNING", metric: "cpc", value: +row.cpc.toFixed(2), benchmark: BENCHMARKS.cpc.avg, message: `CPC $${row.cpc.toFixed(2)} is high. Improve relevance score or expand audience.` });
    }

    return issues;
}

function computeScore(row: MetricRecord): number {
    let score = 100;
    if (row.ctr < BENCHMARKS.ctr.low) score -= 30;
    else if (row.ctr < BENCHMARKS.ctr.avg) score -= 15;
    if (row.roas > 0 && row.roas < BENCHMARKS.roas.low) score -= 35;
    else if (row.roas > 0 && row.roas < BENCHMARKS.roas.avg) score -= 15;
    else if (row.roas >= BENCHMARKS.roas.high) score += 10;
    if (row.frequency >= BENCHMARKS.frequency.critical) score -= 20;
    else if (row.frequency >= BENCHMARKS.frequency.warning) score -= 10;
    return Math.max(0, Math.min(100, score));
}

function computeSummary(metrics: MetricRecord[]) {
    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    return {
        avg_ctr: +avg(metrics.map(m => m.ctr)).toFixed(2),
        avg_cpc: +avg(metrics.map(m => m.cpc)).toFixed(2),
        avg_cpa: +avg(metrics.map(m => m.cpa)).toFixed(2),
        avg_roas: +avg(metrics.map(m => m.roas)).toFixed(2),
        avg_frequency: +avg(metrics.map(m => m.frequency)).toFixed(2),
        total_spend: +sum(metrics.map(m => m.spend)).toFixed(2),
        total_revenue: +sum(metrics.map(m => m.revenue)).toFixed(2),
        total_impressions: Math.round(sum(metrics.map(m => m.impressions))),
        total_clicks: Math.round(sum(metrics.map(m => m.clicks))),
        total_conversions: Math.round(sum(metrics.map(m => m.conversions))),
    };
}

function runAnalysis(metrics: MetricRecord[]) {
    const allIssues: Issue[] = [];
    const perAd = metrics.map(row => {
        const issues = analyzeSingleAd(row);
        allIssues.push(...issues);
        return { ad_id: row.ad_id, issues, score: computeScore(row) };
    });

    return {
        summary: computeSummary(metrics),
        per_ad_analysis: perAd,
        issues: allIssues,
        total_ads_analyzed: metrics.length,
        ads_with_issues: perAd.filter(a => a.issues.length > 0).length,
    };
}

function generateRecommendations(analysis: ReturnType<typeof runAnalysis>) {
    const recommendations: any[] = [];
    const seenKeys = new Set<string>();

    for (const issue of analysis.issues) {
        const adAnalysis = analysis.per_ad_analysis.find(a => a.issues.includes(issue));
        const adId = adAnalysis?.ad_id ?? null;
        const dedupeKey = `${issue.type}_${adId}`;
        if (seenKeys.has(dedupeKey)) continue;
        seenKeys.add(dedupeKey);

        const template = RECOMMENDATION_TEMPLATES[issue.type]?.[issue.severity] ?? RECOMMENDATION_TEMPLATES[issue.type]?.["WARNING"];
        if (!template) continue;

        recommendations.push({
            ad_id: adId,
            type: issue.type,
            severity: issue.severity,
            title: template.title,
            description: issue.message,
            metric_value: issue.value,
            benchmark: issue.benchmark,
            actions: template.actions,
        });
    }

    // Sort CRITICAL first
    const severityOrder: Record<string, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    recommendations.sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3));

    // If all good
    if (recommendations.length === 0) {
        const s = analysis.summary;
        recommendations.push({
            ad_id: null,
            type: "PERFORMING_WELL",
            severity: "INFO",
            title: "✅ Your Ads Are Performing Well!",
            description: `All metrics are within or above industry benchmarks. ROAS: ${s.avg_roas}x, CTR: ${s.avg_ctr}%`,
            metric_value: null,
            benchmark: null,
            actions: [
                "Scale budget by 20% on top performing ad sets",
                "Create lookalike audiences from recent converters",
                "Test new markets or demographics",
                "Document what works and replicate the formula",
            ],
        });
    }

    return recommendations;
}

function predictPerformanceEngine(metrics: MetricRecord[], daysAhead = 7) {
    if (!metrics.length) return { error: "No data to predict from" };

    // Simple linear regression for trends
    const linearSlope = (values: number[]) => {
        const n = values.length;
        if (n < 2) return 0;
        const xMean = (n - 1) / 2;
        const yMean = values.reduce((a, b) => a + b, 0) / n;
        const num = values.reduce((sum, y, i) => sum + (i - xMean) * (y - yMean), 0);
        const den = values.reduce((sum, _, i) => sum + (i - xMean) ** 2, 0);
        return den === 0 ? 0 : num / den;
    };

    const trends: Record<string, any> = {};
    for (const col of ["ctr", "cpa", "roas", "spend"] as const) {
        const values = metrics.map(m => m[col]);
        const slope = linearSlope(values);
        const current = values[values.length - 1];
        trends[col] = {
            current: +current.toFixed(3),
            slope: +slope.toFixed(4),
            trend: slope > 0.01 ? "increasing" : slope < -0.01 ? "decreasing" : "stable",
            predicted_7d: +(current + slope * daysAhead).toFixed(3),
        };
    }

    const avgSpend = metrics.reduce((a, m) => a + m.spend, 0) / metrics.length;
    const avgRoas = metrics.reduce((a, m) => a + m.roas, 0) / metrics.length;

    const forecast = {
        predicted_spend: +(avgSpend * daysAhead).toFixed(2),
        predicted_revenue: +(avgSpend * daysAhead * avgRoas).toFixed(2),
        confidence: metrics.length >= 7 ? "medium" : "low",
        data_points: metrics.length,
    };

    let recommendation = "📊 Performance is stable. Monitor daily and test 1-2 new creatives this week.";
    if (avgRoas < 1) recommendation = "⚠️ Current ROAS below 1x. Pause campaign and review strategy before spending more.";
    else if (avgRoas >= 4) recommendation = "✅ Strong ROAS. Consider scaling budget by 20-30% to maximize returns.";
    else if (trends.ctr?.trend === "decreasing") recommendation = "📉 CTR is declining — creative fatigue likely. Refresh creatives in next 3-5 days.";

    return { trends, forecast, recommendation };
}

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const generateAdSchema = z.object({
    productName: z.string().min(1),
    targetAudience: z.string().min(1),
    productBenefits: z.string().min(1),
    budget: z.number().optional(),
    tone: z.enum(["professional", "casual", "urgent", "inspirational", "humorous"]).default("professional"),
    adType: z.enum(["image", "video", "carousel", "story"]).default("image"),
});

const metricsSchema = z.object({
    metrics: z.array(z.object({
        ad_id: z.string(),
        impressions: z.number(),
        clicks: z.number(),
        ctr: z.number(),
        cpc: z.number(),
        cpa: z.number(),
        roas: z.number(),
        spend: z.number(),
        revenue: z.number(),
        conversions: z.number(),
        reach: z.number(),
        frequency: z.number(),
        date: z.string().optional(),
    })).min(1),
    campaign_name: z.string().optional(),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

export async function generateAd(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = generateAdSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
        if (!user || user.aiCredits <= 0) throw createError("Insufficient AI credits", 402);

        const prompt = `You are an expert Facebook Ads copywriter. Generate compelling ad copy for a Facebook ${data.adType} ad.

Product: ${data.productName}
Target Audience: ${data.targetAudience}
Key Benefits: ${data.productBenefits}
Budget: ${data.budget ? `$${data.budget}` : "Not specified"}
Tone: ${data.tone}

Return a JSON object with these exact fields:
{
  "headline": "< 40 chars, attention-grabbing",
  "primaryText": "< 125 chars, benefit-focused",
  "description": "< 30 chars, supporting detail",
  "callToAction": "one of: Shop Now, Learn More, Sign Up, Get Offer, Book Now, Contact Us",
  "videoScript": {
    "hook": "0-3s attention grabber",
    "body": "3-12s core message/benefits",
    "cta": "12-15s call to action"
  },
  "imagePrompt": "a detailed prompt for an AI image generator (like Midjourney) to create the perfect ad visual",
  "creativeIdea": "brief description of what the creative visual should show",
  "targetingTip": "one specific audience targeting tip",
  "predictedCtr": "estimated CTR percentage range (e.g., 1.5-2.5%)",
  "adVariants": [
    { "headline": "variant 1", "primaryText": "variant 1 text" },
    { "headline": "variant 2", "primaryText": "variant 2 text" }
  ]
}

IMPORTANT: Return ONLY the JSON object, no markdown fences, no explanation.`;

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8,
        });

        const raw = completion.choices[0].message.content || "{}";
        const adCopy = JSON.parse(extractJSON(raw));

        await prisma.user.update({
            where: { id: req.user!.id },
            data: { aiCredits: { decrement: 1 } },
        });

        res.json({ success: true, data: adCopy, creditsUsed: 1 });
    } catch (err) {
        next(err);
    }
}

export async function analyzeAudience(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const { productDescription, currentAudience } = req.body;
        if (!productDescription) {
            res.status(400).json({ success: false, error: "productDescription is required" });
            return;
        }

        const prompt = `You are a Facebook Ads targeting expert. Analyze the following and suggest optimal audience targeting.

Product: ${productDescription}
Current Audience: ${currentAudience || "Not defined yet"}

Return a JSON with:
{
  "demographics": { "ageRange": "...", "gender": "...", "location": "..." },
  "interests": ["interest1", "interest2", ...],
  "behaviors": ["behavior1", "behavior2", ...],
  "customAudiences": ["suggestion1", "suggestion2"],
  "lookalikeSources": ["source1", "source2"],
  "estimatedReach": "range",
  "insights": "brief explanation of targeting strategy"
}

IMPORTANT: Return ONLY the JSON object, no markdown fences, no explanation.`;

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
        });

        const analysis = JSON.parse(extractJSON(completion.choices[0].message.content || "{}"));
        res.json({ success: true, data: analysis });
    } catch (err) {
        next(err);
    }
}

export async function analyzeMetrics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const { metrics } = metricsSchema.parse(req.body);
        const analysis = runAnalysis(metrics);
        const recommendations = generateRecommendations(analysis);

        // Persist top critical recommendations to DB
        const userId = req.user!.id;
        const topRecs = recommendations.filter(r => r.severity === "CRITICAL").slice(0, 5);
        for (const rec of topRecs) {
            try {
                await prisma.aiRecommendation.create({
                    data: {
                        userId,
                        type: rec.type,
                        title: rec.title,
                        // Encode actions + metric info into description as JSON
                        description: JSON.stringify({
                            message: rec.description,
                            actions: rec.actions,
                            metric_value: rec.metric_value,
                            benchmark: rec.benchmark,
                        }),
                        severity: rec.severity,
                        adId: rec.ad_id ?? null,
                    },
                });
            } catch {
                // If DB persist fails, still return the analysis result
            }
        }

        res.json({
            success: true,
            analysis,
            recommendations,
        });
    } catch (err) {
        next(err);
    }
}

export async function predictPerformance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const { metrics } = metricsSchema.parse(req.body);
        const predictions = predictPerformanceEngine(metrics);
        res.json({ success: true, predictions });
    } catch (err) {
        next(err);
    }
}

export async function getRecommendations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const recommendations = await prisma.aiRecommendation.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        res.json({ success: true, data: recommendations });
    } catch (err) {
        next(err);
    }
}

export async function markRecommendationRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        await prisma.aiRecommendation.update({
            where: { id: req.params.id },
            data: { isRead: true },
        });
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}
