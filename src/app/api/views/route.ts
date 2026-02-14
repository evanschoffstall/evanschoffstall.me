import { getProjectViews } from "@/application/services/pageviews";
import { allProjects } from "contentlayer/generated";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const views = await getProjectViews(
    allProjects
      .filter((project) => project.published)
      .map((project) => project.slug),
  );
  return NextResponse.json({ views });
}
