/**
 * Logical canvas dimensions used by the particle engine before DPR scaling.
 */
export interface CanvasSize {
  h: number;
  w: number;
}

/**
 * Mutable particle record tracked by the animation engine for each rendered dot.
 */
export interface Circle {
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

/**
 * Pointer position sampled relative to the canvas for magnetic particle motion.
 */
export interface MouseVector {
  x: number;
  y: number;
}

/**
 * Shared refs that hold the live particle runtime state across the animation,
 * lifecycle, and rendering hooks.
 */
export interface ParticleState {
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasSize: React.RefObject<CanvasSize>;
  circles: React.RefObject<Circle[]>;
  context: React.RefObject<CanvasRenderingContext2D | null>;
  dprRef: React.RefObject<number>;
  /** Cleared on component unmount to guard the animation callback. */
  isMounted: React.RefObject<boolean>;
  mouse: React.RefObject<MouseVector>;
}

/**
 * Public configuration accepted by `useParticleCanvas` from the `Particles` component.
 */
export interface UseParticleCanvasOptions {
  ease: number;
  interactive: boolean;
  quantity: number;
  staticity: number;
}
