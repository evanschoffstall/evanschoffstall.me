"use client";

import type { PropsWithChildren } from "react";

import { InteractiveCard } from "./InteractiveCard";

/**
 * Content and optional class overrides for the default interactive card shell.
 */
type CardProps = PropsWithChildren<{ className?: string }>;

/**
 * Renders the default interactive card shell used across the site.
 * @param props - The card content and optional wrapper class name.
 * @returns The default interactive card surface.
 */
export function Card(props: CardProps) {
  const { children, className } = props;

  return (
    <InteractiveCard
      accentClassName="
        absolute inset-0 z-0 transition duration-1000
        [mask-image:linear-gradient(black,transparent)]
      "
      className={className}
      containerClassName="
        group relative overflow-hidden rounded-xl border border-zinc-800
        shadow-2xl shadow-zinc-900/50 duration-700
        hover:border-zinc-700/50 hover:bg-zinc-800/10
        md:gap-8
      "
      gradientRadius={240}
      overlayClassName="
        absolute inset-0 z-10 bg-gradient-to-br from-zinc-100/20
        via-zinc-100/10 to-transparent opacity-100 transition duration-1000
        group-hover:opacity-50
      "
      secondaryOverlayClassName="
        absolute inset-0 z-10 bg-gradient-to-br from-zinc-100/20
        via-zinc-100/10 to-transparent opacity-0 mix-blend-overlay
        transition duration-1000
        group-hover:opacity-100
      "
    >
      {children}
    </InteractiveCard>
  );
}
