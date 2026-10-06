'use client';

import { useRef, useState, useCallback, useEffect, useMemo, MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GameInput, InputMode } from '@/lib/tracking';
import {
  generateConeSequence,
  ConeDefinition,
  SLALOM_CONFIGS,
  calculateConeScore,
  CHALLENGE_VERSIONS,
} from '@/lib/scoring';

interface SlalomGameProps {
  difficulty: 'easy' | 'medium' | 'hard';
  duration: 30 | 60 | 90;
  inputMode: InputMode;
  getGameInput: () => GameInput;
  onFinish: (result: SlalomResult) => void;
  onPause: (reason: string) => void;
  onResume: () => void;
  isPaused: boolean;
}

export interface SlalomResult {
  score: number;
  correctPasses: number;
  totalCones: number;
  accuracy: number;
  longestStreak: number;
  errors: number;
  duration: number;
  difficulty: string;
  challengeVersion: string;
  inputMode: InputMode;
  sessionId: string;
}

const TRACK_WIDTH = 8;
const TRACK_DEPTH = 40;
const BALL_Y = 0.15;
const CONE_Y = 0;

interface HudData {
  score: number;
  streak: number;
  timeLeft: number;
  countdown: number;
  feedback: 'success' | 'error' | null;
}

function Cone({
  position,
  side,
  passed,
  correct,
}: {
  position: [number, number, number];
  side: 'left' | 'right';
  passed: boolean;
  correct: boolean | null;
}) {
  const color = passed
    ? correct ? '#22c55e' : '#ef4444'
    : '#f59e0b';
  const arrowX = side === 'left' ? -0.8 : 0.8;

  return (
    <group position={position}>
      <mesh castShadow>
        <coneGeometry args={[0.25, 0.7, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {!passed && (
        <group position={[arrowX, 0.1, 0]}>
          <mesh>
            <boxGeometry args={[0.6, 0.02, 0.15]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={0.3}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

function Ball({ posRef }: { posRef: MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = posRef.current;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, BALL_Y, 2]} castShadow>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial
        color="#ff6b35"
        emissive="#ff6b35"
        emissiveIntensity={0.15}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

function TrackSurface() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -TRACK_DEPTH / 2]} receiveShadow>
      <planeGeometry args={[TRACK_WIDTH + 2, TRACK_DEPTH + 10]} />
      <meshStandardMaterial color="#1a1a2e" roughness={0.9} metalness={0} />
    </mesh>
  );
}

interface ActiveCone extends ConeDefinition {
  z: number;
  passed: boolean;
  correct: boolean | null;
  id: number;
}

interface GameSceneProps extends SlalomGameProps {
  hudRef: MutableRefObject<HudData>;
}

function GameScene({
  difficulty,
  duration,
  getGameInput,
  onFinish,
  isPaused,
  inputMode,
  hudRef,
}: GameSceneProps) {
  const config = SLALOM_CONFIGS[difficulty];
  const challengeKey = `slalom-${difficulty}-${duration}`;
  const challengeVersion = CHALLENGE_VERSIONS[challengeKey] || 'v1';
  const sessionIdRef = useRef(crypto.randomUUID());

  const coneSequence = useMemo(
    () => generateConeSequence(duration, difficulty, challengeVersion),
    [duration, difficulty, challengeVersion]
  );

  const stateRef = useRef({
    score: 0,
    streak: 0,
    longestStreak: 0,
    correctPasses: 0,
    errors: 0,
    elapsedTime: 0,
    ballX: 0,
    cones: [] as ActiveCone[],
    finished: false,
    started: false,
    countdown: 3,
  });

  const ballPosRef = useRef(0);
  const [cones, setCones] = useState<ActiveCone[]>([]);
  const coneIdRef = useRef(0);
  const nextConeIdx = useRef(0);

  const playSound = useCallback((type: 'success' | 'error') => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = type === 'success' ? 880 : 330;
      osc.type = type === 'success' ? 'sine' : 'square';
      gain.gain.value = 0.1;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }, []);

  useFrame((_, delta) => {
    const s = stateRef.current;
    if (s.finished) return;

    // Countdown
    if (!s.started) {
      s.countdown -= delta;
      hudRef.current = { ...hudRef.current, countdown: Math.ceil(Math.max(0, s.countdown)) };
      if (s.countdown <= 0) s.started = true;
      return;
    }

    if (isPaused) return;

    s.elapsedTime += delta;

    if (s.elapsedTime >= duration) {
      s.finished = true;
      onFinish({
        score: s.score,
        correctPasses: s.correctPasses,
        totalCones: s.correctPasses + s.errors,
        accuracy: s.correctPasses + s.errors > 0
          ? Math.round((s.correctPasses / (s.correctPasses + s.errors)) * 100)
          : 0,
        longestStreak: s.longestStreak,
        errors: s.errors,
        duration,
        difficulty,
        challengeVersion,
        inputMode,
        sessionId: sessionIdRef.current,
      });
      return;
    }

    const input = getGameInput();
    if (input.active) {
      s.ballX = (input.x - 0.5) * TRACK_WIDTH;
      ballPosRef.current = s.ballX;
    }

    // Spawn cones
    while (
      nextConeIdx.current < coneSequence.length &&
      coneSequence[nextConeIdx.current].time <= s.elapsedTime + TRACK_DEPTH / config.coneSpeed
    ) {
      const def = coneSequence[nextConeIdx.current];
      const timeUntil = def.time - s.elapsedTime;
      s.cones.push({
        ...def,
        z: -timeUntil * config.coneSpeed,
        passed: false,
        correct: null,
        id: coneIdRef.current++,
      });
      nextConeIdx.current++;
    }

    // Move cones
    const ballZ = 2;
    let feedbackType: 'success' | 'error' | null = null;

    for (const cone of s.cones) {
      cone.z += config.coneSpeed * delta;

      if (!cone.passed && cone.z >= ballZ - 0.3 && cone.z <= ballZ + 0.3) {
        cone.passed = true;
        const ballSide = s.ballX < 0 ? 'left' : 'right';
        const isCorrect = ballSide === cone.side;
        const minDist = config.movementRange * TRACK_WIDTH * 0.3;
        cone.correct = isCorrect && Math.abs(s.ballX) > minDist;

        if (cone.correct) {
          s.streak++;
          s.correctPasses++;
          if (s.streak > s.longestStreak) s.longestStreak = s.streak;
          s.score += calculateConeScore(difficulty, s.streak);
          feedbackType = 'success';
          playSound('success');
        } else {
          s.streak = 0;
          s.errors++;
          feedbackType = 'error';
          playSound('error');
        }
      }
    }

    s.cones = s.cones.filter((c) => c.z < ballZ + 5);

    // Update HUD ref (cheap - no React render)
    hudRef.current = {
      score: s.score,
      streak: s.streak,
      timeLeft: Math.max(0, duration - s.elapsedTime),
      countdown: 0,
      feedback: feedbackType,
    };

    // Update cone meshes at 30fps to save renders
    setCones([...s.cones]);
  });

  return (
    <>
      <CameraSetup />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#e0e0ff" />

      <TrackSurface />
      <Ball posRef={ballPosRef} />

      {cones.map((cone) => (
        <Cone
          key={cone.id}
          position={[0, CONE_Y + 0.35, cone.z]}
          side={cone.side}
          passed={cone.passed}
          correct={cone.correct}
        />
      ))}

      <fog attach="fog" args={['#0a0a1a', 15, TRACK_DEPTH]} />
    </>
  );
}

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 6, 8);
    camera.lookAt(0, 0, -5);
  }, [camera]);
  return null;
}

