'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { SpotifyTrack, BeatMap, parseTrack, parseAnalysis, getSpotifyAuthUrl } from '@/lib/spotify';

// Spotify Web Playback SDK types
declare global {
  interface Window {
    Spotify: {
      Player: new (config: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume: number;
      }) => SpotifyPlayer;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, cb: (data: Record<string, unknown>) => void) => void;
  removeListener: (event: string) => void;
  getCurrentState: () => Promise<{
    position: number;
    paused: boolean;
    track_window: { current_track: Record<string, unknown> };
  } | null>;
  resume: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
}

export function useSpotify() {
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [beatMap, setBeatMap] = useState<BeatMap | null>(null);
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [position, setPosition] = useState(0);
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const positionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check if connected on mount
  useEffect(() => {
    const token = getCookie('spotify_token_client');
    if (token) {
      setIsConnected(true);
      loadPlaybackSDK(token);
    }
  }, []);

  const connect = useCallback(() => {
    window.location.href = getSpotifyAuthUrl();
  }, []);

  const disconnect = useCallback(() => {
    playerRef.current?.disconnect();
    playerRef.current = null;
    setIsConnected(false);
    setIsReady(false);
    setDeviceId(null);
    // Clear cookies
    document.cookie = 'spotify_token_client=; max-age=0; path=/';
  }, []);

  const loadPlaybackSDK = useCallback((token: string) => {
    // Check if SDK script already loaded
    if (window.Spotify) {
      initPlayer(token);
      return;
    }

    window.onSpotifyWebPlaybackSDKReady = () => initPlayer(token);

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const initPlayer = useCallback((token: string) => {
    const player = new window.Spotify.Player({
      name: 'Hokejový Tréner',
      getOAuthToken: (cb) => {
        // Try to refresh if needed
        const currentToken = getCookie('spotify_token_client');
        if (currentToken) {
          cb(currentToken);
        } else {
          // Refresh token
          fetch('/api/spotify/token', { method: 'POST' })
            .then(() => {
              const newToken = getCookie('spotify_token_client');
              cb(newToken || token);
            })
            .catch(() => cb(token));
        }
      },
      volume: 0.7,
    });

    player.addListener('ready', (data) => {
      setDeviceId(data.device_id as string);
      setIsReady(true);
    });

    player.addListener('not_ready', () => {
      setIsReady(false);
    });

    player.addListener('player_state_changed', (state) => {
      if (!state) return;
      setIsPlaying(!state.paused);
      setPosition((state as unknown as { position: number }).position);
    });

    player.connect();
    playerRef.current = player;
  }, []);

  // Track position polling during playback
  useEffect(() => {
    if (isPlaying) {
      positionIntervalRef.current = setInterval(async () => {
        const state = await playerRef.current?.getCurrentState();
        if (state) setPosition(state.position);
      }, 100);
    } else {
      if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
    }
    return () => {
      if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
    };
  }, [isPlaying]);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
      if (res.status === 401) {
        // Token expired, try refresh
        await fetch('/api/spotify/token', { method: 'POST' });
        const retry = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
        const data = await retry.json();
        setSearchResults((data.tracks || []).map(parseTrack));
      } else {
        const data = await res.json();
        setSearchResults((data.tracks || []).map(parseTrack));
      }
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  }, []);

  const selectTrack = useCallback(async (track: SpotifyTrack) => {
    setCurrentTrack(track);
    setBeatMap(null);

    // Try audio-features for BPM (may be deprecated for new apps)
    let tempo = 0;
    try {
      const res = await fetch(`/api/spotify/analysis?id=${track.id}&type=features`);
      if (res.ok) {
        const data = await res.json();
        if (data.tempo && data.tempo > 0) {
          tempo = Math.round(data.tempo);
        }
      }
    } catch {}

    // If no tempo from API, set null so MusicSelector asks user
    if (tempo === 0) {
      setBeatMap({
        tempo: 0,
        beats: [],
        bars: [],
        sections: [],
        durationS: track.durationMs / 1000,
      });
      return;
    }

    generateBeatsFromBpm(tempo, track.durationMs / 1000);
  }, []);

  const generateBeatsFromBpm = useCallback((tempo: number, durationS: number) => {
    const beatInterval = 60 / tempo;
    const beats: number[] = [];
    for (let t = 0; t < durationS; t += beatInterval) {
      beats.push(t);
    }
    setBeatMap({ tempo, beats, bars: [], sections: [], durationS });
  }, []);

  const updateBpm = useCallback((newBpm: number) => {
    if (!currentTrack) return;
    generateBeatsFromBpm(newBpm, currentTrack.durationMs / 1000);
  }, [currentTrack, generateBeatsFromBpm]);

  const play = useCallback(async (track?: SpotifyTrack) => {
    const token = getCookie('spotify_token_client');
    if (!token || !deviceId) return;

    const uri = track?.uri || currentTrack?.uri;
    if (!uri) return;

    if (track) setCurrentTrack(track);

    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [uri] }),
    });

    setIsPlaying(true);
  }, [deviceId, currentTrack]);

  const pause = useCallback(async () => {
    await playerRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const seek = useCallback(async (positionMs: number) => {
    await playerRef.current?.seek(positionMs);
    setPosition(positionMs);
  }, []);

  const getPositionMs = useCallback(async (): Promise<number> => {
    const state = await playerRef.current?.getCurrentState();
    return state?.position || 0;
  }, []);

  return {
    isConnected,
    isReady,
    isPlaying,
    currentTrack,
    beatMap,
    searchResults,
    searching,
    position,
    connect,
    disconnect,
    search,
    selectTrack,
    play,
    pause,
    seek,
    getPositionMs,
    updateBpm,
  };
}

function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : '';
}
