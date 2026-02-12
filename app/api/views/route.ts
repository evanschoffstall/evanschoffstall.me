import { getProjectViews } from "@/lib/pageviews";
import { allProjects } from "contentlayer/generated";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const views = await getProjectViews(allProjects.map((p) => p.slug));
  return NextResponse.json({ views });
}
