import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  ChangeEvent,
  MouseEvent,
} from 'react';
import {
  Play,
  Pause,
  Music,
  Search,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  FileText,
  Download,
  Loader2,
  ShieldCheck,
  ExternalLink,
  X,
  Radio,
  Clock,
  Sparkles,
  ChevronUp,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { Song } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';
import { downloadLyricsFile } from '../utils/lyricsHelper';
import LyricsModal from './LyricsModal';

interface SongsProps {
  userSongDownloads?: Song[];
  onSongDownloadSuccess?: (song: Song) => void;
  isAdmin?: boolean;
}

type FilterCategory = 'all' | 'crossworship' | 'recent' | 'lyrics';

export default function Songs({
  userSongDownloads = [],
  onSongDownloadSuccess,
  isAdmin: propIsAdmin,
}: SongsProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  // Precomputed letter tokens with global sequential index for character-by-character reveal
  const worshipHeadingWords = useMemo(() => {
    const text = "Let's lift our hands as we worship...";
    let globalIndex = 0;
    return text.split(' ').map((word) => {
      const chars = Array.from(word).map((char) => ({
        char,
        index: globalIndex++,
      }));
      // Advance by one step for the space between words to create a natural worship cadence
      globalIndex++;
      return chars;
    });
  }, []);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  // Playback modes
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [autoplayNext, setAutoplayNext] = useState(true);

  // Downloads & lyrics state
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});
  const [lyricsModalSong, setLyricsModalSong] = useState<Song | null>(null);
  const [isLyricsModalOpen, setIsLyricsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show floating bar when scrolled past featured section
  const [showFloatingPlayer, setShowFloatingPlayer] = useState(false);

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (propIsAdmin !== undefined) return propIsAdmin;
    try {
      return localStorage.getItem('gec_is_admin') === 'true';
    } catch {
      return false;
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const featuredSectionRef = useRef<HTMLElement | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep track of recent songs and queue
  const currentSongRef = useRef<Song | null>(currentSong);
  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  const songsRef = useRef<Song[]>(songs);
  useEffect(() => {
    songsRef.current = songs;
  }, [songs]);

  const isShuffleRef = useRef(isShuffle);
  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  const repeatModeRef = useRef(repeatMode);
  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  const autoplayNextRef = useRef(autoplayNext);
  useEffect(() => {
    autoplayNextRef.current = autoplayNext;
  }, [autoplayNext]);

  /*
   * ---------------------------------------------------------
   * ADMIN STATUS
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (propIsAdmin !== undefined) {
      setIsAdmin(propIsAdmin);
      return;
    }

    const checkAdmin = () => {
      try {
        setIsAdmin(localStorage.getItem('gec_is_admin') === 'true');
      } catch {
        setIsAdmin(false);
      }
    };

    window.addEventListener('storage', checkAdmin);
    return () => {
      window.removeEventListener('storage', checkAdmin);
    };
  }, [propIsAdmin]);

  /*
   * ---------------------------------------------------------
   * SCROLL DETECTION FOR COMPACT FLOATING WORSHIP PLAYER
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const handleScroll = () => {
      if (!featuredSectionRef.current) return;
      const rect = featuredSectionRef.current.getBoundingClientRect();
      // When the bottom of the featured section is above the viewport by 80px, show floating player
      if (rect.bottom < 80) {
        setShowFloatingPlayer(true);
      } else {
        setShowFloatingPlayer(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /*
   * ---------------------------------------------------------
   * FETCH SONGS FROM SUPABASE
   * ---------------------------------------------------------
   */
  useEffect(() => {
    let mounted = true;

    const fetchSongs = async () => {
      if (!supabase) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('Songs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Could not fetch songs from Supabase:', error);
          if (mounted) setIsLoading(false);
          return;
        }

        if (!mounted) return;

        if (data && data.length > 0) {
          const mappedSongs: Song[] = data.map((song: any) => ({
            id: song.id,
            title: song.title || 'Untitled Worship',
            artist: song.artist || 'Crossworship',
            album: song.album || "God's Edifice Church",
            duration: song.duration || '4:30',
            audioUrl: song.audio_url || '',
            coverUrl: song.artwork || '',
            lyrics: song.description || '',
            downloads: song.downloads || 0,
            uploadedByUser: false,
          }));

          setSongs(mappedSongs);
          setCurrentSong((prev) => prev ?? mappedSongs[0]);
        } else {
          setSongs([]);
        }
      } catch (error) {
        console.error('Song fetch failed:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSongs();

    const handleSongsUpdated = () => {
      fetchSongs();
    };

    window.addEventListener('gec_songs_updated', handleSongsUpdated);

    return () => {
      mounted = false;
      window.removeEventListener('gec_songs_updated', handleSongsUpdated);
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * AUDIO PLAYER SETUP & EVENT HANDLERS
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);

      const repeat = repeatModeRef.current;
      const autoplay = autoplayNextRef.current;
      const current = currentSongRef.current;
      const songList = songsRef.current;

      if (repeat === 'one' && current && audio) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
        return;
      }

      if ((autoplay || repeat === 'all') && songList.length > 0 && current) {
        if (isShuffleRef.current) {
          const others = songList.filter((s) => s.id !== current.id);
          const nextRandom = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : songList[0];
          playSong(nextRandom);
        } else {
          const currentIndex = songList.findIndex((s) => s.id === current.id);
          if (currentIndex >= 0 && currentIndex < songList.length - 1) {
            playSong(songList[currentIndex + 1]);
          } else if (repeat === 'all') {
            playSong(songList[0]);
          }
        }
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  /*
   * ---------------------------------------------------------
   * PLAYBACK CONTROLS
   * ---------------------------------------------------------
   */
  const playSong = async (song: Song, autoStart = true) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!song.audioUrl) {
      showToast('Audio file is not yet available for this worship song.');
      setCurrentSong(song);
      return;
    }

    try {
      if (currentSong?.id !== song.id) {
        audio.pause();
        audio.src = song.audioUrl;
        audio.currentTime = 0;
        setCurrentSong(song);
        setCurrentTime(0);
        setDuration(0);
      }

      if (autoStart) {
        await audio.play();
      }
    } catch (error) {
      console.error('Playback failed:', error);
      setIsPlaying(false);
      showToast('Unable to start audio stream. Tap play to retry.');
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentSong) {
      if (filteredSongs.length > 0) {
        playSong(filteredSongs[0]);
      }
      return;
    }

    if (!currentSong.audioUrl) {
      showToast('Audio file is not available for this song.');
      return;
    }

    try {
      if (audio.paused) {
        if (!audio.src || audio.src !== currentSong.audioUrl) {
          audio.src = currentSong.audioUrl;
        }
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error('Playback toggle error:', error);
      showToast('Unable to resume playback.');
    }
  };

  const playPrevious = () => {
    if (!currentSong || filteredSongs.length === 0) return;

    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const currentIndex = filteredSongs.findIndex((s) => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(filteredSongs[currentIndex - 1]);
    } else {
      playSong(filteredSongs[filteredSongs.length - 1]);
    }
  };

  const playNext = () => {
    if (!currentSong || filteredSongs.length === 0) return;

    if (isShuffle) {
      const candidates = filteredSongs.filter((s) => s.id !== currentSong.id);
      if (candidates.length > 0) {
        const randomSong = candidates[Math.floor(Math.random() * candidates.length)];
        playSong(randomSong);
        return;
      }
    }

    const currentIndex = filteredSongs.findIndex((s) => s.id === currentSong.id);
    if (currentIndex >= 0 && currentIndex < filteredSongs.length - 1) {
      playSong(filteredSongs[currentIndex + 1]);
    } else {
      playSong(filteredSongs[0]);
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const scrollToFeatured = () => {
    if (featuredSectionRef.current) {
      featuredSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  /*
   * ---------------------------------------------------------
   * SEARCH & FILTERING
   * ---------------------------------------------------------
   */
  const filteredSongs = useMemo(() => {
    let result = [...songs];
    const query = searchQuery.trim().toLowerCase();

    // Category filter
    if (selectedCategory === 'crossworship') {
      result = result.filter(
        (s) =>
          s.artist.toLowerCase().includes('crossworship') ||
          s.album.toLowerCase().includes('crossworship')
      );
    } else if (selectedCategory === 'recent') {
      result = result.slice(0, 6);
    } else if (selectedCategory === 'lyrics') {
      result = result.filter((s) => Boolean(s.lyrics && s.lyrics.trim().length > 0));
    }

    // Search query
    if (query) {
      result = result.filter((song) => {
        return (
          song.title?.toLowerCase().includes(query) ||
          song.artist?.toLowerCase().includes(query) ||
          song.album?.toLowerCase().includes(query) ||
          song.lyrics?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [songs, searchQuery, selectedCategory]);

  /*
   * ---------------------------------------------------------
   * DOWNLOAD SONG (SUPABASE COUNTER + LOCAL STORAGE)
   * ---------------------------------------------------------
   */
  const triggerSongDownload = async (song: Song, e?: MouseEvent) => {
    if (e) e.stopPropagation();

    if (!song.audioUrl) {
      showToast('Audio download link is not available for this song.');
      return;
    }

    setIsDownloading((prev) => ({ ...prev, [song.id]: true }));

    try {
      const response = await fetch(song.audioUrl);
      if (!response.ok) {
        throw new Error('Unable to download audio file');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${song.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      // Increment downloads in Supabase
      if (supabase && song.id) {
        try {
          await supabase
            .from('Songs')
            .update({ downloads: (song.downloads || 0) + 1 })
            .eq('id', song.id);

          setSongs((prevSongs) =>
            prevSongs.map((s) =>
              s.id === song.id ? { ...s, downloads: (s.downloads || 0) + 1 } : s
            )
          );
        } catch (dbErr) {
          console.warn('Could not update download count in database:', dbErr);
        }
      }

      // Save locally
      try {
        const stored = localStorage.getItem('gec_user_song_downloads');
        const downloads: Song[] = stored ? JSON.parse(stored) : [];
        if (!downloads.some((item) => item.id === song.id)) {
          downloads.push(song);
          localStorage.setItem('gec_user_song_downloads', JSON.stringify(downloads));
        }
      } catch (storageErr) {
        console.warn('Could not cache downloaded song locally:', storageErr);
      }

      onSongDownloadSuccess?.(song);
      showToast(`Downloaded "${song.title}"`);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(song.audioUrl, '_blank');
      showToast('Opening audio file in new window...');
    } finally {
      setIsDownloading((prev) => ({ ...prev, [song.id]: false }));
    }
  };

  /*
   * ---------------------------------------------------------
   * LYRICS HANDLERS
   * ---------------------------------------------------------
   */
  const openLyrics = (song: Song, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    setLyricsModalSong(song);
    setIsLyricsModalOpen(true);
  };

  const handleDownloadLyrics = (song: Song, e?: MouseEvent) => {
    if (e) e.stopPropagation();

    if (!song.lyrics?.trim()) {
      showToast('Lyrics document is not yet published for this song.');
      return;
    }

    const success = downloadLyricsFile(
      song.title,
      song.artist,
      song.album,
      song.lyrics
    );

    if (success) {
      showToast(`Downloaded lyrics for "${song.title}"`);
    } else {
      showToast('Unable to export lyrics document.');
    }
  };

  /*
   * ---------------------------------------------------------
   * TOAST NOTIFICATION
   * ---------------------------------------------------------
   */
  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  /*
   * ---------------------------------------------------------
   * TIME FORMATTING HELPER
   * ---------------------------------------------------------
   */
  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasSelectedSong = Boolean(currentSong);
  const currentHasLyrics = Boolean(currentSong?.lyrics?.trim());

  return (
    <div
      id="songs-portal"
      className="min-h-screen bg-[#F7F5F0] text-[#141416] pb-28 sm:pb-36 w-full max-w-full overflow-x-hidden selection:bg-[#A36B3B]/20 selection:text-[#714624]"
    >
      {/* ========================================================= */}
      {/* 1. WORSHIP INTRODUCTION                                  */}
      {/* ========================================================= */}
      <header className="relative w-full pt-12 sm:pt-16 md:pt-20 pb-10 sm:pb-14 border-b border-[#EFEAE1] bg-gradient-to-b from-[#FCFBF9] via-[#F7F5F0] to-[#EFEAE1]/40 overflow-hidden">
        {/* Subtle sanctuary ambient lighting overlay */}
        <div 
          aria-hidden="true" 
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(194,139,87,0.18),transparent_70%)]" 
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          >
            <div className="max-w-3xl">
              {/* Refined Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE1] border border-[#E4DCD0] text-[#8D5A30] text-[11px] sm:text-xs font-semibold tracking-widest uppercase mb-4 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#A36B3B]" />
                <span>Worship • Songs</span>
              </div>

              {/* Majestic Serif Heading with Slower Sequential Character Reveal Motion */}
              <h1
                aria-label="Let's lift our hands as we worship..."
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-cinzel font-bold text-[#141416] tracking-tight leading-[1.15]"
              >
                {worshipHeadingWords.map((wordChars, wordIdx) => (
                  <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.28em]">
                    {wordChars.map(({ char, index }) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{
                          duration: 0.55,
                          delay: 0.25 + index * 0.08,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </span>
                ))}
              </h1>

              {/* Calm Editorial Supporting Copy */}
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[#54575E] leading-relaxed max-w-2xl font-sans">
                Discover songs from God’s Edifice Church, created to inspire worship, reflection, and a deeper walk with God.
              </p>
            </div>

            {/* Admin Manager shortcut if authenticated */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="shrink-0"
              >
                <a
                  href="/crosswordmedia"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2B241F] hover:bg-[#1F1B18] text-[#FCFBF9] text-xs font-semibold tracking-wide shadow-md hover:shadow-lg transition-all"
                  title="Manage Church Audio and Music Catalog"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C28B57]" />
                  <span>Admin Media Manager</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </motion.div>
            )}
          </motion.div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. FEATURED / CURRENTLY PLAYING SONG (THE CENTERPIECE)    */}
      {/* ========================================================= */}
      <section
        ref={featuredSectionRef}
        id="featured-worship-sanctuary"
        className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl sm:rounded-[2rem] bg-gradient-to-b from-[#251D18] via-[#1E1713] to-[#150F0B] border border-[#423329] text-[#FCFBF9] shadow-2xl overflow-hidden"
        >
          {/* Ambient blurred backdrop aura reflecting current artwork */}
          {currentSong?.coverUrl && (
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cover bg-center blur-[90px] opacity-25 pointer-events-none transition-all duration-1000"
              style={{ backgroundImage: `url(${currentSong.coverUrl})` }}
            />
          )}

          <div className="relative p-5 sm:p-8 md:p-10 lg:p-12">
            {isLoading && !currentSong ? (
              /* Loading Skeleton */
              <div className="grid md:grid-cols-12 gap-8 items-center animate-pulse">
                <div className="md:col-span-5 flex justify-center">
                  <div className="w-64 sm:w-80 aspect-square rounded-2xl bg-[#332720]/70 border border-[#47362C]" />
                </div>
                <div className="md:col-span-7 space-y-4">
                  <div className="h-5 w-28 bg-[#332720] rounded-full" />
                  <div className="h-9 w-3/4 bg-[#332720] rounded-lg" />
                  <div className="h-5 w-1/2 bg-[#332720]/80 rounded-md" />
                  <div className="h-2.5 w-full bg-[#332720]/50 rounded-full mt-6" />
                  <div className="h-14 w-48 bg-[#332720] rounded-full mx-auto md:mx-0 mt-6" />
                </div>
              </div>
            ) : currentSong ? (
              /* Centerpiece Content */
              <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* LEFT: Large Song Artwork / Cover Image */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="relative group w-full max-w-[280px] sm:max-w-[340px] md:max-w-none aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-[#150F0B] border border-[#523F32] shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                    <img
                      src={
                        currentSong.coverUrl ||
                        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'
                      }
                      alt={currentSong.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Subtle vinyl groove vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

                    {/* Live worship pulsing badge when playing */}
                    {isPlaying && (
                      <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#C28B57]/50 text-[#C28B57] text-[10px] sm:text-xs font-mono font-medium tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-[#C28B57] animate-ping inline-block mr-0.5" />
                        <span className="w-2 h-2 rounded-full bg-[#C28B57] inline-block absolute left-2.5" />
                        <span className="ml-2">WORSHIP STREAM</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: Editorial Metadata & Integrated Immersive Player */}
                <div className="md:col-span-7 flex flex-col justify-center min-w-0">
                  {/* Eyebrow / State Label */}
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#3D2C22] border border-[#634938] text-[#C28B57] text-[11px] font-mono font-semibold tracking-wider uppercase">
                      <Radio className="w-3 h-3 animate-pulse" />
                      {isPlaying ? 'Now Playing' : 'Selected Worship'}
                    </span>

                    {currentSong.album && (
                      <span className="text-xs text-[#A38E80] font-sans truncate hidden sm:inline">
                        • {currentSong.album}
                      </span>
                    )}
                  </div>

                  {/* Song Title in Refined Serif */}
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-cinzel font-bold text-[#FCFBF9] tracking-tight leading-tight line-clamp-2">
                    {currentSong.title}
                  </h2>

                  {/* Artist / Ministry */}
                  <p className="text-sm sm:text-base text-[#C28B57] font-sans font-medium mt-1.5">
                    {currentSong.artist}
                  </p>

                  {/* Metadata Chips: Duration & Downloads */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-[#8A7668] font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {currentSong.duration || formatTime(duration)}
                    </span>
                    {(currentSong.downloads || 0) > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                        {currentSong.downloads} downloads
                      </span>
                    )}
                    {currentHasLyrics && (
                      <span className="inline-flex items-center gap-1 text-[#C28B57]">
                        <FileText className="w-3.5 h-3.5" />
                        Lyrics Included
                      </span>
                    )}
                  </div>

                  {/* Audio Progress Scrubber */}
                  <div className="mt-6 sm:mt-8 w-full">
                    <div className="relative flex items-center">
                      <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={Math.min(currentTime, duration || 0)}
                        onChange={handleSeek}
                        aria-label="Seek worship audio timeline"
                        className="w-full h-2 rounded-lg bg-[#3D2C22] accent-[#C28B57] cursor-pointer hover:bg-[#4E392C] transition-colors"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono text-[#8A7668] mt-1.5">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Player Controls Bar */}
                  <div className="flex items-center justify-between gap-2 sm:gap-4 mt-4 sm:mt-6 pt-2 border-t border-[#3D2C22]/80">
                    {/* Secondary Modes: Shuffle & Repeat */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setIsShuffle((prev) => !prev)}
                        className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                          isShuffle
                            ? 'bg-[#3D2C22] text-[#C28B57]'
                            : 'text-[#8A7668] hover:text-[#FCFBF9] hover:bg-[#2B1F18]'
                        }`}
                        title={isShuffle ? 'Shuffle enabled' : 'Enable shuffle'}
                        aria-label="Toggle shuffle"
                      >
                        <Shuffle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={toggleRepeatMode}
                        className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                          repeatMode !== 'off'
                            ? 'bg-[#3D2C22] text-[#C28B57]'
                            : 'text-[#8A7668] hover:text-[#FCFBF9] hover:bg-[#2B1F18]'
                        }`}
                        title={`Repeat mode: ${repeatMode}`}
                        aria-label="Toggle repeat mode"
                      >
                        {repeatMode === 'one' ? (
                          <Repeat1 className="w-4 h-4" />
                        ) : (
                          <Repeat className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Primary Transport Controls */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={playPrevious}
                        className="p-2.5 rounded-full text-[#E4DCD0] hover:text-[#FCFBF9] hover:bg-[#3D2C22] transition-colors cursor-pointer active:scale-95"
                        title="Previous worship song"
                        aria-label="Previous song"
                      >
                        <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>

                      <button
                        type="button"
                        onClick={togglePlay}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#C28B57] via-[#A36B3B] to-[#8D5A30] hover:from-[#D19B68] hover:to-[#A36B3B] text-[#FCFBF9] flex items-center justify-center shadow-xl shadow-[#A36B3B]/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-[#E4B58A]/30"
                        aria-label={isPlaying ? 'Pause worship' : 'Play worship'}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-1" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={playNext}
                        className="p-2.5 rounded-full text-[#E4DCD0] hover:text-[#FCFBF9] hover:bg-[#3D2C22] transition-colors cursor-pointer active:scale-95"
                        title="Next worship song"
                        aria-label="Next song"
                      >
                        <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </div>

                    {/* Volume & Mute */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMuted((prev) => !prev)}
                        className="p-2 text-[#8A7668] hover:text-[#FCFBF9] transition-colors cursor-pointer"
                        title={isMuted ? 'Unmute audio' : 'Mute audio'}
                        aria-label="Toggle mute"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-[#C28B57]" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        aria-label="Volume slider"
                        className="hidden sm:block w-16 md:w-20 h-1.5 rounded-lg bg-[#3D2C22] accent-[#C28B57] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Actions: Download Song, View Lyrics, Download Lyrics */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-6 sm:mt-8 pt-4 border-t border-[#3D2C22]/80">
                    <button
                      type="button"
                      onClick={() => triggerSongDownload(currentSong)}
                      disabled={isDownloading[currentSong.id]}
                      className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl bg-[#A36B3B] hover:bg-[#8D5A30] text-[#FCFBF9] text-xs sm:text-sm font-semibold tracking-wide shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      {isDownloading[currentSong.id] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>Download Song</span>
                    </button>

                    {currentHasLyrics && (
                      <>
                        <button
                          type="button"
                          onClick={() => openLyrics(currentSong)}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#2B1F18] hover:bg-[#382920] border border-[#523F32] hover:border-[#C28B57] text-[#FCFBF9] text-xs sm:text-sm font-medium transition-all active:scale-98 cursor-pointer"
                          title="Read clean formatted worship lyrics"
                        >
                          <FileText className="w-4 h-4 text-[#C28B57]" />
                          <span>View Lyrics</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadLyrics(currentSong)}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#2B1F18] hover:bg-[#382920] border border-[#523F32] hover:border-[#C28B57] text-[#C28B57] hover:text-[#FCFBF9] text-xs sm:text-sm font-medium transition-all active:scale-98 cursor-pointer"
                          title="Download lyrics document as a text file"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Download Lyrics</span>
                          <span className="sm:hidden">.txt</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State Invitation */
              <div className="py-16 sm:py-20 text-center px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#332720] border border-[#47362C] mx-auto flex items-center justify-center mb-5 text-[#C28B57]">
                  <Music className="w-8 h-8" />
                </div>
                <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#FCFBF9]">
                  Choose a song and enter into worship
                </h3>
                <p className="text-sm text-[#A38E80] mt-2 max-w-md mx-auto font-sans">
                  Select any psalm, hymn, or worship single from the collection below to begin your listening experience.
                </p>
                {songs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => playSong(songs[0])}
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#A36B3B] hover:bg-[#8D5A30] text-[#FCFBF9] text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Latest: {songs[0].title}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* ========================================================= */}
      {/* 3. SONG DISCOVERY AND LIBRARY                             */}
      {/* ========================================================= */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-6 border-b border-[#EFEAE1]">
          <div>
            <div className="flex items-center gap-2 text-[#8D5A30] text-xs font-semibold uppercase tracking-widest mb-1.5">
              <Music className="w-3.5 h-3.5 text-[#A36B3B]" />
              <span>Crossworship Ministry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#141416]">
              Explore the collection
            </h2>
            <p className="text-sm text-[#54575E] font-sans mt-1">
              A treasury of psalms, hymns, and spiritual songs for personal prayer and congregational worship.
            </p>
          </div>

          <div className="text-xs font-mono text-[#8A8E96]">
            {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'} in view
          </div>
        </div>

        {/* Discovery Toolbar: Search & Filter Pills */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D5A30]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, artist, album, or lyrics..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#E4DCD0] focus:border-[#A36B3B] focus:ring-1 focus:ring-[#A36B3B] outline-none text-sm text-[#141416] placeholder-[#8A8E96] transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8E96] hover:text-[#141416] p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#A36B3B] text-white shadow-xs'
                  : 'bg-white border border-[#E4DCD0] text-[#54575E] hover:text-[#141416] hover:bg-[#EFEAE1]/50'
              }`}
            >
              All Songs
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('crossworship')}
              className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'crossworship'
                  ? 'bg-[#A36B3B] text-white shadow-xs'
                  : 'bg-white border border-[#E4DCD0] text-[#54575E] hover:text-[#141416] hover:bg-[#EFEAE1]/50'
              }`}
            >
              Crossworship
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('recent')}
              className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'recent'
                  ? 'bg-[#A36B3B] text-white shadow-xs'
                  : 'bg-white border border-[#E4DCD0] text-[#54575E] hover:text-[#141416] hover:bg-[#EFEAE1]/50'
              }`}
            >
              Recently Added
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('lyrics')}
              className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'lyrics'
                  ? 'bg-[#A36B3B] text-white shadow-xs'
                  : 'bg-white border border-[#E4DCD0] text-[#54575E] hover:text-[#141416] hover:bg-[#EFEAE1]/50'
              }`}
            >
              With Lyrics
            </button>
          </div>
        </div>

        {/* SONG CATALOG LIST */}
        <div className="mt-8 space-y-3">
          {isLoading ? (
            /* Skeleton list */
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`song-skeleton-${i}`}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-[#EFEAE1] bg-white animate-pulse"
              >
                <div className="w-10 h-10 rounded-full bg-[#EFEAE1] shrink-0" />
                <div className="w-12 h-12 rounded-xl bg-[#EFEAE1] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#EFEAE1] rounded w-2/3" />
                  <div className="h-3 bg-[#EFEAE1]/70 rounded w-1/3" />
                </div>
                <div className="w-20 h-8 rounded-xl bg-[#EFEAE1] shrink-0 hidden sm:block" />
              </div>
            ))
          ) : filteredSongs.length > 0 ? (
            filteredSongs.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              const isCurrentPlaying = isCurrent && isPlaying;
              const hasLyrics = Boolean(song.lyrics?.trim());

              return (
                <motion.article
                  key={song.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                  onClick={() => playSong(song)}
                  className={`group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#FCFBF9] border-[#A36B3B] shadow-md ring-1 ring-[#A36B3B]/30'
                      : 'bg-white border-[#EFEAE1] hover:border-[#C28B57] hover:shadow-sm'
                  }`}
                  id={`song-row-${song.id}`}
                >
                  {/* PLAY / PAUSE BUTTON */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrent) {
                        togglePlay();
                      } else {
                        playSong(song);
                      }
                    }}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs ${
                      isCurrent
                        ? 'bg-[#A36B3B] text-white'
                        : 'bg-[#EFEAE1] text-[#714624] group-hover:bg-[#A36B3B] group-hover:text-white'
                    }`}
                    aria-label={isCurrentPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
                  >
                    {isCurrentPlaying ? (
                      <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                    )}
                  </button>

                  {/* ALBUM ARTWORK */}
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-[#EFEAE1] border border-[#E4DCD0] shrink-0">
                    <img
                      src={
                        song.coverUrl ||
                        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop'
                      }
                      alt={song.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {isCurrentPlaying && (
                      <div className="absolute inset-0 bg-[#A36B3B]/40 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="flex items-end gap-0.5 h-3.5">
                          <span className="w-1 bg-white animate-[bounce_0.8s_infinite] h-full" />
                          <span className="w-1 bg-white animate-[bounce_0.8s_infinite_0.2s] h-2/3" />
                          <span className="w-1 bg-white animate-[bounce_0.8s_infinite_0.4s] h-4/5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TITLE & ARTIST METADATA */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-semibold text-sm sm:text-base truncate transition-colors ${
                          isCurrent ? 'text-[#8D5A30]' : 'text-[#141416] group-hover:text-[#A36B3B]'
                        }`}
                      >
                        {song.title}
                      </h3>

                      {isCurrent && (
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-[#EFEAE1] text-[#8D5A30]">
                          Playing
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-x-2 text-xs text-[#54575E] truncate mt-0.5">
                      <span className="font-medium text-[#714624] truncate">{song.artist}</span>
                      {song.album && (
                        <>
                          <span className="text-[#D5C9B8]">•</span>
                          <span className="truncate">{song.album}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* DURATION BADGE */}
                  <div className="hidden md:flex items-center gap-1 text-xs font-mono text-[#8A8E96] shrink-0 px-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{song.duration || 'Worship'}</span>
                  </div>

                  {/* ACTIONS TOOLBAR */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {hasLyrics && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => openLyrics(song, e)}
                          className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-[#EFEAE1] border border-[#E4DCD0] hover:border-[#A36B3B] text-[#714624] transition-colors cursor-pointer"
                          title="View worship lyrics document"
                          aria-label={`View lyrics for ${song.title}`}
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDownloadLyrics(song, e)}
                          className="hidden sm:flex p-2.5 rounded-xl bg-white hover:bg-[#EFEAE1] border border-[#E4DCD0] hover:border-[#A36B3B] text-[#8D5A30] transition-colors cursor-pointer"
                          title="Download lyrics file (.txt)"
                          aria-label={`Download lyrics for ${song.title}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={(e) => triggerSongDownload(song, e)}
                      disabled={isDownloading[song.id]}
                      className="p-2 sm:p-2.5 rounded-xl bg-[#EFEAE1] hover:bg-[#A36B3B] text-[#714624] hover:text-white border border-[#E4DCD0] hover:border-[#A36B3B] transition-all cursor-pointer disabled:opacity-50"
                      title="Download audio file"
                      aria-label={`Download audio file for ${song.title}`}
                    >
                      {isDownloading[song.id] ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#A36B3B]" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.article>
              );
            })
          ) : (
            /* No Songs Match Empty State */
            <div className="text-center py-16 bg-white border border-[#EFEAE1] rounded-3xl p-8 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#EFEAE1] mx-auto flex items-center justify-center text-[#A36B3B] mb-3">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-[#141416]">
                No worship songs found
              </h3>
              <p className="text-xs sm:text-sm text-[#54575E] mt-1 max-w-sm mx-auto">
                No matches found for &ldquo;{searchQuery}&rdquo;. Try another title, ministry name, or clear the search.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EFEAE1] hover:bg-[#E4DCD0] text-[#714624] text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* 4. COMPACT FLOATING WORSHIP PLAYER (UNOBTRUSIVE)          */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showFloatingPlayer && currentSong && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 md:left-auto md:right-8 md:max-w-md z-40"
          >
            <div className="rounded-2xl bg-[#1E1713]/95 backdrop-blur-md border border-[#4A362B] text-[#FCFBF9] p-3 shadow-2xl flex items-center gap-3">
              {/* Cover thumbnail */}
              <div
                onClick={scrollToFeatured}
                className="w-11 h-11 rounded-lg overflow-hidden bg-[#150F0B] border border-[#523F32] shrink-0 cursor-pointer"
                title="Jump to Featured Player"
              >
                <img
                  src={
                    currentSong.coverUrl ||
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop'
                  }
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title & Artist */}
              <div
                onClick={scrollToFeatured}
                className="min-w-0 flex-1 cursor-pointer"
                title="Jump to Featured Player"
              >
                <div className="text-xs font-semibold text-[#FCFBF9] truncate">
                  {currentSong.title}
                </div>
                <div className="text-[11px] text-[#C28B57] truncate font-sans">
                  {currentSong.artist}
                </div>
              </div>

              {/* Mini transport buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={playPrevious}
                  className="p-1.5 text-[#E4DCD0] hover:text-[#FCFBF9] cursor-pointer"
                  title="Previous track"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-[#A36B3B] hover:bg-[#8D5A30] text-[#FCFBF9] flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={playNext}
                  className="p-1.5 text-[#E4DCD0] hover:text-[#FCFBF9] cursor-pointer"
                  title="Next track"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={scrollToFeatured}
                  className="p-1.5 text-[#8A7668] hover:text-[#FCFBF9] cursor-pointer ml-1"
                  title="Scroll to featured player"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 5. LYRICS MODAL                                          */}
      {/* ========================================================= */}
      <LyricsModal
        isOpen={isLyricsModalOpen}
        onClose={() => setIsLyricsModalOpen(false)}
        song={lyricsModalSong}
      />

      {/* ========================================================= */}
      {/* 6. TOAST NOTIFICATION                                    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1E1713] border border-[#A36B3B] text-[#FCFBF9] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium max-w-[90vw] text-center pointer-events-none flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5 text-[#C28B57]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
