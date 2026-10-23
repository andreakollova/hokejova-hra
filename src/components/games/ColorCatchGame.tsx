'use client';

import { useRef, useState, useEffect } from 'react';
import { GameInput, InputMode } from '@/lib/tracking';

interface ColorCatchGameProps {
  duration: 30 | 60 | 90;
  difficulty: 'easy' | 'medium' | 'hard';
  inputMode: InputMode;
  getGameInput: () => GameInput;
  onFinish: (result: ColorCatchResult) => void;
  onBackToMenu?: () => void;
}

export interface ColorCatchResult {
  score: number;
  caught: number;
  wrong: number;
  missed: number;
  duration: number;
  difficulty: string;
  inputMode: InputMode;
  sessionId: string;
}

const CANVAS_W = 1200;
const CANVAS_H = 800;

const BUCKET_Y = 700;
const BUCKET_W = 80;
const BUCKET_H = 60;
const BUCKET_R = 12;
const BALL_RADIUS = 20;

const BUCKETS = [
  { x: 300, color: '#3b82f6', label: 'Blue' },
  { x: 600, color: '#ef4444', label: 'Red' },
  { x: 900, color: '#eab308', label: 'Yellow' },
];

const BALL_COLORS = ['#3b82f6', '#ef4444', '#eab308'];

const DIFFICULTY = {
  easy:   { speed: 2, interval: 1.5 },
  medium: { speed: 3.5, interval: 1.0 },
  hard:   { speed: 5, interval: 0.6 },
};

