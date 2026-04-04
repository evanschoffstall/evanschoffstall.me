import { getProjectViews, incrementProjectView } from "@/application/pageviews";
import { extractSlugFromBody } from "@/domain/projects/validation";
import { allProjects } from "contentlayer/generated";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const PUBLISHED_SLUGS = new Set(
  allProjects.filter((p) => p.published).map((p) => p.slug),
);

/** Returns view counts for every published project. */
export async function GET(): Promise<NextResponse> {
  const views = await getProjectViews(Array.from(PUBLISHED_SLUGS));
  return NextResponse.json({ views });
}

/** Increments the view count for a single project (fire-and-forget from client). */
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

  const slug = extractSlugFromBody(body);
  if (!slug) {
    return new NextResponse("Invalid or missing slug", { status: 400 });
  }
  if (!PUBLISHED_SLUGS.has(slug)) {
    return new NextResponse("Unknown slug", { status: 404 });
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;

  try {
    await incrementProjectView(slug, ip);
    return new NextResponse(null, { status: 202 });
  } catch (error) {
    console.error("Failed to increment view count:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
