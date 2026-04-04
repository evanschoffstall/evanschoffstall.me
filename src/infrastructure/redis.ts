import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

// Only initialize Redis if both environment variables are present
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  try {
    redis = Redis.fromEnv();
    if (process.env.NODE_ENV === "development") {
      console.info("Redis initialized successfully");
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Failed to initialize Redis from environment variables. View counts will not be tracked.",
        error instanceof Error ? error.message : error,
      );
    }
    redis = null;
  }
} else {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "Redis not initialized: Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables",
    );
  }
}

export { redis };
