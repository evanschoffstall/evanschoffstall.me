"use client";

import { type RefObject, useCallback, useEffect, useRef } from "react";

const MAX_DEVICE_PIXEL_RATIO = 2;

/** Target frame interval — throttle to 30 fps so the loop stays inexpensive. */
const TARGET_FRAME_MS = 1000 / 30;

/** Logical canvas dimensions used by the particle engine before DPR scaling. */
interface CanvasSize {
  h: number;
  w: number;
}

/** Mutable particle record tracked by the animation engine for each rendered dot. */
interface Circle {
  alpha: number;
  /** Random phase offset (radians) so each particle twinkles out of sync. */
  alphaPhase: number;
  dx: number;
  dy: number;
  magnetism: number;
  size: number;
  /** Oscillation rate (rad/s) controlling the twinkling speed. */
  sway: number;
  targetAlpha: number;
  translateX: number;
  translateY: number;
  x: number;
  y: number;
}

/** Pointer position sampled relative to the canvas for magnetic particle motion. */
interface MouseVector {
  x: number;
  y: number;
}

/**
 * Refs required by the raw requestAnimationFrame loop that drives particle rendering.
 */
interface ParticleAnimationLoopOptions {
  isMountedRef: RefObject<boolean>;
  renderFrameRef: RefObject<(time: number) => void>;
}

/** Shared refs that hold the live particle runtime state across the hook helpers. */
interface ParticleState {
  canvasContainerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasSize: RefObject<CanvasSize>;
  circles: RefObject<Circle[]>;
  context: RefObject<CanvasRenderingContext2D | null>;
  dprRef: RefObject<number>;
  /** Cleared on component unmount to guard the animation callback. */
  isMounted: RefObject<boolean>;
  mouse: RefObject<MouseVector>;
}

/** Inputs required to resize the particle canvas and reseed particles for the new bounds. */
interface ResizeCanvasOptions {
  canvas: HTMLCanvasElement | null;
  canvasSize: CanvasSize;
  circles: Circle[];
  container: HTMLDivElement | null;
  dpr: number;
  drawingContext: CanvasRenderingContext2D | null;
}

/** Inputs required to translate a browser mouse event into canvas-relative coordinates. */
interface SyncMousePositionOptions {
  canvas: HTMLCanvasElement | null;
  canvasSize: CanvasSize;
  /** Standard `mousemove` event (or any event with `clientX`/`clientY`). */
  event: MouseEvent;
  mouse: MouseVector;
}

/** Inputs required to advance one particle toward its magnetic target for the current frame. */
interface UpdateCircleMotionOptions {
  circle: Circle;
  ease: number;
  mouse: MouseVector;
  staticity: number;
}

/** Runtime knobs and shared refs needed to seed and animate the particle canvas. */
interface UseParticleAnimatorOptions {
  ease: number;
  quantity: number;
  state: ParticleState;
  staticity: number;
}

/** Public configuration accepted by `useParticleCanvas` from the `Particles` component. */
interface UseParticleCanvasOptions {
  ease: number;
  interactive: boolean;
  quantity: number;
  staticity: number;
}

/** Canvas lifecycle inputs used to bind DOM events and initialize the particle runtime. */
interface UseParticleLifecycleOptions {
  initCanvas: () => void;
  interactive: boolean;
  state: ParticleState;
}

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
 * Create a new particle circle at a random position within the canvas.
 * @param canvasSize - The logical dimensions of the canvas used to bound initial placement.
 * @returns A freshly initialised circle with randomised properties.
 */
function createCircle(canvasSize: CanvasSize): Circle {
  return {
    alpha: 0,
    alphaPhase: Math.random() * Math.PI * 2,
    dx: (Math.random() - 0.5) * 0.2,
    dy: (Math.random() - 0.5) * 0.2,
    magnetism: 0.1 + Math.random() * 4,
    size: Math.floor(Math.random() * 2) + 0.1,
    sway: Math.random() * 3.8 + 0.2,
    targetAlpha: Number.parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
    translateX: 0,
    translateY: 0,
    x: Math.floor(Math.random() * canvasSize.w),
    y: Math.floor(Math.random() * canvasSize.h),
  };
}

