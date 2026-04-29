import { allProjects } from "contentlayer/generated";

import { ProjectsPageSurface } from "@/features/projects/components";
import { prepareProjectIndexData } from "@/features/projects/model";

export const revalidate = 60;

/**
 * Renders the canonical projects index route inside the shared site shell.
 * @returns The full projects route with the same hydrated background as landing and slug pages.
 */
export default async function ProjectsPage() {
  const projectData = await prepareProjectIndexData(allProjects);

  return <ProjectsPageSurface projectData={projectData} />;
}
