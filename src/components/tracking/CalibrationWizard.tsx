'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { BallTracker, rgbToHsv } from '@/lib/ball-tracker';
import { CalibrationData, Point2D } from '@/lib/tracking';

interface CalibrationWizardProps {
  onComplete: (calibration: CalibrationData) => void;
  onCancel: () => void;
}

type Step = 'camera' | 'preview' | 'corners' | 'color' | 'tolerance' | 'range' | 'test';

const STEP_LABELS: Record<Step, string> = {
  camera: '1. Kamera',
  preview: '2. Nastavenie kamery',
  corners: '3. Oblasť tréningu',
  color: '4. Farba loptičky',
  tolerance: '5. Tolerancia farby',
  range: '6. Rozsah pohybu',
  test: '7. Skuska sledovania',
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
    // Save to localStorage
    localStorage.setItem('ballTracker_calibration', JSON.stringify(cal));
    onComplete(cal);
  };

  const renderStep = () => {
    switch (step) {
      case 'camera':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Nastavenie kamery</h2>
            <p className="text-gray-500">
              Povoľ prístup ku kamere a vyber zariadenie. Kameru polož nižšie a nasmeruj
              na tréningovú plochu.
            </p>

            {permission !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="btn-primary"
              >
                Povoliť kameru
              </button>
            ) : (
              <div className="space-y-4">
                <label className="block text-sm text-gray-500">Vyber kameru</label>
                <select
                  className="input-field"
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                >
                  <option value="">-- Vyber kameru --</option>
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
                  Spustiť kameru
                </button>
              </div>
            )}

            {cameraError && (
              <p className="text-red-500 text-sm">{cameraError}</p>
            )}

            {permission === 'denied' && (
              <p className="text-red-500 text-sm">
                Prístup ku kamere je zakázaný. Skontroluj nastavenia prehliadača.
              </p>
            )}
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Náhľadovanie kamery</h2>
            <p className="text-gray-400">
              Skontroluj, či kamera sníma tréningovú plochu. Loptička by mala byť dobre viditeľná.
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
              Pokračovať
            </button>
          </div>
        );

      case 'corners':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Oblasť tréningu</h2>
            <p className="text-gray-400">
              Klikni na 4 rohy tréningovej plochy v poradí: ľavý horný, pravý horný,
              pravý dolný, ľavý dolný. ({corners.length}/4)
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
                Resetovať
              </button>
              <button
                onClick={() => setStep('color')}
                disabled={corners.length < 4}
                className="btn-primary disabled:opacity-50"
              >
                Pokračovať
              </button>
            </div>
          </div>
        );

      case 'color':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Farba loptičky</h2>
            <p className="text-gray-400">
              Klikni na loptičku v obraze. Zvýraznia sa oblasti s podobnou farbou.
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
              Pokračovať
            </button>
          </div>
        );

      case 'tolerance':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Tolerancia farby</h2>
            <p className="text-gray-400">
              Nastav toleranciu, kým zelená oblasť pokrýva iba loptičku.
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
                <label className="text-sm text-gray-400">Odtien (H): {hsvTolerance[0]}</label>
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
                <label className="text-sm text-gray-400">Sytost (S): {hsvTolerance[1]}</label>
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
                <label className="text-sm text-gray-400">Jas (V): {hsvTolerance[2]}</label>
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
              Pokračovať
            </button>
          </div>
        );

      case 'range':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Rozsah pohybu</h2>
            <p className="text-gray-400">
              Nastav pohodlný ľavý a pravý rozsah pohybu loptičky.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="text-sm text-gray-400">
                  Lava strana: {Math.round(movementRange.left * 100)}%
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
                  Prava strana: {Math.round(movementRange.right * 100)}%
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
              Obrátiť ľavú a pravú stranu
            </label>
            <button onClick={() => setStep('test')} className="btn-primary">
              Pokračovať na skúšku
            </button>
          </div>
        );

      case 'test':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Skuska sledovania</h2>
            <p className="text-gray-400">
              Pohybuj loptičkou a over, či zelený krúžok sleduje jej pohyb.
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
                  ? 'Sledovanie funguje'
                  : testResult === 'lost'
                  ? 'Loptička nie je detekovaná'
                  : 'Čakám na detekciu...'}
              </span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('tolerance')} className="btn-secondary">
                Spätná úprava
              </button>
              <button onClick={handleComplete} className="btn-primary">
                Hotovo - spustiť tréning
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
          Zrušiť kalibráciu
        </button>
      </div>
    </div>
  );
}
