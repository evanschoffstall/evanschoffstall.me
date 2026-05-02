"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import type { ProjectIndexData } from "@/features/projects/model";

import { Navigation, VirtualScrollArea } from "@/components";
import {
  consumeProjectsScrollPosition,
  registerProjectsViewport,
  requestHomeIntroSkip,
} from "@/features/projects/browser";

import { ProjectsContent } from "./ProjectsContent";

/** Project index route data and fallback state rendered inside the shared app shell. */
interface ProjectsPageSurfaceProps {
  projectData: null | ProjectIndexData;
}

/**
 * Full-screen projects route surface backed by the shared root particles canvas.
 * @param props - Prepared project cards, groups, and view counts for the route.
 * @returns The `/projects` page content with its own virtualized viewport.
 */
export function ProjectsPageSurface(props: ProjectsPageSurfaceProps) {
  const { projectData } = props;
  const projectsViewportRef = useRef<HTMLDivElement | null>(null);
  const registerProjectsViewportRef = useCallback(
    (viewport: HTMLDivElement | null) => {
      projectsViewportRef.current = viewport;
      registerProjectsViewport(viewport);
    },
    [],
  );

  useEffect(() => {
    const storedPosition = consumeProjectsScrollPosition();
    if (storedPosition === null) return;

    requestAnimationFrame(() => {
      if (projectsViewportRef.current) {
        projectsViewportRef.current.scrollTop = storedPosition;
      }
    });
  }, []);

  const scrollItems = useMemo(() => {
    return [
      {
        estimateSize: projectData ? 1600 : 260,
        key: "projects-content",
        node: (
          <div
            className="
            pt-20
            md:pt-24
          "
          >
            {projectData ? (
              <ProjectsContent
                featured={projectData.featured}
                second={projectData.second}
                sorted={projectData.sorted}
                sortedContributions={projectData.sortedContributions}
                sortedLegacy={projectData.sortedLegacy}
                third={projectData.third}
                views={projectData.views}
              />
            ) : (
              <div
                className="
                mx-auto max-w-7xl px-6 py-16
                md:py-24
                lg:px-8
              "
              >
                <p className="text-zinc-400">
                  Some featured projects are not available.
                </p>
              </div>
            )}
          </div>
        ),
      },
    ];
  }, [projectData]);

  return (
    <section className="h-screen overflow-hidden">
      <Navigation href="/" label="Home" onNavigate={requestHomeIntroSkip} />
      <VirtualScrollArea
        className="size-full"
        items={scrollItems}
        overscan={2}
        viewportRef={registerProjectsViewportRef}
      />
    </section>
  );
}
