"use client";

import type { Project } from "contentlayer/generated";

import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";

import { VirtualScrollArea } from "@/components";
import { fadeInUp } from "@/shared";

import { HeroName } from "./HeroName";
import { HomeNavigation } from "./HomeNavigation";
import { HomeOverview } from "./HomeOverview";

/**
 * Inputs required to build the hero section item inside the virtualized home scroll list.
 */
interface CreateHeroScrollItemOptions {
  handleSettled: () => void;
  heroRunId: number;
  skipInitialAnimations: boolean;
}

/**
 * Inputs required to build the overview section item once the hero has settled.
 */
interface CreateOverviewScrollItemOptions {
  featuredProject?: Project;
  featuredViews: number;
  onViewProjects?: () => void;
  skipInitialAnimations: boolean;
}

/**
 * Featured-project data and callbacks needed to render the landing-page home surface.
 */
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
 * @param props - Featured project data and callbacks needed by the home view.
 * @returns The virtualized home content surface with hero and overview sections.
 */
export function HomeContent(props: Props) {
  const {
    featuredProject,
    featuredViews = 0,
    onViewProjects,
    skipInitialAnimations = false,
  } = props;

  const { handleReplayHero, handleSettled, heroRunId, nameSettled } =
    useHomeHeroState(skipInitialAnimations);
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
      <VirtualScrollArea
        className="size-full"
        items={scrollItems}
        overscan={2}
      />
    </div>
  );
}

/**
 * Builds the hero item used by the virtualized home scroll surface.
 * @param options - The hero animation state used to build the first virtual item.
 * @returns The hero row configuration for the virtual scroll surface.
 */
function createHeroScrollItem(options: CreateHeroScrollItemOptions) {
  const { handleSettled, heroRunId, skipInitialAnimations } = options;

  return {
    estimateSize: 220,
    key: "hero",
    node: (
      <div
        className="
        flex flex-col items-center px-4 pt-16
        sm:px-6 sm:pt-20
        md:pt-24
        lg:pt-28
      "
      >
        <HeroName
          key={heroRunId}
          onSettled={handleSettled}
          skipInitialAnimation={skipInitialAnimations}
        />
      </div>
    ),
  };
}

/**
 * Builds the overview item once the hero has finished settling into place.
 * @param options - The overview content needed once the hero animation has settled.
 * @returns The overview row configuration for the virtual scroll surface.
 */
function createOverviewScrollItem(options: CreateOverviewScrollItemOptions) {
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

/**
 * Owns replay and settled state for the animated home hero name.
 * @param skipInitialAnimations - When true, initialize the hero in its settled state.
 * @returns State and callbacks used to drive the home hero animation.
 */
function useHomeHeroState(skipInitialAnimations = false) {
  const [nameSettled, setNameSettled] = useState(skipInitialAnimations);
  const [heroRunId, setHeroRunId] = useState(0);

  const handleSettled = useCallback(() => {
    setNameSettled(true);
  }, []);

  const handleReplayHero = useCallback(() => {
    setNameSettled(false);
    setHeroRunId((runId) => runId + 1);
  }, []);

  return {
    handleReplayHero,
    handleSettled,
    heroRunId,
    nameSettled,
  };
}
