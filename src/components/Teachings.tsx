import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { Search, Play, Pause, Download, Volume2, Music, Clock, User, Disc, Check, Flame, ChevronRight, VolumeX, ShieldAlert, ShieldCheck, Lock, Unlock, Plus, FileAudio, X, Key, CheckCircle, Trash2, Loader2, Repeat, Repeat1, RotateCcw, RotateCw, Calendar } from 'lucide-react';
import { Teaching } from '../types';
import { teachingsCatalog } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';

// Helper function to format detected duration: M:S for <1 hr, H:M:S for >=1 hr
export function formatDetectedDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return '0:00';
  }
  const secs = Math.round(totalSeconds);
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const remainingSeconds = secs % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper to extract duration from audio file metadata
export function getAudioDurationFromFile(file: File): Promise<number> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      audio.src = objectUrl;

      const cleanUp = () => {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {}
        audio.removeEventListener('loadedmetadata', onLoaded);
        audio.removeEventListener('error', onError);
      };

      const onLoaded = () => {
        const dur = audio.duration;
        cleanUp();
        if (Number.isFinite(dur) && dur > 0) {
          resolve(dur);
        } else {
          resolve(0);
        }
      };

      const onError = () => {
        cleanUp();
        resolve(0);
      };

      audio.addEventListener('loadedmetadata', onLoaded);
      audio.addEventListener('error', onError);

      setTimeout(() => {
        cleanUp();
        resolve(0);
      }, 4000);
    } catch {
      resolve(0);
    }
  });
}

