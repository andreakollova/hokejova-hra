'use client';

import { useRef, useState, useCallback, useEffect, useMemo, MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GameInput, InputMode } from '@/lib/tracking';

interface TargetGameProps {
  duration: 30 | 60 | 90;
  difficulty: 'easy' | 'medium' | 'hard';
  inputMode: InputMode;
  getGameInput: () => GameInput;
  onFinish: (result: TargetResult) => void;
  onBackToMenu?: () => void;
}

export interface TargetResult {
  score: number;
  hits: number;
  misses: number;
  accuracy: number;
  bestTime: number;
  avgTime: number;
  duration: number;
  difficulty: string;
  inputMode: InputMode;
  sessionId: string;
}

const FIELD_SIZE = 8;

interface HudData {
  score: number;
  hits: number;
  timeLeft: number;
  countdown: number;
  backProgress: number;
  currentTargetTime: number;
}

interface ActiveTarget {
  x: number;
  z: number;
  radius: number;
  spawnTime: number;
  hit: boolean;
  id: number;
}

// Difficulty configs
const DIFFICULTY = {
  easy: { targetRadius: 0.6, maxTime: 2.8, minTargets: 1, maxTargets: 2, shrink: false },
  medium: { targetRadius: 0.45, maxTime: 1.8, minTargets: 2, maxTargets: 3, shrink: true },
  hard: { targetRadius: 0.35, maxTime: 1.3, minTargets: 2, maxTargets: 4, shrink: true },
};

function Target({
  position,
  radius,
  progress,
  hit,
}: {
  position: [number, number, number];
  radius: number;
  progress: number; // 0 = just spawned, 1 = about to expire
  hit: boolean;
}) {
  const ringColor = hit ? '#22c55e' : progress > 0.7 ? '#ef4444' : '#3b82f6';
  const currentRadius = radius * (1 - progress * 0.3); // shrinks slightly over time

  return (
    <group position={position}>
      {/* Outer ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[currentRadius * 0.7, currentRadius, 32]} />
        <meshStandardMaterial
          color={ringColor}
          emissive={ringColor}
          emissiveIntensity={0.3}
          transparent
          opacity={hit ? 0.3 : 0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Inner circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[currentRadius * 0.35, 32]} />
        <meshStandardMaterial
          color={hit ? '#22c55e' : '#ffffff'}
          emissive={hit ? '#22c55e' : '#3b82f6'}
          emissiveIntensity={hit ? 0.5 : 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Progress ring (time left) */}
      {!hit && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[currentRadius, currentRadius + 0.08, 32, 1, 0, Math.PI * 2 * (1 - progress)]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

function Ball({ posRef }: { posRef: MutableRefObject<{ x: number; z: number }> }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = posRef.current.x;
      meshRef.current.position.z = posRef.current.z;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.12, 0]} castShadow>
      <sphereGeometry args={[0.15, 24, 24]} />
      <meshStandardMaterial color="#f0f0f0" roughness={0.4} metalness={0.05} />
    </mesh>
  );
}

function Field() {
  const turfTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#4abb5e';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const g = 140 + Math.random() * 50;
      ctx.fillStyle = `rgba(${40 + Math.random() * 20}, ${g}, ${40 + Math.random() * 20}, 0.3)`;
      ctx.fillRect(x, y, 1, 1.5 + Math.random() * 1.5);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, []);

  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f1f5f9" roughness={1} />
      </mesh>
      {/* Turf */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[FIELD_SIZE + 1, FIELD_SIZE + 1]} />
        <meshStandardMaterial map={turfTexture} roughness={0.85} color="#5cc46e" />
      </mesh>
    </>
  );
}

