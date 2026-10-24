'use client';

import { useRef, useState, useEffect } from 'react';
import { GameInput, InputMode } from '@/lib/tracking';
import { playSound } from '@/lib/game-audio';

interface LaserMazeGameProps {
  duration: 30 | 60 | 90;
  difficulty: 'easy' | 'medium' | 'hard';
  inputMode: InputMode;
  getGameInput: () => GameInput;
  onFinish: (result: LaserMazeResult) => void;
  onBackToMenu?: () => void;
}

export interface LaserMazeResult {
  score: number;
  checkpoints: number;
  laserHits: number;
  duration: number;
  difficulty: string;
  inputMode: InputMode;
  sessionId: string;
}

const CANVAS_W = 600;
const CANVAS_H = 800;

const DIFFICULTY = {
  easy:   { lanes: 2, laserInterval: 2.38, warningTime: 1.14, scrollSpeed: 2.1, checkpointInterval: 2.85 },
  medium: { lanes: 3, laserInterval: 1.71, warningTime: 0.95, scrollSpeed: 3.15, checkpointInterval: 2.38 },
  hard:   { lanes: 4, laserInterval: 1.14, warningTime: 0.76, scrollSpeed: 4.2, checkpointInterval: 1.9 },
};

const LANE_COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b'];

interface LaserEvent {
  lane: number;
  timer: number;
  fired: boolean;
}

interface Checkpoint {
  lane: number;
  y: number;
  collected: boolean;
}

