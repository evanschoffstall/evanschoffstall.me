"use client";

import { useCallback, useEffect } from "react";

import type { ParticleState } from "@/components/particles/particleTypes";

import {
  getClampedDevicePixelRatio,
  syncMousePosition,
} from "@/components/particles/particleCanvasEngine";

interface UseParticleLifecycleOptions {
  initCanvas: () => void;
  interactive: boolean;
  state: ParticleState;
}

/**
 * Wire the canvas to the DOM: initialise on mount, re-initialise on resize,
 * and update the shared mouse-offset ref on every `mousemove` so the frame
 * renderer can apply magnetic parallax.
 *
 * Animation scheduling is handled externally by a raw `requestAnimationFrame`
 * loop in `useParticleCanvas`; this hook only owns lifecycle and input events.
 * @param options - Lifecycle options: canvas init callback, interactivity flag, and shared state.
 */
export function useParticleLifecycle(options: UseParticleLifecycleOptions) {
  const { initCanvas, interactive, state } = options;

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      syncMousePosition({
        canvas: state.canvasRef.current,
        canvasSize: state.canvasSize.current,
        event,
        mouse: state.mouse.current,
      });
    },
    [state.canvasRef, state.canvasSize, state.mouse],
  );

  useEffect(() => {
    const canvas = state.canvasRef.current;
    const container = state.canvasContainerRef.current;

    if (!canvas || !container) {
      return;
    }

    state.context.current = canvas.getContext("2d") ?? null;
    state.isMounted.current = true;
    state.dprRef.current = getClampedDevicePixelRatio();
    initCanvas();

    /** Re-initialise the canvas when the container is resized. */
    const handleResize = () => {
      state.dprRef.current = getClampedDevicePixelRatio();
      initCanvas();
    };

    window.addEventListener("resize", handleResize);

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    return () => {
      state.isMounted.current = false;
      window.removeEventListener("resize", handleResize);

      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [handleMouseMove, initCanvas, interactive, state]);
}
