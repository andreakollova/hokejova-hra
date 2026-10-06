// Ball tracking module - core types and interfaces
// Completely decoupled from games - provides normalized position on training surface

export interface TrackingPoint {
  /** Normalized X position on training surface [0, 1], left to right */
  x: number;
  /** Normalized Y position on training surface [0, 1], top to bottom */
  y: number;
  /** Timestamp in ms (performance.now()) */
  timestamp: number;
  /** Detection confidence [0, 1] */
  confidence: number;
}

export interface TrackingState {
  /** Current position, null if lost */
  position: TrackingPoint | null;
  /** Is tracking active and detecting ball */
  isTracking: boolean;
  /** Is tracking paused due to lost ball */
  isPaused: boolean;
  /** Quality indicator: 'good' | 'fair' | 'lost' */
  quality: 'good' | 'fair' | 'lost';
  /** Smoothed position for game use */
  smoothedPosition: TrackingPoint | null;
  /** Frames per second of tracking */
  fps: number;
}

export interface CalibrationData {
  /** HSV color center [H, S, V] */
  hsvCenter: [number, number, number];
  /** HSV tolerance [dH, dS, dV] */
  hsvTolerance: [number, number, number];
  /** Four corners of training area in camera pixel coords */
  corners: [Point2D, Point2D, Point2D, Point2D];
  /** Left/right movement range in normalized coords */
  movementRange: { left: number; right: number };
  /** Whether to mirror left/right */
  mirrorX: boolean;
  /** Camera device ID */
  cameraDeviceId: string;
  /** Camera resolution */
  resolution: { width: number; height: number };
  /** Camera FPS */
  fps: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface TrackingConfig {
  /** Smoothing factor 0-1, higher = more smoothing */
  smoothing: number;
  /** Max distance in normalized coords to consider same ball */
  maxJumpDistance: number;
  /** Frames to wait before declaring ball lost */
  lostThreshold: number;
  /** Min blob area in pixels */
  minBlobArea: number;
  /** Max blob area in pixels */
  maxBlobArea: number;
}

export const DEFAULT_TRACKING_CONFIG: TrackingConfig = {
  smoothing: 0.3,
  maxJumpDistance: 0.15,
  lostThreshold: 15,
  minBlobArea: 100,
  maxBlobArea: 50000,
};

export type InputMode = 'camera' | 'demo';

export interface GameInput {
  /** Normalized X [0, 1] */
  x: number;
  /** Normalized Y [0, 1] */
  y: number;
  /** Confidence / quality */
  confidence: number;
  /** Input mode */
  mode: InputMode;
  /** Is input currently active */
  active: boolean;
}
