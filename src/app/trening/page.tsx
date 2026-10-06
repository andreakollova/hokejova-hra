'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CalibrationData, InputMode, GameInput } from '@/lib/tracking';
import { SlalomResult } from '@/components/games/SlalomGame';
import { MusicConfig } from '@/components/music/MusicSelector';
import { useTracker } from '@/hooks/useTracker';
import { useCamera } from '@/hooks/useCamera';
import Link from 'next/link';

const CalibrationWizard = dynamic(
  () => import('@/components/tracking/CalibrationWizard'),
  { ssr: false }
);
const SlalomGame = dynamic(() => import('@/components/games/SlalomGame'), {
  ssr: false,
});
const ResultScreen = dynamic(() => import('@/components/ui/ResultScreen'), {
  ssr: false,
});
const MusicSelector = dynamic(() => import('@/components/music/MusicSelector'), {
  ssr: false,
});

type Phase = 'setup' | 'calibration' | 'music' | 'playing' | 'result';

export default function TreningPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [result, setResult] = useState<SlalomResult | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [musicConfig, setMusicConfig] = useState<MusicConfig | null>(null);

  const tracker = useTracker(inputMode);
  const videoRef = useRef<HTMLVideoElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { startCamera, stopCamera } = useCamera();

  // Load saved calibration
  useEffect(() => {
    const saved = localStorage.getItem('ballTracker_calibration');
    if (saved) {
      try {
        setCalibration(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const handleCalibrationComplete = useCallback(
    (cal: CalibrationData) => {
      setCalibration(cal);
      tracker.setCalibration(cal);
      setPhase('setup');
    },
    [tracker]
  );

  const startGame = useCallback(async () => {
    if (inputMode === 'demo') {
      tracker.startDemo();
      setPhase('playing');
      return;
    }

    if (!calibration) {
      setPhase('calibration');
      return;
    }

    // Start camera and tracking
    tracker.setCalibration(calibration);
    const video = videoRef.current;
    if (video) {
      const info = await startCamera(calibration.cameraDeviceId, video);
      if (info) {
        tracker.startTracking(video);
        setPhase('playing');
      }
    }
  }, [inputMode, calibration, tracker, startCamera]);

  const handleFinish = useCallback((res: SlalomResult) => {
    setResult(res);
    setPhase('result');
    tracker.stopTracking();
    stopCamera();
  }, [tracker, stopCamera]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Monitor tracking quality during game
  useEffect(() => {
    if (phase !== 'playing' || inputMode === 'demo') return;

    const interval = setInterval(() => {
      const state = tracker.state;
      if (state.quality === 'lost' && !isPaused) {
        setIsPaused(true);
      } else if (state.quality !== 'lost' && isPaused) {
        // Resume after 2s countdown
        setTimeout(() => setIsPaused(false), 2000);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [phase, inputMode, tracker.state, isPaused]);

  // Handle demo mouse input on game container
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (inputMode !== 'demo' || phase !== 'playing') return;
      const rect = e.currentTarget.getBoundingClientRect();
      tracker.handleDemoMouseMove(e, rect);
    },
    [inputMode, phase, tracker]
  );

  const handleFullscreen = () => {
    if (gameContainerRef.current) {
      gameContainerRef.current.requestFullscreen?.();
    }
  };

  if (phase === 'calibration') {
    return (
      <CalibrationWizard
        onComplete={handleCalibrationComplete}
        onCancel={() => setPhase('setup')}
      />
    );
  }

  if (phase === 'music') {
    return (
      <MusicSelector
        onSelect={(config) => {
          setMusicConfig(config);
          setPhase('setup');
        }}
        onCancel={() => setPhase('setup')}
      />
    );
  }

  if (phase === 'result' && result) {
    return (
      <ResultScreen
        type="slalom"
        result={result}
        onPlayAgain={() => {
          setResult(null);
          setPhase('setup');
        }}
        onMenu={() => {
          setResult(null);
          setPhase('setup');
        }}
      />
    );
  }

  if (phase === 'playing') {
    return (
      <div
        ref={gameContainerRef}
        className="w-screen h-screen relative"
        onMouseMove={handleMouseMove}
      >
        {/* Hidden video for camera tracking */}
        <video ref={videoRef} className="hidden" playsInline muted autoPlay />

        <SlalomGame
          difficulty={difficulty}
          duration={duration}
          inputMode={inputMode}
          getGameInput={tracker.getGameInput}
          onFinish={handleFinish}
          onPause={handlePause}
          onResume={handleResume}
          isPaused={isPaused}
          onBackToMenu={() => {
            tracker.stopTracking();
            stopCamera();
            setMusicConfig(null);
            setPhase('setup');
          }}
          beatTimestamps={musicConfig?.beatMap?.beats}
          bpm={musicConfig?.bpm}
        />

        {/* Tracking quality indicator */}
        {inputMode === 'camera' && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                tracker.state.quality === 'good'
                  ? 'bg-green-500'
                  : tracker.state.quality === 'fair'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-gray-400">
              {tracker.state.fps} fps
            </span>
          </div>
        )}

        {inputMode === 'demo' && (
          <div className="absolute bottom-4 left-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-2">
            <span className="text-xs text-yellow-400">
              Demo režim - pohybuj myšou
            </span>
          </div>
        )}

        {/* Fullscreen button */}
        <button
          onClick={handleFullscreen}
          className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    );
  }

  // Setup phase
  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Späť
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Slalom</h1>
          <p className="text-gray-400 leading-relaxed">
            Vyhýbaj sa kužeľom striedavo zľava a sprava. Kužele sa priblížujú k tebe
            a ty musíš viesť loptičku na správnu stranu.
          </p>
        </div>

        <div className="space-y-7">
          {/* Input mode */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Režim vstupu
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setInputMode('camera')}
                className={`flex-1 rounded-2xl p-4 border-2 transition-all ${
                  inputMode === 'camera'
                    ? 'border-green-500/60 bg-green-500/8'
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                }`}
              >
                <div className="text-sm font-semibold text-white">Kamera</div>
                <div className="text-xs text-gray-400 mt-1">Sledovanie reálnej loptičky</div>
              </button>
              <button
                onClick={() => setInputMode('demo')}
                className={`flex-1 rounded-2xl p-4 border-2 transition-all ${
                  inputMode === 'demo'
                    ? 'border-yellow-500/60 bg-yellow-500/8'
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                }`}
              >
                <div className="text-sm font-semibold text-white">Demo (myš)</div>
                <div className="text-xs text-gray-400 mt-1">Testovanie bez kamery</div>
              </button>
            </div>
          </div>

          {/* Calibration status */}
          {inputMode === 'camera' && (
            <div className="flex items-center justify-between card p-5">
              <div>
                <div className="text-sm font-semibold text-white">Kalibrácia kamery</div>
                <div className="text-xs text-gray-400 mt-1.5">
                  {calibration
                    ? `Uložená (${calibration.resolution.width}x${calibration.resolution.height})`
                    : 'Nie je nastavená'}
                </div>
              </div>
              <button
                onClick={() => setPhase('calibration')}
                className="text-sm font-medium text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/15 px-4 py-2 rounded-xl transition-all"
              >
                {calibration ? 'Prekalibrovať' : 'Kalibrovať'}
              </button>
            </div>
          )}

          {/* Difficulty */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Obťažnosť
            </label>
            <div className="flex gap-2.5">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${
                    difficulty === d
                      ? 'border-green-500/60 bg-green-500/8 text-green-400'
                      : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-700 hover:text-gray-300'
                  }`}
                >
                  {d === 'easy' ? 'Ľahká' : d === 'medium' ? 'Stredná' : 'Ťažká'}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Dĺžka tréningu
            </label>
            <div className="flex gap-2.5">
              {([30, 60, 90] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${
                    duration === d
                      ? 'border-green-500/60 bg-green-500/8 text-green-400'
                      : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-700 hover:text-gray-300'
                  }`}
                >
                  {d} sekúnd
                </button>
              ))}
            </div>
          </div>

          {/* Beat mode */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Hudba
            </label>
            <button
              onClick={() => setPhase('music')}
              className={`w-full rounded-2xl p-4 border-2 transition-all text-left ${
                musicConfig
                  ? 'border-green-500/60 bg-green-500/8'
                  : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
              }`}
            >
              {musicConfig ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {musicConfig.track?.name || `${musicConfig.bpm} BPM`}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {musicConfig.track?.artists || (musicConfig.mode === 'tap' ? 'Tap tempo' : 'Metronóm')}
                      {' - '}{musicConfig.bpm} BPM
                    </div>
                  </div>
                  <span className="text-xs text-green-400">Zmeniť</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Beat mód</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Kužele syncnuté na rytmus hudby
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Nastaviť</span>
                </div>
              )}
            </button>
            {musicConfig && (
              <button
                onClick={() => setMusicConfig(null)}
                className="text-xs text-gray-600 hover:text-gray-400 mt-2 transition-colors"
              >
                Vypnúť beat mód
              </button>
            )}
          </div>

          {/* Start button */}
          <button onClick={startGame} className="btn-primary w-full text-lg py-4 mt-2">
            {musicConfig ? `Hrať na ${musicConfig.bpm} BPM` : 'Spustiť tréning'}
          </button>

          {inputMode === 'demo' && (
            <p className="text-center text-xs text-gray-600">
              Výsledky z demo režimu sa neukladajú do rebríčka.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
