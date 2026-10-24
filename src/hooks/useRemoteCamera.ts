'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { GameInput } from '@/lib/tracking';

export function useRemoteCamera(sessionId: string | null) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const inputRef = useRef<GameInput>({ x: 0.5, y: 0.5, confidence: 0, mode: 'camera', active: false });
  const [connected, setConnected] = useState(false);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!sessionId) return;

    const supabase = getSupabaseBrowser();
    const channel = supabase.channel(`remote-camera-${sessionId}`);

    channel
      .on('broadcast', { event: 'position' }, ({ payload }) => {
        if (payload) {
          inputRef.current = {
            x: payload.x ?? 0.5,
            y: payload.y ?? 0.5,
            confidence: payload.confidence ?? 0,
            mode: 'camera',
            active: payload.active ?? false,
          };
          lastUpdateRef.current = Date.now();
        }
      })
      .on('broadcast', { event: 'connected' }, () => {
        setConnected(true);
      })
      .subscribe();

    channelRef.current = channel;

    // Detect disconnect (no updates for 3s)
    const checkInterval = setInterval(() => {
      if (lastUpdateRef.current && Date.now() - lastUpdateRef.current > 3000) {
        inputRef.current = { ...inputRef.current, active: false, confidence: 0 };
      }
    }, 1000);

    return () => {
      clearInterval(checkInterval);
      channel.unsubscribe();
      channelRef.current = null;
      setConnected(false);
    };
  }, [sessionId]);

  const getInput = useCallback((): GameInput => inputRef.current, []);

  return { connected, getInput, inputRef };
}

// Used on the phone side to SEND positions
export function useRemoteCameraSender(sessionId: string) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const channel = supabase.channel(`remote-camera-${sessionId}`);

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({ type: 'broadcast', event: 'connected', payload: {} });
        setReady(true);
      }
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [sessionId]);

  const sendPosition = useCallback((x: number, y: number, confidence: number, active: boolean) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'position',
        payload: { x, y, confidence, active },
      });
    }
  }, []);

  return { ready, sendPosition };
}
