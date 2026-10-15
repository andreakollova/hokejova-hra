'use client';

import { useRef, useState, useCallback, useEffect, MutableRefObject } from 'react';
import { GameInput, InputMode } from '@/lib/tracking';

interface SpaceGameProps {
  duration: 30 | 60 | 90;
  difficulty: 'easy' | 'medium' | 'hard';
  inputMode: InputMode;
  getGameInput: () => GameInput;
  onFinish: (result: SpaceResult) => void;
  onBackToMenu?: () => void;
}

export interface SpaceResult {
  score: number;
  blocksDestroyed: number;
  asteroidsHit: number;
  lives: number;
  duration: number;
  difficulty: string;
  inputMode: InputMode;
  sessionId: string;
}

const CANVAS_W = 800;
const CANVAS_H = 600;
const SHIP_W = 40;
const SHIP_H = 30;
const BULLET_SPEED = 8;
const BLOCK_ROWS = 3;
const BLOCK_COLS = 8;
const BLOCK_W = 70;
const BLOCK_H = 25;

const DIFFICULTY = {
  easy: { asteroidRate: 0.008, asteroidSpeed: 1.5, lives: 5, shootRate: 8, blockHp: 1 },
  medium: { asteroidRate: 0.015, asteroidSpeed: 2.5, lives: 3, shootRate: 12, blockHp: 2 },
  hard: { asteroidRate: 0.025, asteroidSpeed: 3.5, lives: 2, shootRate: 15, blockHp: 3 },
};

interface Bullet { x: number; y: number; active: boolean; }
interface Asteroid { x: number; y: number; size: number; speed: number; active: boolean; rotation: number; }
interface Block { x: number; y: number; hp: number; maxHp: number; active: boolean; color: string; }

const BLOCK_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#14b8a6'];

