"use client";

import type { MotionStyle } from "framer-motion";
import type { MouseEvent, PropsWithChildren, ReactNode } from "react";

import { motion, useMotionTemplate, useSpring } from "framer-motion";

import { cn } from "@/shared";

/** Content and optional class overrides for card shell variants. */
type CardProps = PropsWithChildren<{ className?: string }>;

/** Optional class overrides for the decorative glow layer rendered behind cards. */
interface GlowProps {
  className?: string;
}

/**
 * Visual configuration for the shared mouse-reactive card surface, including
 * overlay classes, accent treatment, and optional top accent content.
 */
interface InteractiveCardProps extends PropsWithChildren {
  accentClassName: string;
  className?: string;
  containerClassName: string;
  gradientRadius: number;
  overlayClassName: string;
  secondaryOverlayClassName: string;
  topAccent?: ReactNode;
}

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

/**
 * Renders the highlighted interactive card shell used for featured projects.
 * @param props - The card content and optional wrapper class name.
 * @returns The featured interactive card surface.
 */
export function FeaturedCard(props: CardProps) {
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
        bg-[rgba(24,24,27,0.4)] shadow-2xl shadow-amber-950/20 duration-700
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
          absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent
          via-amber-500/50 to-transparent
        "
        />
      }
    >
      {children}
    </InteractiveCard>
  );
}

/**
 * Renders the blurred background glow used behind interactive cards.
 * @param props - The optional class name overrides for the glow wrapper.
 * @returns The decorative glow element.
 */
export function Glow(props: GlowProps) {
  const { className } = props;

  return (
    <div
      aria-hidden="true"
      className={cn(
        `
          absolute inset-0 rounded-lg bg-linear-to-br from-zinc-800/20
          via-transparent to-zinc-700/20 blur-xl
        `,
        className,
      )}
    />
  );
}

/**
 * Shared mouse-reactive card surface for both default and featured cards.
 * @param props - Gradient, layout, and content configuration for the interactive card.
 * @returns The shared mouse-reactive card surface.
 */
function InteractiveCard(props: InteractiveCardProps) {
  const {
    accentClassName,
    children,
    className,
    containerClassName,
    gradientRadius,
    overlayClassName,
    secondaryOverlayClassName,
    topAccent,
  } = props;

  const mouseX = useSpring(0, { damping: 100, stiffness: 500 });
  const mouseY = useSpring(0, { damping: 100, stiffness: 500 });
  const maskImage = useMotionTemplate`radial-gradient(${gradientRadius}px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style: MotionStyle = { maskImage, WebkitMaskImage: maskImage };

  /**
   * Updates the gradient center to match the current pointer location.
   * @param event - The pointer movement event over the card container.
   */
  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = event;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <div
      className={cn(containerClassName, className)}
      onMouseMove={handleMouseMove}
    >
      {topAccent}
      <div className="pointer-events-none">
        <div className={accentClassName} />
        <motion.div className={overlayClassName} style={style} />
        <motion.div className={secondaryOverlayClassName} style={style} />
      </div>
      {children}
    </div>
  );
}
