'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { needsSafetyAcknowledgment } from '@/components/ui/SafetyModal';
import { CalibrationData, InputMode, GameInput } from '@/lib/tracking';
import { SlalomResult } from '@/components/games/SlalomGame';
import { MusicConfig } from '@/components/music/MusicSelector';
import { SpotifyTrack } from '@/lib/spotify';
import { useTracker } from '@/hooks/useTracker';
import { useCamera } from '@/hooks/useCamera';
import { useSpotify } from '@/hooks/useSpotify';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import MascotGlow from '@/components/ui/MascotGlow';

const HISTORY_KEY = 'sportqo_music_history';
const BPM_TEMPLATES = [80, 100, 120, 140, 160];

interface TrackRecord {
  track: SpotifyTrack;
  playCount: number;
  lastPlayed: number;
}

function loadMusicHistory(): TrackRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function generateBeatsForBpm(bpm: number, durationS: number): number[] {
  const interval = 60 / bpm;
  const beats: number[] = [];
  let seed = bpm * 7919;
  const rng = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; };
  let t = interval;
  while (t < durationS - 0.5) {
    const roll = rng();
    if (roll < 0.55) {
      const len = 3 + Math.floor(rng() * 4);
      for (let i = 0; i < len && t < durationS - 0.5; i++) {
        beats.push(Math.round(t * 100) / 100);
        const swing = i % 2 === 1 ? interval * (0.88 + rng() * 0.24) : interval;
        t += swing;
      }
    } else if (roll < 0.75) {
      const len = 2 + Math.floor(rng() * 3);
      for (let i = 0; i < len && t < durationS - 0.5; i++) {
        beats.push(Math.round(t * 100) / 100);
        t += interval * 0.5;
      }
    } else if (roll < 0.9) {
      t += interval * (1 + Math.floor(rng() * 2));
      if (t < durationS - 0.5) { beats.push(Math.round(t * 100) / 100); t += interval; }
    } else {
      beats.push(Math.round(t * 100) / 100);
      t += interval * 0.6;
      if (t < durationS - 0.5) { beats.push(Math.round(t * 100) / 100); t += interval * 1.4; }
    }
  }
  return beats;
}

interface SavedBeatMap {
  id: string;
  spotify_track_id: string;
  track_name: string;
  track_artist: string;
  track_album_art: string;
  track_duration_ms: number;
  bpm: number;
  beats: number[];
}

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
const BackgroundMusic = dynamic(() => import('@/components/music/BackgroundMusic'), { ssr: false });
const MusicSelector = dynamic(() => import('@/components/music/MusicSelector'), {
  ssr: false,
});
const SafetyModal = dynamic(() => import('@/components/ui/SafetyModal'), { ssr: false });

type Phase = 'setup' | 'calibration' | 'music' | 'playing' | 'result';

