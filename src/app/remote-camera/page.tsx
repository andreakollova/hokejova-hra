'use client';

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
      <div className="p-4 flex items-center gap-3 border-b border-white/10">
        <Image src="/images/mascots/mascot-default.webp" alt="" width={32} height={32} className="rounded-lg" />
        <div>
          <div className="text-sm font-bold">HockeyBeats Remote Camera</div>
          <div className="text-[10px] text-white/40">
            {ready ? '🟢 Connected' : '🟡 Connecting...'}
            {trackingActive && ' · Tracking active'}
          </div>
        </div>
      </div>

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

      {/* Instructions */}
      <div className="p-6 bg-[#111118]">
        {phase === 'setup' && (
          <div className="text-center">
            <h2 className="text-lg font-bold mb-2">Remote Camera Setup</h2>
            <p className="text-sm text-white/50 mb-4">Point your phone camera at the training area.</p>
            <button onClick={startCamera} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-full transition-all">
              Start Camera
            </button>
          </div>
        )}

        {phase === 'corners' && (
          <div className="text-center">
            <h2 className="text-lg font-bold mb-1">Tap the 4 corners</h2>
            <p className="text-sm text-white/50">Tap the corners of your training area. {corners.length}/4 set.</p>
          </div>
        )}

        {phase === 'color' && (
          <div className="text-center">
            <h2 className="text-lg font-bold mb-1">Tap the ball</h2>
            <p className="text-sm text-white/50">Tap on your ball to pick its color.</p>
          </div>
        )}

        {phase === 'tracking' && (
          <div className="text-center">
            <h2 className="text-lg font-bold text-emerald-400 mb-1">Tracking Active</h2>
            <p className="text-sm text-white/50">Keep this screen open. Your ball position is being sent to the game.</p>
            <button onClick={() => { setTrackingActive(false); setCorners([]); setBallColor(null); setPhase('setup'); }}
              className="mt-4 text-xs text-white/30 hover:text-white/60 transition-colors">
              Recalibrate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
