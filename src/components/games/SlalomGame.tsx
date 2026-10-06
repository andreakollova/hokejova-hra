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
  onBackToMenu?: () => void;
  /** Beat timestamps in seconds - if provided, cones sync to beats */
  beatTimestamps?: number[];
  /** BPM for display */
  bpm?: number;
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
const BALL_Y = 0.12;
const CONE_Y = 0;

interface HudData {
  score: number;
  streak: number;
  timeLeft: number;
  countdown: number;
  feedback: 'success' | 'error' | null;
  backProgress: number;
  beatPulse: boolean; // flash on beat
  bpm: number;
}

// --- 3D Components ---

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
  const arrowX = side === 'left' ? -1.0 : 1.0;

  return (
    <group position={position}>
      {/* Cone body */}
      <mesh castShadow>
        <coneGeometry args={[0.22, 0.65, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
      </mesh>
      {/* Cone base */}
      <mesh position={[0, -0.33, 0]} receiveShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Gate corridor - glowing line showing which side to pass */}
      {!passed && (
        <group position={[arrowX, 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.8, 0.2]} />
            <meshStandardMaterial
              color="#4ade80"
              emissive="#4ade80"
              emissiveIntensity={0.5}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** White field hockey ball with dimple texture */
function HockeyBall({ posRef }: { posRef: MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Create a dimple normal map procedurally
  const normalMap = useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, size, size);

    // Dimples
    const dimpleCount = 40;
    for (let i = 0; i < dimpleCount; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 3 + Math.random() * 4;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, '#6060d0');
      gradient.addColorStop(0.7, '#7070e0');
      gradient.addColorStop(1, '#8080ff');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = posRef.current;
      meshRef.current.rotation.z -= 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, BALL_Y, 2]} castShadow>
      <sphereGeometry args={[0.18, 24, 24]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#f0f0f0"
        roughness={0.45}
        metalness={0.05}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.3, 0.3)}
      />
    </mesh>
  );
}

/** Green artificial turf surface */
function TurfSurface() {
  const turfTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base green
    ctx.fillStyle = '#2d7a3a';
    ctx.fillRect(0, 0, size, size);

    // Grass grain noise
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const brightness = 35 + Math.random() * 30;
      ctx.fillStyle = `rgb(${brightness}, ${90 + Math.random() * 40}, ${brightness})`;
      ctx.fillRect(x, y, 1, 2 + Math.random() * 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 8);
    return texture;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -TRACK_DEPTH / 2]} receiveShadow>
      <planeGeometry args={[TRACK_WIDTH + 4, TRACK_DEPTH + 10]} />
      <meshStandardMaterial
        map={turfTexture}
        roughness={0.95}
        metalness={0}
        color="#3a8a4a"
      />
    </mesh>
  );
}

/** Side boundary lines on the turf */
function TurfLines() {
  const lineTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 4;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 4, 4);
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group>
      {/* Left line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-TRACK_WIDTH / 2, 0.001, -TRACK_DEPTH / 2]}>
        <planeGeometry args={[0.08, TRACK_DEPTH + 10]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Right line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[TRACK_WIDTH / 2, 0.001, -TRACK_DEPTH / 2]}>
        <planeGeometry args={[0.08, TRACK_DEPTH + 10]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Center line (dashed effect via opacity) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -TRACK_DEPTH / 2]}>
        <planeGeometry args={[0.05, TRACK_DEPTH + 10]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// --- Game Logic ---

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
  onBackToMenu,
  beatTimestamps,
  bpm,
}: GameSceneProps) {
  const config = SLALOM_CONFIGS[difficulty];
  const challengeKey = `slalom-${difficulty}-${duration}`;
  const challengeVersion = CHALLENGE_VERSIONS[challengeKey] || 'v1';
  const sessionIdRef = useRef(crypto.randomUUID());

  // Generate cone sequence: from beats if available, otherwise from seeded PRNG
  const coneSequence = useMemo(() => {
    if (beatTimestamps && beatTimestamps.length > 0) {
      // Beat-synced: one cone per beat, alternating sides
      const cones: ConeDefinition[] = [];
      let lastSide: 'left' | 'right' = 'right';
      for (const t of beatTimestamps) {
        if (t < 2 || t > duration - 1) continue;
        const side: 'left' | 'right' = lastSide === 'left' ? 'right' : 'left';
        lastSide = side;
        cones.push({ time: t, side, scored: false });
      }
      return cones;
    }
    return generateConeSequence(duration, difficulty, challengeVersion);
  }, [duration, difficulty, challengeVersion, beatTimestamps]);

  const stateRef = useRef({
    score: 0,
    streak: 0,
    longestStreak: 0,
    correctPasses: 0,
    errors: 0,
    elapsedTime: 0,
    ballX: 0,
    ballY: 0.5,
    cones: [] as ActiveCone[],
    finished: false,
    started: false,
    countdown: 3,
    backTimer: 0,
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

    // Get input first (needed for back-to-menu even during countdown)
    const input = getGameInput();
    if (input.active) {
      s.ballX = (input.x - 0.5) * TRACK_WIDTH;
      s.ballY = input.y;
      ballPosRef.current = s.ballX;
    }

    // Back-to-menu: ball in top-right corner for 3 seconds
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

    // Check if current time is near a beat (for visual pulse)
    let onBeat = false;
    if (beatTimestamps) {
      for (const bt of beatTimestamps) {
        if (Math.abs(s.elapsedTime - bt) < 0.08) {
          onBeat = true;
          break;
        }
      }
    }

    hudRef.current = {
      score: s.score,
      streak: s.streak,
      timeLeft: Math.max(0, duration - s.elapsedTime),
      countdown: 0,
      feedback: feedbackType,
      backProgress: s.backTimer / 3,
      beatPulse: onBeat,
      bpm: bpm || 0,
    };

    setCones([...s.cones]);
  });

  return (
    <>
      <CameraSetup />

      {/* Warm outdoor-ish lighting */}
      <ambientLight intensity={0.5} color="#f5f0e0" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.0}
        color="#fff8e8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight
        args={['#87ceeb', '#3a8a4a', 0.3]}
      />

      {/* Green turf */}
      <TurfSurface />
      <TurfLines />

      {/* White hockey ball with dimples */}
      <HockeyBall posRef={ballPosRef} />

      {/* Cones */}
      {cones.map((cone) => (
        <Cone
          key={cone.id}
          position={[0, CONE_Y + 0.33, cone.z]}
          side={cone.side}
          passed={cone.passed}
          correct={cone.correct}
        />
      ))}

      {/* Green-tinted fog */}
      <fog attach="fog" args={['#1a3a1a', 20, TRACK_DEPTH]} />
    </>
  );
}

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 5.5, 8);
    camera.lookAt(0, 0, -6);
  }, [camera]);
  return null;
}

