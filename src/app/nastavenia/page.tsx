'use client';

import { useSettings } from '@/hooks/useSettings';
import { useEngagement } from '@/hooks/useEngagement';
import Avatar from '@/components/ui/Avatar';
import StreakBadge from '@/components/ui/StreakBadge';
import XPBar from '@/components/ui/XPBar';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { CalibrationData } from '@/lib/tracking';
import { useAuth } from '@/hooks/useAuth';
import { MASCOTS, PROFILE_COLORS } from '@/lib/mascots';
import dynamic from 'next/dynamic';

const CalibrationWizard = dynamic(() => import('@/components/tracking/CalibrationWizard'), { ssr: false });

export default function NastaveniaPage() {
  const { settings, isLoggedIn, loaded, updateSettings, logout } = useSettings();
  const { data, setAvatar, getStreak, getLevelProgress, getAvatar, getProfile, setProfile, loaded: engLoaded } = useEngagement();
  const router = useRouter();
  const auth = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    const savedCal = localStorage.getItem('ballTracker_calibration') || sessionStorage.getItem('ballTracker_calibration');
    if (savedCal) { try { setCalibration(JSON.parse(savedCal)); } catch {} }
  }, []);

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

  if (showCalibration) {
    return (
      <CalibrationWizard
        onComplete={(cal) => {
          setCalibration(cal);
          setShowCalibration(false);
        }}
        onCancel={() => setShowCalibration(false)}
      />
    );
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

        {/* Profile with Mascot */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Profile</h2>
          <div className="card p-6">
            <div className="flex items-center gap-4">
              {(() => {
                const p = getProfile();
                const mascot = MASCOTS.find(m => m.id === p.mascotId);
                const mascotImg = mascot?.image || null;
                return <Avatar username={settings.username} mascotImage={mascotImg} profileColor={p.color} size="lg" />;
              })()}
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

        {/* Change Mascot */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Mascot</h2>
          <div className="card p-6">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {MASCOTS.map(m => {
                const p = getProfile();
                const isSelected = p.mascotId === m.id;
                return (
                  <button key={m.id} onClick={() => setProfile({ ...p, mascotId: m.id })}
                    className={`rounded-xl p-2 border-2 transition-all flex flex-col items-center gap-1 ${isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-300'}`}>
                    <Image src={m.image} alt={m.name} width={48} height={48} className="rounded-lg" />
                    <div className="text-[9px] font-bold text-gray-700 truncate w-full text-center">{m.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Change Color */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Profile color</h2>
          <div className="card p-6">
            <div className="flex flex-wrap gap-3">
              {PROFILE_COLORS.map(c => {
                const p = getProfile();
                const isSelected = p.color === c.value;
                return (
                  <button key={c.id} onClick={() => setProfile({ ...p, color: c.value })}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 border-2 transition-all ${isSelected ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}>
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: c.value, boxShadow: isSelected ? `0 0 16px ${c.value}50` : 'none' }} />
                    <div className="text-[9px] font-bold text-gray-500">{c.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Calibration status */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Camera calibration</h2>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${calibration ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div>
                  <p className="text-sm text-gray-700">
                    {calibration ? 'Camera is calibrated' : 'Camera is not yet calibrated'}
                  </p>
                  {calibration && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {calibration.resolution?.width}x{calibration.resolution?.height}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowCalibration(true)}
                className="text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-all"
              >
                {calibration ? 'Recalibrate' : 'Calibrate'}
              </button>
            </div>
            {calibration && (
              <button
                onClick={() => {
                  localStorage.removeItem('ballTracker_calibration');
                  sessionStorage.removeItem('ballTracker_calibration');
                  setCalibration(null);
                }}
                className="mt-4 text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Reset calibration
              </button>
            )}
          </div>
        </section>

        {/* Change Password */}
        {auth.isLoggedIn && auth.user?.app_metadata?.provider === 'email' && (
          <section className="mb-10">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Change password</h2>
            <div className="card p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                setPasswordMsg('');
                if (newPassword.length < 6) { setPasswordMsg('Password must be at least 6 characters'); return; }
                const err = await auth.updatePassword(newPassword);
                if (err) setPasswordMsg(err);
                else { setPasswordMsg('Password updated!'); setNewPassword(''); }
              }} className="flex gap-3">
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="input-field flex-1" minLength={6} required />
                <button type="submit" className="text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-all">Update</button>
              </form>
              {passwordMsg && <p className={`text-sm mt-2 ${passwordMsg.includes('updated') ? 'text-green-600' : 'text-red-500'}`}>{passwordMsg}</p>}
            </div>
          </section>
        )}

        {/* Account info */}
        {auth.isLoggedIn && auth.user?.email && (
          <section className="mb-10">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Account</h2>
            <div className="card p-6">
              <p className="text-sm text-gray-700">{auth.user.email}</p>
              <p className="text-xs text-gray-400 mt-1">Signed in via {auth.user.app_metadata?.provider || 'email'}</p>
            </div>
          </section>
        )}

        {/* Logout */}
        <section>
          <button
            onClick={async () => {
              await auth.signOut();
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