export default function SlalomGame(props: SlalomGameProps) {
  const { difficulty, duration, isPaused } = props;
  const config = SLALOM_CONFIGS[difficulty];

  const hudRef = useRef<HudData>({
    score: 0,
    streak: 0,
    timeLeft: duration,
    countdown: 3,
    feedback: null,
  });

  // Poll HUD ref to update DOM overlay at 15fps
  const [hud, setHud] = useState<HudData>(hudRef.current);

  useEffect(() => {
    const interval = setInterval(() => {
      setHud({ ...hudRef.current });
      // Clear feedback after showing
      if (hudRef.current.feedback) {
        setTimeout(() => {
          hudRef.current.feedback = null;
        }, 400);
      }
    }, 66);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0a0a1a' }}
      >
        <GameScene {...props} hudRef={hudRef} />
      </Canvas>

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-start max-w-3xl mx-auto">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="text-3xl font-bold text-white tabular-nums">{hud.score}</div>
            <div className="text-xs text-gray-400">Skore</div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
            <div className="text-3xl font-bold text-white tabular-nums">{Math.ceil(hud.timeLeft)}s</div>
            <div className="text-xs text-gray-400">{config.label}</div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-right">
            <div className="text-3xl font-bold text-white tabular-nums">{hud.streak}</div>
            <div className="text-xs text-gray-400">Seria</div>
          </div>
        </div>
      </div>

      {/* Countdown */}
      {hud.countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-8xl font-bold text-white animate-pulse">{hud.countdown}</div>
        </div>
      )}

      {/* Pause */}
      {isPaused && hud.countdown <= 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">Sledovanie stratene</div>
            <p className="text-gray-300">Vrat lopticku do viditelnej oblasti kamery</p>
          </div>
        </div>
      )}

      {/* Feedback flash */}
      {hud.feedback && (
        <div
          className={`absolute inset-0 pointer-events-none ${
            hud.feedback === 'success'
              ? 'bg-green-500/10 border-2 border-green-500/30'
              : 'bg-red-500/10 border-2 border-red-500/30'
          }`}
        />
      )}
    </div>
  );
}
