import { allProjects } from "contentlayer/generated";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";
import "github-markdown-css/github-markdown-dark.css";

import { Mdx, VirtualScrollArea } from "@/components";
import {
  ProjectHeader,
  ProjectViewReporter,
} from "@/features/projects/components";
import { getProjectView } from "@/features/projects/model";

import "./mdx.css";

export const revalidate = 60;

const publishedProjectsBySlug = new Map(
  allProjects
    .filter((project) => project.published)
    .map((project) => [project.slug, project] as const),
);

/**
 * Async route params supplied by Next.js for a project detail page request.
 */
interface Props {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generates static params for every published project detail page.
 * @returns The published project slugs used for static generation.
 */
export function generateStaticParams(): { slug: string }[] {
  return allProjects
    .filter((p) => p.published)
    .map((p) => ({
      slug: p.slug,
    }));
}

/**
 * Renders a project detail page using either the mirrored README HTML or the MDX body.
 * @param props - The async route params supplied by Next.js for the current slug.
 * @returns The project detail page for the resolved slug.
 */
export default async function ProjectPage(props: Props) {
  const { params } = props;

  const { slug } = await params;
  const project = publishedProjectsBySlug.get(slug);

  if (!project) {
    notFound();
  }

  const [views, readmeHtml] = await Promise.all([
    getProjectView(slug),
    getReadmeHtml(project.slug),
  ]);
  const hasReadme = readmeHtml !== null;
  const scrollItems = [
    {
      estimateSize: hasReadme ? 180 : 360,
      key: "project-header",
      node: (
        <ProjectHeader hasReadme={hasReadme} project={project} views={views} />
      ),
    },
    {
      estimateSize: 1800,
      key: "project-body",
      node: (
        <div
          className={`mx-auto max-w-3xl px-4 ${hasReadme ? "py-12" : "py-4"}`}
        >
          {readmeHtml ? (
            <section
              className="markdown-body mt-8 overflow-x-auto"
              /**
               * SECURITY NOTE: This renders pre-generated HTML from public/projects/[slug]/content.html.
               *
               * These files are generated at build time by scripts/download-project-readmes.ts
               * from GitHub README files. The HTML is sanitized by GitHub's markdown renderer.
               *
               * Risk: If the build script or source READMEs are compromised, XSS is possible.
               * Mitigation: READMEs are from trusted repositories only. For untrusted content,
               * use a sanitization library like DOMPurify or render as plain Markdown.
               *
               * TODO: Consider adding DOMPurify server-side sanitization for defense-in-depth.
               */
              dangerouslySetInnerHTML={{ __html: readmeHtml }}
            />
          ) : (
            <section
              className="
              prose prose-zinc prose-invert prose-quoteless max-w-none
            "
            >
              <Mdx code={project.body.code} />
            </section>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="h-screen overflow-hidden">
      <VirtualScrollArea
        className="size-full"
        items={scrollItems}
        overscan={2}
      />
      <ProjectViewReporter slug={project.slug} />
    </div>
  );
}

const getReadmeHtml = cache(async (slug: string): Promise<null | string> => {
  const filePath = join(
    process.cwd(),
    "public",
    "projects",
    slug,
    "content.html",
  );

  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
});
