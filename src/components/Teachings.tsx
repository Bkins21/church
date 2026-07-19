import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { Search, Play, Pause, Download, Volume2, Music, Clock, User, Disc, Check, Flame, ChevronRight, VolumeX, ShieldAlert, ShieldCheck, Lock, Unlock, Plus, FileAudio, X, Key, CheckCircle, Trash2 } from 'lucide-react';
import { Teaching } from '../types';
import { teachingsCatalog } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface TeachingsProps {
  onDownloadSuccess: (teaching: Teaching) => void;
  userDownloads: Teaching[];
  teachingsList?: Teaching[];
  isAdmin?: boolean;
  onAddTeaching?: (teaching: Teaching) => void;
  onToggleAdmin?: (value: boolean) => void;
  onDeleteTeaching?: (id: string) => void;
}

export default function Teachings({ 
  onDownloadSuccess, 
  userDownloads,
  teachingsList,
  isAdmin,
  onAddTeaching,
  onToggleAdmin,
  onDeleteTeaching
}: TeachingsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  
  // Use prop catalog if available, otherwise fallback to static teachingsCatalog
  const catalog = teachingsList && teachingsList.length > 0 ? teachingsList : teachingsCatalog;

  // Audio Player States
  const [currentTrack, setCurrentTrack] = useState<Teaching | null>(() => catalog[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  // Downloading Simulation States
  const [downloadProgress, setDownloadProgress] = useState<{ [id: string]: number }>({});
  const [isDownloading, setIsDownloading] = useState<{ [id: string]: boolean }>({});

  // Admin and Upload states
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Upload Form states
  const [title, setTitle] = useState('');
  const [series, setSeries] = useState('');
  const [preacher, setPreacher] = useState('Pastor Abiodun Adebayo');
  const [description, setDescription] = useState('');
  const [durationForm, setDurationForm] = useState('45m');
  const [audioUrl, setAudioUrl] = useState('');
  const [selectedPresetCover, setSelectedPresetCover] = useState('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop');
  const [fileSize, setFileSize] = useState('18.5 MB');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const triggerFileProcess = (file: File) => {
    setIsUploadingFile(true);
    setUploadProgress(10);
    setUploadedFileName(file.name);

    // Calculate MB size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMB} MB`);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploadingFile(false);
          const localUrl = URL.createObjectURL(file);
          setAudioUrl(localUrl);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const handleAudioFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerFileProcess(file);
    }
  };

  const handleAuthAdmin = () => {
    if (passcode.toLowerCase() === 'admin') {
      if (onToggleAdmin) onToggleAdmin(true);
      setPasscode('');
      setPasscodeError('');
      setIsAdminLoginModalOpen(false);
    } else {
      setPasscodeError('Invalid passcode. Hint: Use "admin"');
    }
  };

  const handleDeauthAdmin = () => {
    if (onToggleAdmin) onToggleAdmin(false);
  };

  const handlePublishTeaching = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !series.trim()) {
      alert('Please fill out the Title and Series fields.');
      return;
    }

    const finalAudioUrl = audioUrl.trim() || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

    const newTeaching: Teaching = {
      id: `sermon-custom-${Date.now()}`,
      title: title.trim(),
      series: series.trim(),
      preacher: preacher.trim(),
      date: new Date().toISOString().split('T')[0],
      duration: durationForm.trim(),
      description: description.trim() || 'No description provided.',
      audioUrl: finalAudioUrl,
      coverUrl: selectedPresetCover,
      downloadCount: 0,
      size: fileSize
    };

    if (onAddTeaching) {
      onAddTeaching(newTeaching);
      // Reset form and close
      setTitle('');
      setSeries('');
      setDescription('');
      setDurationForm('45m');
      setAudioUrl('');
      setUploadedFileName('');
      setIsUploadModalOpen(false);
    }
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter series names
  const seriesCategories = ['all', ...Array.from(new Set(catalog.map(t => t.series)))];

  // Filter teachings
  const filteredTeachings = catalog.filter(teaching => {
    const matchesSearch = teaching.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          teaching.preacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          teaching.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeries = selectedSeries === 'all' || teaching.series === selectedSeries;

    return matchesSearch && matchesSeries;
  });

  // Handle Play/Pause of current sermon
  const handlePlayPause = (teaching: Teaching) => {
    if (currentTrack?.id === teaching.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(teaching);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  // Sync HTML5 Audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Handle src changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const wasPlaying = isPlaying;
    audio.src = currentTrack.audioUrl;
    audio.load();

    if (wasPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack]);

  // Handle play/pause commands
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle Volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Download simulation
  const triggerDownload = (teaching: Teaching) => {
    if (isDownloading[teaching.id]) return;

    setIsDownloading(prev => ({ ...prev, [teaching.id]: true }));
    setDownloadProgress(prev => ({ ...prev, [teaching.id]: 0 }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setDownloadProgress(prev => ({ ...prev, [teaching.id]: progress }));

      if (progress >= 100) {
        clearInterval(interval);
        setIsDownloading(prev => ({ ...prev, [teaching.id]: false }));
        onDownloadSuccess(teaching);

        // Perform actual browser download of the uploaded audio or a detailed receipt
        try {
          const isUploadedUrl = teaching.audioUrl.startsWith('blob:') || teaching.audioUrl.startsWith('data:');
          const link = document.createElement('a');
          
          if (isUploadedUrl) {
            link.href = teaching.audioUrl;
            link.download = `${teaching.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
          } else {
            const content = `GOD'S EDIFICE CHURCH\nSermon Teaching Download Receipt\n\nTitle: ${teaching.title}\nPreacher: ${teaching.preacher}\nSeries: ${teaching.series}\nDate Released: ${teaching.date}\nSize: ${teaching.size}\n\nThank you for downloading teachings from GEC. Access and listen on the portal anytime!\nTo see all men saved and come to the knowledge of truth.`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = `${teaching.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.txt`;
          }
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          if (!isUploadedUrl) {
            URL.revokeObjectURL(link.href);
          }
        } catch (e) {
          console.error('Download trigger failed', e);
        }
      }
    }, 200);
  };

  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return '0:00';
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="teachings-view">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          Crossword Media Center
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 mx-auto mb-5 rounded-full" />
        <p className="text-sm sm:text-base text-slate-300">
          Feed your spirit with systematic teachings of the Gospel. Search through sermons preached by Pastor Abiodun Adebayo and Resident Pastors, and listen or download to your devices for study and meditation.
        </p>
      </div>

      {/* Admin Quick Action Bar */}
      {isAdmin && (
        <div className="max-w-3xl mx-auto -mt-10 mb-12 flex items-center justify-center gap-3" id="teachings-admin-bar">
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 rounded-full py-1.5 px-4 animate-fade-in shadow-lg">
            <ShieldCheck className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Admin Status: Authorized</span>
            <span className="text-slate-400">|</span>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="text-xs font-bold text-cci-gold-400 hover:text-cci-gold-300 flex items-center gap-1 transition-colors cursor-pointer"
              id="btn-teachings-open-upload"
            >
              <Plus className="h-3.5 w-3.5" />
              Upload Sermon Audio
            </button>
            <span className="text-slate-400">|</span>
            <button
              onClick={handleDeauthAdmin}
              className="text-[10px] font-mono text-red-400 hover:text-red-300 underline transition-colors cursor-pointer"
              id="btn-teachings-logout"
            >
              Logout Admin
            </button>
          </div>
        </div>
      )}

      {/* Series Filter Tabs & Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        
        {/* Search */}
        <div className="lg:col-span-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by topic, keyword, or series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cci-blue-900/40 border border-cci-blue-800/80 focus:border-cci-gold-500 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
              id="teaching-search"
            />
          </div>
        </div>

        {/* Series Filter */}
        <div className="lg:col-span-8 overflow-x-auto flex gap-2 pb-2 scrollbar-none items-center">
          <span className="text-xs uppercase font-mono text-slate-500 shrink-0 mr-2">Series:</span>
          {seriesCategories.map((series) => (
            <button
              key={series}
              onClick={() => setSelectedSeries(series)}
              className={`px-3.5 py-2 rounded-lg font-display text-xs font-semibold whitespace-nowrap transition-all
                ${selectedSeries === series
                  ? 'bg-cci-gold-500 text-[#040814]'
                  : 'bg-[#0a1128] border border-cci-blue-800/60 hover:bg-cci-blue-800/40 text-slate-300'
                }`}
              id={`filter-series-${series.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {series === 'all' ? 'All Messages' : series}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Catalog / Player Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        
        {/* Catalog List (Left) */}
        <div className="lg:col-span-7 space-y-4" id="teachings-catalog-list">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2 mb-4">
            <Flame className="h-4 w-4 text-cci-gold-400" />
            Sermon Teachings Catalog
          </h3>

          {filteredTeachings.length > 0 ? (
            filteredTeachings.map((teaching) => {
              const isDownloaded = userDownloads.some(dl => dl.id === teaching.id);
              const progress = downloadProgress[teaching.id] || 0;
              const downloading = isDownloading[teaching.id];
              const isCurrent = currentTrack?.id === teaching.id;

              return (
                <div
                  key={teaching.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between
                    ${isCurrent 
                      ? 'bg-gradient-to-r from-cci-blue-900/50 to-cci-blue-800/30 border-cci-gold-500/30' 
                      : 'bg-gradient-to-r from-[#0a1128]/45 to-[#040814]/80 border-cci-blue-800/80 hover:border-cci-blue-700'
                    }`}
                  id={`teaching-item-${teaching.id}`}
                >
                  <div className="flex gap-4 items-center w-full sm:w-auto">
                    {/* Cover Thumbnail */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-950 flex items-center justify-center border border-cci-blue-800">
                      <img
                        src={teaching.coverUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-transform ${isCurrent && isPlaying ? 'scale-105 duration-[3000ms] ease-linear rotate-12' : ''}`}
                      />
                      
                      {/* Play overlay */}
                      <button
                        onClick={() => handlePlayPause(teaching)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center hover:bg-black/40 transition-colors"
                        id={`btn-play-sermon-${teaching.id}`}
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="h-6 w-6 text-cci-gold-400" />
                        ) : (
                          <Play className="h-6 w-6 text-white fill-white" />
                        )}
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-cci-gold-400 font-mono font-semibold uppercase">{teaching.series}</p>
                      <h4 className="font-display font-bold text-sm sm:text-base text-slate-100 hover:text-cci-gold-300 transition-colors truncate mt-0.5">
                        {teaching.title}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-400 font-sans mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 shrink-0 text-slate-500" />
                          {teaching.preacher}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0 text-slate-500" />
                          {teaching.duration}
                        </span>
                        <span className="text-slate-500 font-mono text-[9px]">{teaching.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-cci-blue-800/40 pt-3 sm:pt-0 gap-2">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => triggerDownload(teaching)}
                        disabled={downloading}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 w-full sm:w-auto justify-center
                          ${isDownloaded 
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' 
                            : downloading 
                              ? 'bg-cci-blue-850 text-slate-400 border border-cci-blue-800 pointer-events-none' 
                              : 'bg-[#040814] border border-cci-blue-800 hover:border-cci-gold-500/30 text-slate-300 hover:text-white'
                          }`}
                        id={`btn-download-sermon-${teaching.id}`}
                      >
                        {isDownloaded ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Saved</span>
                          </>
                        ) : downloading ? (
                          <span className="flex items-center gap-1 font-mono text-[10px]">
                            Downloading {progress}%
                          </span>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5 text-cci-gold-400" />
                            <span>Get Audio</span>
                          </>
                        )}
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${teaching.title}"?`)) {
                              if (onDeleteTeaching) onDeleteTeaching(teaching.id);
                            }
                          }}
                          className="p-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                          title="Delete Sermon"
                          id={`btn-delete-sermon-${teaching.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-[#0a1128]/20 border border-cci-blue-800/40 rounded-2xl">
              <p className="text-sm text-slate-400">No sermons found matching your parameters.</p>
            </div>
          )}
        </div>

        {/* Media Preview Player Column (Right) */}
        <div className="lg:col-span-5" id="sermon-player-panel">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2 mb-4">
            <Disc className="h-4 w-4 text-cci-gold-400 animate-spin" style={{ animationDuration: isPlaying ? '3s' : '0s' }} />
            Active Teaching Stream
          </h3>

          <div className="bg-[#0a1128]/60 border border-cci-blue-700/50 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-xl flex flex-col h-full justify-between min-h-[420px]">
            {/* Design background */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-cci-gold-500/5 rounded-full blur-2xl" />

            {currentTrack ? (
              <div className="flex-1 flex flex-col justify-between">
                {/* Vinyl/Spin Album Visual */}
                <div className="flex flex-col items-center text-center mt-4">
                  <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full overflow-hidden p-[3px] bg-gradient-to-tr from-cci-blue-800 to-cci-gold-500 shadow-2xl">
                    <div className="w-full h-full rounded-full bg-[#040814] overflow-hidden flex items-center justify-center p-1.5 relative">
                      <img
                        src={currentTrack.coverUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className={`w-full h-full rounded-full object-cover select-none ${isPlaying ? 'animate-spin duration-[15000ms] ease-linear' : ''}`}
                        style={{ animationDuration: '25s' }}
                      />
                      {/* Center spindle hole */}
                      <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-slate-950 border-4 border-cci-blue-900 shadow-inner flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-cci-gold-500" />
                      </div>
                    </div>
                  </div>

                  <h4 className="font-display font-bold text-base sm:text-lg text-white mt-6 line-clamp-1">
                    {currentTrack.title}
                  </h4>
                  <p className="text-xs text-cci-gold-400 font-mono mt-1 font-semibold uppercase">{currentTrack.series}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{currentTrack.preacher}</p>
                </div>

                {/* Progress bar and Scrubber */}
                <div className="mt-8">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1.5">
                    <span>{formatTime(currentTime)}</span>
                    <span>{duration ? formatTime(duration) : currentTrack.duration}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-cci-blue-800 focus:outline-none rounded-lg appearance-none cursor-pointer accent-cci-gold-500"
                    id="player-scrubber"
                  />
                </div>

                {/* Main Player controls */}
                <div className="flex items-center justify-center gap-6 mt-6">
                  {/* Play Button */}
                  <button
                    onClick={() => handlePlayPause(currentTrack)}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 hover:from-cci-gold-500 hover:to-cci-gold-300 text-[#040814] flex items-center justify-center shadow-lg shadow-cci-gold-600/10 hover:shadow-cci-gold-600/25 transition-all transform hover:scale-105"
                    id="player-play-btn"
                  >
                    {isPlaying ? (
                      <Pause className="h-7 w-7 text-[#040814] fill-current" />
                    ) : (
                      <Play className="h-7 w-7 text-[#040814] fill-current translate-x-0.5" />
                    )}
                  </button>
                </div>

                {/* Volume bar */}
                <div className="flex items-center gap-3 justify-center mt-6 pt-6 border-t border-cci-blue-800/40">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-slate-400 hover:text-white transition-colors"
                    id="player-mute-btn"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-24 h-1 bg-cci-blue-800 rounded-lg appearance-none cursor-pointer accent-cci-gold-500"
                    id="player-volume-slider"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Music className="h-10 w-10 text-slate-600 mb-2" />
                <p className="text-sm text-slate-400">Select a teaching from the list to load the stream.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Passcode Modal */}
      <AnimatePresence>
        {isAdminLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" id="teachings-admin-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#0a1128] border border-cci-blue-700/60 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8"
              id="admin-login-modal-container"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsAdminLoginModalOpen(false);
                  setPasscode('');
                  setPasscodeError('');
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 bg-black/35 rounded-full transition-colors cursor-pointer"
                id="btn-close-admin-login"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-cci-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-cci-gold-500/20 text-cci-gold-400">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">Administrator Access</h3>
                <p className="text-xs text-slate-400 mt-1">Unlock audio uploader permission controls</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5">Administrative Passcode</label>
                  <input
                    type="password"
                    placeholder="Enter passcode (Hint: 'admin')"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setPasscodeError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAuthAdmin();
                    }}
                    className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-2.5 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                    id="input-teachings-passcode"
                  />
                  {passcodeError && (
                    <p className="text-[10px] text-amber-500 font-mono mt-1.5">{passcodeError}</p>
                  )}
                </div>

                <button
                  onClick={handleAuthAdmin}
                  className="w-full py-3 bg-gradient-to-r from-cci-gold-600 to-cci-gold-500 hover:from-cci-gold-500 hover:to-cci-gold-400 text-[#040814] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                  id="btn-teachings-submit-auth"
                >
                  Verify Privileges
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Sermon Audio Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto" id="teachings-upload-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0a1128] border border-cci-blue-700/60 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 my-8"
              id="teachings-upload-container"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadedFileName('');
                  setAudioUrl('');
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 bg-black/35 rounded-full transition-colors z-10 cursor-pointer"
                id="btn-close-teachings-upload"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="flex items-center gap-2.5 pb-4 border-b border-cci-blue-800/60 mb-6">
                <FileAudio className="h-5 w-5 text-cci-gold-400" />
                <h3 className="font-display font-bold text-lg text-white">Publish Sermon Audio</h3>
              </div>

              <form onSubmit={handlePublishTeaching} className="space-y-4 text-left">
                {/* Title */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5">Sermon Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Pneumatika: The Spiritual Gifts Explained"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-2.5 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                    id="input-teachings-title"
                  />
                </div>

                {/* Series & Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5">Series Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Pneumatika Series"
                      value={series}
                      onChange={(e) => setSeries(e.target.value)}
                      className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-2.5 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                      id="input-teachings-series"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5">Duration *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 55m or 1h 12m"
                      value={durationForm}
                      onChange={(e) => setDurationForm(e.target.value)}
                      className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-2.5 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                      id="input-teachings-duration"
                    />
                  </div>
                </div>

                {/* Preacher */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5">Preacher *</label>
                  <input
                    type="text"
                    required
                    value={preacher}
                    onChange={(e) => setPreacher(e.target.value)}
                    className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none"
                    id="input-teachings-preacher"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5">Sermon Description</label>
                  <textarea
                    placeholder="Provide a brief summary of the apostolic teaching content..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-2.5 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                    id="input-teachings-description"
                  />
                </div>

                {/* Preset Cover Selector */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2">Select Series Cover Artwork</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'art-1', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop', label: 'Worship/Decibel' },
                      { id: 'art-2', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop', label: 'Liturgy/Cross' },
                      { id: 'art-3', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop', label: 'Bible Study' },
                      { id: 'art-4', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=400&auto=format&fit=crop', label: 'Abundant Grace' }
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPresetCover(preset.url)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer
                          ${selectedPresetCover === preset.url 
                            ? 'border-cci-gold-500 scale-95 shadow shadow-cci-gold-600/35' 
                            : 'border-cci-blue-800/80 hover:border-slate-500'
                          }`}
                        title={preset.label}
                      >
                        <img src={preset.url} alt="" className="w-full h-full object-cover rounded-lg" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drag-and-drop Audio File Uploader */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5">Audio Track Attachment *</label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) triggerFileProcess(file);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px]
                      ${isDragging 
                        ? 'border-cci-gold-500 bg-cci-gold-500/5' 
                        : audioUrl 
                          ? 'border-emerald-500/60 bg-emerald-950/10' 
                          : 'border-cci-blue-800 hover:border-cci-blue-600 bg-black/20'
                      }`}
                  >
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                      className="hidden"
                      id="file-teachings-audio-upload"
                    />
                    <label htmlFor="file-teachings-audio-upload" className="w-full h-full cursor-pointer flex flex-col items-center justify-center">
                      {isUploadingFile ? (
                        <div className="space-y-2 w-full px-4">
                          <div className="flex justify-between text-[10px] font-mono text-slate-400">
                            <span>Processing file...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-[#040814] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cci-gold-500 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      ) : audioUrl ? (
                        <div className="text-center">
                          <CheckCircle className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
                          <p className="text-[11px] font-semibold text-emerald-400 truncate max-w-[220px] mx-auto">{uploadedFileName || "Audio loaded successfully"}</p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">Size: {fileSize} (Object URL created)</p>
                          <span className="text-[9px] text-cci-gold-400 underline mt-1.5 block">Click to change track</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Download className="h-5 w-5 text-cci-gold-400 mx-auto mb-1.5" />
                          <p className="text-xs text-slate-300 font-semibold">Drag & Drop MP3 or Click to browse</p>
                          <p className="text-[10px] text-slate-500 mt-1">High quality sermon tracks up to 50MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isUploadingFile}
                  className={`w-full py-3 bg-gradient-to-r from-cci-gold-600 to-cci-gold-500 hover:from-cci-gold-500 hover:to-cci-gold-400 text-[#040814] font-display font-bold text-xs uppercase tracking-wider rounded-xl mt-4 shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer
                    ${isUploadingFile ? 'opacity-50 pointer-events-none' : ''}`}
                  id="btn-teachings-publish-sermon"
                >
                  <Plus className="h-4 w-4" />
                  <span>Publish Message To Portal</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