export default function SpaceGame({
  duration,
  difficulty,
  inputMode,
  getGameInput,
  onFinish,
  onBackToMenu,
}: SpaceGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = DIFFICULTY[difficulty];
  const sessionIdRef = useRef(crypto.randomUUID());

  const stateRef = useRef({
    shipX: CANVAS_W / 2,
    bullets: [] as Bullet[],
    asteroids: [] as Asteroid[],
    blocks: [] as Block[],
    score: 0,
    blocksDestroyed: 0,
    asteroidsHit: 0,
    lives: config.lives,
    elapsedTime: 0,
    started: false,
    finished: false,
    countdown: 3,
    gameStartWallTime: 0,
    shootCooldown: 0,
    backTimer: 0,
    invincible: 0, // invincibility frames after hit
    shakeTimer: 0,
  });

  const [hud, setHud] = useState({
    score: 0,
    lives: config.lives,
    timeLeft: duration as number,
    countdown: 3,
    blocksLeft: 0,
    backProgress: 0,
  });

  // Init blocks
  useEffect(() => {
    const s = stateRef.current;
    s.blocks = [];
    const startX = (CANVAS_W - BLOCK_COLS * (BLOCK_W + 6)) / 2 + BLOCK_W / 2;
    const startY = 60;
    for (let row = 0; row < BLOCK_ROWS; row++) {
      for (let col = 0; col < BLOCK_COLS; col++) {
        s.blocks.push({
          x: startX + col * (BLOCK_W + 6),
          y: startY + row * (BLOCK_H + 6),
          hp: config.blockHp,
          maxHp: config.blockHp,
          active: true,
          color: BLOCK_COLORS[(row * BLOCK_COLS + col) % BLOCK_COLORS.length],
        });
      }
    }
    s.lives = config.lives;
  }, [difficulty, config]);

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

      // Time or lives up
      const allBlocksDead = s.blocks.every(b => !b.active);
      if (s.elapsedTime >= duration || s.lives <= 0 || allBlocksDead) {
        s.finished = true;
        onFinish({
          score: s.score,
          blocksDestroyed: s.blocksDestroyed,
          asteroidsHit: s.asteroidsHit,
          lives: Math.max(0, s.lives),
          duration,
          difficulty,
          inputMode,
          sessionId: sessionIdRef.current,
        });
        return;
      }

      // Ship position from input
      if (input.active) {
        s.shipX = input.x * CANVAS_W;
      }
      s.shipX = Math.max(SHIP_W / 2, Math.min(CANVAS_W - SHIP_W / 2, s.shipX));

      // Auto-shoot
      s.shootCooldown -= delta;
      if (s.shootCooldown <= 0) {
        s.bullets.push({ x: s.shipX, y: CANVAS_H - 50, active: true });
        s.shootCooldown = 1 / config.shootRate;
        playSound(1200, 0.05);
      }

      // Move bullets
      for (const b of s.bullets) {
        if (!b.active) continue;
        b.y -= BULLET_SPEED;
        if (b.y < -10) b.active = false;

        // Hit blocks
        for (const block of s.blocks) {
          if (!block.active || !b.active) continue;
          if (b.x > block.x - BLOCK_W / 2 && b.x < block.x + BLOCK_W / 2 &&
              b.y > block.y - BLOCK_H / 2 && b.y < block.y + BLOCK_H / 2) {
            block.hp--;
            b.active = false;
            if (block.hp <= 0) {
              block.active = false;
              s.blocksDestroyed++;
              s.score += 100;
              playSound(880, 0.1);
            } else {
              s.score += 25;
              playSound(440, 0.05);
            }
          }
        }
      }
      s.bullets = s.bullets.filter(b => b.active);

      // Spawn asteroids
      if (Math.random() < config.asteroidRate) {
        const size = 15 + Math.random() * 25;
        s.asteroids.push({
          x: Math.random() * CANVAS_W,
          y: -size,
          size,
          speed: config.asteroidSpeed * (0.7 + Math.random() * 0.6),
          active: true,
          rotation: Math.random() * Math.PI * 2,
        });
      }

      // Move asteroids
      if (s.invincible > 0) s.invincible -= delta;
      for (const a of s.asteroids) {
        if (!a.active) continue;
        a.y += a.speed;
        a.rotation += delta * 2;
        if (a.y > CANVAS_H + 50) { a.active = false; continue; }

        // Hit ship
        if (s.invincible <= 0) {
          const dx = a.x - s.shipX;
          const dy = a.y - (CANVAS_H - 35);
          if (Math.sqrt(dx * dx + dy * dy) < a.size / 2 + SHIP_W / 3) {
            s.lives--;
            s.asteroidsHit++;
            a.active = false;
            s.invincible = 1.5;
            s.shakeTimer = 0.3;
            playSound(150, 0.3, 'square');
          }
        }
      }
      s.asteroids = s.asteroids.filter(a => a.active);

      // Update HUD periodically
      setHud({
        score: s.score,
        lives: s.lives,
        timeLeft: Math.max(0, duration - s.elapsedTime),
        countdown: 0,
        blocksLeft: s.blocks.filter(b => b.active).length,
        backProgress: s.backTimer / 3,
      });

      if (s.shakeTimer > 0) s.shakeTimer -= delta;
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

    // Shake effect
    ctx.save();
    if (s.shakeTimer > 0) {
      ctx.translate(Math.random() * 6 - 3, Math.random() * 6 - 3);
    }

    // Background - dark space
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const sx = (i * 137.5 + s.elapsedTime * 10) % w;
      const sy = (i * 97.3 + s.elapsedTime * (5 + i % 3)) % h;
      const size = i % 3 === 0 ? 2 : 1;
      ctx.globalAlpha = 0.3 + (i % 5) * 0.15;
      ctx.fillRect(sx, sy, size, size);
    }
    ctx.globalAlpha = 1;

    // Blocks
    for (const block of s.blocks) {
      if (!block.active) continue;
      const alpha = block.hp / block.maxHp;
      ctx.globalAlpha = 0.4 + alpha * 0.6;
      ctx.fillStyle = block.color;

      // Rounded rect
      const bx = block.x - BLOCK_W / 2;
      const by = block.y - BLOCK_H / 2;
      const r = 5;
      ctx.beginPath();
      ctx.moveTo(bx + r, by);
      ctx.lineTo(bx + BLOCK_W - r, by);
      ctx.quadraticCurveTo(bx + BLOCK_W, by, bx + BLOCK_W, by + r);
      ctx.lineTo(bx + BLOCK_W, by + BLOCK_H - r);
      ctx.quadraticCurveTo(bx + BLOCK_W, by + BLOCK_H, bx + BLOCK_W - r, by + BLOCK_H);
      ctx.lineTo(bx + r, by + BLOCK_H);
      ctx.quadraticCurveTo(bx, by + BLOCK_H, bx, by + BLOCK_H - r);
      ctx.lineTo(bx, by + r);
      ctx.quadraticCurveTo(bx, by, bx + r, by);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Bullets
    for (const b of s.bullets) {
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 8;
      ctx.fillRect(b.x - 2, b.y - 6, 4, 12);
      ctx.shadowBlur = 0;
    }

    // Asteroids
    for (const a of s.asteroids) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rotation);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      const sides = 7;
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const r = a.size / 2 * (0.7 + ((i * 3 + 1) % 4) * 0.1);
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Ship
    const shipY = h - 35;
    const blinking = s.invincible > 0 && Math.floor(s.invincible * 10) % 2 === 0;
    if (!blinking) {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(s.shipX, shipY - SHIP_H / 2);
      ctx.lineTo(s.shipX - SHIP_W / 2, shipY + SHIP_H / 2);
      ctx.lineTo(s.shipX + SHIP_W / 2, shipY + SHIP_H / 2);
      ctx.closePath();
      ctx.fill();

      // Engine glow
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(s.shipX - 8, shipY + SHIP_H / 2);
      ctx.lineTo(s.shipX, shipY + SHIP_H / 2 + 10 + Math.random() * 5);
      ctx.lineTo(s.shipX + 8, shipY + SHIP_H / 2);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    // Countdown overlay
    if (countdown > 0) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(countdown), w / 2, h / 2 + 40);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0f172a]">
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
            <div className="text-xs text-white/50 uppercase tracking-wider">Skore</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-center">
            <div className="text-3xl font-bold text-white tabular-nums">{Math.ceil(hud.timeLeft)}s</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Cas</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-center">
            <div className="text-3xl font-bold text-white tabular-nums">{hud.blocksLeft}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Bloky</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-right">
            <div className="text-3xl font-bold text-red-400 tabular-nums">{'❤'.repeat(Math.max(0, hud.lives))}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Zivoty</div>
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
          <span className="text-xs text-yellow-400">Navrat</span>
        </div>
      )}
    </div>
  );
}
