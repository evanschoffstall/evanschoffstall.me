import { Redis } from "@upstash/redis";

let cachedRedis: null | Redis | undefined;

/**
 * Lazily creates the Redis client so module import stays side-effect free.
 * @returns The configured Redis client, or `null` when Redis is unavailable.
 */
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

/**
 * Checks whether the required Upstash Redis environment variables are present.
 * @returns `true` when the environment contains the Redis connection variables.
 */
function hasRedisConfiguration(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}
