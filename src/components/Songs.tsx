import { useState, useRef, useEffect, useMemo, ChangeEvent, MouseEvent } from 'react';
import { 
  Play, Pause, Music, Search, Volume2, VolumeX, SkipBack, SkipForward, 
  Disc, RefreshCw, Shuffle, Repeat, Repeat1, FileText, Download, Check, Loader2, 
  ExternalLink, ShieldCheck, RotateCcw, RotateCw, Sparkles, Navigation,
  ListMusic, ListPlus, Trash2, ArrowUp, ArrowDown, X, Plus, Clock, Layers, Mic, Wand2
} from 'lucide-react';
import { Song } from '../types';
import { crossworshipSongsCatalog } from '../data';
import { parseSyncedLyrics, getActiveLyricIndex, formatLyricTime, LyricLine } from '../utils/lyricsParser';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';
import { worshipSynth } from '../utils/audioSynth';
import AiTranscriberModal from './AiTranscriberModal';

export type RepeatMode = 'off' | 'one';

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
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffling, setIsShuffling] = useState(false);
  const [showLyrics, setShowLyrics] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [userScrolledManually, setUserScrolledManually] = useState(false);
  const [isUsingSynth, setIsUsingSynth] = useState(false);
  const [songs, setSongs] = useState<Song[]>(() => crossworshipSongsCatalog);

  // Queue state is retained only for backwards-compatible local state during this release.
  // Playback now always follows the catalogue and its selected playback mode.
  const [userQueue, setUserQueue] = useState<Song[]>([]);
  const [activeRightTab, setActiveRightTab] = useState<'lyrics' | 'queue'>('lyrics');
  const [inCardActiveTab, setInCardActiveTab] = useState<Record<string, 'lyrics' | 'queue'>>({});
  const [showFloatingQueue, setShowFloatingQueue] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);
  const userQueueRef = useRef<Song[]>([]);
  userQueueRef.current = userQueue;

  // AI Pre-Listening & Transcription States
  const [isAiTranscriberOpen, setIsAiTranscriberOpen] = useState(false);
  const [transcriberTargetSong, setTranscriberTargetSong] = useState<Song | null>(null);

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
  const rafAnimationRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const lyricLineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inCardLyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const inCardLyricLineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const userScrollTimeoutRef = useRef<any>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const programmaticTimeoutRef = useRef<any>(null);

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

  // Fetch songs strictly from Supabase public."Songs" table, fallback to catalog if empty
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
          if (data && data.length > 0) {
            const mapped: Song[] = data.map((song: any) => ({
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
          } else {
            setSongs(crossworshipSongsCatalog);
          }
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

  // Filter list by search query
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
      handleTrackEnded();
    };

    const handleError = () => {
      if (isPlaying && currentSong) {
        startSynthPlayback(currentSong);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // High-frequency 60fps RAF ticker while audio is actively playing for instantaneous lyrics tracking
    let isTracking = true;
    const ticker = () => {
      if (isTracking && isPlaying && !isUsingSynth && audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        rafAnimationRef.current = requestAnimationFrame(ticker);
      }
    };

    if (isPlaying && !isUsingSynth) {
      rafAnimationRef.current = requestAnimationFrame(ticker);
    }

    return () => {
      isTracking = false;
      if (rafAnimationRef.current) {
        cancelAnimationFrame(rafAnimationRef.current);
        rafAnimationRef.current = null;
      }
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      worshipSynth.stop();
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    };
  }, [currentSong, isShuffling, repeatMode, isUsingSynth, isPlaying, playlist]);

  // Synth Fallback Logic (High frequency ticker)
  const startSynthPlayback = (song: Song) => {
    setIsUsingSynth(true);
    worshipSynth.playTrack(song.id, isMuted ? 0 : volume);
    
    const [mins, secs] = (song.duration || '4:30').split(':').map(Number);
    const totalSecs = (mins || 4) * 60 + (secs || 30);
    setDuration(totalSecs);

    if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    synthTimerRef.current = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= totalSecs) {
          handleTrackEnded();
          return 0;
        }
        return prev + 0.1;
      });
    }, 100);
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
        console.warn('Direct stream playback fallback to Web Audio Synth:', err);
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
    setUserScrolledManually(false);
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

  // Toast Helper for user notifications
  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Add song to end of queue
  const addToQueue = (song: Song, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    setUserQueue(prev => [...prev, song]);
    showToast(`Added "${song.title}" to Up Next queue`);
  };

  // Play next (insert at front of queue)
  const playNextInQueue = (song: Song, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    setUserQueue(prev => [song, ...prev]);
    showToast(`"${song.title}" will play next`);
  };

  // Open AI Transcriber Modal for a song
  const openAiTranscriber = (targetSong?: Song, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    setTranscriberTargetSong(targetSong || currentSong || (songs.length > 0 ? songs[0] : null));
    setIsAiTranscriberOpen(true);
  };

  // Apply AI Transcribed Lyrics to song and sync live
  const handleApplyAiLyrics = (songId: string, syncedLyrics: string) => {
    setSongs(prev => prev.map(s => s.id === songId ? { ...s, lyrics: syncedLyrics } : s));
    if (currentSong && currentSong.id === songId) {
      setCurrentSong(prev => prev ? { ...prev, lyrics: syncedLyrics } : null);
    }

    try {
      const saved = localStorage.getItem('gec_custom_song_lyrics');
      const dict = saved ? JSON.parse(saved) : {};
      dict[songId] = syncedLyrics;
      localStorage.setItem('gec_custom_song_lyrics', JSON.stringify(dict));
    } catch (e) {
      console.error('Failed to cache lyrics locally', e);
    }

    if (supabase) {
      supabase
        .from('Songs')
        .update({ description: syncedLyrics })
        .eq('id', songId)
        .then(({ error }) => {
          if (error) console.warn('Supabase lyric sync note:', error);
        });
    }

    const matched = songs.find(s => s.id === songId);
    showToast(`✨ AI Synced Lyrics applied to "${matched?.title || 'Song'}"!`);
  };

  // Remove from custom queue
  const removeFromQueue = (index: number, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    setUserQueue(prev => prev.filter((_, i) => i !== index));
    showToast("Removed track from queue");
  };

  // Move item in queue up/down
  const moveQueueItem = (fromIndex: number, toIndex: number, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    if (toIndex < 0 || toIndex >= userQueue.length) return;
    setUserQueue(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  // Clear entire user queue
  const clearQueue = (e?: MouseEvent) => {
    if (e) e.stopPropagation();
    setUserQueue([]);
    showToast("Queue cleared");
  };

  // Play directly from user queue
  const playFromQueue = (index: number, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    const targetSong = userQueue[index];
    if (!targetSong) return;
    setUserQueue(prev => prev.slice(index + 1));
    setCurrentSong(targetSong);
    setCurrentTime(0);
    setUserScrolledManually(false);
    playAudioTrack(targetSong);
  };

  // Natural upcoming tracks from playlist (after current song)
  const upcomingPlaylistSongs = useMemo(() => {
    if (!currentSong || playlist.length <= 1) return [];
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    if (currentIndex === -1) return playlist;
    const after = playlist.slice(currentIndex + 1);
    const before = playlist.slice(0, currentIndex);
    return [...after, ...before];
  }, [playlist, currentSong]);

  // Track Ended Handler: repeat-one replays; otherwise continue through the catalogue.
  const handleTrackEnded = () => {
    if (!currentSong) return;

    // Repeat One: Replay the active song from beginning
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      setCurrentTime(0);
      setUserScrolledManually(false);
      playAudioTrack(currentSong);
      return;
    }

    if (playlist.length === 0) return;

    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    const isLastTrack = currentIndex === playlist.length - 1;

    // Repeat off finishes naturally at the end of the catalogue.
    if (repeatMode === 'off' && isLastTrack && !isShuffling) {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    // Normal mode advances in catalogue order; shuffle selects a different song.
    handleNext();
  };

  // Next Track Logic (catalogue order or a different shuffled song)
  const handleNext = () => {
    if (playlist.length === 0) return;

    let nextIndex = 0;
    if (isShuffling) {
      const currentIndex = currentSong ? playlist.findIndex(s => s.id === currentSong.id) : -1;
      nextIndex = playlist.length === 1
        ? 0
        : (currentIndex + 1 + Math.floor(Math.random() * (playlist.length - 1))) % playlist.length;
    } else if (currentSong) {
      const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
      nextIndex = (currentIndex + 1) % playlist.length;
    }

    const nextSong = playlist[nextIndex];
    setCurrentSong(nextSong);
    setCurrentTime(0);
    setUserScrolledManually(false);
    playAudioTrack(nextSong);
  };

  // Previous Track Logic
  const handlePrev = () => {
    if (playlist.length === 0 || !currentSong) return;
    
    // If audio is past 3 seconds, previous restarts the current track first
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    let prevIndex = 0;
    if (isShuffling) {
      const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
      prevIndex = playlist.length === 1
        ? 0
        : (currentIndex + 1 + Math.floor(Math.random() * (playlist.length - 1))) % playlist.length;
    } else {
      const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
      prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
    }

    const prevSong = playlist[prevIndex];
    setCurrentSong(prevSong);
    setCurrentTime(0);
    setUserScrolledManually(false);
    playAudioTrack(prevSong);
  };

  // Toggle Repeat Mode between Off and the current song.
  const toggleRepeatMode = () => {
    setRepeatMode(prev => prev === 'off' ? 'one' : 'off');
  };

  // Seek bar handler
  const handleSeekChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (!isUsingSynth && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setUserScrolledManually(false);
  };

  // Fast forward or rewind by delta seconds (e.g. +10s, -10s)
  const handleSkipTime = (deltaSeconds: number) => {
    const maxDur = duration || 240;
    const newTime = Math.max(0, Math.min(maxDur, currentTime + deltaSeconds));
    setCurrentTime(newTime);
    if (!isUsingSynth && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setUserScrolledManually(false);
  };

  // Jump to specific lyric timestamp on line click
  const handleJumpToLyric = (lineStartTime: number) => {
    const maxDur = duration || 240;
    const target = Math.max(0, Math.min(maxDur, lineStartTime));
    setCurrentTime(target);
    if (!isUsingSynth && audioRef.current) {
      audioRef.current.currentTime = target;
    }
    if (!isPlaying && currentSong) {
      playAudioTrack(currentSong);
    }
    setUserScrolledManually(false);
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

  // Synchronized Lyrics Engine
  const parsedLyrics: LyricLine[] = useMemo(() => {
    if (!currentSong || !currentSong.lyrics) return [];
    const songDur = duration > 0 ? duration : (() => {
      const [m, s] = (currentSong.duration || '4:30').split(':').map(Number);
      return (m || 4) * 60 + (s || 30);
    })();
    return parseSyncedLyrics(currentSong.lyrics, songDur);
  }, [currentSong?.lyrics, currentSong?.duration, duration]);

  const activeLyricIndex = useMemo(() => {
    return getActiveLyricIndex(parsedLyrics, currentTime);
  }, [parsedLyrics, currentTime]);

  // Fast, responsive programmatic scrolling with custom cubic-out easing (160ms)
  const scrollToLyricIndex = (index: number, immediate: boolean = false) => {
    if (index < 0) return;

    // Helper to scroll a specific container and element reference
    const scrollContainer = (container: HTMLDivElement | null, activeEl: HTMLDivElement | null) => {
      if (!container || !activeEl) return;
      const containerHeight = container.clientHeight;
      const elementTop = activeEl.offsetTop;
      const elementHeight = activeEl.clientHeight;
      // Optical focus line: 38% from top provides perfect viewing angle for reading ahead
      const targetScrollTop = Math.max(0, elementTop - (containerHeight * 0.38) + (elementHeight / 2));

      if (immediate) {
        container.scrollTop = targetScrollTop;
        return;
      }

      const startScrollTop = container.scrollTop;
      const distance = targetScrollTop - startScrollTop;
      if (Math.abs(distance) < 2) return;

      const startTime = performance.now();
      const duration = 160;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        container.scrollTop = startScrollTop + distance * easeOut;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          container.scrollTop = targetScrollTop;
        }
      };
      requestAnimationFrame(step);
    };

    isProgrammaticScrollRef.current = true;
    scrollContainer(lyricsContainerRef.current, lyricLineRefs.current[index]);
    scrollContainer(inCardLyricsContainerRef.current, inCardLyricLineRefs.current[index]);

    if (programmaticTimeoutRef.current) clearTimeout(programmaticTimeoutRef.current);
    programmaticTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 200);
  };

  // Immediate and responsive Automatic Scrolling when activeLyricIndex changes or on seek/rewind/fast-forward
  useEffect(() => {
    if (!autoScroll || userScrolledManually || activeLyricIndex < 0) return;
    scrollToLyricIndex(activeLyricIndex, false);
  }, [activeLyricIndex, autoScroll, userScrolledManually]);

  // Handle user manual scroll interaction inside lyrics container
  const handleLyricsUserInteraction = () => {
    if (!autoScroll) return;
    if (isProgrammaticScrollRef.current) return;
    setUserScrolledManually(true);
    if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
    userScrollTimeoutRef.current = setTimeout(() => {
      setUserScrolledManually(false);
      // Seamlessly snap back to current line when timeout expires
      scrollToLyricIndex(activeLyricIndex, false);
    }, 2800); // Resumes smooth auto-scroll after 2.8 seconds
  };

  const reCenterLyrics = () => {
    setUserScrolledManually(false);
    scrollToLyricIndex(activeLyricIndex, false);
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
        try {
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
        } catch {
          window.open(songUrl, '_blank');
        }
      }
    } catch (error: any) {
      console.warn('File download fallback:', error);
    } finally {
      setIsDownloading(prev => ({ ...prev, [songItem.id]: false }));
    }
  };

  return (
    <div 
      className="min-h-screen text-[#F7F5F0] relative transition-colors duration-500 bg-[#3A2312]"
      id="songs-main-page"
    >
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans relative z-10">
        
        {/* Header Banner */}
        <div 
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 pb-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span 
                className="p-1.5 rounded-lg border shadow-sm flex items-center justify-center bg-[#25160B] border-[#E4DCD0]/30 text-[#F7F5F0]"
              >
                <Music className="h-4 w-4 text-[#A37F3B]" />
              </span>
              <span className="text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 text-[#F7F5F0] font-mono">
                Crossworship Ministry • God's Edifice Church
              </span>
            </div>
            
            {/* Headline */}
            <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-[#F7F5F0] tracking-tight drop-shadow-sm">
              worship with us in Psalms and Spiritual songs
            </h2>

            <p className="text-sm mt-3 max-w-2xl text-[#F7F5F0]/80 font-medium font-sans">
              Listen and get edified to Spiritual songs inspired by the Holy Ghost with live synchronized lyrics.
            </p>
          </div>

          {/* Status / Admin Portal Quick Link & AI Transcriber Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openAiTranscriber()}
              className="px-4 py-2.5 rounded-xl border text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md bg-gradient-to-r from-[#A37F3B] to-[#8F6D2F] hover:from-[#B8924A] hover:to-[#A37F3B] border-[#E5B869]/50 cursor-pointer active:scale-95"
              title="Pre-listen to songs and transcribe with AI"
            >
              <Sparkles className="h-4 w-4 text-[#FFF8E7] animate-pulse" />
              <span>AI Pre-Listen & Transcribe</span>
            </button>

            {isAdmin && (
              <a
                href="/crosswordmedia"
                className="px-4 py-2.5 rounded-xl border text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md bg-[#25160B] hover:bg-[#3A2312] border-[#4A2D17]"
                title="Manage and upload songs in Admin Portal"
              >
                <ShieldCheck className="h-4 w-4 text-[#A37F3B]" />
                <span>Admin Manager</span>
                <ExternalLink className="h-3 w-3 text-[#A37F3B]" />
              </a>
            )}
          </div>
        </div>

        {/* Main Grid: Playlist & Player */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Playlist Section (Left side: 7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A7463]" />
              <input
                type="text"
                placeholder="Search by song title, singer, album, or lyrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded-2xl py-3 pl-11 pr-4 text-xs sm:text-sm text-[#3A2312] placeholder-[#8A7463]/70 focus:outline-none focus:border-[#A37F3B] transition-all shadow-md border-[#E1D6C7]"
                style={{ backgroundColor: 'rgba(247, 245, 240, 0.90)' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono hover:underline px-2 py-1 text-[#8A7463] hover:text-[#3A2312]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Playlist Container */}
            <div 
              className="border rounded-3xl p-4 sm:p-5 shadow-xl space-y-3 border-[#E1D6C7]"
              style={{ backgroundColor: 'rgba(247, 245, 240, 0.90)' }}
            >
              {/* Header Bar */}
              <div 
                className="flex items-center justify-between pb-3 px-3 border-b border-[#E1D6C7]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#A37F3B]" />
                  <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#3A2312]">
                    Worship Catalogue
                  </span>
                </div>
                <span className="text-[11px] font-mono font-medium text-[#3A2312] px-2.5 py-0.5 rounded-md bg-white/70 border border-[#E1D6C7]">
                  {filteredPlaylist.length} {filteredPlaylist.length === 1 ? 'Track' : 'Tracks'}
                </span>
              </div>

              {/* Column Titles for desktop */}
              <div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#8A7463] border-b border-[#E1D6C7]/70">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-6">Title & Artist</div>
                <div className="col-span-3">Album</div>
                <div className="col-span-2 text-right">Time / Action</div>
              </div>

              {filteredPlaylist.length === 0 ? (
                <div className="py-16 text-center text-[#737C82] space-y-3 px-4">
                  <Music className="h-12 w-12 mx-auto text-[#A37F3B]" />
                  <p className="text-base font-semibold text-[#1C242B]">
                    {searchQuery ? 'No songs matching your search' : 'No songs currently in the catalog'}
                  </p>
                  <p className="text-xs text-[#737C82] max-w-sm mx-auto">
                    {searchQuery
                      ? 'Try adjusting your search terms or clearing the filter.'
                      : 'Church administrators can upload audio tracks, worship anthems, and lyrics directly in the Admin Portal.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPlaylist.map((song, index) => {
                    const isCurrent = currentSong?.id === song.id;
                    const isCurrentPlaying = isCurrent && isPlaying;

                    return (
                      <div
                        key={song.id}
                        className={`group relative rounded-2xl transition-all duration-300 border overflow-hidden ${
                          isCurrent
                            ? 'shadow-xl border-[#A37F3B] bg-white ring-2 ring-[#A37F3B]/30'
                            : 'hover:bg-white/90 border-[#E1D6C7]/80 hover:border-[#A37F3B]/60 bg-white/60 shadow-xs'
                        }`}
                      >
                        {/* Active Left Indicator Bar */}
                        {isCurrent && (
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#A37F3B]" />
                        )}

                        {/* Top Song Summary Row */}
                        <div 
                          onClick={() => handleSelectSong(song)}
                          className="flex items-center justify-between p-3 sm:p-4 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1 pl-1">
                            {/* Track Number / Wave Indicator */}
                            <div className="w-7 text-center shrink-0 flex items-center justify-center">
                              {isCurrentPlaying ? (
                                <div className="flex items-end gap-0.5 h-4">
                                  <span className="w-1 animate-[bounce_0.8s_infinite_100ms] h-full rounded-full bg-[#A37F3B]" />
                                  <span className="w-1 animate-[bounce_0.8s_infinite_300ms] h-2/3 rounded-full bg-[#3A2312]" />
                                  <span className="w-1 animate-[bounce_0.8s_infinite_200ms] h-1/2 rounded-full bg-[#A37F3B]" />
                                </div>
                              ) : (
                                <span className={`text-xs font-mono font-bold ${isCurrent ? 'text-[#A37F3B]' : 'text-[#8A7463] group-hover:text-[#3A2312]'}`}>
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                              )}
                            </div>

                            {/* Cover Artwork with Quick Play/Pause */}
                            <div 
                              className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border bg-[#FAF7F2] shadow-xs"
                              style={{ borderColor: isCurrent ? '#A37F3B' : 'rgba(225, 214, 199, 0.9)' }}
                            >
                              <img
                                src={song.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop'}
                                alt={song.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <div className={`absolute inset-0 bg-[#3A2312]/60 flex items-center justify-center transition-opacity ${
                                isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}>
                                {isCurrentPlaying ? (
                                  <Pause className="h-4 w-4 fill-current text-white" />
                                ) : (
                                  <Play className="h-4 w-4 fill-current text-white ml-0.5" />
                                )}
                              </div>
                            </div>

                            {/* Title, Artist, & Album */}
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-sm sm:text-base font-bold truncate leading-snug ${
                                  isCurrent ? 'text-[#3A2312]' : 'text-[#3A2312] group-hover:text-[#A37F3B] transition-colors'
                                }`}>
                                  {song.title}
                                </h4>
                                {isCurrent && (
                                  <span className="inline-flex text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#A37F3B] text-white shadow-xs">
                                    {isPlaying ? 'Playing' : 'Active'}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[#8A7463] truncate mt-0.5">
                                <span className="font-medium text-[#5E4736] truncate">{song.artist}</span>
                                <span>•</span>
                                <span className="truncate text-[#8A7463]/90">{song.album}</span>
                              </div>
                            </div>

                            {/* Album Badge (Desktop) */}
                            <div className="hidden md:block w-36 shrink-0 truncate text-xs text-[#8A7463] pr-2">
                              <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E1D6C7] truncate inline-block max-w-full text-[#6B5441] font-medium">
                                {song.album}
                              </span>
                            </div>
                          </div>

                          {/* Quick Right controls: Duration, AI Transcribe, and Download */}
                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                            <span className="text-xs font-mono text-[#8A7463] font-medium hidden sm:inline-block w-12 text-right">
                              {song.duration || '4:30'}
                            </span>

                            {/* AI Pre-Listen & Transcribe Button */}
                            <button
                              type="button"
                              onClick={(e) => openAiTranscriber(song, e)}
                              className="p-2 rounded-xl transition-all cursor-pointer border border-transparent hover:border-[#A37F3B]/60 hover:bg-[#FAF7F2] text-[#8A7463] hover:text-[#A37F3B] flex items-center gap-1 group/ai"
                              title="Pre-listen & transcribe lyrics with AI"
                            >
                              <Sparkles className="h-4 w-4 text-[#A37F3B] group-hover/ai:animate-spin" />
                            </button>

                            {/* Download Button */}
                            <button
                              type="button"
                              onClick={(e) => triggerSongDownload(song, e)}
                              disabled={isDownloading[song.id]}
                              className="p-2 rounded-xl transition-all cursor-pointer hover:bg-[#FAF7F2] border border-transparent hover:border-[#E1D6C7] text-[#8A7463] hover:text-[#A37F3B]"
                              title="Download lyrics"
                            >
                              {userSongDownloads.some(s => s.id === song.id) ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                              ) : isDownloading[song.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin text-[#A37F3B]" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* EMBEDDED IN-CARD PLAYER (Reveals directly inside the active song card) */}
                        {isCurrent && (
                          <div className="border-t border-[#E1D6C7] bg-[#25160B] text-[#F7F5F0] p-4 sm:p-5 space-y-4">
                            
                            {/* Player Subheader Pill Status */}
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-ping' : ''} bg-[#A37F3B]`} />
                                <span className="font-mono font-bold text-[#E5B869] text-[11px] uppercase tracking-wider">
                                  {isPlaying ? 'Now Playing in Church Deck' : 'Paused - Click Play to Resume'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {(repeatMode !== 'off' || isShuffling) && (
                                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono bg-[#1D1108] border-[#A37F3B]/60 text-[#E5B869]">
                                    {repeatMode === 'one' && (
                                      <span className="flex items-center gap-1">
                                        <Repeat1 className="h-3 w-3 text-[#A37F3B]" />
                                        <span>Repeat 1</span>
                                      </span>
                                    )}
                                    {repeatMode === 'all' && (
                                      <span className="flex items-center gap-1">
                                        <Repeat className="h-3 w-3 text-[#A37F3B]" />
                                        <span>Repeat All</span>
                                      </span>
                                    )}
                                    {isShuffling && (
                                      <span className="flex items-center gap-1 pl-1 border-l border-[#A37F3B]/40">
                                        <Shuffle className="h-3 w-3 text-[#A37F3B]" />
                                        <span>Shuffle</span>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Scrubber / Progress Bar */}
                            <div className="space-y-1.5">
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
                                    accentColor: '#A37F3B',
                                    backgroundColor: '#1D1108'
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-[11px] font-mono font-semibold">
                                <span className="text-[#E5B869]">{formatTime(currentTime)}</span>
                                <span className="text-[#F7F5F0]/70">{formatTime(duration || 0)}</span>
                              </div>
                            </div>

                            {/* Main Inline Controls */}
                            <div className="flex items-center justify-between gap-1 sm:gap-2 pt-1">
                              {/* Shuffle Button */}
                              <button
                                type="button"
                                onClick={() => setIsShuffling(!isShuffling)}
                                className="p-2.5 rounded-xl transition-all cursor-pointer border"
                                style={{
                                  background: isShuffling ? '#A37F3B' : '#1D1108',
                                  borderColor: isShuffling ? '#A37F3B' : '#4A2D17',
                                  color: isShuffling ? '#FFFFFF' : '#F7F5F0'
                                }}
                                title={isShuffling ? 'Shuffle is On' : 'Shuffle is Off'}
                              >
                                <Shuffle className="h-4 w-4" />
                              </button>

                              {/* Rewind 10s */}
                              <button
                                type="button"
                                onClick={() => handleSkipTime(-10)}
                                className="p-2.5 rounded-xl bg-[#1D1108] border border-[#4A2D17] hover:border-[#A37F3B] text-[#F7F5F0] hover:text-[#A37F3B] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                                title="Rewind 10 seconds"
                              >
                                <RotateCcw className="h-4 w-4" />
                                <span className="text-[9px] font-mono font-bold">10s</span>
                              </button>

                              {/* Previous Song */}
                              <button
                                type="button"
                                onClick={handlePrev}
                                className="p-2.5 rounded-full hover:bg-[#3A2312] text-[#F7F5F0] transition-all cursor-pointer active:scale-95"
                                title="Previous Song"
                              >
                                <SkipBack className="h-5 w-5" />
                              </button>

                              {/* Master Play / Pause Button */}
                              <button
                                type="button"
                                onClick={togglePlay}
                                className="p-3.5 sm:p-4 rounded-full text-white shadow-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center hover:scale-105 bg-[#A37F3B] hover:bg-[#8F6D2F] shadow-[#A37F3B]/30"
                                title={isPlaying ? 'Pause Song' : 'Play Song'}
                              >
                                {isPlaying ? (
                                  <Pause className="h-6 w-6 fill-current text-white" />
                                ) : (
                                  <Play className="h-6 w-6 fill-current ml-0.5 text-white" />
                                )}
                              </button>

                              {/* Next Song */}
                              <button
                                type="button"
                                onClick={handleNext}
                                className="p-2.5 rounded-full hover:bg-[#3A2312] text-[#F7F5F0] transition-all cursor-pointer active:scale-95"
                                title="Next Song (Plays consecutively)"
                              >
                                <SkipForward className="h-5 w-5" />
                              </button>

                              {/* Fast-Forward 10s */}
                              <button
                                type="button"
                                onClick={() => handleSkipTime(10)}
                                className="p-2.5 rounded-xl bg-[#1D1108] border border-[#4A2D17] hover:border-[#A37F3B] text-[#F7F5F0] hover:text-[#A37F3B] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                                title="Fast Forward 10 seconds"
                              >
                                <span className="text-[9px] font-mono font-bold">10s</span>
                                <RotateCw className="h-4 w-4" />
                              </button>

                              {/* Repeat Mode (Off -> All -> One) */}
                              <button
                                type="button"
                                onClick={toggleRepeatMode}
                                className="p-2.5 rounded-xl transition-all cursor-pointer border relative flex items-center justify-center active:scale-95"
                                style={{
                                  background: repeatMode !== 'off' ? '#A37F3B' : '#1D1108',
                                  borderColor: repeatMode !== 'off' ? '#A37F3B' : '#4A2D17',
                                  color: repeatMode !== 'off' ? '#FFFFFF' : '#F7F5F0'
                                }}
                                title={
                                  repeatMode === 'off'
                                    ? 'Repeat: Off (Plays once through)'
                                    : repeatMode === 'all'
                                    ? 'Repeat: All Tracks (Loops consecutive playlist)'
                                    : 'Repeat: Current Track (Loops active song)'
                                }
                              >
                                {repeatMode === 'one' ? (
                                  <Repeat1 className="h-4 w-4" />
                                ) : (
                                  <Repeat className="h-4 w-4" />
                                )}
                                {repeatMode === 'one' && (
                                  <span className="absolute -top-1 -right-1 text-[8px] font-mono font-bold bg-[#150B05] text-[#E5B869] border border-[#A37F3B] rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs">
                                    1
                                  </span>
                                )}
                              </button>
                            </div>

                            {/* Secondary Row: Volume, Lyrics Toggle, and Download */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#4A2D17]">
                              {/* Volume Controls */}
                              <div className="flex items-center gap-2 min-w-[140px] max-w-[200px] flex-1">
                                <button
                                  type="button"
                                  onClick={() => setIsMuted(!isMuted)}
                                  className="text-[#A37F3B] hover:text-white transition-colors cursor-pointer"
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
                                    accentColor: '#A37F3B',
                                    backgroundColor: '#1D1108'
                                  }}
                                />
                                <span className="text-[10px] font-mono w-8 text-right font-medium text-[#F7F5F0]">
                                  {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                                </span>
                              </div>

                              {/* Download lyrics */}
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => triggerSongDownload(song)}
                                  disabled={isDownloading[song.id]}
                                  className="text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer bg-[#A37F3B] hover:bg-[#8F6D2F] border-[#A37F3B] text-white font-mono shadow-xs"
                                >
                                  {userSongDownloads.some(s => s.id === song.id) ? (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-white" />
                                      <span>Saved</span>
                                    </>
                                  ) : isDownloading[song.id] ? (
                                    <>
                                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                                      <span>Saving</span>
                                    </>
                                  ) : (
                                    <>
                                      <FileText className="h-3.5 w-3.5 text-white" />
                                      <span>Download Lyrics</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* IN-CARD UP NEXT QUEUE PANEL */}
                            {inCardActiveTab[song.id] === 'queue' ? (
                              <div className="pt-3 border-t border-[#4A2D17] space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <ListMusic className="h-3.5 w-3.5 text-[#A37F3B]" />
                                    <span className="font-mono text-xs font-bold uppercase text-[#E5B869]">
                                      Up Next Worship Queue
                                    </span>
                                  </div>

                                  {userQueue.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={clearQueue}
                                      className="px-2 py-1 rounded-md text-[10px] font-mono text-rose-300 hover:text-rose-100 bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/60 transition-all cursor-pointer flex items-center gap-1"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      <span>Clear Queue</span>
                                    </button>
                                  )}
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 py-1 bg-[#180E07] rounded-xl border border-[#4A2D17]/80 p-3">
                                  {/* Custom User Queued Songs */}
                                  {userQueue.length > 0 && (
                                    <div className="space-y-1.5 mb-3">
                                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#A37F3B] font-bold px-1">
                                        Your Queued Tracks ({userQueue.length})
                                      </div>
                                      {userQueue.map((queuedSong, qIdx) => (
                                        <div
                                          key={`in-card-queue-${queuedSong.id}-${qIdx}`}
                                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#25160B] border border-[#A37F3B]/50 text-xs"
                                        >
                                          <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <span className="text-[10px] font-mono text-[#A37F3B] w-4 text-center font-bold">
                                              {qIdx + 1}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                              <p className="font-bold text-white truncate">{queuedSong.title}</p>
                                              <p className="text-[10px] text-[#A37F3B] truncate">{queuedSong.artist}</p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-1 shrink-0">
                                            <button
                                              type="button"
                                              onClick={(e) => moveQueueItem(qIdx, qIdx - 1, e)}
                                              disabled={qIdx === 0}
                                              className="p-1 rounded hover:bg-[#3A2312] text-[#F7F5F0] disabled:opacity-30 cursor-pointer"
                                              title="Move Up"
                                            >
                                              <ArrowUp className="h-3 w-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={(e) => moveQueueItem(qIdx, qIdx + 1, e)}
                                              disabled={qIdx === userQueue.length - 1}
                                              className="p-1 rounded hover:bg-[#3A2312] text-[#F7F5F0] disabled:opacity-30 cursor-pointer"
                                              title="Move Down"
                                            >
                                              <ArrowDown className="h-3 w-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={(e) => playFromQueue(qIdx, e)}
                                              className="p-1 rounded bg-[#A37F3B] text-white hover:bg-[#8F6D2F] cursor-pointer ml-1"
                                              title="Play Now"
                                            >
                                              <Play className="h-3 w-3 fill-current" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={(e) => removeFromQueue(qIdx, e)}
                                              className="p-1 rounded hover:bg-rose-950/50 text-rose-300 cursor-pointer ml-0.5"
                                              title="Remove from queue"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Subsequent Playlist Tracks */}
                                  <div className="space-y-1.5">
                                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A7463] font-semibold px-1">
                                      {userQueue.length > 0 ? 'Following After Queue (Playlist)' : 'Next in Playlist Order'}
                                    </div>
                                    {upcomingPlaylistSongs.slice(0, 5).map((nextTrack, nIdx) => (
                                      <div
                                        key={`in-card-upcoming-${nextTrack.id}-${nIdx}`}
                                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#1D1108]/60 hover:bg-[#1D1108] border border-[#4A2D17]/50 text-xs transition-colors"
                                      >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                          <span className="text-[10px] font-mono text-[#8A7463] w-4 text-center">
                                            {nIdx + 1}
                                          </span>
                                          <div className="min-w-0 flex-1">
                                            <p className="font-medium text-[#F7F5F0] truncate">{nextTrack.title}</p>
                                            <p className="text-[10px] text-[#8A7463] truncate">{nextTrack.artist}</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <span className="text-[10px] font-mono text-[#8A7463] hidden sm:inline">
                                            {nextTrack.duration || '4:30'}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={(e) => addToQueue(nextTrack, e)}
                                            className="px-2 py-0.5 rounded bg-[#25160B] border border-[#A37F3B]/50 hover:bg-[#A37F3B] hover:text-white text-[#A37F3B] text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-0.5"
                                            title="Add to queue"
                                          >
                                            <Plus className="h-2.5 w-2.5" />
                                            <span>Queue</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleSelectSong(nextTrack)}
                                            className="p-1 rounded bg-[#3A2312] hover:bg-[#A37F3B] text-white transition-all cursor-pointer"
                                            title="Play Immediately"
                                          >
                                            <Play className="h-3 w-3 fill-current" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* IN-CARD SYNCHRONIZED LYRICS BOARD */
                              (showLyrics && currentSong && currentSong.lyrics) ? (
                              <div className="pt-3 border-t border-[#4A2D17] space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-[#A37F3B]" />
                                    <span className="font-mono text-xs font-bold uppercase text-[#E5B869]">
                                      Synchronized Lyrics
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {userScrolledManually && (
                                      <button
                                        type="button"
                                        onClick={reCenterLyrics}
                                        className="px-2 py-1 rounded-md text-[10px] font-mono bg-[#A37F3B] hover:bg-[#8F6D2F] text-white flex items-center gap-1 transition-all shadow-xs cursor-pointer animate-pulse"
                                        title="Snap back to current line"
                                      >
                                        <Navigation className="h-3 w-3" />
                                        <span>Re-center</span>
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = !autoScroll;
                                        setAutoScroll(next);
                                        if (next) setUserScrolledManually(false);
                                      }}
                                      className={`px-2 py-1 rounded-md text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                        autoScroll 
                                          ? 'bg-[#3A2312] border-[#A37F3B] text-[#A37F3B]' 
                                          : 'bg-[#1D1108] border-[#4A2D17] text-[#8A7463]'
                                      }`}
                                    >
                                      <Sparkles className="h-3 w-3" />
                                      <span>{autoScroll ? 'Auto-Scroll: ON' : 'Auto-Scroll: OFF'}</span>
                                    </button>
                                  </div>
                                </div>

                                <div 
                                  ref={inCardLyricsContainerRef}
                                  onScroll={handleLyricsUserInteraction}
                                  onWheel={handleLyricsUserInteraction}
                                  onTouchMove={handleLyricsUserInteraction}
                                  onPointerDown={handleLyricsUserInteraction}
                                  className="space-y-2 text-center max-h-[300px] overflow-y-auto pr-1 py-3 select-none bg-[#180E07] rounded-xl border border-[#4A2D17]/80 p-3"
                                >
                                  {parsedLyrics.length > 0 ? (
                                    parsedLyrics.map((line, idx) => {
                                      const isActive = idx === activeLyricIndex;
                                      const isPast = idx < activeLyricIndex;

                                      if (line.isHeader) {
                                        return (
                                          <div 
                                            key={line.id}
                                            ref={(el) => (inCardLyricLineRefs.current[idx] = el)}
                                            className="py-1"
                                          >
                                            <span className="inline-block px-3 py-0.5 bg-[#1D1108] text-[#A37F3B] border border-[#4A2D17] rounded-full text-[10px] font-mono font-bold uppercase tracking-widest shadow-xs">
                                              {line.text}
                                            </span>
                                          </div>
                                        );
                                      }

                                      return (
                                        <div
                                          key={line.id}
                                          ref={(el) => (inCardLyricLineRefs.current[idx] = el)}
                                          onClick={() => handleJumpToLyric(line.startTime)}
                                          className={`group relative px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between gap-2 text-center ${
                                            isActive
                                              ? 'bg-[#3A2312] border border-[#A37F3B] shadow-md text-white scale-[1.01] ring-1 ring-[#A37F3B]/40'
                                              : isPast
                                              ? 'text-[#F7F5F0]/70 hover:text-white hover:bg-[#1D1108]/60 border border-transparent'
                                              : 'text-[#F7F5F0]/40 hover:text-white hover:bg-[#1D1108]/60 border border-transparent'
                                          }`}
                                          title={`Jump to ${formatLyricTime(line.startTime)}`}
                                        >
                                          <span 
                                            className={`text-[9px] font-mono transition-opacity shrink-0 w-8 text-left ${
                                              isActive 
                                                ? 'text-[#A37F3B] font-bold opacity-100' 
                                                : 'text-[#8A7463] opacity-0 group-hover:opacity-100'
                                            }`}
                                          >
                                            {formatLyricTime(line.startTime)}
                                          </span>

                                          <p 
                                            className={`flex-1 text-xs sm:text-sm leading-relaxed tracking-wide ${
                                              isActive
                                                ? 'font-bold text-[#FFF8E7]'
                                                : 'font-normal'
                                            }`}
                                          >
                                            {line.text}
                                          </p>

                                          <div className="shrink-0 w-8 text-right flex justify-end">
                                            {isActive && (
                                              <span className="flex h-2 w-2 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A37F3B] opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A37F3B]" />
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="py-6 text-center text-xs text-[#F7F5F0]/60 italic">
                                      {currentSong.lyrics}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null)}

                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Active Player Card & Live Synced Lyrics (Right side: 5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">

            {/* Master Player Deck */}
            <div 
              className="border rounded-3xl p-6 shadow-2xl space-y-6 text-[#F7F5F0] bg-[#25160B] border-[#4A2D17]"
            >

              {currentSong ? (
                <div className="space-y-6">

                  {/* Album Cover & Status */}
                  <div 
                    className="relative aspect-square w-full rounded-2xl overflow-hidden border shadow-xl bg-[#150B05] group border-[#A37F3B]/50"
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
                      className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono shadow-md bg-[#1D1108]/90 border-[#A37F3B]/60"
                    >
                      <span 
                        className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-ping' : ''} bg-[#A37F3B]`}
                      />
                      <span className="text-[#A37F3B] font-semibold">
                        {isPlaying ? 'Now Playing' : 'Paused'}
                      </span>
                    </div>

                    {/* Mode Status Pill (Repeat & Shuffle) */}
                    {(repeatMode !== 'off' || isShuffling) && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono shadow-md bg-[#1D1108]/90 border-[#A37F3B]/60 text-[#E5B869]">
                        {repeatMode === 'one' ? (
                          <span className="flex items-center gap-1">
                            <Repeat1 className="h-3 w-3 text-[#A37F3B]" />
                            <span>Repeat 1</span>
                          </span>
                        ) : repeatMode === 'all' ? (
                          <span className="flex items-center gap-1">
                            <Repeat className="h-3 w-3 text-[#A37F3B]" />
                            <span>Repeat All</span>
                          </span>
                        ) : null}
                        {isShuffling && (
                          <span className="flex items-center gap-1 pl-1 border-l border-[#A37F3B]/40">
                            <Shuffle className="h-3 w-3 text-[#A37F3B]" />
                            <span>Shuffle</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Title & Artist Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-[#25160B]/85 p-3 rounded-xl backdrop-blur-sm border border-[#A37F3B]/40">
                      <h3 className="text-lg font-bold font-display text-[#F7F5F0] leading-tight font-cinzel">
                        {currentSong.title}
                      </h3>
                      <p className="text-xs mt-0.5 font-medium text-[#A37F3B]">
                        {currentSong.artist} • {currentSong.album}
                      </p>
                    </div>
                  </div>

                  {/* Scrubber / Progress Bar (Rewind / Fast-forward compatible) */}
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
                          accentColor: '#A37F3B',
                          backgroundColor: '#1D1108'
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono font-medium">
                      <span className="text-[#A37F3B] font-bold">{formatTime(currentTime)}</span>
                      <span className="text-[#F7F5F0]/70">{formatTime(duration || 0)}</span>
                    </div>
                  </div>

                  {/* Central Playback Controls with 10s Rewind / Fast Forward */}
                  <div className="flex items-center justify-between gap-1">
                    <button
                      onClick={() => setIsShuffling(!isShuffling)}
                      className="p-2.5 rounded-xl transition-all cursor-pointer border"
                      style={{
                        background: isShuffling ? '#A37F3B' : '#1D1108',
                        borderColor: isShuffling ? '#A37F3B' : '#4A2D17',
                        color: isShuffling ? '#FFFFFF' : '#F7F5F0'
                      }}
                      title={isShuffling ? 'Shuffle is On' : 'Shuffle is Off'}
                    >
                      <Shuffle className="h-4 w-4" />
                    </button>

                    {/* Rewind 10 Seconds Button */}
                    <button
                      onClick={() => handleSkipTime(-10)}
                      className="p-2.5 rounded-xl bg-[#1D1108] border border-[#4A2D17] hover:border-[#A37F3B] text-[#F7F5F0] hover:text-[#A37F3B] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                      title="Rewind 10 seconds"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="text-[9px] font-mono font-bold">10s</span>
                    </button>

                    <button
                      onClick={handlePrev}
                      className="p-2.5 rounded-full hover:bg-[#3A2312] text-[#F7F5F0] transition-all cursor-pointer active:scale-95"
                      title="Previous Song"
                    >
                      <SkipBack className="h-5 w-5" />
                    </button>

                    {/* Master Play Button */}
                    <button
                      onClick={togglePlay}
                      className="p-4 sm:p-5 rounded-full text-white shadow-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center hover:scale-105 bg-[#A37F3B] hover:bg-[#8F6D2F] shadow-[#A37F3B]/30"
                      title={isPlaying ? 'Pause Song' : 'Play Song'}
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6 fill-current text-white" />
                      ) : (
                        <Play className="h-6 w-6 fill-current ml-0.5 text-white" />
                      )}
                    </button>

                    <button
                      onClick={handleNext}
                      className="p-2.5 rounded-full hover:bg-[#3A2312] text-[#F7F5F0] transition-all cursor-pointer active:scale-95"
                      title="Next Song"
                    >
                      <SkipForward className="h-5 w-5" />
                    </button>

                    {/* Fast Forward 10 Seconds Button */}
                    <button
                      onClick={() => handleSkipTime(10)}
                      className="p-2.5 rounded-xl bg-[#1D1108] border border-[#4A2D17] hover:border-[#A37F3B] text-[#F7F5F0] hover:text-[#A37F3B] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                      title="Fast Forward 10 seconds"
                    >
                      <span className="text-[9px] font-mono font-bold">10s</span>
                      <RotateCw className="h-4 w-4" />
                    </button>

                    {/* Repeat Mode Button (Off -> All -> One) */}
                    <button
                      onClick={toggleRepeatMode}
                      className="p-2.5 rounded-xl transition-all cursor-pointer border relative flex items-center justify-center active:scale-95"
                      style={{
                        background: repeatMode !== 'off' ? '#A37F3B' : '#1D1108',
                        borderColor: repeatMode !== 'off' ? '#A37F3B' : '#4A2D17',
                        color: repeatMode !== 'off' ? '#FFFFFF' : '#F7F5F0'
                      }}
                      title={
                        repeatMode === 'off'
                          ? 'Repeat: Off (Click to repeat playlist)'
                          : repeatMode === 'all'
                          ? 'Repeat: All Tracks (Click to repeat current track)'
                          : 'Repeat: Current Track (Click to turn off repeat)'
                      }
                      aria-label={`Repeat mode: ${repeatMode}`}
                    >
                      {repeatMode === 'one' ? (
                        <Repeat1 className="h-4 w-4" />
                      ) : (
                        <Repeat className="h-4 w-4" />
                      )}
                      {repeatMode === 'one' && (
                        <span className="absolute -top-1 -right-1 text-[8px] font-mono font-bold bg-[#150B05] text-[#E5B869] border border-[#A37F3B] rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs">
                          1
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Volume Slider & Controls */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="hover:text-white transition-colors cursor-pointer text-[#A37F3B]"
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
                        accentColor: '#A37F3B',
                        backgroundColor: '#1D1108'
                      }}
                    />
                    <span className="text-[10px] font-mono w-8 text-right font-medium text-[#F7F5F0]">
                      {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                    </span>
                  </div>

                  {/* Lyrics, Up Next Queue, AI Transcribe & Download Toggle Bar */}
                  <div 
                    className="flex flex-wrap justify-between items-center pt-3 border-t border-[#4A2D17] gap-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRightTab('queue');
                          setShowLyrics(false);
                        }}
                        className="text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-mono"
                        style={{
                          background: activeRightTab === 'queue' ? '#A37F3B' : '#1D1108',
                          borderColor: '#A37F3B',
                          color: activeRightTab === 'queue' ? '#FFFFFF' : '#F7F5F0'
                        }}
                        title="View & manage up next queue"
                      >
                        <ListMusic className="h-3.5 w-3.5" style={{ color: activeRightTab === 'queue' ? '#FFFFFF' : '#A37F3B' }} />
                        <span>Up Next ({userQueue.length > 0 ? userQueue.length : upcomingPlaylistSongs.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveRightTab('lyrics');
                          setShowLyrics(!showLyrics);
                        }}
                        className="text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-mono"
                        style={{
                          background: (activeRightTab === 'lyrics' && showLyrics) ? '#A37F3B' : '#1D1108',
                          borderColor: '#A37F3B',
                          color: (activeRightTab === 'lyrics' && showLyrics) ? '#FFFFFF' : '#F7F5F0'
                        }}
                      >
                        <FileText className="h-3.5 w-3.5" style={{ color: (activeRightTab === 'lyrics' && showLyrics) ? '#FFFFFF' : '#A37F3B' }} />
                        <span>{showLyrics && activeRightTab === 'lyrics' ? 'Hide Lyrics' : 'Lyrics'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openAiTranscriber(currentSong)}
                        className="text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#A37F3B]/60 bg-[#1D1108] hover:bg-[#3A2312] text-[#E5B869] transition-all cursor-pointer font-mono"
                        title="Pre-listen and re-transcribe with AI"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-[#A37F3B]" />
                        <span>AI Transcribe</span>
                      </button>
                    </div>

                    <button
                      onClick={() => triggerSongDownload(currentSong)}
                      disabled={isDownloading[currentSong.id]}
                      className="text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer hover:bg-[#8F6D2F] shadow-md bg-[#A37F3B] border-[#A37F3B] text-white font-mono"
                    >
                      {userSongDownloads.some(s => s.id === currentSong.id) ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-white" />
                          <span>Saved</span>
                        </>
                      ) : isDownloading[currentSong.id] ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5 text-white" />
                          <span className="font-extrabold">Download</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="text-center py-16 text-[#F7F5F0]/70 space-y-3 px-4">
                  <Disc className="h-12 w-12 mx-auto text-[#A37F3B]" />
                  <p className="text-sm font-semibold text-[#F7F5F0]">No Song Selected</p>
                  <p className="text-xs text-[#F7F5F0]/60 max-w-xs mx-auto">
                    {playlist.length > 0
                      ? 'Select a song from the playlist to begin playback.'
                      : 'Add songs in the Admin Portal to begin playing worship anthems.'}
                  </p>
                </div>
              )}

            </div>

            {/* Right Side Panel: Up Next Queue OR Synchronized Auto-Scrolling Lyrics */}
            <AnimatePresence mode="wait">
              {activeRightTab === 'queue' ? (
                <motion.div
                  key="queue-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="border rounded-3xl p-5 shadow-2xl font-sans text-[#F7F5F0] bg-[#25160B] border-[#4A2D17] relative overflow-hidden space-y-4"
                >
                  {/* Queue Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#4A2D17]">
                    <div className="flex items-center gap-2">
                      <ListMusic className="h-4 w-4 text-[#A37F3B]" />
                      <h4 className="font-display font-bold text-xs tracking-wider uppercase text-[#E5B869] font-mono">
                        Up Next Worship Queue
                      </h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#3A2312] text-[#A37F3B] border border-[#4A2D17]">
                        {userQueue.length > 0 ? `${userQueue.length} queued` : 'Playlist order'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {userQueue.length > 0 && (
                        <button
                          type="button"
                          onClick={clearQueue}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-rose-300 hover:text-white bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/60 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Clear Queue</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Queue Body List */}
                  <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                    {/* User Queued Songs */}
                    {userQueue.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-[#A37F3B] font-mono font-bold uppercase tracking-wider px-1">
                          <span>Your Custom Queue ({userQueue.length})</span>
                          <span className="text-[10px] font-normal text-[#8A7463]">Plays First</span>
                        </div>

                        <div className="space-y-2">
                          {userQueue.map((queuedTrack, qIdx) => (
                            <div
                              key={`deck-queue-${queuedTrack.id}-${qIdx}`}
                              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#1D1108] border border-[#A37F3B]/50 hover:border-[#A37F3B] transition-all group"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className="text-xs font-mono font-bold text-[#A37F3B] w-5 text-center shrink-0">
                                  {String(qIdx + 1).padStart(2, '0')}
                                </span>
                                
                                <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-[#4A2D17] bg-[#150B05]">
                                  <img
                                    src={queuedTrack.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop'}
                                    alt={queuedTrack.title}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <h5 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#E5B869] transition-colors">
                                    {queuedTrack.title}
                                  </h5>
                                  <p className="text-[11px] text-[#A37F3B] truncate">{queuedTrack.artist}</p>
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[11px] font-mono text-[#8A7463] mr-1 hidden sm:inline">
                                  {queuedTrack.duration || '4:30'}
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => moveQueueItem(qIdx, qIdx - 1, e)}
                                  disabled={qIdx === 0}
                                  className="p-1.5 rounded-lg bg-[#25160B] hover:bg-[#3A2312] text-[#F7F5F0] disabled:opacity-20 cursor-pointer transition-colors"
                                  title="Move Up"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={(e) => moveQueueItem(qIdx, qIdx + 1, e)}
                                  disabled={qIdx === userQueue.length - 1}
                                  className="p-1.5 rounded-lg bg-[#25160B] hover:bg-[#3A2312] text-[#F7F5F0] disabled:opacity-20 cursor-pointer transition-colors"
                                  title="Move Down"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => playFromQueue(qIdx, e)}
                                  className="p-1.5 rounded-lg bg-[#A37F3B] hover:bg-[#8F6D2F] text-white shadow-xs cursor-pointer transition-all active:scale-95"
                                  title="Play Now"
                                >
                                  <Play className="h-3.5 w-3.5 fill-current" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => removeFromQueue(qIdx, e)}
                                  className="p-1.5 rounded-lg hover:bg-rose-950/60 text-rose-300 hover:text-rose-100 cursor-pointer transition-colors"
                                  title="Remove from queue"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upcoming Subsequent Playlist Songs */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#8A7463] font-mono font-semibold uppercase tracking-wider px-1">
                        <span>{userQueue.length > 0 ? 'Following After Queue (Playlist)' : 'Next in Playlist Order'}</span>
                        <span className="text-[10px] text-[#8A7463]">Consecutive Play</span>
                      </div>

                      <div className="space-y-1.5">
                        {upcomingPlaylistSongs.slice(0, 8).map((upcomingTrack, uIdx) => (
                          <div
                            key={`deck-upcoming-${upcomingTrack.id}-${uIdx}`}
                            className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#180E07] hover:bg-[#1D1108] border border-[#4A2D17]/60 hover:border-[#A37F3B]/50 transition-all text-xs group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className="text-[11px] font-mono text-[#8A7463] w-5 text-center shrink-0">
                                {uIdx + 1}
                              </span>
                              
                              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[#4A2D17]/80 bg-[#150B05]">
                                <img
                                  src={upcomingTrack.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop'}
                                  alt={upcomingTrack.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <h6 className="font-semibold text-[#F7F5F0] truncate group-hover:text-[#E5B869] transition-colors">
                                  {upcomingTrack.title}
                                </h6>
                                <p className="text-[10px] text-[#8A7463] truncate">{upcomingTrack.artist}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-mono text-[#8A7463] mr-1 hidden sm:inline">
                                {upcomingTrack.duration || '4:30'}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => addToQueue(upcomingTrack, e)}
                                className="px-2.5 py-1 rounded-lg bg-[#25160B] border border-[#A37F3B]/50 hover:bg-[#A37F3B] hover:text-white text-[#A37F3B] text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="Add to Up Next Queue"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Queue</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSelectSong(upcomingTrack)}
                                className="p-1.5 rounded-lg bg-[#3A2312] hover:bg-[#A37F3B] text-white transition-all cursor-pointer"
                                title="Play Immediately"
                              >
                                <Play className="h-3 w-3 fill-current" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Queue Footnote */}
                  <div className="pt-2 border-t border-[#4A2D17] text-center">
                    <p className="text-[10px] font-mono text-[#8A7463]">
                      Click <span className="text-[#A37F3B] font-bold">+ Queue</span> on any song to add it to the upcoming playback sequence.
                    </p>
                  </div>
                </motion.div>
              ) : (
                showLyrics && currentSong && currentSong.lyrics && (
                  <motion.div
                    key="lyrics-panel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="border rounded-3xl p-5 shadow-2xl font-sans text-[#F7F5F0] bg-[#25160B] border-[#4A2D17] relative overflow-hidden"
                  >
                    {/* Lyrics Board Header */}
                    <div 
                      className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#4A2D17]"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#A37F3B]" />
                        <h4 className="font-display font-bold text-xs tracking-wider uppercase text-[#A37F3B] font-mono">
                          Live Synced Lyrics
                        </h4>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#3A2312] text-[#E4DCD0] border border-[#4A2D17]">
                          Click any line to seek
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Re-center button if user manually scrolled */}
                        {userScrolledManually && (
                          <button
                            type="button"
                            onClick={reCenterLyrics}
                            className="px-2 py-1 rounded-md text-[10px] font-mono bg-[#A37F3B] hover:bg-[#8F6D2F] text-white flex items-center gap-1 transition-all shadow-sm cursor-pointer animate-pulse"
                            title="Snap back to current line"
                          >
                            <Navigation className="h-3 w-3" />
                            <span>Re-center</span>
                          </button>
                        )}

                        {/* Auto-Scroll Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            const next = !autoScroll;
                            setAutoScroll(next);
                            if (next) setUserScrolledManually(false);
                          }}
                          className={`px-2 py-1 rounded-md text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                            autoScroll 
                              ? 'bg-[#3A2312] border-[#A37F3B] text-[#A37F3B]' 
                              : 'bg-[#1D1108] border-[#4A2D17] text-[#8A7463]'
                          }`}
                          title={autoScroll ? 'Automatic scrolling enabled' : 'Automatic scrolling paused'}
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>{autoScroll ? 'Auto-Scroll: ON' : 'Auto-Scroll: OFF'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Synchronized Lyrics Lines Container with High-Performance Auto-Scroll */}
                    <div 
                      ref={lyricsContainerRef}
                      onScroll={handleLyricsUserInteraction}
                      onWheel={handleLyricsUserInteraction}
                      onTouchMove={handleLyricsUserInteraction}
                      onPointerDown={handleLyricsUserInteraction}
                      className="space-y-2.5 text-center max-h-[360px] overflow-y-auto pr-1 py-4 select-none"
                    >
                      {parsedLyrics.length > 0 ? (
                        parsedLyrics.map((line, idx) => {
                          const isActive = idx === activeLyricIndex;
                          const isPast = idx < activeLyricIndex;

                          if (line.isHeader) {
                            return (
                              <div 
                                key={line.id}
                                ref={(el) => (lyricLineRefs.current[idx] = el)}
                                className="py-1"
                              >
                                <span className="inline-block px-3 py-1 bg-[#1D1108] text-[#A37F3B] border border-[#4A2D17] rounded-full text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm">
                                  {line.text}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={line.id}
                              ref={(el) => (lyricLineRefs.current[idx] = el)}
                              onClick={() => handleJumpToLyric(line.startTime)}
                              className={`group relative px-4 py-2.5 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between gap-3 text-center ${
                                isActive
                                  ? 'bg-[#3A2312] border-2 border-[#A37F3B] shadow-xl text-white scale-[1.02] ring-2 ring-[#A37F3B]/30'
                                  : isPast
                                  ? 'text-[#F7F5F0]/65 hover:text-white hover:bg-[#1D1108]/70 border border-transparent'
                                  : 'text-[#F7F5F0]/40 hover:text-white hover:bg-[#1D1108]/70 border border-transparent'
                              }`}
                              title={`Jump to ${formatLyricTime(line.startTime)}`}
                            >
                              {/* Timestamp tag left on active / hover */}
                              <span 
                                className={`text-[10px] font-mono transition-opacity shrink-0 w-10 text-left ${
                                  isActive 
                                    ? 'text-[#A37F3B] font-bold opacity-100' 
                                    : 'text-[#8A7463] opacity-0 group-hover:opacity-100'
                                }`}
                              >
                                {formatLyricTime(line.startTime)}
                              </span>

                              {/* Lyric Content Text */}
                              <p 
                                className={`flex-1 text-sm sm:text-base leading-relaxed tracking-wide transition-all ${
                                  isActive
                                    ? 'font-bold text-white drop-shadow-md text-[#FFF8E7]'
                                    : 'font-normal'
                                }`}
                              >
                                {line.text}
                              </p>

                              {/* Active pulse icon right */}
                              <div className="shrink-0 w-10 text-right flex justify-end">
                                {isActive && (
                                  <span className="flex h-2.5 w-2.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A37F3B] opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A37F3B]" />
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-xs text-[#F7F5F0]/60 italic">
                          {currentSong.lyrics}
                        </div>
                      )}
                    </div>

                    {/* Bottom helper prompt with AI Transcriber Link */}
                    <div className="pt-2.5 mt-2 border-t border-[#4A2D17] flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-[#A37F3B]/80">
                        Synchronized to playback • Rewind or Fast Forward anytime
                      </span>

                      <button
                        type="button"
                        onClick={() => openAiTranscriber(currentSong)}
                        className="text-[10px] font-mono text-[#E5B869] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3 text-[#A37F3B]" />
                        <span>AI Transcriber</span>
                      </button>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>

          </div>

        </div>

        {/* Global Floating Quick Player Bar (Always accessible when scrolling) */}
        {currentSong && (
          <div className="fixed bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 z-50 max-w-4xl mx-auto">
            
            {/* Floating Up Next Queue Drawer Modal */}
            <AnimatePresence>
              {showFloatingQueue && (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.98 }}
                  className="mb-2 bg-[#25160B]/95 backdrop-blur-md text-[#F7F5F0] border border-[#A37F3B]/80 rounded-2xl shadow-2xl p-4 ring-1 ring-black/40 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#4A2D17] pb-2.5">
                    <div className="flex items-center gap-2">
                      <ListMusic className="h-4 w-4 text-[#A37F3B]" />
                      <h4 className="font-bold text-xs sm:text-sm font-mono text-[#E5B869] uppercase">
                        Up Next Worship Queue
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1D1108] text-[#A37F3B] border border-[#4A2D17]">
                        {userQueue.length} custom / {upcomingPlaylistSongs.length} playlist
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {userQueue.length > 0 && (
                        <button
                          type="button"
                          onClick={clearQueue}
                          className="px-2 py-1 rounded text-[10px] font-mono text-rose-300 hover:text-white bg-rose-950/40 border border-rose-800/60 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Clear</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowFloatingQueue(false)}
                        className="p-1 rounded-lg hover:bg-[#3A2312] text-[#8A7463] hover:text-white transition-colors cursor-pointer"
                        title="Close Queue Drawer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                    {/* User Queued Tracks */}
                    {userQueue.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-[#A37F3B] font-bold px-1">
                          Custom Queue ({userQueue.length})
                        </span>
                        {userQueue.map((item, qIdx) => (
                          <div
                            key={`floating-queue-${item.id}-${qIdx}`}
                            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#1D1108] border border-[#A37F3B]/40 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-[10px] font-mono text-[#A37F3B] w-4 text-center font-bold">
                                {qIdx + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-white truncate">{item.title}</p>
                                <p className="text-[10px] text-[#A37F3B] truncate">{item.artist}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => moveQueueItem(qIdx, qIdx - 1, e)}
                                disabled={qIdx === 0}
                                className="p-1 rounded hover:bg-[#3A2312] text-[#F7F5F0] disabled:opacity-30 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => moveQueueItem(qIdx, qIdx + 1, e)}
                                disabled={qIdx === userQueue.length - 1}
                                className="p-1 rounded hover:bg-[#3A2312] text-[#F7F5F0] disabled:opacity-30 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  playFromQueue(qIdx, e);
                                  setShowFloatingQueue(false);
                                }}
                                className="p-1 rounded bg-[#A37F3B] text-white hover:bg-[#8F6D2F] cursor-pointer ml-0.5"
                                title="Play Now"
                              >
                                <Play className="h-3 w-3 fill-current" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => removeFromQueue(qIdx, e)}
                                className="p-1 rounded hover:bg-rose-950/50 text-rose-300 cursor-pointer"
                                title="Remove"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Next in playlist */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#8A7463] font-semibold px-1">
                        {userQueue.length > 0 ? 'Following Playlist Songs' : 'Up Next from Playlist'}
                      </span>
                      {upcomingPlaylistSongs.slice(0, 5).map((track, pIdx) => (
                        <div
                          key={`floating-upcoming-${track.id}-${pIdx}`}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#180E07] border border-[#4A2D17]/50 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-[10px] font-mono text-[#8A7463] w-4 text-center">
                              {pIdx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-[#F7F5F0] truncate">{track.title}</p>
                              <p className="text-[10px] text-[#8A7463] truncate">{track.artist}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => addToQueue(track, e)}
                              className="px-2 py-0.5 rounded bg-[#25160B] border border-[#A37F3B]/50 hover:bg-[#A37F3B] hover:text-white text-[#A37F3B] text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-0.5"
                              title="Add to queue"
                            >
                              <Plus className="h-2.5 w-2.5" />
                              <span>Queue</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectSong(track);
                                setShowFloatingQueue(false);
                              }}
                              className="p-1 rounded bg-[#3A2312] hover:bg-[#A37F3B] text-white transition-all cursor-pointer"
                              title="Play Now"
                            >
                              <Play className="h-3 w-3 fill-current" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Bar Content */}
            <div className="bg-[#25160B]/95 backdrop-blur-md text-[#F7F5F0] border border-[#A37F3B]/80 rounded-2xl shadow-2xl p-2.5 sm:p-3.5 flex items-center justify-between gap-3 ring-1 ring-black/40">
              
              {/* Left: Thumbnail & Title */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#A37F3B]/60 bg-[#150B05]">
                  <img
                    src={currentSong.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop'}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="flex items-end gap-0.5 h-3">
                        <span className="w-0.5 animate-[bounce_0.8s_infinite_100ms] h-full rounded-full bg-[#A37F3B]" />
                        <span className="w-0.5 animate-[bounce_0.8s_infinite_300ms] h-2/3 rounded-full bg-white" />
                        <span className="w-0.5 animate-[bounce_0.8s_infinite_200ms] h-1/2 rounded-full bg-[#A37F3B]" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold truncate text-white leading-tight">
                    {currentSong.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-[#A37F3B] truncate">
                    <span className="truncate">{currentSong.artist}</span>
                    <span>•</span>
                    <span className="font-mono text-[#F7F5F0]/70">{formatTime(currentTime)} / {formatTime(duration || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Center: Controls */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSkipTime(-10)}
                  className="p-1.5 sm:p-2 rounded-lg bg-[#1D1108] border border-[#4A2D17] hover:border-[#A37F3B] text-[#F7F5F0] hover:text-[#A37F3B] transition-all cursor-pointer flex items-center gap-0.5"
                  title="Rewind 10s"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="text-[8px] font-mono font-bold hidden sm:inline">10s</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-[#3A2312] text-[#F7F5F0] transition-all cursor-pointer"
                  title="Previous Song"
                >
                  <SkipBack className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-2 sm:p-2.5 rounded-full text-white bg-[#A37F3B] hover:bg-[#8F6D2F] shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                  ) : (
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-[#3A2312] text-[#F7F5F0] transition-all cursor-pointer"
                  title="Next Song"
                >
                  <SkipForward className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSkipTime(10)}
                  className="p-1.5 sm:p-2 rounded-lg bg-[#1D1108] border border-[#4A2D17] hover:border-[#A37F3B] text-[#F7F5F0] hover:text-[#A37F3B] transition-all cursor-pointer flex items-center gap-0.5"
                  title="Fast-Forward 10s"
                >
                  <span className="text-[8px] font-mono font-bold hidden sm:inline">10s</span>
                  <RotateCw className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={toggleRepeatMode}
                  className="p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer relative"
                  style={{
                    background: repeatMode !== 'off' ? '#A37F3B' : '#1D1108',
                    borderColor: repeatMode !== 'off' ? '#A37F3B' : '#4A2D17',
                    color: repeatMode !== 'off' ? '#FFFFFF' : '#F7F5F0'
                  }}
                  title={`Repeat: ${repeatMode}`}
                >
                  {repeatMode === 'one' ? <Repeat1 className="h-3.5 w-3.5" /> : <Repeat className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Right: Queue Drawer, Lyrics & Mute toggle */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFloatingQueue(!showFloatingQueue)}
                  className="px-2 py-1.5 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                  style={{
                    background: showFloatingQueue ? '#A37F3B' : '#1D1108',
                    borderColor: '#A37F3B',
                    color: showFloatingQueue ? '#FFFFFF' : '#F7F5F0'
                  }}
                  title="Toggle Queue Drawer"
                >
                  <ListMusic className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Queue ({userQueue.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveRightTab('lyrics');
                    setShowLyrics(!showLyrics);
                  }}
                  className="px-2 py-1.5 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                  style={{
                    background: showLyrics ? '#A37F3B' : '#1D1108',
                    borderColor: '#A37F3B',
                    color: showLyrics ? '#FFFFFF' : '#F7F5F0'
                  }}
                  title={showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">{showLyrics ? 'Lyrics On' : 'Lyrics'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg hover:bg-[#3A2312] text-[#A37F3B] hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Global Action Toast Notification Banner */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-6 right-6 z-50 bg-[#25160B] text-white border-2 border-[#A37F3B] shadow-2xl px-4 py-2.5 rounded-2xl flex items-center gap-2.5 font-mono text-xs max-w-sm"
            >
              <div className="p-1 rounded-full bg-[#A37F3B] text-white">
                <Check className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-[#F7F5F0]">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Audio Pre-Listener & Lyric Transcriber Studio Modal */}
        <AnimatePresence>
          {isAiTranscriberOpen && (
            <AiTranscriberModal
              isOpen={isAiTranscriberOpen}
              onClose={() => setIsAiTranscriberOpen(false)}
              selectedSong={transcriberTargetSong}
              allSongs={songs}
              onApplyLyrics={handleApplyAiLyrics}
              onPreviewSeek={(seconds) => {
                handleJumpToLyric(seconds);
              }}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

