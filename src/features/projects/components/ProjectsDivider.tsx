"use client";

import { motion } from "framer-motion";

import { EASE_IN_OUT } from "@/shared";

const dividerTransition = {
  duration: 0.8,
  ease: EASE_IN_OUT,
} as const;

/**
 * Animated horizontal divider used between projects sections.
 * @returns The animated projects section divider.
 */
export function ProjectsDivider() {
  return (
    <motion.div
      animate={{ opacity: 1, scaleX: 1 }}
      className="
        h-px w-full bg-gradient-to-r from-transparent via-zinc-700/60
        to-transparent
      "
      initial={{ opacity: 0, scaleX: 0 }}
      style={{ transformOrigin: "left" }}
      transition={dividerTransition}
    />
  );
}
