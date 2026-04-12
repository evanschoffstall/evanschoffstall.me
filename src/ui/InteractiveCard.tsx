"use client";

import type { MotionStyle } from "framer-motion";
import type { MouseEvent, PropsWithChildren, ReactNode } from "react";

import { motion, useMotionTemplate, useSpring } from "framer-motion";

import { cn } from "@/lib";

interface InteractiveCardProps extends PropsWithChildren {
  accentClassName: string;
  className?: string;
  containerClassName: string;
  gradientRadius: number;
  overlayClassName: string;
  secondaryOverlayClassName: string;
  topAccent?: ReactNode;
}

/** Shared mouse-reactive card surface for both default and featured cards. */
export function InteractiveCard({
  accentClassName,
  children,
  className,
  containerClassName,
  gradientRadius,
  overlayClassName,
  secondaryOverlayClassName,
  topAccent,
}: InteractiveCardProps) {
  const mouseX = useSpring(0, { damping: 100, stiffness: 500 });
  const mouseY = useSpring(0, { damping: 100, stiffness: 500 });
  const maskImage = useMotionTemplate`radial-gradient(${gradientRadius}px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style: MotionStyle = { maskImage, WebkitMaskImage: maskImage };

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