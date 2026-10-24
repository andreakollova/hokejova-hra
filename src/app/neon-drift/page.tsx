'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CalibrationData, InputMode } from '@/lib/tracking';
import { NeonDriftResult } from '@/components/games/NeonDriftGame';
import { useTracker } from '@/hooks/useTracker';
import { useCamera } from '@/hooks/useCamera';
import { useSpotify } from '@/hooks/useSpotify';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { SpotifyTrack } from '@/lib/spotify';
import Link from 'next/link';
import { useEngagement } from '@/hooks/useEngagement';

const CalibrationWizard = dynamic(() => import('@/components/tracking/CalibrationWizard'), { ssr: false });
const NeonDriftGame = dynamic(() => import('@/components/games/NeonDriftGame'), { ssr: false });
const BackgroundMusic = dynamic(() => import('@/components/music/BackgroundMusic'), { ssr: false });

type Phase = 'setup' | 'calibration' | 'playing' | 'result';

export default function NeonDriftPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [result, setResult] = useState<NeonDriftResult | null>(null);
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
  const pendingStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const savedCal = localStorage.getItem('ballTracker_calibration') || sessionStorage.getItem('ballTracker_calibration');
    if (savedCal) { try { setCalibration(JSON.parse(savedCal)); } catch {} }

    const params = new URLSearchParams(window.location.search);
    if (params.get('spotify') === 'connected') {
      setSpotifyReturned(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const startGame = useCallback(async () => {
    if (inputMode === 'demo') { tracker.startDemo(); if (bgTrack) playMusic(bgTrack); setGameKey(k => k + 1); setPhase('playing'); return; }
    if (!calibration) { setPhase('calibration'); return; }
    tracker.setCalibration(calibration);
    if (bgTrack) playMusic(bgTrack);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { ideal: calibration.cameraDeviceId }, facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      pendingStreamRef.current = stream;
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } } });
        pendingStreamRef.current = stream;
      } catch {}
    }
    setGameKey(k => k + 1);
    setPhase('playing');
  }, [inputMode, calibration, tracker, bgTrack, spotify]);

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
      tracker.setCalibration(calibration);
      const pending = pendingStreamRef.current;
      if (pending) {
        pendingStreamRef.current = null;
        video.srcObject = pending;
        video.setAttribute('playsinline', 'true');
        await video.play();
        await new Promise(r => setTimeout(r, 200));
        if (!cancelled) tracker.startTracking(video);
        return;
      }
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
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white">Drift complete</h1>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-2xl p-4"><div className="text-2xl font-bold text-blue-400 tabular-nums">{result.score}</div><div className="text-xs text-white/50 mt-1">Score</div></div>
            <div className="bg-white/10 rounded-2xl p-4"><div className="text-2xl font-bold text-orange-400 tabular-nums">{result.cubesCollected}</div><div className="text-xs text-white/50 mt-1">Cubes</div></div>
            <div className="bg-white/10 rounded-2xl p-4"><div className="text-2xl font-bold text-white tabular-nums">{result.onTrackPercent}%</div><div className="text-xs text-white/50 mt-1">On Track</div></div>
            <div className="bg-white/10 rounded-2xl p-4"><div className="text-2xl font-bold text-white/60 tabular-nums">{result.duration}s</div><div className="text-xs text-white/50 mt-1">Duration</div></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setResult(null); setPhase('playing'); }} className="flex-1 bg-blue-500 hover:bg-blue-400 text-white font-medium py-3.5 rounded-full transition-all">Play again</button>
            <button onClick={() => { setResult(null); setBgTrack(null); setPhase('setup'); }} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3.5 rounded-full transition-all text-sm">Change song</button>
            <button onClick={() => { pauseMusic(); spotify.pause(); window.location.href = '/dashboard'; }} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3.5 rounded-full transition-all text-center">Menu</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    return (
      <div className="w-screen h-screen relative">
        <video ref={videoRef} className="hidden" playsInline muted autoPlay />
        <NeonDriftGame
          duration={duration} difficulty={difficulty} inputMode={inputMode}
          getGameInput={tracker.getGameInput}
          onFinish={(res) => { setResult(res); setPhase('result'); tracker.stopTracking(); stopCamera(); pauseMusic(); spotify.pause(); }}
          onBackToMenu={() => { tracker.stopTracking(); stopCamera(); pauseMusic(); spotify.pause(); setPhase('setup'); }}
        />
        <button
          onClick={() => { tracker.stopTracking(); stopCamera(); pauseMusic(); spotify.pause(); setPhase('setup'); }}
          className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm rounded-lg p-2 text-white/60 hover:text-white transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        {inputMode === 'demo' && (
          <div className="absolute bottom-4 left-4 bg-blue-500/20 border border-blue-500/30 rounded-2xl px-3 py-2">
            <span className="text-xs text-blue-300">Demo - move your mouse</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] px-6 py-8">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Neon Drift</h1>
          <p className="text-white/40 leading-relaxed">Guide the ball along the neon track. Stay on the path and collect cubes.</p>
        </div>
        <div className="space-y-7">
          <div>
            <label className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 block">Mode</label>
            <div className="flex gap-3">
              <button onClick={() => setInputMode('camera')} className={`flex-1 rounded-2xl p-4 border-2 transition-all ${inputMode === 'camera' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                <div className="text-sm font-semibold text-white">Camera</div>
              </button>
              <button onClick={() => setInputMode('demo')} className={`flex-1 rounded-2xl p-4 border-2 transition-all ${inputMode === 'demo' ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                <div className="text-sm font-semibold text-white">Demo (mouse)</div>
              </button>
            </div>
          </div>
          {inputMode === 'camera' && (
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5">
              <div>
                <div className="text-sm font-semibold text-white">Calibration</div>
                <div className="text-xs text-white/40 mt-1">{calibration ? 'Saved' : 'Not configured'}</div>
              </div>
              <button onClick={() => setPhase('calibration')} className="text-sm font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-xl transition-all">
                {calibration ? 'Recalibrate' : 'Calibrate'}
              </button>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 block">Difficulty</label>
            <div className="flex gap-2.5">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${difficulty === d ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'}`}>
                  {d === 'easy' ? 'Easy' : d === 'medium' ? 'Medium' : 'Hard'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 block">Duration</label>
            <div className="flex gap-2.5">
              {([30, 60, 90] as const).map((d) => (
                <button key={d} onClick={() => setDuration(d)} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${duration === d ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'}`}>
                  {d}s
                </button>
              ))}
            </div>
          </div>
          <BackgroundMusic spotify={spotify} onSelect={setBgTrack} selectedTrack={bgTrack} autoOpen={spotifyReturned} />

          <button onClick={startGame} className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold text-lg py-4 rounded-full transition-all">
            Start drifting
          </button>
        </div>
      </div>
    </div>
  );
}
