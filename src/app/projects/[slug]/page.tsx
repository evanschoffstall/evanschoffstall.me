import { getProjectView } from "@/application/services/pageviews";
import { Mdx } from "@/presentation/components/common/mdx";
import { allProjects } from "contentlayer/generated";
import { notFound } from "next/navigation";
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

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const project = allProjects.find((project) => project.slug === slug);

  if (!project || !project.published) {
    notFound();
  }

  const views = await getProjectView(slug);

  return (
    <div className="bg-zinc-50 min-h-screen">
      <Header project={project} views={views} />
      <ReportView slug={project.slug} />

      <article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless">
        <Mdx code={project.body.code} />
      </article>
    </div>
  );
}
