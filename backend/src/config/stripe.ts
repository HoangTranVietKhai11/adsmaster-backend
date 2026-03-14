import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

export const stripe = new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
    typescript: true,
});

if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_...") {
    console.warn("⚠️  STRIPE_SECRET_KEY not configured — payment features will not work");
}
