"use client";

import { useRef } from "react";

import type {
  Circle,
  ParticleState,
} from "@/components/particles/particleTypes";

/**
 * Create and return a stable `ParticleState` container.
 *
 * Every individual ref inside the object is created once by React and is
 * stable across renders.  The container object itself is also held in a ref
 * so its identity never changes — this prevents the `useParticleLifecycle`
 * effect from re-running on every parent render.
 * @returns The stable particle state container.
 */
export function useParticleState(): ParticleState {
  // Individual refs — React guarantees these are the same object across renders.
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasSize = useRef({ h: 0, w: 0 });
  const circles = useRef<Circle[]>([]);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const dprRef = useRef(1);
  const isMounted = useRef(true);
  const mouse = useRef({ x: 0, y: 0 });

  // Stable wrapper so callers that put `state` in a dep array see a constant
  // object reference rather than a new one on every render.
  const containerRef = useRef({
    canvasContainerRef,
    canvasRef,
    canvasSize,
    circles,
    context,
    dprRef,
    isMounted,
    mouse,
  });

  return containerRef.current;
}
