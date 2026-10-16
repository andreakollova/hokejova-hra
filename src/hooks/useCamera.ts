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

const isMobile = () =>
  typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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
          label: d.label || `Camera ${d.deviceId.slice(0, 8)}`,
        }));

      // On mobile, add friendly names if labels are empty
      if (isMobile() && videoDevices.length >= 2) {
        // Usually: first = front, second = back
        if (!videoDevices[0].label || videoDevices[0].label.startsWith('Camera')) {
          videoDevices[0].label = 'Front camera';
        }
        if (videoDevices.length > 1 && (!videoDevices[1].label || videoDevices[1].label.startsWith('Camera'))) {
          videoDevices[1].label = 'Back camera';
        }
      }

      // On mobile, add virtual entries for facingMode if no devices found
      if (isMobile() && videoDevices.length === 0) {
        videoDevices.push(
          { deviceId: '__front__', label: 'Front camera' },
          { deviceId: '__back__', label: 'Back camera' }
        );
      }

      setDevices(videoDevices);
      return videoDevices;
    } catch {
      setError('Failed to load cameras');
      return [];
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      // On mobile, request with facingMode to get proper permissions
      const constraints = isMobile()
        ? { video: { facingMode: 'environment' } }
        : { video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach((t) => t.stop());
      setPermission('granted');
      await enumerateDevices();
      return true;
    } catch {
      setPermission('denied');
      setError('Camera access was denied');
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
        // Build constraints based on device type
        let videoConstraints: MediaTrackConstraints;

        if (deviceId === '__back__') {
          videoConstraints = {
            facingMode: { exact: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          };
        } else if (deviceId === '__front__') {
          videoConstraints = {
            facingMode: { exact: 'user' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          };
        } else {
          // Desktop: use exact deviceId
          videoConstraints = {
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 60, min: 30 },
          };
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
        } catch {
          // Fallback: try without exact constraint
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
        }

        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
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
            devices.find((d) => d.deviceId === deviceId)?.label ||
            track.label ||
            'Camera',
        };

        setActiveCamera(info);
        setPermission('granted');
        setError(null);
        return info;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown camera error';
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
