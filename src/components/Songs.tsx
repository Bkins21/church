import { useState, useRef, useEffect, ChangeEvent, MouseEvent } from 'react';
import { Play, Pause, Music, Search, Volume2, VolumeX, SkipBack, SkipForward, Disc, RefreshCw, Shuffle, FileText, Download, Check, Sparkles, Loader2, Radio, ExternalLink, ShieldCheck } from 'lucide-react';
import { Song } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';
import { worshipSynth } from '../utils/audioSynth';

interface SongsProps {
  userSongDownloads?: Song[];
  onSongDownloadSuccess?: (song: Song) => void;
  isAdmin?: boolean;
}

export default function Songs({ userSongDownloads = [], onSongDownloadSuccess, isAdmin: propIsAdmin }: SongsProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showLyrics, setShowLyrics] = useState(true);
  const [isUsingSynth, setIsUsingSynth] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (propIsAdmin !== undefined) return propIsAdmin;
    try {
      return localStorage.getItem('gec_is_admin') === 'true';
    } catch {
      return false;
    }
  });

  // Download states
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const synthTimerRef = useRef<any>(null);

  // Sync admin state
  useEffect(() => {
    if (propIsAdmin !== undefined) {
      setIsAdmin(propIsAdmin);
    } else {
      const checkAdmin = () => {
        setIsAdmin(localStorage.getItem('gec_is_admin') === 'true');
      };
      window.addEventListener('storage', checkAdmin);
      return () => window.removeEventListener('storage', checkAdmin);
    }
  }, [propIsAdmin]);

  // Fetch songs strictly from the dedicated Supabase public."Songs" table
  useEffect(() => {
    let isSubscribed = true;

    const fetchSongs = async () => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('Songs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Could not fetch songs from Songs table:', error);
          return;
        }

        if (isSubscribed) {
          const mapped: Song[] = (data || []).map((song: any) => ({
            id: song.id,
            title: song.title || '',
            artist: song.artist || 'Crossworship',
            album: song.album || 'Edifice Anthem Single',
            duration: song.duration || '4:30',
            audioUrl: song.audio_url || '',
            coverUrl: song.artwork || '',
            lyrics: song.description || '',
            downloads: song.downloads || 0,
            uploadedByUser: false
          }));

          setSongs(mapped);
        }
      } catch (err) {
        console.error('Could not sync songs from Supabase:', err);
      }
    };

    fetchSongs();

    const handleUpdate = () => {
      fetchSongs();
    };

    window.addEventListener('gec_songs_updated', handleUpdate);

    return () => {
      isSubscribed = false;
      window.removeEventListener('gec_songs_updated', handleUpdate);
    };
  }, []);

  // Filter list by search query directly from Supabase songs
  const filteredPlaylist = songs.filter(song => {
    return song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
           song.album.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (song.lyrics && song.lyrics.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const playlist = filteredPlaylist.length > 0 ? filteredPlaylist : songs;

  // Default to first song if none selected
  useEffect(() => {
    if (!currentSong && playlist.length > 0) {
      setCurrentSong(playlist[0]);
    }
  }, [playlist, currentSong]);

  // Clean Audio Element Setup
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (!isUsingSynth) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      handleNext();
    };

    const handleError = () => {
      // If audio file stream fails, fallback to worship synth seamlessly
      if (isPlaying && currentSong) {
        startSynthPlayback(currentSong);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      worshipSynth.stop();
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    };
  }, [currentSong, isShuffling, isLooping, isUsingSynth, isPlaying]);

  // Synth Fallback Logic
  const startSynthPlayback = (song: Song) => {
    setIsUsingSynth(true);
    worshipSynth.playTrack(song.id, isMuted ? 0 : volume);
    
    // Virtual duration if none exists
    const [mins, secs] = (song.duration || '4:30').split(':').map(Number);
    const totalSecs = (mins || 4) * 60 + (secs || 30);
    setDuration(totalSecs);

    if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    synthTimerRef.current = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= totalSecs) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopSynthPlayback = () => {
    setIsUsingSynth(false);
    worshipSynth.stop();
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
  };

  // Play a specific song directly
  const playAudioTrack = async (song: Song) => {
    const audio = audioRef.current;
    stopSynthPlayback();

    if (!audio) return;

    // Check if song has a valid audio URL
    if (song.audioUrl && (song.audioUrl.startsWith('http') || song.audioUrl.startsWith('blob:'))) {
      try {
        if (audio.src !== song.audioUrl) {
          audio.src = song.audioUrl;
          audio.load();
        }
        audio.volume = isMuted ? 0 : volume;
        playPromiseRef.current = audio.play();
        await playPromiseRef.current;
        setIsPlaying(true);
        setIsUsingSynth(false);
      } catch (err: any) {
        console.warn('Direct stream playback error, falling back to Web Audio Synth:', err);
        startSynthPlayback(song);
        setIsPlaying(true);
      }
    } else {
      startSynthPlayback(song);
      setIsPlaying(true);
    }
  };

  // Pause audio track
  const pauseAudioTrack = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    stopSynthPlayback();
    setIsPlaying(false);
  };

  // Select song
  const handleSelectSong = (song: Song) => {
    setCurrentSong(song);
    setCurrentTime(0);
    playAudioTrack(song);
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!currentSong && playlist.length > 0) {
      handleSelectSong(playlist[0]);
      return;
    }

    if (isPlaying) {
      pauseAudioTrack();
    } else if (currentSong) {
      playAudioTrack(currentSong);
    }
  };

  // Sync volume and mute
  useEffect(() => {
    const currentVol = isMuted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = currentVol;
    }
    worshipSynth.setVolume(currentVol);
  }, [volume, isMuted]);

  // Next Track Logic
  const handleNext = () => {
    if (playlist.length === 0) return;
    if (isLooping && currentSong) {
      setCurrentTime(0);
      playAudioTrack(currentSong);
      return;
    }

    let nextIndex = 0;
    if (isShuffling) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else if (currentSong) {
      const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
      nextIndex = (currentIndex + 1) % playlist.length;
    }

    const nextSong = playlist[nextIndex];
    setCurrentSong(nextSong);
    setCurrentTime(0);
    playAudioTrack(nextSong);
  };

  // Previous Track Logic
  const handlePrev = () => {
    if (playlist.length === 0 || !currentSong) return;
    
    let prevIndex = 0;
    if (isShuffling) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
      prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
    }

    const prevSong = playlist[prevIndex];
    setCurrentSong(prevSong);
    setCurrentTime(0);
    playAudioTrack(prevSong);
  };

  // Seek bar handler
  const handleSeekChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (!isUsingSynth && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Volume slider handler
  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  // Format time (e.g., 03:42)
  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Download song handler
  const triggerSongDownload = async (songItem: Song, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    if (isDownloading[songItem.id]) return;

    setIsDownloading(prev => ({ ...prev, [songItem.id]: true }));

    if (onSongDownloadSuccess) {
      onSongDownloadSuccess(songItem);
    } else {
      try {
        const saved = localStorage.getItem('gec_user_song_downloads');
        const currentSaved: Song[] = saved ? JSON.parse(saved) : [];
        if (!currentSaved.some(s => s.id === songItem.id)) {
          localStorage.setItem('gec_user_song_downloads', JSON.stringify([...currentSaved, songItem]));
        }
      } catch (err) {
        console.error('Local download save failed', err);
      }
    }

    try {
      const songUrl = (songItem as any).audio_url || songItem.audioUrl || '';
      
      if (songUrl) {
        const response = await fetch(songUrl);
        if (response.ok) {
          const blob = await response.blob();
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `${songItem.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.mp3`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        } else {
          window.open(songUrl, '_blank');
        }
      } else {
        alert(`Anthem "${songItem.title}" saved to your personal offline downloads.`);
      }
    } catch (error: any) {
      console.warn('Direct file download fallback:', error);
      alert(`Anthem "${songItem.title}" recorded to your saved downloads.`);
    } finally {
      setIsDownloading(prev => ({ ...prev, [songItem.id]: false }));
    }
  };

  return (
    <div 
      className="min-h-screen text-[#F1F6F4] relative transition-colors duration-500"
      style={{
        background: '#172836'
      }}
    >
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans relative z-10" id="songs-main-page">
        
        {/* Header Banner with 70% #172836, 20% #F1F6F4, 10% #FFC801 Palette Accent */}
        <div 
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 pb-6 border-b"
          style={{ borderColor: 'rgba(241, 246, 244, 0.15)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span 
                className="p-1.5 rounded-lg border shadow-sm flex items-center justify-center"
                style={{
                  background: '#0E1B26',
                  borderColor: '#FFC801',
                  color: '#FFC801'
                }}
              >
                <Music className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 text-[#FFC801]">
                Crossworship Ministry • God's Edifice Church
              </span>
            </div>
            
            {/* Headline with custom Proportional Palette Accent Line */}
            <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-[#F1F6F4] tracking-tight drop-shadow-sm">
              worship with us in Psalms and Spiritual songs
            </h2>
            
            <div className="mt-2 flex items-center gap-0.5 w-44 h-2 rounded-full overflow-hidden border border-[#F1F6F4]/30">
              <div className="h-full w-[10%]" style={{ backgroundColor: '#FFC801' }} title="10% #FFC801" />
              <div className="h-full w-[70%]" style={{ backgroundColor: '#172836' }} title="70% #172836" />
              <div className="h-full w-[20%]" style={{ backgroundColor: '#F1F6F4' }} title="20% #F1F6F4" />
            </div>

            <p className="text-sm mt-2 max-w-2xl text-[#F1F6F4]/80 font-medium">
              Listen and get edified to Spiritual songs inspired by the Holy Ghost
            </p>
          </div>

          {/* Status / Admin Portal Quick Link */}
          {isAdmin && (
            <div className="flex items-center gap-3">
              <a
                href="/crosswordmedia"
                className="px-4 py-2.5 rounded-xl border text-[#172836] text-xs font-semibold flex items-center gap-2 transition-all shadow-md hover:bg-[#FFC801]/90"
                style={{
                  background: '#FFC801',
                  borderColor: '#FFC801'
                }}
                title="Manage and upload songs in Admin Portal"
              >
                <ShieldCheck className="h-4 w-4 text-[#172836]" />
                <span>Admin Songs Manager</span>
                <ExternalLink className="h-3 w-3 text-[#172836]" />
              </a>
            </div>
          )}
        </div>

        {/* Main Grid: Playlist & Player */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Playlist Section (Left side: 7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FFC801]" />
              <input
                type="text"
                placeholder="Search by song title, singer, album, or lyrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded-2xl py-3 pl-11 pr-4 text-xs sm:text-sm text-[#F1F6F4] placeholder-[#F1F6F4]/50 focus:outline-none focus:border-[#FFC801] transition-all shadow-md"
                style={{
                  background: '#0E1B26',
                  borderColor: 'rgba(241, 246, 244, 0.2)'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono hover:underline px-2 py-1 text-[#FFC801]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Playlist Container with Refined Catalogue Layout */}
            <div 
              className="border rounded-3xl p-4 sm:p-5 shadow-xl space-y-3"
              style={{
                background: '#0E1B26',
                borderColor: 'rgba(241, 246, 244, 0.15)'
              }}
            >
              {/* Header Bar */}
              <div 
                className="flex items-center justify-between pb-3 px-3 border-b"
                style={{ borderColor: 'rgba(241, 246, 244, 0.12)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFC801' }} />
                  <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#F1F6F4]">
                    Worship Catalogue
                  </span>
                </div>
                <span className="text-[11px] font-mono font-medium text-[#FFC801] px-2 py-0.5 rounded-md bg-[#172836] border border-[#FFC801]/30">
                  {filteredPlaylist.length} {filteredPlaylist.length === 1 ? 'Track' : 'Tracks'}
                </span>
              </div>

              {/* Column Titles for desktop */}
              <div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#F1F6F4]/50 border-b border-[#F1F6F4]/5">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-6">Title & Artist</div>
                <div className="col-span-3">Album</div>
                <div className="col-span-2 text-right">Time / Action</div>
              </div>

              {filteredPlaylist.length === 0 ? (
                <div className="py-16 text-center text-[#F1F6F4]/70 space-y-3 px-4">
                  <Music className="h-12 w-12 mx-auto" style={{ color: '#FFC801' }} />
                  <p className="text-base font-semibold text-[#F1F6F4]">
                    {searchQuery ? 'No songs matching your search' : 'No songs currently in the catalog'}
                  </p>
                  <p className="text-xs text-[#F1F6F4]/70 max-w-sm mx-auto">
                    {searchQuery
                      ? 'Try adjusting your search terms or clearing the filter.'
                      : 'Church administrators can upload audio tracks, worship anthems, and lyrics directly in the Admin Portal.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
                  {filteredPlaylist.map((song, index) => {
                    const isCurrent = currentSong?.id === song.id;
                    const isCurrentPlaying = isCurrent && isPlaying;

                    return (
                      <div
                        key={song.id}
                        onClick={() => handleSelectSong(song)}
                        className={`group relative flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                          isCurrent
                            ? 'shadow-md border-[#FFC801] bg-[#172836]'
                            : 'hover:bg-[#132533] border-transparent hover:border-[#F1F6F4]/15 bg-[#0A141D]'
                        }`}
                      >
                        {/* Active Accent Indicator Left Border */}
                        {isCurrent && (
                          <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#FFC801]" />
                        )}

                        <div className="flex items-center gap-3 min-w-0 flex-1 pl-1">
                          {/* Track Number / Playing Wave */}
                          <div className="w-6 text-center shrink-0 flex items-center justify-center">
                            {isCurrentPlaying ? (
                              <div className="flex items-end gap-0.5 h-3.5">
                                <span className="w-0.5 animate-[bounce_0.8s_infinite_100ms] h-full rounded-full bg-[#FFC801]" />
                                <span className="w-0.5 animate-[bounce_0.8s_infinite_300ms] h-2/3 rounded-full bg-[#F1F6F4]" />
                                <span className="w-0.5 animate-[bounce_0.8s_infinite_200ms] h-1/2 rounded-full bg-[#FFC801]" />
                              </div>
                            ) : (
                              <span className={`text-xs font-mono font-medium ${isCurrent ? 'text-[#FFC801] font-bold' : 'text-[#F1F6F4]/50 group-hover:text-[#F1F6F4]'}`}>
                                {String(index + 1).padStart(2, '0')}
                              </span>
                            )}
                          </div>

                          {/* Cover Artwork */}
                          <div 
                            className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border bg-[#050C12]"
                            style={{ borderColor: isCurrent ? '#FFC801' : 'rgba(241, 246, 244, 0.15)' }}
                          >
                            <img
                              src={song.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop'}
                              alt={song.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className={`absolute inset-0 bg-[#172836]/70 flex items-center justify-center transition-opacity ${
                              isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                              {isCurrentPlaying ? (
                                <Pause className="h-4 w-4 fill-current text-[#FFC801]" />
                              ) : (
                                <Play className="h-4 w-4 fill-current text-[#FFC801] ml-0.5" />
                              )}
                            </div>
                          </div>

                          {/* Title & Artist */}
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-xs sm:text-sm font-semibold truncate leading-snug ${
                                isCurrent ? 'text-[#FFC801] font-bold' : 'text-[#F1F6F4] group-hover:text-[#FFC801] transition-colors'
                              }`}>
                                {song.title}
                              </h4>
                              {isCurrent && (
                                <span className="hidden md:inline-flex text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#FFC801]/15 text-[#FFC801] font-bold border border-[#FFC801]/30">
                                  Playing
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#F1F6F4]/65 truncate mt-0.5">
                              <span className="truncate">{song.artist}</span>
                              <span className="sm:hidden text-[#F1F6F4]/40">•</span>
                              <span className="sm:hidden truncate text-[#F1F6F4]/50">{song.album}</span>
                            </div>
                          </div>

                          {/* Album (Desktop column) */}
                          <div className="hidden sm:block w-32 shrink-0 truncate text-[11px] text-[#F1F6F4]/60 pr-2">
                            <span className="px-2 py-0.5 rounded-md bg-[#172836]/70 border border-[#F1F6F4]/10 truncate inline-block max-w-full">
                              {song.album}
                            </span>
                          </div>
                        </div>

                        {/* Right controls: Duration and Download */}
                        <div className="flex items-center gap-2.5 shrink-0 ml-2">
                          <span className="text-[11px] font-mono text-[#F1F6F4]/60 hidden sm:inline-block w-10 text-right">
                            {song.duration || '4:30'}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => triggerSongDownload(song, e)}
                            disabled={isDownloading[song.id]}
                            className="p-1.5 rounded-lg transition-all cursor-pointer hover:bg-[#172836] border border-transparent hover:border-[#FFC801]/30"
                            style={{ color: isCurrent ? '#FFC801' : '#F1F6F4' }}
                            title="Save anthem download"
                          >
                            {userSongDownloads.some(s => s.id === song.id) ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : isDownloading[song.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin text-[#FFC801]" />
                            ) : (
                              <Download className="h-4 w-4 hover:text-[#FFC801]" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Active Player Card & Lyrics (Right side: 5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">

            {/* Master Player Deck with Solid 70% #172836, 20% #F1F6F4, 10% #FFC801 Theme */}
            <div 
              className="border rounded-3xl p-6 shadow-2xl space-y-6 text-[#F1F6F4]"
              style={{
                background: '#0E1B26',
                borderColor: 'rgba(241, 246, 244, 0.15)'
              }}
            >

              {currentSong ? (
                <div className="space-y-6">

                  {/* Album Cover & Status */}
                  <div 
                    className="relative aspect-square w-full rounded-2xl overflow-hidden border shadow-xl bg-[#0B151E] group"
                    style={{ borderColor: '#FFC801' }}
                  >
                    <img
                      src={currentSong.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop'}
                      alt={currentSong.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                    {/* Playing Indicator Pill */}
                    <div 
                      className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono shadow-md"
                      style={{
                        background: '#0F1C27',
                        borderColor: '#FFC801'
                      }}
                    >
                      <span 
                        className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-ping' : ''}`}
                        style={{ backgroundColor: '#FFC801' }}
                      />
                      <span style={{ color: '#FFC801' }}>
                        {isPlaying ? 'Now Playing' : 'Paused'}
                      </span>
                    </div>

                    {/* Title & Artist Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-[#172836]/80 p-3 rounded-xl backdrop-blur-sm border border-[#FFC801]/30">
                      <h3 className="text-lg font-bold font-display text-[#F1F6F4] leading-tight">
                        {currentSong.title}
                      </h3>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: '#FFC801' }}>
                        {currentSong.artist} • {currentSong.album}
                      </p>
                    </div>
                  </div>

                  {/* Scrubber / Progress Bar */}
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeekChange}
                        className="w-full h-2 rounded-lg cursor-pointer transition-all hover:h-2.5"
                        style={{
                          accentColor: '#FFC801',
                          backgroundColor: '#0F1C27'
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono font-medium">
                      <span style={{ color: '#FFC801' }}>{formatTime(currentTime)}</span>
                      <span className="text-[#F1F6F4]/70">{formatTime(duration || 0)}</span>
                    </div>
                  </div>

                  {/* Central Playback Controls */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setIsShuffling(!isShuffling)}
                      className="p-2.5 rounded-xl transition-all cursor-pointer border"
                      style={{
                        background: isShuffling ? '#FFC801' : '#0F1C27',
                        borderColor: isShuffling ? '#FFC801' : 'rgba(241, 246, 244, 0.2)',
                        color: isShuffling ? '#172836' : '#F1F6F4'
                      }}
                      title={isShuffling ? 'Shuffle is On' : 'Shuffle is Off'}
                    >
                      <Shuffle className="h-4 w-4" />
                    </button>

                    <button
                      onClick={handlePrev}
                      className="p-3 rounded-full hover:bg-white/10 text-[#F1F6F4] transition-all cursor-pointer active:scale-95"
                      title="Previous Song"
                    >
                      <SkipBack className="h-5 w-5" />
                    </button>

                    {/* Master Play Button: Solid #FFC801, border #F1F6F4, icon #172836 */}
                    <button
                      onClick={togglePlay}
                      className="p-5 rounded-full text-[#172836] shadow-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center hover:scale-105"
                      style={{
                        background: '#FFC801',
                        border: '2px solid #F1F6F4',
                        boxShadow: '0 8px 25px rgba(255, 200, 1, 0.4)'
                      }}
                      title={isPlaying ? 'Pause Song' : 'Play Song'}
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6 fill-current text-[#172836]" />
                      ) : (
                        <Play className="h-6 w-6 fill-current ml-0.5 text-[#172836]" />
                      )}
                    </button>

                    <button
                      onClick={handleNext}
                      className="p-3 rounded-full hover:bg-white/10 text-[#F1F6F4] transition-all cursor-pointer active:scale-95"
                      title="Next Song"
                    >
                      <SkipForward className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => setIsLooping(!isLooping)}
                      className="p-2.5 rounded-xl transition-all cursor-pointer border"
                      style={{
                        background: isLooping ? '#FFC801' : '#0F1C27',
                        borderColor: isLooping ? '#FFC801' : 'rgba(241, 246, 244, 0.2)',
                        color: isLooping ? '#172836' : '#F1F6F4'
                      }}
                      title={isLooping ? 'Loop is On' : 'Loop is Off'}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Volume Slider & Controls */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="hover:text-white transition-colors cursor-pointer"
                      style={{ color: '#FFC801' }}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4 w-4 text-rose-400" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1.5 rounded-lg cursor-pointer"
                      style={{
                        accentColor: '#FFC801',
                        backgroundColor: '#0F1C27'
                      }}
                    />
                    <span className="text-[10px] font-mono w-8 text-right font-medium" style={{ color: '#F1F6F4' }}>
                      {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                    </span>
                  </div>

                  {/* Lyrics & Download Toggle */}
                  <div 
                    className="flex justify-between items-center pt-3 border-t gap-3"
                    style={{ borderColor: 'rgba(241, 246, 244, 0.15)' }}
                  >
                    <button
                      onClick={() => setShowLyrics(!showLyrics)}
                      className="text-[11px] font-semibold tracking-wider uppercase flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all cursor-pointer hover:brightness-110"
                      style={{
                        background: showLyrics ? '#FFC801' : '#0F1C27',
                        borderColor: '#FFC801',
                        color: showLyrics ? '#172836' : '#F1F6F4'
                      }}
                    >
                      <FileText className="h-3.5 w-3.5" style={{ color: showLyrics ? '#172836' : '#FFC801' }} />
                      {showLyrics ? 'Hide Lyrics' : 'View Lyrics'}
                    </button>

                    <button
                      onClick={() => triggerSongDownload(currentSong)}
                      disabled={isDownloading[currentSong.id]}
                      className="text-[11px] font-semibold tracking-wider uppercase flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer hover:scale-105 shadow-md"
                      style={{
                        background: '#FFC801',
                        borderColor: '#FFC801',
                        color: '#172836',
                        fontWeight: 'bold'
                      }}
                    >
                      {userSongDownloads.some(s => s.id === currentSong.id) ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#172836]" />
                          <span>Saved</span>
                        </>
                      ) : isDownloading[currentSong.id] ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#172836]" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5 text-[#172836]" />
                          <span className="font-extrabold">Download</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="text-center py-16 text-[#F1F6F4]/70 space-y-3 px-4">
                  <Disc className="h-12 w-12 mx-auto" style={{ color: '#FFC801' }} />
                  <p className="text-sm font-semibold text-[#F1F6F4]">No Song Selected</p>
                  <p className="text-xs text-[#F1F6F4]/60 max-w-xs mx-auto">
                    {playlist.length > 0
                      ? 'Select a song from the playlist to begin playback.'
                      : 'Add songs in the Admin Portal to begin playing worship anthems.'}
                  </p>
                </div>
              )}

            </div>

            {/* Synced Lyrics Board */}
            <AnimatePresence>
              {showLyrics && currentSong && currentSong.lyrics && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="border rounded-3xl p-5 shadow-xl max-h-[380px] overflow-y-auto font-sans leading-relaxed text-[#F1F6F4]"
                  style={{
                    background: '#0F1C27',
                    borderColor: 'rgba(241, 246, 244, 0.2)'
                  }}
                >
                  <div 
                    className="flex items-center justify-between pb-3 mb-4 border-b"
                    style={{ borderColor: 'rgba(241, 246, 244, 0.15)' }}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" style={{ color: '#FFC801' }} />
                      <h4 className="font-display font-bold text-xs tracking-wider uppercase text-[#FFC801]">
                        Song Lyrics & Meditations
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-[#F1F6F4]">
                      {currentSong.title}
                    </span>
                  </div>

                  <div className="space-y-3.5 text-center text-xs whitespace-pre-wrap select-none font-sans italic leading-relaxed">
                    {currentSong.lyrics.split('\n').map((line, idx) => {
                      const match = line.match(/^\[(\d+):(\d+)\](.*)/);
                      const lyricText = match ? match[3].trim() : line;
                      return (
                        <p key={idx} className="hover:text-[#FFC801] text-[#F1F6F4]/90 transition-colors py-0.5">
                          {lyricText}
                        </p>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </div>
  );
}
