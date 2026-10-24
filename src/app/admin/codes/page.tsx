'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';

const ADMIN_USER = 'andreakollova';
const ADMIN_PASS = 'kAe9kRW1JOZB';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'HB-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += '-';
  }
  return code;
}

export default function AdminCodesPage() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [authError, setAuthError] = useState('');

  // Code generation
  const [codeType, setCodeType] = useState<'1month' | '3months' | 'lifetime'>('1month');
  const [codeCount, setCodeCount] = useState(1);
  const [clubName, setClubName] = useState('');
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState('');

  const handleLogin = () => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setAuthed(true);
      setAuthError('');
    } else {
      setAuthError('Invalid credentials');
    }
  };

  const handleGenerate = async () => {
    setSaving(true);
    setSaveResult('');
    const codes: string[] = [];
    for (let i = 0; i < codeCount; i++) {
      codes.push(generateCode());
    }

    // Save to Supabase promo_codes table
    try {
      const res = await fetch('/api/admin/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codes,
          type: codeType,
          clubName: clubName.trim() || null,
          adminKey: ADMIN_PASS,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setGeneratedCodes(codes);
        setSaveResult(`${codes.length} code(s) generated and saved.`);
      } else {
        setSaveResult(data.error || 'Failed to save codes');
      }
    } catch {
      setSaveResult('Connection error');
    }
    setSaving(false);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(generatedCodes.join('\n'));
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="max-w-sm w-full">
          <h1 className="text-2xl font-extrabold text-white mb-6 text-center">Admin Login</h1>
          <div className="space-y-3">
            <input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="Username" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none" />
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button onClick={handleLogin} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-full transition-all">Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-2">Code Generator</h1>
        <p className="text-white/40 text-sm mb-8">Generate promo codes, club codes, and lifetime passes.</p>

        {/* Code type */}
        <div className="mb-6">
          <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Code type</label>
          <div className="flex gap-2">
            {[
              { id: '1month' as const, label: '1 Month Free' },
              { id: '3months' as const, label: '3 Months Free' },
              { id: 'lifetime' as const, label: 'Lifetime Pass' },
            ].map(t => (
              <button key={t.id} onClick={() => setCodeType(t.id)}
                className={`flex-1 rounded-xl py-3 border-2 text-sm font-semibold transition-all ${codeType === t.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 text-white/50'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="mb-6">
          <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Number of codes</label>
          <div className="flex gap-2">
            {[1, 5, 10, 20, 50].map(n => (
              <button key={n} onClick={() => setCodeCount(n)}
                className={`flex-1 rounded-xl py-3 border-2 text-sm font-semibold transition-all ${codeCount === n ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 text-white/50'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Club name (optional) */}
        <div className="mb-6">
          <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Club name (optional)</label>
          <input type="text" value={clubName} onChange={e => setClubName(e.target.value)} placeholder="e.g. HC Bratislava" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none" />
        </div>

        {/* Generate */}
        <button onClick={handleGenerate} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-full transition-all disabled:opacity-50 mb-6">
          {saving ? 'Generating...' : `Generate ${codeCount} ${codeType} code(s)`}
        </button>

        {saveResult && <p className="text-sm text-emerald-400 mb-4">{saveResult}</p>}

        {/* Generated codes */}
        {generatedCodes.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold">Generated Codes</h2>
              <button onClick={copyAll} className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-all">Copy all</button>
            </div>
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {generatedCodes.map((code, i) => (
                <div key={i} className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2">
                  <code className="text-sm font-mono text-white/80">{code}</code>
                  <button onClick={() => navigator.clipboard.writeText(code)} className="text-[10px] text-white/30 hover:text-white/60">Copy</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
