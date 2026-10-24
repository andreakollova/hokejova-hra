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
              Allow camera access and select a device. Place the camera lower and point it
              at the training area.
            </p>

            {permission !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="btn-primary"
              >
                Allow camera
              </button>
            ) : (
              <div className="space-y-4">
                <label className="block text-sm text-gray-500">Select camera</label>
                <select
                  className="input-field"
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                >
                  <option value="">-- Select camera --</option>
                  {devices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleStartCamera}
                  disabled={!selectedDevice}
                  className="btn-primary disabled:opacity-50"
                >
                  Start camera
                </button>
              </div>
            )}

            {cameraError && (
              <p className="text-red-500 text-sm">{cameraError}</p>
            )}

            {permission === 'denied' && (
              <p className="text-red-500 text-sm">
                Camera access is denied. Check your browser settings.
              </p>
            )}

            {/* Phone camera option */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button
                onClick={async () => {
                  setShowPhoneQR(true);
                  const url = `${window.location.origin}/remote-camera?session=${phoneSessionId}`;
                  const dataUrl = await QRCode.toDataURL(url, { width: 200, margin: 2, color: { dark: '#111827', light: '#ffffff' } });
                  setQrDataUrl(dataUrl);
                }}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Or use your phone as a camera &rarr;
              </button>

              {showPhoneQR && qrDataUrl && (
                <div className="mt-4 bg-gray-50 rounded-2xl p-6 text-center">
                  <img src={qrDataUrl} alt="QR Code" className="mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-1">Scan with your phone</p>
                  <p className="text-xs text-gray-400">Point your phone camera at the training area. The ball position will be sent to this screen.</p>
                  <p className="text-[10px] text-gray-300 mt-2 font-mono break-all">{window.location.origin}/remote-camera?session={phoneSessionId}</p>
                </div>
              )}
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
            <button onClick={() => setStep('corners')} className="btn-primary">
              Continue
            </button>
          </div>
        );

      case 'corners':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Training area</h2>
            <p className="text-gray-400">
              Click on the 4 corners of the training area in order: top-left, top-right,
              bottom-right, bottom-left. ({corners.length}/4)
            </p>
            <div className="relative max-w-2xl">
              <canvas
                ref={canvasRef}
                className="w-full rounded-lg border border-gray-200 cursor-crosshair"
                onClick={handleCornerClick}
              />
            </div>
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
