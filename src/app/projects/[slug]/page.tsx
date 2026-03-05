import { getProjectView } from "@/application/services/pageviews";
import { Mdx } from "@/presentation/components/common/mdx";
import { allProjects } from "contentlayer/generated";
import "github-markdown-css/github-markdown-light.css";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Header } from "./header";
import "./mdx.css";
import { ReportView } from "./view";

export const revalidate = 60;

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return allProjects
    .filter((p) => p.published)
    .map((p) => ({
      slug: p.slug,
    }));
}

async function getReadmeHtml(slug: string): Promise<string | null> {
  const filePath = join(process.cwd(), "public", "readmes", `${slug}.html`);

  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const project = allProjects.find((project) => project.slug === slug);

  if (!project || !project.published) {
    notFound();
  }

  const views = await getProjectView(slug);
  const readmeHtml = await getReadmeHtml(project.slug);

  return (
    <div className="bg-white min-h-screen">
      <Header project={project} views={views} />
      <ReportView slug={project.slug} />

      <div className="px-4 py-12 mx-auto" style={{ maxWidth: "838.67px" }}>
        {readmeHtml ? (
          <section
            className="markdown-body mt-8"
            /**
             * SECURITY NOTE: This renders pre-generated HTML from public/readmes/*.html
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
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: readmeHtml }}
          />
        ) : (
          <section className="prose prose-zinc prose-quoteless max-w-none mt-8">
            <Mdx code={project.body.code} />
          </section>
        )}
      </div>
    </div>
  );
}
