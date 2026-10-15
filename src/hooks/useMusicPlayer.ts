'use client';

import { useCallback, useRef } from 'react';
import { SpotifyTrack } from '@/lib/spotify';
import { useSpotify } from './useSpotify';
import { useAppleMusic } from './useAppleMusic';

// Unified music player that works with both Spotify and Apple Music
export function useMusicPlayer() {
  const spotify = useSpotify();
  const apple = useAppleMusic();
  const lastServiceRef = useRef<'spotify' | 'apple'>('spotify');

  const play = useCallback(async (track: SpotifyTrack) => {
    // Determine which service based on track ID prefix
    if (track.id.startsWith('am_')) {
      lastServiceRef.current = 'apple';
      await apple.play(track);
    } else {
      lastServiceRef.current = 'spotify';
      await spotify.play(track);
    }
  }, [spotify, apple]);

  const pause = useCallback(async () => {
    if (lastServiceRef.current === 'apple') {
      await apple.pause();
    } else {
      await spotify.pause();
    }
  }, [spotify, apple]);

  return { spotify, apple, play, pause };
}