// Helper for conditional date display based on teaching category
export function formatTeachingDate(dateStr?: string, category?: string): string {
  if (!dateStr) return '';
  const cat = (category || '').toLowerCase();
  const isYearOnly = cat.includes('edifice') || cat.includes('reaching our world') || cat.includes('campmeeting');

  if (isYearOnly) {
    const yearMatch = dateStr.match(/\b(19\d\d|20\d\d)\b/);
    if (yearMatch) return yearMatch[1];
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed.getFullYear().toString();
    return dateStr;
  }

  // Sunday Sermon or standard date -> DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr.trim())) {
    return dateStr.trim();
  }
  const isoMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, '0');
    const day = isoMatch[3].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

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
  const [cloudTeachings, setCloudTeachings] = useState<Teaching[]>([]);
  
  // Supabase cloudTeachings is the authoritative source of truth, fallback to prop/static catalog if empty
  const catalog = cloudTeachings.length > 0 
    ? cloudTeachings 
    : (teachingsList && teachingsList.length > 0 ? teachingsList : teachingsCatalog);

  // Fetch teachings directly from Supabase teachings table
  const fetchCloudTeachings = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('teachings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch failure from teachings table:', error);
        return;
      }

      if (data) {
        const mapped: Teaching[] = data.map((t: any) => ({
          id: t.id,
          title: t.title || '',
          series: t.category === 'R.O.W.C' ? 'Reaching Our World Campmeeting' : (t.category || t.series || 'Sunday Sermon'),
          preacher: t.speaker || t.preacher || 'Pastor Abiodun Adebayo',
          date: t.date || '',
          duration: t.duration || '45:00',
          description: t.description || 'No description provided.',
          audioUrl: t.audio_url || t.audioUrl || '',
          coverUrl: t.cover_url || t.coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop',
          downloadCount: t.download_count || t.downloadCount || 0,
          size: t.size || '18.5 MB'
        }));
        setCloudTeachings(mapped);
      }
    } catch (err) {
      console.error('Supabase fetch failure from teachings table:', err);
    }
  };

  useEffect(() => {
    fetchCloudTeachings();

    const handleUpdate = () => {
      fetchCloudTeachings();
    };

    window.addEventListener('gec_teachings_updated', handleUpdate);
    return () => {
      window.removeEventListener('gec_teachings_updated', handleUpdate);
    };
  }, []);

  // Audio Player States
  const [currentTrack, setCurrentTrack] = useState<Teaching | null>(() => catalog[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  // Ensure current track is populated when catalog loads
  useEffect(() => {
    if (!currentTrack && catalog.length > 0) {
      setCurrentTrack(catalog[0]);
    }
  }, [catalog, currentTrack]);
  
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
  const [series, setSeries] = useState('Edifice Conference');
  const [preacher, setPreacher] = useState('Pastor Abiodun Adebayo');
  const [description, setDescription] = useState('');
  const [teachingYear, setTeachingYear] = useState('2026');
  const [teachingDate, setTeachingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [detectedDuration, setDetectedDuration] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState('');
  const [uploadedStoragePath, setUploadedStoragePath] = useState('');
  const [selectedPresetCover, setSelectedPresetCover] = useState('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop');
  const [fileSize, setFileSize] = useState('18.5 MB');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const triggerFileProcess = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('Audio file must be 50MB or smaller.');
      return;
    }

    setIsUploadingFile(true);
    setUploadProgress(10);
    setUploadedFileName(file.name);

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMB} MB`);

    // Auto-detect duration from audio metadata
    try {
      const durSecs = await getAudioDurationFromFile(file);
      if (durSecs > 0) {
        const formatted = formatDetectedDuration(durSecs);
        setDetectedDuration(formatted);
      } else {
        setDetectedDuration('45:00');
      }
    } catch {
      setDetectedDuration('45:00');
    }

    try {
      if (!supabase) {
        throw new Error('Supabase is not configured.');
      }

      // Create a unique filename
      const fileExtension = file.name.split('.').pop() || 'mp3';
      const safeFileName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .toLowerCase();

      const fileName = `${Date.now()}-${safeFileName}.${fileExtension}`;
      const filePath = `teachings/${fileName}`;

      setUploadProgress(25);

      // Upload to Supabase Storage in Teachings bucket
      const { error: uploadError } = await supabase.storage
        .from('Teachings')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'audio/mpeg'
        });

      if (uploadError) {
        console.error('Storage upload failure to Teachings bucket:', uploadError);
        throw uploadError;
      }

      setUploadProgress(75);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('Teachings')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        console.error('Public URL failure for Teachings storage file:', filePath);
        throw new Error('Could not generate public audio URL.');
      }

      setAudioUrl(publicUrlData.publicUrl);
      setUploadedStoragePath(filePath);
      setUploadProgress(100);

      console.log('Audio uploaded successfully to Teachings bucket:', publicUrlData.publicUrl);
    } catch (error: any) {
      console.error('Audio storage upload failed:', error);
      alert(`Audio upload failed: ${error.message}`);

      setAudioUrl('');
      setUploadedStoragePath('');
      setUploadedFileName('');
      setUploadProgress(0);
    } finally {
      setIsUploadingFile(false);
    }
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

  const handlePublishTeaching = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !series.trim()) {
      alert('Please fill out the Title and Series fields.');
      return;
    }

    if (!audioUrl.trim()) {
      alert('Please upload an audio file before publishing.');
      return;
    }

    if (!supabase) {
      alert('Supabase is not configured.');
      return;
    }

    const finalAudioUrl = audioUrl.trim();

    // Conditional date format based on teaching category
    const isYearOnly = series === 'Edifice Conference' || series === 'Reaching Our World Campmeeting';
    let finalDate = '';
    if (isYearOnly) {
      finalDate = teachingYear.trim() || '2026';
    } else {
      finalDate = formatTeachingDate(teachingDate, 'Sunday Sermon');
    }

    const finalDuration = detectedDuration || '45:00';

    try {
      // Insert teaching into Supabase teachings table
      const { data: insertedTeaching, error: insertError } =
        await supabase
          .from('teachings')
          .insert([{
            title: title.trim(),
            speaker: preacher.trim(),
            category: series.trim(),
            duration: finalDuration,
            date: finalDate,
            audio_url: finalAudioUrl,
            cover_url: selectedPresetCover,
            description:
              description.trim() || 'No description provided.'
          }])
          .select()
          .single();

      if (insertError) {
        console.error('Database insert failure into teachings table:', insertError);

        // Remove newly uploaded Storage file so we do not create an orphaned file
        if (uploadedStoragePath) {
          const { error: storageDelErr } = await supabase.storage
            .from('Teachings')
            .remove([uploadedStoragePath]);
          if (storageDelErr) {
            console.error('Storage cleanup failure after insert error:', storageDelErr);
          }
        }

        alert(`Database insert failed: ${insertError.message}`);
        return;
      }

      const newTeaching: Teaching = {
        id: insertedTeaching.id,
        title: insertedTeaching.title,
        series: insertedTeaching.category === 'R.O.W.C' ? 'Reaching Our World Campmeeting' : (insertedTeaching.category || ''),
        preacher: insertedTeaching.speaker || '',
        date: insertedTeaching.date || '',
        duration: insertedTeaching.duration || '',
        description: insertedTeaching.description || '',
        audioUrl: insertedTeaching.audio_url || '',
        coverUrl: insertedTeaching.cover_url || '',
        downloadCount: insertedTeaching.download_count || 0,
        size: insertedTeaching.size || fileSize
      };

      if (onAddTeaching) {
        onAddTeaching(newTeaching);
      }

      // Re-fetch cloud teachings from database immediately
      await fetchCloudTeachings();
      window.dispatchEvent(new Event('gec_teachings_updated'));

      // Reset form and close
      setTitle('');
      setSeries('Edifice Conference');
      setDescription('');
      setDetectedDuration('');
      setTeachingYear('2026');
      setTeachingDate(new Date().toISOString().split('T')[0]);
      setAudioUrl('');
      setUploadedStoragePath('');
      setUploadedFileName('');
      setIsUploadModalOpen(false);

      alert(`Sermon "${newTeaching.title}" published successfully!`);
    } catch (err: any) {
      console.error('Teaching publish error:', err);
      alert(`Publishing failed: ${err?.message || err}`);
    }
  };

  // Delete a single teaching and its associated storage file
  const handleDeleteSingleTeaching = async (teachingId: string, teachingAudioUrl?: string, teachingTitle?: string) => {
    if (!window.confirm(`Are you sure you want to delete "${teachingTitle || 'this teaching'}"?`)) {
      return;
    }

    if (!supabase) {
      alert('Supabase is not configured.');
      return;
    }

    try {
      // 1. Delete database row
      const { error: dbDeleteError } = await supabase
        .from('teachings')
        .delete()
        .eq('id', teachingId);

      if (dbDeleteError) {
        console.error('Database delete failure from teachings table:', dbDeleteError);
        alert(`Failed to delete teaching from database: ${dbDeleteError.message}`);
        return;
      }

      // 2. Delete associated storage file if in Teachings bucket
      if (teachingAudioUrl) {
        let filePath = '';
        const marker = '/storage/v1/object/public/Teachings/';
        if (teachingAudioUrl.includes(marker)) {
          filePath = teachingAudioUrl.split(marker)[1];
        } else if (teachingAudioUrl.includes('/Teachings/')) {
          const parts = teachingAudioUrl.split('/Teachings/');
          filePath = parts[1];
        }

        if (filePath) {
          filePath = filePath.split('?')[0];
          const { error: storageDeleteError } = await supabase.storage
            .from('Teachings')
            .remove([filePath]);

          if (storageDeleteError) {
            console.error('Storage delete failure from Teachings bucket:', storageDeleteError);
          }
        }
      }

      if (onDeleteTeaching) {
        onDeleteTeaching(teachingId);
      }

      // 3. Refresh teachings from Supabase
      await fetchCloudTeachings();
      window.dispatchEvent(new Event('gec_teachings_updated'));
    } catch (err: any) {
      console.error('Delete teaching failed:', err);
      alert(`Error deleting teaching: ${err?.message || err}`);
    }
  };

  // Delete all teachings and their associated storage files
  const handleDeleteAllTeachings = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete ALL sermon teachings and their audio files? This cannot be undone.')) {
      return;
    }

    if (!supabase) {
      alert('Supabase is not configured.');
      return;
    }

    try {
      // 1. Get all teaching records
      const { data: allRecords, error: fetchErr } = await supabase
        .from('teachings')
        .select('id, audio_url');

      if (fetchErr) {
        console.error('Supabase fetch failure before deleting all teachings:', fetchErr);
        alert(`Failed to fetch teachings list: ${fetchErr.message}`);
        return;
      }

      // 2. Delete storage files
      if (allRecords && allRecords.length > 0) {
        const filePathsToDelete: string[] = [];
        const marker = '/storage/v1/object/public/Teachings/';

        for (const rec of allRecords) {
          if (rec.audio_url) {
            if (rec.audio_url.includes(marker)) {
              const path = rec.audio_url.split(marker)[1]?.split('?')[0];
              if (path) filePathsToDelete.push(path);
            } else if (rec.audio_url.includes('/Teachings/')) {
              const path = rec.audio_url.split('/Teachings/')[1]?.split('?')[0];
              if (path) filePathsToDelete.push(path);
            }
          }
        }

        if (filePathsToDelete.length > 0) {
          const { error: storageDeleteError } = await supabase.storage
            .from('Teachings')
            .remove(filePathsToDelete);

          if (storageDeleteError) {
            console.error('Storage delete failure for all teachings:', storageDeleteError);
          }
        }

        // 3. Delete all database rows
        const idsToDelete = allRecords.map(r => r.id);
        const { error: dbDeleteError } = await supabase
          .from('teachings')
          .delete()
          .in('id', idsToDelete);

        if (dbDeleteError) {
          console.error('Database delete failure for all teachings:', dbDeleteError);
          alert(`Failed to delete teachings rows from database: ${dbDeleteError.message}`);
          return;
        }
      }

      // 4. Refresh teachings from Supabase
      await fetchCloudTeachings();
      window.dispatchEvent(new Event('gec_teachings_updated'));

      alert('All sermon teachings have been successfully deleted.');
    } catch (err: any) {
      console.error('Delete all teachings failed:', err);
      alert(`Failed to delete all teachings: ${err?.message || err}`);
    }
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter series names
  const seriesCategories: string[] = ['all', ...Array.from(new Set<string>(catalog.map(t => t.series || 'Sermon')))];

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
      if (isRepeating && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeating]);

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

  // Download handler
  const triggerDownload = async (teaching: Teaching) => {
    if (isDownloading[teaching.id]) return;

    setIsDownloading(prev => ({ ...prev, [teaching.id]: true }));
    if (onDownloadSuccess) onDownloadSuccess(teaching);

    try {
      const song = {
        ...teaching,
        audio_url: (teaching as any).audio_url || teaching.audioUrl || ""
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
          throw new Error("Audio URL is not available");
        }
        try {
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
        } catch {
          window.open(song.audio_url, '_blank');
        }
      }
    } catch (error: any) {
      console.warn("Download fallback initiated:", error);
    } finally {
      setIsDownloading(prev => ({ ...prev, [teaching.id]: false }));
    }
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
    <div className="w-full max-w-full overflow-x-hidden bg-[#12100E] text-[#F9F6F0] transition-colors duration-300" id="teachings-view">
      {/* Themed Page Header: Imperial Espresso & Radiant Topaz Gold */}
      <div className="w-full max-w-full overflow-x-hidden bg-gradient-to-b from-[#161412] via-[#1A1714] to-[#12100E] text-[#F9F6F0] py-16 sm:py-20 border-b border-[#332C24] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#E8A238]/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
         
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-[#F9F6F0]">
          Sunday Teachings and Special Sermons
          </h1>
          <div className="w-20 h-1 bg-[#E8A238] mx-auto rounded-full shadow-sm shadow-[#E8A238]/50" />
          <p className="text-sm sm:text-base text-[#A89E92] leading-relaxed max-w-2xl mx-auto">
            Listen to and download teachings for your edification
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full max-w-full overflow-x-hidden">
        {/* Admin Quick Action Bar */}
        {isAdmin && (
          <div className="max-w-3xl mx-auto mb-10 flex items-center justify-center gap-3" id="teachings-admin-bar">
            <div className="flex items-center gap-2 bg-[#1A1714] border border-[#E8A238]/40 rounded-full py-1.5 px-4 animate-fade-in shadow-lg">
              <ShieldCheck className="h-4 w-4 text-[#E8A238] animate-pulse" />
              <span className="text-xs font-mono font-bold text-[#E8A238] uppercase tracking-wider">Admin Status: Authorized</span>
              <span className="text-[#555555]">|</span>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="text-xs font-bold text-[#E8A238] hover:text-[#fca311] flex items-center gap-1 transition-colors cursor-pointer"
                id="btn-teachings-open-upload"
              >
                <Plus className="h-3.5 w-3.5" />
                Upload Sermon Audio
              </button>
              {cloudTeachings.length > 0 && (
                <>
                  <span className="text-[#555555]">|</span>
                  <button
                    onClick={handleDeleteAllTeachings}
                    className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
                    id="btn-teachings-delete-all"
                    title="Delete all teachings and storage files"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete All
                  </button>
                </>
              )}
              <span className="text-[#555555]">|</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 w-full max-w-full">
          
          {/* Search */}
          <div className="lg:col-span-4 min-w-0">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#fca311]" />
              <input
                type="text"
                placeholder="Search by topic, keyword, or series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111111] border border-[#262626] focus:border-[#fca311] focus:ring-1 focus:ring-[#fca311] rounded-xl py-3 pl-12 pr-4 text-sm text-[#E5E5E5] placeholder-[#737373] focus:outline-none transition-all shadow-inner"
                id="teaching-search"
              />
            </div>
          </div>

          {/* Series Filter */}
          <div className="lg:col-span-8 min-w-0 overflow-x-auto flex gap-2 pb-2 scrollbar-none items-center">
            <span className="text-xs uppercase font-mono text-[#737373] shrink-0 mr-2">Series:</span>
            {seriesCategories.map((seriesCat) => {
              const displayLabel = seriesCat === 'all' ? 'All Messages' : (seriesCat === 'R.O.W.C' ? 'Reaching Our World Campmeeting' : seriesCat);
              return (
                <button
                  key={seriesCat}
                  onClick={() => setSelectedSeries(seriesCat)}
                  className={`px-3.5 py-2 rounded-lg font-display text-xs font-semibold whitespace-nowrap transition-all cursor-pointer
                    ${selectedSeries === seriesCat
                      ? 'bg-[#fca311] text-[#000000] font-bold shadow-md shadow-[#fca311]/25'
                      : 'bg-[#111111] border border-[#222222] hover:border-[#fca311]/60 text-[#E5E5E5]/80 hover:text-[#fca311]'
                    }`}
                  id={`filter-series-${seriesCat.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Catalog / Player Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 w-full max-w-full">
          
          {/* Catalog List (Left) */}
          <div className="lg:col-span-7 min-w-0 space-y-4 w-full max-w-full" id="teachings-catalog-list">
            <h3 className="font-display font-bold text-base text-[#E5E5E5] flex items-center gap-2 mb-4">
              <Flame className="h-4 w-4 text-[#fca311]" />
              <span>Sermon Teachings Catalog</span>
            </h3>

            {filteredTeachings.length > 0 ? (
              filteredTeachings.map((teaching, index) => {
                const isDownloaded = userDownloads.some(dl => dl.id === teaching.id);
                const progress = downloadProgress[teaching.id] || 0;
                const downloading = isDownloading[teaching.id];
                const isCurrent = currentTrack?.id === teaching.id;

                return (
                  <motion.div
                    key={teaching.id || index}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full max-w-full overflow-hidden
                      ${isCurrent 
                        ? 'bg-gradient-to-r from-[#1c1405] via-[#121212] to-[#0a0a0a] border-[#fca311]/60 shadow-lg shadow-[#fca311]/10' 
                        : 'bg-[#0d0d0d] border-[#1f1f1f] hover:border-[#fca311]/40'
                      }`}
                    id={`teaching-item-${teaching.id}`}
                  >
                    <div className="flex gap-4 items-center w-full sm:w-auto min-w-0">
                      {/* Cover Thumbnail */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#000000] flex items-center justify-center border border-[#262626]">
                        <img
                          src={teaching.coverUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover transition-transform ${isCurrent && isPlaying ? 'scale-105 duration-[3000ms] ease-linear rotate-12' : ''}`}
                        />
                        
                        {/* Play overlay */}
                        <button
                          onClick={() => handlePlayPause(teaching)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center hover:bg-black/40 transition-colors cursor-pointer"
                          id={`btn-play-sermon-${teaching.id}`}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="h-6 w-6 text-[#fca311] fill-[#fca311]" />
                          ) : (
                            <Play className="h-6 w-6 text-[#fca311] fill-[#fca311]" />
                          )}
                        </button>
                      </div>

                      {/* Metadata */}
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-[#fca311] font-mono font-semibold uppercase truncate">
                          {teaching.series === 'R.O.W.C' ? 'Reaching Our World Campmeeting' : teaching.series}
                        </p>
                        <h4 className="font-display font-bold text-sm sm:text-base text-[#E5E5E5] hover:text-[#fca311] transition-colors truncate mt-0.5">
                          {teaching.title}
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-[#A3A3A3] font-sans mt-1">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 shrink-0 text-[#737373]" />
                            {teaching.preacher}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0 text-[#737373]" />
                            {teaching.duration}
                          </span>
                          {teaching.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 shrink-0 text-[#737373]" />
                              {formatTeachingDate(teaching.date, teaching.series)}
                            </span>
                          )}
                          <span className="text-[#737373] font-mono text-[9px]">{teaching.size}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-[#1f1f1f] pt-3 sm:pt-0 gap-2">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => triggerDownload(teaching)}
                          disabled={downloading}
                          className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 w-full sm:w-auto justify-center cursor-pointer
                            ${isDownloaded 
                              ? 'bg-[#fca311]/15 text-[#fca311] border border-[#fca311]/40 font-bold' 
                              : downloading 
                                ? 'bg-[#141414] text-[#737373] border border-[#262626] pointer-events-none' 
                                : 'bg-[#141414] border border-[#fca311]/30 hover:border-[#fca311] hover:bg-[#fca311] text-[#fca311] hover:text-[#000000]'
                            }`}
                          id={`btn-download-sermon-${teaching.id}`}
                        >
                          {isDownloaded ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#fca311]" />
                              <span>Saved</span>
                            </>
                          ) : downloading ? (
                            <span className="flex items-center gap-1 font-mono text-[10px]">
                              Downloading {progress}%
                            </span>
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5 text-current" />
                              <span>Get Audio</span>
                            </>
                          )}
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteSingleTeaching(teaching.id, teaching.audioUrl, teaching.title)}
                            className="p-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                            title="Delete Sermon"
                            id={`btn-delete-sermon-${teaching.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-[#0d0d0d] border border-[#222222] rounded-2xl">
                <p className="text-sm text-[#737373]">No sermons found matching your search parameters.</p>
              </div>
            )}
          </div>

          {/* Media Preview Player Column (Right) */}
          <aside className="lg:col-span-5 min-w-0 w-full max-w-full" id="sermon-player-panel">
            <div className="lg:sticky lg:top-24 bg-[#161412] border border-[#332C24] rounded-3xl p-4 sm:p-7 w-full max-w-full overflow-hidden shadow-2xl relative">
              {currentTrack ? (
                <>
                  {/* ARTWORK */}
                  <div className="aspect-square max-w-[260px] sm:max-w-sm mx-auto rounded-2xl overflow-hidden border border-[#332C24] bg-[#0c0a09] shadow-lg">
                    <img
                      src={
                        currentTrack.coverUrl ||
                        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop'
                      }
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* INFO */}
                  <div className="text-center mt-5 sm:mt-6 px-2 min-w-0">
                    <h2 className="text-lg sm:text-2xl font-cinzel font-bold text-white truncate">
                      {currentTrack.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#fca311] mt-1 truncate font-semibold">
                      {currentTrack.series === 'R.O.W.C' ? 'Reaching Our World Campmeeting' : currentTrack.series}
                    </p>
                    <p className="text-[11px] sm:text-xs text-[#A3A3A3] mt-1 truncate">
                      {currentTrack.preacher}
                    </p>
                  </div>

                  {/* PROGRESS */}
                  <div className="mt-5 sm:mt-6 w-full">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={Math.min(currentTime, duration || 100)}
                      onChange={handleSeek}
                      className="w-full max-w-full accent-[#fca311] cursor-pointer"
                      id="player-scrubber"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-[#8A7463] mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{duration ? formatTime(duration) : currentTrack.duration}</span>
                    </div>
                  </div>

                  {/* CONTROLS */}
                  <div className="flex items-center justify-center gap-4 sm:gap-5 mt-4 sm:mt-5">
                    <button
                      type="button"
                      onClick={() => {
                        if (audioRef.current) {
                          const nextTime = Math.max(0, audioRef.current.currentTime - 10);
                          audioRef.current.currentTime = nextTime;
                          setCurrentTime(nextTime);
                        }
                      }}
                      className="p-2.5 rounded-full hover:bg-[#251F19] text-white transition-colors"
                      title="Rewind 10 seconds"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlayPause(currentTrack)}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#fca311] hover:bg-[#e5920a] text-black flex items-center justify-center shadow-lg transition-all hover:scale-105"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      id="player-play-btn"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-black" />
                      ) : (
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-black ml-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (audioRef.current) {
                          const nextTime = Math.min(duration || 99999, audioRef.current.currentTime + 10);
                          audioRef.current.currentTime = nextTime;
                          setCurrentTime(nextTime);
                        }
                      }}
                      className="p-2.5 rounded-full hover:bg-[#251F19] text-white transition-colors"
                      title="Forward 10 seconds"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRepeating(!isRepeating)}
                      className={`p-2.5 rounded-full transition-colors ${
                        isRepeating ? 'bg-[#fca311] text-black' : 'hover:bg-[#251F19] text-[#8A7463] hover:text-[#fca311]'
                      }`}
                      title={isRepeating ? 'Repeat: ON' : 'Repeat: OFF'}
                    >
                      {isRepeating ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* VOLUME */}
                  <div className="flex items-center gap-3 mt-5 sm:mt-6 w-full">
                    <button
                      type="button"
                      onClick={() => setIsMuted((prev) => !prev)}
                      className="text-[#fca311] hover:text-white shrink-0"
                      title={isMuted ? 'Unmute' : 'Mute'}
                      id="player-mute-btn"
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
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        setIsMuted(false);
                      }}
                      className="flex-1 max-w-full accent-[#fca311]"
                      aria-label="Volume"
                      id="player-volume-slider"
                    />
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-5 sm:mt-6 w-full">
                    <button
                      type="button"
                      onClick={() => triggerDownload(currentTrack)}
                      disabled={isDownloading[currentTrack.id]}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#fca311] hover:bg-[#e5920a] text-black text-xs font-bold transition-colors disabled:opacity-50"
                      id="btn-player-download-teaching"
                    >
                      {isDownloading[currentTrack.id] ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Downloading {downloadProgress[currentTrack.id] || 0}%</span>
                        </>
                      ) : userDownloads.some((dl) => dl.id === currentTrack.id) ? (
                        <>
                          <Check className="w-4 h-4 text-black" />
                          <span>Saved to Library</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download Sermon Audio</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1F1B16] border border-[#332C24] mx-auto flex items-center justify-center mb-4 sm:mb-5">
                    <Music className="w-7 h-7 sm:w-8 sm:h-8 text-[#fca311]" />
                  </div>

                  <h2 className="font-cinzel font-bold text-white text-base sm:text-lg">
                    Select a Sermon
                  </h2>

                  <p className="text-xs text-[#8A7463] mt-2 max-w-xs mx-auto">
                    Choose a teaching from the catalogue to stream it here.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Admin Passcode Modal */}
        <AnimatePresence>
          {isAdminLoginModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" id="teachings-admin-modal-overlay">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-sm bg-[#0d0d0d] border border-[#262626] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8"
                id="admin-login-modal-container"
              >
                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsAdminLoginModalOpen(false);
                    setPasscode('');
                    setPasscodeError('');
                  }}
                  className="absolute top-5 right-5 text-[#737373] hover:text-[#E5E5E5] p-1.5 bg-black/50 rounded-full transition-colors cursor-pointer"
                  id="btn-close-admin-login"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-[#fca311]/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-[#fca311]/30 text-[#fca311]">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#E5E5E5]">Administrator Access</h3>
                  <p className="text-xs text-[#737373] mt-1">Unlock audio uploader permission controls</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3] mb-1.5">Administrative Passcode</label>
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
                      className="w-full bg-[#050505] border border-[#262626] focus:border-[#fca311] rounded-xl py-2.5 px-3 text-xs text-[#E5E5E5] placeholder-[#555555] focus:outline-none"
                      id="input-teachings-passcode"
                    />
                    {passcodeError && (
                      <p className="text-[10px] text-amber-500 font-mono mt-1.5">{passcodeError}</p>
                    )}
                  </div>

                  <button
                    onClick={handleAuthAdmin}
                    className="w-full py-3 bg-[#fca311] hover:bg-[#e5920a] text-[#000000] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto" id="teachings-upload-modal-overlay">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg bg-[#0d0d0d] border border-[#262626] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 my-8"
                id="teachings-upload-container"
              >
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadedFileName('');
                    setAudioUrl('');
                    setDetectedDuration('');
                  }}
                  className="absolute top-5 right-5 text-[#737373] hover:text-[#E5E5E5] p-1.5 bg-black/50 rounded-full transition-colors z-10 cursor-pointer"
                  id="btn-close-teachings-upload"
                >
                  <X className="h-4.5 w-4.5" />
                </button>

                <div className="flex items-center gap-2.5 pb-4 border-b border-[#222222] mb-6">
                  <FileAudio className="h-5 w-5 text-[#fca311]" />
                  <h3 className="font-display font-bold text-lg text-[#E5E5E5]">Publish Sermon Audio</h3>
                </div>

                <form onSubmit={handlePublishTeaching} className="space-y-4 text-left">
                  {/* Title */}
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3] mb-1.5">Sermon Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Pneumatika: The Spiritual Gifts Explained"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#050505] border border-[#262626] focus:border-[#fca311] rounded-xl py-2.5 px-3 text-xs text-[#E5E5E5] placeholder-[#555555] focus:outline-none"
                      id="input-teachings-title"
                    />
                  </div>

                  {/* Series / Category & Conditional Date / Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3] mb-1.5">Category / Event *</label>
                      <select
                        value={series}
                        onChange={(e) => setSeries(e.target.value)}
                        className="w-full bg-[#050505] border border-[#262626] focus:border-[#fca311] rounded-xl py-2.5 px-3 text-xs text-[#E5E5E5] focus:outline-none"
                        id="input-teachings-series"
                      >
                        <option value="Edifice Conference">Edifice Conference</option>
                        <option value="Reaching Our World Campmeeting">Reaching Our World Campmeeting</option>
                        <option value="Sunday Sermon">Sunday Sermon</option>
                      </select>
                    </div>

                    <div>
                      {series === 'Edifice Conference' || series === 'Reaching Our World Campmeeting' ? (
                        <div>
                          <label className="block text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3] mb-1.5">
                            Event Year *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="2026"
                            value={teachingYear}
                            onChange={(e) => setTeachingYear(e.target.value)}
                            className="w-full bg-[#050505] border border-[#262626] focus:border-[#fca311] rounded-xl py-2.5 px-3 text-xs text-[#E5E5E5] placeholder-[#555555] focus:outline-none"
                            id="input-teachings-year"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3] mb-1.5">
                            Preaching Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={teachingDate}
                            onChange={(e) => setTeachingDate(e.target.value)}
                            className="w-full bg-[#050505] border border-[#262626] focus:border-[#fca311] rounded-xl py-2.5 px-3 text-xs text-[#E5E5E5] focus:outline-none"
                            id="input-teachings-date"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preacher */}
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3] mb-1.5">Preacher *</label>
                    <input
                      type="text"
                      required
                      value={preacher}
                      onChange={(e) => setPreacher(e.target.value)}
                      className="w-full bg-[#050505] border border-[#262626] focus:border-[#fca311] rounded-xl py-2.5 px-3 text-xs text-[#E5E5E5] focus:outline-none"
                      id="input-teachings-preacher"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3] mb-1.5">Sermon Description</label>
                    <textarea
                      placeholder="Provide a brief summary of the apostolic teaching content..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-[#050505] border border-[#262626] focus:border-[#fca311] rounded-xl py-2.5 px-3 text-xs text-[#E5E5E5] placeholder-[#555555] focus:outline-none resize-none"
                      id="input-teachings-description"
                    />
                  </div>

                  {/* Preset Cover Selector */}
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3] mb-2">Select Series Cover Artwork</label>
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
                              ? 'border-[#fca311] scale-95 shadow shadow-[#fca311]/40' 
                              : 'border-[#262626] hover:border-[#737373]'
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3]">Audio Track Attachment *</label>
                      {detectedDuration && (
                        <span className="text-[10px] font-mono text-[#fca311] bg-[#fca311]/10 px-2 py-0.5 rounded-md border border-[#fca311]/30">
                          Detected Duration: {detectedDuration}
                        </span>
                      )}
                    </div>
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
                          ? 'border-[#fca311] bg-[#fca311]/10' 
                          : audioUrl 
                            ? 'border-[#fca311]/60 bg-[#fca311]/5' 
                            : 'border-[#262626] hover:border-[#fca311]/50 bg-[#050505]'
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
                            <div className="flex justify-between text-[10px] font-mono text-[#A3A3A3]">
                              <span>Processing file & detecting duration...</span>
                              <span className="text-[#fca311]">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-[#000000] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#fca311] h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        ) : audioUrl ? (
                          <div className="text-center">
                            <CheckCircle className="h-6 w-6 text-[#fca311] mx-auto mb-1" />
                            <p className="text-[11px] font-semibold text-[#fca311] truncate max-w-[220px] mx-auto">{uploadedFileName || "Audio loaded successfully"}</p>
                            <p className="text-[9px] text-[#737373] font-mono mt-0.5">Size: {fileSize} • Duration: {detectedDuration || 'Detected'}</p>
                            <span className="text-[9px] text-[#fca311] underline mt-1.5 block">Click to change track</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Download className="h-5 w-5 text-[#fca311] mx-auto mb-1.5" />
                            <p className="text-xs text-[#E5E5E5] font-semibold">Drag & Drop MP3 or Click to browse</p>
                            <p className="text-[10px] text-[#737373] mt-1">Automatic duration detection • Up to 50MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isUploadingFile}
                    className={`w-full py-3 bg-[#fca311] hover:bg-[#e5920a] text-[#000000] font-display font-bold text-xs uppercase tracking-wider rounded-xl mt-4 shadow-lg shadow-[#fca311]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer
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
    </div>
  );
}
