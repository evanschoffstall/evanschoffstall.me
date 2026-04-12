import { Redis } from "@upstash/redis";

let cachedRedis: null | Redis | undefined;

/** Lazily creates the Redis client so module import stays side-effect free. */
export function getRedisClient(): null | Redis {
  if (cachedRedis !== undefined) {
    return cachedRedis;
  }

  if (!hasRedisConfiguration()) {
    cachedRedis = null;
    return cachedRedis;
  }

  try {
    cachedRedis = Redis.fromEnv();
    return cachedRedis;
  } catch (error) {
    console.warn(
      "Failed to initialize Redis from environment variables. View counts will not be tracked.",
      error instanceof Error ? error.message : error,
    );
    cachedRedis = null;
    return cachedRedis;
  }
}

function hasRedisConfiguration(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}
