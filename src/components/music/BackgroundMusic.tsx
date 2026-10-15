'use client';

import { useState, useRef, useEffect } from 'react';
import { SpotifyTrack } from '@/lib/spotify';

const HISTORY_KEY = 'sportqo_music_history';
const MAX_HISTORY = 20;

interface TrackRecord {
  track: SpotifyTrack;
  playCount: number;
  lastPlayed: number;
}

function loadHistory(): TrackRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveToHistory(track: SpotifyTrack) {
  const history = loadHistory();
  const existing = history.find(h => h.track.id === track.id);
  if (existing) {
    existing.playCount++;
    existing.lastPlayed = Date.now();
    existing.track = track; // update metadata
  } else {
    history.push({ track, playCount: 1, lastPlayed: Date.now() });
  }
  // Keep max entries
  const trimmed = history
    .sort((a, b) => b.lastPlayed - a.lastPlayed)
    .slice(0, MAX_HISTORY);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed)); } catch {}
}

interface BackgroundMusicProps {
  spotify: ReturnType<typeof import('@/hooks/useSpotify').useSpotify>;
  onSelect: (track: SpotifyTrack | null) => void;
  selectedTrack: SpotifyTrack | null;
}

export default function BackgroundMusic({ spotify, onSelect, selectedTrack }: BackgroundMusicProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [history, setHistory] = useState<TrackRecord[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleSelect = (track: SpotifyTrack) => {
    saveToHistory(track);
    setHistory(loadHistory());
    onSelect(track);
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => spotify.search(q), 400);
  };

  // Top 5 most played
  const favorites = [...history]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 5);

  // Recent (exclude those already in favorites)
  const favoriteIds = new Set(favorites.map(f => f.track.id));
  const recent = history
    .filter(h => !favoriteIds.has(h.track.id))
    .sort((a, b) => b.lastPlayed - a.lastPlayed)
    .slice(0, 3);

  if (!spotify.isConnected) {
    return (
      <div>
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Hudba</label>
        <button
          onClick={spotify.connect}
          className="w-full rounded-2xl p-4 border-2 border-gray-200 bg-white hover:border-gray-300 transition-all text-left"
        >
          <div className="text-sm font-semibold text-gray-900">Pripojit Spotify</div>
          <div className="text-xs text-gray-500 mt-0.5">Pusti si pesnicku pocas hry</div>
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Hudba</label>

      {selectedTrack ? (
        <div className="rounded-2xl p-4 border-2 border-green-500 bg-green-50 flex items-center gap-3">
          {selectedTrack.albumArt && (
            <img src={selectedTrack.albumArt} alt="" className="w-10 h-10 rounded-lg object-cover" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{selectedTrack.name}</div>
            <div className="text-xs text-gray-500 truncate">{selectedTrack.artists}</div>
          </div>
          <button
            onClick={() => { onSelect(null); setShowSearch(false); }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Zrusit
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-full rounded-2xl p-4 border-2 border-gray-200 bg-white hover:border-gray-300 transition-all text-left"
        >
          <div className="text-sm font-semibold text-gray-900">Pustit pesnicku</div>
          <div className="text-xs text-gray-500 mt-0.5">Volitelne - hudba na pozadi</div>
        </button>
      )}

      {showSearch && !selectedTrack && (
        <div className="mt-3 space-y-4">
          {/* Favorites */}
          {favorites.length > 0 && !searchQuery && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Oblubene</div>
              <div className="space-y-1.5">
                {favorites.map((rec) => (
                  <button
                    key={rec.track.id}
                    onClick={() => handleSelect(rec.track)}
                    className="w-full flex items-center gap-2.5 rounded-xl p-2.5 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {rec.track.albumArt && (
                      <img src={rec.track.albumArt} alt="" className="w-9 h-9 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{rec.track.name}</div>
                      <div className="text-xs text-gray-500 truncate">{rec.track.artists}</div>
                    </div>
                    <div className="text-xs text-gray-400">{rec.playCount}x</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent */}
          {recent.length > 0 && !searchQuery && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Posledne</div>
              <div className="space-y-1.5">
                {recent.map((rec) => (
                  <button
                    key={rec.track.id}
                    onClick={() => handleSelect(rec.track)}
                    className="w-full flex items-center gap-2.5 rounded-xl p-2.5 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {rec.track.albumArt && (
                      <img src={rec.track.albumArt} alt="" className="w-9 h-9 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{rec.track.name}</div>
                      <div className="text-xs text-gray-500 truncate">{rec.track.artists}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-field"
            placeholder="Hladat pesnicku..."
          />
          {spotify.searching && <div className="text-center text-gray-400 text-xs py-2">Hladam...</div>}
          {searchQuery && spotify.searchResults.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {spotify.searchResults.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleSelect(track)}
                  className="w-full flex items-center gap-2.5 rounded-xl p-2.5 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {track.albumArt && (
                    <img src={track.albumArt} alt="" className="w-9 h-9 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{track.name}</div>
                    <div className="text-xs text-gray-500 truncate">{track.artists}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
