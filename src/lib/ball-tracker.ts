// Core ball tracking engine using HSV color segmentation
// Runs entirely in the browser - no server communication

import {
  CalibrationData,
  TrackingConfig,
  TrackingState,
  TrackingPoint,
  Point2D,
  DEFAULT_TRACKING_CONFIG,
} from './tracking';

export class BallTracker {
  private config: TrackingConfig;
  private calibration: CalibrationData | null = null;
  private canvas: OffscreenCanvas | HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private prevPosition: TrackingPoint | null = null;
  private smoothedPosition: TrackingPoint | null = null;
  private lostFrameCount = 0;
  private frameCount = 0;
  private lastFpsTime = 0;
  private currentFps = 0;
  private perspectiveMatrix: number[] | null = null;

  // Debug overlay
  private debugCanvas: HTMLCanvasElement | null = null;
  private debugCtx: CanvasRenderingContext2D | null = null;

  constructor(config: Partial<TrackingConfig> = {}) {
    this.config = { ...DEFAULT_TRACKING_CONFIG, ...config };
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Cannot create 2D context');
    this.ctx = ctx;
  }

  setCalibration(cal: CalibrationData) {
    this.calibration = cal;
    this.perspectiveMatrix = this.computePerspectiveMatrix(cal.corners);
  }

  setDebugCanvas(canvas: HTMLCanvasElement | null) {
    this.debugCanvas = canvas;
    this.debugCtx = canvas ? canvas.getContext('2d') : null;
  }

  getState(): TrackingState {
    const isPaused = this.lostFrameCount > this.config.lostThreshold;
    let quality: 'good' | 'fair' | 'lost' = 'good';
    if (this.lostFrameCount > this.config.lostThreshold) quality = 'lost';
    else if (this.lostFrameCount > 5) quality = 'fair';

    return {
      position: this.prevPosition,
      isTracking: this.prevPosition !== null && !isPaused,
      isPaused,
      quality,
      smoothedPosition: this.smoothedPosition,
      fps: this.currentFps,
    };
  }

  /**
   * Process a video frame and return tracking result.
   * Call this on every animation frame.
   */
  processFrame(video: HTMLVideoElement): TrackingPoint | null {
    if (!this.calibration) return null;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (w === 0 || h === 0) return null;

    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx.drawImage(video, 0, 0, w, h);

    const imageData = this.ctx.getImageData(0, 0, w, h);
    const detected = this.detectBall(imageData, w, h);

    // FPS calculation
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsTime > 1000) {
      this.currentFps = Math.round(
        (this.frameCount * 1000) / (now - this.lastFpsTime)
      );
      this.frameCount = 0;
      this.lastFpsTime = now;
    }

