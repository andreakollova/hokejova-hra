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

const BPM_TEMPLATES = [80, 100, 120, 140, 160];

function generateBeatsForBpm(bpm: number, durationS: number): number[] {
  const interval = 60 / bpm;
  const beats: number[] = [];
  for (let t = interval; t < durationS; t += interval) {
    beats.push(Math.round(t * 100) / 100);
  }
  return beats;
}

interface MusicSelectorProps {
  onSelect: (config: MusicConfig) => void;
  onCancel: () => void;
  spotify: ReturnType<typeof import('@/hooks/useSpotify').useSpotify>;
}

export default function MusicSelector({ onSelect, onCancel, spotify }: MusicSelectorProps) {
  const [availableSongs, setAvailableSongs] = useState<SavedBeatMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBpm, setSelectedBpm] = useState(120);
  const [showBpmPicker, setShowBpmPicker] = useState<SpotifyTrack | null>(null);
  const [mappedIds, setMappedIds] = useState<Set<string>>(new Set());
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  const handleSelectTrack = (track: SpotifyTrack) => {
    // If it has an admin beat map, use it directly
    const mapped = availableSongs.find(s => s.spotify_track_id === track.id);
    if (mapped) {
      handleSelectMapped(mapped);
      return;
    }
    // Otherwise show BPM picker
    setShowBpmPicker(track);
  };

  const handleConfirmBpm = () => {
    if (!showBpmPicker) return;
    const track = showBpmPicker;
    const durationS = track.durationMs / 1000;
    const beats = generateBeatsForBpm(selectedBpm, durationS);
    onSelect({
      mode: 'spotify',
      bpm: selectedBpm,
      beatMap: { tempo: selectedBpm, beats, bars: [], sections: [], durationS },
      track,
    });
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setShowBpmPicker(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => spotify.search(q), 400);
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

        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Vyber pesnicku</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Kuzele pojdu do rytmu hudby.
        </p>

        {/* Spotify connection */}
        {!spotify.isConnected ? (
          <div className="card p-6 text-center space-y-3">
            <p className="text-sm text-gray-500">Pripoj Spotify Premium pre prehravanie.</p>
            <button onClick={spotify.connect} className="btn-primary text-sm">Pripojit Spotify</button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field"
              placeholder="Hladat pesnicku..."
            />

            {/* BPM picker for unmapped track */}
            {showBpmPicker && (
              <div className="card p-5 space-y-4">
                <div className="flex items-center gap-3">
                  {showBpmPicker.albumArt && (
                    <img src={showBpmPicker.albumArt} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{showBpmPicker.name}</div>
                    <div className="text-xs text-gray-500 truncate">{showBpmPicker.artists}</div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                    Vyber tempo
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
                    Kuzele pojdu v zvolenom tempe, nie presne v rytme pesicky.
                  </p>
                </div>
                <button onClick={handleConfirmBpm} className="btn-primary w-full">
                  Hrat na {selectedBpm} BPM
                </button>
              </div>
            )}

            {/* Search results */}
            {spotify.searching && (
              <div className="text-center text-gray-400 text-sm py-4">Hladam...</div>
            )}

            {searchQuery && spotify.searchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {spotify.searchResults.map((track) => {
                  const hasBeatMap = mappedIds.has(track.id);
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleSelectTrack(track)}
                      className={`w-full flex items-center gap-3 rounded-2xl p-3 text-left transition-all ${
                        showBpmPicker?.id === track.id
                          ? 'bg-gray-100 border-2 border-gray-300'
                          : 'bg-white border border-gray-100 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      {track.albumArt && (
                        <img src={track.albumArt} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {hasBeatMap && <span className="text-yellow-500 mr-1">&#9733;</span>}
                          {track.name}
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

            {/* Recommended songs (admin beat maps) */}
            {!searchQuery && (
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
                  Odporucane pesnicky
                </label>
                {loading ? (
                  <div className="text-center text-gray-400 text-sm py-6">Nacitavam...</div>
                ) : availableSongs.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-6">Zatial ziadne odporucane pesnicky.</div>
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
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            <span className="text-yellow-500 mr-1">&#9733;</span>
                            {song.track_name}
                          </div>
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
          </div>
        )}
      </div>
    </div>
  );
}
