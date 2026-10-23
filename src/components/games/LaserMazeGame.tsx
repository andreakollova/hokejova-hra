'use client';

import { useRef, useState, useEffect } from 'react';
import { GameInput, InputMode } from '@/lib/tracking';

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

const CANVAS_SIZE = 600;
const BALL_RADIUS = 8;
const GRID_SIZE = 8;
const HIT_PENALTY = 10;
const CHECKPOINT_SCORE = 100;

interface Wall {
  /** row1, col1, row2, col2 - wall between two adjacent cells */
  r1: number; c1: number; r2: number; c2: number;
}

interface Laser {
  x1: number; y1: number; x2: number; y2: number;
  on: boolean;
  timer: number;
  period: number;
  postRadius: number;
}

interface Checkpoint {
  x: number; y: number; radius: number;
}

const DIFFICULTY_CONFIG = {
  easy:   { wallRemoveRatio: 0.65, laserCount: 4,  corridorScale: 1.0 },
  medium: { wallRemoveRatio: 0.50, laserCount: 7,  corridorScale: 1.0 },
  hard:   { wallRemoveRatio: 0.38, laserCount: 11, corridorScale: 1.0 },
};

/** Union-Find for maze generation */
class UnionFind {
  parent: number[];
  rank: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a: number, b: number): boolean {
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb;
    else if (this.rank[ra] > this.rank[rb]) this.parent[rb] = ra;
    else { this.parent[rb] = ra; this.rank[ra]++; }
    return true;
  }
}

function generateMaze(difficulty: 'easy' | 'medium' | 'hard') {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const n = GRID_SIZE;
  const cellSize = CANVAS_SIZE / n;

  // Collect all interior walls
  const allWalls: Wall[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (c < n - 1) allWalls.push({ r1: r, c1: c, r2: r, c2: c + 1 }); // right
      if (r < n - 1) allWalls.push({ r1: r, c1: c, r2: r + 1, c2: c }); // down
    }
  }

  // Shuffle
  for (let i = allWalls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allWalls[i], allWalls[j]] = [allWalls[j], allWalls[i]];
  }

  // Kruskal: remove walls to form spanning tree, then remove extras based on difficulty
  const uf = new UnionFind(n * n);
  const keptWalls: Wall[] = [];
  const removedWalls: Wall[] = [];

  for (const w of allWalls) {
    const a = w.r1 * n + w.c1;
    const b = w.r2 * n + w.c2;
    if (uf.union(a, b)) {
      removedWalls.push(w); // passage
    } else {
      keptWalls.push(w); // wall stays
    }
  }

  // Remove additional walls to open up the maze based on difficulty
  const extraRemove = Math.floor(keptWalls.length * (cfg.wallRemoveRatio));
  // Shuffle kept walls and remove some
  for (let i = keptWalls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keptWalls[i], keptWalls[j]] = [keptWalls[j], keptWalls[i]];
  }
  const finalWalls = keptWalls.slice(extraRemove);

  // Convert walls to line segments for rendering/collision
  const wallSegments: { x1: number; y1: number; x2: number; y2: number }[] = [];

  // Outer border
  const wallThickness = 3;
  // We'll draw outer walls as segments
  wallSegments.push({ x1: 0, y1: 0, x2: CANVAS_SIZE, y2: 0 }); // top
  wallSegments.push({ x1: CANVAS_SIZE, y1: 0, x2: CANVAS_SIZE, y2: CANVAS_SIZE }); // right
  wallSegments.push({ x1: 0, y1: CANVAS_SIZE, x2: CANVAS_SIZE, y2: CANVAS_SIZE }); // bottom
  wallSegments.push({ x1: 0, y1: 0, x2: 0, y2: CANVAS_SIZE }); // left

  for (const w of finalWalls) {
    if (w.c1 !== w.c2) {
      // Vertical wall between (r, c) and (r, c+1) - right edge of cell (r, c)
      const x = (Math.max(w.c1, w.c2)) * cellSize;
      const y = w.r1 * cellSize;
      wallSegments.push({ x1: x, y1: y, x2: x, y2: y + cellSize });
    } else {
      // Horizontal wall between (r, c) and (r+1, c) - bottom edge of cell (r, c)
      const x = w.c1 * cellSize;
      const y = (Math.max(w.r1, w.r2)) * cellSize;
      wallSegments.push({ x1: x, y1: y, x2: x + cellSize, y2: y });
    }
  }

  // Place lasers at random corridor openings (removed wall positions)
  const laserCandidates = [...removedWalls];
  for (let i = laserCandidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [laserCandidates[i], laserCandidates[j]] = [laserCandidates[j], laserCandidates[i]];
  }

  const lasers: Laser[] = [];
  const laserCount = Math.min(cfg.laserCount, laserCandidates.length);
  for (let i = 0; i < laserCount; i++) {
    const w = laserCandidates[i];
    let x1: number, y1: number, x2: number, y2: number;
    if (w.c1 !== w.c2) {
      // Was a vertical wall - laser goes vertical across corridor
      const x = Math.max(w.c1, w.c2) * cellSize;
      const y = w.r1 * cellSize;
      x1 = x; y1 = y;
      x2 = x; y2 = y + cellSize;
    } else {
      // Was a horizontal wall - laser goes horizontal across corridor
      const x = w.c1 * cellSize;
      const y = Math.max(w.r1, w.r2) * cellSize;
      x1 = x; y1 = y;
      x2 = x + cellSize; y2 = y;
    }
    lasers.push({
      x1, y1, x2, y2,
      on: Math.random() > 0.5,
      timer: Math.random() * 2,
      period: 2 + Math.random() * 1, // 2-3 seconds
      postRadius: 4,
    });
  }

  return { wallSegments, lasers, cellSize };
}

