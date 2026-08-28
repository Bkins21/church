import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { 
  Sparkles, Mic, Music, Play, Pause, Check, Copy, Download, Upload, 
  RefreshCw, FileText, AlertCircle, X, ChevronRight, BookOpen, 
  Radio, Disc, Sliders, Volume2, Clock, CheckCircle2, ArrowRight
} from 'lucide-react';
import { Song } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { parseSyncedLyrics, LyricLine, formatLyricTime } from '../utils/lyricsParser';

interface AiTranscriberModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSong: Song | null;
  allSongs: Song[];
  onApplyLyrics: (songId: string, syncedLyrics: string) => void;
  onPreviewSeek?: (seconds: number) => void;
}

export interface TranscribedData {
  syncedLyrics: string;
  plainLyrics: string;
  lines: Array<{
    time: string;
    seconds: number;
    text: string;
    section?: string;
  }>;
  spiritualTheme?: string;
  scriptures?: string[];
  musicalAnalysis?: {
    tempo?: string;
    keySignature?: string;
    vocalArrangement?: string;
    spiritualAtmosphere?: string;
  };
  sections?: Array<{
    name: string;
    startTime: string;
  }>;
}

export default function AiTranscriberModal({
  isOpen,
  onClose,
  selectedSong,
  allSongs,
  onApplyLyrics,
  onPreviewSeek
}: AiTranscriberModalProps) {
  const [activeSong, setActiveSong] = useState<Song | null>(selectedSong);
  const [isPreListening, setIsPreListening] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscribedData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'lrc' | 'insights'>('timeline');
  const [userFocusNotes, setUserFocusNotes] = useState('');
  const [copiedLrc, setCopiedLrc] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Custom Audio Upload State
  const [uploadedAudioBase64, setUploadedAudioBase64] = useState<string | null>(null);
  const [uploadedAudioName, setUploadedAudioName] = useState<string | null>(null);
  const [uploadedAudioMime, setUploadedAudioMime] = useState<string>('audio/mp3');
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);

  // Pre-listening Visualizer & Progress Stages
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const progressIntervalRef = useRef<any>(null);

  const stages = [
    { label: 'Audio Signal Isolation', desc: 'Connecting to worship audio stream & vocal frequencies...' },
    { label: 'AI Pre-Listening & Melody Scanning', desc: 'Listening to phrasing, lead vocals & choral harmonies...' },
    { label: 'Speech & Cadence Transcription', desc: 'Transcribing lyrics with precision millisecond timestamps...' },
    { label: 'Theological & LRC Harmonization', desc: 'Formatting synchronized lyrics sheet & scripture references...' }
  ];

  // Sync active song when modal opens or prop changes
  useEffect(() => {
    if (selectedSong) {
      setActiveSong(selectedSong);
      // Reset upload if song changed
      setUploadedAudioBase64(null);
      setUploadedAudioName(null);
      setUploadedAudioUrl(null);
      setTranscriptionResult(null);
      setErrorMsg(null);
      setAppliedSuccess(false);
    }
  }, [selectedSong, isOpen]);

  // Handle custom audio upload
  const handleAudioFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('audio') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg|webm)$/i)) {
      setErrorMsg('Please select a valid audio file (.mp3, .wav, .m4a, .webm).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Audio file is too large (max 25MB).');
      return;
    }

    setErrorMsg(null);
    setUploadedAudioName(file.name);
    setUploadedAudioMime(file.type || 'audio/mp3');
    setUploadedAudioUrl(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedAudioBase64(base64);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read uploaded audio file.');
    };
    reader.readAsDataURL(file);
  };

  // Start AI Pre-listening & Transcription Process
  const handleStartTranscribing = async () => {
    if (!activeSong && !uploadedAudioBase64) {
      setErrorMsg('Please select a song or upload an audio file first.');
      return;
    }

    setIsPreListening(true);
    setErrorMsg(null);
    setTranscriptionResult(null);
    setAppliedSuccess(false);
    setProgressPercent(5);
    setCurrentStageIndex(0);

    // Dynamic progress ticker simulation
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    let step = 5;
    progressIntervalRef.current = setInterval(() => {
      step += Math.random() * 8 + 3;
      if (step > 92) step = 92;
      setProgressPercent(Math.floor(step));

      if (step < 25) setCurrentStageIndex(0);
      else if (step < 55) setCurrentStageIndex(1);
      else if (step < 80) setCurrentStageIndex(2);
      else setCurrentStageIndex(3);
    }, 450);

    try {
      const payload: any = {
        songTitle: uploadedAudioName ? uploadedAudioName.replace(/\.[^/.]+$/, "") : (activeSong?.title || 'Worship Anthem'),
        artist: activeSong?.artist || 'Crossworship',
        album: activeSong?.album || 'Edifice Anthems',
        duration: activeSong?.duration || '4:30',
        focusNotes: userFocusNotes.trim() || undefined
      };

      if (uploadedAudioBase64) {
        payload.audioBase64 = uploadedAudioBase64;
        payload.audioMimeType = uploadedAudioMime;
      } else if (activeSong?.audioUrl) {
        payload.audioUrl = activeSong.audioUrl;
      }

      if (activeSong?.lyrics) {
        payload.existingLyrics = activeSong.lyrics;
      }

      const response = await fetch('/api/ai-transcribe-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete AI transcription.');
      }

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgressPercent(100);
      setCurrentStageIndex(3);

      setTimeout(() => {
        setTranscriptionResult(data.transcription);
        setIsPreListening(false);
      }, 600);
    } catch (err: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setIsPreListening(false);
      setErrorMsg(err.message || 'Error occurred during AI pre-listening. Please try again.');
    }
  };

  // Apply transcribed lyrics to current song
  const handleApplyToSong = () => {
    if (!transcriptionResult || !transcriptionResult.syncedLyrics) return;
    const targetSongId = activeSong?.id || (allSongs.length > 0 ? allSongs[0].id : 'cw-1');
    onApplyLyrics(targetSongId, transcriptionResult.syncedLyrics);
    setAppliedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Copy LRC content to clipboard
  const handleCopyLrc = () => {
    if (!transcriptionResult?.syncedLyrics) return;
    navigator.clipboard.writeText(transcriptionResult.syncedLyrics);
    setCopiedLrc(true);
    setTimeout(() => setCopiedLrc(false), 2000);
  };

  // Export .LRC file
  const handleExportLrcFile = () => {
    if (!transcriptionResult?.syncedLyrics) return;
    const blob = new Blob([transcriptionResult.syncedLyrics], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const songName = (activeSong?.title || 'worship-song').replace(/\s+/g, '_').toLowerCase();
    a.download = `${songName}_synced_lyrics.lrc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#180E07] border-2 border-[#A37F3B]/80 text-[#F7F5F0] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-[#25160B] border-b border-[#4A2D17] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#3A2312] border border-[#A37F3B] text-[#A37F3B] shadow-inner">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#3A2312] text-[#E5B869] border border-[#4A2D17]">
                  AI Audio Transcriber
                </span>
                <span className="text-[10px] font-mono text-[#8A7463] hidden sm:inline">
                  Gemini Acoustic & Lyrical Intelligence
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-bold font-display text-white mt-0.5">
                AI Pre-Listen & Synced Lyrics Transcriber
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1D1108] hover:bg-[#3A2312] text-[#8A7463] hover:text-white border border-[#4A2D17] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Song Selection & Audio Input Card */}
          <div className="bg-[#1D1108] border border-[#4A2D17] rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#A37F3B]">
                <Disc className="h-4 w-4" />
                <span>Target Worship Track</span>
              </div>

              {/* Upload custom track option */}
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-[#25160B] hover:bg-[#3A2312] border border-[#A37F3B]/60 text-[#E5B869] transition-all">
                <Upload className="h-3.5 w-3.5" />
                <span>{uploadedAudioName ? 'Change Audio File' : 'Upload Custom Audio (.mp3/.wav)'}</span>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.webm"
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadedAudioName ? (
              <div className="p-3 bg-[#25160B] border border-[#A37F3B] rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[#3A2312] text-[#A37F3B]">
                    <Music className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">Uploaded: {uploadedAudioName}</p>
                    <p className="text-[11px] text-[#A37F3B]">Ready for AI Pre-Listening & Vocal Isolation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedAudioBase64(null);
                    setUploadedAudioName(null);
                    setUploadedAudioUrl(null);
                  }}
                  className="text-xs text-rose-300 hover:text-white px-2 py-1 bg-rose-950/40 rounded border border-rose-800/50"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#8A7463] mb-1 uppercase font-semibold">
                    Select From Catalogue
                  </label>
                  <select
                    value={activeSong?.id || ''}
                    onChange={(e) => {
                      const found = allSongs.find(s => s.id === e.target.value);
                      if (found) {
                        setActiveSong(found);
                        setTranscriptionResult(null);
                      }
                    }}
                    className="w-full bg-[#25160B] border border-[#4A2D17] rounded-xl px-3 py-2.5 text-xs text-[#F7F5F0] focus:outline-none focus:border-[#A37F3B]"
                  >
                    {allSongs.map(song => (
                      <option key={song.id} value={song.id} className="bg-[#180E07]">
                        {song.title} — {song.artist} ({song.duration})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#8A7463] mb-1 uppercase font-semibold">
                    Spiritual Guidance / Focus Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={userFocusNotes}
                    onChange={(e) => setUserFocusNotes(e.target.value)}
                    placeholder="e.g. Include choir antiphons, note spontaneous prayers..."
                    className="w-full bg-[#25160B] border border-[#4A2D17] rounded-xl px-3 py-2.5 text-xs text-[#F7F5F0] placeholder-[#8A7463] focus:outline-none focus:border-[#A37F3B]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-2xl flex items-center gap-3 text-rose-200 text-xs font-mono">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* AI Pre-Listening Active Visualizer / Trigger Banner */}
          {!transcriptionResult && (
            <div className="bg-gradient-to-br from-[#25160B] to-[#1D1108] border border-[#A37F3B]/50 rounded-2xl p-6 text-center space-y-5">
              {isPreListening ? (
                <div className="space-y-5 py-4">
                  {/* Dynamic Graphic Equalizer Waves */}
                  <div className="flex items-center justify-center gap-1.5 h-16">
                    {[12, 28, 45, 60, 32, 55, 75, 40, 65, 85, 48, 70, 35, 58, 25, 42, 60, 20].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: [`${Math.max(10, h * 0.3)}px`, `${h}px`, `${Math.max(8, h * 0.4)}px`]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6 + (i % 4) * 0.15,
                          ease: "easeInOut"
                        }}
                        className="w-1.5 sm:w-2 bg-[#A37F3B] rounded-full shadow-[0_0_8px_#A37F3B]"
                      />
                    ))}
                  </div>

                  {/* Stage indicator */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Radio className="h-4 w-4 text-[#E5B869] animate-pulse" />
                      <span className="font-mono text-xs font-bold text-[#E5B869] uppercase tracking-wider">
                        {stages[currentStageIndex].label}
                      </span>
                    </div>
                    <p className="text-xs text-[#8A7463] font-mono">
                      {stages[currentStageIndex].desc}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="max-w-md mx-auto space-y-1.5">
                    <div className="w-full h-2 rounded-full bg-[#150B05] border border-[#4A2D17] overflow-hidden p-0.5">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#8F6D2F] to-[#E5B869] rounded-full"
                        style={{ width: `${progressPercent}%` }}
                        transition={{ ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-[#8A7463]">
                      <span>AI Neural Listening & Vocal Transcribing</span>
                      <span className="text-[#A37F3B] font-bold">{progressPercent}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#3A2312] border-2 border-[#A37F3B] flex items-center justify-center text-[#A37F3B] shadow-xl">
                    <Mic className="h-8 w-8" />
                  </div>
                  
                  <div className="space-y-1.5 max-w-lg mx-auto">
                    <h4 className="font-bold text-base sm:text-lg text-white">
                      Pre-Listen & Transcribe "{activeSong?.title || 'Selected Track'}"
                    </h4>
                    <p className="text-xs text-[#8A7463] leading-relaxed">
                      Gemini will analyze vocal intonations, rhythmic meter, and chordal phrasing to generate word-for-word synchronized lyrics complete with timestamps.
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleStartTranscribing}
                      className="px-6 py-3 rounded-2xl bg-[#A37F3B] hover:bg-[#8F6D2F] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Start AI Pre-Listening & Transcription</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transcription Results & Inspection View */}
          {transcriptionResult && (
            <div className="space-y-4">
              
              {/* Success summary pill */}
              <div className="p-3.5 bg-[#25160B] border border-[#A37F3B] rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-full bg-[#A37F3B] text-white">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white font-mono">
                      Transcription Completed Successfully
                    </h5>
                    <p className="text-[10px] text-[#A37F3B] font-mono">
                      {transcriptionResult.lines?.length || 0} timestamped lines extracted • Synchronized LRC Ready
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLrc}
                    className="px-3 py-1.5 rounded-xl bg-[#1D1108] hover:bg-[#3A2312] border border-[#4A2D17] text-xs font-mono text-[#F7F5F0] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedLrc ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-[#A37F3B]" />}
                    <span>{copiedLrc ? 'Copied!' : 'Copy LRC'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportLrcFile}
                    className="px-3 py-1.5 rounded-xl bg-[#1D1108] hover:bg-[#3A2312] border border-[#4A2D17] text-xs font-mono text-[#F7F5F0] transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Export as .lrc file"
                  >
                    <Download className="h-3.5 w-3.5 text-[#A37F3B]" />
                    <span>.LRC File</span>
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-[#4A2D17] pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'timeline'
                      ? 'bg-[#A37F3B] text-white border border-[#A37F3B]'
                      : 'bg-[#1D1108] text-[#8A7463] hover:text-[#F7F5F0] border border-[#4A2D17]'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Timed Lines ({transcriptionResult.lines?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('lrc')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'lrc'
                      ? 'bg-[#A37F3B] text-white border border-[#A37F3B]'
                      : 'bg-[#1D1108] text-[#8A7463] hover:text-[#F7F5F0] border border-[#4A2D17]'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>LRC Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('insights')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'insights'
                      ? 'bg-[#A37F3B] text-white border border-[#A37F3B]'
                      : 'bg-[#1D1108] text-[#8A7463] hover:text-[#F7F5F0] border border-[#4A2D17]'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Spiritual & Musical Insights</span>
                </button>
              </div>

              {/* Tab 1: Timed Lines List */}
              {activeTab === 'timeline' && (
                <div className="bg-[#1D1108] border border-[#4A2D17] rounded-2xl p-3 max-h-72 overflow-y-auto space-y-1.5">
                  {transcriptionResult.lines && transcriptionResult.lines.length > 0 ? (
                    transcriptionResult.lines.map((line, idx) => (
                      <div
                        key={`transcribed-line-${idx}`}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#25160B] hover:bg-[#3A2312] border border-[#4A2D17]/80 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="px-2 py-0.5 rounded-md bg-[#180E07] text-[#A37F3B] border border-[#4A2D17] text-[10px] font-mono font-bold shrink-0">
                            {line.time || `00:${String(line.seconds || 0).padStart(2, '0')}`}
                          </span>

                          {line.section && (
                            <span className="px-1.5 py-0.5 rounded bg-[#3A2312] text-[#E5B869] text-[9px] font-mono uppercase font-bold shrink-0 hidden sm:inline">
                              {line.section}
                            </span>
                          )}

                          <p className="text-xs text-white truncate font-medium group-hover:text-[#FFF8E7]">
                            {line.text}
                          </p>
                        </div>

                        {onPreviewSeek && (
                          <button
                            type="button"
                            onClick={() => onPreviewSeek(line.seconds || 0)}
                            className="p-1 rounded-lg hover:bg-[#A37F3B] text-[#8A7463] hover:text-white transition-colors cursor-pointer shrink-0"
                            title="Seek playback to this timestamp"
                          >
                            <Play className="h-3 w-3 fill-current" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-[#8A7463]">
                      No individual lines separated. Check the LRC tab for complete lyric text.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Raw LRC Sheet */}
              {activeTab === 'lrc' && (
                <div className="space-y-2">
                  <textarea
                    readOnly
                    value={transcriptionResult.syncedLyrics}
                    rows={10}
                    className="w-full bg-[#150B05] border border-[#4A2D17] rounded-2xl p-4 text-xs font-mono text-[#E5B869] focus:outline-none select-all"
                  />
                  <p className="text-[10px] font-mono text-[#8A7463] text-right">
                    Standard LRC Format [mm:ss] compatible with worship displays & synced lyric engines.
                  </p>
                </div>
              )}

              {/* Tab 3: Spiritual & Musical Insights */}
              {activeTab === 'insights' && (
                <div className="bg-[#1D1108] border border-[#4A2D17] rounded-2xl p-4 space-y-4">
                  {transcriptionResult.spiritualTheme && (
                    <div className="space-y-1">
                      <h6 className="text-[11px] font-mono uppercase font-bold text-[#A37F3B]">
                        Theological Message & Spiritual Theme
                      </h6>
                      <p className="text-xs text-[#F7F5F0] leading-relaxed">
                        {transcriptionResult.spiritualTheme}
                      </p>
                    </div>
                  )}

                  {transcriptionResult.scriptures && transcriptionResult.scriptures.length > 0 && (
                    <div className="space-y-1.5">
                      <h6 className="text-[11px] font-mono uppercase font-bold text-[#A37F3B]">
                        Key Scripture Foundations Identified
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {transcriptionResult.scriptures.map((scrip, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 rounded-lg bg-[#25160B] border border-[#4A2D17] text-xs font-mono text-[#E5B869]"
                          >
                            📖 {scrip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {transcriptionResult.musicalAnalysis && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#4A2D17]">
                      {transcriptionResult.musicalAnalysis.tempo && (
                        <div className="p-2.5 bg-[#25160B] rounded-xl border border-[#4A2D17]">
                          <span className="text-[10px] font-mono text-[#8A7463] block uppercase">Tempo & Meter</span>
                          <span className="text-xs font-semibold text-white">{transcriptionResult.musicalAnalysis.tempo}</span>
                        </div>
                      )}
                      {transcriptionResult.musicalAnalysis.keySignature && (
                        <div className="p-2.5 bg-[#25160B] rounded-xl border border-[#4A2D17]">
                          <span className="text-[10px] font-mono text-[#8A7463] block uppercase">Tonal Key</span>
                          <span className="text-xs font-semibold text-white">{transcriptionResult.musicalAnalysis.keySignature}</span>
                        </div>
                      )}
                      {transcriptionResult.musicalAnalysis.vocalArrangement && (
                        <div className="p-2.5 bg-[#25160B] rounded-xl border border-[#4A2D17] sm:col-span-2">
                          <span className="text-[10px] font-mono text-[#8A7463] block uppercase">Vocal & Choral Arrangement</span>
                          <span className="text-xs font-semibold text-white">{transcriptionResult.musicalAnalysis.vocalArrangement}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-6 bg-[#25160B] border-t border-[#4A2D17] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {transcriptionResult && (
              <button
                type="button"
                onClick={handleStartTranscribing}
                className="px-4 py-2 rounded-xl bg-[#1D1108] hover:bg-[#3A2312] border border-[#4A2D17] text-xs font-mono text-[#8A7463] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Re-Transcribe</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1D1108] hover:bg-[#3A2312] text-xs font-mono text-[#8A7463] hover:text-white border border-[#4A2D17] transition-colors cursor-pointer"
            >
              Close
            </button>

            {transcriptionResult && (
              <button
                type="button"
                onClick={handleApplyToSong}
                disabled={appliedSuccess}
                className="px-5 py-2 rounded-xl bg-[#A37F3B] hover:bg-[#8F6D2F] text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {appliedSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-white" />
                    <span>Applied & Synced!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Apply to Song & Sync Live</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
