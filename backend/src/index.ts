import "dotenv/config";
import app from "./app";
import { logger } from "./utils/logger";
import { prisma } from "./config/database";

const PORT = process.env.PORT || 4000;

async function main() {
    try {
        await prisma.$connect();
        logger.info("✅ Database connected");

        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`   Environment: ${process.env.NODE_ENV}`);
            logger.info(`   API: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        logger.error("Failed to start server:", error);
        process.exit(1);
    }
}

process.on("SIGTERM", async () => {
    logger.info("SIGTERM received. Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});

main();
