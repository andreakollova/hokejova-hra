'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BallTracker } from '@/lib/ball-tracker';
import { CalibrationData, Point2D } from '@/lib/tracking';
import { useRemoteCameraSender } from '@/hooks/useRemoteCamera';
import Image from 'next/image';

type Phase = 'setup' | 'corners' | 'color' | 'tracking';

export default function RemoteCameraPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><p className="text-white/50">Loading...</p></div>}>
      <RemoteCameraContent />
    </Suspense>
  );
}

function RemoteCameraContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session') || '';
  const { ready, sendPosition } = useRemoteCameraSender(sessionId);

  const [phase, setPhase] = useState<Phase>('setup');
  const [cameraStarted, setCameraStarted] = useState(false);
  const [corners, setCorners] = useState<Point2D[]>([]);
  const [ballColor, setBallColor] = useState<{ h: number; s: number; v: number } | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackerRef = useRef<BallTracker | null>(null);
  const rafRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      await video.play();
      streamRef.current = stream;
      setCameraStarted(true);
      setPhase('corners');
    } catch (e) {
      alert('Camera access denied. Please allow camera access and try again.');
    }
  }, []);

  // Handle corner tap
  const handleCornerTap = useCallback((e: React.MouseEvent<HTMLVideoElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = video.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * video.videoWidth;
    const y = ((e.clientY - rect.top) / rect.height) * video.videoHeight;
    const next = [...corners, { x, y }];
    setCorners(next);
    if (next.length >= 4) {
      setPhase('color');
    }
  }, [corners]);

  // Handle color pick
  const handleColorPick = useCallback((e: React.MouseEvent<HTMLVideoElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = video.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * video.videoWidth;
    const py = ((e.clientY - rect.top) / rect.height) * video.videoHeight;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const pixel = ctx.getImageData(Math.round(px), Math.round(py), 1, 1).data;
    const r = pixel[0] / 255, g = pixel[1] / 255, b = pixel[2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
      if (max === r) h = ((g - b) / d + 6) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    const s = max === 0 ? 0 : d / max;
    const v = max;
    setBallColor({ h, s, v });

    // Build calibration and start tracking
    const cal: CalibrationData = {
      corners: corners as [Point2D, Point2D, Point2D, Point2D],
      hsvCenter: [h, s * 100, v * 100] as [number, number, number],
      hsvTolerance: [15, 30, 30] as [number, number, number],
      movementRange: { left: 0.05, right: 0.95 },
      mirrorX: false,
      resolution: { width: video.videoWidth, height: video.videoHeight },
      cameraDeviceId: 'remote',
      fps: 30,
    };

    trackerRef.current = new BallTracker();
    trackerRef.current.setCalibration(cal);
    setPhase('tracking');
    setTrackingActive(true);
  }, [corners]);

  // Tracking loop
  useEffect(() => {
    if (!trackingActive || !videoRef.current || !trackerRef.current) return;

    let running = true;
    const loop = () => {
      if (!running) return;
      const tracker = trackerRef.current;
      const video = videoRef.current;
      if (tracker && video) {
        const result = tracker.processFrame(video);
        if (result) {
          sendPosition(result.x, result.y, result.confidence, true);
        } else {
          sendPosition(0.5, 0.5, 0, false);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [trackingActive, sendPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="text-white/50 text-center">
          <p className="text-lg font-bold mb-2">Invalid session</p>
          <p className="text-sm">Scan the QR code from HockeyBeats on your computer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <div className="safe-area-top p-4 flex items-center gap-3 border-b border-white/10">
        <Image src="/images/hb-logo-white.png" alt="Hockey Beats" width={80} height={20} className="h-5 w-auto" />
        <div className="flex-1">
          <div className="text-sm font-bold">Remote Camera</div>
          <div className="text-[10px] text-white/40">
            {ready ? <><span className="text-emerald-400">Connected</span></> : 'Connecting...'}
            {trackingActive && <span className="text-emerald-400"> · Tracking</span>}
          </div>
        </div>
      </div>

      {phase === 'setup' ? (
        /* Setup: centered on screen */
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-xs">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Remote Camera</h2>
            <p className="text-sm text-white/50 mb-6">Point your phone at the training area. The ball position will be sent to the game on your computer.</p>
            <button onClick={startCamera} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-full transition-all text-base">
              Start Camera
            </button>
            <p className="text-xs text-white/20 mt-4">Session: {sessionId}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Camera view */}
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
              onClick={phase === 'corners' ? handleCornerTap : phase === 'color' ? handleColorPick : undefined}
            />

            {/* Corner markers */}
            {phase === 'corners' && videoRef.current && corners.map((c, i) => {
              const video = videoRef.current!;
              const rect = video.getBoundingClientRect();
              const sx = (c.x / video.videoWidth) * rect.width;
              const sy = (c.y / video.videoHeight) * rect.height;
              return (
                <div key={i} className="absolute w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" style={{ left: sx - 8, top: sy - 8 + 53 }} />
              );
            })}

            {/* Tracking indicator */}
            {trackingActive && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400">LIVE</span>
              </div>
            )}
          </div>

          {/* Instructions overlay at bottom */}
          <div className="p-5 bg-[#111118] safe-area-bottom">
            {phase === 'corners' && (
              <div className="text-center space-y-3">
                <h2 className="text-base font-bold">Set training area</h2>
                <button
                  onClick={() => {
                    const video = videoRef.current;
                    if (!video) return;
                    setCorners([
                      { x: 0, y: 0 },
                      { x: video.videoWidth, y: 0 },
                      { x: video.videoWidth, y: video.videoHeight },
                      { x: 0, y: video.videoHeight },
                    ]);
                    setPhase('color');
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-full transition-all text-sm"
                >
                  Use full camera view
                </button>
                <p className="text-xs text-white/30">Or tap 4 corners on the video. {corners.length}/4</p>
              </div>
            )}

            {phase === 'color' && (
              <div className="text-center">
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse mx-auto mb-2" />
                <h2 className="text-base font-bold">Tap your ball</h2>
                <p className="text-xs text-white/40 mt-1">Tap on the ball in the video to pick its color.</p>
              </div>
            )}

            {phase === 'tracking' && (
              <div className="text-center">
                <h2 className="text-base font-bold text-emerald-400">Tracking Active</h2>
                <p className="text-xs text-white/40 mt-1">Keep this screen open. Ball position is being sent to the game.</p>
                <button onClick={() => { setTrackingActive(false); setCorners([]); setBallColor(null); setPhase('setup'); }}
                  className="mt-3 text-xs text-white/30 hover:text-white/60 transition-colors">
                  Recalibrate
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
