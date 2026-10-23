'use client';

import { useRef, useState, useEffect } from 'react';
import { GameInput, InputMode } from '@/lib/tracking';

interface NeonDriftGameProps {
  duration: 30 | 60 | 90;
  difficulty: 'easy' | 'medium' | 'hard';
  inputMode: InputMode;
  getGameInput: () => GameInput;
  onFinish: (result: NeonDriftResult) => void;
  onBackToMenu?: () => void;
}

export interface NeonDriftResult {
  score: number;
  cubesCollected: number;
  onTrackPercent: number;
  duration: number;
  difficulty: string;
  inputMode: InputMode;
  sessionId: string;
}

const CANVAS_W = 600;
const CANVAS_H = 800;
const BALL_RADIUS = 12;

const DIFFICULTY = {
  easy:   { trackWidth: 160, speed: 2.1, cubeRate: 0.025, curveStrength: 0.63 },
  medium: { trackWidth: 120, speed: 3.15, cubeRate: 0.020, curveStrength: 1.05 },
  hard:   { trackWidth: 90,  speed: 4.2, cubeRate: 0.015, curveStrength: 1.58 },
};

interface TrackSegment {
  y: number;
  centerX: number;
}

interface Cube {
  x: number;
  y: number;
  collected: boolean;
}

const SEGMENT_HEIGHT = 4;
const VISIBLE_SEGMENTS = Math.ceil(CANVAS_H / SEGMENT_HEIGHT) + 60;

