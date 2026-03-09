import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../middlewares/auth";
import { openai } from "../../config/openai";
import { prisma } from "../../config/database";
import { createError } from "../../middlewares/errorHandler";

const generateAdSchema = z.object({
    productName: z.string().min(1),
    targetAudience: z.string().min(1),
    productBenefits: z.string().min(1),
    budget: z.number().optional(),
    tone: z.enum(["professional", "casual", "urgent", "inspirational", "humorous"]).default("professional"),
    adType: z.enum(["image", "video", "carousel", "story"]).default("image"),
});

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
  "creativeIdea": "brief description of what the creative visual should show",
  "targetingTip": "one specific audience targeting tip",
  "predictedCtr": "estimated CTR percentage range (e.g., 1.5-2.5%)",
  "adVariants": [
    { "headline": "variant 1", "primaryText": "variant 1 text" },
    { "headline": "variant 2", "primaryText": "variant 2 text" }
  ]
}`;

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.8,
        });

        const adCopy = JSON.parse(completion.choices[0].message.content || "{}");

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
}`;

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const analysis = JSON.parse(completion.choices[0].message.content || "{}");
        res.json({ success: true, data: analysis });
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
