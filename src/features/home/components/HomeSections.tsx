"use client";

import { useLayoutEffect, useState } from "react";

import { motion } from "framer-motion";

import { consumeHomeIntroSkip } from "@/features/projects/browser";
import type { ProjectIndexData } from "@/features/projects/model";
import { ANIMATION } from "@/shared";

import { HomeContent } from "./HomeContent";

/**
 * Inputs required to render the hero-and-overview landing state.
 */
interface HomeSectionProps {
  shouldDisableHomeAnimations: boolean;
  shouldStartHomeSettled: boolean;
  projectData: ProjectIndexData | null;
}

/**
 * Project data used by the landing page featured-project preview.
 */
interface Props {
  projectData: ProjectIndexData | null;
}

/**
 * Coordinates the landing page section inside the shared site shell.
 * @param props - The precomputed project data used by the landing preview.
 * @returns The animated landing section with its featured project preview.
 */
export function HomeSections(props: Props) {
  const { projectData } = props;
  const [shouldStartHomeSettled, setShouldStartHomeSettled] = useState(false);
  const [hasResolvedNavigationIntent, setHasResolvedNavigationIntent] =
    useState(false);

  useLayoutEffect(() => {
    setShouldStartHomeSettled(
      (shouldAlreadyStartSettled) =>
        shouldAlreadyStartSettled || consumeHomeIntroSkip(),
    );
    setHasResolvedNavigationIntent(true);
  }, []);

  const shouldDisableHomeAnimations =
    process.env.NEXT_PUBLIC_PLAYWRIGHT_SKIP_ANIMATIONS === "1";
  const canRenderHomeContent =
    hasResolvedNavigationIntent || shouldDisableHomeAnimations;

  return (
    <div className="relative">
      {canRenderHomeContent ? (
        <HomeSection
          shouldDisableHomeAnimations={shouldDisableHomeAnimations}
          shouldStartHomeSettled={shouldStartHomeSettled}
          projectData={projectData}
        />
      ) : null}
    </div>
  );
}

/**
 * Renders the interactive landing section.
 * @param props - Project data and animation state required for the landing view.
 * @returns The animated landing section container.
 */
function HomeSection(props: HomeSectionProps) {
  const { projectData, shouldDisableHomeAnimations, shouldStartHomeSettled } =
    props;

  return (
    <motion.section
      animate={{ opacity: 1 }}
      initial={shouldDisableHomeAnimations ? false : { opacity: 0 }}
      transition={
        shouldDisableHomeAnimations
          ? { duration: 0 }
          : { duration: ANIMATION.FADE_DURATION, ease: ANIMATION.EASE }
      }
    >
      <HomeContent
        featuredProject={projectData?.featured}
        featuredViews={
          projectData ? (projectData.views[projectData.featured.slug] ?? 0) : 0
        }
        disableInitialAnimations={shouldDisableHomeAnimations}
        initiallySettled={shouldStartHomeSettled}
      />
    </motion.section>
  );
}
