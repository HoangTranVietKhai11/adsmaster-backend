import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { stripe } from "../../config/stripe";
import { prisma } from "../../config/database";
import { createError } from "../../middlewares/errorHandler";
import { logger } from "../../utils/logger";

export async function getPlans(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const plans = await prisma.plan.findMany({ orderBy: { price: "asc" } });
        res.json({ success: true, data: plans });
    } catch (err) {
        next(err);
    }
}

export async function subscribe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const { planId } = req.body;
        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan || !plan.stripePriceId) throw createError("Invalid plan", 400);

        const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
        if (!user) throw createError("User not found", 404);

        let customerId: string;
        const existingSub = await prisma.subscription.findFirst({ where: { userId: req.user!.id } });

        if (existingSub) {
            customerId = existingSub.stripeCustomerId;
        } else {
            const customer = await stripe.customers.create({ email: user.email, name: user.name });
            customerId = customer.id;
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ["card"],
            line_items: [{ price: plan.stripePriceId, quantity: 1 }],
            mode: "subscription",
            success_url: `${process.env.FRONTEND_URL}/billing?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/billing?cancelled=true`,
            metadata: { userId: req.user!.id, planId },
        });

        res.json({ success: true, data: { sessionUrl: session.url } });
    } catch (err) {
        next(err);
    }
}

export async function cancelSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const subscription = await prisma.subscription.findFirst({ where: { userId: req.user!.id, status: "ACTIVE" } });
        if (!subscription) throw createError("No active subscription", 404);

        await stripe.subscriptions.update(subscription.stripeSubscriptionId, { cancel_at_period_end: true });
        await prisma.subscription.update({ where: { id: subscription.id }, data: { cancelAtPeriodEnd: true } });

        res.json({ success: true, message: "Subscription will cancel at period end" });
    } catch (err) {
        next(err);
    }
}

export async function upgradePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const { planId } = req.body;
        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan?.stripePriceId) throw createError("Invalid plan", 400);

        const subscription = await prisma.subscription.findFirst({ where: { userId: req.user!.id, status: "ACTIVE" } });
        if (!subscription) throw createError("No active subscription", 404);

        const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            items: [{ id: stripeSub.items.data[0].id, price: plan.stripePriceId }],
            proration_behavior: "create_prorations",
        });

        await prisma.$transaction([
            prisma.subscription.update({ where: { id: subscription.id }, data: { planId } }),
            prisma.user.update({ where: { id: req.user!.id }, data: { planId } }),
        ]);

        res.json({ success: true, message: "Plan upgraded" });
    } catch (err) {
        next(err);
    }
}

export async function getBillingHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const payments = await prisma.payment.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: "desc" },
        });
        const subscription = await prisma.subscription.findFirst({
            where: { userId: req.user!.id },
            include: { plan: true },
        });
        res.json({ success: true, data: { payments, subscription } });
    } catch (err) {
        next(err);
    }
}

export async function handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    const sig = req.headers["stripe-signature"] as string;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
        logger.error("Webhook signature verification failed:", err);
        res.status(400).json({ error: "Webhook error" });
        return;
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as any;
                const { userId, planId } = session.metadata;
                const stripeSub = await stripe.subscriptions.retrieve(session.subscription);

                await prisma.$transaction([
                    prisma.subscription.upsert({
                        where: { stripeSubscriptionId: session.subscription },
                        update: { status: "ACTIVE" },
                        create: {
                            userId, planId,
                            stripeSubscriptionId: session.subscription,
                            stripeCustomerId: session.customer,
                            status: "ACTIVE",
                            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                        },
                    }),
                    prisma.user.update({ where: { id: userId }, data: { planId } }),
                ]);
                break;
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object as any;
                const sub = await prisma.subscription.findFirst({ where: { stripeCustomerId: invoice.customer } });
                if (sub) {
                    await prisma.payment.create({
                        data: {
                            userId: sub.userId,
                            stripePaymentId: invoice.payment_intent || invoice.id,
                            amount: invoice.amount_paid / 100,
                            currency: invoice.currency,
                            status: "SUCCEEDED",
                            description: invoice.description || "Subscription payment",
                        },
                    });
                }
                break;
            }

            case "customer.subscription.deleted": {
                const sub = event.data.object as any;
                await prisma.subscription.updateMany({
                    where: { stripeSubscriptionId: sub.id },
                    data: { status: "CANCELLED" },
                });
                break;
            }
        }

        res.json({ received: true });
    } catch (err) {
        next(err);
    }
}