    if (detected) {
      // Check for jump (might be different object)
      if (
        this.prevPosition &&
        this.lostFrameCount < 3
      ) {
        const dist = Math.hypot(
          detected.x - this.prevPosition.x,
          detected.y - this.prevPosition.y
        );
        if (dist > this.config.maxJumpDistance) {
          // Likely a different object, ignore this frame
          this.lostFrameCount++;
          return this.smoothedPosition;
        }
      }

      this.lostFrameCount = 0;

      // Smooth position
      if (this.smoothedPosition) {
        const s = this.config.smoothing;
        this.smoothedPosition = {
          x: this.smoothedPosition.x * s + detected.x * (1 - s),
          y: this.smoothedPosition.y * s + detected.y * (1 - s),
          timestamp: detected.timestamp,
          confidence: detected.confidence,
        };
      } else {
        this.smoothedPosition = { ...detected };
      }

      this.prevPosition = detected;
      return this.smoothedPosition;
    } else {
      this.lostFrameCount++;

      // Short occlusion: hold last position
      if (this.lostFrameCount <= this.config.lostThreshold) {
        return this.smoothedPosition;
      }

      // Long loss: return null
      return null;
    }
  }

  /**
   * Detect ball in image using HSV color segmentation
   */
  private detectBall(
    imageData: ImageData,
    w: number,
    h: number
  ): TrackingPoint | null {
    if (!this.calibration) return null;

    const [hCenter, sCenter, vCenter] = this.calibration.hsvCenter;
    const [hTol, sTol, vTol] = this.calibration.hsvTolerance;
    const data = imageData.data;

    // Find all matching pixels
    let sumX = 0,
      sumY = 0,
      count = 0;
    let minX = w,
      minY = h,
      maxX = 0,
      maxY = 0;

    // Debug overlay
    let debugData: Uint8ClampedArray | null = null;
    if (this.debugCtx && this.debugCanvas) {
      this.debugCanvas.width = w;
      this.debugCanvas.height = h;
      this.debugCtx.drawImage(this.canvas as HTMLCanvasElement, 0, 0);
      const debugImageData = this.debugCtx.getImageData(0, 0, w, h);
      debugData = debugImageData.data;
    }

    // Process every 2nd pixel for performance
    const step = 2;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = (y * w + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const [hue, sat, val] = rgbToHsv(r, g, b);

        // Check if pixel matches target color
        let hDiff = Math.abs(hue - hCenter);
        if (hDiff > 180) hDiff = 360 - hDiff; // Wrap around

        if (hDiff <= hTol && Math.abs(sat - sCenter) <= sTol && Math.abs(val - vCenter) <= vTol) {
          sumX += x;
          sumY += y;
          count++;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;

          // Mark detected pixels in debug view
          if (debugData) {
            debugData[i] = 0;
            debugData[i + 1] = 255;
            debugData[i + 2] = 0;
            debugData[i + 3] = 180;
          }
        }
      }
    }

    if (debugData && this.debugCtx && this.debugCanvas) {
      const debugImageData = this.debugCtx.createImageData(w, h);
      debugImageData.data.set(debugData);
      this.debugCtx.putImageData(debugImageData, 0, 0);
    }

    // Scale count for step size
    const effectiveCount = count * step * step;

    if (
      effectiveCount < this.config.minBlobArea ||
      effectiveCount > this.config.maxBlobArea
    ) {
      return null;
    }

    // Check blob shape (roughly circular - aspect ratio)
    const blobW = maxX - minX;
    const blobH = maxY - minY;
    if (blobW > 0 && blobH > 0) {
      const aspect = Math.max(blobW, blobH) / Math.min(blobW, blobH);
      if (aspect > 4) return null; // Too elongated, probably not a ball
    }

    // Centroid in pixel coords
    const cx = sumX / count;
    const cy = sumY / count;

    // Apply perspective correction and normalize
    const normalized = this.pixelToNormalized(cx, cy);
    if (!normalized) return null;

    // Apply mirror if needed
    let nx = normalized.x;
    if (this.calibration.mirrorX) {
      nx = 1 - nx;
    }

    // Confidence based on blob size and shape
    const idealArea = (this.config.minBlobArea + this.config.maxBlobArea) / 4;
    const areaDiff = Math.abs(effectiveCount - idealArea) / idealArea;
    const confidence = Math.max(0, Math.min(1, 1 - areaDiff * 0.5));

    return {
      x: Math.max(0, Math.min(1, nx)),
      y: Math.max(0, Math.min(1, normalized.y)),
      timestamp: performance.now(),
      confidence,
    };
  }

  /**
   * Convert pixel coordinates to normalized training area coordinates
   * using perspective transform from calibrated corners
   */
  private pixelToNormalized(px: number, py: number): Point2D | null {
    if (!this.perspectiveMatrix) {
      // Fallback: simple bounding box normalization
      if (!this.calibration) return null;
      const corners = this.calibration.corners;
      const minX = Math.min(...corners.map((c) => c.x));
      const maxX = Math.max(...corners.map((c) => c.x));
      const minY = Math.min(...corners.map((c) => c.y));
      const maxY = Math.max(...corners.map((c) => c.y));
      return {
        x: (px - minX) / (maxX - minX),
        y: (py - minY) / (maxY - minY),
      };
    }

    const m = this.perspectiveMatrix;
    const denom = m[6] * px + m[7] * py + 1;
    if (Math.abs(denom) < 1e-10) return null;

    return {
      x: (m[0] * px + m[1] * py + m[2]) / denom,
      y: (m[3] * px + m[4] * py + m[5]) / denom,
    };
  }

  /**
   * Compute perspective transform matrix from 4 corner points
   * Maps corner points to unit square [0,1]x[0,1]
   */
  private computePerspectiveMatrix(
    corners: [Point2D, Point2D, Point2D, Point2D]
  ): number[] {
    // Source points (pixel coords of corners)
    const [tl, tr, br, bl] = corners;
    // Destination: unit square
    // TL -> (0,0), TR -> (1,0), BR -> (1,1), BL -> (0,1)

    // Solve using a simple 8-parameter perspective transform
    // Using direct linear transform (DLT)
    const srcPts = [tl.x, tl.y, tr.x, tr.y, br.x, br.y, bl.x, bl.y];
    const dstPts = [0, 0, 1, 0, 1, 1, 0, 1];

    return solvePerspective(srcPts, dstPts);
  }

  /**
   * Sample color at a pixel position from the current frame
   */
  sampleColor(video: HTMLVideoElement, x: number, y: number): [number, number, number] {
    const w = video.videoWidth;
    const h = video.videoHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx.drawImage(video, 0, 0);

    // Sample a small area around the click point for robustness
    const radius = 5;
    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    const imageData = this.ctx.getImageData(
      Math.max(0, Math.floor(x) - radius),
      Math.max(0, Math.floor(y) - radius),
      radius * 2 + 1,
      radius * 2 + 1
    );

    for (let i = 0; i < imageData.data.length; i += 4) {
      rSum += imageData.data[i];
      gSum += imageData.data[i + 1];
      bSum += imageData.data[i + 2];
      count++;
    }

    const r = Math.round(rSum / count);
    const g = Math.round(gSum / count);
    const b = Math.round(bSum / count);

    return rgbToHsv(r, g, b);
  }

  /**
   * Get detection mask for calibration preview
   */
  getDetectionPreview(
    video: HTMLVideoElement,
    hsvCenter: [number, number, number],
    hsvTolerance: [number, number, number]
  ): { count: number; mask: ImageData } {
    const w = video.videoWidth;
    const h = video.videoHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx.drawImage(video, 0, 0);

    const imageData = this.ctx.getImageData(0, 0, w, h);
    const maskData = new ImageData(w, h);
    const data = imageData.data;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      const [hue, sat, val] = rgbToHsv(data[i], data[i + 1], data[i + 2]);

      let hDiff = Math.abs(hue - hsvCenter[0]);
      if (hDiff > 180) hDiff = 360 - hDiff;

      if (
        hDiff <= hsvTolerance[0] &&
        Math.abs(sat - hsvCenter[1]) <= hsvTolerance[1] &&
        Math.abs(val - hsvCenter[2]) <= hsvTolerance[2]
      ) {
        maskData.data[i] = 0;
        maskData.data[i + 1] = 255;
        maskData.data[i + 2] = 0;
        maskData.data[i + 3] = 160;
        count++;
      } else {
        maskData.data[i + 3] = 0;
      }
    }

    return { count, mask: maskData };
  }

  reset() {
    this.prevPosition = null;
    this.smoothedPosition = null;
    this.lostFrameCount = 0;
  }
}

