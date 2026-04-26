"use client";

import { useCallback } from "react";

import type { ParticleState } from "@/components/particles/particleTypes";

import {
  clearContext,
  createCircle,
  drawCircle,
  isCircleOutOfBounds,
  resizeCanvas,
  updateCircleAlpha,
  updateCircleMotion,
} from "@/components/particles/particleCanvasEngine";

interface UseParticleAnimatorOptions {
  ease: number;
  quantity: number;
  state: ParticleState;
  staticity: number;
}

/**
 * Manage the canvas animation: exposes `initCanvas` to size/seed the canvas
 * and `renderFrame` to be called by the animation loop each tick.
 * @param options - Animator configuration including ease, quantity, state, and staticity.
 * @returns The `initCanvas` and `renderFrame` callbacks.
 */
export function useParticleAnimator(options: UseParticleAnimatorOptions) {
  const { ease, quantity, state, staticity } = options;
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
  }, [
    seedParticles,
    state.canvasContainerRef,
    state.canvasRef,
    state.canvasSize,
    state.circles,
    state.context,
    state.dprRef,
  ]);

  return {
    initCanvas,
    renderFrame,
  };
}

/**
 * Render one animation frame.
 *
 * Accepts the `time` value (ms since animation start) so that
 * `updateCircleAlpha` can drive the per-particle twinkling sine wave.
 * @param state - Shared particle state refs.
 * @param ease - Easing factor for mouse-driven parallax lerp.
 * @param staticity - How strongly the canvas field resists mouse deflection.
 * @returns A stable `useCallback` that renders a single frame.
 */
function useParticleFrameRenderer(
  state: ParticleState,
  ease: number,
  staticity: number,
) {
  return useCallback(
    (time: number) => {
      const elapsed = time / 1000; // convert to seconds for the twinkling math
      clearContext(state.context.current, state.canvasSize.current);

      for (
        let index = state.circles.current.length - 1;
        index >= 0;
        index -= 1
      ) {
        const circle = state.circles.current[index];
        updateCircleAlpha(circle, state.canvasSize.current, elapsed);
        updateCircleMotion({
          circle,
          ease,
          mouse: state.mouse.current,
          staticity,
        });

        if (isCircleOutOfBounds(circle, state.canvasSize.current)) {
          state.circles.current.splice(
            index,
            1,
            createCircle(state.canvasSize.current),
          );
        }

        drawCircle(
          state.context.current,
          state.circles.current[index],
          state.dprRef.current,
        );
      }
    },
    [
      ease,
      state.canvasSize,
      state.circles,
      state.context,
      state.dprRef,
      state.mouse,
      staticity,
    ],
  );
}

/**
 * Seed the canvas with a fresh set of `quantity` circles, each starting at alpha 0.
 * @param state - Shared particle state refs.
 * @param quantity - How many circles to create.
 * @returns A stable `useCallback` that re-seeds the canvas.
 */
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
