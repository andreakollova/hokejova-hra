'use client';

import { useRef, useState, useEffect } from 'react';
import { GameInput, InputMode } from '@/lib/tracking';
import { playSound } from '@/lib/game-audio';

interface TargetSmashGameProps {
  duration: 30 | 60 | 90;
  difficulty: 'easy' | 'medium' | 'hard';
  inputMode: InputMode;
  getGameInput: () => GameInput;
  onFinish: (result: TargetSmashResult) => void;
  onBackToMenu?: () => void;
}

export interface TargetSmashResult {
  score: number;
  targetsHit: number;
  targetsMissed: number;
  perfectHits: number;
  duration: number;
  difficulty: string;
  inputMode: InputMode;
  sessionId: string;
}

const CANVAS_W = 600;
const CANVAS_H = 800;
const BALL_Y = 700;
const BALL_RADIUS = 16;
const TARGET_RADIUS = 25;
const PERFECT_RADIUS = 10;

const DIFFICULTY = {
  easy:   { interval: 2.38, speed: 1.26, label: 'Easy' },
  medium: { interval: 1.71, speed: 1.89, label: 'Medium' },
  hard:   { interval: 1.14, speed: 2.63, label: 'Hard' },
};

interface Target {
  x: number;
  y: number;
  active: boolean;
  hit: boolean;
  id: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const PARTICLE_COLORS = ['#ef4444', '#f97316', '#fbbf24', '#dc2626', '#fb923c', '#f87171'];

export default function TargetSmashGame({
  duration,
  difficulty,
  inputMode,
  getGameInput,
  onFinish,
  onBackToMenu,
}: TargetSmashGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = DIFFICULTY[difficulty];
  const sessionIdRef = useRef(crypto.randomUUID());

  const stateRef = useRef({
    ballX: CANVAS_W / 2,
    targets: [] as Target[],
    particles: [] as Particle[],
    score: 0,
    targetsHit: 0,
    targetsMissed: 0,
    perfectHits: 0,
    elapsedTime: 0,
    started: false,
    finished: false,
    countdown: 3,
    gameStartWallTime: 0,
    spawnTimer: 0,
    nextId: 0,
    nextSide: 'left' as 'left' | 'right',
    backTimer: 0,
  });

  const [hud, setHud] = useState({
    score: 0,
    timeLeft: duration as number,
    countdown: 3,
    targetsHit: 0,
    accuracy: 0,
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

    const spawnParticles = (x: number, y: number, perfect: boolean) => {
      const s = stateRef.current;
      const count = perfect ? 16 : 12;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 4;
        s.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed * (perfect ? 1.3 : 1),
          vy: Math.sin(angle) * speed * (perfect ? 1.3 : 1) - 1,
          life: 1,
          maxLife: 1,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
          size: 3 + Math.random() * 4,
        });
      }
    };

    const loop = (timestamp: number) => {
      if (!running) return;
      const delta = lastTime ? (timestamp - lastTime) / 1000 : 0;
      lastTime = timestamp;

      const s = stateRef.current;
      if (s.finished) { requestAnimationFrame(loop); return; }

      const input = getGameInput();

      // Back to menu: hold top-right corner for 5s
      const inExitZone = input.active && input.x > 0.85 && input.y < 0.15;
      if (inExitZone) {
        s.backTimer += delta;
        if (s.backTimer >= 5 && onBackToMenu) { s.finished = true; onBackToMenu(); return; }
      } else { s.backTimer = 0; }

      // Countdown
      if (!s.started) {
        s.countdown -= delta;
        if (s.countdown <= 0) { s.started = true; s.gameStartWallTime = performance.now(); }
        hudRef.current = { ...hudRef.current, countdown: Math.ceil(Math.max(0, s.countdown)), backProgress: s.backTimer / 5 };
        drawGame(ctx, s, Math.ceil(Math.max(0, s.countdown)));
        requestAnimationFrame(loop);
        return;
      }

      s.elapsedTime = (performance.now() - s.gameStartWallTime) / 1000;

      // Time up
      if (s.elapsedTime >= duration) {
        s.finished = true;
        const total = s.targetsHit + s.targetsMissed;
        onFinish({
          score: s.score,
          targetsHit: s.targetsHit,
          targetsMissed: s.targetsMissed,
          perfectHits: s.perfectHits,
          duration,
          difficulty,
          inputMode,
          sessionId: sessionIdRef.current,
        });
        return;
      }

      // Ball position from input
      if (input.active) {
        s.ballX = input.x * CANVAS_W;
      }
      s.ballX = Math.max(BALL_RADIUS, Math.min(CANVAS_W - BALL_RADIUS, s.ballX));

      // Spawn targets
      s.spawnTimer -= delta;
      if (s.spawnTimer <= 0) {
        s.spawnTimer = config.interval;
        const margin = 60;
        let x: number;
        if (s.nextSide === 'left') {
          x = margin + Math.random() * (CANVAS_W / 2 - margin - TARGET_RADIUS);
        } else {
          x = CANVAS_W / 2 + Math.random() * (CANVAS_W / 2 - margin - TARGET_RADIUS);
        }
        s.nextSide = s.nextSide === 'left' ? 'right' : 'left';
        s.targets.push({
          x,
          y: -TARGET_RADIUS,
          active: true,
          hit: false,
          id: s.nextId++,
        });
      }

      // Move targets and check collisions
      for (const t of s.targets) {
        if (!t.active) continue;
        t.y += config.speed;

        // Check collision with ball
        const dx = t.x - s.ballX;
        const dy = t.y - BALL_Y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < TARGET_RADIUS + BALL_RADIUS) {
          t.active = false;
          t.hit = true;

          if (dist <= PERFECT_RADIUS) {
            s.score += 150;
            s.perfectHits++;
            playSound(1100, 0.15);
          } else {
            s.score += 100;
            playSound(880, 0.1);
          }
          s.targetsHit++;
          spawnParticles(t.x, t.y, dist <= PERFECT_RADIUS);
        }

        // Missed - passed below ball
        if (t.active && t.y > BALL_Y + TARGET_RADIUS + 30) {
          t.active = false;
          s.targetsMissed++;
          playSound(220, 0.15, 'square');
        }
      }
      s.targets = s.targets.filter(t => t.active || t.y < BALL_Y + 80);