function GameScene({
  duration,
  difficulty,
  inputMode,
  getGameInput,
  onFinish,
  onBackToMenu,
  hudRef,
}: TargetGameProps & { hudRef: MutableRefObject<HudData> }) {
  const config = DIFFICULTY[difficulty];
  const sessionIdRef = useRef(crypto.randomUUID());

  const stateRef = useRef({
    score: 0,
    hits: 0,
    misses: 0,
    elapsedTime: 0,
    started: false,
    finished: false,
    countdown: 3,
    backTimer: 0,
    gameStartWallTime: 0,
    targets: [] as ActiveTarget[],
    reactionTimes: [] as number[],
    targetIdCounter: 0,
  });

  const ballPosRef = useRef({ x: 0, z: 0 });
  const [targets, setTargets] = useState<ActiveTarget[]>([]);
  const renderThrottle = useRef(0);

  const playSound = useCallback((type: 'hit' | 'miss') => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = type === 'hit' ? 660 : 220;
      osc.type = type === 'hit' ? 'sine' : 'square';
      gain.gain.value = 0.08;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }, []);

  const spawnTarget = useCallback((s: typeof stateRef.current) => {
    const margin = 1;
    const halfField = FIELD_SIZE / 2 - margin;
    const x = (Math.random() * 2 - 1) * halfField;
    const z = (Math.random() * 2 - 1) * halfField;

    s.targets.push({
      x,
      z,
      radius: config.targetRadius,
      spawnTime: s.elapsedTime,
      hit: false,
      id: s.targetIdCounter++,
    });
  }, [config.targetRadius]);

  useFrame((_, delta) => {
    const s = stateRef.current;
    if (s.finished) return;

    // In camera mode: update ball from tracker input
    // In demo mode: raycasting plane handles position directly
    const input = getGameInput();
    if (input.active && input.mode === 'camera') {
      ballPosRef.current.x = (input.x - 0.5) * FIELD_SIZE;
      ballPosRef.current.z = -(input.y - 0.5) * FIELD_SIZE; // invert Y→Z
    }

    // Back to menu gesture
    const inExitZone = input.active && input.x > 0.85 && input.y < 0.15;
    if (inExitZone) {
      s.backTimer += delta;
      if (s.backTimer >= 3 && onBackToMenu) {
        s.finished = true;
        onBackToMenu();
        return;
      }
    } else {
      s.backTimer = 0;
    }

    // Countdown
    if (!s.started) {
      s.countdown -= delta;
      hudRef.current = {
        ...hudRef.current,
        countdown: Math.ceil(Math.max(0, s.countdown)),
        backProgress: s.backTimer / 3,
      };
      if (s.countdown <= 0) {
        s.started = true;
        s.gameStartWallTime = performance.now();
      }
      return;
    }

    s.elapsedTime = (performance.now() - s.gameStartWallTime) / 1000;

    if (s.elapsedTime >= duration) {
      s.finished = true;
      const bestTime = s.reactionTimes.length > 0 ? Math.min(...s.reactionTimes) : 0;
      const avgTime = s.reactionTimes.length > 0
        ? s.reactionTimes.reduce((a, b) => a + b, 0) / s.reactionTimes.length
        : 0;
      onFinish({
        score: s.score,
        hits: s.hits,
        misses: s.misses,
        accuracy: s.hits + s.misses > 0 ? Math.round((s.hits / (s.hits + s.misses)) * 100) : 0,
        bestTime: Math.round(bestTime * 100) / 100,
        avgTime: Math.round(avgTime * 100) / 100,
        duration,
        difficulty,
        inputMode: input.mode,
        sessionId: sessionIdRef.current,
      });
      return;
    }

    // Spawn targets if needed
    const activeCount = s.targets.filter(t => !t.hit).length;
    if (activeCount < config.minTargets) {
      spawnTarget(s);
    }

    // Check hits and expiry
    for (const target of s.targets) {
      if (target.hit) continue;

      const age = s.elapsedTime - target.spawnTime;

      // Check if ball is on target
      const dx = ballPosRef.current.x - target.x;
      const dz = ballPosRef.current.z - target.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < target.radius) {
        target.hit = true;
        s.hits++;
        const reactionTime = age;
        s.reactionTimes.push(reactionTime);
        // Score: faster = more points, max 100 per target
        const timeBonus = Math.max(0, 1 - reactionTime / config.maxTime);
        s.score += Math.round(50 + timeBonus * 50);
        playSound('hit');
      } else if (age > config.maxTime) {
        // Expired
        target.hit = true; // remove it
        s.misses++;
        playSound('miss');
      }
    }

    // Clean up old targets
    s.targets = s.targets.filter(t => {
      if (t.hit) {
        const age = s.elapsedTime - t.spawnTime;
        return age < (t.hit ? t.spawnTime + 0.5 : config.maxTime + 0.5); // keep briefly for animation
      }
      return true;
    });
    // Actually just remove hit targets after 0.3s
    s.targets = s.targets.filter(t => {
      if (t.hit) return s.elapsedTime - t.spawnTime < config.maxTime + 0.3;
      return true;
    });

    hudRef.current = {
      score: s.score,
      hits: s.hits,
      timeLeft: Math.max(0, duration - s.elapsedTime),
      countdown: 0,
      backProgress: s.backTimer / 3,
      currentTargetTime: s.targets.find(t => !t.hit)
        ? s.elapsedTime - (s.targets.find(t => !t.hit)?.spawnTime || 0)
        : 0,
    };

    renderThrottle.current++;
    if (renderThrottle.current >= 2) {
      renderThrottle.current = 0;
      setTargets([...s.targets]);
    }
  });

  return (
    <>
      <CameraSetup />
      <ambientLight intensity={0.9} color="#ffffff" />
      <directionalLight position={[5, 12, 5]} intensity={1.0} color="#ffffff" castShadow />
      <hemisphereLight args={['#e0f2fe', '#dcfce7', 0.5]} />

      <Field />

      {/* Invisible plane for mouse-to-ground raycasting (demo mode only) */}
      {inputMode === 'demo' && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.05, 0]}
          onPointerMove={(e) => {
            e.stopPropagation();
            ballPosRef.current.x = e.point.x;
            ballPosRef.current.z = e.point.z;
          }}
        >
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      <Ball posRef={ballPosRef} />

      {targets.map((t) => {
        const age = (stateRef.current.elapsedTime || 0) - t.spawnTime;
        const progress = Math.min(1, age / DIFFICULTY[difficulty].maxTime);
        return (
          <Target
            key={t.id}
            position={[t.x, 0.03, t.z]}
            radius={t.radius}
            progress={progress}
            hit={t.hit}
          />
        );
      })}

      <color attach="background" args={['#f0f4f8']} />
      <fog attach="fog" args={['#f0f4f8', 12, 20]} />
    </>
  );
}

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 10, 6);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