interface FallingBall {
  x: number;
  y: number;
  color: string;
  id: number;
  active: boolean;
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

export default function ColorCatchGame({
  duration,
  difficulty,
  inputMode,
  getGameInput,
  onFinish,
  onBackToMenu,
}: ColorCatchGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = DIFFICULTY[difficulty];
  const sessionIdRef = useRef(crypto.randomUUID());

  const stateRef = useRef({
    activeBucket: 1, // 0=blue, 1=red, 2=yellow
    balls: [] as FallingBall[],
    particles: [] as Particle[],
    score: 0,
    caught: 0,
    wrong: 0,
    missed: 0,
    elapsedTime: 0,
    started: false,
    finished: false,
    countdown: 3,
    gameStartWallTime: 0,
    spawnTimer: 0,
    nextId: 0,
    backTimer: 0,
    flashTimer: 0,
    flashColor: '',
  });

  const [hud, setHud] = useState({
    score: 0,
    timeLeft: duration as number,
    countdown: 3,
    caught: 0,
    accuracy: 100,
    backProgress: 0,
  });

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
        osc.frequency.value = freq; osc.type = type; gain.gain.value = 0.08;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
        osc.stop(actx.currentTime + dur);
      } catch {}
    };

    const spawnParticles = (x: number, y: number, color: string) => {
      const s = stateRef.current;
      const count = 14;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 4;
        s.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 1,
          maxLife: 1,
          color,
          size: 3 + Math.random() * 5,
        });
      }
    };

    const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
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

      // Determine active bucket from input.x
      if (input.active) {
        if (input.x < 0.33) {
          s.activeBucket = 0; // blue
        } else if (input.x < 0.66) {
          s.activeBucket = 1; // red
        } else {
          s.activeBucket = 2; // yellow
        }
      }

      // Countdown
      if (!s.started) {
        s.countdown -= delta;
        if (s.countdown <= 0) { s.started = true; s.gameStartWallTime = performance.now(); }
        setHud(h => ({ ...h, countdown: Math.ceil(Math.max(0, s.countdown)), backProgress: s.backTimer / 5 }));
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
          caught: s.caught,
          wrong: s.wrong,
          missed: s.missed,
          duration,
          difficulty,
          inputMode,
          sessionId: sessionIdRef.current,
        });
        return;
      }

      // Flash timer
      if (s.flashTimer > 0) {
        s.flashTimer -= delta;
      }

      // Spawn balls
      s.spawnTimer -= delta;
      if (s.spawnTimer <= 0) {
        s.spawnTimer = config.interval;
        const color = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
        const minX = 100;
        const maxX = CANVAS_W - 100;
        const x = minX + Math.random() * (maxX - minX);
        s.balls.push({
          x,
          y: -BALL_RADIUS,
          color,
          id: s.nextId++,
          active: true,
        });
      }

      // Move balls and check collisions
      for (const ball of s.balls) {
        if (!ball.active) continue;
        ball.y += config.speed;

        // Check if ball reached bucket level
        if (ball.y >= BUCKET_Y - BUCKET_H / 2) {
          ball.active = false;

          // Which bucket is closest to the ball's x?
          let closestBucket = -1;
          let closestDist = Infinity;
          for (let i = 0; i < BUCKETS.length; i++) {
            const d = Math.abs(ball.x - BUCKETS[i].x);
            if (d < closestDist) {
              closestDist = d;
              closestBucket = i;
            }
          }

          // Is ball over any bucket?
          const overBucket = closestDist < BUCKET_W;

          if (overBucket && closestBucket === s.activeBucket) {
            // Check color match
            if (ball.color === BUCKETS[closestBucket].color) {
              // Correct catch
              s.score += 100;
              s.caught++;
              spawnParticles(BUCKETS[closestBucket].x, BUCKET_Y - BUCKET_H / 2, ball.color);
              playSound(880, 0.12);
            } else {
              // Wrong bucket color
              s.score -= 50;
              s.wrong++;
              s.flashTimer = 0.3;
              s.flashColor = '#ef4444';
              playSound(220, 0.2, 'square');
            }
          } else if (overBucket && ball.color === BUCKETS[closestBucket].color && closestBucket !== s.activeBucket) {
            // Ball landed on correct color bucket but it wasn't active - wrong
            s.score -= 50;
            s.wrong++;
            s.flashTimer = 0.3;
            s.flashColor = '#ef4444';
            playSound(220, 0.2, 'square');
          } else {
            // Miss - ball didn't land in active bucket or no matching bucket
            s.missed++;
            playSound(150, 0.15, 'triangle');
          }
        }
      }
      s.balls = s.balls.filter(b => b.active || b.y < CANVAS_H + 50);

      // Update particles
      for (const p of s.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 6 * delta;
        p.life -= delta * 2;
      }
      s.particles = s.particles.filter(p => p.life > 0);

      // Update HUD
      const total = s.caught + s.wrong + s.missed;
      setHud({
        score: s.score,
        timeLeft: Math.max(0, duration - s.elapsedTime),
        countdown: 0,
        caught: s.caught,
        accuracy: total > 0 ? Math.round((s.caught / total) * 100) : 100,
        backProgress: s.backTimer / 5,
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

    // Dark background
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, w, h);

    // Red flash overlay
    if (s.flashTimer > 0) {
      ctx.fillStyle = `rgba(239, 68, 68, ${s.flashTimer * 0.4})`;
      ctx.fillRect(0, 0, w, h);
    }

    // Subtle track/road lines at bottom
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, h - 150); ctx.lineTo(x, h); ctx.stroke();
    }
    // Horizontal road line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, h - 150); ctx.lineTo(w, h - 150); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, h - 30); ctx.lineTo(w, h - 30); ctx.stroke();

    // Draw guide lines from top to buckets
    for (let i = 0; i < BUCKETS.length; i++) {
      ctx.strokeStyle = `rgba(255, 255, 255, 0.03)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.moveTo(BUCKETS[i].x, 0);
      ctx.lineTo(BUCKETS[i].x, BUCKET_Y - BUCKET_H);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw buckets
    for (let i = 0; i < BUCKETS.length; i++) {
      const bucket = BUCKETS[i];
      const isActive = i === s.activeBucket;
      const bx = bucket.x - BUCKET_W / 2;
      const by = isActive ? BUCKET_Y - BUCKET_H - 8 : BUCKET_Y - BUCKET_H;

      // Glow for active bucket
      if (isActive) {
        ctx.shadowColor = bucket.color;
        ctx.shadowBlur = 25;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      // Bucket body
      const drawRR = (x: number, y: number, bw: number, bh: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + bw - r, y);
        ctx.quadraticCurveTo(x + bw, y, x + bw, y + r);
        ctx.lineTo(x + bw, y + bh - r);
        ctx.quadraticCurveTo(x + bw, y + bh, x + bw - r, y + bh);
        ctx.lineTo(x + r, y + bh);
        ctx.quadraticCurveTo(x, y + bh, x, y + bh - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      };

      drawRR(bx, by, BUCKET_W, BUCKET_H, BUCKET_R);
      ctx.fillStyle = bucket.color;
      ctx.fill();

      // Lighter inner highlight
      drawRR(bx + 6, by + 4, BUCKET_W - 12, BUCKET_H - 16, BUCKET_R - 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Active indicator triangle
      if (isActive) {
        ctx.beginPath();
        ctx.moveTo(bucket.x, by - 14);
        ctx.lineTo(bucket.x - 8, by - 24);
        ctx.lineTo(bucket.x + 8, by - 24);
        ctx.closePath();
        ctx.fillStyle = bucket.color;
        ctx.fill();
      }
    }

    // Draw falling balls
    for (const ball of s.balls) {
      if (!ball.active) continue;

      // Ball shadow
      ctx.beginPath();
      ctx.ellipse(ball.x + 2, ball.y + 3, BALL_RADIUS, BALL_RADIUS * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();

      // Ball body
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      const ballGrad = ctx.createRadialGradient(ball.x - 5, ball.y - 5, 2, ball.x, ball.y, BALL_RADIUS);
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.4, ball.color);
      ballGrad.addColorStop(1, ball.color);
      ctx.fillStyle = ballGrad;
      ctx.fill();

      // Ball outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw particles
    for (const p of s.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Countdown overlay
    if (countdown > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(countdown), w / 2, h / 2);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#111111]">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="max-w-full max-h-full"
        style={{ imageRendering: 'auto' }}
      />

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-start max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3">
            <div className="text-3xl font-bold text-amber-400 tabular-nums">{hud.score}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Score</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-center">
            <div className="text-3xl font-bold text-white tabular-nums">{Math.ceil(hud.timeLeft)}s</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Time</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-center">
            <div className="text-3xl font-bold text-green-400 tabular-nums">{hud.caught}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Caught</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-center">
            <div className="text-3xl font-bold text-white tabular-nums">{hud.accuracy}%</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Back-to-menu progress (5s hold) */}
      {hud.backProgress > 0.03 && (
        <div className="absolute top-16 right-4 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 pointer-events-none">
          <svg className="w-5 h-5" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#555" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#ef4444" strokeWidth="3"
              strokeDasharray={`${hud.backProgress * 94.2} 94.2`} strokeLinecap="round" transform="rotate(-90 18 18)" />
          </svg>
          <span className="text-xs text-red-400">Back to menu</span>
        </div>
      )}
    </div>
  );
}
