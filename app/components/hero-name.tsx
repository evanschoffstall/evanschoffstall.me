"use client";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface HeroNameProps {
  onSettled?: () => void;
}

export function HeroName({ onSettled }: HeroNameProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    async function runSequence() {
      // Phase 1: fade in + expand at dead center of screen
      await controls.start({
        opacity: 1,
        lineHeight: "100%",
        letterSpacing: "0.02em",
        transition: {
          duration: 2.2,
          ease: "easeOut",
        },
      });

      // Brief pause while centered
      await new Promise((r) => setTimeout(r, 500));

      // Phase 2: slide from center to final resting position
      if (placeholderRef.current) {
        const rect = placeholderRef.current.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;

        await controls.start({
          left: targetX,
          top: targetY,
          letterSpacing: "-0.02em",
          transition: {
            duration: 2.0,
            ease: [0.22, 1, 0.36, 1],
          },
        });
      }

      setSettled(true);
      onSettled?.();
    }

    runSequence();
  }, [controls, onSettled]);

  const titleClasses =
    "z-10 text-4xl text-transparent bg-white cursor-default text-edge-outline font-display sm:text-6xl md:text-7xl lg:text-9xl whitespace-nowrap bg-clip-text";

  if (settled) {
    return <h1 className={titleClasses} style={{ letterSpacing: "-0.02em" }}>Evan Schoffstall</h1>;
  }

  return (
    <>
      {/* Invisible placeholder to measure the final in-flow position */}
      <div ref={placeholderRef} className="invisible" aria-hidden>
        <h1 className={titleClasses}>Evan Schoffstall</h1>
      </div>

      {/* Fixed-position animated name */}
      <motion.h1
        className={`fixed ${titleClasses} z-50`}
        style={{ transform: "translate(-50%, -50%)" }}
        initial={{
          top: "50vh",
          left: "50%",
          opacity: 0,
          letterSpacing: "0.25em",
          lineHeight: "0%",
        }}
        animate={controls}
      >
        Evan Schoffstall
      </motion.h1>
    </>
  );
}
