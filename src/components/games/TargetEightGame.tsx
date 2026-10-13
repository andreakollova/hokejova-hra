'use client';

import { useRef, useState, useCallback, useEffect, useMemo, MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GameInput, InputMode } from '@/lib/tracking';

interface TargetEightProps {
  duration: 30 | 60 | 90;
  difficulty: 'easy' | 'medium' | 'hard';
  inputMode: InputMode;
  getGameInput: () => GameInput;
  onFinish: (result: TargetEightResult) => void;
  onBackToMenu?: () => void;
}

export interface TargetEightResult {
  score: number;
  completedEights: number;
  hits: number;
  duration: number;
  difficulty: string;
  inputMode: InputMode;
  sessionId: string;
}

const FIELD_SIZE = 8;

// Figure-8 checkpoint positions (normalized 0-1, converted to field coords)
// Path: top-left → bottom-left → bottom-right → top-right → repeat
function generateEightPoints(scale: number): { x: number; z: number }[] {
  const cx = 0;
  const cz = 0;
  const rx = 2.0 * scale;
  const rz = 1.5 * scale;
  const points: { x: number; z: number }[] = [];
  const segments = 12;

  // Left loop (counterclockwise)
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push({
      x: cx - rx + Math.cos(angle) * rx,
      z: cz + Math.sin(angle) * rz,
    });
  }

  // Right loop (clockwise)
  for (let i = 0; i < segments; i++) {
    const angle = -(i / segments) * Math.PI * 2;
    points.push({
      x: cx + rx + Math.cos(angle) * rx,
      z: cz + Math.sin(angle) * rz,
    });
  }

  return points;
}

interface HudData {
  score: number;
  completedEights: number;
  currentCheckpoint: number;
  totalCheckpoints: number;
  timeLeft: number;
  countdown: number;
  backProgress: number;
}

const DIFFICULTY = {
  easy: { scale: 1.2, checkpointRadius: 0.7, points: 8 },
  medium: { scale: 1.0, checkpointRadius: 0.55, points: 12 },
  hard: { scale: 0.8, checkpointRadius: 0.4, points: 16 },
};

function Checkpoint({
  position,
  radius,
  isNext,
  isHit,
}: {
  position: [number, number, number];
  radius: number;
  isNext: boolean;
  isHit: boolean;
}) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshStandardMaterial
          color={isHit ? '#22c55e' : isNext ? '#3b82f6' : '#e5e7eb'}
          emissive={isNext ? '#3b82f6' : isHit ? '#22c55e' : '#000000'}
          emissiveIntensity={isNext ? 0.4 : isHit ? 0.3 : 0}
          transparent
          opacity={isHit ? 0.4 : isNext ? 0.8 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Pulsing ring for next checkpoint */}
      {isNext && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[radius - 0.05, radius + 0.05, 32]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

function PathLine({ points }: { points: { x: number; z: number }[] }) {
  const linePoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (const p of points) {
      pts.push(new THREE.Vector3(p.x, 0.02, p.z));
    }
    // Close the loop
    if (points.length > 0) pts.push(new THREE.Vector3(points[0].x, 0.02, points[0].z));
    return pts;
  }, [points]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(linePoints);
    return g;
  }, [linePoints]);

  return (
    <line>
      <bufferGeometry attach="geometry" {...geometry} />
      <lineBasicMaterial color="#cbd5e1" transparent opacity={0.5} />
    </line>
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
      ctx.fillStyle = `rgba(${40 + Math.random() * 20}, ${140 + Math.random() * 50}, ${40 + Math.random() * 20}, 0.3)`;
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f1f5f9" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[FIELD_SIZE + 2, FIELD_SIZE + 2]} />
        <meshStandardMaterial map={turfTexture} roughness={0.85} color="#5cc46e" />
      </mesh>
    </>
  );
}

