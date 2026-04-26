"use client";

import type { MotionStyle } from "framer-motion";
import type { MouseEvent, PropsWithChildren, ReactNode } from "react";

import { motion, useMotionTemplate, useSpring } from "framer-motion";

import { cn } from "@/shared";

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
 * Shared mouse-reactive card surface for both default and featured cards.
 * @param props - Gradient, layout, and content configuration for the interactive card.
 * @returns The shared mouse-reactive card surface.
 */
export function InteractiveCard(props: InteractiveCardProps) {
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
