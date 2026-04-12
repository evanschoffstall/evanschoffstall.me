"use client";

import { useCallback } from "react";

import type { ParticleState } from "@/ui/particles/particleTypes";

import {
  clearContext,
  createCircle,
  drawCircle,
  isCircleOutOfBounds,
  resizeCanvas,
  updateCircleAlpha,
  updateCircleMotion,
} from "@/ui/particles/particleCanvasRuntime";

export function useParticleAnimator(options: {
  ease: number;
  quantity: number;
  state: ParticleState;
  staticity: number;
}) {
  const { ease, quantity, state, staticity } = options;
  const shouldAnimate = useCallback(() => {
    return state.isPageVisibleRef.current && !state.prefersReducedMotionRef.current;
  }, [state.isPageVisibleRef, state.prefersReducedMotionRef]);
  const seedParticles = useParticleSeeder(state, quantity);
  const renderFrame = useParticleFrameRenderer(state, ease, staticity);
  const initCanvas = useCallback(() => {
    resizeCanvas({
      canvas: state.canvasRef.current,
      canvasSize: state.canvasSize.current,
      circles: state.circles.current,
      container: state.canvasContainerRef.current,
      dpr: state.dprRef.current,
      drawingContext: state.context.current,
    });
    seedParticles();
  }, [seedParticles, state.canvasContainerRef, state.canvasRef, state.canvasSize, state.circles, state.context, state.dprRef]);
  const scheduleNextFrame = useParticleScheduler(state, renderFrame, shouldAnimate);

  return {
    initCanvas,
    scheduleNextFrame,
    shouldAnimate,
  };
}

function useParticleFrameRenderer(
  state: ParticleState,
  ease: number,
  staticity: number,
) {
  return useCallback(() => {
    clearContext(state.context.current, state.canvasSize.current);

    for (let index = state.circles.current.length - 1; index >= 0; index -= 1) {
      const circle = state.circles.current[index];
      updateCircleAlpha(circle, state.canvasSize.current);
      updateCircleMotion({
        circle,
        ease,
        mouse: state.mouse.current,
        staticity,
      });

      if (isCircleOutOfBounds(circle, state.canvasSize.current)) {
        state.circles.current.splice(index, 1, createCircle(state.canvasSize.current));
      }

      drawCircle(state.context.current, state.circles.current[index], state.dprRef.current);
    }
  }, [ease, state.canvasSize, state.circles, state.context, state.dprRef, state.mouse, staticity]);
}

function useParticleScheduler(
  state: ParticleState,
  renderFrame: () => void,
  shouldAnimate: () => boolean,
) {
  return useCallback(() => {
    const scheduleFrame = () => {
      state.animationFrameIdRef.current = requestAnimationFrame(() => {
        state.animationFrameIdRef.current = null;

        if (!state.isMounted.current || !shouldAnimate()) {
          return;
        }

        renderFrame();
        scheduleFrame();
      });
    };

    if (state.animationFrameIdRef.current !== null || !shouldAnimate()) {
      return;
    }

    scheduleFrame();
  }, [renderFrame, shouldAnimate, state.animationFrameIdRef, state.isMounted]);
}

function useParticleSeeder(state: ParticleState, quantity: number) {
  return useCallback(() => {
    clearContext(state.context.current, state.canvasSize.current);
    state.circles.current = Array.from({ length: quantity }, () =>
      createCircle(state.canvasSize.current),
    );

    for (const circle of state.circles.current) {
      drawCircle(state.context.current, circle, state.dprRef.current);
    }
  }, [quantity, state.canvasSize, state.circles, state.context, state.dprRef]);
}