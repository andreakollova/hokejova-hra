'use client';

import { useRef, useState, useEffect } from 'react';
import { GameInput, InputMode } from '@/lib/tracking';

interface BrickRushGameProps {
  duration: 30 | 60 | 90;
  difficulty: 'easy' | 'medium' | 'hard';
  inputMode: InputMode;
  getGameInput: () => GameInput;
  onFinish: (result: BrickRushResult) => void;
  onBackToMenu?: () => void;
}

export interface BrickRushResult {
  score: number;
  bricksDestroyed: number;
  waves: number;
  duration: number;
  difficulty: string;
  inputMode: InputMode;
  sessionId: string;
}

const CANVAS_W = 600;
const CANVAS_H = 800;
const BALL_RADIUS = 8;
const BRICK_COLS = 8;
const BRICK_ROWS = 5;
const BRICK_GAP = 6;
const BRICK_H = 28;
const PADDLE_H = 16;
const PADDLE_RADIUS = 8;
const BRICK_RADIUS = 5;
const TRAIL_LENGTH = 8;

const DIFFICULTY_CFG = {
  easy:   { paddleW: 150, ballSpeed: 4 },
  medium: { paddleW: 120, ballSpeed: 6 },
  hard:   { paddleW: 90,  ballSpeed: 8 },
};

const BRICK_COLORS = ['#ef4444', '#eab308'];