export default function TreningPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [result, setResult] = useState<SlalomResult | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [musicConfig, setMusicConfig] = useState<MusicConfig | null>(null);
  const [showMusic, setShowMusic] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [beatMaps, setBeatMaps] = useState<SavedBeatMap[]>([]);
  const [selectedBpm, setSelectedBpm] = useState(120);
  const [bpmPickerTrack, setBpmPickerTrack] = useState<SpotifyTrack | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const auth = useAuth();
  const tracker = useTracker(inputMode);
  const spotify = useSpotify();
  const videoRef = useRef<HTMLVideoElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { startCamera, stopCamera } = useCamera();
  const pendingStreamRef = useRef<MediaStream | null>(null);

  // Wall time ref: set when Spotify actually starts playing (after await)
  const gameStartWallTimeRef = useRef(0);

  // Pause music on unmount (browser back button)
  useEffect(() => {
    return () => { spotify.pause(); };
  }, []);

  // Auto-open music after Spotify OAuth redirect or prefilled track from dashboard
  useEffect(() => {
    const savedCal = localStorage.getItem('ballTracker_calibration') || sessionStorage.getItem('ballTracker_calibration');
    if (savedCal) { try { setCalibration(JSON.parse(savedCal)); } catch {} }

    const params = new URLSearchParams(window.location.search);
    if (params.get('spotify') === 'connected') {
      setShowMusic(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
    // Check for prefilled track from dashboard
    try {
      const prefill = localStorage.getItem('hb_prefill_track');
      if (prefill) {
        localStorage.removeItem('hb_prefill_track');
        const song = JSON.parse(prefill);
        if (song.id) {
          // Open music panel with this track pre-selected for BPM picking
          setShowMusic(true);
          setBpmPickerTrack({
            id: song.id,
            name: song.name,
            artists: song.artist,
            album: '',
            albumArt: song.albumArt || '',
            durationMs: 0,
            uri: `spotify:track:${song.id}`,
          });
        }
      }
    } catch {}
  }, []);

  // Load admin beat maps
  useEffect(() => {
    fetch('/api/beats').then(r => r.json()).then(d => {
      if (d.beatMaps) setBeatMaps(d.beatMaps);
    }).catch(() => {});
  }, []);

  const musicHistory = useMemo(() => loadMusicHistory(), []);
  const favorites = useMemo(() => [...musicHistory].sort((a, b) => b.playCount - a.playCount).slice(0, 5), [musicHistory]);
  const recent = useMemo(() => {
    const favIds = new Set(favorites.map(f => f.track.id));
    return musicHistory.filter(h => !favIds.has(h.track.id)).sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 3);
  }, [musicHistory, favorites]);
  const mappedIds = useMemo(() => new Set(beatMaps.map(b => b.spotify_track_id)), [beatMaps]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setBpmPickerTrack(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => spotify.search(q), 400);
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    const mapped = beatMaps.find(b => b.spotify_track_id === track.id);
    if (mapped) {
      setMusicConfig({
        mode: 'spotify',
        bpm: mapped.bpm,
        beatMap: { tempo: mapped.bpm, beats: mapped.beats, bars: [], sections: [], durationS: mapped.track_duration_ms / 1000 },
        track: { id: mapped.spotify_track_id, name: mapped.track_name, artists: mapped.track_artist, album: '', albumArt: mapped.track_album_art, durationMs: mapped.track_duration_ms, uri: `spotify:track:${mapped.spotify_track_id}` },
      });
    } else {
      // Auto-generate beats at 120 BPM for unmapped tracks
      const durationS = track.durationMs > 0 ? track.durationMs / 1000 : 180;
      const beats = generateBeatsForBpm(120, durationS);
      setMusicConfig({
        mode: 'spotify',
        bpm: 120,
        beatMap: { tempo: 120, beats, bars: [], sections: [], durationS },
        track,
      });
    }
    setShowMusic(false);
    setSearchQuery('');
    setBpmPickerTrack(null);
  };

  const handleConfirmBpm = () => {
    if (!bpmPickerTrack) return;
    const durationS = bpmPickerTrack.durationMs / 1000;
    const beats = generateBeatsForBpm(selectedBpm, durationS);
    setMusicConfig({
      mode: 'spotify',
      bpm: selectedBpm,
      beatMap: { tempo: selectedBpm, beats, bars: [], sections: [], durationS },
      track: bpmPickerTrack,
    });
    setShowMusic(false);
    setSearchQuery('');
    setBpmPickerTrack(null);
  };

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
    if (needsSafetyAcknowledgment()) { setShowSafety(true); return; }
    if (inputMode === 'demo') {
      tracker.startDemo();
      setPhase('playing');
      // Music starts after countdown via onGameStart
      return;
    }

    if (inputMode === 'remote') {
      const sid = localStorage.getItem('hb_remote_session');
      if (sid) { tracker.startRemote(sid); setPhase('playing'); return; }
      setPhase('calibration'); return;
    }

    if (!calibration) {
      setPhase('calibration');
      return;
    }

    // If calibrated via phone, use remote mode
    if (calibration.cameraDeviceId === 'remote') {
      const sid = localStorage.getItem('hb_remote_session');
      if (sid) { tracker.startRemote(sid); setPhase('playing'); return; }
      setPhase('calibration'); return;
    }

    // Acquire camera stream from click handler (Safari requires user gesture for getUserMedia)
    tracker.setCalibration(calibration);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { ideal: calibration.cameraDeviceId }, facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 60, min: 30 } },
      });
      pendingStreamRef.current = stream;
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } } });
        pendingStreamRef.current = stream;
      } catch { /* effect will try again */ }
    }
    setGameKey(k => k + 1);
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
      await new Promise(r => setTimeout(r, 300));
      if (cancelled) return;

      const video = videoRef.current;
      if (!video) return;

      tracker.stopTracking(); tracker.stopRemote();
      tracker.setCalibration(calibration);

      // Use pre-acquired stream from click handler (Safari requires user gesture)
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

      // Fallback: try startCamera (works on desktop)
      let info = await startCamera(calibration.cameraDeviceId, video);
      if (!info) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          });
          video.srcObject = stream;
          await video.play();
          info = { width: video.videoWidth, height: video.videoHeight, fps: 30, deviceId: 'fallback', label: 'Fallback' };
        } catch { return; }
      }

      if (!cancelled && info) {
        await new Promise(r => setTimeout(r, 200));
        if (!cancelled) tracker.startTracking(video);
      }
    };

    startCameraTracking();
    return () => { cancelled = true; tracker.stopTracking(); tracker.stopRemote(); };
  }, [phase, inputMode, calibration, gameKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFinish = useCallback((res: SlalomResult) => {
    setResult(res);
    setPhase('result');
    tracker.stopTracking(); tracker.stopRemote();
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

  if (!auth.loading && !auth.isLoggedIn) {
    if (typeof window !== 'undefined') window.location.href = '/?login=true';
    return null;
  }

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
          setGameKey(k => k + 1);
          setPhase('playing');
        }}
        onMenu={() => {
          setResult(null);
          setPhase('setup');
        }}
        onChangeSong={() => {
          setResult(null);
          setMusicConfig(null);
          setShowMusic(true);
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
          key={gameKey}
          difficulty={difficulty}
          duration={duration}
          inputMode={inputMode}
          getGameInput={tracker.getGameInput}
          onFinish={handleFinish}
          onPause={handlePause}
          onResume={handleResume}
          isPaused={isPaused}
          onBackToMenu={() => {
            tracker.stopTracking(); tracker.stopRemote();
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
              Demo mode - move your mouse
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

        {/* Back to menu button */}
        <button
          onClick={() => { tracker.stopTracking(); tracker.stopRemote(); stopCamera(); spotify.pause(); setMusicConfig(null); setPhase('setup'); }}
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-2 text-gray-500 hover:text-gray-900 transition-colors shadow-sm z-10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>

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
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>

        {/* Logo + Mascot */}
        <Link href="/dashboard" className="block mb-4">
          <Image src="/images/hb-logo-hero-dark.png" alt="Hockey Beats" width={120} height={32} className="h-6 w-auto" />
        </Link>
        <div className="flex items-center gap-5 mb-8">
          <MascotGlow src="/images/mascots/mascot-slalom.webp" color="#22c55e" size={90} />
          <div>
            <h1 className="text-3xl font-extrabold text-[#101828] tracking-tight">HockeyBeats Slalom</h1>
            <p className="text-gray-500 text-sm mt-1">Dodge the cones left and right</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Calibration */}
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4">
            <div>
              <div className="text-sm font-semibold text-[#101828]">Camera</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {calibration ? 'Calibrated' : 'Not configured'}
              </div>
            </div>
            <button
              onClick={() => setPhase('calibration')}
              className="text-xs font-bold px-4 py-2 rounded-xl transition-all bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            >
              {calibration ? 'Recalibrate' : 'Calibrate'}
            </button>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2.5 block">Difficulty</label>
            <div className="flex gap-2.5">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${difficulty === d ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}>
                  {d === 'easy' ? 'Easy' : d === 'medium' ? 'Medium' : 'Hard'}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2.5 block">Duration</label>
            <div className="flex gap-2.5">
              {([30, 60, 90] as const).map((d) => (
                <button key={d} onClick={() => setDuration(d)} className={`flex-1 rounded-2xl py-3.5 border-2 transition-all text-sm font-semibold ${duration === d ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}>
                  {d}s
                </button>
              ))}
            </div>
          </div>

          {/* Music */}
          <BackgroundMusic spotify={spotify} onSelect={(track) => { if (track) handleSelectTrack(track); else setMusicConfig(null); }} selectedTrack={musicConfig?.track || null} />

          {/* Start button */}
          <button onClick={startGame} className="w-full text-white font-bold text-lg py-4 rounded-full transition-all hover:brightness-110 mt-2" style={{ backgroundColor: '#22c55e' }}>
            {musicConfig ? `Play at ${musicConfig.bpm} BPM` : 'Start training'}
          </button>

        </div>
        {showSafety && <SafetyModal onContinue={() => setShowSafety(false)} />}
      </div>
    </div>
  );
}