      // Update particles
      for (const p of s.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 6 * delta; // gravity
        p.life -= delta * 2;
      }
      s.particles = s.particles.filter(p => p.life > 0);

      // Update HUD ref
      const total = s.targetsHit + s.targetsMissed;
      hudRef.current = {
        score: s.score,
        timeLeft: Math.max(0, duration - s.elapsedTime),
        countdown: 0,
        targetsHit: s.targetsHit,
        accuracy: total > 0 ? Math.round((s.targetsHit / total) * 100) : 100,
        backProgress: s.backTimer / 5,
      };

      drawGame(ctx, s, 0);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return () => { running = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, difficulty]);

  useEffect(() => {
    const interval = setInterval(() => setHud({ ...hudRef.current }), 66);
    return () => clearInterval(interval);
  }, []);

  const drawGame = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current, countdown: number) => {
    const w = CANVAS_W;
    const h = CANVAS_H;

    // Light grey background (matches slalom)
    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(0, 0, w, h);

    // Draw targets
    for (const t of s.targets) {
      if (!t.active) continue;

      // Outer red circle
      ctx.beginPath();
      ctx.arc(t.x, t.y, TARGET_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // White ring
      ctx.beginPath();
      ctx.arc(t.x, t.y, TARGET_RADIUS * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Inner red circle
      ctx.beginPath();
      ctx.arc(t.x, t.y, TARGET_RADIUS * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Bullseye center
      ctx.beginPath();
      ctx.arc(t.x, t.y, TARGET_RADIUS * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Shadow beneath
      ctx.beginPath();
      ctx.ellipse(t.x + 2, t.y + 3, TARGET_RADIUS * 0.8, TARGET_RADIUS * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fill();
    }

    // Draw particles
    for (const p of s.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Draw ball (white with shadow)
    // Shadow
    ctx.beginPath();
    ctx.ellipse(s.ballX + 2, BALL_Y + 4, BALL_RADIUS, BALL_RADIUS * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();

    // Ball
    ctx.beginPath();
    ctx.arc(s.ballX, BALL_Y, BALL_RADIUS, 0, Math.PI * 2);
    const ballGrad = ctx.createRadialGradient(s.ballX - 4, BALL_Y - 4, 2, s.ballX, BALL_Y, BALL_RADIUS);
    ballGrad.addColorStop(0, '#ffffff');
    ballGrad.addColorStop(1, '#e4e4e7');
    ctx.fillStyle = ballGrad;
    ctx.fill();

    // Ball outline
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Countdown overlay
    if (countdown > 0) {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(countdown), w / 2, h / 2);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#f0f4f8]">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="max-w-full max-h-full"
        style={{ imageRendering: 'auto' }}
      />

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-start max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{hud.score}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{Math.ceil(hud.timeLeft)}s</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Time</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-red-500 tabular-nums">{hud.targetsHit}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Hits</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{hud.accuracy}%</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Back-to-menu progress (5s hold) */}
      {hud.backProgress > 0.03 && (
        <div className="absolute top-16 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-2xl px-4 py-2 pointer-events-none shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#999" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#ef4444" strokeWidth="3"
              strokeDasharray={`${hud.backProgress * 94.2} 94.2`} strokeLinecap="round" transform="rotate(-90 18 18)" />
          </svg>
          <span className="text-xs text-red-500">Back to menu</span>
        </div>
      )}
    </div>
  );
}
