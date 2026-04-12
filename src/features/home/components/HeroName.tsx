"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { runHomeHeroSequence } from "@/features/home/motion/index";

interface HeroNameProps {
  onSettled?: () => void;
  skipInitialAnimation?: boolean;
}

const TITLE_CLASSES =
  "z-10 whitespace-nowrap bg-white bg-clip-text text-4xl font-display text-transparent text-edge-outline sm:text-6xl md:text-7xl lg:text-9xl";

export function HeroName({
  onSettled,
  skipInitialAnimation = false,
}: HeroNameProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const [settled, setSettled] = useState(skipInitialAnimation);

  useEffect(() => {
    if (skipInitialAnimation) {
      onSettled?.();
      return;
    }

    void runHomeHeroSequence({
      controls,
      onSettled,
      placeholder: placeholderRef.current,
      setSettled,
    });
  }, [controls, onSettled, skipInitialAnimation]);

  if (settled) {
    return (
      <h1 className={TITLE_CLASSES} style={{ letterSpacing: "-0.02em" }}>
        Evan Schoffstall
      </h1>
    );
  }

  return (
    <>
      <HeroNamePlaceholder placeholderRef={placeholderRef} />
      <AnimatedHeroName controls={controls} />
    </>
  );
}

/** Centered animated hero title shown before the title settles into layout. */
function AnimatedHeroName({
  controls,
}: {
  controls: ReturnType<typeof useAnimationControls>;
}) {
  return (
    <motion.h1
      animate={controls}
      className={`
        fixed
        ${TITLE_CLASSES}
        z-50
      `}
      initial={{
        left: "50%",
        letterSpacing: "0.25em",
        lineHeight: "0%",
        opacity: 0,
        top: "50vh",
      }}
      style={{ transform: "translate(-50%, -50%)" }}
    >
      Evan Schoffstall
    </motion.h1>
  );
}

/** Invisible layout anchor used to compute the settled title position. */
function HeroNamePlaceholder({ placeholderRef }: { placeholderRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div aria-hidden className="invisible" ref={placeholderRef}>
      <h1 className={TITLE_CLASSES}>Evan Schoffstall</h1>
    </div>
  );
}
