"use client";

import { useCallback, useEffect } from "react";

import type { ParticleState } from "@/ui/particles/particleTypes";

import {
  cancelScheduledFrame,
  getClampedDevicePixelRatio,
  syncMousePosition,
} from "@/ui/particles/particleCanvasRuntime";

const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

export function useParticleLifecycle(options: {
  initCanvas: () => void;
  interactive: boolean;
  scheduleNextFrame: () => void;
  shouldAnimate: () => boolean;
  state: ParticleState;
}) {
  const { initCanvas, interactive, scheduleNextFrame, shouldAnimate, state } =
    options;
  const handlePointerMove = useCallback((pointerEvent: PointerEvent) => {
    syncMousePosition({
      canvas: state.canvasRef.current,
      canvasSize: state.canvasSize.current,
      mouse: state.mouse.current,
      pointerEvent,
    });
  }, [state.canvasRef, state.canvasSize, state.mouse]);

  useEffect(() => {
    const canvas = state.canvasRef.current;
    const container = state.canvasContainerRef.current;

    if (!canvas || !container) {
      return;
    }

    state.context.current = canvas.getContext("2d") ?? null;
    state.isMounted.current = true;
    state.dprRef.current = getClampedDevicePixelRatio();
    state.isPageVisibleRef.current = document.visibilityState === "visible";

    const mediaQuery = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY);
    const handlers = createLifecycleHandlers({
      initCanvas,
      mediaQuery,
      scheduleNextFrame,
      shouldAnimate,
      state,
    });

    state.resizeObserverRef.current = new ResizeObserver(handlers.handleResize);
    state.resizeObserverRef.current.observe(container);
    registerInteractiveEvents(interactive, handlePointerMove, handlers.handlePointerLeave);
    document.addEventListener("visibilitychange", handlers.handleVisibilityChange);
    mediaQuery.addEventListener("change", handlers.syncMotionPreference);
    handlers.syncMotionPreference();

    return () => {
      state.isMounted.current = false;
      cancelScheduledFrame(state.animationFrameIdRef);
      state.resizeObserverRef.current?.disconnect();
      state.resizeObserverRef.current = null;
      unregisterInteractiveEvents(interactive, handlePointerMove, handlers.handlePointerLeave);
      document.removeEventListener("visibilitychange", handlers.handleVisibilityChange);
      mediaQuery.removeEventListener("change", handlers.syncMotionPreference);
    };
  }, [handlePointerMove, initCanvas, interactive, scheduleNextFrame, shouldAnimate, state]);
}

function createLifecycleHandlers(options: {
  initCanvas: () => void;
  mediaQuery: MediaQueryList;
  scheduleNextFrame: () => void;
  shouldAnimate: () => boolean;
  state: ParticleState;
}) {
  const { initCanvas, mediaQuery, scheduleNextFrame, shouldAnimate, state } =
    options;
  const syncScheduler = () => {
    if (shouldAnimate()) {
      scheduleNextFrame();
      return;
    }

    cancelScheduledFrame(state.animationFrameIdRef);
  };

  return {
    handlePointerLeave: () => {
      state.mouse.current.x = 0;
      state.mouse.current.y = 0;
    },
    handleResize: () => {
      state.dprRef.current = getClampedDevicePixelRatio();
      initCanvas();
      syncScheduler();
    },
    handleVisibilityChange: () => {
      state.isPageVisibleRef.current = document.visibilityState === "visible";
      syncScheduler();
    },
    syncMotionPreference: () => {
      state.prefersReducedMotionRef.current = mediaQuery.matches;
      initCanvas();
      syncScheduler();
    },
  };
}

function registerInteractiveEvents(
  interactive: boolean,
  handlePointerMove: (pointerEvent: PointerEvent) => void,
  handlePointerLeave: () => void,
) {
  if (!interactive) {
    return;
  }

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerleave", handlePointerLeave, { passive: true });
}

function unregisterInteractiveEvents(
  interactive: boolean,
  handlePointerMove: (pointerEvent: PointerEvent) => void,
  handlePointerLeave: () => void,
) {
  if (!interactive) {
    return;
  }

  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerleave", handlePointerLeave);
}