'use client';

import { useRef, useState, useEffect } from 'react';
import { GameInput, InputMode } from '@/lib/tracking';

interface JellyStackGameProps {
  duration: 30 | 60 | 90;
  difficulty: 'easy' | 'medium' | 'hard';
  inputMode: InputMode;
  getGameInput: () => GameInput;
  onFinish: (result: JellyStackResult) => void;
  onBackToMenu?: () => void;
  dropSide?: 'center' | 'left' | 'right';
}

export interface JellyStackResult {
  score: number;
  perfectStacks: number;
  goodStacks: number;
  totalStacks: number;
  lives: number;
  duration: number;
  difficulty: string;
  inputMode: InputMode;
  sessionId: string;
}

const CANVAS_W = 600;
const CANVAS_H = 800;
const BLOCK_H = 30;
const START_BLOCK_W = 320;
const STACK_BASE_Y = 700;

const JELLY_COLORS = ['#f472b6', '#a78bfa', '#fbbf24', '#34d399', '#60a5fa'];

const DIFFICULTY = {
  easy:   { speed: 2, speedInc: 0.15, lives: 3 },
  medium: { speed: 3.5, speedInc: 0.25, lives: 3 },
  hard:   { speed: 5, speedInc: 0.4, lives: 2 },
};

interface StackBlock {
  x: number;
  y: number;
  w: number;
  color: string;
}

