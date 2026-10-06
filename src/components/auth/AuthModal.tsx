'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signInWithEmail, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const err = await signInWithEmail(email, password);
        if (err) {
          setError('Nespravny email alebo heslo');
        } else {
          onClose();
        }
      } else {
        if (nickname.length < 2) {
          setError('Prezyvka musi mat aspon 2 znaky');
          setLoading(false);
          return;
        }
        const err = await signUp(email, password, nickname);
        if (err) {
          setError(err.message);
        } else {
          onClose();
        }
      }
    } catch {
      setError('Neocakavana chyba');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Prihlasenie' : 'Registracia'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-sm text-gray-400 block mb-1">
                Prezyvka
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="input-field"
                placeholder="Tvoja prezyvka"
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm text-gray-400 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="email@priklad.sk"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Heslo</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Min. 6 znakov"
              minLength={6}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading
              ? 'Nacitavam...'
              : mode === 'login'
              ? 'Prihlasit sa'
              : 'Registrovat sa'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-gray-400 hover:text-green-400 transition-colors"
          >
            {mode === 'login'
              ? 'Nemas ucet? Registruj sa'
              : 'Mas ucet? Prihlas sa'}
          </button>
        </div>
      </div>
    </div>
  );
}
