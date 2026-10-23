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

const COLORS = [
  { name: 'blue', fill: '#3b82f6', light: '#93c5fd', dark: '#1d4ed8', carSrc: '/images/car-blue.png' },
  { name: 'red', fill: '#ef4444', light: '#fca5a5', dark: '#b91c1c', carSrc: '/images/car-red.png' },
  { name: 'yellow', fill: '#eab308', light: '#fde047', dark: '#a16207', carSrc: '/images/car-yellow.png' },
];

const LANE_X = [CANVAS_W * 0.25, CANVAS_W * 0.5, CANVAS_W * 0.75];
const CATCHER_Y = CANVAS_H - 100;
const CATCHER_R = 45;

const DIFFICULTY = {
  easy:   { fallSpeed: 2.63, spawnInterval: 1.71 },
  medium: { fallSpeed: 4.2, spawnInterval: 1.14 },
  hard:   { fallSpeed: 5.78, spawnInterval: 0.67 },
};

interface FallingBall {
  lane: number;
  colorIdx: number;
  y: number;
  caught: boolean;
  missed: boolean;
  isCar: boolean;
}

interface CatchParticle {
  x: number; y: number; vx: number; vy: number; life: number; color: string;
}

export default function ColorCatchGame({
  duration, difficulty, inputMode, getGameInput, onFinish, onBackToMenu,
}: ColorCatchGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cfg = DIFFICULTY[difficulty];
  const sessionIdRef = useRef(crypto.randomUUID());
  const carImagesRef = useRef<HTMLImageElement[]>([]);

  const stateRef = useRef({
    activeLane: 1,
    balls: [] as FallingBall[],
    particles: [] as CatchParticle[],
    score: 0,
    caught: 0,
    wrong: 0,
    missed: 0,
    spawnTimer: 1,
    elapsedTime: 0,
    started: false,
    finished: false,
    countdown: 3,
    gameStartWallTime: 0,
    backTimer: 0,
    flashTimer: 0,
    flashType: '' as '' | 'correct' | 'wrong',
  });

  const [hud, setHud] = useState({
    score: 0, timeLeft: duration as number, caught: 0,
    accuracy: 0, countdown: 3, backProgress: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load car images
    const carImages: HTMLImageElement[] = [];
    let imagesLoaded = 0;
    COLORS.forEach((c, i) => {
      const img = new Image();
      img.src = c.carSrc;
      img.onload = () => { imagesLoaded++; };
      carImages[i] = img;
    });
    carImagesRef.current = carImages;

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
      const delta = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0;
      lastTime = timestamp;
      const s = stateRef.current;

      if (s.finished) { requestAnimationFrame(loop); return; }
      const input = getGameInput();

      // Back to menu
      const inExit = input.active && input.x > 0.85 && input.y < 0.15;
      if (inExit) { s.backTimer += delta; if (s.backTimer >= 5 && onBackToMenu) { s.finished = true; onBackToMenu(); return; } }
      else { s.backTimer = 0; }

      // Countdown
      if (!s.started) {
        s.countdown -= delta;
        if (s.countdown <= 0) { s.started = true; s.gameStartWallTime = performance.now(); }
        setHud(h => ({ ...h, countdown: Math.ceil(Math.max(0, s.countdown)), backProgress: s.backTimer / 5 }));
        draw(ctx, s, Math.ceil(Math.max(0, s.countdown)));
        requestAnimationFrame(loop);
        return;
      }

      s.elapsedTime = (performance.now() - s.gameStartWallTime) / 1000;
      if (s.elapsedTime >= duration) {
        s.finished = true;
        const total = s.caught + s.wrong + s.missed;
        onFinish({
          score: s.score, caught: s.caught, wrong: s.wrong, missed: s.missed,
          duration, difficulty, inputMode, sessionId: sessionIdRef.current,
        });
        return;
      }

      // Player lane from input
      if (input.active) {
        if (input.x < 0.33) s.activeLane = 0;
        else if (input.x < 0.66) s.activeLane = 1;
        else s.activeLane = 2;
      }

      // Spawn balls
      s.spawnTimer -= delta;
      if (s.spawnTimer <= 0) {
        const lane = Math.floor(Math.random() * 3);
        const colorIdx = Math.floor(Math.random() * 3);
        const isCar = Math.random() < 0.3; // ~30% chance for a car (bonus)
        s.balls.push({ lane, colorIdx, y: -30, caught: false, missed: false, isCar });
        s.spawnTimer = cfg.spawnInterval * (0.8 + Math.random() * 0.4);
      }

      // Move balls and check catches
      for (const ball of s.balls) {
        if (ball.caught || ball.missed) continue;
        ball.y += cfg.fallSpeed;

        // Check if ball reaches catcher level
        if (ball.y >= CATCHER_Y - 10 && ball.y <= CATCHER_Y + 20) {
          if (s.activeLane === ball.lane) {
            // Player is in this lane
            if (ball.colorIdx === ball.lane) {
              // Correct color match
              ball.caught = true;
              s.caught++;
              s.score += ball.isCar ? 250 : 100;
              s.flashTimer = 0.3;
              s.flashType = 'correct';
              playSound(880, 0.1);
              // Particles - more and bigger for cars
              const pCount = ball.isCar ? 24 : 12;
              const pSpeed = ball.isCar ? 8 : 4;
              const pLife = ball.isCar ? 1.0 : 0.6;
              for (let i = 0; i < pCount; i++) {
                const angle = (i / pCount) * Math.PI * 2;
                const speed = pSpeed + Math.random() * pSpeed;
                s.particles.push({
                  x: LANE_X[ball.lane], y: CATCHER_Y,
                  vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3,
                  life: pLife + Math.random() * 0.3, color: COLORS[ball.colorIdx].fill,
                });
              }
            } else {
              // Wrong color - no penalty, just miss it
              ball.caught = true;
              s.wrong++;
              s.flashTimer = 0.3;
              s.flashType = 'wrong';
              playSound(200, 0.2, 'square');
            }
          }
        }

        // Ball fell past all catchers
        if (ball.y > CANVAS_H + 30) {
          if (!ball.caught) {
            ball.missed = true;
            s.missed++;
          }
        }
      }

      // Clean old balls
      s.balls = s.balls.filter(b => b.y < CANVAS_H + 50);

      // Particles
      for (const p of s.particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 8 * delta; p.life -= delta;
      }
      s.particles = s.particles.filter(p => p.life > 0);

      // Flash
      if (s.flashTimer > 0) s.flashTimer -= delta;

      const total = s.caught + s.wrong + s.missed;
      setHud({
        score: s.score, timeLeft: Math.max(0, duration - s.elapsedTime),
        caught: s.caught, accuracy: total > 0 ? Math.round((s.caught / total) * 100) : 100,
        countdown: 0, backProgress: s.backTimer / 5,
      });

      draw(ctx, s, 0);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return () => { running = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, difficulty]);

  const draw = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current, countdown: number) => {
    const w = CANVAS_W;
    const h = CANVAS_H;

    // Background - dark with subtle track
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, 0, w, h);

    // Road/track at bottom
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, h - 160, w, 160);
    // Road lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.setLineDash([30, 20]);
    ctx.beginPath(); ctx.moveTo(0, h - 160); ctx.lineTo(w, h - 160); ctx.stroke();
    ctx.setLineDash([]);
    // Lane dividers
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.setLineDash([15, 25]);
    ctx.beginPath(); ctx.moveTo(w / 3, 0); ctx.lineTo(w / 3, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 2 / 3, 0); ctx.lineTo(w * 2 / 3, h); ctx.stroke();
    ctx.setLineDash([]);

    // Lane labels at top
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = COLORS[i].fill + '30';
      ctx.fillRect(i * (w / 3), 0, w / 3, h);
    }

    // Active lane highlight
    ctx.fillStyle = COLORS[s.activeLane].fill + '15';
    ctx.fillRect(s.activeLane * (w / 3), 0, w / 3, h);

    // Catchers (bowls/cups) - 3 colored circles
    for (let i = 0; i < 3; i++) {
      const cx = LANE_X[i];
      const isActive = s.activeLane === i;
      const cy = isActive ? CATCHER_Y - 8 : CATCHER_Y;
      const r = isActive ? CATCHER_R + 5 : CATCHER_R;

      // Glow for active
      if (isActive) {
        ctx.shadowColor = COLORS[i].fill;
        ctx.shadowBlur = 25;
      }

      // Bowl shape - half circle (cup)
      ctx.fillStyle = COLORS[i].fill;
      ctx.beginPath();
      ctx.arc(cx, cy + 10, r, 0, Math.PI);
      ctx.fill();

      // Top rim
      ctx.fillStyle = COLORS[i].light;
      ctx.fillRect(cx - r, cy + 5, r * 2, 8);

      // Inner dark
      ctx.fillStyle = COLORS[i].dark;
      ctx.beginPath();
      ctx.arc(cx, cy + 15, r - 8, 0, Math.PI);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Color label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(COLORS[i].name.toUpperCase(), cx, cy + r + 30);
    }

    // Arrow indicator above active catcher
    const acx = LANE_X[s.activeLane];
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(acx, CATCHER_Y - CATCHER_R - 20);
    ctx.lineTo(acx - 10, CATCHER_Y - CATCHER_R - 35);
    ctx.lineTo(acx + 10, CATCHER_Y - CATCHER_R - 35);
    ctx.closePath();
    ctx.fill();

    // Falling balls and cars
    const carW = 80;
    const carH = 100;
    for (const ball of s.balls) {
      if (ball.caught || ball.missed) continue;
      const bx = LANE_X[ball.lane];
      const color = COLORS[ball.colorIdx];

      if (ball.isCar) {
        // F1 car (bonus item)
        const carImg = carImagesRef.current[ball.colorIdx];

        // Trail
        ctx.fillStyle = color.fill + '30';
        ctx.fillRect(bx - 5, ball.y - 60, 10, 60);

        // Car image
        if (carImg && carImg.complete) {
          ctx.drawImage(carImg, bx - carW / 2, ball.y - carH / 2, carW, carH);
        } else {
          ctx.fillStyle = color.fill;
          ctx.beginPath();
          ctx.arc(bx, ball.y, 30, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Regular ball
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(bx + 3, ball.y + 3, 22, 0, Math.PI * 2);
        ctx.fill();

        // Ball
        ctx.fillStyle = color.fill;
        ctx.beginPath();
        ctx.arc(bx, ball.y, 22, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = color.light;
        ctx.beginPath();
        ctx.arc(bx - 6, ball.y - 6, 8, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        ctx.fillStyle = color.fill + '40';
        ctx.fillRect(bx - 3, ball.y - 40, 6, 40);
      }
    }

    // Particles
    for (const p of s.particles) {
      ctx.globalAlpha = Math.max(0, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    }
    ctx.globalAlpha = 1;

    // Flash
    if (s.flashTimer > 0) {
      if (s.flashType === 'correct') {
        ctx.fillStyle = `rgba(34, 197, 94, ${s.flashTimer * 0.15})`;
      } else {
        ctx.fillStyle = `rgba(239, 68, 68, ${s.flashTimer * 0.15})`;
      }
      ctx.fillRect(0, 0, w, h);
    }

    // Countdown
    if (countdown > 0) {
      ctx.fillStyle = 'rgba(15, 15, 15, 0.8)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(countdown), w / 2, h / 2 + 40);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0f0f0f]">
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="max-w-full max-h-full" />

      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-start max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 shadow-sm">
            <div className="text-3xl font-bold text-amber-400 tabular-nums">{hud.score}</div>
            <div className="text-xs text-white/70 uppercase tracking-wider">Score</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-white tabular-nums">{Math.ceil(hud.timeLeft)}s</div>
            <div className="text-xs text-white/70 uppercase tracking-wider">Time</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-400 tabular-nums">{hud.caught}</div>
            <div className="text-xs text-white/70 uppercase tracking-wider">Caught</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-right shadow-sm">
            <div className="text-3xl font-bold text-blue-400 tabular-nums">{hud.accuracy}%</div>
            <div className="text-xs text-white/70 uppercase tracking-wider">Accuracy</div>
          </div>
        </div>
      </div>

      {hud.backProgress > 0.05 && (
        <div className="absolute top-16 right-4 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 pointer-events-none shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#333" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#eab308" strokeWidth="3"
              strokeDasharray={`${hud.backProgress * 94.2} 94.2`} strokeLinecap="round" transform="rotate(-90 18 18)" />
          </svg>
          <span className="text-xs text-amber-400 font-medium">Back</span>
        </div>
      )}
    </div>
  );
}
