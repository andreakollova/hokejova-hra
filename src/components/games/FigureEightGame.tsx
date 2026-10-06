'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { GameInput, InputMode } from '@/lib/tracking';

interface FigureEightProps {
  duration: 30 | 60 | 90;
  inputMode: InputMode;
  getGameInput: () => GameInput;
  onFinish: (result: FigureEightResult) => void;
  onPause: (reason: string) => void;
  isPaused: boolean;
}

export interface FigureEightResult {
  completedEights: number;
  duration: number;
  tempo: number; // eights per minute
  inputMode: InputMode;
  sessionId: string;
}

// Checkpoint zones for figure-8 path
// Path: top of left circle -> bottom -> top of right circle -> bottom -> back to start
const CHECKPOINTS = [
  { x: 0.3, y: 0.25, label: 'LH' },  // Left top
  { x: 0.3, y: 0.75, label: 'LD' },  // Left bottom
  { x: 0.7, y: 0.75, label: 'PD' },  // Right bottom
  { x: 0.7, y: 0.25, label: 'PH' },  // Right top
];

const CHECKPOINT_RADIUS = 0.12;

export default function FigureEightGame({
  duration,
  inputMode,
  getGameInput,
  onFinish,
  onPause,
  isPaused,
}: FigureEightProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    elapsedTime: 0,
    completedEights: 0,
    nextCheckpoint: 0,
    checkpointsHit: 0,
    ballX: 0.5,
    ballY: 0.5,
    finished: false,
    started: false,
    countdown: 3,
  });

  const [hud, setHud] = useState({
    completedEights: 0,
    timeLeft: duration as number,
    countdown: 3,
    tempo: 0,
  });

  const sessionIdRef = useRef(crypto.randomUUID());
  const lastTimeRef = useRef(0);
  const animFrameRef = useRef(0);

  // Scale factor for figure-8 size
  const [scale, setScale] = useState(1.0);

  const getScaledCheckpoint = useCallback(
    (idx: number) => {
      const cp = CHECKPOINTS[idx];
      const cx = 0.5;
      const cy = 0.5;
      return {
        x: cx + (cp.x - cx) * scale,
        y: cy + (cp.y - cy) * scale,
      };
    },
    [scale]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const loop = (timestamp: number) => {
      if (!running) return;

      const delta = lastTimeRef.current
        ? (timestamp - lastTimeRef.current) / 1000
        : 0;
      lastTimeRef.current = timestamp;

      const state = stateRef.current;

      // Countdown
      if (!state.started) {
        state.countdown -= delta;
        if (state.countdown <= 0) {
          state.started = true;
        }
        setHud({
          completedEights: 0,
          timeLeft: duration,
          countdown: Math.ceil(Math.max(0, state.countdown)),
          tempo: 0,
        });
        draw(ctx, canvas, state);
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      if (isPaused) {
        draw(ctx, canvas, state);
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      if (state.finished) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      state.elapsedTime += delta;

      // Get input
      const input = getGameInput();
      if (input.active) {
        state.ballX = input.x;
        state.ballY = input.y;
      }

      // Check if time is up
      if (state.elapsedTime >= duration) {
        state.finished = true;
        const tempo =
          state.elapsedTime > 0
            ? (state.completedEights / state.elapsedTime) * 60
            : 0;
        onFinish({
          completedEights: state.completedEights,
          duration: duration as 30 | 60 | 90,
          tempo: Math.round(tempo * 10) / 10,
          inputMode,
          sessionId: sessionIdRef.current,
        });
        return;
      }

      // Check checkpoint proximity
      const nextCp = getScaledCheckpoint(state.nextCheckpoint);
      const dist = Math.hypot(state.ballX - nextCp.x, state.ballY - nextCp.y);

      if (dist < CHECKPOINT_RADIUS) {
        state.checkpointsHit++;
        state.nextCheckpoint = (state.nextCheckpoint + 1) % CHECKPOINTS.length;

        // Complete eight = all 4 checkpoints in order
        if (state.checkpointsHit > 0 && state.checkpointsHit % CHECKPOINTS.length === 0) {
          state.completedEights++;

          try {
            const audioCtx = new AudioContext();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = 660;
            gain.gain.value = 0.08;
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
            osc.stop(audioCtx.currentTime + 0.2);
          } catch {}
        }
      }

      const timeLeft = Math.max(0, duration - state.elapsedTime);
      const tempo =
        state.elapsedTime > 0
          ? (state.completedEights / state.elapsedTime) * 60
          : 0;

      setHud({
        completedEights: state.completedEights,
        timeLeft,
        countdown: 0,
        tempo: Math.round(tempo * 10) / 10,
      });

      draw(ctx, canvas, state);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    const draw = (
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      state: typeof stateRef.current
    ) => {
      const w = canvas.width;
      const h = canvas.height;

      // Clear
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, w, h);

      // Draw figure-8 path
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);

      // Left circle
      const lcx = getScaledCheckpoint(0);
      const lcy = getScaledCheckpoint(1);
      const leftCenterX = ((lcx.x + lcy.x) / 2) * w;
      const leftCenterY = ((lcx.y + lcy.y) / 2) * h;
      const radiusY = (Math.abs(lcx.y - lcy.y) / 2) * h;
      const radiusX = radiusY * 0.7;

      ctx.beginPath();
      ctx.ellipse(leftCenterX, leftCenterY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Right circle
      const rcx = getScaledCheckpoint(3);
      const rcy = getScaledCheckpoint(2);
      const rightCenterX = ((rcx.x + rcy.x) / 2) * w;
      const rightCenterY = ((rcx.y + rcy.y) / 2) * h;

      ctx.beginPath();
      ctx.ellipse(rightCenterX, rightCenterY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([]);

      // Draw checkpoints
      for (let i = 0; i < CHECKPOINTS.length; i++) {
        const cp = getScaledCheckpoint(i);
        const isNext = i === state.nextCheckpoint;
        const px = cp.x * w;
        const py = cp.y * h;

        ctx.beginPath();
        ctx.arc(px, py, CHECKPOINT_RADIUS * Math.min(w, h), 0, Math.PI * 2);

        if (isNext) {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
          ctx.fill();
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2;
        } else {
          ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';
          ctx.fill();
          ctx.strokeStyle = '#444';
          ctx.lineWidth = 1;
        }
        ctx.stroke();

        // Label
        ctx.fillStyle = isNext ? '#22c55e' : '#555';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(CHECKPOINTS[i].label, px, py - CHECKPOINT_RADIUS * Math.min(w, h) - 5);
      }

      // Draw ball
      const bx = state.ballX * w;
      const by = state.ballY * h;

      ctx.beginPath();
      ctx.arc(bx, by, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ff6b35';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ball glow
      const gradient = ctx.createRadialGradient(bx, by, 0, bx, by, 20);
      gradient.addColorStop(0, 'rgba(255, 107, 53, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 107, 53, 0)');
      ctx.beginPath();
      ctx.arc(bx, by, 20, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    // Set canvas size
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resize();
    window.addEventListener('resize', resize);
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [duration, isPaused, getGameInput, inputMode, onFinish, scale, getScaledCheckpoint]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: '#0a0a1a' }}
      />

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-start max-w-3xl mx-auto">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="text-3xl font-bold text-white tabular-nums">
              {hud.completedEights}
            </div>
            <div className="text-xs text-gray-400">Osmičky</div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
            <div className="text-3xl font-bold text-white tabular-nums">
              {Math.ceil(hud.timeLeft)}s
            </div>
            <div className="text-xs text-gray-400">Čas</div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-right">
            <div className="text-3xl font-bold text-white tabular-nums">
              {hud.tempo}
            </div>
            <div className="text-xs text-gray-400">Tempo/min</div>
          </div>
        </div>
      </div>

      {/* Countdown */}
      {hud.countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-8xl font-bold text-white animate-pulse">
            {hud.countdown}
          </div>
        </div>
      )}

      {/* Scale control */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 pointer-events-auto">
        <label className="text-xs text-gray-400 block mb-1">
          Veľkosť dráhy: {Math.round(scale * 100)}%
        </label>
        <input
          type="range"
          min="50"
          max="120"
          value={scale * 100}
          onChange={(e) => setScale(parseInt(e.target.value) / 100)}
          className="w-24"
        />
      </div>

      {/* Pause overlay */}
      {isPaused && hud.countdown <= 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              Sledovanie stratené
            </div>
            <p className="text-gray-300">
              Vráť loptičku do viditeľnej oblasti kamery
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