function randomCheckpointPosition(cellSize: number): { x: number; y: number } {
  const col = Math.floor(Math.random() * GRID_SIZE);
  const row = Math.floor(Math.random() * GRID_SIZE);
  return {
    x: col * cellSize + cellSize / 2,
    y: row * cellSize + cellSize / 2,
  };
}

/** Distance from point to line segment */
function distPointToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const nearX = x1 + t * dx;
  const nearY = y1 + t * dy;
  return Math.hypot(px - nearX, py - nearY);
}

export default function LaserMazeGame({
  duration,
  difficulty,
  inputMode,
  getGameInput,
  onFinish,
  onBackToMenu,
}: LaserMazeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionIdRef = useRef(crypto.randomUUID());

  const mazeRef = useRef<ReturnType<typeof generateMaze> | null>(null);
  const checkpointRef = useRef<Checkpoint | null>(null);

  const stateRef = useRef({
    ballX: CANVAS_SIZE / 2,
    ballY: CANVAS_SIZE / 2,
    score: 0,
    checkpoints: 0,
    laserHits: 0,
    elapsedTime: 0,
    started: false,
    finished: false,
    countdown: 3,
    gameStartWallTime: 0,
    backTimer: 0,
    hitFlashTimer: 0,
    hitCooldown: 0, // prevent rapid repeated hits
  });

  const [hud, setHud] = useState({
    score: 0,
    timeLeft: duration as number,
    checkpoints: 0,
    laserHits: 0,
    countdown: 3,
    backProgress: 0,
  });

  // Init maze
  useEffect(() => {
    const maze = generateMaze(difficulty);
    mazeRef.current = maze;
    const cp = randomCheckpointPosition(maze.cellSize);
    checkpointRef.current = { x: cp.x, y: cp.y, radius: 12 };
    // Reset ball to center of first cell
    const s = stateRef.current;
    s.ballX = maze.cellSize / 2;
    s.ballY = maze.cellSize / 2;
    s.score = 0;
    s.checkpoints = 0;
    s.laserHits = 0;
    s.elapsedTime = 0;
    s.started = false;
    s.finished = false;
    s.countdown = 3;
    s.hitFlashTimer = 0;
    s.hitCooldown = 0;
    s.backTimer = 0;
  }, [difficulty]);

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
      const delta = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0;
      lastTime = timestamp;

      const s = stateRef.current;
      const maze = mazeRef.current;
      if (s.finished || !maze) { requestAnimationFrame(loop); return; }

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
        setHud(h => ({ ...h, countdown: Math.ceil(Math.max(0, s.countdown)), backProgress: s.backTimer / 3 }));
        draw(ctx, s, maze, Math.ceil(Math.max(0, s.countdown)));
        requestAnimationFrame(loop);
        return;
      }

      s.elapsedTime = (performance.now() - s.gameStartWallTime) / 1000;

      // Time up
      if (s.elapsedTime >= duration) {
        s.finished = true;
        onFinish({
          score: s.score,
          checkpoints: s.checkpoints,
          laserHits: s.laserHits,
          duration,
          difficulty,
          inputMode,
          sessionId: sessionIdRef.current,
        });
        return;
      }

      // Ball target position from input
      if (input.active) {
        let targetX = input.x * CANVAS_SIZE;
        let targetY = input.y * CANVAS_SIZE;

        // Clamp to canvas
        targetX = Math.max(BALL_RADIUS, Math.min(CANVAS_SIZE - BALL_RADIUS, targetX));
        targetY = Math.max(BALL_RADIUS, Math.min(CANVAS_SIZE - BALL_RADIUS, targetY));

        // Wall collision: try to move to target, push out if colliding
        let newX = targetX;
        let newY = targetY;

        // Multiple iterations for stable collision
        for (let iter = 0; iter < 3; iter++) {
          for (const seg of maze.wallSegments) {
            const dist = distPointToSegment(newX, newY, seg.x1, seg.y1, seg.x2, seg.y2);
            const minDist = BALL_RADIUS + 2;
            if (dist < minDist) {
              // Push ball away from wall
              const dx = seg.x2 - seg.x1;
              const dy = seg.y2 - seg.y1;
              const len = Math.hypot(dx, dy);
              if (len === 0) continue;
              // Normal to segment (perpendicular)
              let nx = -dy / len;
              let ny = dx / len;
              // Ensure normal points toward ball
              const toBallX = newX - seg.x1;
              const toBallY = newY - seg.y1;
              if (toBallX * nx + toBallY * ny < 0) { nx = -nx; ny = -ny; }
              // Project onto nearest point on segment
              const t = Math.max(0, Math.min(1, ((newX - seg.x1) * dx + (newY - seg.y1) * dy) / (len * len)));
              const nearX = seg.x1 + t * dx;
              const nearY = seg.y1 + t * dy;
              newX = nearX + nx * minDist;
              newY = nearY + ny * minDist;
            }
          }
        }

        s.ballX = Math.max(BALL_RADIUS, Math.min(CANVAS_SIZE - BALL_RADIUS, newX));
        s.ballY = Math.max(BALL_RADIUS, Math.min(CANVAS_SIZE - BALL_RADIUS, newY));
      }

      // Update lasers
      for (const laser of maze.lasers) {
        laser.timer += delta;
        if (laser.timer >= laser.period) {
          laser.timer -= laser.period;
          laser.on = !laser.on;
        }
      }

      // Laser collision
      if (s.hitCooldown > 0) s.hitCooldown -= delta;
      if (s.hitCooldown <= 0) {
        for (const laser of maze.lasers) {
          if (!laser.on) continue;
          const dist = distPointToSegment(s.ballX, s.ballY, laser.x1, laser.y1, laser.x2, laser.y2);
          if (dist < BALL_RADIUS + 3) {
            s.laserHits++;
            s.score = Math.max(0, s.score - HIT_PENALTY);
            s.hitFlashTimer = 0.3;
            s.hitCooldown = 0.8; // cooldown before next hit
            playSound(200, 0.2, 'square');

            // Knockback: push ball away from laser
            const lmx = (laser.x1 + laser.x2) / 2;
            const lmy = (laser.y1 + laser.y2) / 2;
            const kx = s.ballX - lmx;
            const ky = s.ballY - lmy;
            const klen = Math.hypot(kx, ky) || 1;
            s.ballX += (kx / klen) * 15;
            s.ballY += (ky / klen) * 15;
            s.ballX = Math.max(BALL_RADIUS, Math.min(CANVAS_SIZE - BALL_RADIUS, s.ballX));
            s.ballY = Math.max(BALL_RADIUS, Math.min(CANVAS_SIZE - BALL_RADIUS, s.ballY));
            break;
          }
        }
      }

      if (s.hitFlashTimer > 0) s.hitFlashTimer -= delta;

      // Checkpoint collision
      const cp = checkpointRef.current;
      if (cp) {
        const dist = Math.hypot(s.ballX - cp.x, s.ballY - cp.y);
        if (dist < BALL_RADIUS + cp.radius) {
          s.checkpoints++;
          s.score += CHECKPOINT_SCORE;
          playSound(880, 0.15);
          // Spawn new checkpoint not too close to ball
          let newCp = randomCheckpointPosition(maze.cellSize);
          let attempts = 0;
          while (Math.hypot(newCp.x - s.ballX, newCp.y - s.ballY) < maze.cellSize * 2 && attempts < 20) {
            newCp = randomCheckpointPosition(maze.cellSize);
            attempts++;
          }
          checkpointRef.current = { x: newCp.x, y: newCp.y, radius: 12 };
        }
      }

      // Update HUD
      setHud({
        score: s.score,
        timeLeft: Math.max(0, duration - s.elapsedTime),
        checkpoints: s.checkpoints,
        laserHits: s.laserHits,
        countdown: 0,
        backProgress: s.backTimer / 3,
      });

      draw(ctx, s, maze, 0);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return () => { running = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, difficulty]);

  const draw = (
    ctx: CanvasRenderingContext2D,
    s: typeof stateRef.current,
    maze: ReturnType<typeof generateMaze>,
    countdown: number,
  ) => {
    const w = CANVAS_SIZE;
    const h = CANVAS_SIZE;

    // Background
    ctx.fillStyle = '#0f1f0f';
    ctx.fillRect(0, 0, w, h);

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID_SIZE; i++) {
      const pos = i * maze.cellSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0); ctx.lineTo(pos, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos); ctx.lineTo(w, pos);
      ctx.stroke();
    }

    // Walls
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 6;
    for (const seg of maze.wallSegments) {
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Lasers
    const time = s.elapsedTime;
    for (const laser of maze.lasers) {
      // Posts (always visible)
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(laser.x1, laser.y1, laser.postRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(laser.x2, laser.y2, laser.postRadius, 0, Math.PI * 2);
      ctx.fill();

      if (laser.on) {
        // Pulsing glow
        const pulse = 0.6 + 0.4 * Math.sin(time * 8);
        ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12 * pulse;
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();

        // Inner bright line
        ctx.strokeStyle = `rgba(252, 165, 165, ${pulse * 0.8})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Dim indicator when off
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();
      }
    }

    // Checkpoint
    const cp = checkpointRef.current;
    if (cp) {
      const cpPulse = 0.5 + 0.5 * Math.sin(time * 4);
      // Outer glow
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, cp.radius + 4 + cpPulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34, 197, 94, ${0.15 + cpPulse * 0.1})`;
      ctx.fill();
      // Main circle
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, cp.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34, 197, 94, ${0.6 + cpPulse * 0.3})`;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 10 + cpPulse * 5;
      ctx.fill();
      ctx.shadowBlur = 0;
      // Inner dot
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#bbf7d0';
      ctx.fill();
    }

    // Ball
    const flashRed = s.hitFlashTimer > 0 && Math.floor(s.hitFlashTimer * 15) % 2 === 0;
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = flashRed ? '#ef4444' : '#f8fafc';
    ctx.shadowColor = flashRed ? '#ef4444' : '#f8fafc';
    ctx.shadowBlur = flashRed ? 15 : 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Countdown overlay
    if (countdown > 0) {
      ctx.fillStyle = 'rgba(15, 31, 15, 0.75)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 20;
      ctx.fillText(String(countdown), w / 2, h / 2);
      ctx.shadowBlur = 0;
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0f1f0f]">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
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
            <div className="text-3xl font-bold text-green-400 tabular-nums">{hud.checkpoints}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Checkpoints</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-right">
            <div className="text-3xl font-bold text-red-400 tabular-nums">{hud.laserHits}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Laser Hits</div>
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
