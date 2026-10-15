'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CalibrationData, InputMode } from '@/lib/tracking';
import { TargetEightResult } from '@/components/games/TargetEightGame';
import { useTracker } from '@/hooks/useTracker';
import { useCamera } from '@/hooks/useCamera';
import Link from 'next/link';

const CalibrationWizard = dynamic(() => import('@/components/tracking/CalibrationWizard'), { ssr: false });
const TargetEightGame = dynamic(() => import('@/components/games/TargetEightGame'), { ssr: false });

type Phase = 'setup' | 'calibration' | 'playing' | 'result';

export default function OsmickyTercikyPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [result, setResult] = useState<TargetEightResult | null>(null);
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

  // Re-init demo/camera when entering playing phase
  useEffect(() => {
    if (phase !== 'playing') return;
    if (inputMode === 'demo') { tracker.startDemo(); return; }
  }, [phase, inputMode]);

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

  if (phase === 'calibration') {
    return <CalibrationWizard onComplete={(cal) => { setCalibration(cal); tracker.setCalibration(cal); setPhase('setup'); }} onCancel={() => setPhase('setup')} />;
  }

  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Osmicky dokoncene</h1>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4"><div className="text-2xl font-bold text-green-600 tabular-nums">{result.score}</div><div className="text-xs text-gray-400 mt-1">Skore</div></div>
            <div className="card p-4"><div className="text-2xl font-bold text-gray-900 tabular-nums">{result.completedEights}</div><div className="text-xs text-gray-400 mt-1">Osmicky</div></div>
            <div className="card p-4"><div className="text-2xl font-bold text-gray-900 tabular-nums">{result.hits}</div><div className="text-xs text-gray-400 mt-1">Zasahy</div></div>
            <div className="card p-4"><div className="text-2xl font-bold text-gray-900 tabular-nums">{result.duration}s</div><div className="text-xs text-gray-400 mt-1">Cas</div></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setResult(null); setPhase('playing'); }} className="btn-primary flex-1">Hrat znova</button>
            <Link href="/" className="btn-secondary flex-1 text-center">Menu</Link>
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
          onFinish={(res) => { setResult(res); setPhase('result'); tracker.stopTracking(); stopCamera(); }}
          onBackToMenu={() => { tracker.stopTracking(); stopCamera(); setPhase('setup'); }}
        />
        {inputMode === 'demo' && (
          <div className="absolute bottom-4 left-4 bg-yellow-50/90 border border-yellow-200 rounded-2xl px-3 py-2">
            <span className="text-xs text-yellow-700">Demo - pohybuj mysou</span>
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
          Spat
        </Link>
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Osmicky s tercikmi</h1>
          <p className="text-gray-400 leading-relaxed">Terciky sa ukazuju v tvare osmicky. Ved lopticku od jedneho k druhemu v spravnom poradi.</p>
        </div>
        <div className="space-y-7">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Rezim</label>
            <div className="flex gap-3">
              <button onClick={() => setInputMode('camera')} className={`flex-1 rounded-2xl p-4 border-2 transition-all ${inputMode === 'camera' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <div className="text-sm font-semibold text-gray-900">Kamera</div>
              </button>
              <button onClick={() => setInputMode('demo')} className={`flex-1 rounded-2xl p-4 border-2 transition-all ${inputMode === 'demo' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <div className="text-sm font-semibold text-gray-900">Demo (mys)</div>
              </button>
            </div>
          </div>
          {inputMode === 'camera' && (
            <div className="flex items-center justify-between card p-5">
              <div>
                <div className="text-sm font-semibold text-gray-900">Kalibracia</div>
                <div className="text-xs text-gray-500 mt-1">{calibration ? `Ulozena` : 'Nie je nastavena'}</div>
              </div>
              <button onClick={() => setPhase('calibration')} className="text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-all">
                {calibration ? 'Prekalibrovat' : 'Kalibrovat'}
              </button>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Obtaznost</label>
            <div className="flex gap-2.5">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${difficulty === d ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                  {d === 'easy' ? 'Lahka' : d === 'medium' ? 'Stredna' : 'Tazka'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {difficulty === 'easy' ? '8 bodov, velke terciky' : difficulty === 'medium' ? '12 bodov, stredne' : '16 bodov, male terciky'}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Dlzka</label>
            <div className="flex gap-2.5">
              {([30, 60, 90] as const).map((d) => (
                <button key={d} onClick={() => setDuration(d)} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${duration === d ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                  {d}s
                </button>
              ))}
            </div>
          </div>
          <button onClick={startGame} className="btn-primary w-full text-lg py-4 mt-2">Spustit</button>
        </div>
      </div>
    </div>
  );
}