interface Brick {
  x: number;
  y: number;
  w: number;
  active: boolean;
  color: string;
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

export default function BrickRushGame({
  duration,
  difficulty,
  inputMode,
  getGameInput,
  onFinish,
  onBackToMenu,
}: BrickRushGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cfg = DIFFICULTY_CFG[difficulty];
  const sessionIdRef = useRef(crypto.randomUUID());

  const stateRef = useRef({
    paddleX: CANVAS_W / 2,
    ballX: CANVAS_W / 2,
    ballY: CANVAS_H - 60,
    ballVX: 0,
    ballVY: 0,
    ballOnPaddle: true,
    bricks: [] as Brick[],
    particles: [] as Particle[],
    trail: [] as { x: number; y: number }[],
    score: 0,
    bricksDestroyed: 0,
    waves: 0,
    currentBallSpeed: cfg.ballSpeed,
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
    bricksDestroyed: 0,
    waves: 0,
    countdown: 3,
    backProgress: 0,
  });

  const spawnWave = (s: typeof stateRef.current) => {
    s.waves++;
    const brickW = (CANVAS_W - BRICK_GAP * (BRICK_COLS + 1)) / BRICK_COLS;
    const startY = 60;
    s.bricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        s.bricks.push({
          x: BRICK_GAP + col * (brickW + BRICK_GAP),
          y: startY + row * (BRICK_H + BRICK_GAP),
          w: brickW,
          active: true,
          color: BRICK_COLORS[(row + col) % 2],
        });
      }
    }
    // Speed increases slightly each wave
    s.currentBallSpeed = cfg.ballSpeed + (s.waves - 1) * 0.5;
  };

  const resetBallOnPaddle = (s: typeof stateRef.current) => {
    s.ballOnPaddle = true;
    s.ballVX = 0;
    s.ballVY = 0;
    s.trail = [];
  };

  const launchBall = (s: typeof stateRef.current) => {
    if (!s.ballOnPaddle) return;
    s.ballOnPaddle = false;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6; // slight random angle
    s.ballVX = Math.cos(angle) * s.currentBallSpeed;
    s.ballVY = Math.sin(angle) * s.currentBallSpeed;
  };

  const spawnParticles = (x: number, y: number, color: string, s: typeof stateRef.current) => {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      s.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.4 + Math.random() * 0.3,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  };

  // Init first wave
  useEffect(() => {
    const s = stateRef.current;
    s.waves = 0;
    s.currentBallSpeed = cfg.ballSpeed;
    spawnWave(s);
    resetBallOnPaddle(s);
  }, [difficulty, cfg.ballSpeed]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    let lastTime = 0;

    const playSound = (freq: number, dur: number, type: OscillatorType = 'sine') => {
      try {
        const actx = new AudioContext();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.connect(gain); gain.connect(actx.destination);
        osc.frequency.value = freq; osc.type = type; gain.gain.value = 0.06;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
        osc.stop(actx.currentTime + dur);
      } catch {}
    };

    const loop = (timestamp: number) => {
      if (!running) return;
      const delta = lastTime ? (timestamp - lastTime) / 1000 : 0;
      lastTime = timestamp;

      const s = stateRef.current;
      if (s.finished) { requestAnimationFrame(loop); return; }

      const input = getGameInput();

      // Back to menu
      const inExitZone = input.active && input.x > 0.85 && input.y < 0.15;
      if (inExitZone) {
        s.backTimer += delta;
        if (s.backTimer >= 3 && onBackToMenu) { s.finished = true; onBackToMenu(); return; }
      } else { s.backTimer = 0; }

      // Countdown
      if (!s.started) {
        s.countdown -= delta;
        if (s.countdown <= 0) { s.started = true; s.gameStartWallTime = performance.now(); }
        setHud(h => ({ ...h, countdown: Math.ceil(Math.max(0, s.countdown)), backProgress: s.backTimer / 3 }));
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
          bricksDestroyed: s.bricksDestroyed,
          waves: s.waves,
          duration,
          difficulty,
          inputMode,
          sessionId: sessionIdRef.current,
        });
        return;
      }

      // Paddle position from input
      if (input.active) {
        s.paddleX = input.x * CANVAS_W;
      }
      s.paddleX = Math.max(cfg.paddleW / 2, Math.min(CANVAS_W - cfg.paddleW / 2, s.paddleX));

      // Ball on paddle follows paddle
      if (s.ballOnPaddle) {
        s.ballX = s.paddleX;
        s.ballY = CANVAS_H - 40 - PADDLE_H / 2 - BALL_RADIUS;
        // Auto-launch after a short delay
        if (s.started) {
          launchBall(s);
        }
      } else {
        // Move ball
        s.ballX += s.ballVX;
        s.ballY += s.ballVY;

        // Trail
        s.trail.push({ x: s.ballX, y: s.ballY });
        if (s.trail.length > TRAIL_LENGTH) s.trail.shift();

        // Wall collisions (left, right, top)
        if (s.ballX - BALL_RADIUS <= 0) {
          s.ballX = BALL_RADIUS;
          s.ballVX = Math.abs(s.ballVX);
          playSound(300, 0.05);
        }
        if (s.ballX + BALL_RADIUS >= CANVAS_W) {
          s.ballX = CANVAS_W - BALL_RADIUS;
          s.ballVX = -Math.abs(s.ballVX);
          playSound(300, 0.05);
        }
        if (s.ballY - BALL_RADIUS <= 0) {
          s.ballY = BALL_RADIUS;
          s.ballVY = Math.abs(s.ballVY);
          playSound(300, 0.05);
        }

        // Paddle collision
        const paddleTop = CANVAS_H - 40 - PADDLE_H / 2;
        const paddleLeft = s.paddleX - cfg.paddleW / 2;
        const paddleRight = s.paddleX + cfg.paddleW / 2;
        if (
          s.ballVY > 0 &&
          s.ballY + BALL_RADIUS >= paddleTop &&
          s.ballY + BALL_RADIUS <= paddleTop + PADDLE_H + 4 &&
          s.ballX >= paddleLeft &&
          s.ballX <= paddleRight
        ) {
          // Reflect with angle based on where ball hit paddle
          const hitPos = (s.ballX - paddleLeft) / cfg.paddleW; // 0 to 1
          const angle = -Math.PI / 2 + (hitPos - 0.5) * 1.2; // -150 to -30 degrees roughly
          const speed = Math.sqrt(s.ballVX * s.ballVX + s.ballVY * s.ballVY);
          s.ballVX = Math.cos(angle) * speed;
          s.ballVY = Math.sin(angle) * speed;
          s.ballY = paddleTop - BALL_RADIUS;
          playSound(600, 0.05);
        }

        // Ball falls below paddle - reset
        if (s.ballY - BALL_RADIUS > CANVAS_H) {
          resetBallOnPaddle(s);
          playSound(150, 0.2, 'square');
        }

        // Brick collisions
        for (const brick of s.bricks) {
          if (!brick.active) continue;
          const brickLeft = brick.x;
          const brickRight = brick.x + brick.w;
          const brickTop = brick.y;
          const brickBottom = brick.y + BRICK_H;

          // Simple AABB with ball center + radius
          if (
            s.ballX + BALL_RADIUS > brickLeft &&
            s.ballX - BALL_RADIUS < brickRight &&
            s.ballY + BALL_RADIUS > brickTop &&
            s.ballY - BALL_RADIUS < brickBottom
          ) {
            brick.active = false;
            s.bricksDestroyed++;
            s.score += 10;
            spawnParticles(brick.x + brick.w / 2, brick.y + BRICK_H / 2, brick.color, s);
            playSound(880, 0.08);

            // Determine bounce direction
            const overlapLeft = (s.ballX + BALL_RADIUS) - brickLeft;
            const overlapRight = brickRight - (s.ballX - BALL_RADIUS);
            const overlapTop = (s.ballY + BALL_RADIUS) - brickTop;
            const overlapBottom = brickBottom - (s.ballY - BALL_RADIUS);
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
              s.ballVX = -s.ballVX;
            } else {
              s.ballVY = -s.ballVY;
            }
            break; // Only hit one brick per frame
          }
        }
      }

      // Check if all bricks cleared
      const allCleared = s.bricks.every(b => !b.active);
      if (allCleared) {
        s.score += 200; // Perfect clear bonus
        spawnWave(s);
        resetBallOnPaddle(s);
        playSound(1200, 0.15);
      }

      // Update particles
      for (const p of s.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= delta;
      }
      s.particles = s.particles.filter(p => p.life > 0);

      // Update HUD
      setHud({
        score: s.score,
        timeLeft: Math.max(0, duration - s.elapsedTime),
        bricksDestroyed: s.bricksDestroyed,
        waves: s.waves,
        countdown: 0,
        backProgress: s.backTimer / 3,
      });

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
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Bricks
    for (const brick of s.bricks) {
      if (!brick.active) continue;
      ctx.fillStyle = brick.color;
      const bx = brick.x;
      const by = brick.y;
      const bw = brick.w;
      const bh = BRICK_H;
      const r = BRICK_RADIUS;
      ctx.beginPath();
      ctx.moveTo(bx + r, by);
      ctx.lineTo(bx + bw - r, by);
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
      ctx.lineTo(bx + bw, by + bh - r);
      ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
      ctx.lineTo(bx + r, by + bh);
      ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
      ctx.lineTo(bx, by + r);
      ctx.quadraticCurveTo(bx, by, bx + r, by);
      ctx.fill();

      // Highlight on top edge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + r, by + 0.5);
      ctx.lineTo(bx + bw - r, by + 0.5);
      ctx.stroke();
    }

    // Particles
    for (const p of s.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Ball trail
    for (let i = 0; i < s.trail.length; i++) {
      const t = s.trail[i];
      const alpha = (i / s.trail.length) * 0.4;
      const size = BALL_RADIUS * (0.3 + (i / s.trail.length) * 0.7);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Ball
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Paddle
    const paddleY = h - 40 - PADDLE_H / 2;
    const paddleLeft = s.paddleX - cfg.paddleW / 2;
    const pr = PADDLE_RADIUS;
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(paddleLeft + pr, paddleY);
    ctx.lineTo(paddleLeft + cfg.paddleW - pr, paddleY);
    ctx.quadraticCurveTo(paddleLeft + cfg.paddleW, paddleY, paddleLeft + cfg.paddleW, paddleY + pr);
    ctx.lineTo(paddleLeft + cfg.paddleW, paddleY + PADDLE_H - pr);
    ctx.quadraticCurveTo(paddleLeft + cfg.paddleW, paddleY + PADDLE_H, paddleLeft + cfg.paddleW - pr, paddleY + PADDLE_H);
    ctx.lineTo(paddleLeft + pr, paddleY + PADDLE_H);
    ctx.quadraticCurveTo(paddleLeft, paddleY + PADDLE_H, paddleLeft, paddleY + PADDLE_H - pr);
    ctx.lineTo(paddleLeft, paddleY + pr);
    ctx.quadraticCurveTo(paddleLeft, paddleY, paddleLeft + pr, paddleY);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Countdown overlay
    if (countdown > 0) {
      ctx.fillStyle = 'rgba(17, 17, 17, 0.7)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(countdown), w / 2, h / 2 + 40);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#111111]">
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
            <div className="text-3xl font-bold text-white tabular-nums">{hud.bricksDestroyed}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Bricks</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-right">
            <div className="text-3xl font-bold text-red-400 tabular-nums">{hud.waves}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Waves</div>
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
