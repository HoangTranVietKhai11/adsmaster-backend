import Redis from "ioredis";
import { logger } from "../utils/logger";

let redisConnected = false;

export const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy(times) {
        if (times > 3) {
            logger.warn("⚠️  Redis unavailable — running without cache");
            return null; // stop retrying
        }
        return Math.min(times * 200, 1000);
    },
});

redis.on("connect", () => {
    redisConnected = true;
    logger.info("✅ Redis connected");
});
redis.on("error", (err) => {
    redisConnected = false;
    // Only log once, not spam
});
redis.on("close", () => {
    redisConnected = false;
});

// Try to connect but don't block startup
redis.connect().catch(() => {
    logger.warn("⚠️  Redis not available — running without cache/session store");
});

export function isRedisAvailable(): boolean {
    return redisConnected;
}

export async function getCache<T>(key: string): Promise<T | null> {
    if (!redisConnected) return null;
    try {
        const value = await redis.get(key);
        return value ? (JSON.parse(value) as T) : null;
    } catch {
        return null;
    }
}

export async function setCache(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!redisConnected) return;
    try {
        await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
        // ignore
    }
}

export async function deleteCache(key: string): Promise<void> {
    if (!redisConnected) return;
    try {
        await redis.del(key);
    } catch {
        // ignore
    }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
    if (!redisConnected) return;
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) await redis.del(...keys);
    } catch {
        // ignore
    }
}
