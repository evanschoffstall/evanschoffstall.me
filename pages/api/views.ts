import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import { allProjects } from "contentlayer/generated";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let redis: Redis | null;

  try {
    redis = Redis.fromEnv();
  } catch (error) {
    console.warn(
      "Failed to initialize Redis from environment variables",
      error
    );
    redis = null;
  }

  const views = redis
    ? (
        await redis.mget<number[]>(
          ...allProjects.map((p) => ["pageviews", "projects", p.slug].join(":"))
        )
      ).reduce((acc, v, i) => {
        acc[allProjects[i].slug] = v ?? 0;
        return acc;
      }, {} as Record<string, number>)
    : 0;

  res.status(200).json({ views });
}
