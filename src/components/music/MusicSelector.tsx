'use client';

import { useState, useRef, useCallback } from 'react';
import { SpotifyTrack, BeatMap } from '@/lib/spotify';

export interface MusicConfig {
  mode: 'spotify' | 'tap' | 'metronome';
  bpm: number;
  beatMap?: BeatMap;
  track?: SpotifyTrack;
}

interface MusicSelectorProps {
  onSelect: (config: MusicConfig) => void;
  onCancel: () => void;
  spotify: ReturnType<typeof import('@/hooks/useSpotify').useSpotify>;
}

export default function MusicSelector({ onSelect, onCancel, spotify }: MusicSelectorProps) {
  const [tab, setTab] = useState<'spotify' | 'manual'>('spotify');
  const [searchQuery, setSearchQuery] = useState('');
  const [manualBpm, setManualBpm] = useState(100);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [tapBpm, setTapBpm] = useState<number | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      spotify.search(q);
    }, 400);
  };

  const handleSelectTrack = async (track: SpotifyTrack) => {
    await spotify.selectTrack(track);
  };

  const handleConfirmSpotify = () => {
    if (!spotify.currentTrack || !spotify.beatMap) return;
    onSelect({
      mode: 'spotify',
      bpm: spotify.beatMap.tempo,
      beatMap: spotify.beatMap,
      track: spotify.currentTrack,
    });
  };

  const handleTap = () => {
    const now = performance.now();
    setTapTimes((prev) => {
      const times = [...prev, now].slice(-8);
      if (times.length >= 2) {
        const intervals = [];
        for (let i = 1; i < times.length; i++) {
          intervals.push(times[i] - times[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const bpm = Math.round(60000 / avgInterval);
        setTapBpm(Math.max(40, Math.min(220, bpm)));
      }
      return times;
    });
  };

  const handleConfirmManual = () => {
    const bpm = tapBpm || manualBpm;
    onSelect({
      mode: tapBpm ? 'tap' : 'metronome',
      bpm,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 px-6 py-8">
      <div className="max-w-lg mx-auto">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Späť
        </button>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
          Beat mód
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Miešaj loptičku do rytmu hudby. Kužele prichádzajú presne na doby.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab('spotify')}
            className={`flex-1 rounded-2xl py-3 text-sm font-semibold transition-all border-2 ${
              tab === 'spotify'
                ? 'border-green-500 bg-green-50 text-green-600'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            Spotify
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 rounded-2xl py-3 text-sm font-semibold transition-all border-2 ${
              tab === 'manual'
                ? 'border-green-500 bg-green-50 text-green-600'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            Vlastné tempo
          </button>
        </div>

        {tab === 'spotify' && (
          <div className="space-y-5">
            {!spotify.isConnected ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4 text-sm">
                  Pripoj Spotify Premium pre prehrávanie pesničiek priamo v appke.
                </p>
                <button onClick={spotify.connect} className="btn-primary">
                  Pripojiť Spotify
                </button>
                <p className="text-xs text-gray-400 mt-3">Vyžaduje Spotify Premium</p>
              </div>
            ) : (
              <>
                {/* Search */}
                <div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="input-field"
                    placeholder="Hľadať pesničku..."
                  />
                </div>

                {/* SDK status */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className={`w-2 h-2 rounded-full ${spotify.isReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                  {spotify.isReady ? 'Prehrávač pripravený' : 'Pripájam prehrávač...'}
                </div>

                {/* Search results */}
                {spotify.searching && (
                  <div className="text-center text-gray-400 text-sm py-4">Hľadám...</div>
                )}

                {spotify.searchResults.length > 0 && (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {spotify.searchResults.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => handleSelectTrack(track)}
                        className={`w-full flex items-center gap-3 rounded-2xl p-3 text-left transition-all ${
                          spotify.currentTrack?.id === track.id
                            ? 'bg-green-50 border-2 border-green-500'
                            : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {track.albumArt && (
                          <img
                            src={track.albumArt}
                            alt=""
                            className="w-11 h-11 rounded-xl object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {track.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {track.artists}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {Math.floor(track.durationMs / 60000)}:{String(Math.floor((track.durationMs % 60000) / 1000)).padStart(2, '0')}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected track info */}
                {spotify.currentTrack && spotify.beatMap && (
                  <div className="card p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      {spotify.currentTrack.albumArt && (
                        <img
                          src={spotify.currentTrack.albumArt}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {spotify.currentTrack.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {spotify.currentTrack.artists}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Tempo: </span>
                        <span className="text-green-600 font-bold">{spotify.beatMap.tempo} BPM</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Beaty: </span>
                        <span className="text-gray-900">{spotify.beatMap.beats.length}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleConfirmSpotify}
                      disabled={!spotify.isReady}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      Hrať so Spotify
                    </button>
                  </div>
                )}

                <button
                  onClick={spotify.disconnect}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Odpojiť Spotify
                </button>
              </>
            )}
          </div>
        )}

        {tab === 'manual' && (
          <div className="space-y-6">
            {/* Tap tempo */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Pusti si pesničku na mobile a klepaj na tlačidlo v rytme.
              </p>
              <button
                onClick={handleTap}
                className="w-32 h-32 rounded-full bg-white border-4 border-gray-200 hover:border-green-500/50 active:scale-95 active:bg-green-50 transition-all flex flex-col items-center justify-center mx-auto shadow-sm"
              >
                <span className="text-2xl font-bold text-gray-900">
                  {tapBpm || '---'}
                </span>
                <span className="text-xs text-gray-400 mt-1">BPM</span>
              </button>
              <p className="text-xs text-gray-400 mt-3">
                Klepni aspoň 4x na beat pesničky
              </p>
              {tapTimes.length > 0 && (
                <button
                  onClick={() => { setTapTimes([]); setTapBpm(null); }}
                  className="text-xs text-gray-400 hover:text-gray-600 mt-2"
                >
                  Resetovať
                </button>
              )}
            </div>

            {/* Or manual slider */}
            <div className="card p-5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
                Alebo nastav manuálne
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={tapBpm || manualBpm}
                  onChange={(e) => {
                    setManualBpm(parseInt(e.target.value));
                    setTapBpm(null);
                    setTapTimes([]);
                  }}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-gray-900 tabular-nums w-16 text-right">
                  {tapBpm || manualBpm}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>60 - pomalé</span>
                <span>180 - rýchle</span>
              </div>
            </div>

            <button
              onClick={handleConfirmManual}
              className="btn-primary w-full"
            >
              Hrať s tempom {tapBpm || manualBpm} BPM
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
