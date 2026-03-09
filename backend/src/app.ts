import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandler";
import { rateLimiter } from "./middlewares/rateLimiter";
import { logger } from "./utils/logger";

// Routes
import authRoutes from "./modules/auth/routes";
import courseRoutes from "./modules/courses/routes";
import campaignRoutes from "./modules/campaigns/routes";
import analyticsRoutes from "./modules/analytics/routes";
import aiRoutes from "./modules/ai/routes";
import affiliateRoutes from "./modules/affiliates/routes";
import paymentRoutes from "./modules/payments/routes";
import crmRoutes from "./modules/crm/routes";
import adminRoutes from "./modules/admin/routes";
import notificationRoutes from "./modules/notifications/routes";

const app = express();

// ─── Core Middleware ──────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    })
);
app.use(compression());
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// ─── Health Check ─────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", version: "1.0.0", timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────
const API = "/api";
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/courses`, courseRoutes);
app.use(`${API}/campaigns`, campaignRoutes);
app.use(`${API}/analytics`, analyticsRoutes);
app.use(`${API}/ai`, aiRoutes);
app.use(`${API}/affiliates`, affiliateRoutes);
app.use(`${API}/payments`, paymentRoutes);
app.use(`${API}/crm`, crmRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/notifications`, notificationRoutes);

// ─── Error Handler ────────────────────────────
app.use(errorHandler);

export default app;