export default function NeonDriftGame({
  duration,
  difficulty,
  inputMode,
  getGameInput,
  onFinish,
  onBackToMenu,
}: NeonDriftGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = DIFFICULTY[difficulty];
  const sessionIdRef = useRef(crypto.randomUUID());

  const stateRef = useRef({
    ballX: CANVAS_W / 2,
    ballY: CANVAS_H - 120,
    segments: [] as TrackSegment[],
    cubes: [] as Cube[],
    score: 0,
    cubesCollected: 0,
    onTrackFrames: 0,
    totalFrames: 0,
    comboStreak: 0,
    elapsedTime: 0,
    started: false,
    finished: false,
    countdown: 3,
    gameStartWallTime: 0,
    backTimer: 0,
    scrollOffset: 0,
    segmentIndex: 0,
    trackCurveTarget: CANVAS_W / 2,
    trackCurveVel: 0,
    nextCurveChange: 0,
    cubeSpawnAccum: 0,
    pulseTime: 0,
  });

  // Generate initial track segments
  useEffect(() => {
    const s = stateRef.current;
    s.segments = [];
    let cx = CANVAS_W / 2;
    for (let i = 0; i < VISIBLE_SEGMENTS + 200; i++) {
      s.segments.push({ y: i * SEGMENT_HEIGHT, centerX: cx });
      if (i % 40 === 0 && i > 0) {
        const target = CANVAS_W * 0.25 + Math.random() * CANVAS_W * 0.5;
        const steps = 40;
        const dx = (target - cx) / steps;
        for (let j = 1; j <= steps && i + j < VISIBLE_SEGMENTS + 200; j++) {
          cx += dx;
          i++;
          s.segments.push({ y: i * SEGMENT_HEIGHT, centerX: cx });
        }
      }
    }
    s.segmentIndex = 0;
    s.trackCurveTarget = CANVAS_W / 2;
    s.trackCurveVel = 0;
    s.nextCurveChange = 80;
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

    const addSegments = (s: typeof stateRef.current, count: number) => {
      const lastSeg = s.segments[s.segments.length - 1];
      let cx = lastSeg ? lastSeg.centerX : CANVAS_W / 2;
      let lastY = lastSeg ? lastSeg.y + SEGMENT_HEIGHT : 0;

      for (let i = 0; i < count; i++) {
        s.nextCurveChange--;
        if (s.nextCurveChange <= 0) {
          s.trackCurveTarget = CANVAS_W * 0.2 + Math.random() * CANVAS_W * 0.6;
          s.nextCurveChange = 60 + Math.floor(Math.random() * 80);
        }

        const diff = s.trackCurveTarget - cx;
        s.trackCurveVel += diff * 0.005 * config.curveStrength;
        s.trackCurveVel *= 0.95;
        cx += s.trackCurveVel;
        cx = Math.max(config.trackWidth / 2 + 20, Math.min(CANVAS_W - config.trackWidth / 2 - 20, cx));

        s.segments.push({ y: lastY, centerX: cx });
        lastY += SEGMENT_HEIGHT;
      }
    };

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
        drawGame(ctx, s, Math.ceil(Math.max(0, s.countdown)));
        requestAnimationFrame(loop);
        return;
      }

      s.elapsedTime = (performance.now() - s.gameStartWallTime) / 1000;
      s.pulseTime += delta;

      // Time up
      if (s.elapsedTime >= duration) {
        s.finished = true;
        const onTrackPercent = s.totalFrames > 0 ? Math.round((s.onTrackFrames / s.totalFrames) * 100) : 0;
        onFinish({
          score: s.score,
          cubesCollected: s.cubesCollected,
          onTrackPercent,
          duration,
          difficulty,
          inputMode,
          sessionId: sessionIdRef.current,
        });
        return;
      }

      // Scroll track
      const scrollSpeed = config.speed * 60 * delta;
      s.scrollOffset += scrollSpeed;

      // Remove old segments and add new ones
      while (s.segments.length > 0 && s.segments[0].y < s.scrollOffset - CANVAS_H) {
        s.segments.shift();
        s.segmentIndex++;
      }
      const neededY = s.scrollOffset + CANVAS_H + 200;
      const lastSegY = s.segments.length > 0 ? s.segments[s.segments.length - 1].y : 0;
      if (lastSegY < neededY) {
        addSegments(s, Math.ceil((neededY - lastSegY) / SEGMENT_HEIGHT));
      }

      // Ball position from input
      if (input.active) {
        s.ballX = input.x * CANVAS_W;
      }
      s.ballX = Math.max(BALL_RADIUS, Math.min(CANVAS_W - BALL_RADIUS, s.ballX));

      // Find track center at ball Y in world coords (flipped)
      const ballWorldY = s.scrollOffset + (CANVAS_H - s.ballY);
      const segIdx = Math.floor((ballWorldY - (s.segments.length > 0 ? s.segments[0].y : 0)) / SEGMENT_HEIGHT);
      let trackCenterAtBall = CANVAS_W / 2;
      if (segIdx >= 0 && segIdx < s.segments.length) {
        trackCenterAtBall = s.segments[segIdx].centerX;
      }

      // Check if on track
      const distFromCenter = Math.abs(s.ballX - trackCenterAtBall);
      const onTrack = distFromCenter < config.trackWidth / 2;
      s.totalFrames++;
      if (onTrack) {
        s.onTrackFrames++;
        s.score += 1;
        s.comboStreak++;
      } else {
        s.comboStreak = 0;
      }

      // Combo bonus
      if (s.comboStreak > 0 && s.comboStreak % 60 === 0) {
        s.score += 10;
      }

      // Spawn cubes
      s.cubeSpawnAccum += delta;
      if (s.cubeSpawnAccum > 0.5) {
        s.cubeSpawnAccum = 0;
        if (Math.random() < config.cubeRate * 30) {
          // Place cube on track ahead
          const aheadWorldY = s.scrollOffset + CANVAS_H - 50 - Math.random() * 200;
          const aheadSegIdx = Math.floor((aheadWorldY - (s.segments.length > 0 ? s.segments[0].y : 0)) / SEGMENT_HEIGHT);
          if (aheadSegIdx >= 0 && aheadSegIdx < s.segments.length) {
            const seg = s.segments[aheadSegIdx];
            const offset = (Math.random() - 0.5) * config.trackWidth * 0.7;
            s.cubes.push({ x: seg.centerX + offset, y: aheadWorldY, collected: false });
          }
        }
      }

      // Check cube collection
      for (const cube of s.cubes) {
        if (cube.collected) continue;
        const cubeDrawY = CANVAS_H - (cube.y - s.scrollOffset);
        if (cubeDrawY < -50 || cubeDrawY > CANVAS_H + 50) continue;

        const dx = s.ballX - cube.x;
        const dy = s.ballY - cubeDrawY;
        if (Math.sqrt(dx * dx + dy * dy) < BALL_RADIUS + 14) {
          cube.collected = true;
          s.cubesCollected++;
          s.score += 50;
          playSound(660, 0.1);
        }
      }

      // Clean old cubes
      // Remove cubes that scrolled past (behind the ball = low worldY = high screenY = off bottom)
      s.cubes = s.cubes.filter(c => {
        if (c.collected) return false;
        const drawY = CANVAS_H - (c.y - s.scrollOffset);
        return drawY > -100 && drawY < CANVAS_H + 200;
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
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, w, h);

    // Draw grid lines for depth effect
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
    ctx.lineWidth = 1;
    for (let gy = 0; gy < h; gy += 40) {
      const offset = (s.scrollOffset * 0.3) % 40;
      ctx.beginPath();
      ctx.moveTo(0, gy + offset);
      ctx.lineTo(w, gy + offset);
      ctx.stroke();
    }

    // Draw track (scrolls down - top is ahead, bottom is behind)
    const halfW = config.trackWidth / 2;
    const glowHalfW = halfW + 8;

    for (let i = 0; i < Math.ceil(h / SEGMENT_HEIGHT) + 1; i++) {
      const worldY = s.scrollOffset + i * SEGMENT_HEIGHT;
      const drawY = h - (worldY - s.scrollOffset) - SEGMENT_HEIGHT; // flip: high worldY = top of screen
      if (drawY > h || drawY < -SEGMENT_HEIGHT) continue;
      const segIdx = Math.floor((worldY - (s.segments.length > 0 ? s.segments[0].y : 0)) / SEGMENT_HEIGHT);
      if (segIdx < 0 || segIdx >= s.segments.length) continue;
      const seg = s.segments[segIdx];

      // Track glow edges (cyan)
      ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
      ctx.fillRect(seg.centerX - glowHalfW, drawY, glowHalfW * 2, SEGMENT_HEIGHT);

      // Track body (dark blue)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.12)';
      ctx.fillRect(seg.centerX - halfW, drawY, halfW * 2, SEGMENT_HEIGHT);

      // Track edges (neon blue lines)
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(seg.centerX - halfW - 2, drawY, 3, SEGMENT_HEIGHT);
      ctx.fillRect(seg.centerX + halfW - 1, drawY, 3, SEGMENT_HEIGHT);

      // Center dashes
      if (Math.floor(worldY / 30) % 2 === 0) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.fillRect(seg.centerX - 1, drawY, 2, SEGMENT_HEIGHT);
      }
    }

    // Draw cubes
    for (const cube of s.cubes) {
      if (cube.collected) continue;
      const drawCubeY = h - (cube.y - s.scrollOffset);
      if (drawCubeY < -20 || drawCubeY > h + 20) continue;

      const cubeSize = 18;
      const pulse = Math.sin(s.pulseTime * 4) * 2;

      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12 + pulse;
      ctx.fillStyle = '#f97316';
      ctx.fillRect(cube.x - cubeSize / 2, drawCubeY - cubeSize / 2, cubeSize, cubeSize);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(cube.x - cubeSize / 4, drawCubeY - cubeSize / 4, cubeSize / 2, cubeSize / 2);
    }

    // Draw ball
    const ballPulse = Math.sin(s.pulseTime * 3) * 1.5;

    // Ball glow
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, BALL_RADIUS + 6 + ballPulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();

    // Ball outer glow
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ball inner highlight
    ctx.beginPath();
    ctx.arc(s.ballX - 3, s.ballY - 3, BALL_RADIUS * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();

    // Off-track warning glow at ball (flipped Y: ball at bottom = high worldY)
    const ballWorldY = s.scrollOffset + (CANVAS_H - s.ballY);
    const bSegIdx = Math.floor((ballWorldY - (s.segments.length > 0 ? s.segments[0].y : 0)) / SEGMENT_HEIGHT);
    let trackCX = CANVAS_W / 2;
    if (bSegIdx >= 0 && bSegIdx < s.segments.length) {
      trackCX = s.segments[bSegIdx].centerX;
    }
    const offTrack = Math.abs(s.ballX - trackCX) >= config.trackWidth / 2;
    if (offTrack) {
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, BALL_RADIUS + 10, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Combo indicator
    if (s.comboStreak >= 60) {
      const comboLevel = Math.floor(s.comboStreak / 60);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`x${comboLevel} COMBO`, s.ballX, s.ballY - BALL_RADIUS - 16);
    }

    // Countdown overlay
    if (countdown > 0) {
      ctx.fillStyle = 'rgba(10, 22, 40, 0.8)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(countdown), w / 2, h / 2 + 40);
    }
  };

  const [hud, setHud] = useState({
    score: 0,
    timeLeft: duration as number,
    cubes: 0,
    onTrackPercent: 100,
    countdown: 3,
    backProgress: 0,
  });

  // HUD update interval
  useEffect(() => {
    const interval = setInterval(() => {
      const s = stateRef.current;
      if (!s.started || s.finished) {
        setHud(h => ({ ...h, countdown: Math.ceil(Math.max(0, s.countdown)) }));
        return;
      }
      const onTrackPct = s.totalFrames > 0 ? Math.round((s.onTrackFrames / s.totalFrames) * 100) : 100;
      setHud({
        score: s.score,
        timeLeft: Math.max(0, duration - s.elapsedTime),
        cubes: s.cubesCollected,
        onTrackPercent: onTrackPct,
        countdown: 0,
        backProgress: s.backTimer / 3,
      });
    }, 100);
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0a1628]">
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
            <div className="text-3xl font-bold text-orange-400 tabular-nums">{hud.cubes}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Cubes</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-right">
            <div className="text-3xl font-bold text-blue-400 tabular-nums">{hud.onTrackPercent}%</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">On Track</div>
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
