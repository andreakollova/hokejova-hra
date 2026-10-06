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
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                tracker.state.quality === 'good'
                  ? 'bg-green-500'
                  : tracker.state.quality === 'fair'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-gray-500">{tracker.state.fps} fps</span>
          </div>
        )}

        {inputMode === 'demo' && (
          <div className="absolute bottom-4 left-4 bg-yellow-50/90 border border-yellow-200 rounded-lg px-3 py-2 backdrop-blur-sm">
            <span className="text-xs text-yellow-700">Demo režim - pohybuj myšou</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8 inline-block"
        >
          &larr; Späť
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Osmičky</h1>
        <p className="text-gray-500 mb-8">
          Veď loptičku v tvare osmičky okolo dvoch bodov. Počíta sa počet
          dokončených osmičiek za zvolený čas.
        </p>

        <div className="space-y-6">
          {/* Input mode */}
          <div>
            <label className="text-sm font-medium text-gray-500 mb-3 block">
              Režim vstupu
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setInputMode('camera')}
                className={`flex-1 rounded-xl p-4 border-2 transition-all ${
                  inputMode === 'camera'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium text-gray-900">Kamera</div>
                <div className="text-xs text-gray-500 mt-1">Sledovanie reálnej loptičky</div>
              </button>
              <button
                onClick={() => setInputMode('demo')}
                className={`flex-1 rounded-xl p-4 border-2 transition-all ${
                  inputMode === 'demo'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium text-gray-900">Demo (mys)</div>
                <div className="text-xs text-gray-500 mt-1">Testovanie bez kamery</div>
              </button>
            </div>
          </div>

          {/* Calibration */}
          {inputMode === 'camera' && (
            <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div>
                <div className="text-sm font-medium text-gray-900">Kalibrácia kamery</div>
                <div className="text-xs text-gray-500 mt-1">
                  {calibration
                    ? `Kalibrácia uložená (${calibration.resolution.width}x${calibration.resolution.height})`
                    : 'Nie je nastavená'}
                </div>
              </div>
              <button
                onClick={() => setPhase('calibration')}
                className="text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                {calibration ? 'Prekalibrovať' : 'Kalibrovať'}
              </button>
            </div>
          )}

          {/* Duration */}
          <div>
            <label className="text-sm font-medium text-gray-500 mb-3 block">
              Dĺžka tréningu
            </label>
            <div className="flex gap-3">
              {([30, 60, 90] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 rounded-xl py-3 border-2 transition-all text-sm font-medium ${
                    duration === d
                      ? 'border-green-500 bg-green-50 text-green-600'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs text-gray-500">
            Presnosť hodnotenia osmičiek závisí od kvality farebného sledovania.
            Pre najlepšie výsledky použi výrazne farebnú loptičku a dobré osvetlenie.
          </div>

          <button onClick={startGame} className="btn-primary w-full text-lg py-4">
            Spustiť tréning
          </button>
        </div>
      </div>
    </div>
  );
}