// --- Main Wrapper ---

export default function SlalomGame(props: SlalomGameProps) {
  const { difficulty, duration, isPaused } = props;
  const config = SLALOM_CONFIGS[difficulty];

  const hudRef = useRef<HudData>({
    score: 0,
    streak: 0,
    timeLeft: duration,
    countdown: 3,
    feedback: null,
    backProgress: 0,
    beatPulse: false,
    bpm: props.bpm || 0,
  });

  const [hud, setHud] = useState<HudData>(hudRef.current);

  useEffect(() => {
    const interval = setInterval(() => {
      setHud({ ...hudRef.current });
      if (hudRef.current.feedback) {
        setTimeout(() => { hudRef.current.feedback = null; }, 400);
      }
    }, 66);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#1a3a1a' }}
      >
        <GameScene {...props} hudRef={hudRef} />
      </Canvas>

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-start max-w-3xl mx-auto">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl px-5 py-3">
            <div className="text-3xl font-bold text-white tabular-nums">{hud.score}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Skóre</div>
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-2xl px-5 py-3 text-center">
            <div className="text-3xl font-bold text-white tabular-nums">{Math.ceil(hud.timeLeft)}s</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">{config.label}</div>
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-2xl px-5 py-3 text-right">
            <div className="text-3xl font-bold text-white tabular-nums">{hud.streak}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Séria</div>
          </div>
          {hud.bpm > 0 && (
            <div className={`bg-black/40 backdrop-blur-md rounded-2xl px-5 py-3 text-center transition-all ${hud.beatPulse ? 'ring-2 ring-green-400/50 scale-105' : ''}`}>
              <div className="text-3xl font-bold text-white tabular-nums">{hud.bpm}</div>
              <div className="text-xs text-white/50 uppercase tracking-wider">BPM</div>
            </div>
          )}
        </div>
      </div>

      {/* Back-to-menu progress indicator */}
      {hud.backProgress > 0.05 && (
        <div className="absolute top-16 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-2xl px-4 py-2 pointer-events-none">
          <svg className="w-5 h-5" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#333" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke="#f59e0b" strokeWidth="3"
              strokeDasharray={`${hud.backProgress * 94.2} 94.2`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          </svg>
          <span className="text-xs text-yellow-400">Návrat do menu</span>
        </div>
      )}

      {/* Countdown */}
      {hud.countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-9xl font-black text-white drop-shadow-lg">{hud.countdown}</div>
        </div>
      )}

      {/* Pause */}
      {isPaused && hud.countdown <= 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-center bg-black/40 backdrop-blur-md rounded-3xl px-10 py-8">
            <div className="text-2xl font-bold text-yellow-400 mb-3">Sledovanie stratené</div>
            <p className="text-gray-300">Vráť loptičku do viditeľnej oblasti kamery</p>
          </div>
        </div>
      )}

      {/* Feedback flash */}
      {hud.feedback && (
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity ${
            hud.feedback === 'success'
              ? 'bg-green-500/8 border-2 border-green-400/20'
              : 'bg-red-500/8 border-2 border-red-400/20'
          }`}
          style={{ borderRadius: 0 }}
        />
      )}
    </div>
  );
}
