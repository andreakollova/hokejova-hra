'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { needsSafetyAcknowledgment } from '@/components/ui/SafetyModal';
import { CalibrationData, InputMode } from '@/lib/tracking';
import { FigureEightResult } from '@/components/games/FigureEightGame';
import { useTracker } from '@/hooks/useTracker';
import { useCamera } from '@/hooks/useCamera';
import { useSpotify } from '@/hooks/useSpotify';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { SpotifyTrack } from '@/lib/spotify';
import Link from 'next/link';
import MascotGlow from '@/components/ui/MascotGlow';
import { canPlayGame, addTrialSeconds, isGameFree, getTrialRemaining } from '@/lib/subscription';
import Paywall from '@/components/ui/Paywall';

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
const SafetyModal = dynamic(() => import('@/components/ui/SafetyModal'), { ssr: false });

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
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSafety, setShowSafety] = useState(false);

  const tracker = useTracker(inputMode);
  const spotify = useSpotify();
  const { play: playMusic, pause: pauseMusic } = useMusicPlayer();
  const videoRef = useRef<HTMLVideoElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
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

  const handleCalibrationComplete = useCallback(
    (cal: CalibrationData) => {
      setCalibration(cal);
      tracker.setCalibration(cal);
      setPhase('setup');
    },
    [tracker]
  );

  const startGame = useCallback(async () => {
    if (needsSafetyAcknowledgment()) { setShowSafety(true); return; }
    if (!canPlayGame('osmicky')) { setShowPaywall(true); return; }
    if (inputMode === 'demo') { tracker.startDemo(); if (bgTrack) playMusic(bgTrack); setPhase('playing'); return; }
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

  const handleFinish = useCallback(
    (res: FigureEightResult) => {
      addTrialSeconds('osmicky', res.duration || duration);
      setResult(res);
      setPhase('result');
      tracker.stopTracking(); tracker.stopRemote();
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

  const accent = '#f59e0b';

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-6 py-8">
      <div className="max-w-lg mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>

        {/* Mascot + Title */}
        <div className="flex items-center gap-5 mb-8">
          <MascotGlow src="/images/mascots/mascot-targets.webp" color={accent} size={90} />
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Classic 8s</h1>
            <p className="text-white/40 text-sm mt-1">Classic figure eight pattern drills</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Mode */}
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2.5 block">Mode</label>
            <div className="flex gap-2.5">
              <button onClick={() => setInputMode('camera')} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${inputMode === 'camera' ? `border-[${accent}] bg-[${accent}]/10 text-[${accent}]` : 'border-white/8 bg-white/3 text-white/50 hover:border-white/15'}`} style={inputMode === 'camera' ? { borderColor: accent, backgroundColor: accent + '15', color: accent } : {}}>
                Camera
              </button>
              <button onClick={() => setInputMode('demo')} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${inputMode === 'demo' ? `border-[${accent}] bg-[${accent}]/10 text-[${accent}]` : 'border-white/8 bg-white/3 text-white/50 hover:border-white/15'}`} style={inputMode === 'demo' ? { borderColor: accent, backgroundColor: accent + '15', color: accent } : {}}>
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

          {!isGameFree('osmicky') && getTrialRemaining('osmicky') > 0 && (
            <p className="text-xs text-white/30 text-center">{Math.ceil(getTrialRemaining('osmicky') / 60)} min free trial remaining</p>
          )}

          {/* Start */}
          <button onClick={startGame} className="w-full text-white font-bold text-lg py-4 rounded-full transition-all hover:brightness-110" style={{ backgroundColor: accent }}>
            Start training
          </button>
        </div>
        {showPaywall && <Paywall gameSlug="osmicky" onDismiss={() => setShowPaywall(false)} />}
        {showSafety && <SafetyModal onContinue={() => setShowSafety(false)} />}
      </div>
    </div>
  );
}
