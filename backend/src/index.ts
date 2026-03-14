import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
// Also try project root .env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import app from "./app";
import { logger } from "./utils/logger";
import { prisma } from "./config/database";

const PORT = process.env.PORT || 4000;

async function main() {
    try {
        await prisma.$connect();
        logger.info("✅ Database connected");
    } catch (error) {
        logger.warn("⚠️  Database connection failed — DB features will not work");
    }

    app.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT}`);
        logger.info(`   Environment: ${process.env.NODE_ENV}`);
        logger.info(`   API: http://localhost:${PORT}/api`);
    });
}

process.on("SIGTERM", async () => {
    logger.info("SIGTERM received. Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});

main();
