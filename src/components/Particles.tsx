"use client";

import { useEffect } from "react";

import { useParticleCanvas } from "@/components/particles";

/** Background-particle intensity and interactivity controls for section backdrops. */
interface ParticlesBackgroundProps {
  interactive?: boolean;
  quantity?: number;
}

/**
 * Density, motion, interactivity, and wrapper styling options for the particle canvas.
 */
interface ParticlesProps {
  className?: string;
  ease?: number;
  interactive?: boolean;
  quantity?: number;
  refresh?: boolean;
  staticity?: number;
}

/**
 * Renders the interactive particles canvas and manages its lifecycle.
 * @param props - Canvas behavior, density, and styling options.
 * @returns The particles canvas wrapper.
 */
export function Particles(props: ParticlesProps) {
  const {
    className = "",
    ease = 50,
    interactive = true,
    quantity = 30,
    refresh = false,
    staticity = 50,
  } = props;

  const { canvasContainerRef, canvasRef, initCanvas } = useParticleCanvas({
    ease,
    interactive,
    quantity,
    staticity,
  });

  useParticleRefresh(refresh, initCanvas);

  return (
    <div aria-hidden="true" className={className} ref={canvasContainerRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/**
 * Shared ambient particles backdrop used by top-level page layouts.
 * @param props - Particle interaction and density settings for the backdrop.
 * @returns The ambient background layers with particles.
 */
export function ParticlesBackground(props: ParticlesBackgroundProps) {
  const { interactive = true, quantity = 200 } = props;

  return (
    <>
      <div
        className="
        fixed inset-0 -z-20 bg-linear-to-tl from-black via-zinc-600/20
        to-black
      "
      />
      <Particles
        className="fixed inset-0 -z-10 animate-fade-in"
        interactive={interactive}
        quantity={quantity}
      />
    </>
  );
}

/**
 * Reinitializes the particle canvas whenever the refresh key changes.
 * @param refresh - The refresh toggle that should reinitialize the canvas.
 * @param initCanvas - The callback that rebuilds the particle runtime.
 */
function useParticleRefresh(refresh: boolean, initCanvas: () => void) {
  useEffect(() => {
    initCanvas();
  }, [initCanvas, refresh]);
}
