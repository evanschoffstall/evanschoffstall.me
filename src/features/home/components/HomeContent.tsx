"use client";

import type { Project } from "contentlayer/generated";

import { motion } from "framer-motion";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";

import { VirtualScrollArea } from "@/components";
import { fadeInUp } from "@/shared";

import { HeroName } from "./HeroName";
import { HomeNavigation } from "./HomeNavigation";
import { HomeOverview } from "./HomeOverview";

/**
 * Inputs required to build the hero section item inside the virtualized home scroll list.
 */
interface CreateHeroScrollItemOptions {
  animateSettledEntry: boolean;
  disableInitialAnimations: boolean;
  handleSettled: () => void;
  hasReplayedHero: boolean;
  heroRunId: number;
  shouldSkipHeroAnimation: boolean;
}

/**
 * Inputs required to build the overview section item once the hero has settled.
 */
interface CreateOverviewScrollItemOptions {
  disableInitialAnimations: boolean;
  featuredProject?: Project;
  featuredViews: number;
}

/**
 * Featured-project data and callbacks needed to render the landing-page home surface.
 */
interface Props {
  disableInitialAnimations?: boolean;
  featuredProject?: Project;
  featuredViews?: number;
  initiallySettled?: boolean;
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
    disableInitialAnimations = false,
    featuredProject,
    featuredViews = 0,
    initiallySettled = false,
  } = props;

  const {
    handleReplayHero,
    handleSettled,
    hasReplayedHero,
    heroRunId,
    nameSettled,
    shouldSkipHeroAnimation,
  } = useHomeHeroState(initiallySettled || disableInitialAnimations);
  const scrollItems = useMemo(() => {
    const heroItem = createHeroScrollItem({
      animateSettledEntry:
        initiallySettled && shouldSkipHeroAnimation && !hasReplayedHero,
      disableInitialAnimations,
      handleSettled,
      hasReplayedHero,
      heroRunId,
      shouldSkipHeroAnimation,
    });

    if (!nameSettled) {
      return [heroItem];
    }

    return [
      heroItem,
      createOverviewScrollItem({
        disableInitialAnimations,
        featuredProject,
        featuredViews,
      }),
    ];
  }, [
    disableInitialAnimations,
    featuredProject,
    featuredViews,
    hasReplayedHero,
    handleSettled,
    heroRunId,
    initiallySettled,
    nameSettled,
    shouldSkipHeroAnimation,
  ]);

  return (
    <div className="relative h-screen overflow-hidden">
      {nameSettled ? (
        <HomeNavigation
          nameSettled={nameSettled}
          onReplayHero={handleReplayHero}
          skipInitialAnimation={disableInitialAnimations}
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
  const {
    animateSettledEntry,
    disableInitialAnimations,
    handleSettled,
    hasReplayedHero,
    heroRunId,
    shouldSkipHeroAnimation,
  } = options;

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
          animateSettledEntry={animateSettledEntry}
          key={heroRunId}
          onSettled={handleSettled}
          skipInitialAnimation={
            !hasReplayedHero &&
            (disableInitialAnimations || shouldSkipHeroAnimation)
          }
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
  const { disableInitialAnimations, featuredProject, featuredViews } = options;

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
        initial={disableInitialAnimations ? false : "hidden"}
        variants={fadeInUp}
      >
        <HomeOverview
          featuredProject={featuredProject}
          featuredViews={featuredViews}
        />
      </motion.div>
    ),
  };
}

/**
 * Owns replay and settled state for the animated home hero name.
 * @param shouldStartSettled - When true, initialize the hero in its settled state.
 * @returns State and callbacks used to drive the home hero animation.
 */
function useHomeHeroState(shouldStartSettled = false) {
  const [nameSettled, setNameSettled] = useState(shouldStartSettled);
  const [hasReplayedHero, setHasReplayedHero] = useState(false);
  const [shouldSkipHeroAnimation, setShouldSkipHeroAnimation] =
    useState(shouldStartSettled);
  const [heroRunId, setHeroRunId] = useState(0);

  useLayoutEffect(() => {
    if (!shouldStartSettled) return;

    setNameSettled(true);
    setShouldSkipHeroAnimation(true);
  }, [shouldStartSettled]);

  const handleSettled = useCallback(() => {
    setNameSettled(true);
  }, []);

  const handleReplayHero = useCallback(() => {
    setHasReplayedHero(true);
    setNameSettled(false);
    setShouldSkipHeroAnimation(false);
    setHeroRunId((runId) => runId + 1);
  }, []);

  return {
    handleReplayHero,
    handleSettled,
    hasReplayedHero,
    heroRunId,
    nameSettled,
    shouldSkipHeroAnimation,
  };
}
