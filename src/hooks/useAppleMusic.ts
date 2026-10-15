'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SpotifyTrack } from '@/lib/spotify'; // reuse same track type

declare global {
  interface Window {
    MusicKit: {
      configure: (config: { developerToken: string; app: { name: string; build: string } }) => Promise<MusicKitInstance>;
      getInstance: () => MusicKitInstance;
    };
  }
}

interface MusicKitInstance {
  authorize: () => Promise<string>;
  unauthorize: () => Promise<void>;
  isAuthorized: boolean;
  api: {
    search: (query: string, options: { types: string; limit: number }) => Promise<{
      songs?: { data: AppleMusicSong[] };
    }>;
  };
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  setQueue: (options: { songs: string[] }) => Promise<void>;
  nowPlayingItem: { title?: string } | null;
  playbackState: number;
}

interface AppleMusicSong {
  id: string;
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    durationInMillis: number;
    artwork: { url: string; width: number; height: number };
  };
}

function artworkUrl(url: string, size: number): string {
  return url.replace('{w}', String(size)).replace('{h}', String(size));
}

function songToTrack(song: AppleMusicSong): SpotifyTrack {
  return {
    id: `am_${song.id}`,
    name: song.attributes.name,
    artists: song.attributes.artistName,
    album: song.attributes.albumName,
    albumArt: artworkUrl(song.attributes.artwork.url, 100),
    durationMs: song.attributes.durationInMillis,
    uri: song.id, // Apple Music song ID
  };
}

export function useAppleMusic() {
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const instanceRef = useRef<MusicKitInstance | null>(null);
  const sdkLoadedRef = useRef(false);

  const loadSDK = useCallback(async () => {
    if (sdkLoadedRef.current) return;

    // Get developer token
    const res = await fetch('/api/apple-music/token');
    if (!res.ok) return;
    const { token } = await res.json();

    // Load MusicKit JS SDK
    await new Promise<void>((resolve) => {
      if (window.MusicKit) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';
      script.async = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });

    // Wait for MusicKit to be ready
    await new Promise<void>((resolve) => {
      const check = () => {
        if (window.MusicKit) resolve();
        else setTimeout(check, 100);
      };
      check();
    });

    const instance = await window.MusicKit.configure({
      developerToken: token,
      app: { name: 'Hockey Beats', build: '1.0' },
    });

    instanceRef.current = instance;
    sdkLoadedRef.current = true;
    setIsReady(true);
  }, []);

  const connect = useCallback(async () => {
    await loadSDK();
    const instance = instanceRef.current;
    if (!instance) return;

    try {
      await instance.authorize();
      setIsConnected(true);
    } catch {
      // User cancelled
    }
  }, [loadSDK]);

  const disconnect = useCallback(async () => {
    const instance = instanceRef.current;
    if (instance) {
      await instance.unauthorize();
    }
    setIsConnected(false);
  }, []);

  const search = useCallback(async (query: string) => {
    if (!query.trim() || !instanceRef.current) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await instanceRef.current.api.search(query, {
        types: 'songs',
        limit: 10,
      });
      const songs = results.songs?.data || [];
      setSearchResults(songs.map(songToTrack));
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  }, []);

  const play = useCallback(async (track?: SpotifyTrack) => {
    const instance = instanceRef.current;
    if (!instance) return;

    if (track) {
      const songId = track.uri; // Apple Music song ID
      await instance.setQueue({ songs: [songId] });
    }
    await instance.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(async () => {
    const instance = instanceRef.current;
    if (instance) await instance.pause();
    setIsPlaying(false);
  }, []);

  return {
    isConnected,
    isReady,
    isPlaying,
    searchResults,
    searching,
    connect,
    disconnect,
    search,
    play,
    pause,
  };
}
