'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { BallTracker } from '@/lib/ball-tracker';
import {
  CalibrationData,
  TrackingState,
  GameInput,
  InputMode,
} from '@/lib/tracking';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useTracker(mode: InputMode = 'camera') {
  const trackerRef = useRef<BallTracker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number>(0);
  const remoteChannelRef = useRef<RealtimeChannel | null>(null);
  const remoteSessionRef = useRef<string>('');
  const [state, setState] = useState<TrackingState>({
    position: null,
    isTracking: false,
    isPaused: false,
    quality: 'lost',
    smoothedPosition: null,
    fps: 0,
  });

  const gameInputRef = useRef<GameInput>({
    x: 0.5,
    y: 0.5,
    confidence: 0,
    mode: 'demo',
    active: false,
  });

  const getTracker = useCallback(() => {
    if (!trackerRef.current) {
      trackerRef.current = new BallTracker();
    }
    return trackerRef.current;
  }, []);

  const setCalibration = useCallback(
    (cal: CalibrationData) => {
      getTracker().setCalibration(cal);
    },
    [getTracker]
  );

  const startTracking = useCallback(
    (video: HTMLVideoElement) => {
      videoRef.current = video;

      // Stop any existing loop
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const loop = () => {
        if (videoRef.current) {
          const tracker = getTracker();
          const result = tracker.processFrame(videoRef.current);
          const trackingState = tracker.getState();
          setState(trackingState);

          if (result) {
            gameInputRef.current = {
              x: result.x,
              y: result.y,
              confidence: result.confidence,
              mode: 'camera',
              active: true,
            };
          } else {
            gameInputRef.current = {
              ...gameInputRef.current,
              confidence: 0,
              active: false,
            };
          }
        }
        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    },
    [getTracker]
  );

  const stopTracking = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const startDemo = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    gameInputRef.current = {
      x: 0.5,
      y: 0.5,
      confidence: 1,
      mode: 'demo',
      active: true,
    };
    setState({
      position: null,
      isTracking: true,
      isPaused: false,
      quality: 'good',
      smoothedPosition: null,
      fps: 60,
    });
  }, []);

  // Start receiving from remote phone camera
  const startRemote = useCallback((sessionId: string) => {
    // Stop any existing
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
    if (remoteChannelRef.current) { remoteChannelRef.current.unsubscribe(); }

    remoteSessionRef.current = sessionId;
    const supabase = getSupabaseBrowser();
    const channel = supabase.channel(`remote-camera-${sessionId}`);

    channel
      .on('broadcast', { event: 'position' }, ({ payload }) => {
        if (payload) {
          gameInputRef.current = {
            x: payload.x ?? 0.5,
            y: payload.y ?? 0.5,
            confidence: payload.confidence ?? 0,
            mode: 'remote',
            active: payload.active ?? false,
          };
        }
      })
      .subscribe();

    remoteChannelRef.current = channel;

    setState({
      position: null,
      isTracking: true,
      isPaused: false,
      quality: 'good',
      smoothedPosition: null,
      fps: 30,
    });
  }, []);

  const stopRemote = useCallback(() => {
    if (remoteChannelRef.current) {
      remoteChannelRef.current.unsubscribe();
      remoteChannelRef.current = null;
    }
    gameInputRef.current = { ...gameInputRef.current, active: false, confidence: 0 };
  }, []);

  const getGameInput = useCallback((): GameInput => {
    return gameInputRef.current;
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (remoteChannelRef.current) remoteChannelRef.current.unsubscribe();
    };
  }, []);

  return {
    tracker: trackerRef.current,
    state,
    setCalibration,
    startTracking,
    stopTracking,
    startDemo,
    startRemote,
    stopRemote,
    getGameInput,
    gameInputRef,
  };
}
