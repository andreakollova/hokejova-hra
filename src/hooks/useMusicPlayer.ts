'use client';

import { useCallback, useRef, useEffect } from 'react';
import { SpotifyTrack } from '@/lib/spotify';
import { useSpotify } from './useSpotify';
import { useAppleMusic } from './useAppleMusic';

// Unified music player that works with Spotify, Apple Music, and free local tracks
export function useMusicPlayer() {
  const spotify = useSpotify();
  const apple = useAppleMusic();
  const lastServiceRef = useRef<'spotify' | 'apple' | 'free'>('spotify');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Pause music when component unmounts (e.g. browser back button)
  useEffect(() => {
    return () => {
      spotify.pause();
      apple.pause();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  const play = useCallback(async (track: SpotifyTrack) => {
    // Stop any previous free track
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }

    if (track.id.startsWith('free_')) {
      // Free local MP3
      lastServiceRef.current = 'free';
      const audio = new Audio(track.uri);
      audio.loop = true;
      audio.volume = 0.7;
      await audio.play();
      audioRef.current = audio;
    } else if (track.id.startsWith('am_')) {
      lastServiceRef.current = 'apple';
      await apple.play(track);
    } else {
      lastServiceRef.current = 'spotify';
      await spotify.play(track);
    }
  }, [spotify, apple]);

  const pause = useCallback(async () => {
    if (lastServiceRef.current === 'free') {
      if (audioRef.current) { audioRef.current.pause(); }
    } else if (lastServiceRef.current === 'apple') {
      await apple.pause();
    } else {
      await spotify.pause();
    }
  }, [spotify, apple]);

  return { spotify, apple, play, pause };
}
