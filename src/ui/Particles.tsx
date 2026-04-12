"use client";

import { useEffect } from "react";

import { useParticleCanvas } from "@/ui/particles";

interface ParticlesProps {
  className?: string;
  ease?: number;
  interactive?: boolean;
  quantity?: number;
  refresh?: boolean;
  staticity?: number;
}

export function Particles({
  className = "",
  ease = 50,
  interactive = true,
  quantity = 30,
  refresh = false,
  staticity = 50,
}: ParticlesProps) {
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

function useParticleRefresh(refresh: boolean, initCanvas: () => void) {
  useEffect(() => {
    initCanvas();
  }, [initCanvas, refresh]);
}