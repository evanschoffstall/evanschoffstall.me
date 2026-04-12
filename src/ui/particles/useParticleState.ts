"use client";

import { useRef } from "react";

import type { Circle, ParticleState } from "@/ui/particles/particleTypes";

export function useParticleState(): ParticleState {
  return {
    animationFrameIdRef: useRef<null | number>(null),
    canvasContainerRef: useRef<HTMLDivElement>(null),
    canvasRef: useRef<HTMLCanvasElement>(null),
    canvasSize: useRef({ h: 0, w: 0 }),
    circles: useRef<Circle[]>([]),
    context: useRef<CanvasRenderingContext2D | null>(null),
    dprRef: useRef(1),
    isMounted: useRef(true),
    isPageVisibleRef: useRef(true),
    mouse: useRef({ x: 0, y: 0 }),
    prefersReducedMotionRef: useRef(false),
    resizeObserverRef: useRef<null | ResizeObserver>(null),
  };
}