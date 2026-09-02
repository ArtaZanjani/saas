import Redis from "ioredis";

const globalForRedis = global as unknown as { redis: Redis };

export const redis = globalForRedis.redis || new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  // enableOfflineQueue: false,
  retryStrategy(times) {
    return Math.min(times * 100, 3000);
  },
});

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
