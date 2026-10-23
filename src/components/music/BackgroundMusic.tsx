'use client';

import { useState, useRef, useEffect } from 'react';
import { SpotifyTrack } from '@/lib/spotify';
import { useAppleMusic } from '@/hooks/useAppleMusic';

const HISTORY_KEY = 'sportqo_music_history';
const SERVICE_KEY = 'sportqo_music_service';
const MAX_HISTORY = 20;

type MusicService = 'spotify' | 'apple' | 'free';

const FREE_TRACKS: SpotifyTrack[] = [
  { id: 'free_1', name: 'Magic', artists: 'Mood Maze', album: 'Uppbeat', albumArt: '', durationMs: 91000, uri: '/music/01-magic.mp3' },
  { id: 'free_2', name: 'La La Love', artists: 'Vocalista', album: 'Uppbeat', albumArt: '', durationMs: 93000, uri: '/music/02-la-la-love.mp3' },
  { id: 'free_3', name: 'Break My Fall', artists: 'Haquin', album: 'Uppbeat', albumArt: '', durationMs: 151000, uri: '/music/03-break-my-fall.mp3' },
  { id: 'free_4', name: 'Fingers Crossed', artists: 'ACADEMY', album: 'Uppbeat', albumArt: '', durationMs: 151000, uri: '/music/04-fingers-crossed.mp3' },
  { id: 'free_5', name: 'Rome', artists: 'NAIO', album: 'Uppbeat', albumArt: '', durationMs: 233000, uri: '/music/05-rome.mp3' },
  { id: 'free_6', name: 'Climb On', artists: 'Jay Denton', album: 'Uppbeat', albumArt: '', durationMs: 205000, uri: '/music/06-climb-on.mp3' },
];

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
    existing.track = track;
  } else {
    history.push({ track, playCount: 1, lastPlayed: Date.now() });
  }
  const trimmed = history.sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, MAX_HISTORY);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed)); } catch {}
}

interface BackgroundMusicProps {
  spotify: ReturnType<typeof import('@/hooks/useSpotify').useSpotify>;
  onSelect: (track: SpotifyTrack | null) => void;
  selectedTrack: SpotifyTrack | null;
  autoOpen?: boolean;
}

