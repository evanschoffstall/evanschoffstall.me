import type {
  CanvasSize,
  Circle,
  MouseVector,
} from "@/components/particles/particleTypes";

const MAX_DEVICE_PIXEL_RATIO = 2;

/**
 * Inputs required to resize the particle canvas and reseed particles for the new bounds.
 */
interface ResizeCanvasOptions {
  canvas: HTMLCanvasElement | null;
  canvasSize: CanvasSize;
  circles: Circle[];
  container: HTMLDivElement | null;
  dpr: number;
  drawingContext: CanvasRenderingContext2D | null;
}

/**
 * Inputs required to translate a browser mouse event into canvas-relative coordinates.
 */
interface SyncMousePositionOptions {
  canvas: HTMLCanvasElement | null;
  canvasSize: CanvasSize;
  /** Standard `mousemove` event (or any event with `clientX`/`clientY`). */
  event: MouseEvent;
  mouse: MouseVector;
}

/**
 * Inputs required to advance one particle toward its magnetic target for the current frame.
 */
interface UpdateCircleMotionOptions {
  circle: Circle;
  ease: number;
  mouse: MouseVector;
  staticity: number;
}

/**
 * Clear the entire canvas drawing surface.
 * @param drawingContext - The 2D rendering context to clear.
 * @param canvasSize - The logical dimensions of the canvas.
 */
export function clearContext(
  drawingContext: CanvasRenderingContext2D | null,
  canvasSize: CanvasSize,
): void {
  drawingContext?.clearRect(0, 0, canvasSize.w, canvasSize.h);
}

/**
 * Create a new particle circle at a random position within the canvas.
 * @param canvasSize - The logical dimensions of the canvas used to bound initial placement.
 * @returns A freshly initialised circle with randomised properties.
 */
export function createCircle(canvasSize: CanvasSize): Circle {
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
export function drawCircle(
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
 * Return the device pixel ratio clamped to {@link MAX_DEVICE_PIXEL_RATIO}.
 * @returns The clamped DPR, or `1` in non-browser environments.
 */
export function getClampedDevicePixelRatio(): number {
  if (typeof window === "undefined") {
    return 1;
  }

  return Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
}

/**
 * Return whether a circle has drifted outside the visible canvas area.
 * @param circle - The particle circle to test.
 * @param canvasSize - The logical dimensions of the canvas.
 * @returns `true` if the circle centre is beyond any edge by more than its radius.
 */
export function isCircleOutOfBounds(
  circle: Circle,
  canvasSize: CanvasSize,
): boolean {
  return (
    circle.x < -circle.size ||
    circle.x > canvasSize.w + circle.size ||
    circle.y < -circle.size ||
    circle.y > canvasSize.h + circle.size
  );
}

/**
 * Resize the canvas to match its container and reset the transform to DPR scale.
 * Clears the circles array so the caller can re-seed after resizing.
 * @param options - Resize parameters including refs to the canvas, container, and current state.
 */
export function resizeCanvas(options: ResizeCanvasOptions): void {
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
 * Ignores events where the pointer is outside the canvas bounds.
 * @param options - Options containing the canvas ref, size, event, and mouse vector to update.
 */
export function syncMousePosition(options: SyncMousePositionOptions): void {
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
 * Update `circle.alpha` toward the effective target, which oscillates gently
 * around `targetAlpha` to produce a twinkling effect.  Edge-proximity fading
 * is applied on top so particles soften as they approach canvas boundaries.
 *
 * @param circle  - The particle circle to update.
 * @param canvasSize - Current canvas logical dimensions.
 * @param elapsed - Seconds elapsed since the animation started (used for
 *   the twinkling sine wave so all particles twinkle independently).
 */
export function updateCircleAlpha(
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

  // Gentle twinkle: target alpha oscillates ±8% around the base value so the
  // field looks alive even when particles are drifting slowly.
  const twinkle = Math.sin(elapsed * circle.sway + circle.alphaPhase) * 0.08;
  const effectiveTarget = Math.max(
    0.02,
    Math.min(1, circle.targetAlpha + twinkle),
  );

  if (edgeOpacity > 1) {
    // Outside the edge-fade zone: lerp toward the twinkling target.
    circle.alpha = Math.min(circle.alpha + 0.02, effectiveTarget);
    return;
  }

  circle.alpha = effectiveTarget * edgeOpacity;
}

/**
 * Apply eased mouse-driven translation to a circle each frame.
 * @param options - Motion parameters including the circle, ease/staticity factors, and current mouse offset.
 */
export function updateCircleMotion(options: UpdateCircleMotionOptions): void {
  const { circle, ease, mouse, staticity } = options;

  circle.x += circle.dx;
  circle.y += circle.dy;
  circle.translateX +=
    (mouse.x / (staticity / circle.magnetism) - circle.translateX) / ease;
  circle.translateY +=
    (mouse.y / (staticity / circle.magnetism) - circle.translateY) / ease;
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
