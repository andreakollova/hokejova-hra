'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export interface CameraInfo {
  width: number;
  height: number;
  fps: number;
  deviceId: string;
  label: string;
}

export function useCamera() {
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [activeCamera, setActiveCamera] = useState<CameraInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const enumerateDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices
        .filter((d) => d.kind === 'videoinput')
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Kamera ${d.deviceId.slice(0, 8)}`,
        }));
      setDevices(videoDevices);
      return videoDevices;
    } catch {
      setError('Nepodarilo sa načítať kamery');
      return [];
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermission('granted');
      await enumerateDevices();
      return true;
    } catch {
      setPermission('denied');
      setError('Prístup ku kamere bol zamietnutý');
      return false;
    }
  }, [enumerateDevices]);

  const startCamera = useCallback(
    async (deviceId: string, video: HTMLVideoElement) => {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 60, min: 30 },
          },
        });

        video.srcObject = stream;
        await video.play();
        streamRef.current = stream;
        videoRef.current = video;

        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();

        const info: CameraInfo = {
          width: settings.width || video.videoWidth,
          height: settings.height || video.videoHeight,
          fps: settings.frameRate || 30,
          deviceId,
          label:
            devices.find((d) => d.deviceId === deviceId)?.label || 'Kamera',
        };

        setActiveCamera(info);
        setPermission('granted');
        setError(null);
        return info;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Neznáma chyba kamery';
        setError(msg);
        return null;
      }
    },
    [devices]
  );

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActiveCamera(null);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    devices,
    activeCamera,
    error,
    permission,
    requestPermission,
    enumerateDevices,
    startCamera,
    stopCamera,
  };
}