export default function BackgroundMusic({ spotify, onSelect, selectedTrack, autoOpen }: BackgroundMusicProps) {
  const apple = useAppleMusic();
  const [service, setService] = useState<MusicService>(() => {
    try { return (localStorage.getItem(SERVICE_KEY) as MusicService) || 'spotify'; } catch { return 'spotify'; }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(autoOpen || false);
  const [history, setHistory] = useState<TrackRecord[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setHistory(loadHistory());
    // Check for prefilled track from dashboard
    try {
      const prefill = localStorage.getItem('hb_prefill_track');
      if (prefill) {
        localStorage.removeItem('hb_prefill_track');
        const song = JSON.parse(prefill);
        if (song.id) {
          const track: SpotifyTrack = {
            id: song.id,
            name: song.name,
            artists: song.artist,
            album: '',
            albumArt: song.albumArt || '',
            durationMs: 0,
            uri: `spotify:track:${song.id}`,
          };
          onSelect(track);
        }
      }
    } catch {}
  }, []);

  const switchService = (s: MusicService) => {
    setService(s);
    try { localStorage.setItem(SERVICE_KEY, s); } catch {}
    setSearchQuery('');
  };

  const activeService = service === 'apple' ? apple : spotify;
  const isConnected = service === 'apple' ? apple.isConnected : spotify.isConnected;

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
    searchTimeout.current = setTimeout(() => activeService.search(q), 400);
  };

  const handleConnect = () => {
    if (service === 'apple') apple.connect();
    else spotify.connect();
  };

  // Top 5 + recent
  const favorites = [...history].sort((a, b) => b.playCount - a.playCount).slice(0, 5);
  const favoriteIds = new Set(favorites.map(f => f.track.id));
  const recent = history.filter(h => !favoriteIds.has(h.track.id)).sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 3);

  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Music</label>

      {selectedTrack ? (
        <div className="rounded-2xl p-4 border-2 border-green-500 bg-green-50 flex items-center gap-3">
          {selectedTrack.albumArt && (
            <img src={selectedTrack.albumArt} alt="" className="w-10 h-10 rounded-lg object-cover" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{selectedTrack.name}</div>
            <div className="text-xs text-gray-500 truncate">{selectedTrack.artists}</div>
          </div>
          <button onClick={() => { onSelect(null); setShowSearch(false); }} className="text-xs text-gray-400 hover:text-gray-600">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-full rounded-2xl p-4 border-2 border-gray-200 bg-white hover:border-gray-300 transition-all text-left"
        >
          <div className="text-sm font-semibold text-gray-900">Play a song</div>
          <div className="text-xs text-gray-500 mt-0.5">Spotify, Apple Music, or free tracks</div>
        </button>
      )}

      {showSearch && !selectedTrack && (
        <div className="mt-3 space-y-4">
          {/* Service toggle */}
          <div className="flex gap-1.5 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => switchService('spotify')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition-all ${
                service === 'spotify' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              <svg className="w-4 h-4 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Spotify
            </button>
            <button
              onClick={() => switchService('apple')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition-all ${
                service === 'apple' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.296-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.045-1.773-.6-1.943-1.536a1.88 1.88 0 011.038-2.022c.357-.17.724-.283 1.1-.38.36-.094.72-.186 1.073-.305.27-.09.387-.282.39-.568.01-.67 0-1.34.002-2.01v-.153c-.003-.043-.02-.074-.063-.082-.052-.01-.108-.013-.16 0l-3.945.93c-.027.007-.054.023-.063.042-.013.03-.015.064-.015.097v7.384c0 .378-.047.75-.2 1.1-.26.59-.715.98-1.327 1.178-.367.118-.745.185-1.13.207-.94.058-1.797-.548-1.996-1.45-.21-.95.2-1.843 1.032-2.18.36-.145.736-.247 1.108-.345.28-.073.564-.14.84-.228.304-.097.437-.3.44-.618.005-.706.002-1.41.002-2.116V7.076c0-.22.042-.4.198-.55.12-.116.27-.174.43-.207.19-.04.384-.065.578-.097l4.465-1.047c.388-.09.78-.166 1.18-.168.183 0 .36.042.49.196.1.12.15.267.15.422-.01 1.622-.006 3.24-.01 4.86z"/>
              </svg>
              Apple Music
            </button>
            <button
              onClick={() => switchService('free')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition-all ${
                service === 'free' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
              Free
            </button>
          </div>

          {/* Free music tracks */}
          {service === 'free' && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Free tracks</div>
              <div className="space-y-1.5">
                {FREE_TRACKS.map((track) => (
                  <button key={track.id} onClick={() => handleSelect(track)}
                    className="w-full flex items-center gap-2.5 rounded-xl p-2.5 text-left bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{track.name}</div>
                      <div className="text-xs text-gray-500 truncate">{track.artists}</div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.floor(track.durationMs / 60000)}:{String(Math.floor((track.durationMs % 60000) / 1000)).padStart(2, '0')}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Royalty-free music from Uppbeat</p>
            </div>
          )}

          {/* Connect */}
          {service !== 'free' && !isConnected && (
            <div className="text-center py-4">
              <button onClick={handleConnect} className="btn-primary text-sm">
                Connect {service === 'apple' ? 'Apple Music' : 'Spotify'}
              </button>
              <p className="text-xs text-gray-400 mt-2">
                {service === 'apple' ? 'Requires Apple Music subscription' : 'Requires Spotify Premium'}
              </p>
            </div>
          )}

          {service !== 'free' && isConnected && (
            <>
              {/* Favorites */}
              {favorites.length > 0 && !searchQuery && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Favourites</div>
                  <div className="space-y-1.5">
                    {favorites.map((rec) => (
                      <button key={rec.track.id} onClick={() => handleSelect(rec.track)}
                        className="w-full flex items-center gap-2.5 rounded-xl p-2.5 text-left bg-gray-50 hover:bg-gray-100 transition-colors">
                        {rec.track.albumArt && <img src={rec.track.albumArt} alt="" className="w-9 h-9 rounded-lg object-cover" />}
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
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent</div>
                  <div className="space-y-1.5">
                    {recent.map((rec) => (
                      <button key={rec.track.id} onClick={() => handleSelect(rec.track)}
                        className="w-full flex items-center gap-2.5 rounded-xl p-2.5 text-left bg-gray-50 hover:bg-gray-100 transition-colors">
                        {rec.track.albumArt && <img src={rec.track.albumArt} alt="" className="w-9 h-9 rounded-lg object-cover" />}
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
                placeholder={`Search on ${service === 'apple' ? 'Apple Music' : 'Spotify'}...`}
              />
              {activeService.searching && <div className="text-center text-gray-400 text-xs py-2">Searching...</div>}
              {searchQuery && activeService.searchResults.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {activeService.searchResults.map((track) => (
                    <button key={track.id} onClick={() => handleSelect(track)}
                      className="w-full flex items-center gap-2.5 rounded-xl p-2.5 text-left bg-gray-50 hover:bg-gray-100 transition-colors">
                      {track.albumArt && <img src={track.albumArt} alt="" className="w-9 h-9 rounded-lg object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{track.name}</div>
                        <div className="text-xs text-gray-500 truncate">{track.artists}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
