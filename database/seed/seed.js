"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Seeding database...");
    // Plans
    const freePlan = await prisma.plan.upsert({
        where: { name: "FREE" },
        update: {},
        create: {
            name: "FREE",
            price: 0,
            maxCampaigns: 3,
            maxAiCredits: 10,
            features: JSON.stringify(["3 Campaigns", "10 AI Credits/month", "Basic Analytics", "Community Support"]),
        },
    });
    const proPlan = await prisma.plan.upsert({
        where: { name: "PRO" },
        update: {},
        create: {
            name: "PRO",
            price: 19,
            maxCampaigns: 20,
            maxAiCredits: 100,
            features: JSON.stringify([
                "20 Campaigns",
                "100 AI Credits/month",
                "Advanced Analytics",
                "AI Recommendations",
                "Affiliate Program",
                "Priority Support",
            ]),
        },
    });
    const agencyPlan = await prisma.plan.upsert({
        where: { name: "AGENCY" },
        update: {},
        create: {
            name: "AGENCY",
            price: 49,
            maxCampaigns: 999,
            maxAiCredits: 500,
            features: JSON.stringify([
                "Unlimited Campaigns",
                "500 AI Credits/month",
                "White-label Dashboard",
                "Client Management",
                "API Access",
                "Dedicated Support",
            ]),
        },
    });
    // Admin user
    const adminHash = await bcrypt_1.default.hash("Admin@12345", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@adsmaster.ai" },
        update: {},
        create: {
            name: "Admin",
            email: "admin@adsmaster.ai",
            passwordHash: adminHash,
            role: "ADMIN",
            planId: agencyPlan.id,
            aiCredits: 9999,
            isVerified: true,
        },
    });
    // Demo user
    const userHash = await bcrypt_1.default.hash("Demo@12345", 10);
    const demoUser = await prisma.user.upsert({
        where: { email: "demo@adsmaster.ai" },
        update: {},
        create: {
            name: "Demo User",
            email: "demo@adsmaster.ai",
            passwordHash: userHash,
            role: "USER",
            planId: proPlan.id,
            aiCredits: 100,
            isVerified: true,
        },
    });
    // Sample course
    const course = await prisma.course.upsert({
        where: { id: "course-fb-ads-101" },
        update: {},
        create: {
            id: "course-fb-ads-101",
            title: "Facebook Ads Mastery 2024",
            description: "Complete Facebook Ads course from beginner to advanced. Learn targeting, creatives, and scaling strategies.",
            isFree: false,
            price: 97,
            isPublished: true,
            instructorId: admin.id,
            modules: {
                create: [
                    {
                        title: "Getting Started with Facebook Ads",
                        order: 1,
                        lessons: {
                            create: [
                                {
                                    title: "Introduction to Facebook Ads Manager",
                                    content: "Learn your way around the Facebook Ads Manager interface.",
                                    duration: 840,
                                    order: 1,
                                    isFree: true,
                                },
                                {
                                    title: "Understanding Campaign Structure",
                                    content: "Campaign → Ad Set → Ad hierarchy explained.",
                                    duration: 1200,
                                    order: 2,
                                },
                            ],
                        },
                    },
                    {
                        title: "Audience Targeting Secrets",
                        order: 2,
                        lessons: {
                            create: [
                                {
                                    title: "Core Audiences Deep Dive",
                                    content: "How to use Facebook's core targeting options.",
                                    duration: 1500,
                                    order: 1,
                                },
                                {
                                    title: "Lookalike Audiences",
                                    content: "Build powerful lookalike audiences from your customer data.",
                                    duration: 1320,
                                    order: 2,
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });
    // Sample campaign for demo user
    const campaign = await prisma.campaign.create({
        data: {
            userId: demoUser.id,
            name: "Summer Sale 2024",
            objective: "SALES",
            budget: 500,
            dailyBudget: 50,
            status: "ACTIVE",
            adSets: {
                create: [
                    {
                        name: "Lookalike Audience 1%",
                        targeting: JSON.stringify({
                            age_min: 25,
                            age_max: 45,
                            interests: ["Online Shopping", "Fashion"],
                        }),
                        budget: 300,
                        ads: {
                            create: [
                                {
                                    name: "Summer Sale Ad 1",
                                    headline: "Up to 70% OFF This Summer! 🔥",
                                    primaryText: "Shop our biggest sale of the year. Limited time offer. Free shipping on all orders over $50.",
                                    cta: "Shop Now",
                                    status: "ACTIVE",
                                    metrics: {
                                        create: [
                                            {
                                                impressions: 45280,
                                                clicks: 987,
                                                ctr: 2.18,
                                                cpc: 0.85,
                                                cpa: 12.5,
                                                roas: 4.2,
                                                spend: 839.0,
                                                revenue: 3523.8,
                                                conversions: 67,
                                                reach: 38200,
                                                frequency: 1.19,
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });
    // Notifications for demo user
    await prisma.notification.createMany({
        data: [
            {
                userId: demoUser.id,
                title: "🎉 Welcome to AdsMaster AI!",
                body: "Start by creating your first campaign or exploring our AI Ads Generator.",
                type: "success",
                isRead: false,
            },
            {
                userId: demoUser.id,
                title: "AI Insight Available",
                body: 'Your campaign "Summer Sale 2024" has a new AI recommendation.',
                type: "info",
                isRead: false,
            },
        ],
    });
    console.log("✅ Seed complete!");
    console.log(`   Admin: admin@adsmaster.ai / Admin@12345`);
    console.log(`   Demo:  demo@adsmaster.ai  / Demo@12345`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
