"use client";

import { motion, useMotionTemplate, useSpring } from "framer-motion";
import type { MouseEvent, PropsWithChildren } from "react";

export function FeaturedCard({ children }: PropsWithChildren) {
  const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 100 });

  function onMouseMove(event: MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = event;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const maskImage = useMotionTemplate`radial-gradient(280px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div
      onMouseMove={onMouseMove}
      className="overflow-hidden relative duration-700 border rounded-xl group md:gap-8 shadow-2xl
				border-amber-700/40 bg-zinc-900/60
				hover:border-amber-500/60 hover:bg-amber-950/10
				shadow-amber-950/30 hover:shadow-amber-900/40"
    >
      {/* Top edge accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      {/* Corner glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 0%), rgba(251,191,36,0.04), transparent 60%)",
        }}
      />

      <div className="pointer-events-none">
        <div className="absolute inset-0 z-0 transition duration-1000 [mask-image:linear-gradient(black,transparent)]" />
        <motion.div
          className="absolute inset-0 z-10 bg-gradient-to-br from-amber-400/10 via-amber-300/5 to-transparent opacity-100 transition duration-1000 group-hover:opacity-60"
          style={style}
        />
        <motion.div
          className="absolute inset-0 z-10 bg-gradient-to-br from-amber-300/15 via-amber-200/8 to-transparent opacity-0 mix-blend-overlay transition duration-1000 group-hover:opacity-100"
          style={style}
        />
      </div>

      {children}
    </div>
  );
}
