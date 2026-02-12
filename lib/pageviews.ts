import { redis } from "@/lib/redis";

export function projectPageviewsKey(slug: string): string {
  return ["pageviews", "projects", slug].join(":");
}

export async function getProjectView(slug: string): Promise<number> {
  if (!redis) return 0;
  return (await redis.get<number>(projectPageviewsKey(slug))) ?? 0;
}

export async function getProjectViews(
  slugs: string[],
): Promise<Record<string, number>> {
  if (!redis || slugs.length === 0) return {};

  const values = await redis.mget<(number | null | undefined)[]>(
    ...slugs.map((slug) => projectPageviewsKey(slug)),
  );

  const views: Record<string, number> = {};
  for (let i = 0; i < slugs.length; i++) {
    views[slugs[i]] = values[i] ?? 0;
  }
  return views;
}