export default function JellyStackGame({
  duration,
  difficulty,
  inputMode,
  getGameInput,
  onFinish,
  onBackToMenu,
  dropSide,
}: JellyStackGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = DIFFICULTY[difficulty];
  const ds = dropSide || 'center';
  const sessionIdRef = useRef(crypto.randomUUID());

  const stateRef = useRef({
    stack: [] as StackBlock[],
    currentBlock: { x: 0, w: START_BLOCK_W, dir: 1, speed: config.speed, color: JELLY_COLORS[0] },
    score: 0,
    perfectStacks: 0,
    goodStacks: 0,
    totalStacks: 0,
    lives: config.lives,
    elapsedTime: 0,
    started: false,
    finished: false,
    countdown: 3,
    gameStartWallTime: 0,
    backTimer: 0,
    dropAnim: null as { x: number; y: number; w: number; targetY: number; color: string; } | null,
    trimFallAnim: null as { x: number; y: number; w: number; vy: number; color: string; } | null,
    flashTimer: 0,
    flashType: '' as '' | 'perfect' | 'good' | 'ok' | 'miss',
    cameraOffsetY: 0,
    lastDropX: -1,
    wasLeft: false,
    currentDropSide: 'left' as 'left' | 'right',
    consecutiveMisses: 0,
  });

  const [hud, setHud] = useState({
    score: 0,
    lives: config.lives,
    timeLeft: duration as number,
    countdown: 3,
    stacks: 0,
    backProgress: 0,
  });

  // Init base block
  useEffect(() => {
    const s = stateRef.current;
    s.stack = [{ x: CANVAS_W / 2, y: STACK_BASE_Y, w: START_BLOCK_W, color: '#94a3b8' }];
    s.currentBlock = { x: 0, w: START_BLOCK_W, dir: 1, speed: config.speed, color: JELLY_COLORS[0] };
    s.lives = config.lives;
    s.cameraOffsetY = 0;
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

    const dropBlock = (s: typeof stateRef.current) => {
      const top = s.stack[s.stack.length - 1];
      const cur = s.currentBlock;
      const curLeft = cur.x - cur.w / 2;
      const curRight = cur.x + cur.w / 2;
      const topLeft = top.x - top.w / 2;
      const topRight = top.x + top.w / 2;

      const overlapLeft = Math.max(curLeft, topLeft);
      const overlapRight = Math.min(curRight, topRight);
      const overlapW = overlapRight - overlapLeft;

      if (overlapW <= 0) {
        // Miss
        s.flashTimer = 0.5;
        s.flashType = 'miss';
        s.consecutiveMisses++;
        playSound(150, 0.3, 'square');
        s.trimFallAnim = { x: cur.x, y: top.y - BLOCK_H, w: cur.w, vy: 0, color: cur.color };

        // After 5 consecutive misses, reset with new full-width base
        if (s.consecutiveMisses >= 5) {
          s.consecutiveMisses = 0;
          const topBlock = s.stack[s.stack.length - 1];
          const resetY = topBlock.y - BLOCK_H;
          s.stack.push({ x: CANVAS_W / 2, y: resetY, w: START_BLOCK_W, color: '#94a3b8' });
          s.cameraOffsetY = Math.max(0, STACK_BASE_Y - resetY - 200);
        }
      } else {
        s.consecutiveMisses = 0; // Reset on any hit
        const overlap = overlapW / top.w;
        const newX = overlapLeft + overlapW / 2;
        const newY = top.y - BLOCK_H;

        // Trim fall animation for the trimmed part
        if (overlapW < cur.w - 2) {
          const trimSide = curLeft < topLeft ? 'left' : 'right';
          const trimW = cur.w - overlapW;
          const trimX = trimSide === 'left' ? curLeft + trimW / 2 : curRight - trimW / 2;
          s.trimFallAnim = { x: trimX, y: newY, w: trimW, vy: 0, color: cur.color };
        }

        s.stack.push({ x: newX, y: newY, w: overlapW, color: cur.color });
        s.totalStacks++;

        if (overlap > 0.95) {
          s.score += 100;
          s.perfectStacks++;
          s.flashTimer = 0.6;
          s.flashType = 'perfect';
          playSound(880, 0.15);
          playSound(1320, 0.15);
        } else if (overlap > 0.8) {
          s.score += 50;
          s.goodStacks++;
          s.flashTimer = 0.4;
          s.flashType = 'good';
          playSound(660, 0.1);
        } else {
          s.score += 25;
          s.flashTimer = 0.3;
          s.flashType = 'ok';
          playSound(440, 0.08);
        }

        // Drop animation
        s.dropAnim = { x: newX, y: top.y - BLOCK_H - 60, w: overlapW, targetY: newY, color: cur.color };
      }

      // Next block
      const colorIdx = (s.totalStacks + 1) % JELLY_COLORS.length;
      const topBlock = s.stack[s.stack.length - 1];
      s.currentBlock = {
        x: 0,
        w: topBlock.w,
        dir: 1,
        speed: config.speed + s.totalStacks * config.speedInc,
        color: JELLY_COLORS[colorIdx],
      };
      s.lastDropX = -1;
      s.wasLeft = false;

      // Camera follows stack
      const stackTopY = s.stack[s.stack.length - 1].y;
      const targetOffset = Math.max(0, STACK_BASE_Y - stackTopY - 200);
      s.cameraOffsetY = targetOffset;
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

      // Time up (no lives limit — play the full duration)
      if (s.elapsedTime >= duration) {
        s.finished = true;
        onFinish({
          score: s.score,
          perfectStacks: s.perfectStacks,
          goodStacks: s.goodStacks,
          totalStacks: s.totalStacks,
          lives: Math.max(0, s.lives),
          duration,
          difficulty,
          inputMode,
          sessionId: sessionIdRef.current,
        });
        return;
      }

      // Move current block left-right
      s.currentBlock.x += s.currentBlock.dir * s.currentBlock.speed;
      if (s.currentBlock.x + s.currentBlock.w / 2 > CANVAS_W) {
        s.currentBlock.dir = -1;
        s.currentBlock.x = CANVAS_W - s.currentBlock.w / 2;
      }
      if (s.currentBlock.x - s.currentBlock.w / 2 < 0) {
        s.currentBlock.dir = 1;
        s.currentBlock.x = s.currentBlock.w / 2;
      }

      // Drop: ball moves into current drop side (wide zones at edges)
      const inDropZone = input.active && (
        s.currentDropSide === 'left' ? input.x < 0.25 : input.x > 0.75
      );
      if (inDropZone && !s.wasLeft) {
        if (!s.dropAnim) {
          dropBlock(s);
          s.currentDropSide = s.currentDropSide === 'left' ? 'right' : 'left';

          // Every 5 stacks, reset: new full-width base block on top
          if (s.totalStacks > 0 && s.totalStacks % 5 === 0) {
            const topBlock = s.stack[s.stack.length - 1];
            const resetY = topBlock.y - BLOCK_H;
            s.stack.push({ x: CANVAS_W / 2, y: resetY, w: START_BLOCK_W, color: '#94a3b8' });
            s.currentBlock.w = START_BLOCK_W;
            s.cameraOffsetY = Math.max(0, STACK_BASE_Y - resetY - 200);
          }
        }
      }
      s.wasLeft = inDropZone;

      // Drop animation
      if (s.dropAnim) {
        s.dropAnim.y += 8;
        if (s.dropAnim.y >= s.dropAnim.targetY) {
          s.dropAnim = null;
        }
      }

      // Trim fall animation
      if (s.trimFallAnim) {
        s.trimFallAnim.vy += 15 * delta;
        s.trimFallAnim.y += s.trimFallAnim.vy * 60 * delta;
        if (s.trimFallAnim.y > CANVAS_H + s.cameraOffsetY + 100) {
          s.trimFallAnim = null;
        }
      }

      // Flash timer
      if (s.flashTimer > 0) s.flashTimer -= delta;

      setHud({
        score: s.score,
        lives: s.lives,
        timeLeft: Math.max(0, duration - s.elapsedTime),
        countdown: 0,
        stacks: s.totalStacks,
        backProgress: s.backTimer / 3,
      });

      drawGame(ctx, s, 0);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return () => { running = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, difficulty]);

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

  const drawGame = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current, countdown: number) => {
    const w = CANVAS_W;
    const h = CANVAS_H;

    // Background
    ctx.fillStyle = '#faf5eb';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(0, s.cameraOffsetY);

    // Stack blocks
    for (const block of s.stack) {
      const bx = block.x - block.w / 2;
      const by = block.y;
      ctx.fillStyle = block.color;
      drawRoundedRect(ctx, bx, by, block.w, BLOCK_H, 6);
      ctx.fill();
      // Highlight on top
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      drawRoundedRect(ctx, bx + 2, by + 2, block.w - 4, BLOCK_H / 3, 4);
      ctx.fill();
    }

    // Drop animation block
    if (s.dropAnim) {
      const d = s.dropAnim;
      ctx.fillStyle = d.color;
      drawRoundedRect(ctx, d.x - d.w / 2, d.y, d.w, BLOCK_H, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      drawRoundedRect(ctx, d.x - d.w / 2 + 2, d.y + 2, d.w - 4, BLOCK_H / 3, 4);
      ctx.fill();
    }

    // Trim fall animation
    if (s.trimFallAnim) {
      const t = s.trimFallAnim;
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = t.color;
      drawRoundedRect(ctx, t.x - t.w / 2, t.y, t.w, BLOCK_H, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Current sliding block
    if (s.started && !s.finished) {
      const top = s.stack[s.stack.length - 1];
      const cur = s.currentBlock;
      const by = top.y - BLOCK_H - 60;
      ctx.fillStyle = cur.color;
      drawRoundedRect(ctx, cur.x - cur.w / 2, by, cur.w, BLOCK_H, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      drawRoundedRect(ctx, cur.x - cur.w / 2 + 2, by + 2, cur.w - 4, BLOCK_H / 3, 4);
      ctx.fill();

      // Guide line
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cur.x, by + BLOCK_H);
      ctx.lineTo(cur.x, top.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();

    // Flash feedback text
    if (s.flashTimer > 0 && s.flashType) {
      const alpha = Math.min(1, s.flashTimer * 2);
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px sans-serif';
      if (s.flashType === 'perfect') {
        ctx.fillStyle = '#a78bfa';
        ctx.fillText('PERFECT!', w / 2, h / 2 - 40);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('+100', w / 2, h / 2);
      } else if (s.flashType === 'good') {
        ctx.fillStyle = '#34d399';
        ctx.fillText('GOOD!', w / 2, h / 2 - 40);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('+50', w / 2, h / 2);
      } else if (s.flashType === 'ok') {
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('OK', w / 2, h / 2 - 40);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('+25', w / 2, h / 2);
      } else if (s.flashType === 'miss') {
        ctx.fillStyle = '#ef4444';
        ctx.fillText('MISS!', w / 2, h / 2 - 40);
      }
      ctx.globalAlpha = 1;
    }

    // Drop zone indicator (wide zones at edges)
    if (s.started && !s.finished) {
      const isLeftDrop = s.currentDropSide === 'left';
      const dzX = isLeftDrop ? 0 : w * 0.75;
      const dzW = w * 0.25;
      const dzLabelX = isLeftDrop ? dzW / 2 : w * 0.875;
      ctx.fillStyle = 'rgba(167, 139, 250, 0.06)';
      ctx.fillRect(dzX, 0, dzW, h);
      // Arrow indicator
      ctx.fillStyle = 'rgba(167, 139, 250, 0.2)';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isLeftDrop ? '\u2190' : '\u2192', dzLabelX, h / 2);
      ctx.fillStyle = 'rgba(167, 139, 250, 0.25)';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('DROP', dzLabelX, h / 2 + 25);
    }

    // Countdown overlay
    if (countdown > 0) {
      ctx.fillStyle = 'rgba(250, 245, 235, 0.8)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(countdown), w / 2, h / 2 + 40);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#faf5eb]">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="max-w-full max-h-full"
      />

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-start max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{hud.score}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Score</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{Math.ceil(hud.timeLeft)}s</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Time</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{hud.stacks}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Stacks</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-purple-400 tabular-nums">{hud.stacks > 0 ? Math.round((hud.score / (hud.stacks * 100)) * 100) : 0}%</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Back-to-menu */}
      {hud.backProgress > 0.05 && (
        <div className="absolute top-16 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-2xl px-4 py-2 pointer-events-none shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#ddd" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#a78bfa" strokeWidth="3"
              strokeDasharray={`${hud.backProgress * 94.2} 94.2`} strokeLinecap="round" transform="rotate(-90 18 18)" />
          </svg>
          <span className="text-xs text-purple-500 font-medium">Back</span>
        </div>
      )}
    </div>
  );
}