export default function TargetGame(props: TargetGameProps) {
  const { duration } = props;

  const hudRef = useRef<HudData>({
    score: 0,
    hits: 0,
    timeLeft: duration,
    countdown: 3,
    backProgress: 0,
    currentTargetTime: 0,
  });

  const [hud, setHud] = useState<HudData>(hudRef.current);

  useEffect(() => {
    const interval = setInterval(() => {
      setHud({ ...hudRef.current });
    }, 66);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true }}
        onCreated={({ gl }) => gl.setClearColor('#f0f4f8')}
        style={{ background: '#f0f4f8' }}
      >
        <GameScene {...props} hudRef={hudRef} />
      </Canvas>

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-start max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{hud.score}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Score</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{Math.ceil(hud.timeLeft)}s</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Time</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 text-right shadow-sm">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{hud.hits}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Hits</div>
          </div>
        </div>
      </div>

      {/* Back-to-menu */}
      {hud.backProgress > 0.05 && (
        <div className="absolute top-16 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-2xl px-4 py-2 pointer-events-none shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#ddd" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="3"
              strokeDasharray={`${hud.backProgress * 94.2} 94.2`} strokeLinecap="round" transform="rotate(-90 18 18)" />
          </svg>
          <span className="text-xs text-yellow-600">Back to menu</span>
        </div>
      )}

      {/* Countdown */}
      {hud.countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
          <div className="text-9xl font-black text-gray-900">{hud.countdown}</div>
        </div>
      )}
    </div>
  );
}