export default function LaserMazeGame({
  duration, difficulty, inputMode, getGameInput, onFinish, onBackToMenu,
}: LaserMazeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cfg = DIFFICULTY[difficulty];
  const sessionIdRef = useRef(crypto.randomUUID());

  const stateRef = useRef({
    currentLane: 0,
    targetLane: 0,
    laneX: 0,
    scrollOffset: 0,
    score: 0,
    checkpoints: 0,
    laserHits: 0,
    lasers: [] as LaserEvent[],
    checkpointList: [] as Checkpoint[],
    nextLaserIn: 1.5,
    nextCheckpointIn: 2,
    elapsedTime: 0,
    started: false,
    finished: false,
    countdown: 3,
    gameStartWallTime: 0,
    backTimer: 0,
    hitFlash: 0,
    comboFrames: 0,
  });

  const [hud, setHud] = useState({
    score: 0,
    timeLeft: duration as number,
    checkpoints: 0,
    laserHits: 0,
    countdown: 3,
    backProgress: 0,
  });
  const hudRef = useRef(hud);

  useEffect(() => {
    const interval = setInterval(() => setHud({ ...hudRef.current }), 66);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    let lastTime = 0;

    const laneCount = cfg.lanes;
    const laneW = CANVAS_W / laneCount;
    const laneCenter = (lane: number) => lane * laneW + laneW / 2;
    const ballY = CANVAS_H - 120;

    const s = stateRef.current;
    s.currentLane = Math.floor(laneCount / 2);
    s.targetLane = s.currentLane;
    s.laneX = laneCenter(s.currentLane);

    const loop = (timestamp: number) => {
      if (!running) return;
      const delta = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0;
      lastTime = timestamp;

      if (s.finished) { requestAnimationFrame(loop); return; }

      const input = getGameInput();

      // Back to menu hold
      const inExitZone = input.active && input.x > 0.85 && input.y < 0.15;
      if (inExitZone) { s.backTimer += delta; if (s.backTimer >= 5 && onBackToMenu) { s.finished = true; onBackToMenu(); return; } }
      else { s.backTimer = 0; }

      // Countdown
      if (!s.started) {
        s.countdown -= delta;
        if (s.countdown <= 0) { s.started = true; s.gameStartWallTime = performance.now(); }
        hudRef.current = { ...hudRef.current, countdown: Math.ceil(Math.max(0, s.countdown)), backProgress: s.backTimer / 5 };
        draw(ctx, s, Math.ceil(Math.max(0, s.countdown)), laneCount, laneW, ballY);
        requestAnimationFrame(loop);
        return;
      }

      s.elapsedTime = (performance.now() - s.gameStartWallTime) / 1000;

      if (s.elapsedTime >= duration) {
        s.finished = true;
        onFinish({
          score: s.score, checkpoints: s.checkpoints, laserHits: s.laserHits,
          duration, difficulty, inputMode, sessionId: sessionIdRef.current,
        });
        return;
      }

      s.scrollOffset += cfg.scrollSpeed * 60 * delta;

      // Player lane from input
      if (input.active) {
        s.targetLane = Math.min(laneCount - 1, Math.max(0, Math.floor(input.x * laneCount)));
      }
      s.currentLane = s.targetLane;

      const targetX = laneCenter(s.currentLane);
      s.laneX += (targetX - s.laneX) * Math.min(1, 12 * delta);

      // Score for surviving
      s.comboFrames++;
      if (s.comboFrames % 6 === 0) s.score += 1;

      // Spawn lasers
      s.nextLaserIn -= delta;
      if (s.nextLaserIn <= 0) {
        const lane = Math.floor(Math.random() * laneCount);
        s.lasers.push({ lane, timer: cfg.warningTime, fired: false });
        if (Math.random() < 0.3 && laneCount > 2) {
          let lane2 = Math.floor(Math.random() * laneCount);
          while (lane2 === lane) lane2 = Math.floor(Math.random() * laneCount);
          s.lasers.push({ lane: lane2, timer: cfg.warningTime, fired: false });
        }
        s.nextLaserIn = cfg.laserInterval * (0.7 + Math.random() * 0.6);
      }

      // Update lasers
      for (const laser of s.lasers) {
        laser.timer -= delta;
        if (laser.timer <= 0 && !laser.fired) {
          laser.fired = true;
          if (s.currentLane === laser.lane) {
            s.laserHits++;
            s.hitFlash = 0.4;
            s.score = Math.max(0, s.score - 20);
            s.comboFrames = 0;
            playSound(150, 0.3, 'square');
          }
        }
      }
      s.lasers = s.lasers.filter(l => l.timer > -0.5);

      if (s.hitFlash > 0) s.hitFlash -= delta;

      // Spawn checkpoints
      s.nextCheckpointIn -= delta;
      if (s.nextCheckpointIn <= 0) {
        const lane = Math.floor(Math.random() * laneCount);
        s.checkpointList.push({ lane, y: -30, collected: false });
        s.nextCheckpointIn = cfg.checkpointInterval * (0.8 + Math.random() * 0.4);
      }

      // Move and check checkpoints
      for (const cp of s.checkpointList) {
        cp.y += cfg.scrollSpeed * 60 * delta;
        if (!cp.collected && cp.y > ballY - 20 && cp.y < ballY + 20 && cp.lane === s.currentLane) {
          cp.collected = true;
          s.checkpoints++;
          s.score += 50;
          playSound(880, 0.1);
        }
      }
      s.checkpointList = s.checkpointList.filter(cp => cp.y < CANVAS_H + 50);

      hudRef.current = {
        score: s.score, timeLeft: Math.max(0, duration - s.elapsedTime),
        checkpoints: s.checkpoints, laserHits: s.laserHits,
        countdown: 0, backProgress: s.backTimer / 5,
      };

      draw(ctx, s, 0, laneCount, laneW, ballY);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return () => { running = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, difficulty]);

  const draw = (
    ctx: CanvasRenderingContext2D, s: typeof stateRef.current,
    countdown: number, laneCount: number, laneW: number, ballY: number,
  ) => {
    const w = CANVAS_W;
    const h = CANVAS_H;

    // Background
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, 0, w, h);

    // Lane dividers
    for (let i = 0; i <= laneCount; i++) {
      const x = i * laneW;
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Lane tint
    for (let i = 0; i < laneCount; i++) {
      ctx.fillStyle = `${LANE_COLORS[i % LANE_COLORS.length]}08`;
      ctx.fillRect(i * laneW, 0, laneW, h);
    }

    // Scrolling center dashes
    const dashOffset = -(s.scrollOffset * 0.5) % 40;
    ctx.setLineDash([15, 25]);
    ctx.lineDashOffset = dashOffset;
    for (let i = 0; i < laneCount; i++) {
      const cx = i * laneW + laneW / 2;
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.06)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Checkpoints
    for (const cp of s.checkpointList) {
      if (cp.collected) continue;
      const cx = cp.lane * laneW + laneW / 2;
      const pulse = Math.sin(s.elapsedTime * 4) * 3;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(cx, cp.y, 12 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#bbf7d0';
      ctx.beginPath();
      ctx.arc(cx, cp.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lasers
    const warnTime = DIFFICULTY[difficulty].warningTime;
    for (const laser of s.lasers) {
      const lx = laser.lane * laneW;

      if (laser.timer > 0) {
        // Warning: lane glows red
        const intensity = 0.08 + (1 - laser.timer / warnTime) * 0.25;
        const pulse = Math.sin(s.elapsedTime * 12) * 0.05;
        ctx.fillStyle = `rgba(239, 68, 68, ${intensity + pulse})`;
        ctx.fillRect(lx + 2, 0, laneW - 4, h);

        // Warning text when close to firing
        if (laser.timer < warnTime * 0.4) {
          ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(s.elapsedTime * 20) * 0.3})`;
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('LASER', lx + laneW / 2, h / 2);
        }
      } else {
        // Firing: bright flash
        const alpha = Math.max(0, 1 + laser.timer * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha * 0.5})`;
        ctx.fillRect(lx, 0, laneW, h);

        // Beam lines
        ctx.strokeStyle = `rgba(255, 120, 120, ${alpha})`;
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
          const bx = lx + laneW * (0.2 + i * 0.3);
          ctx.beginPath();
          ctx.moveTo(bx, 0);
          ctx.lineTo(bx, h);
          ctx.stroke();
        }
      }
    }

    // Ball
    const bx = s.laneX;
    ctx.shadowColor = s.hitFlash > 0 ? '#ef4444' : '#22c55e';
    ctx.shadowBlur = 20;
    ctx.fillStyle = s.hitFlash > 0 ? '#ef4444' : '#ffffff';
    ctx.beginPath();
    ctx.arc(bx, ballY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(bx - 3, ballY - 3, 5, 0, Math.PI * 2);
    ctx.fill();

    // Lane highlight around ball
    ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
    ctx.fillRect(s.currentLane * laneW, ballY - 30, laneW, 60);

    // Hit flash overlay
    if (s.hitFlash > 0) {
      ctx.fillStyle = `rgba(239, 68, 68, ${s.hitFlash * 0.25})`;
      ctx.fillRect(0, 0, w, h);
    }

    // Countdown
    if (countdown > 0) {
      ctx.fillStyle = 'rgba(10, 26, 10, 0.8)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(countdown), w / 2, h / 2 + 40);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0a1a0a]">
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="max-w-full max-h-full" />

      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-start max-w-2xl mx-auto">
          <div className="bg-green-900/50 backdrop-blur-md rounded-2xl px-5 py-3 shadow-sm">
            <div className="text-3xl font-bold text-green-400 tabular-nums">{hud.score}</div>
            <div className="text-xs text-green-600 uppercase tracking-wider">Score</div>
          </div>
          <div className="bg-green-900/50 backdrop-blur-md rounded-2xl px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-white tabular-nums">{Math.ceil(hud.timeLeft)}s</div>
            <div className="text-xs text-green-600 uppercase tracking-wider">Time</div>
          </div>
          <div className="bg-green-900/50 backdrop-blur-md rounded-2xl px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-400 tabular-nums">{hud.checkpoints}</div>
            <div className="text-xs text-green-600 uppercase tracking-wider">Collected</div>
          </div>
          <div className="bg-green-900/50 backdrop-blur-md rounded-2xl px-5 py-3 text-right shadow-sm">
            <div className="text-3xl font-bold text-red-400 tabular-nums">{hud.laserHits}</div>
            <div className="text-xs text-green-600 uppercase tracking-wider">Hits</div>
          </div>
        </div>
      </div>

      {hud.backProgress > 0.05 && (
        <div className="absolute top-16 right-4 flex items-center gap-2 bg-green-900/50 backdrop-blur-md rounded-2xl px-4 py-2 pointer-events-none shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#333" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#22c55e" strokeWidth="3"
              strokeDasharray={`${hud.backProgress * 94.2} 94.2`} strokeLinecap="round" transform="rotate(-90 18 18)" />
          </svg>
          <span className="text-xs text-green-400 font-medium">Back</span>
        </div>
      )}
    </div>
  );
}
