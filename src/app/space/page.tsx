'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CalibrationData, InputMode } from '@/lib/tracking';
import { SpaceResult } from '@/components/games/SpaceGame';
import { useTracker } from '@/hooks/useTracker';
import { useCamera } from '@/hooks/useCamera';
import Link from 'next/link';

const CalibrationWizard = dynamic(() => import('@/components/tracking/CalibrationWizard'), { ssr: false });
const SpaceGame = dynamic(() => import('@/components/games/SpaceGame'), { ssr: false });

type Phase = 'setup' | 'calibration' | 'playing' | 'result';

export default function SpacePage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [result, setResult] = useState<SpaceResult | null>(null);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);

  const tracker = useTracker(inputMode);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { startCamera, stopCamera } = useCamera();

  useEffect(() => {
    const saved = localStorage.getItem('ballTracker_calibration');
    if (saved) { try { setCalibration(JSON.parse(saved)); } catch {} }
  }, []);

  const startGame = useCallback(() => {
    if (inputMode === 'demo') { tracker.startDemo(); setPhase('playing'); return; }
    if (!calibration) { setPhase('calibration'); return; }
    tracker.setCalibration(calibration);
    setPhase('playing');
  }, [inputMode, calibration, tracker]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (inputMode === 'demo') { tracker.startDemo(); return; }
  }, [phase, inputMode, tracker]);

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
  }, [phase, inputMode, calibration, startCamera, tracker]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (inputMode !== 'demo' || phase !== 'playing') return;
    tracker.handleDemoMouseMove(e, e.currentTarget.getBoundingClientRect());
  }, [inputMode, phase, tracker]);

  if (phase === 'calibration') {
    return <CalibrationWizard onComplete={(cal) => { setCalibration(cal); tracker.setCalibration(cal); setPhase('setup'); }} onCancel={() => setPhase('setup')} />;
  }

  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white">{result.lives > 0 ? 'Misia dokoncena' : 'Game Over'}</h1>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-2xl p-4"><div className="text-2xl font-bold text-cyan-400 tabular-nums">{result.score}</div><div className="text-xs text-white/50 mt-1">Skore</div></div>
            <div className="bg-white/10 rounded-2xl p-4"><div className="text-2xl font-bold text-white tabular-nums">{result.blocksDestroyed}</div><div className="text-xs text-white/50 mt-1">Bloky</div></div>
            <div className="bg-white/10 rounded-2xl p-4"><div className="text-2xl font-bold text-white tabular-nums">{result.asteroidsHit}</div><div className="text-xs text-white/50 mt-1">Zasahy</div></div>
            <div className="bg-white/10 rounded-2xl p-4"><div className="text-2xl font-bold text-red-400 tabular-nums">{'❤'.repeat(result.lives)}{result.lives === 0 && '💀'}</div><div className="text-xs text-white/50 mt-1">Zivoty</div></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setResult(null); setPhase('playing'); }} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white font-medium py-3.5 rounded-full transition-all">Hrat znova</button>
            <Link href="/" className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3.5 rounded-full transition-all text-center">Menu</Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    return (
      <div className="w-screen h-screen relative" onMouseMove={handleMouseMove}>
        <video ref={videoRef} className="hidden" playsInline muted autoPlay />
        <SpaceGame
          duration={duration} difficulty={difficulty} inputMode={inputMode}
          getGameInput={tracker.getGameInput}
          onFinish={(res) => { setResult(res); setPhase('result'); tracker.stopTracking(); stopCamera(); }}
          onBackToMenu={() => { tracker.stopTracking(); stopCamera(); setPhase('setup'); }}
        />
        {inputMode === 'demo' && (
          <div className="absolute bottom-4 left-4 bg-cyan-500/20 border border-cyan-500/30 rounded-2xl px-3 py-2">
            <span className="text-xs text-cyan-300">Demo - pohybuj mysou</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] px-6 py-8">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Spat
        </Link>
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Space Invaders</h1>
          <p className="text-white/40 leading-relaxed">Ovladaj vesmirnu lod loptickou. Znic bloky a vyhybaj sa asteroidom.</p>
        </div>
        <div className="space-y-7">
          <div>
            <label className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 block">Rezim</label>
            <div className="flex gap-3">
              <button onClick={() => setInputMode('camera')} className={`flex-1 rounded-2xl p-4 border-2 transition-all ${inputMode === 'camera' ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                <div className="text-sm font-semibold text-white">Kamera</div>
              </button>
              <button onClick={() => setInputMode('demo')} className={`flex-1 rounded-2xl p-4 border-2 transition-all ${inputMode === 'demo' ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                <div className="text-sm font-semibold text-white">Demo (mys)</div>
              </button>
            </div>
          </div>
          {inputMode === 'camera' && (
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5">
              <div>
                <div className="text-sm font-semibold text-white">Kalibracia</div>
                <div className="text-xs text-white/40 mt-1">{calibration ? 'Ulozena' : 'Nie je nastavena'}</div>
              </div>
              <button onClick={() => setPhase('calibration')} className="text-sm font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-2 rounded-xl transition-all">
                {calibration ? 'Prekalibrovat' : 'Kalibrovat'}
              </button>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 block">Obtaznost</label>
            <div className="flex gap-2.5">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${difficulty === d ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'}`}>
                  {d === 'easy' ? 'Lahka' : d === 'medium' ? 'Stredna' : 'Tazka'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 block">Dlzka</label>
            <div className="flex gap-2.5">
              {([30, 60, 90] as const).map((d) => (
                <button key={d} onClick={() => setDuration(d)} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${duration === d ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'}`}>
                  {d}s
                </button>
              ))}
            </div>
          </div>
          <button onClick={startGame} className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-lg py-4 rounded-full transition-all">
            Spustit misiu
          </button>
        </div>
      </div>
    </div>
  );
}
