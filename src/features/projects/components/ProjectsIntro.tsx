"use client";

import { motion } from "framer-motion";

import { fadeInUp } from "@/shared";

/**
 * Intro copy shown above the projects grid.
 * @returns The projects intro copy block.
 */
export function ProjectsIntro() {
  return (
    <motion.div
      animate="visible"
      className="space-y-2"
      initial="hidden"
      variants={fadeInUp}
    >
      <p
        className="
        text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600
      "
      >
        Projects
      </p>
      <p className="text-sm leading-7 text-zinc-500">
        Some of the projects are from work and some are on my own time.
      </p>
    </motion.div>
  );
}
