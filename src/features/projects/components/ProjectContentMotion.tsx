"use client";

import type { ReactNode } from "react";

import { motion } from "framer-motion";

import { ANIMATION } from "@/shared";

const projectContentTransition = {
  delay: 0.08,
  duration: 0.72,
  ease: ANIMATION.EASE,
} as const;

/** Project detail content shell rendered after README/MDX format selection. */
interface ProjectContentMotionProps {
  children: ReactNode;
  className: string;
}


/**
 * Gives the project detail body a polished page-level entrance while the
 * format-specific prose nodes animate through shared CSS descendant rules.
 * @param props - The layout classes and body content selected by the project page.
 * @returns The animated project detail content container.
 */
export function ProjectContentMotion(props: ProjectContentMotionProps) {
  const { children, className } = props;
  const shouldSkipInitialAnimation =
    process.env.NEXT_PUBLIC_PLAYWRIGHT_SKIP_ANIMATIONS === "1";

  return (
    <motion.div
      animate={{ filter: "blur(0px)", opacity: 1, scale: 1, y: 0 }}
      className={`${className} transform-gpu`}
      data-project-content-motion=""
      initial={
        shouldSkipInitialAnimation
          ? false
          : { filter: "blur(12px)", opacity: 0, scale: 0.985, y: 28 }
      }
      style={{ willChange: "opacity, transform, filter" }}
      transition={projectContentTransition}
    >
      {children}
    </motion.div>
  );
}