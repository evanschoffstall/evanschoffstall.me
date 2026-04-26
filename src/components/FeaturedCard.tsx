"use client";

import type { PropsWithChildren } from "react";

import { InteractiveCard } from "./InteractiveCard";

/**
 * Content and optional class overrides for the featured variant of the shared card shell.
 */
type FeaturedCardProps = PropsWithChildren<{ className?: string }>;

/**
 * Renders the highlighted interactive card shell used for featured projects.
 * @param props - The card content and optional wrapper class name.
 * @returns The featured interactive card surface.
 */
export function FeaturedCard(props: FeaturedCardProps) {
  const { children, className } = props;

  return (
    <InteractiveCard
      accentClassName="
        absolute inset-0 z-0 transition duration-1000
        [mask-image:linear-gradient(black,transparent)]
      "
      className={className}
      containerClassName="
        group relative overflow-hidden rounded-xl border border-amber-900/30
        bg-zinc-900/40 shadow-2xl shadow-amber-950/20 duration-700
        hover:border-amber-700/40 hover:bg-amber-950/10
        hover:shadow-amber-900/30
        md:gap-8
      "
      gradientRadius={280}
      overlayClassName="
        absolute inset-0 z-10 bg-gradient-to-br from-amber-400/10
        via-amber-300/5 to-transparent opacity-100 transition duration-1000
        group-hover:opacity-60
      "
      secondaryOverlayClassName="
        via-amber-200/8 absolute inset-0 z-10 bg-gradient-to-br
        from-amber-300/15 to-transparent opacity-0 mix-blend-overlay
        transition duration-1000
        group-hover:opacity-100
      "
      topAccent={
        <div
          className="
          absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent
          via-amber-500/50 to-transparent
        "
        />
      }
    >
      {children}
    </InteractiveCard>
  );
}
