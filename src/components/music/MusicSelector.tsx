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

interface MusicSelectorProps {
  onSelect: (config: MusicConfig) => void;
  onCancel: () => void;
  spotify: ReturnType<typeof import('@/hooks/useSpotify').useSpotify>;
}

export default function MusicSelector({ onSelect, onCancel, spotify }: MusicSelectorProps) {
  const [tab, setTab] = useState<'songs' | 'manual'>('songs');
  const [availableSongs, setAvailableSongs] = useState<SavedBeatMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualBpm, setManualBpm] = useState(100);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [tapBpm, setTapBpm] = useState<number | null>(null);

  // Load available songs (only ones with admin beat maps)
  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/beats');
      const data = await res.json();
      if (data.beatMaps) setAvailableSongs(data.beatMaps);
    } catch {}
    setLoading(false);
  };

  const handleSelectSong = (song: SavedBeatMap) => {
    const track: SpotifyTrack = {
      id: song.spotify_track_id,
      name: song.track_name,
      artists: song.track_artist,
      album: '',
      albumArt: song.track_album_art,
      durationMs: song.track_duration_ms,
      uri: `spotify:track:${song.spotify_track_id}`,
    };

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
      track,
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
          Miesaj lopticku do rytmu hudby. Kuzele prichadzaju presne na doby.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab('songs')}
            className={`flex-1 rounded-full py-3 text-sm font-medium transition-all ${
              tab === 'songs'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Pesnicky ({availableSongs.length})
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 rounded-full py-3 text-sm font-medium transition-all ${
              tab === 'manual'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Vlastne tempo
          </button>
        </div>

        {tab === 'songs' && (
          <div className="space-y-4">
            {/* Spotify connection needed for playback */}
            {!spotify.isConnected && (
              <div className="card p-5 text-center space-y-3">
                <p className="text-sm text-gray-500">
                  Pripoj Spotify Premium pre prehravanie hudby pocas hry.
                </p>
                <button onClick={spotify.connect} className="btn-primary text-sm">
                  Pripojit Spotify
                </button>
                <p className="text-xs text-gray-400">Bez Spotify pojdu len kuzele bez hudby.</p>
              </div>
            )}

            {spotify.isConnected && !spotify.isReady && (
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                Pripajam prehravac...
              </div>
            )}

            {/* Song list */}
            {loading ? (
              <div className="text-center text-gray-400 text-sm py-8">Nacitavam pesnicky...</div>
            ) : availableSongs.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">
                Zatial ziadne pesnicky. Admin ich musi pridat cez Beat Builder.
              </div>
            ) : (
              <div className="space-y-2">
                {availableSongs.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => handleSelectSong(song)}
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

        {tab === 'manual' && (
          <div className="space-y-6">
            {/* Tap tempo */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Pusti si pesnicku na mobile a klepaj na tlacidlo v rytme.
              </p>
              <button
                onClick={handleTap}
                className="w-32 h-32 rounded-full bg-white border-4 border-gray-200 hover:border-gray-400 active:scale-95 active:bg-gray-50 transition-all flex flex-col items-center justify-center mx-auto shadow-sm"
              >
                <span className="text-2xl font-bold text-gray-900">{tapBpm || '---'}</span>
                <span className="text-xs text-gray-400 mt-1">BPM</span>
              </button>
              <p className="text-xs text-gray-400 mt-3">Klepni aspon 4x na beat pesnicky</p>
              {tapTimes.length > 0 && (
                <button
                  onClick={() => { setTapTimes([]); setTapBpm(null); }}
                  className="text-xs text-gray-400 hover:text-gray-600 mt-2"
                >
                  Resetovat
                </button>
              )}
            </div>

            {/* Manual slider */}
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
                <span>60 - pomale</span>
                <span>180 - rychle</span>
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
