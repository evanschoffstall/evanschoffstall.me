import type { CanvasSize, Circle, MouseVector } from "@/ui/particles/particleTypes";

const MAX_DEVICE_PIXEL_RATIO = 2;

export function cancelScheduledFrame(
  animationFrameIdRef: React.RefObject<null | number>,
): void {
  if (animationFrameIdRef.current === null) {
    return;
  }

  cancelAnimationFrame(animationFrameIdRef.current);
  animationFrameIdRef.current = null;
}

export function clearContext(
  drawingContext: CanvasRenderingContext2D | null,
  canvasSize: CanvasSize,
): void {
  drawingContext?.clearRect(0, 0, canvasSize.w, canvasSize.h);
}

export function createCircle(canvasSize: CanvasSize): Circle {
  return {
    alpha: 0,
    dx: (Math.random() - 0.5) * 0.2,
    dy: (Math.random() - 0.5) * 0.2,
    magnetism: 0.1 + Math.random() * 4,
    size: Math.floor(Math.random() * 2) + 0.1,
    targetAlpha: Number.parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
    translateX: 0,
    translateY: 0,
    x: Math.floor(Math.random() * canvasSize.w),
    y: Math.floor(Math.random() * canvasSize.h),
  };
}

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

export function getClampedDevicePixelRatio(): number {
  if (typeof window === "undefined") {
    return 1;
  }

  return Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
}

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

export function resizeCanvas(options: {
  canvas: HTMLCanvasElement | null;
  canvasSize: CanvasSize;
  circles: Circle[];
  container: HTMLDivElement | null;
  dpr: number;
  drawingContext: CanvasRenderingContext2D | null;
}): void {
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

export function syncMousePosition(options: {
  canvas: HTMLCanvasElement | null;
  canvasSize: CanvasSize;
  mouse: MouseVector;
  pointerEvent: PointerEvent;
}): void {
  const { canvas, canvasSize, mouse, pointerEvent } = options;

  if (!canvas) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const x = pointerEvent.clientX - rect.left - canvasSize.w / 2;
  const y = pointerEvent.clientY - rect.top - canvasSize.h / 2;
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

export function updateCircleAlpha(circle: Circle, canvasSize: CanvasSize): void {
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

  if (edgeOpacity > 1) {
    circle.alpha = Math.min(circle.alpha + 0.02, circle.targetAlpha);
    return;
  }

  circle.alpha = circle.targetAlpha * edgeOpacity;
}

export function updateCircleMotion(options: {
  circle: Circle;
  ease: number;
  mouse: MouseVector;
  staticity: number;
}): void {
  const { circle, ease, mouse, staticity } = options;

  circle.x += circle.dx;
  circle.y += circle.dy;
  circle.translateX +=
    (mouse.x / (staticity / circle.magnetism) - circle.translateX) / ease;
  circle.translateY +=
    (mouse.y / (staticity / circle.magnetism) - circle.translateY) / ease;
}

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