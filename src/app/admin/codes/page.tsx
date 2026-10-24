'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';

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

interface CodeRecord {
  id: number;
  code: string;
  type: string;
  max_uses: number;
  used_count: number;
  club_name: string | null;
  created_at: string;
  // From redemptions join
  assigned_to?: string;
  assigned_email?: string;
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

  // History
  const [tab, setTab] = useState<'generate' | 'history'>('generate');
  const [codes, setCodes] = useState<CodeRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; step: number } | null>(null);

  const handleLogin = () => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setAuthed(true);
      setAuthError('');
    } else {
      setAuthError('Invalid credentials');
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/list-codes?adminKey=${ADMIN_PASS}`);
      const data = await res.json();
      if (data.codes) setCodes(data.codes);
    } catch {}
    setLoadingHistory(false);
  };

  useEffect(() => {
    if (authed && tab === 'history') loadHistory();
  }, [authed, tab]);

  const handleGenerate = async () => {
    setSaving(true);
    setSaveResult('');
    const newCodes: string[] = [];
    for (let i = 0; i < codeCount; i++) {
      newCodes.push(generateCode());
    }
    try {
      const res = await fetch('/api/admin/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes: newCodes, type: codeType, clubName: clubName.trim() || null, adminKey: ADMIN_PASS }),
      });
      const data = await res.json();
      if (data.ok) {
        setGeneratedCodes(newCodes);
        setSaveResult(`${newCodes.length} code(s) generated and saved.`);
      } else {
        setSaveResult(data.error || 'Failed to save codes');
      }
    } catch {
      setSaveResult('Connection error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!deleteConfirm || deleteConfirm.id !== id) {
      setDeleteConfirm({ id, step: 1 });
      return;
    }
    if (deleteConfirm.step < 3) {
      setDeleteConfirm({ id, step: deleteConfirm.step + 1 });
      return;
    }
    // Step 3 confirmed - delete
    try {
      await fetch('/api/admin/delete-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, adminKey: ADMIN_PASS }),
      });
      setCodes(codes.filter(c => c.id !== id));
      setDeleteConfirm(null);
    } catch {}
  };

  const getDeleteLabel = (id: number) => {
    if (!deleteConfirm || deleteConfirm.id !== id) return 'Delete';
    if (deleteConfirm.step === 1) return 'Are you sure?';
    if (deleteConfirm.step === 2) return 'Really delete?';
    return 'CONFIRM DELETE';
  };

  const getDeleteStyle = (id: number) => {
    if (!deleteConfirm || deleteConfirm.id !== id) return 'text-white/30 hover:text-red-400';
    if (deleteConfirm.step === 1) return 'text-amber-400';
    if (deleteConfirm.step === 2) return 'text-red-400';
    return 'text-red-500 font-bold';
  };

  const copyAll = () => navigator.clipboard.writeText(generatedCodes.join('\n'));

  const filteredCodes = codes.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (filterStatus === 'used' && c.used_count === 0) return false;
    if (filterStatus === 'unused' && c.used_count > 0) return false;
    return true;
  });

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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-2">Code Manager</h1>
        <p className="text-white/40 text-sm mb-6">Generate and manage promo codes, club codes, and lifetime passes.</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button onClick={() => setTab('generate')} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'generate' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/50'}`}>Generate</button>
          <button onClick={() => setTab('history')} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'history' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/50'}`}>History ({codes.length})</button>
        </div>

        {tab === 'generate' && (
          <>
            {/* Code type */}
            <div className="mb-6">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Code type</label>
              <div className="flex gap-2">
                {[{ id: '1month' as const, label: '1 Month Free' }, { id: '3months' as const, label: '3 Months Free' }, { id: 'lifetime' as const, label: 'Lifetime Pass' }].map(t => (
                  <button key={t.id} onClick={() => setCodeType(t.id)} className={`flex-1 rounded-xl py-3 border-2 text-sm font-semibold transition-all ${codeType === t.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 text-white/50'}`}>{t.label}</button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div className="mb-6">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Number of codes</label>
              <div className="flex gap-2">
                {[1, 5, 10, 20, 50].map(n => (
                  <button key={n} onClick={() => setCodeCount(n)} className={`flex-1 rounded-xl py-3 border-2 text-sm font-semibold transition-all ${codeCount === n ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 text-white/50'}`}>{n}</button>
                ))}
              </div>
            </div>

            {/* Club name */}
            <div className="mb-6">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Club name (optional)</label>
              <input type="text" value={clubName} onChange={e => setClubName(e.target.value)} placeholder="e.g. HC Bratislava" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none" />
            </div>

            <button onClick={handleGenerate} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-full transition-all disabled:opacity-50 mb-6">
              {saving ? 'Generating...' : `Generate ${codeCount} ${codeType} code(s)`}
            </button>

            {saveResult && <p className="text-sm text-emerald-400 mb-4">{saveResult}</p>}

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
          </>
        )}

        {tab === 'history' && (
          <>
            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none">
                <option value="all">All types</option>
                <option value="1month">1 Month</option>
                <option value="3months">3 Months</option>
                <option value="lifetime">Lifetime</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none">
                <option value="all">All status</option>
                <option value="unused">Unused</option>
                <option value="used">Used</option>
              </select>
              <button onClick={loadHistory} className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl hover:bg-emerald-500/20 transition-all">Refresh</button>
              <span className="text-xs text-white/30 self-center ml-auto">{filteredCodes.length} codes</span>
            </div>

            {loadingHistory ? (
              <p className="text-white/30 text-sm">Loading...</p>
            ) : filteredCodes.length === 0 ? (
              <p className="text-white/30 text-sm">No codes found.</p>
            ) : (
              <div className="space-y-2">
                {filteredCodes.map(c => (
                  <div key={c.id} className={`rounded-xl p-4 border transition-all ${c.used_count > 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/3 border-white/8'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono font-bold text-white">{c.code}</code>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.type === 'lifetime' ? 'bg-amber-500/20 text-amber-400' : c.type === '3months' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {c.type === '1month' ? '1M' : c.type === '3months' ? '3M' : 'LIFE'}
                          </span>
                          {c.used_count > 0 && <span className="text-[9px] font-bold bg-white/10 text-white/60 px-2 py-0.5 rounded-full">USED</span>}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                          <span>Created: {new Date(c.created_at).toLocaleDateString()}</span>
                          {c.club_name && <span>Club: {c.club_name}</span>}
                        </div>

                        {c.assigned_to && (
                          <div className="mt-2 bg-white/5 rounded-lg px-3 py-2">
                            <div className="text-xs text-white/70">
                              <span className="font-bold text-white">{c.assigned_to}</span>
                              {c.assigned_email && <span className="text-white/40 ml-2">{c.assigned_email}</span>}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDelete(c.id)}
                        onMouseLeave={() => { if (deleteConfirm?.id === c.id && deleteConfirm.step < 3) setDeleteConfirm(null); }}
                        className={`text-[10px] transition-all px-2 py-1 rounded ${getDeleteStyle(c.id)}`}
                      >
                        {getDeleteLabel(c.id)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
