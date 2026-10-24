'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { needsSafetyAcknowledgment } from '@/components/ui/SafetyModal';
import { CalibrationData, InputMode } from '@/lib/tracking';
import { JellyStackResult } from '@/components/games/JellyStackGame';
import { useTracker } from '@/hooks/useTracker';
import { useCamera } from '@/hooks/useCamera';
import { useSpotify } from '@/hooks/useSpotify';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { SpotifyTrack } from '@/lib/spotify';
import Link from 'next/link';
import Image from 'next/image';
import { useEngagement } from '@/hooks/useEngagement';
import MascotGlow from '@/components/ui/MascotGlow';
import { canPlayGame, addTrialSeconds, isGameFree, getTrialRemaining } from '@/lib/subscription';
import Paywall from '@/components/ui/Paywall';
import { useAuth } from '@/hooks/useAuth';

const CalibrationWizard = dynamic(() => import('@/components/tracking/CalibrationWizard'), { ssr: false });
const JellyStackGame = dynamic(() => import('@/components/games/JellyStackGame'), { ssr: false });
const BackgroundMusic = dynamic(() => import('@/components/music/BackgroundMusic'), { ssr: false });
const SafetyModal = dynamic(() => import('@/components/ui/SafetyModal'), { ssr: false });

type Phase = 'setup' | 'calibration' | 'playing' | 'result';