function GameScene({
  duration,
  difficulty,
  getGameInput,
  onFinish,
  onBackToMenu,
  hudRef,
}: TargetEightProps & { hudRef: MutableRefObject<HudData> }) {
  const config = DIFFICULTY[difficulty];
  const sessionIdRef = useRef(crypto.randomUUID());

  // Generate figure-8 checkpoints
  const eightPoints = useMemo(() => {
    const allPoints = generateEightPoints(config.scale);
    // Take evenly spaced subset
    const step = Math.max(1, Math.floor(allPoints.length / config.points));
    const subset: { x: number; z: number }[] = [];
    for (let i = 0; i < allPoints.length && subset.length < config.points; i += step) {
      subset.push(allPoints[i]);
    }
    return subset;
  }, [config]);

  const stateRef = useRef({
    score: 0,
    completedEights: 0,
    hits: 0,
    nextCheckpoint: 0,
    elapsedTime: 0,
    started: false,
    finished: false,
    countdown: 3,
    backTimer: 0,
    gameStartWallTime: 0,
    hitCheckpoints: new Set<number>(),
  });

  const ballPosRef = useRef({ x: 0, z: 0 });
  const [checkpointStates, setCheckpointStates] = useState<{ isNext: boolean; isHit: boolean }[]>(
    eightPoints.map((_, i) => ({ isNext: i === 0, isHit: false }))
  );
  const renderThrottle = useRef(0);

  const playSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.value = 0.06;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }, []);

  useFrame((_, delta) => {
    const s = stateRef.current;
    if (s.finished) return;

    const input = getGameInput();
    if (input.active) {
      ballPosRef.current.x = (input.x - 0.5) * FIELD_SIZE;
      ballPosRef.current.z = (input.y - 0.5) * FIELD_SIZE;
    }

    // Back to menu
    const inExitZone = input.active && input.x > 0.85 && input.y < 0.15;
    if (inExitZone) {
      s.backTimer += delta;
      if (s.backTimer >= 3 && onBackToMenu) { s.finished = true; onBackToMenu(); return; }
    } else { s.backTimer = 0; }

    // Countdown
    if (!s.started) {
      s.countdown -= delta;
      hudRef.current = { ...hudRef.current, countdown: Math.ceil(Math.max(0, s.countdown)), backProgress: s.backTimer / 3 };
      if (s.countdown <= 0) { s.started = true; s.gameStartWallTime = performance.now(); }
      return;
    }

    s.elapsedTime = (performance.now() - s.gameStartWallTime) / 1000;

    if (s.elapsedTime >= duration) {
      s.finished = true;
      onFinish({
        score: s.score,
        completedEights: s.completedEights,
        hits: s.hits,
        duration,
        difficulty,
        inputMode: input.mode,
        sessionId: sessionIdRef.current,
      });
      return;
    }

    // Check if ball hits next checkpoint
    const nextCp = eightPoints[s.nextCheckpoint];
    const dx = ballPosRef.current.x - nextCp.x;
    const dz = ballPosRef.current.z - nextCp.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < config.checkpointRadius) {
      s.hitCheckpoints.add(s.nextCheckpoint);
      s.hits++;
      s.score += 10;
      playSound();

      s.nextCheckpoint = (s.nextCheckpoint + 1) % eightPoints.length;

      // Check if completed full eight
      if (s.nextCheckpoint === 0) {
        s.completedEights++;
        s.score += 50; // bonus for completing a full eight
        s.hitCheckpoints.clear();
      }
    }

    hudRef.current = {
      score: s.score,
      completedEights: s.completedEights,
      currentCheckpoint: s.nextCheckpoint + 1,
      totalCheckpoints: eightPoints.length,
      timeLeft: Math.max(0, duration - s.elapsedTime),
      countdown: 0,
      backProgress: s.backTimer / 3,
    };

    renderThrottle.current++;
    if (renderThrottle.current >= 3) {
      renderThrottle.current = 0;
      setCheckpointStates(
        eightPoints.map((_, i) => ({
          isNext: i === s.nextCheckpoint,
          isHit: s.hitCheckpoints.has(i),
        }))
      );
    }
  });

  return (
    <>
      <CameraSetup />
      <ambientLight intensity={0.9} color="#ffffff" />
      <directionalLight position={[5, 12, 5]} intensity={1.0} color="#ffffff" castShadow />
      <hemisphereLight args={['#e0f2fe', '#dcfce7', 0.5]} />

      <Field />
      <PathLine points={eightPoints} />
      <Ball posRef={ballPosRef} />

      {eightPoints.map((p, i) => (
        <Checkpoint
          key={i}
          position={[p.x, 0.03, p.z]}
          radius={config.checkpointRadius}
          isNext={checkpointStates[i]?.isNext || false}
          isHit={checkpointStates[i]?.isHit || false}
        />
      ))}

      <color attach="background" args={['#f0f4f8']} />
      <fog attach="fog" args={['#f0f4f8', 12, 20]} />
    </>
  );
}

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 12, 4);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

export default function TargetEightGame(props: TargetEightProps) {
  const { duration, difficulty } = props;
  const config = DIFFICULTY[difficulty];

  const hudRef = useRef<HudData>({
    score: 0,
    completedEights: 0,
    currentCheckpoint: 1,
    totalCheckpoints: config.points,
    timeLeft: duration,
    countdown: 3,
    backProgress: 0,
  });

  const [hud, setHud] = useState<HudData>(hudRef.current);

  useEffect(() => {
    const interval = setInterval(() => setHud({ ...hudRef.current }), 66);
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
            <div className="text-xs text-gray-400 uppercase tracking-wider">Skore</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{Math.ceil(hud.timeLeft)}s</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Cas</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{hud.completedEights}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Osmicky</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 text-right shadow-sm">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{hud.currentCheckpoint}/{hud.totalCheckpoints}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Bod</div>
          </div>
        </div>
      </div>

      {hud.backProgress > 0.05 && (
        <div className="absolute top-16 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-2xl px-4 py-2 pointer-events-none shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#ddd" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="3"
              strokeDasharray={`${hud.backProgress * 94.2} 94.2`} strokeLinecap="round" transform="rotate(-90 18 18)" />
          </svg>
          <span className="text-xs text-yellow-600">Navrat do menu</span>
        </div>
      )}

      {hud.countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
          <div className="text-9xl font-black text-gray-900">{hud.countdown}</div>
        </div>
      )}
    </div>
  );
}