/**
 * Draw a single particle circle onto the canvas at its current position and alpha.
 * @param drawingContext - The 2D rendering context to draw into.
 * @param circle - The particle circle to render.
 * @param dpr - Device pixel ratio used to reset the canvas transform after drawing.
 */
function drawCircle(
  drawingContext: CanvasRenderingContext2D | null,
  circle: Circle,
  dpr: number,
): void {
  if (!drawingContext) {
    return;
  }

  drawingContext.translate(circle.translateX, circle.translateY);
  drawingContext.beginPath();
  drawingContext.arc(circle.x, circle.y, circle.size, 0, 2 * Math.PI);
  drawingContext.fillStyle = `rgba(255, 255, 255, ${circle.alpha})`;
  drawingContext.fill();
  drawingContext.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/**
 * Return whether a circle has drifted outside the visible canvas area.
 * @param circle - The particle circle to test.
 * @param canvasSize - The logical dimensions of the canvas.
 * @returns `true` if the circle centre is beyond any edge by more than its radius.
 */
function isCircleOutOfBounds(circle: Circle, canvasSize: CanvasSize): boolean {
  return (
    circle.x < -circle.size ||
    circle.x > canvasSize.w + circle.size ||
    circle.y < -circle.size ||
    circle.y > canvasSize.h + circle.size
  );
}

/**
 * Re-map a value from one numeric range to another, clamped to a minimum of 0.
 * @param value - The input value to remap.
 * @param start1 - The lower bound of the input range.
 * @param end1 - The upper bound of the input range.
 * @param start2 - The lower bound of the output range.
 * @param end2 - The upper bound of the output range.
 * @returns The remapped value, minimum 0.
 */
function remapValue(
  value: number,
  start1: number,
  end1: number,
  start2: number,
  end2: number,
): number {
  const remapped =
    ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;

  return remapped > 0 ? remapped : 0;
}

/**
 * Resize the canvas to match its container and reset the transform to DPR scale.
 * @param options - Resize parameters including refs to the canvas, container, and current state.
 */
function resizeCanvas(options: ResizeCanvasOptions): void {
  const { canvas, canvasSize, circles, container, dpr, drawingContext } =
    options;

  if (!container || !canvas || !drawingContext) {
    return;
  }

  circles.length = 0;
  canvasSize.w = container.offsetWidth;
  canvasSize.h = container.offsetHeight;
  canvas.width = canvasSize.w * dpr;
  canvas.height = canvasSize.h * dpr;
  canvas.style.width = `${canvasSize.w}px`;
  canvas.style.height = `${canvasSize.h}px`;
  drawingContext.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/**
 * Update the shared mouse vector from a `mousemove` event.
 * @param options - Options containing the canvas ref, size, event, and mouse vector to update.
 */
function syncMousePosition(options: SyncMousePositionOptions): void {
  const { canvas, canvasSize, event, mouse } = options;

  if (!canvas) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left - canvasSize.w / 2;
  const y = event.clientY - rect.top - canvasSize.h / 2;
  const isInsideBounds =
    x < canvasSize.w / 2 &&
    x > -canvasSize.w / 2 &&
    y < canvasSize.h / 2 &&
    y > -canvasSize.h / 2;

  if (!isInsideBounds) {
    return;
  }

  mouse.x = x;
  mouse.y = y;
}

/**
 * Update `circle.alpha` toward the effective target and apply edge fading.
 * @param circle - The particle circle to update.
 * @param canvasSize - Current canvas logical dimensions.
 * @param elapsed - Seconds elapsed since animation start.
 */
function updateCircleAlpha(
  circle: Circle,
  canvasSize: CanvasSize,
  elapsed: number,
): void {
  const closestHorizontalEdge = Math.min(
    circle.x + circle.translateX - circle.size,
    canvasSize.w - circle.x - circle.translateX - circle.size,
  );
  const closestVerticalEdge = Math.min(
    circle.y + circle.translateY - circle.size,
    canvasSize.h - circle.y - circle.translateY - circle.size,
  );
  const closestEdge = Math.min(closestHorizontalEdge, closestVerticalEdge);
  const edgeOpacity = Number.parseFloat(
    remapValue(closestEdge, 0, 20, 0, 1).toFixed(2),
  );
  const twinkle = Math.sin(elapsed * circle.sway + circle.alphaPhase) * 0.08;
  const effectiveTarget = Math.max(
    0.02,
    Math.min(1, circle.targetAlpha + twinkle),
  );

  if (edgeOpacity > 1) {
    circle.alpha = Math.min(circle.alpha + 0.02, effectiveTarget);
    return;
  }

  circle.alpha = effectiveTarget * edgeOpacity;
}

/**
 * Apply eased mouse-driven translation to a circle each frame.
 * @param options - Motion parameters including the circle, ease/staticity factors, and current mouse offset.
 */
function updateCircleMotion(options: UpdateCircleMotionOptions): void {
  const { circle, ease, mouse, staticity } = options;

  circle.x += circle.dx;
  circle.y += circle.dy;
  circle.translateX +=
    (mouse.x / (staticity / circle.magnetism) - circle.translateX) / ease;
  circle.translateY +=
    (mouse.y / (staticity / circle.magnetism) - circle.translateY) / ease;
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

/**
 * Manage the canvas animation: exposes `initCanvas` to size/seed the canvas
 * and `renderFrame` to be called by the animation loop each tick.
 * @param options - Animator configuration including ease, quantity, state, and staticity.
 * @returns The `initCanvas` and `renderFrame` callbacks.
 */
function useParticleAnimator(options: UseParticleAnimatorOptions) {
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
      const elapsed = time / 1000;
      state.context.current?.clearRect(
        0,
        0,
        state.canvasSize.current.w,
        state.canvasSize.current.h,
      );

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
 * Wire the canvas to the DOM and update shared mouse-offset refs for parallax.
 * @param options - Lifecycle options: canvas init callback, interactivity flag, and shared state.
 */
function useParticleLifecycle(options: UseParticleLifecycleOptions) {
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
    state.dprRef.current = Math.min(
      window.devicePixelRatio || 1,
      MAX_DEVICE_PIXEL_RATIO,
    );
    initCanvas();

    /** Re-initialise the canvas when the container is resized. */
    const handleResize = () => {
      state.dprRef.current = Math.min(
        window.devicePixelRatio || 1,
        MAX_DEVICE_PIXEL_RATIO,
      );
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

/**
 * Seed the canvas with a fresh set of `quantity` circles, each starting at alpha 0.
 * @param state - Shared particle state refs.
 * @param quantity - How many circles to create.
 * @returns A stable `useCallback` that re-seeds the canvas.
 */
function useParticleSeeder(state: ParticleState, quantity: number) {
  return useCallback(() => {
    state.context.current?.clearRect(
      0,
      0,
      state.canvasSize.current.w,
      state.canvasSize.current.h,
    );
    state.circles.current = Array.from({ length: quantity }, () =>
      createCircle(state.canvasSize.current),
    );

    for (const circle of state.circles.current) {
      drawCircle(state.context.current, circle, state.dprRef.current);
    }
  }, [quantity, state.canvasSize, state.circles, state.context, state.dprRef]);
}

/**
 * Create and return a stable `ParticleState` container.
 * @returns The stable particle state container.
 */
function useParticleState(): ParticleState {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasSize = useRef({ h: 0, w: 0 });
  const circles = useRef<Circle[]>([]);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const dprRef = useRef(1);
  const isMounted = useRef(true);
  const mouse = useRef({ x: 0, y: 0 });

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
