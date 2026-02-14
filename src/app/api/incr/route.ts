import { projectPageviewsKey } from "@/application/services/pageviews";
import { redis } from "@/infrastructure/redis/client";
import { allProjects } from "contentlayer/generated";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
const MAX_SLUG_LENGTH = 128;
const VALID_SLUG_PATTERN = /^[A-Za-z0-9._-]+$/;
const PUBLISHED_PROJECT_SLUGS = new Set(
  allProjects
    .filter((project) => project.published)
    .map((project) => project.slug),
);

export function GET(): NextResponse {
  return new NextResponse("use POST", { status: 405 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return new NextResponse("must be json", { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("invalid json", { status: 400 });
  }

  const slug =
    body &&
    typeof body === "object" &&
    "slug" in body &&
    typeof (body as { slug?: unknown }).slug === "string"
      ? (body as { slug: string }).slug.trim()
      : "";

  if (!slug) {
    return new NextResponse("Slug not found", { status: 400 });
  }
  if (slug.length > MAX_SLUG_LENGTH || !VALID_SLUG_PATTERN.test(slug)) {
    return new NextResponse("Invalid slug", { status: 400 });
  }
  if (!PUBLISHED_PROJECT_SLUGS.has(slug)) {
    return new NextResponse("Unknown slug", { status: 404 });
  }
  if (!redis) {
    return new NextResponse(null, { status: 202 });
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
  try {
    if (ip) {
      const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(ip),
      );
      const hash = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const isNew = await redis.set(
        ["deduplicate", hash, slug].join(":"),
        true,
        {
          nx: true,
          ex: 24 * 60 * 60,
        },
      );
      if (!isNew) {
        return new NextResponse(null, { status: 202 });
      }
    }

    await redis.incr(projectPageviewsKey(slug));
    return new NextResponse(null, { status: 202 });
  } catch (error) {
    console.error("Failed to increment view count:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
