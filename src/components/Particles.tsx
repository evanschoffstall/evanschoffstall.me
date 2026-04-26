"use client";

import { useEffect } from "react";

import { useParticleCanvas } from "@/components/particles";

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
 * Reinitializes the particle canvas whenever the refresh key changes.
 * @param refresh - The refresh toggle that should reinitialize the canvas.
 * @param initCanvas - The callback that rebuilds the particle runtime.
 */
function useParticleRefresh(refresh: boolean, initCanvas: () => void) {
  useEffect(() => {
    initCanvas();
  }, [initCanvas, refresh]);
}
