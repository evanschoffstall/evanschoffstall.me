import { redis } from "@/infrastructure/redis/client";

export function projectPageviewsKey(slug: string): string {
  return ["pageviews", "projects", slug].join(":");
}

function toSafeViewCount(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }
  return 0;
}

export async function getProjectView(slug: string): Promise<number> {
  if (!redis) return 0;
  try {
    return toSafeViewCount(await redis.get(projectPageviewsKey(slug)));
  } catch (error) {
    console.error("Failed to fetch project view count:", error);
    return 0;
  }
}

export async function getProjectViews(
  slugs: string[],
): Promise<Record<string, number>> {
  if (!redis || slugs.length === 0) return {};

  try {
    const values = await redis.mget<unknown[]>(
      ...slugs.map((slug) => projectPageviewsKey(slug)),
    );

    const views: Record<string, number> = {};
    for (let i = 0; i < slugs.length; i++) {
      views[slugs[i]] = toSafeViewCount(values[i]);
    }
    return views;
  } catch (error) {
    console.error("Failed to fetch project view counts:", error);
    return {};
  }
}
