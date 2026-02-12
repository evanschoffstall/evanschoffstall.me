import { redis } from "@/lib/redis";
import { allProjects } from "contentlayer/generated";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const views = redis
    ? (
        await redis.mget<number[]>(
          ...allProjects.map((p) =>
            ["pageviews", "projects", p.slug].join(":"),
          ),
        )
      ).reduce(
        (acc, v, i) => {
          acc[allProjects[i].slug] = v ?? 0;
          return acc;
        },
        {} as Record<string, number>,
      )
    : ({} as Record<string, number>);

  res.status(200).json({ views });
}
