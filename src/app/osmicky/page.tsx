'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CalibrationData, InputMode } from '@/lib/tracking';
import { FigureEightResult } from '@/components/games/FigureEightGame';
import { useTracker } from '@/hooks/useTracker';
import { useCamera } from '@/hooks/useCamera';
import Link from 'next/link';

const CalibrationWizard = dynamic(
  () => import('@/components/tracking/CalibrationWizard'),
  { ssr: false }
);
const FigureEightGame = dynamic(
  () => import('@/components/games/FigureEightGame'),
  { ssr: false }
);
const ResultScreen = dynamic(() => import('@/components/ui/ResultScreen'), {
  ssr: false,
});

type Phase = 'setup' | 'calibration' | 'playing' | 'result';

export default function OsmickyPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [result, setResult] = useState<FigureEightResult | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);

  const tracker = useTracker(inputMode);
  const videoRef = useRef<HTMLVideoElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { startCamera, stopCamera } = useCamera();

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

  const handleFinish = useCallback(
    (res: FigureEightResult) => {
      setResult(res);
      setPhase('result');
      tracker.stopTracking();
      stopCamera();
    },
    [tracker, stopCamera]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (inputMode !== 'demo' || phase !== 'playing') return;
      const rect = e.currentTarget.getBoundingClientRect();
      tracker.handleDemoMouseMove(e, rect);
    },
    [inputMode, phase, tracker]
  );

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
        type="figure_eight"
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
        <video ref={videoRef} className="hidden" playsInline muted autoPlay />

        <FigureEightGame
          duration={duration}
          inputMode={inputMode}
          getGameInput={tracker.getGameInput}
          onFinish={handleFinish}
          onPause={() => setIsPaused(true)}
          isPaused={isPaused}
        />

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
            <span className="text-xs text-gray-400">{tracker.state.fps} fps</span>
          </div>
        )}

        {inputMode === 'demo' && (
          <div className="absolute bottom-4 left-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-2">
            <span className="text-xs text-yellow-400">Demo rezim - pohybuj mysou</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8 inline-block"
        >
          &larr; Spat
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Osmicky</h1>
        <p className="text-gray-400 mb-8">
          Ved lopticku v tvare osmicky okolo dvoch bodov. Pocita sa pocet
          dokoncenich osmiciek za zvoleny cas.
        </p>

        <div className="space-y-6">
          {/* Input mode */}
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
                <div className="text-xs text-gray-400 mt-1">Sledovanie realnej lopticky</div>
              </button>
              <button
                onClick={() => setInputMode('demo')}
                className={`flex-1 rounded-xl p-4 border transition-all ${
                  inputMode === 'demo'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <div className="text-sm font-medium text-white">Demo (mys)</div>
                <div className="text-xs text-gray-400 mt-1">Testovanie bez kamery</div>
              </button>
            </div>
          </div>

          {/* Calibration */}
          {inputMode === 'camera' && (
            <div className="flex items-center justify-between bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div>
                <div className="text-sm font-medium text-white">Kalibracia kamery</div>
                <div className="text-xs text-gray-400 mt-1">
                  {calibration
                    ? `Kalibracia ulozena (${calibration.resolution.width}x${calibration.resolution.height})`
                    : 'Nie je nastavena'}
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

          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/50 text-xs text-gray-500">
            Presnost hodnotenia osmiciek zavisi od kvality farebneho sledovania.
            Pre najlepsie vysledky pouzi vyrazne farebnu lopticku a dobre osvetlenie.
          </div>

          <button onClick={startGame} className="btn-primary w-full text-lg py-4">
            Spustit trening
          </button>
        </div>
      </div>
    </div>
  );
}
