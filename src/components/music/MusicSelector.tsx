'use client';

import { useState, useRef, useEffect } from 'react';
import { SpotifyTrack, BeatMap } from '@/lib/spotify';

export interface MusicConfig {
  mode: 'spotify' | 'tap' | 'metronome';
  bpm: number;
  beatMap?: BeatMap;
  track?: SpotifyTrack;
}

interface SavedBeatMap {
  id: string;
  spotify_track_id: string;
  track_name: string;
  track_artist: string;
  track_album_art: string;
  track_duration_ms: number;
  bpm: number;
  beats: number[];
}

// 5 BPM templates for songs without admin beat maps
const BPM_TEMPLATES = [80, 100, 120, 140, 160];

function generateBeatsForBpm(bpm: number, durationS: number): number[] {
  const interval = 60 / bpm;
  const beats: number[] = [];
  for (let t = interval; t < durationS; t += interval) {
    beats.push(Math.round(t * 100) / 100);
  }
  return beats;
}

function closestBpm(target: number): number {
  return BPM_TEMPLATES.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  );
}

interface MusicSelectorProps {
  onSelect: (config: MusicConfig) => void;
  onCancel: () => void;
  spotify: ReturnType<typeof import('@/hooks/useSpotify').useSpotify>;
}

export default function MusicSelector({ onSelect, onCancel, spotify }: MusicSelectorProps) {
  const [tab, setTab] = useState<'songs' | 'search' | 'manual'>('songs');
  const [availableSongs, setAvailableSongs] = useState<SavedBeatMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBpm, setSelectedBpm] = useState(120);
  const [manualBpm, setManualBpm] = useState(100);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [tapBpm, setTapBpm] = useState<number | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Track IDs that have admin beat maps
  const [mappedIds, setMappedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/beats');
      const data = await res.json();
      if (data.beatMaps) {
        setAvailableSongs(data.beatMaps);
        setMappedIds(new Set(data.beatMaps.map((b: SavedBeatMap) => b.spotify_track_id)));
      }
    } catch {}
    setLoading(false);
  };

  // Select song WITH admin beat map (perfect sync)
  const handleSelectMapped = (song: SavedBeatMap) => {
    onSelect({
      mode: 'spotify',
      bpm: song.bpm,
      beatMap: {
        tempo: song.bpm,
        beats: song.beats,
        bars: [],
        sections: [],
        durationS: song.track_duration_ms / 1000,
      },
      track: {
        id: song.spotify_track_id,
        name: song.track_name,
        artists: song.track_artist,
        album: '',
        albumArt: song.track_album_art,
        durationMs: song.track_duration_ms,
        uri: `spotify:track:${song.spotify_track_id}`,
      },
    });
  };

  // Select ANY song with auto-generated BPM template
  const handleSelectAny = (track: SpotifyTrack) => {
    // Check if this track has an admin beat map
    const mapped = availableSongs.find(s => s.spotify_track_id === track.id);
    if (mapped) {
      handleSelectMapped(mapped);
      return;
    }

    const bpm = selectedBpm;
    const durationS = track.durationMs / 1000;
    const beats = generateBeatsForBpm(bpm, durationS);

    onSelect({
      mode: 'spotify',
      bpm,
      beatMap: { tempo: bpm, beats, bars: [], sections: [], durationS },
      track,
    });
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => spotify.search(q), 400);
  };

  const handleTap = () => {
    const now = performance.now();
    setTapTimes((prev) => {
      const times = [...prev, now].slice(-8);
      if (times.length >= 2) {
        const intervals = [];
        for (let i = 1; i < times.length; i++) intervals.push(times[i] - times[i - 1]);
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        setTapBpm(Math.max(40, Math.min(220, Math.round(60000 / avgInterval))));
      }
      return times;
    });
  };

  const handleConfirmManual = () => {
    const bpm = tapBpm || manualBpm;
    onSelect({ mode: tapBpm ? 'tap' : 'metronome', bpm });
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
          Spat
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Beat mod</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Miesaj lopticku do rytmu hudby.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab('songs')}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all ${
              tab === 'songs' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Pesnicky ({availableSongs.length})
          </button>
          <button
            onClick={() => setTab('search')}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all ${
              tab === 'search' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Spotify
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all ${
              tab === 'manual' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Tempo
          </button>
        </div>

        {/* Tab: Admin-mapped songs (perfect sync) */}
        {tab === 'songs' && (
          <div className="space-y-4">
            {!spotify.isConnected && (
              <div className="card p-5 text-center space-y-3">
                <p className="text-sm text-gray-500">Pripoj Spotify Premium pre prehravanie.</p>
                <button onClick={spotify.connect} className="btn-primary text-sm">Pripojit Spotify</button>
              </div>
            )}

            {loading ? (
              <div className="text-center text-gray-400 text-sm py-8">Nacitavam...</div>
            ) : availableSongs.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">Zatial ziadne pesnicky s beat mapou.</div>
            ) : (
              <div className="space-y-2">
                {availableSongs.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => handleSelectMapped(song)}
                    className="w-full flex items-center gap-3 rounded-2xl p-4 text-left bg-white border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    {song.track_album_art && (
                      <img src={song.track_album_art} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{song.track_name}</div>
                      <div className="text-xs text-gray-500 truncate">{song.track_artist}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 tabular-nums">{song.bpm}</div>
                      <div className="text-xs text-gray-400">BPM</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Spotify search (any song, BPM template) */}
        {tab === 'search' && (
          <div className="space-y-5">
            {!spotify.isConnected ? (
              <div className="card p-5 text-center space-y-3">
                <p className="text-sm text-gray-500">Pripoj Spotify Premium.</p>
                <button onClick={spotify.connect} className="btn-primary text-sm">Pripojit Spotify</button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input-field"
                  placeholder="Hladat akukolvek pesnicku..."
                />

                {/* BPM template selector */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                    Tempo pre pesnicku
                  </label>
                  <div className="flex gap-2">
                    {BPM_TEMPLATES.map((bpm) => (
                      <button
                        key={bpm}
                        onClick={() => setSelectedBpm(bpm)}
                        className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
                          selectedBpm === bpm
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {bpm}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Beaty nebudu presne v rytme, ale kuzele pojdu v zvolenom tempe.
                  </p>
                </div>

                {/* Search results */}
                {spotify.searching && (
                  <div className="text-center text-gray-400 text-sm py-4">Hladam...</div>
                )}

                {spotify.searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {spotify.searchResults.map((track) => {
                      const hasBeatMap = mappedIds.has(track.id);
                      return (
                        <button
                          key={track.id}
                          onClick={() => handleSelectAny(track)}
                          className="w-full flex items-center gap-3 rounded-2xl p-3 text-left bg-white border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all"
                        >
                          {track.albumArt && (
                            <img src={track.albumArt} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {track.name}
                              {hasBeatMap && (
                                <span className="ml-2 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                  beat mapa
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{track.artists}</div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {Math.floor(track.durationMs / 60000)}:{String(Math.floor((track.durationMs % 60000) / 1000)).padStart(2, '0')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab: Manual tempo */}
        {tab === 'manual' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Pusti si pesnicku a klepaj na tlacidlo v rytme.
              </p>
              <button
                onClick={handleTap}
                className="w-32 h-32 rounded-full bg-white border-4 border-gray-200 hover:border-gray-400 active:scale-95 active:bg-gray-50 transition-all flex flex-col items-center justify-center mx-auto shadow-sm"
              >
                <span className="text-2xl font-bold text-gray-900">{tapBpm || '---'}</span>
                <span className="text-xs text-gray-400 mt-1">BPM</span>
              </button>
              <p className="text-xs text-gray-400 mt-3">Klepni aspon 4x na beat</p>
              {tapTimes.length > 0 && (
                <button
                  onClick={() => { setTapTimes([]); setTapBpm(null); }}
                  className="text-xs text-gray-400 hover:text-gray-600 mt-2"
                >
                  Resetovat
                </button>
              )}
            </div>

            <div className="card p-5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
                Alebo nastav manualne
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={tapBpm || manualBpm}
                  onChange={(e) => { setManualBpm(parseInt(e.target.value)); setTapBpm(null); setTapTimes([]); }}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-gray-900 tabular-nums w-16 text-right">
                  {tapBpm || manualBpm}
                </span>
              </div>
            </div>

            <button onClick={handleConfirmManual} className="btn-primary w-full">
              Hrat s tempom {tapBpm || manualBpm} BPM
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
