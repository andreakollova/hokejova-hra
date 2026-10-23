'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CalibrationData, InputMode } from '@/lib/tracking';
import { OrbitHopResult } from '@/components/games/OrbitHopGame';
import { useTracker } from '@/hooks/useTracker';
import { useCamera } from '@/hooks/useCamera';
import { useSpotify } from '@/hooks/useSpotify';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { SpotifyTrack } from '@/lib/spotify';
import Link from 'next/link';

const CalibrationWizard = dynamic(() => import('@/components/tracking/CalibrationWizard'), { ssr: false });
const OrbitHopGame = dynamic(() => import('@/components/games/OrbitHopGame'), { ssr: false });
const BackgroundMusic = dynamic(() => import('@/components/music/BackgroundMusic'), { ssr: false });

type Phase = 'setup' | 'calibration' | 'playing' | 'result';

export default function OrbitHopPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [result, setResult] = useState<OrbitHopResult | null>(null);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [bgTrack, setBgTrack] = useState<SpotifyTrack | null>(null);
  const [spotifyReturned, setSpotifyReturned] = useState(false);
  const [hopSide, setHopSide] = useState<'left' | 'right'>('right');

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
      await new Promise(r => setTimeout(r, 200));
      if (cancelled) return;
      const video = videoRef.current;
      if (!video) return;
      tracker.setCalibration(calibration);
      let info = await startCamera(calibration.cameraDeviceId, video);
      if (!info) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } } });
          video.srcObject = stream; await video.play();
          info = { width: video.videoWidth, height: video.videoHeight, fps: 30, deviceId: 'fb', label: 'Fallback' };
        } catch { return; }
      }
      if (!cancelled && info) tracker.startTracking(video);
    };
    start();
    return () => { cancelled = true; };
  }, [phase, inputMode, calibration, startCamera]);

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
    return <CalibrationWizard onComplete={(cal) => { setCalibration(cal); tracker.setCalibration(cal); setPhase('setup'); }} onCancel={() => setPhase('setup')} />;
  }

  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-[#ede9fe] flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">{result.lives > 0 ? 'Orbit Complete' : 'Game Over'}</h1>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100"><div className="text-2xl font-bold text-purple-600 tabular-nums">{result.score}</div><div className="text-xs text-gray-400 mt-1">Score</div></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100"><div className="text-2xl font-bold text-gray-900 tabular-nums">{result.totalHops}</div><div className="text-xs text-gray-400 mt-1">Hops</div></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100"><div className="text-2xl font-bold text-gray-900 tabular-nums">{result.perfectHops}</div><div className="text-xs text-gray-400 mt-1">Perfect</div></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100"><div className="text-2xl font-bold text-red-400 tabular-nums">{'❤'.repeat(result.lives)}{result.lives === 0 && '💀'}</div><div className="text-xs text-gray-400 mt-1">Lives</div></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setResult(null); setPhase('playing'); }} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-medium py-3.5 rounded-full transition-all">Play again</button>
            <Link href="/dashboard" className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3.5 rounded-full transition-all text-center border border-gray-200">Menu</Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    return (
      <div className="w-screen h-screen relative">
        <video ref={videoRef} className="hidden" playsInline muted autoPlay />
        <OrbitHopGame
          duration={duration} difficulty={difficulty} inputMode={inputMode}
          getGameInput={tracker.getGameInput}
          onFinish={(res) => { setResult(res); setPhase('result'); tracker.stopTracking(); stopCamera(); pauseMusic(); spotify.pause(); }}
          onBackToMenu={() => { tracker.stopTracking(); stopCamera(); pauseMusic(); spotify.pause(); setPhase('setup'); }}
          hopSide={hopSide}
        />
        <button onClick={() => { tracker.stopTracking(); stopCamera(); pauseMusic(); spotify.pause(); setPhase('setup'); }}
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-2 text-gray-500 hover:text-gray-900 transition-colors z-10">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ede9fe] px-6 py-8">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Orbit Hop</h1>
          <p className="text-gray-400 leading-relaxed">Time your hops between planets. Move the ball right to jump to the next orbit.</p>
        </div>
        <div className="space-y-7">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Mode</label>
            <div className="flex gap-3">
              <button onClick={() => setInputMode('camera')} className={`flex-1 rounded-2xl p-4 border-2 transition-all ${inputMode === 'camera' ? 'border-purple-600 bg-purple-600/10' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <div className="text-sm font-semibold text-gray-900">Camera</div>
              </button>
              <button onClick={() => setInputMode('demo')} className={`flex-1 rounded-2xl p-4 border-2 transition-all ${inputMode === 'demo' ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <div className="text-sm font-semibold text-gray-900">Demo (mouse)</div>
              </button>
            </div>
          </div>
          {inputMode === 'camera' && (
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-5">
              <div>
                <div className="text-sm font-semibold text-gray-900">Calibration</div>
                <div className="text-xs text-gray-400 mt-1">{calibration ? 'Saved' : 'Not configured'}</div>
              </div>
              <button onClick={() => setPhase('calibration')} className="text-sm font-medium text-purple-600 bg-purple-600/10 hover:bg-purple-600/20 px-4 py-2 rounded-xl transition-all">
                {calibration ? 'Recalibrate' : 'Calibrate'}
              </button>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Difficulty</label>
            <div className="flex gap-2.5">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${difficulty === d ? 'border-purple-600 bg-purple-600/10 text-purple-600' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}>
                  {d === 'easy' ? 'Easy' : d === 'medium' ? 'Medium' : 'Hard'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Duration</label>
            <div className="flex gap-2.5">
              {([30, 60, 90] as const).map((d) => (
                <button key={d} onClick={() => setDuration(d)} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${duration === d ? 'border-purple-600 bg-purple-600/10 text-purple-600' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}>
                  {d}s
                </button>
              ))}
            </div>
          </div>
          {/* Hop side */}
          <div>
            <label className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 block">Hop direction</label>
            <div className="flex gap-2.5">
              <button onClick={() => setHopSide('left')} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${hopSide === 'left' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'}`}>
                Left
              </button>
              <button onClick={() => setHopSide('right')} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${hopSide === 'right' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'}`}>
                Right
              </button>
            </div>
          </div>

          <BackgroundMusic spotify={spotify} onSelect={setBgTrack} selectedTrack={bgTrack} autoOpen={spotifyReturned} />

          <button onClick={startGame} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-lg py-4 rounded-full transition-all">
            Start hopping
          </button>
        </div>
      </div>
    </div>
  );
}
