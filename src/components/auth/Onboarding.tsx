'use client';

import { useState } from 'react';
import { MASCOTS, PROFILE_COLORS, SPORTS } from '@/lib/mascots';
import Image from 'next/image';

interface OnboardingProps {
  onComplete: (profile: { sport: string; mascotId: string; color: string; username?: string }) => void;
  defaultName?: string;
}

export default function Onboarding({ onComplete, defaultName }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [sport, setSport] = useState('');
  const [mascotId, setMascotId] = useState('');
  const [color, setColor] = useState('');

  const selectedMascot = MASCOTS.find(m => m.id === mascotId);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-emerald-500' : i < step ? 'w-4 bg-emerald-500/50' : 'w-4 bg-white/10'}`} />
          ))}
        </div>

        {/* Step 0: Username */}
        {step === 0 && (
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">What should we call you?</h1>
            <p className="text-white text-sm mb-8">Pick a username for your profile and leaderboards.</p>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Your username"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-center text-lg font-bold placeholder-white/30 outline-none focus:border-emerald-500/50 mb-6"
              maxLength={20}
            />
            <button onClick={() => { if (username.trim().length >= 2) setStep(1); }} disabled={username.trim().length < 2} className="w-full py-4 rounded-full bg-emerald-500 text-white font-bold transition-all disabled:opacity-30 hover:bg-emerald-400">Next</button>
            <p className="text-xs text-white/50 mt-3">Min 2 characters. This will be visible to other players.</p>
          </div>
        )}

        {/* Step 1: Sport */}
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">What do you play?</h1>
            <p className="text-white text-sm mb-8">Select your sport</p>
            <div className="space-y-3">
              {SPORTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSport(s.id); setStep(2); }}
                  className={`w-full flex items-center gap-4 rounded-2xl p-5 border-2 transition-all text-left ${sport === s.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/8 bg-white/3 hover:border-white/15'}`}
                >
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-lg font-bold text-white">{s.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(0)} className="mt-4 text-xs text-white/30 hover:text-white/60">Back</button>
          </div>
        )}

        {/* Step 2: Mascot */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Join the crew</h1>
              <p className="text-white text-sm">Pick your character. You can always switch later.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Selected mascot - large */}
              <div className="flex-1 flex flex-col items-center justify-center">
                {mascotId ? (() => {
                  const m = MASCOTS.find(x => x.id === mascotId)!;
                  return (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{ background: 'radial-gradient(circle, #22c55e40 0%, transparent 70%)', transform: 'scale(2)' }} />
                        <Image src={m.imageHappy} alt={m.name} width={160} height={160} className="relative z-10 rounded-2xl" />
                      </div>
                      <div className="text-xl font-extrabold text-white">{m.name}</div>
                      <div className="text-sm text-emerald-400 font-bold">{m.adjective}</div>
                    </div>
                  );
                })() : (
                  <div className="w-40 h-40 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center">
                    <p className="text-white/20 text-sm">Pick one</p>
                  </div>
                )}
              </div>
              {/* Grid of all mascots */}
              <div className="sm:w-64">
                <div className="grid grid-cols-4 sm:grid-cols-3 gap-2">
                  {MASCOTS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMascotId(m.id)}
                      className={`rounded-xl p-2 border-2 transition-all flex flex-col items-center gap-1 ${mascotId === m.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/8 bg-white/3 hover:border-white/15'}`}
                    >
                      <Image src={m.image} alt={m.name} width={44} height={44} className="rounded-lg" />
                      <div className="text-[9px] font-bold text-white/60 truncate w-full text-center">{m.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-full border-2 border-white/8 text-white text-sm font-semibold transition-all hover:border-white/15">Back</button>
              <button onClick={() => { if (mascotId) setStep(3); }} disabled={!mascotId} className="flex-1 py-3.5 rounded-full bg-emerald-500 text-white text-sm font-bold transition-all disabled:opacity-30 hover:bg-emerald-400">Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Color */}
        {step === 3 && (
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Pick your color</h1>
            <p className="text-white text-sm mb-6">Your profile accent color</p>

            {/* Preview */}
            {selectedMascot && (
              <div className="mb-6 flex flex-col items-center">
                <div className="relative w-24 h-24 mb-3">
                  {/* Color glow behind mascot */}
                  <div className="absolute inset-0 rounded-full" style={{ background: color ? `radial-gradient(circle, ${color}60 0%, ${color}20 50%, transparent 70%)` : 'radial-gradient(circle, #22c55e40 0%, transparent 70%)', transform: 'scale(2)' }} />
                  {color && <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{ background: `radial-gradient(circle, ${color}40 0%, transparent 60%)`, transform: 'scale(2.2)' }} />}
                  <div className="relative z-10 w-24 h-24 rounded-full overflow-hidden border-3" style={{ borderColor: color || '#22c55e' }}>
                    <Image src={selectedMascot.imageHappy} alt={selectedMascot.name} width={96} height={96} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="text-lg font-bold text-white">{username}</div>
                <div className="text-sm font-bold" style={{ color: color || '#22c55e' }}>{selectedMascot.adjective} {selectedMascot.name}</div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-3 mb-8">
              {PROFILE_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.value)}
                  className={`rounded-2xl p-3 border-2 transition-all flex flex-col items-center gap-1.5 ${color === c.value ? 'border-white/40 bg-white/5' : 'border-white/8 bg-white/3 hover:border-white/15'}`}
                >
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: c.value, boxShadow: color === c.value ? `0 0 20px ${c.value}60` : 'none' }} />
                  <div className="text-[9px] font-bold text-white/50">{c.label}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-full border-2 border-white/8 text-white text-sm font-semibold transition-all hover:border-white/15">Back</button>
              <button onClick={() => { if (color) onComplete({ sport, mascotId, color, username: username.trim() }); }} disabled={!color} className="flex-1 py-3.5 rounded-full bg-emerald-500 text-white text-sm font-bold transition-all disabled:opacity-30 hover:bg-emerald-400">Let&apos;s go!</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
