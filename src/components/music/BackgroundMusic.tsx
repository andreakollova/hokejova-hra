'use client';

import { useState, useRef } from 'react';
import { SpotifyTrack } from '@/lib/spotify';

interface BackgroundMusicProps {
  spotify: ReturnType<typeof import('@/hooks/useSpotify').useSpotify>;
  onSelect: (track: SpotifyTrack | null) => void;
  selectedTrack: SpotifyTrack | null;
}

export default function BackgroundMusic({ spotify, onSelect, selectedTrack }: BackgroundMusicProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => spotify.search(q), 400);
  };

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
        <div className="mt-3 space-y-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-field"
            placeholder="Hladat pesnicku..."
          />
          {spotify.searching && <div className="text-center text-gray-400 text-xs py-2">Hladam...</div>}
          {spotify.searchResults.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {spotify.searchResults.map((track) => (
                <button
                  key={track.id}
                  onClick={() => { onSelect(track); setShowSearch(false); setSearchQuery(''); }}
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
