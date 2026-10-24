'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  displayName: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, session: null, loading: true, displayName: '' });

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null;
      setState({ user, session, loading: false, displayName: getDisplayName(user) });
      if (user) syncToLegacySettings(user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setState({ user, session, loading: false, displayName: getDisplayName(user) });
      if (user) syncToLegacySettings(user);
      else clearLegacySettings();
    });
    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await getSupabaseBrowser().auth.signInWithPassword({ email, password });
    return error?.message || null;
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await getSupabaseBrowser().auth.signUp({
      email, password,
      options: { data: { display_name: name }, emailRedirectTo: window.location.origin + '/auth/callback?next=/dashboard' },
    });
    return error?.message || null;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await getSupabaseBrowser().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback?next=/dashboard' },
    });
  }, []);

  const signInWithApple = useCallback(async () => {
    await getSupabaseBrowser().auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin + '/auth/callback?next=/dashboard' },
    });
  }, []);

  const signOut = useCallback(async () => {
    const username = state.displayName;
    await getSupabaseBrowser().auth.signOut();
    clearLegacySettings();
    if (username) fetch('/api/slack-notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'logout', username }) }).catch(() => {});
  }, [state.displayName]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await getSupabaseBrowser().auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/callback?next=/nastavenia',
    });
    return error?.message || null;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await getSupabaseBrowser().auth.updateUser({ password: newPassword });
    return error?.message || null;
  }, []);

  return {
    user: state.user, session: state.session, loading: state.loading,
    isLoggedIn: !!state.user, displayName: state.displayName,
    signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple,
    signOut, resetPassword, updatePassword,
  };
}

function getDisplayName(user: User | null): string {
  if (!user) return '';
  return user.user_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
}

function syncToLegacySettings(user: User) {
  try {
    const name = getDisplayName(user);
    const raw = localStorage.getItem('sportqo_user_settings');
    const existing = raw ? JSON.parse(raw) : {};
    localStorage.setItem('sportqo_user_settings', JSON.stringify({ ...existing, loggedIn: true, username: name }));
    document.cookie = 'hb_username=' + name + '; path=/; max-age=' + (60 * 60 * 24 * 365);
    fetch('/api/slack-notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'login', username: name }) }).catch(() => {});
  } catch {}
}

function clearLegacySettings() {
  try {
    const raw = localStorage.getItem('sportqo_user_settings');
    const existing = raw ? JSON.parse(raw) : {};
    localStorage.setItem('sportqo_user_settings', JSON.stringify({ ...existing, loggedIn: false, username: '' }));
    document.cookie = 'hb_username=; path=/; max-age=0';
  } catch {}
}
