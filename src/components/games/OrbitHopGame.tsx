'use client';

import { useRef, useState, useEffect } from 'react';
import { GameInput, InputMode } from '@/lib/tracking';

interface OrbitHopGameProps {
  duration: 30 | 60 | 90;
  difficulty: 'easy' | 'medium' | 'hard';
  inputMode: InputMode;
  getGameInput: () => GameInput;
  onFinish: (result: OrbitHopResult) => void;
  onBackToMenu?: () => void;
  hopSide?: 'left' | 'right';
}

export interface OrbitHopResult {
  score: number;
  perfectHops: number;
  goodHops: number;
  totalHops: number;
  lives: number;
  duration: number;
  difficulty: string;
  inputMode: InputMode;
  sessionId: string;
}

const CANVAS_W = 1200;
const CANVAS_H = 800;

const PLANET_COLORS = [
  ['#c4b5fd', '#8b5cf6'], // purple
  ['#fecdd3', '#f472b6'], // peach/pink
  ['#a5b4fc', '#6366f1'], // blue
  ['#99f6e4', '#2dd4bf'], // teal
  ['#fde68a', '#f59e0b'], // amber
];

const DIFFICULTY = {
  easy:   { orbitSpeed: 1.2, speedInc: 0.08, lives: 3, planetSizeMin: 35, planetSizeMax: 55 },
  medium: { orbitSpeed: 1.8, speedInc: 0.12, lives: 3, planetSizeMin: 28, planetSizeMax: 45 },
  hard:   { orbitSpeed: 2.5, speedInc: 0.18, lives: 2, planetSizeMin: 22, planetSizeMax: 38 },
};

interface Planet {
  x: number;
  y: number;
  radius: number;
  orbitRadius: number;
  color: string[];
  active: boolean;
}

