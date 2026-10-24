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
import MascotGlow from '@/components/ui/MascotGlow';
import { canPlayGame, addTrialSeconds, isGameFree, getTrialRemaining } from '@/lib/subscription';
import Paywall from '@/components/ui/Paywall';

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
  const [showPaywall, setShowPaywall] = useState(false);

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
    if (!canPlayGame('neon-drift')) { setShowPaywall(true); return; }
    if (inputMode === 'demo') { tracker.startDemo(); if (bgTrack) playMusic(bgTrack); setGameKey(k => k + 1); setPhase('playing'); return; }
    if (inputMode === 'remote') {
      const sid = localStorage.getItem('hb_remote_session');
      if (sid) { tracker.startRemote(sid); if (bgTrack) playMusic(bgTrack); setPhase('playing'); return; }
      setPhase('calibration'); return;
    }
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
          onFinish={(res) => { addTrialSeconds('neon-drift', res.duration || duration); setResult(res); setPhase('result'); tracker.stopTracking(); tracker.stopRemote(); stopCamera(); pauseMusic(); spotify.pause(); }}
          onBackToMenu={() => { tracker.stopTracking(); tracker.stopRemote(); stopCamera(); pauseMusic(); spotify.pause(); setPhase('setup'); }}
        />
        <button
          onClick={() => { tracker.stopTracking(); tracker.stopRemote(); stopCamera(); pauseMusic(); spotify.pause(); setPhase('setup'); }}
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

  const accent = '#3b82f6';

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-6 py-8">
      <div className="max-w-lg mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>

        {/* Mascot + Title */}
        <div className="flex items-center gap-5 mb-8">
          <MascotGlow src="/images/mascots/mascot-neon-drift.webp" color={accent} size={90} />
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Neon Drift</h1>
            <p className="text-white/40 text-sm mt-1">Ride the neon track and dodge obstacles</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Mode */}
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2.5 block">Mode</label>
            <div className="flex gap-2.5">
              <button onClick={() => setInputMode('camera')} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${inputMode === 'camera' ? '' : 'border-white/8 bg-white/3 text-white/50 hover:border-white/15'}`} style={inputMode === 'camera' ? { borderColor: accent, backgroundColor: accent + '15', color: accent } : {}}>
                Camera
              </button>
              <button onClick={() => setInputMode('demo')} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${inputMode === 'demo' ? '' : 'border-white/8 bg-white/3 text-white/50 hover:border-white/15'}`} style={inputMode === 'demo' ? { borderColor: accent, backgroundColor: accent + '15', color: accent } : {}}>
                Demo (mouse)
              </button>
              <button onClick={() => setInputMode('remote')} className="flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold" style={inputMode === 'remote' ? { borderColor: accent, backgroundColor: accent + '15', color: accent } : { borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.5)' }}>
                Phone
              </button>
            </div>
          </div>

          {/* Calibration */}
          {inputMode === 'camera' && (
            <div className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-4">
              <div>
                <div className="text-sm font-semibold text-white">Calibration</div>
                <div className="text-xs text-white/30 mt-0.5">{calibration ? 'Saved' : 'Not configured'}</div>
              </div>
              <button onClick={() => setPhase('calibration')} className="text-xs font-bold px-4 py-2 rounded-xl transition-all" style={{ color: accent, backgroundColor: accent + '15' }}>
                {calibration ? 'Recalibrate' : 'Calibrate'}
              </button>
            </div>
          )}

          {/* Difficulty */}
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2.5 block">Difficulty</label>
            <div className="flex gap-2.5">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className="flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold" style={difficulty === d ? { borderColor: accent, backgroundColor: accent + '15', color: accent } : { borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.5)' }}>
                  {d === 'easy' ? 'Easy' : d === 'medium' ? 'Medium' : 'Hard'}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2.5 block">Duration</label>
            <div className="flex gap-2.5">
              {([30, 60, 90] as const).map((d) => (
                <button key={d} onClick={() => setDuration(d)} className="flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold" style={duration === d ? { borderColor: accent, backgroundColor: accent + '15', color: accent } : { borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.5)' }}>
                  {d}s
                </button>
              ))}
            </div>
          </div>

          <BackgroundMusic spotify={spotify} onSelect={setBgTrack} selectedTrack={bgTrack} autoOpen={spotifyReturned} />

          {!isGameFree('neon-drift') && getTrialRemaining('neon-drift') > 0 && (
            <p className="text-xs text-white/30 text-center">{Math.ceil(getTrialRemaining('neon-drift') / 60)} min free trial remaining</p>
          )}

          {/* Start */}
          <button onClick={startGame} className="w-full text-white font-bold text-lg py-4 rounded-full transition-all hover:brightness-110" style={{ backgroundColor: accent }}>
            Start drifting
          </button>
        </div>
        {showPaywall && <Paywall gameSlug="neon-drift" onDismiss={() => setShowPaywall(false)} />}
      </div>
    </div>
  );
}
