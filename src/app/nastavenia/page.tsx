'use client';

import { useSettings } from '@/hooks/useSettings';
import { useEngagement } from '@/hooks/useEngagement';
import Avatar from '@/components/ui/Avatar';
import StreakBadge from '@/components/ui/StreakBadge';
import XPBar from '@/components/ui/XPBar';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function NastaveniaPage() {
  const { settings, isLoggedIn, loaded, updateSettings, logout } = useSettings();
  const { data, setAvatar, getStreak, getLevelProgress, getAvatar, loaded: engLoaded } = useEngagement();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!loaded || !engLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    router.push('/');
    return null;
  }

  const streak = getStreak();
  const levelInfo = getLevelProgress();
  const avatar = getAvatar();

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 sm:px-10 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/dashboard">
            <Image src="/images/hb-logo-hero-dark.png" alt="Hockey Beats" width={130} height={30} className="h-6 w-auto" />
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 sm:px-10 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">Settings</h1>

        {/* Profile with Avatar */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Profile</h2>
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar username={settings.username} photoUrl={avatar} size="lg" />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{settings.username}</p>
                <p className="text-sm text-gray-400">Logged in user</p>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-all"
                  >
                    {avatar ? 'Change photo' : 'Upload photo'}
                  </button>
                  {avatar && (
                    <button
                      onClick={() => setAvatar(null)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Streak */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Streak</h2>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <StreakBadge currentStreak={streak.currentStreak} frozen={streak.frozen} />
              {streak.currentStreak > 0 && (
                <span className="text-sm text-gray-400">{streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}</span>
              )}
            </div>
            {streak.frozen && (
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-sm text-blue-700 font-medium">Your streak is frozen</p>
                <p className="text-xs text-blue-500 mt-1">
                  Play for {3 - streak.consecutiveDaysAfterFreeze} more consecutive day{3 - streak.consecutiveDaysAfterFreeze !== 1 ? 's' : ''} or play 30 minutes in one session to unfreeze.
                </p>
              </div>
            )}
            {!streak.frozen && streak.currentStreak === 0 && (
              <p className="text-sm text-gray-400">Play a game to start your streak!</p>
            )}
            {!streak.frozen && streak.currentStreak > 0 && (
              <p className="text-sm text-gray-400">Keep it going! Play every day to grow your streak.</p>
            )}
          </div>
        </section>

        {/* XP & Level */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Level & XP</h2>
          <div className="card p-6">
            <XPBar
              level={levelInfo.level}
              xpInLevel={levelInfo.xpInLevel}
              xpNeeded={levelInfo.xpNeeded}
              progress={levelInfo.progress}
              totalXP={levelInfo.currentXP}
            />
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 tabular-nums">{data.totalGamesPlayed || 0}</p>
                <p className="text-xs text-gray-400">Games</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 tabular-nums">{data.totalMinutesPlayed || 0}</p>
                <p className="text-xs text-gray-400">Minutes</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 tabular-nums">{levelInfo.currentXP.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Total XP</p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform toggle */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Platform</h2>
          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-4">Select the device you train on.</p>
            <div className="flex gap-3">
              <button
                onClick={() => updateSettings({ platform: 'desktop' })}
                className={`flex-1 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  settings.platform === 'desktop'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => updateSettings({ platform: 'mobile' })}
                className={`flex-1 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  settings.platform === 'mobile'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>
        </section>

        {/* Music service */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Music service</h2>
          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-4">Default service for Beat mode.</p>
            <div className="flex gap-3">
              <button
                onClick={() => updateSettings({ musicService: 'spotify' })}
                className={`flex-1 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  settings.musicService === 'spotify'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Spotify
              </button>
              <button
                onClick={() => updateSettings({ musicService: 'apple' })}
                className={`flex-1 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  settings.musicService === 'apple'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Apple Music
              </button>
            </div>
          </div>
        </section>

        {/* Calibration status */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Camera calibration</h2>
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  settings.calibrationData ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <p className="text-sm text-gray-700">
                {settings.calibrationData
                  ? 'Camera is calibrated'
                  : 'Camera is not yet calibrated'}
              </p>
            </div>
            {settings.calibrationData && (
              <button
                onClick={() => updateSettings({ calibrationData: null })}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Reset calibration
              </button>
            )}
          </div>
        </section>

        {/* Logout */}
        <section>
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="btn-secondary w-full text-center"
          >
            Log out
          </button>
        </section>
      </main>
    </div>
  );
}
