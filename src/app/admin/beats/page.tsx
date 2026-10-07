'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSpotify } from '@/hooks/useSpotify';
import { SpotifyTrack } from '@/lib/spotify';
import Image from 'next/image';

interface SavedBeatMap {
  id: string;
  spotify_track_id: string;
  track_name: string;
  track_artist: string;
  track_album_art: string;
  bpm: number;
  beats: number[];
  created_at: string;
}

export default function BeatBuilderPage() {
  const spotify = useSpotify();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

  // Beat recording state
  const [isRecording, setIsRecording] = useState(false);
  const [beats, setBeats] = useState<number[]>([]);
  const [recordStartTime, setRecordStartTime] = useState(0);
  const [currentBpm, setCurrentBpm] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);

  // Admin secret
  const [adminKey, setAdminKey] = useState('');
  const [savedMaps, setSavedMaps] = useState<SavedBeatMap[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const positionInterval = useRef<ReturnType<typeof setInterval>>(undefined);

  // Load admin key from localStorage
  useEffect(() => {
    const key = localStorage.getItem('admin_key');
    if (key) setAdminKey(key);
    loadSavedMaps();
  }, []);

  const loadSavedMaps = async () => {
    try {
      const res = await fetch('/api/beats');
      const data = await res.json();
      if (data.beatMaps) setSavedMaps(data.beatMaps);
    } catch {}
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => spotify.search(q), 400);
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setBeats([]);
    setIsRecording(false);
    setCurrentBpm(0);
    setMessage('');
  };

  const startRecording = async () => {
    if (!selectedTrack || !spotify.isReady) return;

    // Start playing the track
    await spotify.play(selectedTrack);

    // Reset and start recording
    setBeats([]);
    setRecordStartTime(performance.now());
    setIsRecording(true);
    setMessage('Klepaj MEDZERNÍK na každý beat pesničky...');

    // Poll position
    positionInterval.current = setInterval(async () => {
      const pos = await spotify.getPositionMs();
      setPlaybackPosition(pos);
    }, 200);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await spotify.pause();
    if (positionInterval.current) clearInterval(positionInterval.current);

    if (beats.length >= 4) {
      const avgInterval = (beats[beats.length - 1] - beats[0]) / (beats.length - 1);
      setCurrentBpm(Math.round(60 / avgInterval));
      setMessage(`Nahraných ${beats.length} beatov. Ulož alebo nahraj znova.`);
    } else {
      setMessage('Príliš málo beatov. Skús znova.');
    }
  };

  // Handle spacebar tap
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isRecording) {
        e.preventDefault();
        const elapsed = (performance.now() - recordStartTime) / 1000;
        setBeats((prev) => {
          const newBeats = [...prev, Math.round(elapsed * 1000) / 1000];
          // Calculate BPM from last few taps
          if (newBeats.length >= 2) {
            const recent = newBeats.slice(-8);
            const intervals: number[] = [];
            for (let i = 1; i < recent.length; i++) {
              intervals.push(recent[i] - recent[i - 1]);
            }
            const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            setCurrentBpm(Math.round(60 / avg));
          }
          return newBeats;
        });
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isRecording, recordStartTime]);

  const saveBeatMap = async () => {
    if (!selectedTrack || beats.length < 4 || !adminKey) {
      setMessage('Chýba admin kľúč alebo nedostatok beatov.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/beats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminKey,
        },
        body: JSON.stringify({
          spotify_track_id: selectedTrack.id,
          track_name: selectedTrack.name,
          track_artist: selectedTrack.artists,
          track_album_art: selectedTrack.albumArt,
          track_duration_ms: selectedTrack.durationMs,
          bpm: currentBpm,
          beats,
        }),
      });

      if (res.ok) {
        setMessage('Beat mapa uložená!');
        loadSavedMaps();
      } else {
        const data = await res.json();
        setMessage(`Chyba: ${data.error}`);
      }
    } catch {
      setMessage('Chyba pri ukladaní.');
    }
    setSaving(false);
  };

  const deleteBeatMap = async (id: string) => {
    if (!adminKey) return;
    try {
      await fetch('/api/beats', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminKey,
        },
        body: JSON.stringify({ id }),
      });
      loadSavedMaps();
    } catch {}
  };

  const saveAdminKey = () => {
    localStorage.setItem('admin_key', adminKey);
    setMessage('Admin kľúč uložený.');
  };

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Beat Builder</h1>
        <p className="text-gray-400 mb-8">
          Vyber pesničku, pusti ju a klepaj MEDZERNÍK na každý beat. Uloží sa beat mapa pre hráčov.
        </p>

        {/* Admin key */}
        <div className="card p-5 mb-8">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
            Admin kľúč
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="input-field flex-1"
              placeholder="Service role key..."
            />
            <button onClick={saveAdminKey} className="btn-secondary text-sm px-4">
              Uložiť
            </button>
          </div>
        </div>

        {/* Spotify connection */}
        {!spotify.isConnected ? (
          <div className="text-center py-8">
            <button onClick={spotify.connect} className="btn-primary">
              Pripojiť Spotify
            </button>
            <p className="text-xs text-gray-400 mt-2">Potrebné pre prehrávanie</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field"
              placeholder="Hľadať pesničku na Spotify..."
            />

            {/* SDK status */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className={`w-2 h-2 rounded-full ${spotify.isReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
              {spotify.isReady ? 'Prehrávač pripravený' : 'Pripájam...'}
            </div>

            {/* Search results */}
            {spotify.searchResults.length > 0 && !selectedTrack && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {spotify.searchResults.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    className="w-full flex items-center gap-3 rounded-2xl p-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {track.albumArt && (
                      <img src={track.albumArt} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    )}
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
            )}

            {/* Selected track + recording */}
            {selectedTrack && (
              <div className="card p-6 space-y-5">
                <div className="flex items-center gap-4">
                  {selectedTrack.albumArt && (
                    <img src={selectedTrack.albumArt} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{selectedTrack.name}</div>
                    <div className="text-sm text-gray-500">{selectedTrack.artists}</div>
                  </div>
                  <button
                    onClick={() => { setSelectedTrack(null); setBeats([]); setIsRecording(false); }}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Zmeniť
                  </button>
                </div>

                {/* Recording controls */}
                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      disabled={!spotify.isReady}
                      className="btn-primary disabled:opacity-50"
                    >
                      Spustiť nahrávanie
                    </button>
                  ) : (
                    <button onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white font-medium px-7 py-3.5 rounded-full transition-all">
                      Zastaviť
                    </button>
                  )}
                  {beats.length > 0 && !isRecording && (
                    <button
                      onClick={saveBeatMap}
                      disabled={saving || beats.length < 4}
                      className="btn-accent disabled:opacity-50"
                    >
                      {saving ? 'Ukladám...' : 'Uložiť beat mapu'}
                    </button>
                  )}
                </div>

                {/* Live stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 rounded-2xl p-3">
                    <div className="text-2xl font-bold text-gray-900 tabular-nums">{beats.length}</div>
                    <div className="text-xs text-gray-400">Beaty</div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-3">
                    <div className="text-2xl font-bold text-gray-900 tabular-nums">{currentBpm || '---'}</div>
                    <div className="text-xs text-gray-400">BPM</div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-3">
                    <div className="text-2xl font-bold text-gray-900 tabular-nums">
                      {Math.floor(playbackPosition / 1000)}s
                    </div>
                    <div className="text-xs text-gray-400">Pozícia</div>
                  </div>
                </div>

                {/* Beat visualizer */}
                {isRecording && (
                  <div className="h-16 bg-gray-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <div className="text-sm text-gray-400">
                      Klepaj <kbd className="bg-gray-200 px-2 py-0.5 rounded text-gray-700 font-mono text-xs">SPACE</kbd> na beat
                    </div>
                    {/* Flash on each beat */}
                    {beats.length > 0 && (
                      <div
                        key={beats.length}
                        className="absolute inset-0 bg-green-500/20 animate-ping"
                        style={{ animationDuration: '0.3s', animationIterationCount: 1 }}
                      />
                    )}
                  </div>
                )}

                {message && (
                  <p className="text-sm text-gray-500">{message}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Saved beat maps */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Uložené beat mapy ({savedMaps.length})</h2>
          {savedMaps.length === 0 ? (
            <p className="text-gray-400 text-sm">Zatiaľ žiadne beat mapy.</p>
          ) : (
            <div className="space-y-3">
              {savedMaps.map((bm) => (
                <div key={bm.id} className="flex items-center gap-3 card p-4">
                  {bm.track_album_art && (
                    <img src={bm.track_album_art} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{bm.track_name}</div>
                    <div className="text-xs text-gray-500 truncate">{bm.track_artist}</div>
                  </div>
                  <div className="text-sm text-gray-400 tabular-nums">{bm.bpm} BPM</div>
                  <div className="text-xs text-gray-400">{bm.beats.length} beatov</div>
                  <button
                    onClick={() => deleteBeatMap(bm.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Zmazať
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
