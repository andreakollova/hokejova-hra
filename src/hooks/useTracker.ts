'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { BallTracker } from '@/lib/ball-tracker';
import {
  CalibrationData,
  TrackingState,
  TrackingPoint,
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
  const [isRunning, setIsRunning] = useState(false);

  // Mouse/demo state
  const mousePos = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [demoActive, setDemoActive] = useState(false);

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

  const gameInputRef = useRef<GameInput>({
    x: 0.5,
    y: 0.5,
    confidence: 0,
    mode: 'demo',
    active: false,
  });

  const startTracking = useCallback(
    (video: HTMLVideoElement) => {
      videoRef.current = video;
      setIsRunning(true);

      const loop = () => {
        if (mode === 'camera' && videoRef.current) {
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
    [mode, getTracker]
  );

  const stopTracking = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setIsRunning(false);
  }, []);

  // Demo mode: mouse input
  const handleDemoMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>, bounds: DOMRect) => {
      if (mode !== 'demo') return;
      const x = (e.clientX - bounds.left) / bounds.width;
      const y = (e.clientY - bounds.top) / bounds.height;
      mousePos.current = {
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
      };
      gameInputRef.current = {
        x: mousePos.current.x,
        y: mousePos.current.y,
        confidence: 1,
        mode: 'demo',
        active: true,
      };
    },
    [mode]
  );

  const startDemo = useCallback(() => {
    setDemoActive(true);
    setState({
      position: null,
      isTracking: true,
      isPaused: false,
      quality: 'good',
      smoothedPosition: null,
      fps: 60,
    });
    gameInputRef.current = {
      x: 0.5,
      y: 0.5,
      confidence: 1,
      mode: 'demo',
      active: true,
    };
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
    isRunning,
    demoActive,
    setCalibration,
    startTracking,
    stopTracking,
    startDemo,
    handleDemoMouseMove,
    getGameInput,
    gameInputRef,
  };
}
