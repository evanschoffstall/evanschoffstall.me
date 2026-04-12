"use client";

import type { Project } from "contentlayer/generated";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { useHomeHeroState } from "@/features/home/hooks";
import { fadeInUp } from "@/lib";
import { VirtualScrollArea } from "@/ui";

import { HeroName } from "./HeroName";
import { HomeNavigation } from "./HomeNavigation";
import { HomeOverview } from "./HomeOverview";

interface Props {
  featuredProject?: Project;
  featuredViews?: number;
  onViewProjects?: () => void;
  skipInitialAnimations?: boolean;
}

/**
 * Home page shell: manages the hero animation state, renders the nav (with
 * status badge + social links), and wraps all scrollable content in a custom
 * ScrollArea so the native browser scrollbar is replaced.
 */
export function HomeContent({
  featuredProject,
  featuredViews = 0,
  onViewProjects,
  skipInitialAnimations = false,
}: Props) {
  const {
    handleReplayHero,
    handleSettled,
    heroRunId,
    nameSettled,
  } = useHomeHeroState(skipInitialAnimations);
  const scrollItems = useMemo(() => {
    const heroItem = createHeroScrollItem({
      handleSettled,
      heroRunId,
      skipInitialAnimations,
    });

    if (!nameSettled) {
      return [heroItem];
    }

    return [
      heroItem,
      createOverviewScrollItem({
        featuredProject,
        featuredViews,
        onViewProjects,
        skipInitialAnimations,
      }),
    ];
  }, [
    featuredProject,
    featuredViews,
    handleSettled,
    heroRunId,
    nameSettled,
    onViewProjects,
    skipInitialAnimations,
  ]);

  return (
    <div className="relative h-screen overflow-hidden">
      {nameSettled ? (
        <HomeNavigation
          nameSettled={nameSettled}
          onReplayHero={handleReplayHero}
          skipInitialAnimation={skipInitialAnimations}
        />
      ) : null}
      <VirtualScrollArea className="size-full" items={scrollItems} overscan={2} />
    </div>
  );
}

/** Builds the hero item used by the virtualized home scroll surface. */
function createHeroScrollItem(options: {
  handleSettled: () => void;
  heroRunId: number;
  skipInitialAnimations: boolean;
}) {
  const { handleSettled, heroRunId, skipInitialAnimations } = options;

  return {
    estimateSize: 220,
    key: "hero",
    node: (
      <div className="
        flex flex-col items-center px-4 pt-16
        sm:px-6 sm:pt-20
        md:pt-24
        lg:pt-28
      ">
        <HeroName
          key={heroRunId}
          onSettled={handleSettled}
          skipInitialAnimation={skipInitialAnimations}
        />
      </div>
    ),
  };
}

/** Builds the overview item once the hero has finished settling into place. */
function createOverviewScrollItem(options: {
  featuredProject?: Project;
  featuredViews: number;
  onViewProjects?: () => void;
  skipInitialAnimations: boolean;
}) {
  const {
    featuredProject,
    featuredViews,
    onViewProjects,
    skipInitialAnimations,
  } = options;

  return {
    estimateSize: 520,
    key: "overview",
    node: (
      <motion.div
        animate="visible"
        className="
          mx-auto mt-10 w-full max-w-5xl px-4 pb-16
          sm:px-6 sm:pb-20
          md:mt-14
        "
        initial={skipInitialAnimations ? false : "hidden"}
        variants={fadeInUp}
      >
        <HomeOverview
          featuredProject={featuredProject}
          featuredViews={featuredViews}
          onViewProjects={onViewProjects}
        />
      </motion.div>
    ),
  };
}
