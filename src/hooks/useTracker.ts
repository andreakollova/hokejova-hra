'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { BallTracker } from '@/lib/ball-tracker';
import {
  CalibrationData,
  TrackingState,
  GameInput,
  InputMode,
} from '@/lib/tracking';

export function useTracker(mode: InputMode = 'camera') {
  const trackerRef = useRef<BallTracker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number>(0);
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
    // Stop any camera tracking loop
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

  const getGameInput = useCallback((): GameInput => {
    return gameInputRef.current;
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    tracker: trackerRef.current,
    state,
    setCalibration,
    startTracking,
    stopTracking,
    startDemo,
    getGameInput,
    gameInputRef,
  };
}
