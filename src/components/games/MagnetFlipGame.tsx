'use client';

import { useRef, useState, useEffect } from 'react';
import { GameInput, InputMode } from '@/lib/tracking';
import { playSound } from '@/lib/game-audio';

interface MagnetFlipGameProps {
  duration: 30 | 60 | 90;
  difficulty: 'easy' | 'medium' | 'hard';
  inputMode: InputMode;
  getGameInput: () => GameInput;
  onFinish: (result: MagnetFlipResult) => void;
  onBackToMenu?: () => void;
}

export interface MagnetFlipResult {
  score: number;
  perfectHits: number;
  goodHits: number;
  totalBounces: number;
  duration: number;
  difficulty: string;
  inputMode: InputMode;
  sessionId: string;
}

const CANVAS_W = 600;
const CANVAS_H = 800;
const PLATFORM_H = 20;
const BALL_RADIUS = 10;

const DIFFICULTY = {
  easy:   { targetSize: 80, ballSpeed: 4.2 },
  medium: { targetSize: 55, ballSpeed: 6.3 },
  hard:   { targetSize: 35, ballSpeed: 8.4 },
};

const PERFECT_DIST = 20;
const GOOD_DIST = 50;

export default function MagnetFlipGame({
  duration,
  difficulty,
  inputMode,
  getGameInput,
  onFinish,
  onBackToMenu,
}: MagnetFlipGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = DIFFICULTY[difficulty];
  const sessionIdRef = useRef(crypto.randomUUID());

  const stateRef = useRef({
    ballX: CANVAS_W / 2,
    ballY: CANVAS_H - PLATFORM_H - BALL_RADIUS - 2,
    ballVY: -config.ballSpeed,
    playerX: CANVAS_W / 2,
    // target
    targetX: CANVAS_W / 2,
    targetOnTop: true, // next target platform
    targetActive: true,
    // trail
    trail: [] as { x: number; y: number; age: number }[],
    // scoring
    score: 0,
    perfectHits: 0,
    goodHits: 0,
    totalBounces: 0,
    // feedback
    feedbackText: '',
    feedbackTimer: 0,
    feedbackColor: '#ffffff',
    // timing
    elapsedTime: 0,
    started: false,
    finished: false,
    countdown: 3,
    gameStartWallTime: 0,
    backTimer: 0,
  });

  const [hud, setHud] = useState({
    score: 0,
    timeLeft: duration as number,
    bounces: 0,
    accuracy: 0,
    countdown: 3,
    backProgress: 0,
  });
  const hudRef = useRef(hud);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    let lastTime = 0;

    const spawnTarget = (onTop: boolean) => {
      const s = stateRef.current;
      const margin = config.targetSize / 2 + 30;
      s.targetX = margin + Math.random() * (CANVAS_W - margin * 2);
      s.targetOnTop = onTop;
      s.targetActive = true;
    };

    // Initial target on top (ball starts going up)
    spawnTarget(true);

    const loop = (timestamp: number) => {
      if (!running) return;
      const delta = lastTime ? (timestamp - lastTime) / 1000 : 0;
      lastTime = timestamp;

      const s = stateRef.current;
      if (s.finished) { requestAnimationFrame(loop); return; }

      const input = getGameInput();

      // Back to menu hold
      const inExitZone = input.active && input.x > 0.85 && input.y < 0.15;
      if (inExitZone) {
        s.backTimer += delta;
        if (s.backTimer >= 3 && onBackToMenu) { s.finished = true; onBackToMenu(); return; }
      } else { s.backTimer = 0; }

      // Countdown
      if (!s.started) {
        s.countdown -= delta;
        if (s.countdown <= 0) { s.started = true; s.gameStartWallTime = performance.now(); }
        hudRef.current = { ...hudRef.current, countdown: Math.ceil(Math.max(0, s.countdown)), backProgress: s.backTimer / 3 };
        drawGame(ctx, s, Math.ceil(Math.max(0, s.countdown)));
        requestAnimationFrame(loop);
        return;
      }

      s.elapsedTime = (performance.now() - s.gameStartWallTime) / 1000;

      // Time up
      if (s.elapsedTime >= duration) {
        s.finished = true;
        onFinish({
          score: s.score,
          perfectHits: s.perfectHits,
          goodHits: s.goodHits,
          totalBounces: s.totalBounces,
          duration,
          difficulty,
          inputMode,
          sessionId: sessionIdRef.current,
        });
        return;
      }

      // Player horizontal control
      if (input.active) {
        s.playerX = input.x * CANVAS_W;
      }
      s.playerX = Math.max(BALL_RADIUS, Math.min(CANVAS_W - BALL_RADIUS, s.playerX));

      // Move ball horizontally toward player X (smooth follow)
      const xLerp = 0.12;
      s.ballX += (s.playerX - s.ballX) * xLerp;
      s.ballX = Math.max(BALL_RADIUS, Math.min(CANVAS_W - BALL_RADIUS, s.ballX));

      // Move ball vertically
      s.ballY += s.ballVY;

      // Trail
      s.trail.push({ x: s.ballX, y: s.ballY, age: 0 });
      for (const t of s.trail) t.age += delta;
      s.trail = s.trail.filter(t => t.age < 0.15);

      // Check bounce on top platform
      if (s.ballY - BALL_RADIUS <= PLATFORM_H) {
        s.ballY = PLATFORM_H + BALL_RADIUS + 1;
        s.ballVY = config.ballSpeed; // go down
        s.totalBounces++;

        // Score if target is on top
        if (s.targetActive && s.targetOnTop) {
          const dist = Math.abs(s.ballX - s.targetX);
          if (dist <= PERFECT_DIST) {
            s.score += 100;
            s.perfectHits++;
            s.feedbackText = 'PERFECT!';
            s.feedbackColor = '#fbbf24';
            playSound(880, 0.15);
          } else if (dist <= GOOD_DIST) {
            s.score += 50;
            s.goodHits++;
            s.feedbackText = 'GOOD!';
            s.feedbackColor = '#a78bfa';
            playSound(660, 0.1);
          } else {
            s.feedbackText = 'MISS!';
            s.feedbackColor = '#ef4444';
            playSound(200, 0.1, 'square');
          }
          s.feedbackTimer = 0.8;
          // Next target on bottom
          spawnTarget(false);
        }
      }

      // Check bounce on bottom platform
      if (s.ballY + BALL_RADIUS >= CANVAS_H - PLATFORM_H) {
        s.ballY = CANVAS_H - PLATFORM_H - BALL_RADIUS - 1;
        s.ballVY = -config.ballSpeed; // go up
        s.totalBounces++;

        // Score if target is on bottom
        if (s.targetActive && !s.targetOnTop) {
          const dist = Math.abs(s.ballX - s.targetX);
          if (dist <= PERFECT_DIST) {
            s.score += 100;
            s.perfectHits++;
            s.feedbackText = 'PERFECT!';
            s.feedbackColor = '#fbbf24';
            playSound(880, 0.15);
          } else if (dist <= GOOD_DIST) {
            s.score += 50;
            s.goodHits++;
            s.feedbackText = 'GOOD!';
            s.feedbackColor = '#a78bfa';
            playSound(660, 0.1);
          } else {
            s.feedbackText = 'MISS!';
            s.feedbackColor = '#ef4444';
            playSound(200, 0.1, 'square');
          }
          s.feedbackTimer = 0.8;
          // Next target on top
          spawnTarget(true);
        }
      }

      // Feedback timer
      if (s.feedbackTimer > 0) s.feedbackTimer -= delta;

      // Update HUD ref
      const totalAttempts = s.perfectHits + s.goodHits + (s.totalBounces - s.perfectHits - s.goodHits);
      const hits = s.perfectHits + s.goodHits;
      const accuracy = s.totalBounces > 0 ? Math.round((hits / s.totalBounces) * 100) : 0;

      hudRef.current = {
        score: s.score,
        timeLeft: Math.max(0, duration - s.elapsedTime),
        bounces: s.totalBounces,
        accuracy,
        countdown: 0,
        backProgress: s.backTimer / 3,
      };

      drawGame(ctx, s, 0);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return () => { running = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, difficulty]);

  const drawGame = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current, countdown: number) => {
    const w = CANVAS_W;
    const h = CANVAS_H;

    // Background
    ctx.fillStyle = '#1a1025';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Top platform
    const topGrad = ctx.createLinearGradient(0, 0, 0, PLATFORM_H);
    topGrad.addColorStop(0, '#7c3aed');
    topGrad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, w, PLATFORM_H);
    // Glow edge
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#a78bfa';
    ctx.fillRect(0, PLATFORM_H - 2, w, 2);
    ctx.shadowBlur = 0;

    // Bottom platform
    const botGrad = ctx.createLinearGradient(0, h - PLATFORM_H, 0, h);
    botGrad.addColorStop(0, '#8b5cf6');
    botGrad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, h - PLATFORM_H, w, PLATFORM_H);
    // Glow edge
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#a78bfa';
    ctx.fillRect(0, h - PLATFORM_H, w, 2);
    ctx.shadowBlur = 0;

    // Target zone
    if (s.targetActive) {
      const targetY = s.targetOnTop ? PLATFORM_H : h - PLATFORM_H;
      const size = config.targetSize;

      // Outer glow
      const grad = ctx.createRadialGradient(s.targetX, targetY, 0, s.targetX, targetY, size);
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
      grad.addColorStop(0.5, 'rgba(251, 191, 36, 0.15)');
      grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(s.targetX - size, targetY - size / 2, size * 2, size);

      // Target circle on platform edge
      ctx.beginPath();
      ctx.arc(s.targetX, targetY, size / 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner circle
      ctx.beginPath();
      ctx.arc(s.targetX, targetY, PERFECT_DIST, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(s.targetX, targetY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
    }

    // Ball trail
    for (const t of s.trail) {
      const alpha = Math.max(0, 1 - t.age / 0.15) * 0.4;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(t.x, t.y, BALL_RADIUS * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Ball
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    // Ball highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(s.ballX - 3, s.ballY - 3, BALL_RADIUS * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Feedback text
    if (s.feedbackTimer > 0) {
      const alpha = Math.min(1, s.feedbackTimer / 0.3);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.feedbackColor;
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = s.feedbackColor;
      ctx.shadowBlur = 20;
      ctx.fillText(s.feedbackText, w / 2, h / 2 + 16);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Countdown overlay
    if (countdown > 0) {
      ctx.fillStyle = 'rgba(26, 16, 37, 0.7)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(countdown), w / 2, h / 2 + 40);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#1a1025]">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="max-w-full max-h-full"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-start max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3">
            <div className="text-3xl font-bold text-white tabular-nums">{hud.score}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Score</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-center">
            <div className="text-3xl font-bold text-white tabular-nums">{Math.ceil(hud.timeLeft)}s</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Time</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-center">
            <div className="text-3xl font-bold text-white tabular-nums">{hud.bounces}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Bounces</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-right">
            <div className="text-3xl font-bold text-purple-400 tabular-nums">{hud.accuracy}%</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Back-to-menu */}
      {hud.backProgress > 0.05 && (
        <div className="absolute top-16 right-4 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 pointer-events-none">
          <svg className="w-5 h-5" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#333" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="3"
              strokeDasharray={`${hud.backProgress * 94.2} 94.2`} strokeLinecap="round" transform="rotate(-90 18 18)" />
          </svg>
          <span className="text-xs text-yellow-400">Back</span>
        </div>
      )}
    </div>
  );
}
