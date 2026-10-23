'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CalibrationData, InputMode } from '@/lib/tracking';
import { FigureEightResult } from '@/components/games/FigureEightGame';
import { useTracker } from '@/hooks/useTracker';
import { useCamera } from '@/hooks/useCamera';
import { useSpotify } from '@/hooks/useSpotify';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { SpotifyTrack } from '@/lib/spotify';
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
const BackgroundMusic = dynamic(() => import('@/components/music/BackgroundMusic'), { ssr: false });

type Phase = 'setup' | 'calibration' | 'playing' | 'result';

export default function OsmickyPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [result, setResult] = useState<FigureEightResult | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [bgTrack, setBgTrack] = useState<SpotifyTrack | null>(null);
  const [spotifyReturned, setSpotifyReturned] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const tracker = useTracker(inputMode);
  const spotify = useSpotify();
  const { play: playMusic, pause: pauseMusic } = useMusicPlayer();
  const videoRef = useRef<HTMLVideoElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { startCamera, stopCamera } = useCamera();

  useEffect(() => {
    const saved = localStorage.getItem('ballTracker_calibration') || sessionStorage.getItem('ballTracker_calibration');
    if (saved) {
      try {
        setCalibration(JSON.parse(saved));
      } catch {}
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('spotify') === 'connected') {
      setSpotifyReturned(true);
      window.history.replaceState({}, '', window.location.pathname);
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

  const startGame = useCallback(() => {
    if (inputMode === 'demo') { tracker.startDemo(); if (bgTrack) playMusic(bgTrack); setPhase('playing'); return; }
    if (!calibration) { setPhase('calibration'); return; }
    tracker.setCalibration(calibration);
    if (bgTrack) playMusic(bgTrack);
    setGameKey(k => k + 1);
    setPhase('playing');
  }, [inputMode, calibration, tracker, bgTrack, spotify]);

  // Re-init demo + play music when entering playing phase
  useEffect(() => {
    if (phase !== 'playing') return;
    if (inputMode === 'demo') tracker.startDemo();
    if (bgTrack) playMusic(bgTrack);
  }, [phase, inputMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start camera
  useEffect(() => {
    if (phase !== 'playing' || inputMode !== 'camera' || !calibration) return;
    let cancelled = false;
    const start = async () => {
      await new Promise(r => setTimeout(r, 300));
      if (cancelled) return;
      const video = videoRef.current;
      if (!video) return;
      tracker.stopTracking();
      stopCamera();
      tracker.setCalibration(calibration);
      let info = await startCamera(calibration.cameraDeviceId, video);
      if (!info) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } } });
          video.srcObject = stream; await video.play();
          info = { width: video.videoWidth, height: video.videoHeight, fps: 30, deviceId: 'fb', label: 'Fallback' };
        } catch { return; }
      }
      if (!cancelled && info) {
        await new Promise(r => setTimeout(r, 200));
        if (!cancelled) tracker.startTracking(video);
      }
    };
    start();
    return () => { cancelled = true; tracker.stopTracking(); };
  }, [phase, inputMode, calibration, gameKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFinish = useCallback(
    (res: FigureEightResult) => {
      setResult(res);
      setPhase('result');
      tracker.stopTracking();
      stopCamera();
      pauseMusic();
    },
    [tracker, stopCamera, spotify]
  );

  // Window-level mouse tracking for demo
  useEffect(() => {
    if (phase !== 'playing' || inputMode !== 'demo') return;
    const handler = (e: MouseEvent) => {
      tracker.gameInputRef.current = {
        x: Math.max(0, Math.min(1, e.clientX / window.innerWidth)),
        y: Math.max(0, Math.min(1, e.clientY / window.innerHeight)),
        confidence: 1,
        mode: 'demo',
        active: true,
      };
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [phase, inputMode]);

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
          setPhase('playing');
        }}
        onMenu={() => {
          setResult(null);
          pauseMusic();
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
            <span className="text-xs text-yellow-700">Demo mode - move your mouse</span>
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
          &larr; Back
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Figure 8</h1>
        <p className="text-gray-500 mb-8">
          Guide the ball in a figure-8 pattern around two points. The number of
          completed figure 8s within the chosen time is counted.
        </p>

        <div className="space-y-6">
          {/* Input mode */}
          <div>
            <label className="text-sm font-medium text-gray-500 mb-3 block">
              Input mode
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
                <div className="text-sm font-medium text-gray-900">Camera</div>
                <div className="text-xs text-gray-500 mt-1">Track real ball</div>
              </button>
              <button
                onClick={() => setInputMode('demo')}
                className={`flex-1 rounded-xl p-4 border-2 transition-all ${
                  inputMode === 'demo'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium text-gray-900">Demo (mouse)</div>
                <div className="text-xs text-gray-500 mt-1">Testing without camera</div>
              </button>
            </div>
          </div>

          {/* Calibration */}
          {inputMode === 'camera' && (
            <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div>
                <div className="text-sm font-medium text-gray-900">Camera calibration</div>
                <div className="text-xs text-gray-500 mt-1">
                  {calibration
                    ? `Saved (${calibration.resolution.width}x${calibration.resolution.height})`
                    : 'Not configured'}
                </div>
              </div>
              <button
                onClick={() => setPhase('calibration')}
                className="text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                {calibration ? 'Recalibrate' : 'Calibrate'}
              </button>
            </div>
          )}

          {/* Duration */}
          <div>
            <label className="text-sm font-medium text-gray-500 mb-3 block">
              Duration
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
            Figure 8 scoring accuracy depends on the quality of colour tracking.
            For best results use a brightly coloured ball and good lighting.
          </div>

          <BackgroundMusic spotify={spotify} onSelect={setBgTrack} selectedTrack={bgTrack} autoOpen={spotifyReturned} />

          <button onClick={startGame} className="btn-primary w-full text-lg py-4">
            Start training
          </button>
        </div>
      </div>
    </div>
  );
}
