import { getRedisClient, RATE_LIMITING } from "@/lib";

export async function getProjectView(slug: string): Promise<number> {
  const redis = getRedisClient();
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
  const redis = getRedisClient();
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

/**
 * Increments the view count for a project, deduplicated by hashed IP.
 * No-ops silently when Redis is unavailable.
 * Throws on unexpected Redis errors so the caller can surface a 500.
 *
 * @param slug - Validated project slug
 * @param ip   - Caller IP (null skips deduplication and always increments)
 */
export async function incrementProjectView(
  slug: string,
  ip: null | string,
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  if (ip) {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(ip),
    );
    const hash = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const isNew = await redis.set(["deduplicate", hash, slug].join(":"), true, {
      ex: RATE_LIMITING.VIEW_DEDUP_WINDOW_SECONDS,
      nx: true,
    });
    if (!isNew) return;
  }

  await redis.incr(projectPageviewsKey(slug));
}

function projectPageviewsKey(slug: string): string {
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