export default function JellyStackPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [result, setResult] = useState<JellyStackResult | null>(null);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [bgTrack, setBgTrack] = useState<SpotifyTrack | null>(null);
  const [spotifyReturned, setSpotifyReturned] = useState(false);
  const [dropSide, setDropSide] = useState<'center' | 'left' | 'right'>('center');
  const [gameKey, setGameKey] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSafety, setShowSafety] = useState(false);

  const auth = useAuth();
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
    if (needsSafetyAcknowledgment()) { setShowSafety(true); return; }
    if (!canPlayGame('jelly-stack')) { setShowPaywall(true); return; }
    if (inputMode === 'demo') { tracker.startDemo(); if (bgTrack) playMusic(bgTrack); setGameKey(k => k + 1); setPhase('playing'); return; }
    if (inputMode === 'remote') {
      const sid = localStorage.getItem('hb_remote_session');
      if (sid) { tracker.startRemote(sid); if (bgTrack) playMusic(bgTrack); setPhase('playing'); return; }
      setPhase('calibration'); return;
    }
    if (!calibration) { setPhase('calibration'); return; }
    // If calibrated via phone, use remote mode
    if (calibration.cameraDeviceId === 'remote') {
      const sid = localStorage.getItem('hb_remote_session');
      if (sid) { tracker.startRemote(sid); if (bgTrack) playMusic(bgTrack); setPhase('playing'); return; }
      setPhase('calibration'); return;
    }
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
      tracker.stopTracking(); tracker.stopRemote();
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
    return () => { cancelled = true; tracker.stopTracking(); tracker.stopRemote(); };
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

  if (!auth.loading && !auth.isLoggedIn) {
    if (typeof window !== 'undefined') window.location.href = '/?login=true';
    return null;
  }

  if (phase === 'calibration') {
    return <CalibrationWizard onComplete={(cal) => { setCalibration(cal); tracker.setCalibration(cal); setPhase('setup'); }} onCancel={() => setPhase('setup')} />;
  }

  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-[#faf5eb] flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Stack Complete</h1>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"><div className="text-2xl font-bold text-purple-500 tabular-nums">{result.score}</div><div className="text-xs text-gray-400 mt-1">Score</div></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"><div className="text-2xl font-bold text-gray-900 tabular-nums">{result.totalStacks}</div><div className="text-xs text-gray-400 mt-1">Stacks</div></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"><div className="text-2xl font-bold text-gray-900 tabular-nums">{result.perfectStacks}</div><div className="text-xs text-gray-400 mt-1">Perfect</div></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"><div className="text-2xl font-bold text-purple-500 tabular-nums">{result.totalStacks > 0 ? Math.round((result.score / (result.totalStacks * 100)) * 100) : 0}%</div><div className="text-xs text-gray-400 mt-1">Accuracy</div></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setResult(null); setPhase('playing'); }} className="flex-1 bg-purple-500 hover:bg-purple-400 text-white font-medium py-3.5 rounded-full transition-all">Play again</button>
            <button onClick={() => { setResult(null); setBgTrack(null); setPhase('setup'); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3.5 rounded-full transition-all text-sm">Change song</button>
            <button onClick={() => { pauseMusic(); spotify.pause(); window.location.href = '/dashboard'; }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3.5 rounded-full transition-all text-center">Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    return (
      <div className="w-screen h-screen relative">
        <video ref={videoRef} className="hidden" playsInline muted autoPlay />
        <JellyStackGame
          duration={duration} difficulty={difficulty} inputMode={inputMode}
          getGameInput={tracker.getGameInput}
          onFinish={(res) => { addTrialSeconds('jelly-stack', res.duration || duration); setResult(res); setPhase('result'); tracker.stopTracking(); tracker.stopRemote(); stopCamera(); pauseMusic(); spotify.pause(); }}
          onBackToMenu={() => { tracker.stopTracking(); tracker.stopRemote(); stopCamera(); pauseMusic(); spotify.pause(); setPhase('setup'); }}
          dropSide={dropSide}
        />
        {/* Back to menu */}
        <button
          onClick={() => { tracker.stopTracking(); tracker.stopRemote(); stopCamera(); pauseMusic(); spotify.pause(); setPhase('setup'); }}
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-2 text-gray-500 hover:text-gray-900 transition-colors shadow-sm z-10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        {inputMode === 'demo' && (
          <div className="absolute bottom-4 left-4 bg-purple-500/20 border border-purple-500/30 rounded-2xl px-3 py-2">
            <span className="text-xs text-purple-600">Demo - move mouse far left or far right to drop</span>
          </div>
        )}
      </div>
    );
  }

  const accent = '#a855f7';

  return (
    <div className="min-h-screen bg-gray-50/50 px-6 py-8">
      <div className="max-w-lg mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>

        {/* Logo + Mascot */}
        <Link href="/dashboard" className="block mb-4">
          <Image src="/images/hb-logo-hero-dark.png" alt="Hockey Beats" width={120} height={32} className="h-6 w-auto" />
        </Link>
        <div className="flex items-center gap-5 mb-8">
          <MascotGlow src="/images/mascots/mascot-jelly-stack.webp" color={accent} size={90} />
          <div>
            <h1 className="text-3xl font-extrabold text-[#101828] tracking-tight">Jelly Stack</h1>
            <p className="text-gray-500 text-sm mt-1">Stack and balance the jelly blocks</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Calibration */}
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4">
            <div>
              <div className="text-sm font-semibold text-[#101828]">Camera</div>
              <div className="text-xs text-gray-400 mt-0.5">{calibration ? 'Calibrated' : 'Not configured'}</div>
            </div>
            <button onClick={() => setPhase('calibration')} className="text-xs font-bold px-4 py-2 rounded-xl transition-all bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
              {calibration ? 'Recalibrate' : 'Calibrate'}
            </button>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2.5 block">Difficulty</label>
            <div className="flex gap-2.5">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${difficulty === d ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}>
                  {d === 'easy' ? 'Easy' : d === 'medium' ? 'Medium' : 'Hard'}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2.5 block">Duration</label>
            <div className="flex gap-2.5">
              {([30, 60, 90] as const).map((d) => (
                <button key={d} onClick={() => setDuration(d)} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${duration === d ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}>
                  {d}s
                </button>
              ))}
            </div>
          </div>

          <BackgroundMusic spotify={spotify} onSelect={setBgTrack} selectedTrack={bgTrack} autoOpen={spotifyReturned} />

          {!isGameFree('jelly-stack') && getTrialRemaining('jelly-stack') > 0 && (
            <p className="text-xs text-gray-400 text-center">{Math.ceil(getTrialRemaining('jelly-stack') / 60)} min free trial remaining</p>
          )}

          {/* Start */}
          <button onClick={startGame} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg py-4 rounded-full transition-all">
            Start stacking
          </button>
        </div>
        {showPaywall && <Paywall gameSlug="jelly-stack" onDismiss={() => setShowPaywall(false)} />}
        {showSafety && <SafetyModal onContinue={() => setShowSafety(false)} />}
      </div>
    </div>
  );
}
