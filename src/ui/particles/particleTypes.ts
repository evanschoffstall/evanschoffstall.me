export interface CanvasSize {
  h: number;
  w: number;
}

export interface Circle {
  alpha: number;
  dx: number;
  dy: number;
  magnetism: number;
  size: number;
  targetAlpha: number;
  translateX: number;
  translateY: number;
  x: number;
  y: number;
}

export interface MouseVector {
  x: number;
  y: number;
}

export interface ParticleState {
  animationFrameIdRef: React.RefObject<null | number>;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasSize: React.RefObject<CanvasSize>;
  circles: React.RefObject<Circle[]>;
  context: React.RefObject<CanvasRenderingContext2D | null>;
  dprRef: React.RefObject<number>;
  isMounted: React.RefObject<boolean>;
  isPageVisibleRef: React.RefObject<boolean>;
  mouse: React.RefObject<MouseVector>;
  prefersReducedMotionRef: React.RefObject<boolean>;
  resizeObserverRef: React.RefObject<null | ResizeObserver>;
}

export interface UseParticleCanvasOptions {
  ease: number;
  interactive: boolean;
  quantity: number;
  staticity: number;
}