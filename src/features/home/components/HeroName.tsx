"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { fadeInUp } from "@/shared";

/**
 * Animation controls for the fixed-position intro heading shown during the hero sequence.
 */
interface AnimatedHeroNameProps {
  controls: ReturnType<typeof useAnimationControls>;
}

/**
 * Ref target used to measure the settled heading position for the hero transition.
 */
interface HeroNamePlaceholderProps {
  placeholderRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Options for running or skipping the home hero intro animation.
 */
interface HeroNameProps {
  animateSettledEntry?: boolean;
  onSettled?: () => void;
  skipInitialAnimation?: boolean;
}

/** Animation controls and anchors required to move the intro title into place. */
interface RunHomeHeroSequenceOptions {
  controls: ReturnType<typeof useAnimationControls>;
  isCancelled: () => boolean;
  onSettled?: () => void;
  placeholder: HTMLDivElement | null;
  setSettled: (value: boolean) => void;
}

const TITLE_CLASSES =
  "z-10 whitespace-nowrap bg-white bg-clip-text text-4xl font-display text-transparent text-edge-outline sm:text-6xl md:text-7xl lg:text-9xl";

/**
 * Renders the animated home hero title and transitions it into the settled layout.
 * @param props - Callback and animation settings for the hero title sequence.
 * @returns The animated title or its settled heading counterpart.
 */
export function HeroName(props: HeroNameProps) {
  const {
    animateSettledEntry = false,
    onSettled,
    skipInitialAnimation = false,
  } = props;

  const placeholderRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const [settled, setSettled] = useState(skipInitialAnimation);

  useEffect(() => {
    let isCancelled = false;

    if (skipInitialAnimation) {
      onSettled?.();
      return () => {
        isCancelled = true;
      };
    }

    void runHomeHeroSequence({
      controls,
      isCancelled: () => isCancelled,
      onSettled,
      placeholder: placeholderRef.current,
      setSettled,
    });

    return () => {
      isCancelled = true;
      controls.stop();
    };
  }, [controls, onSettled, skipInitialAnimation]);

  if (settled) {
    if (animateSettledEntry) {
      return (
        <motion.h1
          animate="visible"
          className={TITLE_CLASSES}
          initial="hidden"
          style={{ letterSpacing: "-0.02em" }}
          variants={fadeInUp}
        >
          Evan Schoffstall
        </motion.h1>
      );
    }

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

/**
 * Centered animated hero title shown before the title settles into layout.
 * @param props - The animation controls that drive the hero title sequence.
 * @returns The fixed-position animated hero heading.
 */
function AnimatedHeroName(props: AnimatedHeroNameProps) {
  const { controls } = props;

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

/**
 * Small delay between hero animation phases to preserve pacing.
 * @param milliseconds - The amount of time to wait before continuing the sequence.
 * @returns A promise that resolves after the requested delay.
 */
function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Invisible layout anchor used to compute the settled title position.
 * @param props - The placeholder ref used to measure the final title position.
 * @returns The hidden title placeholder used for animation measurements.
 */
function HeroNamePlaceholder(props: HeroNamePlaceholderProps) {
  const { placeholderRef } = props;

  return (
    <div aria-hidden className="invisible" ref={placeholderRef}>
      <h1 className={TITLE_CLASSES}>Evan Schoffstall</h1>
    </div>
  );
}

/**
 * Executes the intro hero animation from centered title to settled page title.
 * @param options - Animation controls, measurement anchor, and completion callbacks.
 * @returns A promise that resolves after the title has settled into place.
 */
async function runHomeHeroSequence(
  options: RunHomeHeroSequenceOptions,
): Promise<void> {
  const { controls, isCancelled, onSettled, placeholder, setSettled } = options;

  await waitForPageReady();
  if (isCancelled()) return;

  await controls.start({
    letterSpacing: "0.02em",
    lineHeight: "100%",
    opacity: 1,
    transition: {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });
  if (isCancelled()) return;

  await delay(500);
  if (isCancelled()) return;

  if (placeholder) {
    const rect = placeholder.getBoundingClientRect();

    await controls.start({
      left: rect.left + rect.width / 2,
      letterSpacing: "-0.02em",
      top: rect.top + rect.height / 2,
      transition: {
        duration: 2,
        ease: [0.22, 1, 0.36, 1],
      },
    });
  }
  if (isCancelled()) return;

  setSettled(true);
  onSettled?.();
}

/**
 * Resolves once the browser has loaded the document and fonts for the hero.
 * @returns A promise that resolves after document and font readiness are both satisfied.
 */
function waitForPageReady(): Promise<void> {
  return new Promise((resolve) => {
    /** Continues once the browser reports both document and font readiness. */
    const proceed = () => {
      void document.fonts.ready.then(() => {
        resolve();
      });
    };

    if (document.readyState === "complete") {
      proceed();
    } else {
      window.addEventListener("load", proceed, { once: true });
    }
  });
}
