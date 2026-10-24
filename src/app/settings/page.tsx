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

export default function SettingsPage() {
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-white">Loading...</p>
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
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-md px-6 sm:px-10 py-4 border-b border-white/5">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/dashboard">
            <Image src="/images/hb-logo-white.png" alt="Hockey Beats" width={160} height={36} className="h-8 w-auto" />
          </Link>
          <Link href="/dashboard" className="text-sm text-white hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 sm:px-10 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-10">Settings</h1>

        {/* Profile with Mascot */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Profile</h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
            <div className="flex items-center gap-4">
              {(() => {
                const p = getProfile();
                const mascot = MASCOTS.find(m => m.id === p.mascotId);
                const mascotImg = mascot?.image || null;
                return <Avatar username={settings.username} mascotImage={mascotImg} profileColor={p.color} size="lg" />;
              })()}
              <div>
                <p className="text-lg font-semibold text-white">{settings.username}</p>
                <p className="text-sm text-white">Logged in user</p>
              </div>
            </div>
          </div>
        </section>

        {/* Streak */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Streak</h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
            <div className="flex items-center justify-between mb-4">
              <StreakBadge currentStreak={streak.currentStreak} frozen={streak.frozen} />
              {streak.currentStreak > 0 && (
                <span className="text-sm text-white">{streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}</span>
              )}
            </div>
            {streak.frozen && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                <p className="text-sm text-blue-400 font-medium">Your streak is frozen</p>
                <p className="text-xs text-blue-400/60 mt-1">
                  Play for {3 - streak.consecutiveDaysAfterFreeze} more consecutive day{3 - streak.consecutiveDaysAfterFreeze !== 1 ? 's' : ''} or play 30 minutes in one session to unfreeze.
                </p>
              </div>
            )}
            {!streak.frozen && streak.currentStreak === 0 && (
              <p className="text-sm text-white">Play a game to start your streak!</p>
            )}
            {!streak.frozen && streak.currentStreak > 0 && (
              <p className="text-sm text-white">Keep it going! Play every day to grow your streak.</p>
            )}
          </div>
        </section>

        {/* XP & Level */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Level & XP</h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
            <XPBar
              level={levelInfo.level}
              xpInLevel={levelInfo.xpInLevel}
              xpNeeded={levelInfo.xpNeeded}
              progress={levelInfo.progress}
              totalXP={levelInfo.currentXP}
            />
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="text-center">
                <p className="text-xl font-bold text-white tabular-nums">{data.totalGamesPlayed || 0}</p>
                <p className="text-xs text-white">Games</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white tabular-nums">{data.totalMinutesPlayed || 0}</p>
                <p className="text-xs text-white">Minutes</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white tabular-nums">{levelInfo.currentXP.toLocaleString()}</p>
                <p className="text-xs text-white">Total XP</p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform toggle */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Platform</h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
            <p className="text-sm text-white mb-4">Select the device you train on.</p>
            <div className="flex gap-3">
              <button
                onClick={() => updateSettings({ platform: 'desktop' })}
                className={`flex-1 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  settings.platform === 'desktop'
                    ? 'bg-white text-[#0a0a0f]'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/8'
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => updateSettings({ platform: 'mobile' })}
                className={`flex-1 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  settings.platform === 'mobile'
                    ? 'bg-white text-[#0a0a0f]'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/8'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>
        </section>

        {/* Music source */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Music source</h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
            <p className="text-sm text-white mb-4">Default music source for games.</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'spotify' as const, label: 'Spotify' },
                { id: 'apple' as const, label: 'Apple Music' },
                { id: 'playlist' as const, label: 'Our Playlist' },
                { id: 'none' as const, label: 'No Music' },
              ]).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    updateSettings({ musicService: opt.id });
                    try {
                      if (opt.id === 'none') localStorage.removeItem('sportqo_music_service');
                      else localStorage.setItem('sportqo_music_service', opt.id === 'playlist' ? 'free' : opt.id);
                    } catch {}
                  }}
                  className={`py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    settings.musicService === opt.id
                      ? 'bg-white text-[#0a0a0f]'
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/8'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Change Mascot */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Mascot</h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {MASCOTS.map(m => {
                const p = getProfile();
                const isSelected = p.mascotId === m.id;
                return (
                  <button key={m.id} onClick={() => setProfile({ ...p, mascotId: m.id })}
                    className={`rounded-xl p-2 border-2 transition-all flex flex-col items-center gap-1 ${isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/8 hover:border-white/15'}`}>
                    <Image src={m.image} alt={m.name} width={48} height={48} className="rounded-lg" />
                    <div className={`text-[9px] font-bold truncate w-full text-center ${isSelected ? 'text-white' : 'text-white'}`}>{m.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Change Color */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Profile color</h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
            <div className="flex flex-wrap gap-3">
              {PROFILE_COLORS.map(c => {
                const p = getProfile();
                const isSelected = p.color === c.value;
                return (
                  <button key={c.id} onClick={() => setProfile({ ...p, color: c.value })}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 border-2 transition-all ${isSelected ? 'border-white/40 bg-white/5' : 'border-white/8 hover:border-white/15'}`}>
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: c.value, boxShadow: isSelected ? `0 0 16px ${c.value}50` : 'none' }} />
                    <div className="text-[9px] font-bold text-white">{c.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Profile privacy */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Profile privacy</h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Private profile</p>
                <p className="text-xs text-white mt-0.5">Hide your username from public leaderboards and social features. Only your mascot and score will be visible.</p>
              </div>
              <button
                onClick={() => {
                  const p = getProfile();
                  setProfile({ ...p, privateProfile: !p.privateProfile });
                }}
                className={`relative w-11 h-6 rounded-full transition-colors ${getProfile().privateProfile ? 'bg-emerald-500' : 'bg-white/15'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${getProfile().privateProfile ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            {getProfile().isMinor && (
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 mt-3">
                Because your account was created as a player aged 13-15, private profile is enabled by default to protect your privacy.
              </p>
            )}
          </div>
        </section>

        {/* Calibration status */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Camera calibration</h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${calibration ? 'bg-emerald-500' : 'bg-white/20'}`} />
                <div>
                  <p className="text-sm text-white">
                    {calibration ? 'Camera is calibrated' : 'Camera is not yet calibrated'}
                  </p>
                  {calibration && (
                    <p className="text-xs text-white mt-0.5">
                      {calibration.resolution?.width}x{calibration.resolution?.height}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowCalibration(true)}
                className="text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-xl transition-all"
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
                className="mt-4 text-sm text-white hover:text-red-400 transition-colors"
              >
                Reset calibration
              </button>
            )}
          </div>
        </section>

        {/* Change Password */}
        {auth.isLoggedIn && auth.user?.app_metadata?.provider === 'email' && (
          <section className="mb-10">
            <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Change password</h2>
            <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                setPasswordMsg('');
                if (newPassword.length < 6) { setPasswordMsg('Password must be at least 6 characters'); return; }
                const err = await auth.updatePassword(newPassword);
                if (err) setPasswordMsg(err);
                else { setPasswordMsg('Password updated!'); setNewPassword(''); }
              }} className="flex gap-3">
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-emerald-500/50" minLength={6} required />
                <button type="submit" className="text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-xl transition-all">Update</button>
              </form>
              {passwordMsg && <p className={`text-sm mt-2 ${passwordMsg.includes('updated') ? 'text-emerald-400' : 'text-red-400'}`}>{passwordMsg}</p>}
            </div>
          </section>
        )}

        {/* Account info */}
        {auth.isLoggedIn && auth.user?.email && (
          <section className="mb-10">
            <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Account</h2>
            <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
              <p className="text-sm text-white">{auth.user.email}</p>
              <p className="text-xs text-white mt-1">Signed in via {auth.user.app_metadata?.provider || 'email'}</p>
            </div>
          </section>
        )}

        {/* Subscription Management */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Subscription</h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Manage your subscription</p>
                <p className="text-xs text-white mt-0.5">View billing history, update payment method, or cancel your subscription.</p>
              </div>
              <button
                onClick={async () => {
                  const email = auth.user?.email;
                  if (!email) { alert('Please sign in with email to manage your subscription.'); return; }
                  try {
                    const res = await fetch('/api/subscription/portal', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                    else alert(data.error || 'No active subscription found.');
                  } catch { alert('Connection error'); }
                }}
                className="text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-xl transition-all"
              >
                Manage
              </button>
            </div>
          </div>
        </section>

        {/* Club Membership */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Club membership</h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
            <p className="text-xs text-white mb-3">Enter a club code from your team or organization to unlock Premium and connect with teammates.</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
              const code = input.value.trim();
              if (!code) return;
              try {
                const res = await fetch('/api/club/redeem', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ code, username: settings.username }),
                });
                const data = await res.json();
                if (data.ok) {
                  localStorage.setItem('hb_subscription', JSON.stringify({ type: 'club', clubName: data.clubName, expiresAt: data.expiresAt, activatedAt: new Date().toISOString() }));
                  if (data.teammates?.length > 0) {
                    try {
                      const existing = JSON.parse(localStorage.getItem('hb_friends') || '[]');
                      const existingNames = new Set(existing.map((f: any) => f.username));
                      for (const t of data.teammates) {
                        if (!existingNames.has(t)) {
                          existing.push({ username: t, online: false, lastPlayed: 'Teammate', totalTime: '', lastSong: '', lastGame: '', pending: false, incoming: false });
                        }
                      }
                      localStorage.setItem('hb_friends', JSON.stringify(existing));
                    } catch {}
                  }
                  alert(`Welcome to ${data.clubName}! Premium unlocked.`);
                  window.location.reload();
                } else {
                  alert(data.error || 'Invalid code');
                }
              } catch { alert('Connection error'); }
            }} className="flex gap-2">
              <input type="text" placeholder="Enter club code (e.g. HB-XXXX-XXXX)" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-emerald-500/50" />
              <button type="submit" className="text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-xl transition-all">Redeem</button>
            </form>
          </div>
        </section>

        {/* Connected services */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Connected services</h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Spotify</p>
                <p className="text-xs text-white mt-0.5">Music playback and history</p>
              </div>
              <button
                onClick={async () => {
                  if (!confirm('Disconnect Spotify and delete all music history?')) return;
                  await fetch('/api/disconnect-spotify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: settings.username }) });
                  localStorage.removeItem('sportqo_music_history');
                  alert('Spotify disconnected and music data deleted.');
                }}
                className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all"
              >
                Disconnect
              </button>
            </div>
            <div className="border-t border-white/5 pt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Apple Music</p>
                <p className="text-xs text-white mt-0.5">Music playback and history</p>
              </div>
              <button
                onClick={async () => {
                  if (!confirm('Disconnect Apple Music and delete all music history?')) return;
                  await fetch('/api/disconnect-spotify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: settings.username }) });
                  localStorage.removeItem('sportqo_music_history');
                  localStorage.removeItem('sportqo_music_service');
                  alert('Apple Music disconnected and music data deleted.');
                }}
                className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all"
              >
                Disconnect
              </button>
            </div>
          </div>
        </section>

        {/* Cookie preferences */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Cookie preferences</h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Analytics & visit tracking</p>
                <p className="text-xs text-white mt-0.5">
                  {typeof window !== 'undefined' && localStorage.getItem('hb_cookie_consent') === 'accepted' ? 'Accepted' : 'Essential only'}
                </p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('hb_cookie_consent');
                  window.location.reload();
                }}
                className="text-xs font-medium text-white hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
              >
                Reset preferences
              </button>
            </div>
            <p className="text-xs text-white mt-3">Read our <a href="/cookies" className="underline hover:text-white">Cookie Policy</a>.</p>
          </div>
        </section>

        {/* Data retention info */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Your data</h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-6 space-y-2">
            <p className="text-xs text-white">Page visit logs are automatically deleted after <strong className="text-white">90 days</strong>.</p>
            <p className="text-xs text-white">Game scores and achievements are kept as long as your account exists.</p>
            <p className="text-xs text-white">You can delete all your data at any time using the button below.</p>
          </div>
        </section>

        {/* Logout */}
        <section className="mb-6">
          <button
            onClick={async () => {
              await auth.signOut();
              logout();
              router.push('/');
            }}
            className="w-full py-3.5 rounded-full border-2 border-white/8 text-white text-sm font-semibold transition-all hover:border-white/15 text-center"
          >
            Log out
          </button>
        </section>

        {/* Delete account */}
        <section className="mb-10">
          <button
            onClick={async () => {
              if (!confirm('Are you sure? This will permanently delete all your data including scores, achievements, friends, and music history. This cannot be undone.')) return;
              if (!confirm('This is irreversible. Delete everything?')) return;
              await fetch('/api/account', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: settings.username, userId: auth.user?.id }) });
              localStorage.clear();
              await auth.signOut();
              window.location.href = '/';
            }}
            className="w-full text-center text-sm text-red-400/60 hover:text-red-400 py-3 transition-colors"
          >
            Delete my account and all data
          </button>
        </section>
      </main>
    </div>
  );
}
