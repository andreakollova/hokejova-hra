'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CalibrationData, InputMode } from '@/lib/tracking';
import { TargetEightResult } from '@/components/games/TargetEightGame';
import { useTracker } from '@/hooks/useTracker';
import { useCamera } from '@/hooks/useCamera';
import { useSpotify } from '@/hooks/useSpotify';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { SpotifyTrack } from '@/lib/spotify';
import Link from 'next/link';
import { useEngagement } from '@/hooks/useEngagement';

const CalibrationWizard = dynamic(() => import('@/components/tracking/CalibrationWizard'), { ssr: false });
const TargetEightGame = dynamic(() => import('@/components/games/TargetEightGame'), { ssr: false });
const BackgroundMusic = dynamic(() => import('@/components/music/BackgroundMusic'), { ssr: false });

type Phase = 'setup' | 'calibration' | 'playing' | 'result';

export default function OsmickyTercikyPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [result, setResult] = useState<TargetEightResult | null>(null);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [bgTrack, setBgTrack] = useState<SpotifyTrack | null>(null);
  const [spotifyReturned, setSpotifyReturned] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const { recordGame } = useEngagement();
  const tracker = useTracker(inputMode);
  const spotify = useSpotify();
  const { play: playMusic, pause: pauseMusic } = useMusicPlayer();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { startCamera, stopCamera } = useCamera();

  useEffect(() => {
    const saved = localStorage.getItem('ballTracker_calibration') || sessionStorage.getItem('ballTracker_calibration');
    if (saved) { try { setCalibration(JSON.parse(saved)); } catch {} }
    const params = new URLSearchParams(window.location.search);
    if (params.get('spotify') === 'connected') {
      setSpotifyReturned(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

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

  // Use window-level mouse tracking (Canvas blocks div events)
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

  // Record engagement when game finishes
  useEffect(() => {
    if (result) {
      recordGame({ score: (result as any).score || 0, accuracy: (result as any).accuracy || 0, correctPasses: 0, durationSeconds: (result as any).duration || 60, gameType: 'game' });
    }
  }, [result]);

  if (phase === 'calibration') {
    return <CalibrationWizard onComplete={(cal) => { setCalibration(cal); tracker.setCalibration(cal); setPhase('setup'); }} onCancel={() => setPhase('setup')} />;
  }

  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Figure 8 complete</h1>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4"><div className="text-2xl font-bold text-green-600 tabular-nums">{result.score}</div><div className="text-xs text-gray-400 mt-1">Score</div></div>
            <div className="card p-4"><div className="text-2xl font-bold text-gray-900 tabular-nums">{result.completedEights}</div><div className="text-xs text-gray-400 mt-1">Figure 8s</div></div>
            <div className="card p-4"><div className="text-2xl font-bold text-gray-900 tabular-nums">{result.hits}</div><div className="text-xs text-gray-400 mt-1">Hits</div></div>
            <div className="card p-4"><div className="text-2xl font-bold text-gray-900 tabular-nums">{result.duration}s</div><div className="text-xs text-gray-400 mt-1">Time</div></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setResult(null); setPhase('playing'); }} className="btn-primary flex-1">Play again</button>
            <Link href="/dashboard" className="btn-secondary flex-1 text-center">Menu</Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    return (
      <div className="w-screen h-screen relative">
        <video ref={videoRef} className="hidden" playsInline muted autoPlay />
        <TargetEightGame
          duration={duration} difficulty={difficulty} inputMode={inputMode}
          getGameInput={tracker.getGameInput}
          onFinish={(res) => { setResult(res); setPhase('result'); tracker.stopTracking(); stopCamera(); pauseMusic(); spotify.pause(); }}
          onBackToMenu={() => { tracker.stopTracking(); stopCamera(); pauseMusic(); spotify.pause(); setPhase('setup'); }}
        />
        {inputMode === 'demo' && (
          <div className="absolute bottom-4 left-4 bg-yellow-50/90 border border-yellow-200 rounded-2xl px-3 py-2">
            <span className="text-xs text-yellow-700">Demo - move your mouse</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-6 py-8">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Figure 8 with targets</h1>
          <p className="text-gray-400 leading-relaxed">Targets appear in a figure-8 pattern. Guide the ball from one to the next in the correct order.</p>
        </div>
        <div className="space-y-7">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Mode</label>
            <div className="flex gap-3">
              <button onClick={() => setInputMode('camera')} className={`flex-1 rounded-2xl p-4 border-2 transition-all ${inputMode === 'camera' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <div className="text-sm font-semibold text-gray-900">Camera</div>
              </button>
              <button onClick={() => setInputMode('demo')} className={`flex-1 rounded-2xl p-4 border-2 transition-all ${inputMode === 'demo' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <div className="text-sm font-semibold text-gray-900">Demo (mouse)</div>
              </button>
            </div>
          </div>
          {inputMode === 'camera' && (
            <div className="flex items-center justify-between card p-5">
              <div>
                <div className="text-sm font-semibold text-gray-900">Calibration</div>
                <div className="text-xs text-gray-500 mt-1">{calibration ? `Saved` : 'Not configured'}</div>
              </div>
              <button onClick={() => setPhase('calibration')} className="text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-all">
                {calibration ? 'Recalibrate' : 'Calibrate'}
              </button>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Difficulty</label>
            <div className="flex gap-2.5">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${difficulty === d ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                  {d === 'easy' ? 'Easy' : d === 'medium' ? 'Medium' : 'Hard'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {difficulty === 'easy' ? '8 points, large targets' : difficulty === 'medium' ? '12 points, medium' : '16 points, small targets'}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Duration</label>
            <div className="flex gap-2.5">
              {([30, 60, 90] as const).map((d) => (
                <button key={d} onClick={() => setDuration(d)} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${duration === d ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                  {d}s
                </button>
              ))}
            </div>
          </div>
          <BackgroundMusic spotify={spotify} onSelect={setBgTrack} selectedTrack={bgTrack} autoOpen={spotifyReturned} />

          <button onClick={startGame} className="btn-primary w-full text-lg py-4 mt-2">Start</button>
        </div>
      </div>
    </div>
  );
}
