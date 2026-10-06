'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CalibrationData, InputMode, GameInput } from '@/lib/tracking';
import { SlalomResult } from '@/components/games/SlalomGame';
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

type Phase = 'setup' | 'calibration' | 'playing' | 'result';

export default function TreningPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [result, setResult] = useState<SlalomResult | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);

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
              Demo rezim - pohybuj mysou
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
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8 inline-block"
        >
          &larr; Spat
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Slalom</h1>
        <p className="text-gray-400 mb-8">
          Vyhybaj sa kuzelom striedavo zlava a sprava. Kuzele sa priblizuju k tebe
          a ty musys viest lopticku na spravnu stranu.
        </p>

        {/* Input mode */}
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-3 block">
              Rezim vstupu
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setInputMode('camera')}
                className={`flex-1 rounded-xl p-4 border transition-all ${
                  inputMode === 'camera'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <div className="text-sm font-medium text-white">Kamera</div>
                <div className="text-xs text-gray-400 mt-1">
                  Sledovanie realnej lopticky
                </div>
              </button>
              <button
                onClick={() => setInputMode('demo')}
                className={`flex-1 rounded-xl p-4 border transition-all ${
                  inputMode === 'demo'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <div className="text-sm font-medium text-white">
                  Demo (mys)
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Testovanie bez kamery
                </div>
              </button>
            </div>
          </div>

          {/* Calibration status */}
          {inputMode === 'camera' && (
            <div className="flex items-center justify-between bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div>
                <div className="text-sm font-medium text-white">
                  Kalibracia kamery
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {calibration
                    ? `Kalibracia ulozena (${calibration.resolution.width}x${calibration.resolution.height})`
                    : 'Nie je nastavena - kalibracia sa spusti automaticky'}
                </div>
              </div>
              <button
                onClick={() => setPhase('calibration')}
                className="text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                {calibration ? 'Prekalibrovat' : 'Kalibrovat'}
              </button>
            </div>
          )}

          {/* Difficulty */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-3 block">
              Obtaznost
            </label>
            <div className="flex gap-3">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 rounded-xl py-3 border transition-all text-sm font-medium ${
                    difficulty === d
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {d === 'easy' ? 'Lahka' : d === 'medium' ? 'Stredna' : 'Tazka'}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-3 block">
              Dlzka treningu
            </label>
            <div className="flex gap-3">
              {([30, 60, 90] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 rounded-xl py-3 border transition-all text-sm font-medium ${
                    duration === d
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button onClick={startGame} className="btn-primary w-full text-lg py-4">
            Spustit trening
          </button>
        </div>
      </div>
    </div>
  );
}
