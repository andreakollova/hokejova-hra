'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { BallTracker, rgbToHsv } from '@/lib/ball-tracker';
import { CalibrationData, Point2D } from '@/lib/tracking';
import QRCode from 'qrcode';

interface CalibrationWizardProps {
  onComplete: (calibration: CalibrationData) => void;
  onCancel: () => void;
}

type Step = 'camera' | 'preview' | 'corners' | 'color' | 'tolerance' | 'range' | 'test';

const STEP_LABELS: Record<Step, string> = {
  camera: '1. Camera',
  preview: '2. Camera setup',
  corners: '3. Training area',
  color: '4. Ball colour',
  tolerance: '5. Colour tolerance',
  range: '6. Movement range',
  test: '7. Tracking test',
};

export default function CalibrationWizard({
  onComplete,
  onCancel,
}: CalibrationWizardProps) {
  const {
    devices,
    activeCamera,
    error: cameraError,
    permission,
    requestPermission,
    enumerateDevices,
    startCamera,
    stopCamera,
  } = useCamera();

  const [step, setStep] = useState<Step>('camera');
  const [selectedDevice, setSelectedDevice] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  // Calibration state
  const [corners, setCorners] = useState<Point2D[]>([]);
  const [hsvCenter, setHsvCenter] = useState<[number, number, number]>([0, 0, 0]);
  const [hsvTolerance, setHsvTolerance] = useState<[number, number, number]>([15, 30, 30]);
  const [mirrorX, setMirrorX] = useState(false);
  const [movementRange, setMovementRange] = useState({ left: 0.2, right: 0.8 });
  const [testResult, setTestResult] = useState<'idle' | 'tracking' | 'lost'>('idle');
  const [showPhoneQR, setShowPhoneQR] = useState(false);
  const [phoneSessionId] = useState(() => crypto.randomUUID().slice(0, 8));
  const [qrDataUrl, setQrDataUrl] = useState('');

  const trackerRef = useRef<BallTracker | null>(null);
  const rafRef = useRef(0);

  // Step 1: Request permission
  const handleRequestPermission = async () => {
    const ok = await requestPermission();
    if (ok) {
      await enumerateDevices();
    }
  };

  // Auto-select first camera when devices list changes
  useEffect(() => {
    if (devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0].deviceId);
    }
  }, [devices]);

  // Generate QR code on mount
  useEffect(() => {
    const url = `${window.location.origin}/remote-camera?session=${phoneSessionId}`;
    localStorage.setItem('hb_remote_session', phoneSessionId);
    QRCode.toDataURL(url, { width: 180, margin: 2, color: { dark: '#111827', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [phoneSessionId]);

  // Step 1: Select and start camera
  const handleStartCamera = async () => {
    if (!selectedDevice || !videoRef.current) return;
    const info = await startCamera(selectedDevice, videoRef.current);
    if (info) {
      setStep('preview');
    }
  };

  // Step 3: Handle corner click
  const handleCornerClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (corners.length >= 4) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = (activeCamera?.width || 640) / rect.width;
    const scaleY = (activeCamera?.height || 480) / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setCorners((prev) => [...prev, { x, y }]);
  };

  // Step 4: Handle color pick
  const handleColorPick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = (activeCamera?.width || 640) / rect.width;
    const scaleY = (activeCamera?.height || 480) / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const tracker = getTracker();
    const hsv = tracker.sampleColor(videoRef.current, x, y);
    setHsvCenter(hsv);
  };

  const getTracker = () => {
    if (!trackerRef.current) trackerRef.current = new BallTracker();
    return trackerRef.current;
  };

  // Draw video to canvas for interaction
  useEffect(() => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !activeCamera ||
      !['preview', 'corners', 'color', 'tolerance', 'range', 'test'].includes(step)
    )
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = activeCamera.width;
    canvas.height = activeCamera.height;

    let running = true;
    const draw = () => {
      if (!running) return;
      ctx.drawImage(video, 0, 0);

      // Draw corners overlay
      if (step === 'corners' && corners.length > 0) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';

        if (corners.length > 1) {
          ctx.beginPath();
          ctx.moveTo(corners[0].x, corners[0].y);
          for (let i = 1; i < corners.length; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
          }
          if (corners.length === 4) {
            ctx.closePath();
            ctx.fill();
          }
          ctx.stroke();
        }

        corners.forEach((c, i) => {
          ctx.beginPath();
          ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = '12px sans-serif';
          ctx.fillText(`${i + 1}`, c.x - 4, c.y + 4);
        });
      }

      // Draw tolerance preview
      if (step === 'tolerance' || step === 'color') {
        const tracker = getTracker();
        if (overlayRef.current) {
          overlayRef.current.width = activeCamera.width;
          overlayRef.current.height = activeCamera.height;
          const overlayCtx = overlayRef.current.getContext('2d');
          if (overlayCtx) {
            const preview = tracker.getDetectionPreview(
              video,
              hsvCenter,
              hsvTolerance
            );
            overlayCtx.putImageData(preview.mask, 0, 0);
          }
        }
      }

      // Test tracking
      if (step === 'test') {
        const tracker = getTracker();
        const result = tracker.processFrame(video);
        if (result) {
          setTestResult('tracking');
          // Draw ball position
          const bx = result.x * canvas.width;
          const by = result.y * canvas.height;
          ctx.beginPath();
          ctx.arc(bx, by, 15, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34, 197, 94, 0.7)';
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          setTestResult('lost');
        }
      }

      requestAnimationFrame(draw);
    };

    draw();
    return () => {
      running = false;
    };
  }, [step, corners, activeCamera, hsvCenter, hsvTolerance]);

  // Set up tracker for test step
  useEffect(() => {
    if (step === 'test' && corners.length === 4) {
      const tracker = getTracker();
      tracker.setCalibration({
        hsvCenter,
        hsvTolerance,
        corners: corners as [Point2D, Point2D, Point2D, Point2D],
        movementRange,
        mirrorX,
        cameraDeviceId: selectedDevice,
        resolution: {
          width: activeCamera?.width || 640,
          height: activeCamera?.height || 480,
        },
        fps: activeCamera?.fps || 30,
      });
    }
  }, [step, corners, hsvCenter, hsvTolerance, movementRange, mirrorX, selectedDevice, activeCamera]);

  const handleComplete = () => {
    if (corners.length < 4) return;
    const cal: CalibrationData = {
      hsvCenter,
      hsvTolerance,
      corners: corners as [Point2D, Point2D, Point2D, Point2D],
      movementRange,
      mirrorX,
      cameraDeviceId: selectedDevice,
      resolution: {
        width: activeCamera?.width || 640,
        height: activeCamera?.height || 480,
      },
      fps: activeCamera?.fps || 30,
    };
    // Save to localStorage + sessionStorage as backup
    const calJson = JSON.stringify(cal);
    try { localStorage.setItem('ballTracker_calibration', calJson); } catch {}
    try { sessionStorage.setItem('ballTracker_calibration', calJson); } catch {}
    onComplete(cal);
  };

  const renderStep = () => {
    switch (step) {
      case 'camera':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Camera setup</h2>
            <p className="text-gray-500">
              Choose how to connect your camera. A phone works great.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Option 1: Phone via QR */}
              <div className="bg-white border-2 border-emerald-500 rounded-2xl p-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="6" y="2" width="12" height="20" rx="2" /><line x1="10" y1="18" x2="14" y2="18" /></svg>
                  <h3 className="text-sm font-bold text-gray-900">Use your phone</h3>
                </div>
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR Code" className="mx-auto mb-3 rounded-lg" />
                )}
                <p className="text-xs text-gray-500 mb-2">Scan with your phone camera</p>
                <p className="text-[10px] text-gray-300 font-mono break-all">{typeof window !== 'undefined' ? window.location.origin : ''}/remote-camera?session={phoneSessionId}</p>
              </div>

              {/* Option 2: Webcam / built-in */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <h3 className="text-sm font-bold text-gray-900">Use webcam</h3>
                </div>
                {permission !== 'granted' ? (
                  <button onClick={handleRequestPermission} className="btn-primary w-full text-sm">
                    Allow camera access
                  </button>
                ) : (
                  <div className="space-y-3">
                    <select
                      className="input-field text-sm"
                      value={selectedDevice}
                      onChange={(e) => setSelectedDevice(e.target.value)}
                    >
                      <option value="">-- Select camera --</option>
                      {devices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleStartCamera}
                      disabled={!selectedDevice}
                      className="btn-primary w-full text-sm disabled:opacity-50"
                    >
                      Start camera
                    </button>
                  </div>
                )}
                {cameraError && <p className="text-red-500 text-xs mt-2">{cameraError}</p>}
                {permission === 'denied' && <p className="text-red-500 text-xs mt-2">Camera access denied. Check browser settings.</p>}
              </div>
            </div>

            {/* Positioning tips */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Camera positioning</p>
              <ul className="text-xs text-gray-500 space-y-1.5">
                <li>Place behind and below your playing area, angled slightly up</li>
                <li>The camera should see the entire training area and your ball</li>
                <li>Use good lighting - avoid backlighting or shadows</li>
              </ul>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Camera preview</h2>
            <p className="text-gray-400">
              Check that the camera captures the training area. The ball should be clearly visible.
            </p>
            {activeCamera && (
              <div className="text-sm text-gray-500">
                {activeCamera.width}x{activeCamera.height} @ {Math.round(activeCamera.fps)} fps
                <br />
                {activeCamera.label}
              </div>
            )}
            <div className="relative max-w-2xl">
              <canvas
                ref={canvasRef}
                className="w-full rounded-lg border border-gray-200"
              />
            </div>
            <button onClick={() => {
              // Default to full area
              const w = activeCamera?.width || 640;
              const h = activeCamera?.height || 480;
              setCorners([{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }]);
              setStep('corners');
            }} className="btn-primary">
              Continue
            </button>
          </div>
        );

      case 'corners':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Training area</h2>
            <p className="text-gray-400">
              Mark the area where you play, or use the full camera view.
            </p>

            {/* Use full area toggle */}
            <label className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={corners.length === 4 && corners[0].x === 0 && corners[0].y === 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    const w = activeCamera?.width || 640;
                    const h = activeCamera?.height || 480;
                    setCorners([{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }]);
                  } else {
                    setCorners([]);
                  }
                }}
                className="w-5 h-5 accent-emerald-500 rounded"
              />
              <div>
                <div className="text-sm font-bold text-gray-900">Use entire camera view <span className="text-emerald-500 text-xs font-medium ml-1">Recommended</span></div>
                <div className="text-xs text-gray-500">Skip manual corner selection</div>
              </div>
            </label>

            <div className="relative max-w-2xl">
              <canvas
                ref={canvasRef}
                className="w-full rounded-lg border border-gray-200 cursor-crosshair"
                onClick={handleCornerClick}
              />
            </div>
            <p className="text-xs text-gray-400">Or click 4 corners manually: top-left, top-right, bottom-right, bottom-left. ({corners.length}/4)</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCorners([])}
                className="btn-secondary"
              >
                Reset
              </button>
              <button
                onClick={() => setStep('color')}
                disabled={corners.length < 4}
                className="btn-primary disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 'color':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Ball colour</h2>
            <p className="text-gray-400">
              Click on the ball in the image. Areas with a similar colour will be highlighted.
            </p>
            <div className="relative max-w-2xl">
              <canvas
                ref={canvasRef}
                className="w-full rounded-lg border border-gray-200 cursor-crosshair"
                onClick={handleColorPick}
              />
              <canvas
                ref={overlayRef}
                className="absolute inset-0 w-full h-full rounded-lg pointer-events-none"
              />
            </div>
            {hsvCenter[0] !== 0 || hsvCenter[1] !== 0 ? (
              <div className="text-sm text-gray-400">
                HSV: {hsvCenter[0]}deg, {hsvCenter[1]}%, {hsvCenter[2]}%
              </div>
            ) : null}
            <button
              onClick={() => setStep('tolerance')}
              disabled={hsvCenter[0] === 0 && hsvCenter[1] === 0 && hsvCenter[2] === 0}
              className="btn-primary disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        );

      case 'tolerance':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Colour tolerance</h2>
            <p className="text-gray-400">
              Adjust the tolerance until the green area covers only the ball.
            </p>
            <div className="relative max-w-2xl">
              <canvas
                ref={canvasRef}
                className="w-full rounded-lg border border-gray-200"
              />
              <canvas
                ref={overlayRef}
                className="absolute inset-0 w-full h-full rounded-lg pointer-events-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md">
              <div>
                <label className="text-sm text-gray-400">Hue (H): {hsvTolerance[0]}</label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={hsvTolerance[0]}
                  onChange={(e) =>
                    setHsvTolerance([
                      parseInt(e.target.value),
                      hsvTolerance[1],
                      hsvTolerance[2],
                    ])
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Saturation (S): {hsvTolerance[1]}</label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={hsvTolerance[1]}
                  onChange={(e) =>
                    setHsvTolerance([
                      hsvTolerance[0],
                      parseInt(e.target.value),
                      hsvTolerance[2],
                    ])
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Brightness (V): {hsvTolerance[2]}</label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={hsvTolerance[2]}
                  onChange={(e) =>
                    setHsvTolerance([
                      hsvTolerance[0],
                      hsvTolerance[1],
                      parseInt(e.target.value),
                    ])
                  }
                  className="w-full"
                />
              </div>
            </div>
            <button onClick={() => setStep('range')} className="btn-primary">
              Continue
            </button>
          </div>
        );

      case 'range':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Movement range</h2>
            <p className="text-gray-400">
              Set a comfortable left and right movement range for the ball.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="text-sm text-gray-400">
                  Left side: {Math.round(movementRange.left * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={movementRange.left * 100}
                  onChange={(e) =>
                    setMovementRange((r) => ({
                      ...r,
                      left: parseInt(e.target.value) / 100,
                    }))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">
                  Right side: {Math.round(movementRange.right * 100)}%
                </label>
                <input
                  type="range"
                  min="55"
                  max="100"
                  value={movementRange.right * 100}
                  onChange={(e) =>
                    setMovementRange((r) => ({
                      ...r,
                      right: parseInt(e.target.value) / 100,
                    }))
                  }
                  className="w-full"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={mirrorX}
                onChange={(e) => setMirrorX(e.target.checked)}
                className="w-4 h-4"
              />
              Flip left and right
            </label>
            <button onClick={() => setStep('test')} className="btn-primary">
              Continue to test
            </button>
          </div>
        );

      case 'test':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Tracking test</h2>
            <p className="text-gray-400">
              Move the ball and verify that the green circle follows its movement.
            </p>
            <div className="relative max-w-2xl">
              <canvas
                ref={canvasRef}
                className="w-full rounded-lg border border-gray-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  testResult === 'tracking'
                    ? 'bg-green-500'
                    : testResult === 'lost'
                    ? 'bg-red-500'
                    : 'bg-gray-500'
                }`}
              />
              <span className="text-sm text-gray-400">
                {testResult === 'tracking'
                  ? 'Tracking works'
                  : testResult === 'lost'
                  ? 'Ball not detected'
                  : 'Waiting for detection...'}
              </span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('tolerance')} className="btn-secondary">
                Go back
              </button>
              <button onClick={handleComplete} className="btn-primary">
                Done - start training
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-8">
          {(Object.keys(STEP_LABELS) as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                Object.keys(STEP_LABELS).indexOf(step) >= i
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step label */}
        <p className="text-sm text-gray-400 mb-2">{STEP_LABELS[step]}</p>

        {/* Hidden video element */}
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          muted
          autoPlay
        />

        {renderStep()}

        <button
          onClick={() => {
            stopCamera();
            onCancel();
          }}
          className="mt-8 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancel calibration
        </button>
      </div>
    </div>
  );
}
