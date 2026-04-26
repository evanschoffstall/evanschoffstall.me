export interface CanvasSize {
  h: number;
  w: number;
}

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

export interface MouseVector {
  x: number;
  y: number;
}

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

export interface UseParticleCanvasOptions {
  ease: number;
  interactive: boolean;
  quantity: number;
  staticity: number;
}
