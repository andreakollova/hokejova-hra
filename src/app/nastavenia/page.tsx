'use client';

import { useSettings } from '@/hooks/useSettings';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function NastaveniaPage() {
  const { settings, isLoggedIn, loaded, updateSettings, logout } = useSettings();
  const router = useRouter();

  if (!loaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400">Nacitavam...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 sm:px-10 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image src="/images/logo-sportqo.png" alt="sportqo" width={120} height={32} className="h-8 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Domov
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 sm:px-10 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">Nastavenia</h1>

        {/* Username */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Profil</h2>
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                {settings.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{settings.username}</p>
                <p className="text-sm text-gray-400">Prihlaseny uzivatel</p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform toggle */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Platforma</h2>
          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-4">Vyber zariadenie, na ktorom trenujes.</p>
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
                Mobil
              </button>
            </div>
          </div>
        </section>

        {/* Music service */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Hudobna sluzba</h2>
          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-4">Predvolena sluzba pre Beat mod.</p>
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
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Kalibracia kamery</h2>
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  settings.calibrationData ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <p className="text-sm text-gray-700">
                {settings.calibrationData
                  ? 'Kamera je kalibrovaná'
                  : 'Kamera zatial nie je kalibrovaná'}
              </p>
            </div>
            {settings.calibrationData && (
              <button
                onClick={() => updateSettings({ calibrationData: null })}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Resetovat kalibraciu
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
            Odhlasit sa
          </button>
        </section>
      </main>
    </div>
  );
}
