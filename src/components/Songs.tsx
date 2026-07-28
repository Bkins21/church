import { useState, useRef, useEffect, DragEvent, ChangeEvent, MouseEvent, FormEvent } from 'react';
import { Play, Pause, Music, Upload, Search, Trash2, Volume2, VolumeX, SkipBack, SkipForward, Disc, RefreshCw, Shuffle, FileAudio, FileText, CheckCircle, Flame, Sparkles, AlertCircle, Download, Check, Globe, Laptop, Smartphone, Loader2 } from 'lucide-react';
import { Song } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from '../supabase';

interface SongsProps {
  userSongDownloads?: Song[];
  onSongDownloadSuccess?: (song: Song) => void;
}

export default function Songs({ userSongDownloads = [], onSongDownloadSuccess }: SongsProps = {}) {
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

  // Drag and drop / upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
  const [cloudSongs, setCloudSongs] = useState<Song[]>([]);
  const [uploadedSongs, setUploadedSongs] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem('gec_user_uploaded_songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Default Crossworship songs catalog
  const crossworshipCatalog: Song[] = [];

  // Fetch songs from Supabase Cloud on mount (for cross-device mobile/desktop sync)
  useEffect(() => {
    let isSubscribed = true;
    const fetchCloudSongs = async () => {
      if (!supabase) return;
      try {
        // Fetch from teachings with category='Song' or songs table
        const { data, error } = await supabase
          .from('teachings')
          .select('*')
          .eq('category', 'Song')
          .order('created_at', { ascending: false });

        if (!error && data && isSubscribed) {
          const mapped: Song[] = data.map((t: any) => ({
            id: t.id,
            title: t.title,
            artist: t.speaker || t.preacher || 'Crossworship',
            album: t.series || 'Single',
            duration: t.duration || '4:30',
            audioUrl: t.audio_url || t.audioUrl || '',
            coverUrl: t.cover_url || t.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop',
            lyrics: t.description || '[00:00] Worship anthem recorded at God\'s Edifice Church.',
            uploadedByUser: true
          }));
          setCloudSongs(mapped);
        }
      } catch (err) {
        console.error('Failed to load cloud songs:', err);
      }
    };

    fetchCloudSongs();
    return () => { isSubscribed = false; };
  }, []);

  // Function to delete all songs across local storage, cloud database, and local state
  const handleDeleteAllSongs = async () => {
    if (!confirm('Are you sure you want to delete ALL songs? This action cannot be undone.')) return;

    // 1. Clear local state and localStorage
    setUploadedSongs([]);
    setCloudSongs([]);
    setCurrentSong(null);
    setIsPlaying(false);
    localStorage.removeItem('gec_user_uploaded_songs');

    // 2. Delete songs from Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('teachings')
          .delete()
          .eq('category', 'Song');
      } catch (err) {
        console.error('Failed to delete songs from Supabase:', err);
      }
    }

    alert('All songs have been deleted successfully.');
  };

  // Form and pending upload state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaArtist, setMetaArtist] = useState('');
  const [metaAlbum, setMetaAlbum] = useState('');
  const [metaCoverUrl, setMetaCoverUrl] = useState('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop');
  const [metaLyrics, setMetaLyrics] = useState('');

  // Download states
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});

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
      const song = {
        ...songItem,
        audio_url: (songItem as any).audio_url || songItem.audioUrl || ""
      };

      // Extract the file path from the Supabase public URL
      let marker = "/storage/v1/object/public/sermons/";
      let bucket = "sermons";

      if (!song.audio_url.includes(marker) && song.audio_url.includes("/storage/v1/object/public/Teachings/")) {
        marker = "/storage/v1/object/public/Teachings/";
        bucket = "Teachings";
      }

      if (supabase && song.audio_url.includes(marker)) {
        const filePath = song.audio_url.split(marker)[1];

        // Download the actual file from Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucket)
          .download(filePath);

        if (error) {
          throw error;
        }

        // Get the file extension
        const extension =
          filePath.split(".").pop()?.split("?")[0] || "mp3";

        // Create a browser download
        const downloadUrl = URL.createObjectURL(data);

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${song.title}.${extension}`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up after the browser starts the download
        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
        }, 1000);
      } else {
        if (!song.audio_url) {
          throw new Error("Invalid audio URL");
        }
        const response = await fetch(song.audio_url);
        if (!response.ok) {
          throw new Error("Failed to download audio");
        }
        const blob = await response.blob();
        const urlWithoutQuery = song.audio_url.split("?")[0];
        const extension = urlWithoutQuery.split(".").pop() || "mp3";
        const downloadUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${song.title}.${extension}`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
        }, 1000);
      }
    } catch (error: any) {
      console.error("Download error:", error);
      alert(`Download failed: ${error.message}`);
    } finally {
      setIsDownloading(prev => ({ ...prev, [songItem.id]: false }));
    }
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Combine default catalog + cloud songs + user local uploads
  const fullPlaylist = [...crossworshipCatalog, ...cloudSongs, ...uploadedSongs];

  // Filter list
  const filteredPlaylist = fullPlaylist.filter(song => {
    return song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
           song.album.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (song.lyrics && song.lyrics.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Default to first song if none selected
  useEffect(() => {
    if (!currentSong && fullPlaylist.length > 0) {
      setCurrentSong(fullPlaylist[0]);
    }
  }, [fullPlaylist.length]);

  // Set up audio object & event listeners
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong, isShuffling, isLooping]);

  // Synchronize play state with HTML5 audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Sync volume and mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Handle song source changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const wasPlaying = isPlaying;
    audio.src = currentSong.audioUrl;
    audio.load();

    if (wasPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      setCurrentTime(0);
    }
  }, [currentSong]);

  // Play/Pause toggle
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSelectSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  // Next Track Logic
  const handleNext = () => {
    if (fullPlaylist.length === 0) return;
    if (isLooping && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    let nextIndex = 0;
    if (isShuffling) {
      nextIndex = Math.floor(Math.random() * fullPlaylist.length);
    } else if (currentSong) {
      const currentIndex = fullPlaylist.findIndex(s => s.id === currentSong.id);
      nextIndex = (currentIndex + 1) % fullPlaylist.length;
    }

    setCurrentSong(fullPlaylist[nextIndex]);
    setIsPlaying(true);
  };

  // Previous Track Logic
  const handlePrev = () => {
    if (fullPlaylist.length === 0 || !currentSong) return;
    
    let prevIndex = 0;
    if (isShuffling) {
      prevIndex = Math.floor(Math.random() * fullPlaylist.length);
    } else {
      const currentIndex = fullPlaylist.findIndex(s => s.id === currentSong.id);
      prevIndex = currentIndex === 0 ? fullPlaylist.length - 1 : currentIndex - 1;
    }

    setCurrentSong(fullPlaylist[prevIndex]);
    setIsPlaying(true);
  };

  // Seek bar handler
  const handleSeekChange = (e: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Volume slider handler
  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  // Format time (e.g., 03:42)
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Process File Uploads (Drag and Drop / File Input Click)
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const file = files[0];
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/x-m4a', 'audio/aac'];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.mp3') && !file.name.endsWith('.wav') && !file.name.endsWith('.m4a')) {
      setUploadError('Please upload a valid audio file (MP3, WAV, or M4A).');
      return;
    }

    // Limit size to 45MB for safety
    if (file.size > 45 * 1024 * 1024) {
      setUploadError('Audio file is too large. Please select a file under 45MB.');
      return;
    }

    try {
      setPendingFile(file);
      setMetaTitle(file.name.replace(/\.[^/.]+$/, "")); // Strip extension
      setMetaArtist('');
      setMetaAlbum('');
      setMetaCoverUrl('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop');
      setMetaLyrics(`[00:00] (This is your uploaded song: "${file.name.replace(/\.[^/.]+$/, "")}")\n[00:10] Enjoy full, responsive playback in our GEC custom player!\n[00:25] Play, pause, or seek at any point.`);
    } catch (err) {
      setUploadError('Failed to parse and process the audio file. Please try again.');
    }
  };

  // Save the custom song with full metadata details & Supabase Cloud Sync
  const handleSaveSongMetadata = async (e: FormEvent) => {
    e.preventDefault();
    if (!pendingFile) return;

    setIsUploadingToCloud(true);
    setUploadError(null);

    let finalAudioUrl = '';

    try {
      // 1. If Supabase is configured, upload to cloud storage
      if (isSupabaseConfigured && supabase) {
        const fileExt = pendingFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('Teachings')
          .upload(filePath, pendingFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('Teachings')
            .getPublicUrl(filePath);
          finalAudioUrl = publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase cloud storage upload fallback:', err);
    }

    // Fallback if cloud upload was skipped or failed
    if (!finalAudioUrl) {
      finalAudioUrl = URL.createObjectURL(pendingFile);
    }

    const songId = `user-song-${Date.now()}`;
    const newSong: Song = {
      id: songId,
      title: metaTitle.trim() || pendingFile.name.replace(/\.[^/.]+$/, ""),
      artist: metaArtist.trim() || 'Crossworship Singer',
      album: metaAlbum.trim() || 'Single',
      duration: '4:30',
      audioUrl: finalAudioUrl,
      coverUrl: metaCoverUrl.trim() || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop',
      lyrics: metaLyrics.trim() || `[00:00] (This is your uploaded song: "${pendingFile.name}")\n[00:10] Enjoy full, responsive playback in our GEC custom player!`,
      uploadedByUser: true
    };

    // 2. Sync to Supabase Database if configured (so mobile phone gets it automatically)
    if (isSupabaseConfigured && supabase && finalAudioUrl.startsWith('http')) {
      try {
        await supabase.from('teachings').insert([{
          id: songId,
          title: newSong.title,
          speaker: newSong.artist,
          category: 'Song',
          duration: newSong.duration,
          date: new Date().toISOString().split('T')[0],
          audio_url: finalAudioUrl,
          cover_url: newSong.coverUrl,
          description: newSong.lyrics
        }]);
        setCloudSongs(prev => [newSong, ...prev]);
      } catch (dbErr) {
        console.error('Database sync failed:', dbErr);
      }
    }

    const updatedUploads = [newSong, ...uploadedSongs];
    setUploadedSongs(updatedUploads);
    localStorage.setItem('gec_user_uploaded_songs', JSON.stringify(updatedUploads));
    
    // Auto-play the uploaded song
    setCurrentSong(newSong);
    setIsPlaying(true);
    setPendingFile(null);
    setIsUploadingToCloud(false);
  };

  // Delete uploaded song
  const handleDeleteUploadedSong = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const updated = uploadedSongs.filter(s => s.id !== id);
    setUploadedSongs(updated);
    localStorage.setItem('gec_user_uploaded_songs', JSON.stringify(updated));

    if (currentSong?.id === id) {
      setIsPlaying(false);
      setCurrentSong(crossworshipCatalog[0]);
    }
  };

  // Handle Drag Events
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="py-24 bg-[#040814]" id="gec-songs-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cci-gold-500/10 text-cci-gold-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-cci-gold-500/20">
            <Sparkles className="h-3.5 w-3.5" /> GEC Worship Ministry
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Crossworship Anthems
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 mx-auto mb-5 rounded-full" />
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
            Curated by <strong>Crossworship</strong>, the official worship department of God's Edifice Church. Experience intense spiritual devotion, corporate alignment, and apostolic fire through music.
          </p>

          {/* Sync Status Info Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center gap-3 bg-[#0a1128]/80 border border-cci-blue-800/60 rounded-2xl px-4 py-2.5 text-xs text-slate-300 backdrop-blur">
              {isSupabaseConfigured ? (
                <>
                  <Globe className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong className="text-emerald-400">Cloud Database Synced:</strong> Anthems & sermons uploaded here automatically sync across all your desktop and mobile devices.</span>
                </>
              ) : (
                <>
                  <Laptop className="h-4 w-4 text-amber-400 shrink-0" />
                  <span><strong className="text-amber-400">Device Local Mode:</strong> Browser local storage active. Run the SQL script under Admin to enable Supabase Cloud cross-device sync.</span>
                </>
              )}
            </div>

            {fullPlaylist.length > 0 && (
              <button
                onClick={handleDeleteAllSongs}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete All Songs ({fullPlaylist.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Master Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Playlist, Search, and File Upload (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Search Bar */}
            <div className="bg-[#0a1128]/50 border border-cci-blue-800/40 rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search songs, albums, or lyrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#040814] border border-cci-blue-800/60 focus:border-cci-gold-500 rounded-xl py-2.5 pl-11 pr-4 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
                />
                <Search className="absolute left-4 top-3 h-4 w-4 text-slate-500" />
              </div>
            </div>

            {/* Premium File Upload Box (Drag and Drop / File Input Click) */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 group relative overflow-hidden backdrop-blur-sm
                ${isDragging 
                  ? 'border-cci-gold-500 bg-cci-gold-500/10 scale-[0.99]' 
                  : 'border-cci-blue-800/60 hover:border-cci-gold-500/40 bg-[#0a1128]/30 hover:bg-[#0a1128]/50'
                }`}
              id="song-upload-box"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files)}
                accept="audio/*"
                className="hidden"
              />
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cci-gold-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cci-gold-500/10 border border-cci-gold-500/20 flex items-center justify-center mx-auto text-cci-gold-400 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-5 w-5" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-xs tracking-wider text-slate-200">
                    UPLOAD A SONG TO TEST
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Drag and drop your audio files here, or <span className="text-cci-gold-400 underline font-medium">browse devices</span>. Supports MP3, WAV, or M4A format.
                  </p>
                </div>
              </div>

              {uploadError && (
                <div className="mt-4 flex items-center gap-2 justify-center text-red-400 text-xs bg-red-950/20 border border-red-900/30 py-2 px-4 rounded-xl max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Playlist Container Card */}
            <div className="bg-[#0a1128]/60 border border-cci-blue-800/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-5 border-b border-cci-blue-800/40 pb-4">
                <div className="flex items-center gap-2.5">
                  <Music className="h-5 w-5 text-cci-gold-400" />
                  <h3 className="font-display font-bold text-sm tracking-wider text-white">
                    PLAYLIST ({filteredPlaylist.length})
                  </h3>
                </div>
                {uploadedSongs.length > 0 && (
                  <span className="text-[9px] font-mono font-bold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                    {uploadedSongs.length} Uploaded
                  </span>
                )}
              </div>

              {/* Songs Scroll Area */}
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredPlaylist.map((song, index) => {
                  const isSelected = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => handleSelectSong(song)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border group
                        ${isSelected
                          ? 'bg-cci-blue-800/50 border-cci-gold-500/60 shadow-lg'
                          : 'bg-[#040814]/40 hover:bg-[#0a1128]/75 border-cci-blue-850 hover:border-cci-blue-800/60'
                        }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Play State Thumbnail */}
                        <div className="relative shrink-0 w-11 h-11 rounded-xl overflow-hidden border border-cci-blue-800 p-[1px] bg-[#040814]">
                          <img
                            src={song.coverUrl}
                            alt={song.title}
                            className={`w-full h-full object-cover rounded-xl transition-all duration-300
                              ${isSelected && isPlaying ? 'scale-105 opacity-80' : 'opacity-90'}
                            `}
                          />
                          {isSelected && isPlaying ? (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="flex gap-0.5 items-end h-3">
                                <span className="w-[2px] bg-cci-gold-400 animate-[bounce_0.8s_infinite_100ms] h-full" />
                                <span className="w-[2px] bg-cci-gold-400 animate-[bounce_0.8s_infinite_300ms] h-2/3" />
                                <span className="w-[2px] bg-cci-gold-400 animate-[bounce_0.8s_infinite_200ms] h-1/2" />
                              </span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="h-4 w-4 text-white fill-white" />
                            </div>
                          )}
                        </div>

                        {/* Text Metadata */}
                        <div className="min-w-0 text-left">
                          <h4 className={`font-sans font-bold text-xs sm:text-sm truncate leading-snug
                            ${isSelected ? 'text-cci-gold-300' : 'text-slate-100 group-hover:text-white'}
                          `}>
                            {song.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-sans truncate">
                            {song.artist} <span className="text-slate-600 mx-1">•</span> {song.album}
                          </p>
                        </div>
                      </div>

                      {/* Right Meta details (Duration / Action) */}
                      <div className="flex items-center gap-3 shrink-0">
                        {song.uploadedByUser && (
                          <span className="hidden sm:inline-block text-[9px] font-mono tracking-widest uppercase text-cci-gold-400 bg-cci-gold-500/10 px-2 py-0.5 rounded border border-cci-gold-500/15">
                            Uploaded
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">
                          {song.duration}
                        </span>

                        {/* Song Download Button */}
                        <button
                          onClick={(e) => triggerSongDownload(song, e)}
                          disabled={isDownloading[song.id]}
                          className={`p-1.5 rounded-lg transition-all border
                            ${userSongDownloads.some(s => s.id === song.id)
                              ? 'bg-[#10b981]/10 border-[#10b981]/25 text-[#10b981]'
                              : isDownloading[song.id]
                                ? 'bg-cci-blue-800/40 border-cci-blue-700/50 text-slate-400 cursor-not-allowed'
                                : 'bg-[#040814]/60 border-[#1e293b] hover:border-cci-gold-500/40 text-slate-400 hover:text-white'
                            }`}
                          title={userSongDownloads.some(s => s.id === song.id) ? 'Saved in Vault' : isDownloading[song.id] ? 'Downloading...' : 'Download Anthem'}
                        >
                          {userSongDownloads.some(s => s.id === song.id) ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : isDownloading[song.id] ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-cci-gold-400" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {song.uploadedByUser && (
                          <button
                            onClick={(e) => handleDeleteUploadedSong(song.id, e)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/10 rounded-lg transition-colors"
                            title="Delete Uploaded Track"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredPlaylist.length === 0 && (
                  <div className="text-center py-16 border border-dashed border-cci-blue-800/40 rounded-2xl">
                    <Music className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <h4 className="font-display font-bold text-xs text-slate-400">No songs match your search</h4>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">Try refining your search terms or upload a custom MP3 audio to test.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Audio Player and Live Lyrics (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Audio Player Panel */}
            <div className="bg-[#0a1128]/70 border border-cci-blue-800/40 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cci-gold-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              {currentSong ? (
                <div className="space-y-6">
                  {/* CD Cover Rotation & Title */}
                  <div className="text-center space-y-4 pt-4">
                    <div className="relative mx-auto w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-cci-blue-700/60 p-[3px] bg-[#040814] flex items-center justify-center">
                      <div className="absolute inset-3 rounded-full border border-dashed border-cci-blue-800/50" />
                      <div className={`w-full h-full rounded-full overflow-hidden transition-all duration-1000 ease-in-out relative
                        ${isPlaying ? 'rotate-[360deg] duration-[15s] ease-linear infinite' : ''}
                      `}>
                        <img
                          src={currentSong.coverUrl}
                          alt={currentSong.title}
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      {/* Center CD Pin hole */}
                      <div className="absolute w-8 h-8 rounded-full bg-[#040814] border border-cci-blue-700 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-cci-gold-400 shadow shadow-black" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wide leading-tight">
                        {currentSong.title}
                      </h3>
                      <p className="text-xs text-cci-gold-400 font-sans">
                        {currentSong.artist}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {currentSong.album}
                      </p>
                    </div>
                  </div>

                  {/* Seek Bar Control */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeekChange}
                      className="w-full accent-cci-gold-500 h-1 bg-cci-blue-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Player Buttons Control */}
                  <div className="flex items-center justify-center gap-5">
                    <button
                      onClick={() => setIsShuffling(!isShuffling)}
                      className={`p-2 rounded-xl transition-all
                        ${isShuffling ? 'text-cci-gold-400 bg-cci-gold-500/10' : 'text-slate-500 hover:text-slate-300'}
                      `}
                      title="Shuffle Playlist"
                    >
                      <Shuffle className="h-4 w-4" />
                    </button>

                    <button
                      onClick={handlePrev}
                      className="p-2.5 rounded-full bg-cci-blue-800/40 border border-cci-blue-700/60 text-slate-300 hover:text-white hover:border-cci-gold-500 transition-all"
                      title="Previous Track"
                    >
                      <SkipBack className="h-4 w-4 fill-current" />
                    </button>

                    <button
                      onClick={togglePlay}
                      className="p-4 rounded-full bg-gradient-to-r from-cci-gold-600 to-cci-gold-500 text-[#040814] hover:scale-105 active:scale-95 transition-all shadow-md shadow-cci-gold-600/15"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5 fill-current" />
                      ) : (
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={handleNext}
                      className="p-2.5 rounded-full bg-cci-blue-800/40 border border-cci-blue-700/60 text-slate-300 hover:text-white hover:border-cci-gold-500 transition-all"
                      title="Next Track"
                    >
                      <SkipForward className="h-4 w-4 fill-current" />
                    </button>

                    <button
                      onClick={() => setIsLooping(!isLooping)}
                      className={`p-2 rounded-xl transition-all
                        ${isLooping ? 'text-cci-gold-400 bg-cci-gold-500/10' : 'text-slate-500 hover:text-slate-300'}
                      `}
                      title="Loop Track"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4 w-4" />
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
                      className="w-full accent-cci-gold-500 h-1 bg-cci-blue-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Tab Selector for Lyrics Display */}
                  <div className="flex justify-between items-center pt-2 border-t border-cci-blue-800/40 gap-3">
                    <button
                      onClick={() => setShowLyrics(!showLyrics)}
                      className={`text-[11px] font-semibold tracking-wider uppercase flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all
                        ${showLyrics
                          ? 'bg-cci-gold-500/10 border-cci-gold-500/20 text-cci-gold-400'
                          : 'border-cci-blue-800 text-slate-400 hover:text-slate-200'
                        }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}
                    </button>

                    <button
                      onClick={() => triggerSongDownload(currentSong)}
                      disabled={isDownloading[currentSong.id]}
                      className={`text-[11px] font-semibold tracking-wider uppercase flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all
                        ${userSongDownloads.some(s => s.id === currentSong.id)
                          ? 'bg-[#10b981]/10 border-[#10b981]/25 text-[#10b981]'
                          : isDownloading[currentSong.id]
                            ? 'border-cci-blue-800 bg-[#0a1128]/40 text-slate-400 cursor-not-allowed'
                            : 'bg-cci-gold-500 hover:bg-cci-gold-400 border-transparent text-[#040814]'
                        }`}
                    >
                      {userSongDownloads.some(s => s.id === currentSong.id) ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Saved</span>
                        </>
                      ) : isDownloading[currentSong.id] ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" />
                          <span>Download Anthem</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <Disc className="h-12 w-12 text-slate-700 mx-auto mb-3 animate-spin" />
                  <p className="text-xs text-slate-500">No Track Selected</p>
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
                  className="bg-[#0a1128]/50 border border-cci-blue-800/40 rounded-3xl p-5 shadow-lg max-h-[350px] overflow-y-auto font-sans leading-relaxed text-slate-300"
                >
                  <div className="flex items-center gap-2 border-b border-cci-blue-800/40 pb-3 mb-4">
                    <FileText className="h-4 w-4 text-cci-gold-400" />
                    <h4 className="font-display font-bold text-[11px] tracking-wider text-slate-200 uppercase">
                      Lyrics Board
                    </h4>
                  </div>

                  <div className="space-y-3.5 text-center text-xs whitespace-pre-wrap select-none font-sans italic">
                    {currentSong.lyrics.split('\n').map((line, idx) => {
                      // Simple regex to parse timestamp [mm:ss]
                      const match = line.match(/^\[(\d+):(\d+)\](.*)/);
                      const lyricText = match ? match[3].trim() : line;
                      return (
                        <p key={idx} className="hover:text-cci-gold-300 transition-colors">
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

      {/* Upload Metadata Dialog Modal */}
      <AnimatePresence>
        {pendingFile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-rich-black/85 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-charcoal border border-light-gray/20 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 my-8"
            >
              <div className="flex items-center gap-2.5 pb-4 border-b border-light-gray/10 mb-6">
                <div className="p-2 bg-royal-blue/15 rounded-xl">
                  <Music className="h-5 w-5 text-electric-blue" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-soft-white">
                    Add Audio Details
                  </h3>
                  <p className="text-[11px] text-light-gray mt-0.5">
                    Provide a title, singer, album name, and cover image for your custom upload
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSongMetadata} className="space-y-4 font-sans text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-light-gray uppercase tracking-wider mb-1.5">
                    Audio File (Selected)
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-rich-black/50 border border-light-gray/10 rounded-xl">
                    <FileAudio className="h-5 w-5 text-electric-blue shrink-0 animate-pulse" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-soft-white truncate">{pendingFile.name}</p>
                      <p className="text-[10px] text-medium-gray">{(pendingFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-light-gray uppercase tracking-wider mb-1.5">
                      Song Title <span className="text-electric-blue">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="e.g. My Praise Testimony"
                      className="w-full bg-rich-black/50 border border-light-gray/20 focus:border-electric-blue rounded-xl py-2.5 px-3 text-xs text-soft-white placeholder-medium-gray focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-light-gray uppercase tracking-wider mb-1.5">
                      Singer / Artist <span className="text-electric-blue">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={metaArtist}
                      onChange={(e) => setMetaArtist(e.target.value)}
                      placeholder="e.g. Sister Deborah, GEC Choir"
                      className="w-full bg-rich-black/50 border border-light-gray/20 focus:border-electric-blue rounded-xl py-2.5 px-3 text-xs text-soft-white placeholder-medium-gray focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-light-gray uppercase tracking-wider mb-1.5">
                      Album Name
                    </label>
                    <input
                      type="text"
                      value={metaAlbum}
                      onChange={(e) => setMetaAlbum(e.target.value)}
                      placeholder="e.g. Single / My Shared Audios"
                      className="w-full bg-rich-black/50 border border-light-gray/20 focus:border-electric-blue rounded-xl py-2.5 px-3 text-xs text-soft-white placeholder-medium-gray focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-light-gray uppercase tracking-wider mb-1.5">
                      Cover Image Preset
                    </label>
                    <select
                      value={metaCoverUrl}
                      onChange={(e) => setMetaCoverUrl(e.target.value)}
                      className="w-full bg-rich-black/50 border border-light-gray/20 focus:border-electric-blue rounded-xl py-2.5 px-3 text-xs text-soft-white focus:outline-none transition-all"
                    >
                      <option value="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop">🎸 Dynamic Rock Cover</option>
                      <option value="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop">🎧 Studio Microphone</option>
                      <option value="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop">🎤 Live Worship Singer</option>
                      <option value="https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=400&auto=format&fit=crop">☀️ Sunlight & Devotion</option>
                      <option value="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop">📖 Old Bible & Light</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-light-gray uppercase tracking-wider mb-1.5">
                    Synced Lyrics Sheet (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={metaLyrics}
                    onChange={(e) => setMetaLyrics(e.target.value)}
                    placeholder={`e.g.\n[00:00] My Soul Magnifies the Lord\n[00:15] And my spirit praises God my savior`}
                    className="w-full bg-rich-black/50 border border-light-gray/20 focus:border-electric-blue rounded-xl py-2.5 px-3 text-xs text-soft-white placeholder-medium-gray focus:outline-none resize-none transition-all font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-light-gray/10 mt-6">
                  <button
                    type="button"
                    onClick={() => setPendingFile(null)}
                    className="px-4 py-2.5 rounded-xl border border-light-gray/20 hover:border-light-gray/40 text-soft-white hover:bg-rich-black/30 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-electric-blue hover:bg-royal-blue text-soft-white font-medium shadow-lg hover:shadow-electric-blue/10 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Complete Upload</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
