"use client";

import type { UseParticleCanvasOptions } from "@/ui/particles/particleTypes";

import { useParticleAnimator } from "@/ui/particles/useParticleAnimator";
import { useParticleLifecycle } from "@/ui/particles/useParticleLifecycle";
import { useParticleState } from "@/ui/particles/useParticleState";

export function useParticleCanvas(options: UseParticleCanvasOptions) {
  const state = useParticleState();
  const animator = useParticleAnimator({
    ease: options.ease,
    quantity: options.quantity,
    state,
    staticity: options.staticity,
  });

  useParticleLifecycle({
    initCanvas: animator.initCanvas,
    interactive: options.interactive,
    scheduleNextFrame: animator.scheduleNextFrame,
    shouldAnimate: animator.shouldAnimate,
    state,
  });

  return {
    canvasContainerRef: state.canvasContainerRef,
    canvasRef: state.canvasRef,
    initCanvas: animator.initCanvas,
  };
}