export default function OrbitHopGame({
  duration,
  difficulty,
  inputMode,
  getGameInput,
  onFinish,
  onBackToMenu,
  hopSide = 'right',
}: OrbitHopGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = DIFFICULTY[difficulty];
  const sessionIdRef = useRef(crypto.randomUUID());

  const stateRef = useRef({
    planets: [] as Planet[],
    currentPlanetIdx: 0,
    orbitAngle: 0,
    orbitSpeed: config.orbitSpeed,
    ballX: 0,
    ballY: 0,
    score: 0,
    perfectHops: 0,
    goodHops: 0,
    totalHops: 0,
    lives: config.lives,
    elapsedTime: 0,
    started: false,
    finished: false,
    countdown: 3,
    gameStartWallTime: 0,
    backTimer: 0,
    hopAnim: null as { fromX: number; fromY: number; toX: number; toY: number; t: number } | null,
    flashTimer: 0,
    flashType: '' as '' | 'perfect' | 'good' | 'miss',
    cameraOffsetX: 0,
    cameraOffsetY: 0,
    wasRight: false,
    currentHopSide: 'right' as 'left' | 'right',
    missAnim: null as { x: number; y: number; vx: number; vy: number; t: number } | null,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
  });

  const [hud, setHud] = useState({
    score: 0,
    lives: config.lives,
    timeLeft: duration as number,
    countdown: 3,
    hops: 0,
    backProgress: 0,
  });

  const generatePlanets = () => {
    const planets: Planet[] = [];
    let x = CANVAS_W / 2;
    let y = CANVAS_H / 2;
    for (let i = 0; i < 50; i++) {
      const sizeRange = config.planetSizeMax - config.planetSizeMin;
      const radius = config.planetSizeMin + Math.random() * sizeRange;
      const orbitRadius = radius * 2 + 20 + Math.random() * 30;
      const colors = PLANET_COLORS[i % PLANET_COLORS.length];
      planets.push({ x, y, radius, orbitRadius, color: colors, active: true });
      // Next planet position - in chosen direction
      const baseAngle = hopSide === 'left' ? Math.PI : 0; // left = PI (leftward), right = 0 (rightward)
      const angle = baseAngle - Math.PI / 4 + Math.random() * Math.PI / 2;
      const dist = orbitRadius + 15 + Math.random() * 30 + (config.planetSizeMin + Math.random() * sizeRange) * 1.5;
      x += Math.cos(angle) * dist;
      y += Math.sin(angle) * dist - 30;
    }
    return planets;
  };

  // Init planets
  useEffect(() => {
    const s = stateRef.current;
    s.planets = generatePlanets();
    s.currentPlanetIdx = 0;
    s.orbitAngle = 0;
    s.orbitSpeed = config.orbitSpeed;
    s.lives = config.lives;
    s.cameraOffsetX = 0;
    s.cameraOffsetY = 0;
    // Set initial ball position
    const p = s.planets[0];
    s.ballX = p.x + p.orbitRadius;
    s.ballY = p.y;
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

    const hop = (s: typeof stateRef.current) => {
      const curPlanet = s.planets[s.currentPlanetIdx];
      const nextIdx = s.currentPlanetIdx + 1;
      if (nextIdx >= s.planets.length) return;
      const nextPlanet = s.planets[nextIdx];

      // Calculate current ball position
      const fromX = curPlanet.x + Math.cos(s.orbitAngle) * curPlanet.orbitRadius;
      const fromY = curPlanet.y + Math.sin(s.orbitAngle) * curPlanet.orbitRadius;

      // Check distance to next planet center
      const dx = fromX - nextPlanet.x;
      const dy = fromY - nextPlanet.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Tolerance: generous — if ball is anywhere near the next planet
      const tolerance = nextPlanet.orbitRadius + nextPlanet.radius * 2.5;

      if (dist <= tolerance) {
        // Successful hop
        s.totalHops++;
        const closeness = 1 - (dist / tolerance);

        // Add particles
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          s.particles.push({
            x: fromX, y: fromY,
            vx: Math.cos(angle) * (60 + Math.random() * 40),
            vy: Math.sin(angle) * (60 + Math.random() * 40),
            life: 0.5 + Math.random() * 0.3,
            color: nextPlanet.color[0],
          });
        }

        if (closeness > 0.7) {
          s.score += 100;
          s.perfectHops++;
          s.flashTimer = 0.6;
          s.flashType = 'perfect';
          playSound(880, 0.15);
          playSound(1320, 0.15);
        } else {
          s.score += 50;
          s.goodHops++;
          s.flashTimer = 0.4;
          s.flashType = 'good';
          playSound(660, 0.1);
        }

        // Animate hop
        const toAngle = Math.atan2(fromY - nextPlanet.y, fromX - nextPlanet.x);
        const toX = nextPlanet.x + Math.cos(toAngle) * nextPlanet.orbitRadius;
        const toY = nextPlanet.y + Math.sin(toAngle) * nextPlanet.orbitRadius;

        s.hopAnim = { fromX, fromY, toX, toY, t: 0 };
        s.currentPlanetIdx = nextIdx;
        s.orbitAngle = toAngle;
        s.orbitSpeed += config.speedInc;
      } else {
        // Miss - no penalty, keep playing
        s.flashTimer = 0.5;
        s.flashType = 'miss';
        playSound(150, 0.3, 'square');

        // Miss animation - ball flies off
        const vx = Math.cos(s.orbitAngle) * 200;
        const vy = Math.sin(s.orbitAngle) * 200;
        s.missAnim = { x: fromX, y: fromY, vx, vy, t: 0 };

        // Reset to current planet
        setTimeout(() => {
          s.missAnim = null;
        }, 600);
      }
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
          perfectHops: s.perfectHops,
          goodHops: s.goodHops,
          totalHops: s.totalHops,
          lives: Math.max(0, s.lives),
          duration,
          difficulty,
          inputMode,
          sessionId: sessionIdRef.current,
        });
        return;
      }

      // Orbit the ball around current planet
      s.orbitAngle += s.orbitSpeed * delta * Math.PI * 2 * 0.3;
      const curPlanet = s.planets[s.currentPlanetIdx];
      if (!s.hopAnim) {
        s.ballX = curPlanet.x + Math.cos(s.orbitAngle) * curPlanet.orbitRadius;
        s.ballY = curPlanet.y + Math.sin(s.orbitAngle) * curPlanet.orbitRadius;
      }

      // Hop animation
      if (s.hopAnim) {
        s.hopAnim.t += delta * 4;
        if (s.hopAnim.t >= 1) {
          s.hopAnim = null;
        } else {
          const t = s.hopAnim.t;
          const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          s.ballX = s.hopAnim.fromX + (s.hopAnim.toX - s.hopAnim.fromX) * ease;
          s.ballY = s.hopAnim.fromY + (s.hopAnim.toY - s.hopAnim.fromY) * ease;
        }
      }

      // Miss animation
      if (s.missAnim) {
        s.missAnim.t += delta;
        s.missAnim.x += s.missAnim.vx * delta;
        s.missAnim.y += s.missAnim.vy * delta;
        s.missAnim.vy += 300 * delta; // gravity
      }

      // Hop: ball moves to chosen side (always same direction)
      const inHopZone = input.active && (
        hopSide === 'right' ? input.x > 0.78 : input.x < 0.22
      );
      if (inHopZone && !s.wasRight && !s.hopAnim && !s.missAnim) {
        hop(s);
      }
      s.wasRight = inHopZone;

      // Update particles
      s.particles = s.particles.filter(p => {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.life -= delta;
        return p.life > 0;
      });

      // Camera follows ball smoothly
      const targetCamX = s.ballX - CANVAS_W / 2;
      const targetCamY = s.ballY - CANVAS_H / 2;
      s.cameraOffsetX += (targetCamX - s.cameraOffsetX) * 0.05;
      s.cameraOffsetY += (targetCamY - s.cameraOffsetY) * 0.05;

      // Flash timer
      if (s.flashTimer > 0) s.flashTimer -= delta;

      setHud({
        score: s.score,
        lives: s.lives,
        timeLeft: Math.max(0, duration - s.elapsedTime),
        countdown: 0,
        hops: s.totalHops,
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
    ctx.fillStyle = '#ede9fe';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)';
    ctx.lineWidth = 1;
    for (let x = -s.cameraOffsetX % 40; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = -s.cameraOffsetY % 40; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    ctx.save();
    ctx.translate(-s.cameraOffsetX, -s.cameraOffsetY);

    // Draw planets and orbit paths
    const visibleRange = 3; // show planets near current
    for (let i = Math.max(0, s.currentPlanetIdx - 1); i < Math.min(s.planets.length, s.currentPlanetIdx + visibleRange + 2); i++) {
      const p = s.planets[i];

      // Orbit path (dotted)
      ctx.strokeStyle = i === s.currentPlanetIdx ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.1)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.orbitRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Planet body - gradient
      const grad = ctx.createRadialGradient(
        p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.1,
        p.x, p.y, p.radius
      );
      grad.addColorStop(0, p.color[0]);
      grad.addColorStop(1, p.color[1]);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Planet shine
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(p.x - p.radius * 0.25, p.y - p.radius * 0.25, p.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Next planet indicator
      if (i === s.currentPlanetIdx + 1) {
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Particles
    for (const p of s.particles) {
      ctx.globalAlpha = p.life * 2;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Miss animation ball
    if (s.missAnim) {
      ctx.globalAlpha = Math.max(0, 1 - s.missAnim.t * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(s.missAnim.x, s.missAnim.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Orbiting ball
    if (!s.missAnim) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Ball trail
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      const trailAngle = s.orbitAngle - 0.3;
      const curP = s.planets[s.currentPlanetIdx];
      if (curP && !s.hopAnim) {
        const tx = curP.x + Math.cos(trailAngle) * curP.orbitRadius;
        const ty = curP.y + Math.sin(trailAngle) * curP.orbitRadius;
        ctx.beginPath();
        ctx.arc(tx, ty, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    // Hop zone indicator (alternates left/right)
    if (s.started && !s.finished) {
      const isRight = hopSide === 'right';
      const hzW = w * 0.22;
      const hzX = isRight ? w - hzW : 0;
      const hzLabelX = isRight ? w - hzW / 2 : hzW / 2;
      ctx.fillStyle = 'rgba(139, 92, 246, 0.06)';
      ctx.fillRect(hzX, 0, hzW, h);
      // Edge line
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      const edgeX = isRight ? w - hzW : hzW;
      ctx.beginPath(); ctx.moveTo(edgeX, 0); ctx.lineTo(edgeX, h); ctx.stroke();
      ctx.setLineDash([]);
      // Arrow and label
      ctx.fillStyle = 'rgba(139, 92, 246, 0.25)';
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isRight ? '\u2192' : '\u2190', hzLabelX, h / 2);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('HOP', hzLabelX, h / 2 + 30);
    }

    // Flash feedback text
    if (s.flashTimer > 0 && s.flashType) {
      const alpha = Math.min(1, s.flashTimer * 2);
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px sans-serif';
      if (s.flashType === 'perfect') {
        ctx.fillStyle = '#8b5cf6';
        ctx.fillText('PERFECT!', w / 2, h / 2 - 40);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('+100', w / 2, h / 2);
      } else if (s.flashType === 'good') {
        ctx.fillStyle = '#6366f1';
        ctx.fillText('GOOD!', w / 2, h / 2 - 40);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('+50', w / 2, h / 2);
      } else if (s.flashType === 'miss') {
        ctx.fillStyle = '#ef4444';
        ctx.fillText('MISS!', w / 2, h / 2 - 40);
      }
      ctx.globalAlpha = 1;
    }

    // Countdown overlay
    if (countdown > 0) {
      ctx.fillStyle = 'rgba(237, 233, 254, 0.85)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(countdown), w / 2, h / 2 + 40);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#ede9fe]">
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
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{hud.hops}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Hops</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-indigo-400 tabular-nums">{hud.hops > 0 ? Math.round((hud.score / (hud.hops * 100)) * 100) : 0}%</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Back-to-menu */}
      {hud.backProgress > 0.05 && (
        <div className="absolute top-16 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-2xl px-4 py-2 pointer-events-none shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#ddd" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#8b5cf6" strokeWidth="3"
              strokeDasharray={`${hud.backProgress * 94.2} 94.2`} strokeLinecap="round" transform="rotate(-90 18 18)" />
          </svg>
          <span className="text-xs text-purple-500 font-medium">Back</span>
        </div>
      )}
    </div>
  );
}
