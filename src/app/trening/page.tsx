'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CalibrationData, InputMode, GameInput } from '@/lib/tracking';
import { SlalomResult } from '@/components/games/SlalomGame';
import { MusicConfig } from '@/components/music/MusicSelector';
import { useTracker } from '@/hooks/useTracker';
import { useCamera } from '@/hooks/useCamera';
import { useSpotify } from '@/hooks/useSpotify';
import Link from 'next/link';

const CalibrationWizard = dynamic(
  () => import('@/components/tracking/CalibrationWizard'),
  { ssr: false }
);
const SlalomGame = dynamic(() => import('@/components/games/SlalomGame'), {
  ssr: false,
});
const ResultScreen = dynamic(() => import('@/components/ui/ResultScreen'), {
  ssr: false,
});
const MusicSelector = dynamic(() => import('@/components/music/MusicSelector'), {
  ssr: false,
});

type Phase = 'setup' | 'calibration' | 'music' | 'playing' | 'result';

export default function TreningPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [result, setResult] = useState<SlalomResult | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [musicConfig, setMusicConfig] = useState<MusicConfig | null>(null);

  const tracker = useTracker(inputMode);
  const spotify = useSpotify();
  const videoRef = useRef<HTMLVideoElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { startCamera, stopCamera } = useCamera();

  // Wall time ref: set when Spotify actually starts playing (after await)
  const gameStartWallTimeRef = useRef(0);

  // Load saved calibration
  useEffect(() => {
    const saved = localStorage.getItem('ballTracker_calibration') || sessionStorage.getItem('ballTracker_calibration');
    if (saved) {
      try {
        setCalibration(JSON.parse(saved));
      } catch {}
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

  // Called by SlalomGame when countdown finishes (3-2-1-GO)
  const handleGameStart = useCallback(() => {
    if (musicConfig?.mode === 'spotify' && musicConfig.track) {
      // Register callback BEFORE play() - SDK will fire it when music actually starts
      spotify.onPlaybackStart((timestamp) => {
        // +100ms for audio pipeline latency (SDK event → speaker)
        gameStartWallTimeRef.current = timestamp + 200;
      });
      spotify.play(musicConfig.track);
    } else {
      gameStartWallTimeRef.current = performance.now();
    }
  }, [musicConfig, spotify]);

  const startGame = useCallback(async () => {
    if (inputMode === 'demo') {
      tracker.startDemo();
      setPhase('playing');
      // Music starts after countdown via onGameStart
      return;
    }

    if (!calibration) {
      setPhase('calibration');
      return;
    }

    // Switch to playing phase FIRST so <video> element renders
    tracker.setCalibration(calibration);
    setPhase('playing');
  }, [inputMode, calibration, tracker, startCamera]);

  // Re-init demo + play music when entering playing phase (covers play again)
  useEffect(() => {
    if (phase !== 'playing') return;
    if (inputMode === 'demo') tracker.startDemo();
    // For beat mode, music starts via onGameStart. For non-beat, nothing extra needed.
  }, [phase, inputMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start camera when playing phase begins with camera mode
  useEffect(() => {
    if (phase !== 'playing' || inputMode !== 'camera' || !calibration) return;

    let cancelled = false;
    const startCameraTracking = async () => {
      // Wait for video element to render
      await new Promise(r => setTimeout(r, 200));
      if (cancelled) return;

      const video = videoRef.current;
      if (!video) {
        console.error('Video element not found');
        return;
      }

      // Re-apply calibration to tracker
      tracker.setCalibration(calibration);

      // Try saved device, fallback to any camera
      let info = await startCamera(calibration.cameraDeviceId, video);
      if (!info) {
        // Device ID might have changed - try any camera
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 60 } },
          });
          video.srcObject = stream;
          await video.play();
          info = {
            width: video.videoWidth,
            height: video.videoHeight,
            fps: 30,
            deviceId: 'fallback',
            label: 'Fallback camera',
          };
        } catch (e) {
          console.error('Camera failed:', e);
          return;
        }
      }

      if (!cancelled && info) {
        tracker.startTracking(video);
      }
    };

    startCameraTracking();
    return () => { cancelled = true; };
  }, [phase, inputMode, calibration, startCamera]);

  const handleFinish = useCallback((res: SlalomResult) => {
    setResult(res);
    setPhase('result');
    tracker.stopTracking();
    stopCamera();
    spotify.pause();
  }, [tracker, stopCamera, spotify]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Monitor tracking quality during game (with 5s warmup delay)
  useEffect(() => {
    if (phase !== 'playing' || inputMode === 'demo') return;

    // Wait 5s for camera to warm up before monitoring
    const delay = setTimeout(() => {
      const interval = setInterval(() => {
        const input = tracker.getGameInput();
        if (!input.active && !isPaused) {
          setIsPaused(true);
        } else if (input.active && isPaused) {
          setTimeout(() => setIsPaused(false), 1000);
        }
      }, 500);
      return () => clearInterval(interval);
    }, 5000);

    return () => clearTimeout(delay);
  }, [phase, inputMode, tracker, isPaused]);

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

  const handleFullscreen = () => {
    if (gameContainerRef.current) {
      gameContainerRef.current.requestFullscreen?.();
    }
  };

  if (phase === 'calibration') {
    return (
      <CalibrationWizard
        onComplete={handleCalibrationComplete}
        onCancel={() => setPhase('setup')}
      />
    );
  }

  if (phase === 'music') {
    return (
      <MusicSelector
        onSelect={(config) => {
          setMusicConfig(config);
          setPhase('setup');
        }}
        onCancel={() => setPhase('setup')}
        spotify={spotify}
      />
    );
  }

  if (phase === 'result' && result) {
    return (
      <ResultScreen
        type="slalom"
        result={result}
        onPlayAgain={() => {
          setResult(null);
          setPhase('playing');
        }}
        onMenu={() => {
          setResult(null);
          setPhase('setup');
        }}
        songName={musicConfig?.track?.name}
        songArtist={musicConfig?.track?.artists}
        songBpm={musicConfig?.bpm}
      />
    );
  }

  if (phase === 'playing') {
    return (
      <div
        ref={gameContainerRef}
        className="w-screen h-screen relative"
      >
        {/* Hidden video for camera tracking */}
        <video ref={videoRef} className="hidden" playsInline muted autoPlay />

        <SlalomGame
          difficulty={difficulty}
          duration={duration}
          inputMode={inputMode}
          getGameInput={tracker.getGameInput}
          onFinish={handleFinish}
          onPause={handlePause}
          onResume={handleResume}
          isPaused={isPaused}
          onBackToMenu={() => {
            tracker.stopTracking();
            stopCamera();
            spotify.pause();
            setMusicConfig(null);
            setPhase('setup');
          }}
          onGameStart={handleGameStart}
          beatTimestamps={musicConfig?.beatMap?.beats}
          bpm={musicConfig?.bpm}
          externalWallTimeRef={musicConfig?.mode === 'spotify' ? gameStartWallTimeRef : undefined}
        />

        {/* Tracking quality indicator */}
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
            <span className="text-xs text-gray-500">
              {tracker.state.fps} fps
            </span>
          </div>
        )}

        {inputMode === 'demo' && !musicConfig && (
          <div className="absolute bottom-4 left-4 bg-yellow-50/90 border border-yellow-200 rounded-2xl px-3 py-2 backdrop-blur-sm">
            <span className="text-xs text-yellow-700">
              Demo režim - pohybuj myšou
            </span>
          </div>
        )}

        {/* Spotify now playing */}
        {musicConfig?.mode === 'spotify' && musicConfig.track && (
          <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3 pointer-events-none shadow-sm">
            {/* Spotify logo */}
            <svg className="w-5 h-5 text-[#1DB954] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            {musicConfig.track.albumArt && (
              <img
                src={musicConfig.track.albumArt}
                alt=""
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate max-w-48">
                {musicConfig.track.name}
              </div>
              <div className="text-xs text-gray-500 truncate max-w-48">
                {musicConfig.track.artists}
              </div>
            </div>
            <div className="text-xs text-green-600 font-bold tabular-nums ml-2">
              {musicConfig.bpm} BPM
            </div>
          </div>
        )}

        {/* Fullscreen button */}
        <button
          onClick={handleFullscreen}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-2 text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    );
  }

  // Setup phase
  return (
    <div className="min-h-screen bg-gray-50/50 px-6 py-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Späť
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Slalom</h1>
          <p className="text-gray-500 leading-relaxed">
            Vyhýbaj sa kužeľom striedavo zľava a sprava. Kužele sa priblížujú k tebe
            a ty musíš viesť loptičku na správnu stranu.
          </p>
        </div>

        <div className="space-y-7">
          {/* Input mode */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
              Režim vstupu
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setInputMode('camera')}
                className={`flex-1 rounded-2xl p-4 border-2 transition-all ${
                  inputMode === 'camera'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900">Kamera</div>
                <div className="text-xs text-gray-500 mt-1">Sledovanie reálnej loptičky</div>
              </button>
              <button
                onClick={() => setInputMode('demo')}
                className={`flex-1 rounded-2xl p-4 border-2 transition-all ${
                  inputMode === 'demo'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900">Demo (myš)</div>
                <div className="text-xs text-gray-500 mt-1">Testovanie bez kamery</div>
              </button>
            </div>
          </div>

          {/* Calibration status */}
          {inputMode === 'camera' && (
            <div className="flex items-center justify-between card p-5">
              <div>
                <div className="text-sm font-semibold text-gray-900">Kalibrácia kamery</div>
                <div className="text-xs text-gray-500 mt-1.5">
                  {calibration
                    ? `Uložená (${calibration.resolution.width}x${calibration.resolution.height})`
                    : 'Nie je nastavená'}
                </div>
              </div>
              <button
                onClick={() => setPhase('calibration')}
                className="text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-all"
              >
                {calibration ? 'Prekalibrovať' : 'Kalibrovať'}
              </button>
            </div>
          )}

          {/* Difficulty */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
              Obťažnosť
            </label>
            <div className="flex gap-2.5">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${
                    difficulty === d
                      ? 'border-green-500 bg-green-50 text-green-600'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {d === 'easy' ? 'Ľahká' : d === 'medium' ? 'Stredná' : 'Ťažká'}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
              Dĺžka tréningu
            </label>
            <div className="flex gap-2.5">
              {([30, 60, 90] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${
                    duration === d
                      ? 'border-green-500 bg-green-50 text-green-600'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {d} sekúnd
                </button>
              ))}
            </div>
          </div>

          {/* Beat mode */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
              Hudba
            </label>
            <button
              onClick={() => setPhase('music')}
              className={`w-full rounded-2xl p-4 border-2 transition-all text-left ${
                musicConfig
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {musicConfig ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {musicConfig.track?.name || `${musicConfig.bpm} BPM`}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {musicConfig.track?.artists || (musicConfig.mode === 'tap' ? 'Tap tempo' : 'Metronóm')}
                      {' - '}{musicConfig.bpm} BPM
                    </div>
                  </div>
                  <span className="text-xs text-green-600">Zmeniť</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Beat mód</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Kužele syncnuté na rytmus hudby
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">Nastaviť</span>
                </div>
              )}
            </button>
            {musicConfig && (
              <button
                onClick={() => setMusicConfig(null)}
                className="text-xs text-gray-400 hover:text-gray-600 mt-2 transition-colors"
              >
                Vypnúť beat mód
              </button>
            )}
          </div>

          {/* Start button */}
          <button onClick={startGame} className="btn-primary w-full text-lg py-4 mt-2">
            {musicConfig ? `Hrať na ${musicConfig.bpm} BPM` : 'Spustiť tréning'}
          </button>

          {inputMode === 'demo' && (
            <p className="text-center text-xs text-gray-400">
              Výsledky z demo režimu sa neukladajú do rebríčka.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
