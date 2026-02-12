import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

// Only initialize Redis if both environment variables are present
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  try {
    redis = Redis.fromEnv();
  } catch (error) {
    console.warn(
      "Failed to initialize Redis from environment variables",
      error,
    );
    redis = null;
  }
} else {
  console.warn(
    "Redis not initialized: Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables",
  );
}

export { redis };