// ---- Utility functions ----

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;

  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return [Math.round(h), Math.round(s), Math.round(v)];
}

/**
 * Solve 8-parameter perspective transform
 * Maps 4 source points to 4 destination points
 */
function solvePerspective(src: number[], dst: number[]): number[] {
  // Build 8x8 system of equations
  const A: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < 4; i++) {
    const sx = src[i * 2];
    const sy = src[i * 2 + 1];
    const dx = dst[i * 2];
    const dy = dst[i * 2 + 1];

    A.push([sx, sy, 1, 0, 0, 0, -sx * dx, -sy * dx]);
    b.push(dx);
    A.push([0, 0, 0, sx, sy, 1, -sx * dy, -sy * dy]);
    b.push(dy);
  }

  // Solve using Gaussian elimination
  const n = 8;
  const aug: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    // Partial pivoting
    let maxVal = Math.abs(aug[col][col]);
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > maxVal) {
        maxVal = Math.abs(aug[row][col]);
        maxRow = row;
      }
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) {
      // Singular matrix, return identity-like transform
      return [1, 0, 0, 0, 1, 0, 0, 0];
    }

    for (let j = col; j <= n; j++) aug[col][j] /= pivot;

    for (let row = 0; row < n; row++) {
      if (row !== col) {
        const factor = aug[row][col];
        for (let j = col; j <= n; j++) {
          aug[row][j] -= factor * aug[col][j];
        }
      }
    }
  }

  return aug.map((row) => row[n]);
}
