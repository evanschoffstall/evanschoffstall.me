"use client";

import type { Project } from "contentlayer/generated";

import { HomeBioPanel } from "./HomeBioPanel";
import { HomeContextSection } from "./HomeContextSection";
import { HomeFeaturedProjectPanel } from "./HomeFeaturedProjectPanel";
import { HomeGradientRule } from "./HomeGradientRule";
import { HomeProjectsButton } from "./HomeProjectsButton";
import { HomeStackSection } from "./HomeStackSection";

interface HomeOverviewProps {
  featuredProject?: Project;
  featuredViews?: number;
  onViewProjects?: () => void;
}

/**
 * Cardsless homepage body rendered beneath the animated hero name.
 *
 * Layout:
 *   - Bio (left) + Featured project (right) — two columns on lg+
 *   - "See all projects" slim row below both columns
 *   - Gradient rule
 *   - Context + Core Stack grid — technical depth as page anchor
 *
 * Status badge and social links live in the nav bar (content.tsx).
 */
export function HomeOverview({
  featuredProject,
  featuredViews = 0,
  onViewProjects,
}: HomeOverviewProps) {
  return (
    <div className="
      w-full space-y-6 pb-16
      sm:space-y-7 sm:pb-20
    ">
      <div className="
        grid grid-cols-1 gap-0
        lg:grid-cols-2 lg:items-start lg:gap-8
      ">
        <HomeBioPanel />
        {featuredProject ? (
          <HomeFeaturedProjectPanel
            featuredProject={featuredProject}
            featuredViews={featuredViews}
          />
        ) : null}
      </div>

      <HomeProjectsButton onViewProjects={onViewProjects} />

      <HomeGradientRule />

      <div className="
        grid grid-cols-1 gap-8
        sm:grid-cols-2 sm:gap-9
      ">
        <HomeContextSection />
        <div className="
          block
          sm:hidden
        ">
          <HomeGradientRule />
        </div>
        <HomeStackSection />
      </div>
    </div>
  );
}
