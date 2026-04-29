import { allProjects } from "contentlayer/generated";

import { HomeSections } from "@/features/home/components";
import { prepareProjectIndexData } from "@/features/projects/model";

export const revalidate = 60;

/**
 * Renders the landing page inside the shared particles background shell.
 * @returns The home page content for the site's root route.
 */
export default async function Home() {
  const projectData = await prepareProjectIndexData(allProjects);

  return (
    <div className="relative w-full">
      <HomeSections projectData={projectData} />
    </div>
  );
}
