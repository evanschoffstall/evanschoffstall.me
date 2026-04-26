"use client";

import { type RefObject, useEffect, useRef } from "react";

import type { UseParticleCanvasOptions } from "@/components/particles/particleTypes";

import { useParticleAnimator } from "@/components/particles/useParticleAnimator";
import { useParticleLifecycle } from "@/components/particles/useParticleLifecycle";
import { useParticleState } from "@/components/particles/useParticleState";

/** Target frame interval — throttle to 30 fps so the loop stays inexpensive. */
const TARGET_FRAME_MS = 1000 / 30;

/**
 * Refs required by the raw requestAnimationFrame loop that drives particle rendering.
 */
interface ParticleAnimationLoopOptions {
  isMountedRef: RefObject<boolean>;
  renderFrameRef: RefObject<(time: number) => void>;
}

/**
 * Runs the particle animation loop while the canvas is mounted and the tab is visible.
 * @param options - The refs needed to schedule and render particle frames.
 */
/**
 * Compose particle state, animator, lifecycle, and animation loop into a
 * single hook consumed by the `Particles` component.
 *
 * Animation is driven by a raw `requestAnimationFrame` loop to avoid any
 * dependency on framer-motion's internal scheduler (which re-subscribes on
 * every callback reference change, resetting the timestamp and dropping
 * frames).  The render callback is stored in a ref and updated synchronously
 * each render so the loop never holds a stale closure.
 *
 * @param options - Canvas configuration passed through from `Particles`.
 * @returns Refs to attach to the container div and canvas element.
 */
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
    state,
  });

  // Store the latest renderFrame in a ref so the rAF loop never holds a stale
  // closure — mirrors the onFrameRef pattern used in Librerss.
  const renderFrameRef = useRef(animator.renderFrame);
  renderFrameRef.current = animator.renderFrame; // sync update every render

  useParticleAnimationLoop({
    isMountedRef: state.isMounted,
    renderFrameRef,
  });

  return {
    canvasContainerRef: state.canvasContainerRef,
    canvasRef: state.canvasRef,
    initCanvas: animator.initCanvas,
  };
}

/**
 * Runs the particle animation loop while the canvas is mounted and the tab is visible.
 * @param options - The refs needed to schedule and render particle frames.
 */
function useParticleAnimationLoop(options: ParticleAnimationLoopOptions) {
  const { isMountedRef, renderFrameRef } = options;

  useEffect(() => {
    let animationFrameId: null | number = null;
    let lastFrameAt = 0;

    /**
     * Check whether the animation loop should currently be running.
     * Respects tab visibility only — reduced-motion is intentionally ignored
     * because these are non-functional ambient particles, not UI animations.
     * @returns `true` when the loop should be running.
     */
    const shouldRun = () => document.visibilityState !== "hidden";

    /**
     * Main animation tick — called via `requestAnimationFrame`.
     * Throttles to {@link TARGET_FRAME_MS} so the loop stays cheap.
     * @param now - The timestamp provided by `requestAnimationFrame` in ms.
     */
    const tick = (now: number) => {
      animationFrameId = null;

      if (!isMountedRef.current || !shouldRun()) {
        return;
      }

      const elapsed = lastFrameAt === 0 ? 0 : now - lastFrameAt;

      if (lastFrameAt === 0 || elapsed >= TARGET_FRAME_MS) {
        lastFrameAt = now;
        renderFrameRef.current(now);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    /** Start (or restart) the loop. */
    const start = () => {
      if (animationFrameId !== null || !shouldRun()) return;
      lastFrameAt = 0;
      animationFrameId = requestAnimationFrame(tick);
    };

    /** Pause the loop when the tab is hidden, resume when visible again. */
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
          lastFrameAt = 0;
        }
        return;
      }

      start();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    start();

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isMountedRef, renderFrameRef]);
}
