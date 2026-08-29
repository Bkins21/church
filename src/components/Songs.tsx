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
  FileText,
  Download,
  Loader2,
  ShieldCheck,
  ExternalLink,
  X,
} from 'lucide-react';
import { Song } from '../types';
import { crossworshipSongsCatalog } from '../data';
import { motion } from 'motion/react';
import { supabase } from '../supabase';
import { downloadLyricsFile } from '../utils/lyricsHelper';
import LyricsModal from './LyricsModal';

interface SongsProps {
  userSongDownloads?: Song[];
  onSongDownloadSuccess?: (song: Song) => void;
  isAdmin?: boolean;
}

export default function Songs({
  userSongDownloads = [],
  onSongDownloadSuccess,
  isAdmin: propIsAdmin,
}: SongsProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>(crossworshipSongsCatalog);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>(
    {}
  );

  const [lyricsModalSong, setLyricsModalSong] = useState<Song | null>(null);
  const [isLyricsModalOpen, setIsLyricsModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (propIsAdmin !== undefined) return propIsAdmin;

    try {
      return localStorage.getItem('gec_is_admin') === 'true';
    } catch {
      return false;
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
   * FETCH SONGS FROM SUPABASE
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const fetchSongs = async () => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('Songs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Could not fetch songs:', error);
          return;
        }

        if (!mounted) return;

        if (data && data.length > 0) {
          const mappedSongs: Song[] = data.map((song: any) => ({
            id: song.id,
            title: song.title || '',
            artist: song.artist || 'Crossworship',
            album: song.album || "Edifice Anthem Single",
            duration: song.duration || '4:30',
            audioUrl: song.audio_url || '',
            coverUrl: song.artwork || '',
            lyrics: song.description || '',
            downloads: song.downloads || 0,
            uploadedByUser: false,
          }));

          setSongs(mappedSongs);
        } else {
          setSongs(crossworshipSongsCatalog);
        }
      } catch (error) {
        console.error('Song fetch failed:', error);
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
   * SEARCH
   * ---------------------------------------------------------
   */

  const filteredSongs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return songs;

    return songs.filter((song) => {
      return (
        song.title?.toLowerCase().includes(query) ||
        song.artist?.toLowerCase().includes(query) ||
        song.album?.toLowerCase().includes(query) ||
        song.lyrics?.toLowerCase().includes(query)
      );
    });
  }, [songs, searchQuery]);

  /*
   * ---------------------------------------------------------
   * AUDIO PLAYER
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
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();

      audio.removeEventListener(
        'loadedmetadata',
        handleLoadedMetadata
      );
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
   * PLAY SONG
   * ---------------------------------------------------------
   */

  const playSong = async (song: Song) => {
    const audio = audioRef.current;

    if (!audio) return;

    if (!song.audioUrl) {
      showToast('This song has no audio file available.');
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

      await audio.play();
    } catch (error) {
      console.error('Playback failed:', error);
      setIsPlaying(false);
      showToast('Unable to play this song.');
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio || !currentSong) return;

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  /*
   * ---------------------------------------------------------
   * PREVIOUS / NEXT
   * ---------------------------------------------------------
   */

  const playPrevious = () => {
    if (!currentSong || filteredSongs.length === 0) return;

    const currentIndex = filteredSongs.findIndex(
      (song) => song.id === currentSong.id
    );

    if (currentIndex > 0) {
      playSong(filteredSongs[currentIndex - 1]);
    }
  };

  const playNext = () => {
    if (!currentSong || filteredSongs.length === 0) return;

    const currentIndex = filteredSongs.findIndex(
      (song) => song.id === currentSong.id
    );

    if (
      currentIndex >= 0 &&
      currentIndex < filteredSongs.length - 1
    ) {
      playSong(filteredSongs[currentIndex + 1]);
    }
  };

  /*
   * ---------------------------------------------------------
   * SEEK
   * ---------------------------------------------------------
   */

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);

    setCurrentTime(newTime);

    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  /*
   * ---------------------------------------------------------
   * VOLUME
   * ---------------------------------------------------------
   */

  const handleVolumeChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const newVolume = Number(e.target.value);

    setVolume(newVolume);

    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DOWNLOAD SONG
   * ---------------------------------------------------------
   */

  const triggerSongDownload = async (
    song: Song,
    e?: MouseEvent
  ) => {
    if (e) e.stopPropagation();

    if (!song.audioUrl) {
      showToast('Audio file is not available.');
      return;
    }

    setIsDownloading((prev) => ({
      ...prev,
      [song.id]: true,
    }));

    try {
      const response = await fetch(song.audioUrl);

      if (!response.ok) {
        throw new Error('Unable to download audio');
      }

      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = blobUrl;
      link.download = `${song.title
        .replace(/[^a-zA-Z0-9_-]/g, '_')}.mp3`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);

      /*
       * Increment download count.
       */
      if (supabase && song.id) {
        try {
          await supabase
            .from('Songs')
            .update({
              downloads: (song.downloads || 0) + 1,
            })
            .eq('id', song.id);
        } catch (error) {
          console.warn(
            'Could not update download count:',
            error
          );
        }
      }

      /*
       * Save locally.
       */
      try {
        const stored = localStorage.getItem(
          'gec_user_song_downloads'
        );

        const downloads: Song[] = stored
          ? JSON.parse(stored)
          : [];

        if (!downloads.some((item) => item.id === song.id)) {
          downloads.push(song);

          localStorage.setItem(
            'gec_user_song_downloads',
            JSON.stringify(downloads)
          );
        }
      } catch (error) {
        console.warn(
          'Could not save download locally:',
          error
        );
      }

      onSongDownloadSuccess?.(song);

      showToast(`Downloaded "${song.title}"`);
    } catch (error) {
      console.error('Download failed:', error);

      /*
       * Fallback: open the audio URL directly.
       */
      window.open(song.audioUrl, '_blank');

      showToast('Opening audio file...');
    } finally {
      setIsDownloading((prev) => ({
        ...prev,
        [song.id]: false,
      }));
    }
  };

  /*
   * ---------------------------------------------------------
   * LYRICS
   * ---------------------------------------------------------
   */

  const openLyrics = (
    song: Song,
    e?: MouseEvent
  ) => {
    if (e) e.stopPropagation();

    setLyricsModalSong(song);
    setIsLyricsModalOpen(true);
  };

  const downloadLyrics = (
    song: Song,
    e?: MouseEvent
  ) => {
    if (e) e.stopPropagation();

    if (!song.lyrics?.trim()) {
      showToast('Lyrics are not available.');
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
      showToast('Unable to download lyrics.');
    }
  };

  /*
   * ---------------------------------------------------------
   * TOAST
   * ---------------------------------------------------------
   */

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToastMessage(message);

    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  /*
   * ---------------------------------------------------------
   * TIME FORMAT
   * ---------------------------------------------------------
   */

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div
      id="songs-portal"
      className="min-h-screen bg-[#180E07] text-[#F7F5F0] pb-32 w-full max-w-full overflow-x-hidden"
    >
      {/* HEADER */}
      <section className="bg-gradient-to-b from-[#2D1A0D] to-[#180E07] border-b border-[#4A2D17] w-full max-w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-cinzel font-bold text-white">
                Crossworship Psalms
              </h1>

              <p className="mt-3 text-sm sm:text-base text-[#E4DCD0]/80 max-w-2xl">
                Listen to and download worship songs from
                Crossworship.
              </p>
            </div>

            {isAdmin && (
              <a
                href="/crosswordmedia"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#A37F3B] hover:bg-[#8F6D2F] text-white text-xs font-bold transition-colors shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Manager
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* SEARCH */}
          <div className="mt-8 relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A37F3B]" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search songs, artists or albums..."
              className="w-full max-w-full pl-11 pr-11 py-3.5 rounded-2xl bg-[#25160B] border border-[#4A2D17] focus:border-[#A37F3B] outline-none text-sm text-white placeholder-[#8A7463]"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A7463] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full max-w-full overflow-x-hidden">
        <div className="grid lg:grid-cols-12 gap-8 w-full max-w-full">
          {/* SONG LIST */}
          <section className="lg:col-span-7 min-w-0 w-full max-w-full">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#4A2D17]">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-[#A37F3B]" />

                <h2 className="font-cinzel font-bold text-white">
                  Worship Songs
                </h2>
              </div>

              <span className="text-xs text-[#8A7463]">
                {filteredSongs.length} songs
              </span>
            </div>

            <div className="space-y-3 w-full">
              {filteredSongs.length > 0 ? (
                filteredSongs.map((song, index) => {
                  const isCurrent =
                    currentSong?.id === song.id;

                  const hasLyrics =
                    Boolean(song.lyrics?.trim());

                  return (
                    <motion.div
                      key={song.id || index}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl border transition-all w-full max-w-full overflow-hidden ${
                        isCurrent
                          ? 'bg-[#2D1B0E] border-[#A37F3B]'
                          : 'bg-[#25160B] border-[#4A2D17] hover:border-[#A37F3B]/60'
                      }`}
                    >
                      {/* PLAY */}
                      <button
                        type="button"
                        onClick={() => playSong(song)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-[#A37F3B] text-white'
                            : 'bg-[#3A2312] text-[#E5B869] hover:bg-[#A37F3B] hover:text-white'
                        }`}
                        aria-label={`Play ${song.title}`}
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* ARTWORK */}
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-[#150B05] border border-[#4A2D17] shrink-0">
                        <img
                          src={
                            song.coverUrl ||
                            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop'
                          }
                          alt={song.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* DETAILS */}
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <h3
                          className={`font-semibold text-xs sm:text-sm truncate ${
                            isCurrent
                              ? 'text-[#E5B869]'
                              : 'text-white'
                          }`}
                        >
                          {song.title}
                        </h3>

                        <p className="text-[11px] sm:text-xs text-[#8A7463] truncate mt-0.5">
                          {song.artist}
                          {song.album
                            ? ` • ${song.album}`
                            : ''}
                        </p>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        {hasLyrics && (
                          <>
                            <button
                              type="button"
                              onClick={(e) =>
                                openLyrics(song, e)
                              }
                              className="p-1.5 sm:p-2 rounded-xl bg-[#1D1108] border border-[#4A2D17] hover:border-[#A37F3B] text-[#E5B869] transition-colors"
                              title="View lyrics"
                            >
                              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) =>
                                downloadLyrics(song, e)
                              }
                              className="hidden sm:flex p-2 rounded-xl bg-[#1D1108] border border-[#4A2D17] hover:border-[#A37F3B] text-[#A37F3B] transition-colors"
                              title="Download lyrics"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={(e) =>
                            triggerSongDownload(song, e)
                          }
                          disabled={
                            isDownloading[song.id]
                          }
                          className="p-1.5 sm:p-2 rounded-xl bg-[#A37F3B] hover:bg-[#8F6D2F] text-white transition-colors disabled:opacity-50"
                          title="Download song"
                        >
                          {isDownloading[song.id] ? (
                            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-[#25160B] border border-[#4A2D17] rounded-2xl">
                  <Music className="w-10 h-10 mx-auto text-[#A37F3B] opacity-50 mb-3" />

                  <h3 className="font-semibold text-white">
                    No songs found
                  </h3>

                  <p className="text-xs text-[#8A7463] mt-1">
                    Try another search.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* PLAYER */}
          <aside className="lg:col-span-5 min-w-0 w-full max-w-full">
            <div className="lg:sticky lg:top-24 bg-[#25160B] border border-[#4A2D17] rounded-3xl p-4 sm:p-7 w-full max-w-full overflow-hidden">
              {currentSong ? (
                <>
                  {/* ARTWORK */}
                  <div className="aspect-square max-w-[260px] sm:max-w-sm mx-auto rounded-2xl overflow-hidden border border-[#4A2D17] bg-[#150B05]">
                    <img
                      src={
                        currentSong.coverUrl ||
                        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop'
                      }
                      alt={currentSong.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* INFO */}
                  <div className="text-center mt-5 sm:mt-6 px-2 min-w-0">
                    <h2 className="text-lg sm:text-2xl font-cinzel font-bold text-white truncate">
                      {currentSong.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#E5B869] mt-1 truncate">
                      {currentSong.artist}
                    </p>

                    {currentSong.album && (
                      <p className="text-[11px] sm:text-xs text-[#8A7463] mt-1 truncate">
                        {currentSong.album}
                      </p>
                    )}
                  </div>

                  {/* PROGRESS */}
                  <div className="mt-5 sm:mt-6 w-full">
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.1}
                      value={Math.min(
                        currentTime,
                        duration || 0
                      )}
                      onChange={handleSeek}
                      className="w-full max-w-full accent-[#A37F3B] cursor-pointer"
                    />

                    <div className="flex justify-between text-[11px] font-mono text-[#8A7463] mt-1">
                      <span>
                        {formatTime(currentTime)}
                      </span>

                      <span>
                        {formatTime(duration)}
                      </span>
                    </div>
                  </div>

                  {/* CONTROLS */}
                  <div className="flex items-center justify-center gap-4 sm:gap-5 mt-4 sm:mt-5">
                    <button
                      type="button"
                      onClick={playPrevious}
                      className="p-2.5 rounded-full hover:bg-[#3A2312] text-white transition-colors"
                      title="Previous song"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#A37F3B] hover:bg-[#8F6D2F] text-white flex items-center justify-center shadow-lg transition-all hover:scale-105"
                      aria-label={
                        isPlaying
                          ? 'Pause'
                          : 'Play'
                      }
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={playNext}
                      className="p-2.5 rounded-full hover:bg-[#3A2312] text-white transition-colors"
                      title="Next song"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>

                  {/* VOLUME */}
                  <div className="flex items-center gap-3 mt-5 sm:mt-6 w-full">
                    <button
                      type="button"
                      onClick={() =>
                        setIsMuted((prev) => !prev)
                      }
                      className="text-[#A37F3B] hover:text-white shrink-0"
                      title={
                        isMuted
                          ? 'Unmute'
                          : 'Mute'
                      }
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4" />
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
                      className="flex-1 max-w-full accent-[#A37F3B]"
                      aria-label="Volume"
                    />
                  </div>

                  {/* ACTIONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5 sm:mt-6 w-full">
                    {currentSong.lyrics?.trim() && (
                      <button
                        type="button"
                        onClick={() =>
                          openLyrics(currentSong)
                        }
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#1D1108] border border-[#4A2D17] hover:border-[#A37F3B] text-[#E5B869] text-xs font-semibold transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        View Lyrics
                      </button>
                    )}

                    {currentSong.lyrics?.trim() && (
                      <button
                        type="button"
                        onClick={() =>
                          downloadLyrics(currentSong)
                        }
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#1D1108] border border-[#4A2D17] hover:border-[#A37F3B] text-white text-xs font-semibold transition-colors"
                      >
                        <Download className="w-4 h-4 text-[#A37F3B]" />
                        Download Lyrics
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        triggerSongDownload(
                          currentSong
                        )
                      }
                      disabled={
                        isDownloading[
                          currentSong.id
                        ]
                      }
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#A37F3B] hover:bg-[#8F6D2F] text-white text-xs font-bold transition-colors disabled:opacity-50 sm:col-span-2"
                    >
                      {isDownloading[
                        currentSong.id
                      ] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}

                      Download Song
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#3A2312] mx-auto flex items-center justify-center mb-4 sm:mb-5">
                    <Music className="w-7 h-7 sm:w-8 sm:h-8 text-[#A37F3B]" />
                  </div>

                  <h2 className="font-cinzel font-bold text-white text-base sm:text-lg">
                    Select a Song
                  </h2>

                  <p className="text-xs text-[#8A7463] mt-2 max-w-xs mx-auto">
                    Choose a worship song from the
                    catalogue to preview it here.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* LYRICS MODAL */}
      <LyricsModal
        isOpen={isLyricsModalOpen}
        onClose={() =>
          setIsLyricsModalOpen(false)
        }
        song={lyricsModalSong}
      />

      {/* TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#25160B] border border-[#A37F3B] text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-medium max-w-[90vw] text-center pointer-events-none">
          {toastMessage}
        </div>
      )}
    </div>
  );
}