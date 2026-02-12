import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
export const config = {
  runtime: "edge",
};

export default async function incr(req: NextRequest): Promise<NextResponse> {
  if (req.method !== "POST") {
    return new NextResponse("use POST", { status: 405 });
  }
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return new NextResponse("must be json", { status: 400 });
  }

  const body = await req.json();
  const slug =
    body &&
    typeof body === "object" &&
    "slug" in body &&
    typeof body.slug === "string"
      ? body.slug.trim()
      : "";

  if (!slug) {
    return new NextResponse("Slug not found", { status: 400 });
  }
  if (!redis) {
    return new NextResponse(null, { status: 202 });
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
  if (ip) {
    // Hash the IP in order to not store it directly in your db.
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(ip),
    );
    const hash = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // deduplicate the ip for each slug
    const isNew = await redis.set(["deduplicate", hash, slug].join(":"), true, {
      nx: true,
      ex: 24 * 60 * 60,
    });
    if (!isNew) {
      return new NextResponse(null, { status: 202 });
    }
  }

  try {
    await redis.incr(["pageviews", "projects", slug].join(":"));
    return new NextResponse(null, { status: 202 });
  } catch (error) {
    console.error("Failed to increment view count:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
