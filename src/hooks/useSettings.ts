'use client';

import { useState, useEffect, useCallback } from 'react';
import { SpotifyTrack } from '@/lib/spotify';

const STORAGE_KEY = 'sportqo_user_settings';

const HARDCODED_USERNAME = 'andrea';
const HARDCODED_PASSWORD = 'andrea';

export interface UserSettings {
  loggedIn: boolean;
  username: string;
  platform: 'desktop' | 'mobile';
  musicService: 'spotify' | 'apple';
  calibrationData: Record<string, unknown> | null;
  favoriteTrackIds: string[];
  lastTrack: SpotifyTrack | null;
}

const defaultSettings: UserSettings = {
  loggedIn: false,
  username: '',
  platform: 'desktop',
  musicService: 'spotify',
  calibrationData: null,
  favoriteTrackIds: [],
  lastTrack: null,
};

function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

function saveSettings(settings: UserSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage full or unavailable
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setLoaded(true);
  }, []);

  const persist = useCallback((next: UserSettings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const updateSettings = useCallback(
    (partial: Partial<UserSettings>) => {
      const next = { ...settings, ...partial };
      persist(next);
    },
    [settings, persist],
  );

  const login = useCallback(
    (username: string, password: string): string | null => {
      if (
        username.toLowerCase() === HARDCODED_USERNAME &&
        password === HARDCODED_PASSWORD
      ) {
        const next: UserSettings = {
          ...settings,
          loggedIn: true,
          username: username.toLowerCase(),
        };
        persist(next);
        return null; // success
      }
      return 'Nespravne meno alebo heslo';
    },
    [settings, persist],
  );

  const logout = useCallback(() => {
    const next: UserSettings = { ...defaultSettings };
    persist(next);
  }, [persist]);

  return {
    settings,
    isLoggedIn: loaded ? settings.loggedIn : false,
    loaded,
    updateSettings,
    login,
    logout,
  };
}
