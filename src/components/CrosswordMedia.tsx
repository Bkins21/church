import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { 
  Lock, User, Mail, Database, Trash2, LogOut, CheckCircle2, 
  AlertCircle, Upload, Loader2, Plus, Search, FileText, Music, 
  Settings, Key, Eye, EyeOff, LayoutDashboard, Users, MessageSquare, Clipboard, ArrowLeft,
  Image as ImageIcon, Calendar, BarChart3, Download, BookOpen, Table, Play, Pause, ExternalLink,
  FileSpreadsheet, Tag, Phone, MapPin, Check, Filter, RefreshCw, Radio, X, Globe
} from 'lucide-react';
import { supabase, isSupabaseConfigured, checkIfAdmin } from '../supabase';
import { Teaching, Registration, Subscriber, Song, GalleryItem, ChurchEvent, Publication, PublicationType } from '../types';
import { upcomingMeetings, galleryItems, crossworshipSongsCatalog } from '../data';
import AdminAnalyticsDashboard, { RawMeetingRegistration } from './AdminAnalyticsDashboard';

interface CrosswordMediaProps {
  onClose: () => void;
  onNavigateHome: () => void;
}

export default function CrosswordMedia({ onClose, onNavigateHome }: CrosswordMediaProps) {
  // Auth states
  const [session, setSession] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  
  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Dashboard states
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'analytics' | 'songs' | 'teachings' | 'publications' | 'gallery' | 'events' | 'registrations' | 'subscribers' | 'settings' | 'database'>('overview');
  
  // Data lists
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [rawMeetingRegistrations, setRawMeetingRegistrations] = useState<RawMeetingRegistration[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Audio preview playback state
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Registrations Filter & Data Board states
  const [exportingCsv, setExportingCsv] = useState<boolean>(false);
  const [exportingExcel, setExportingExcel] = useState<boolean>(false);
  const [regFilterEvent, setRegFilterEvent] = useState<string>('all');
  const [regFilterBranch, setRegFilterBranch] = useState<string>('all');
  const [regFilterMode, setRegFilterMode] = useState<string>('all');
  const [selectedAttendeeDetail, setSelectedAttendeeDetail] = useState<any | null>(null);
  const [regStatusMap, setRegStatusMap] = useState<{ [id: string]: string }>(() => {
    try {
      const saved = localStorage.getItem('gec_reg_status_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Publications states
  const [publicationsList, setPublicationsList] = useState<Publication[]>([]);
  const [pubTitle, setPubTitle] = useState('');
  const [pubAuthor, setPubAuthor] = useState('Abiodun Adebayo');
  const [pubMonth, setPubMonth] = useState<string>(() => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[new Date().getMonth()];
  });
  const [pubType, setPubType] = useState<PublicationType>('bulletin');
  const [pubDescription, setPubDescription] = useState('');
  const [pubCoverUrl, setPubCoverUrl] = useState('');
  const [pubCoverFile, setPubCoverFile] = useState<File | null>(null);
  const pubCoverInputRef = useRef<HTMLInputElement>(null);
  const [pubYear, setPubYear] = useState<number>(new Date().getFullYear());
  const [pubFileUrl, setPubFileUrl] = useState('');
  const [pubFile, setPubFile] = useState<File | null>(null);
  const [uploadingPub, setUploadingPub] = useState(false);
  const [pubUploadProgress, setPubUploadProgress] = useState(0);
  const [pubError, setPubError] = useState<string | null>(null);
  const [pubSuccess, setPubSuccess] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const pubFileInputRef = useRef<HTMLInputElement>(null);

  // Songs states
  const [songsList, setSongsList] = useState<Song[]>([]);
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songAlbum, setSongAlbum] = useState('');
  const [songCoverUrl, setSongCoverUrl] = useState('');
  const [songLyrics, setSongLyrics] = useState('');
  const [songAudioUrl, setSongAudioUrl] = useState('');
  const [songFile, setSongFile] = useState<File | null>(null);
  const [uploadingSong, setUploadingSong] = useState(false);
  const [songUploadProgress, setSongUploadProgress] = useState(0);
  const [songError, setSongError] = useState<string | null>(null);
  const [songSuccess, setSongSuccess] = useState<string | null>(null);
  const [copiedSongSql, setCopiedSongSql] = useState(false);
  const songFileInputRef = useRef<HTMLInputElement>(null);

  // Gallery states
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem('gec_user_uploaded_gallery');
      return saved ? JSON.parse(saved) : galleryItems;
    } catch {
      return galleryItems;
    }
  });
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryDesc, setGalleryDesc] = useState('');
  const [galleryCategory, setGalleryCategory] = useState<'Worship' | 'Preaching' | 'Outreach' | 'Community' | 'Reboot Camp'>('Worship');
  const [galleryImageUrl, setGalleryImageUrl] = useState('');

  // Events states
  const [eventsList, setEventsList] = useState<ChurchEvent[]>(() => {
    try {
      const saved = localStorage.getItem('gec_upcoming_meetings');
      return saved ? JSON.parse(saved) : upcomingMeetings;
    } catch {
      return upcomingMeetings;
    }
  });
  const [eventTitleInput, setEventTitleInput] = useState('');
  const [eventDateInput, setEventDateInput] = useState('');
  const [eventTimeInput, setEventTimeInput] = useState('');
  const [eventLocationInput, setEventLocationInput] = useState('');
  const [eventModeInput, setEventModeInput] = useState<'physical' | 'virtual' | 'hybrid'>('physical');
  const [eventBannerInput, setEventBannerInput] = useState('');
  const [eventDescriptionInput, setEventDescriptionInput] = useState('');
  const [eventSpeakerInput, setEventSpeakerInput] = useState('');
  const [regViewMode, setRegViewMode] = useState<'table' | 'charts'>('table');
  const [selectedRegAttendee, setSelectedRegAttendee] = useState<any | null>(null);
  const [regBranchFilter, setRegBranchFilter] = useState<string>('ALL');
  const [regModeFilter, setRegModeFilter] = useState<string>('ALL');
  const [regEventFilter, setRegEventFilter] = useState<string>('ALL');

  const handleStatusChange = (regId: string, newStatus: string) => {
    setRegStatusMap(prev => {
      const updated = { ...prev, [regId]: newStatus };
      try {
        localStorage.setItem('gec_reg_status_map', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save status map', e);
      }
      return updated;
    });
  };

  // Site Settings states
  const [churchNameSetting, setChurchNameSetting] = useState(() => localStorage.getItem('gec_setting_church_name') || "God's Edifice Church");
  const [residentPastorSetting, setResidentPastorSetting] = useState(() => localStorage.getItem('gec_setting_pastor') || "Pastor Abiodun Adebayo");
  const [pastorPhotoSetting, setPastorPhotoSetting] = useState(() => localStorage.getItem('gec_setting_pastor_photo') || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop");
  const [contactEmailSetting, setContactEmailSetting] = useState(() => localStorage.getItem('gec_setting_email') || "contact@godsedifice.org");
  const [contactPhoneSetting, setContactPhoneSetting] = useState(() => localStorage.getItem('gec_setting_phone') || "+234 803 111 2222");
  
  // Form states for uploading sermon
  const [sermonTitle, setSermonTitle] = useState('');
  const [sermonSpeaker, setSermonSpeaker] = useState('');
  const [sermonCategory, setSermonCategory] = useState('Sermon');
  const [sermonDuration, setSermonDuration] = useState('45 mins');
  const [sermonDate, setSermonDate] = useState(new Date().toISOString().split('T')[0]);
  const [coverUrl, setCoverUrl] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingSermon, setUploadingSermon] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  
  // Search terms
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Monitor Supabase Auth state
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setCheckingAuth(false);
      setIsAdminUser(false);
      return;
    }

    // Always fetch active Supabase Auth session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if (session?.user) {
        localStorage.setItem('gec_admin_authenticated', 'true');
        verifyAdminAccess(session.user.id, session.user.email);
      } else {
        localStorage.removeItem('gec_admin_authenticated');
        setIsAdminUser(false);
        setCheckingAuth(false);
      }
    }).catch((err: any) => {
      console.warn('Error fetching Supabase session:', err);
      localStorage.removeItem('gec_admin_authenticated');
      setIsAdminUser(false);
      setCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      if (session?.user) {
        localStorage.setItem('gec_admin_authenticated', 'true');
        verifyAdminAccess(session.user.id, session.user.email);
      } else {
        localStorage.removeItem('gec_admin_authenticated');
        setIsAdminUser(false);
        setCheckingAuth(false);
      }
    }) || { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Check admin status
  const verifyAdminAccess = async (userId: string, userEmail: string | undefined) => {
    setCheckingAuth(true);
    
    const isDeveloper = userEmail?.toLowerCase() === 'boluakintola@gmail.com';
    const isAdmin = await checkIfAdmin(userId);
    
    if (isAdmin || isDeveloper) {
      setIsAdminUser(true);
      setCheckingAuth(false);
      fetchDashboardData();
    } else {
      setIsAdminUser(false);
      setCheckingAuth(false);
    }
  };

  // Fetch Songs strictly from Supabase public."Songs" table
  const fetchCloudSongs = async () => {
    if (!supabase) return;
    try {
      const { data: songsData, error: songsError } = await supabase
        .from('Songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (songsError) {
        console.error('Supabase fetch failure from Songs table in Admin:', songsError);
        return;
      }

      if (songsData) {
        const mappedSongs: Song[] = songsData.map((s: any) => ({
          id: s.id,
          title: s.title || '',
          artist: s.artist || 'Crossworship',
          album: s.album || 'Edifice Anthem Single',
          duration: s.duration || '4:30',
          audioUrl: s.audio_url || '',
          coverUrl: s.artwork || '',
          lyrics: s.description || '',
          downloads: s.downloads || 0,
          uploadedByUser: true
        }));
        setSongsList(mappedSongs);
      }
    } catch (err) {
      console.error('Failed to fetch songs from Supabase in Admin:', err);
    }
  };

  // Fetch publications from Supabase
  const fetchCloudPublications = async () => {
    if (!supabase || !isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('publish_year', { ascending: false });

      if (error) {
        console.error('Failed to fetch publications from Supabase in Admin:', error);
        return;
      }

      if (data) {
        const mappedPubs: Publication[] = data.map((pub: any) => ({
          id: pub.id,
          title: pub.title || '',
          type: pub.type || 'bulletin',
          author: pub.author || '',
          description: pub.description || '',
          coverUrl: pub.cover_url || '',
          month: pub.month || '',
          publishYear: pub.publish_year || new Date().getFullYear(),
          fileUrl: pub.file_url || '',
        }));
        setPublicationsList(mappedPubs);
      }
    } catch (err) {
      console.error('Failed to fetch publications from Supabase in Admin:', err);
    }
  };

  // Sync songs and publications across tabs and listen for changes
  useEffect(() => {
    // Clear stale localStorage so old items never resurrect
    try {
      localStorage.removeItem('gec_user_uploaded_songs');
      localStorage.removeItem('gec_songs_catalog');
      localStorage.removeItem('gec_publications_catalog');
    } catch (e) {
      // Ignore
    }

    fetchCloudSongs();
    fetchCloudPublications();

    const handleSongsUpdate = () => {
      fetchCloudSongs();
    };

    const handlePubsUpdate = () => {
      fetchCloudPublications();
    };

    window.addEventListener('gec_songs_updated', handleSongsUpdate);
    window.addEventListener('gec_publications_updated', handlePubsUpdate);
    return () => {
      window.removeEventListener('gec_songs_updated', handleSongsUpdate);
      window.removeEventListener('gec_publications_updated', handlePubsUpdate);
    };
  }, []);

  // Fetch all Supabase data
  const fetchDashboardData = async () => {
    if (!supabase) return;
    setDataLoading(true);
    try {
      // Fetch Songs
      await fetchCloudSongs();

      // 1. Fetch Sermons / Teachings
      const { data: teachingsData, error: tError } = await supabase
        .from('teachings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!tError && teachingsData) {
        // Map database naming (snake_case) to client structure (camelCase)
        const mappedTeachings: Teaching[] = teachingsData.map((t: any) => ({
          id: t.id,
          title: t.title,
          preacher: t.preacher || t.speaker || 'Pastor Abiodun Adebayo',
          series: t.series || t.category || 'Sermon',
          duration: t.duration || '45 mins',
          date: t.date,
          description: t.description || 'Systematic theological sermon.',
          audioUrl: t.audio_url || t.audioUrl || '',
          coverUrl: t.cover_url || t.coverUrl || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
          downloadCount: t.download_count || t.downloadCount || 0,
          size: t.size || '15 MB'
        }));
        setTeachings(mappedTeachings);
      }

      // 2. Fetch Registrations
      const { data: meetingRegsData } = await supabase
        .from('meeting_registrations')
        .select('*');

      if (meetingRegsData) {
        setRawMeetingRegistrations(meetingRegsData);
      }

      const { data: regsData, error: rError } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      const allCombinedRaw = [
        ...(meetingRegsData || []).map((m: any) => ({
          id: m.id || `mreg-${m.email}-${m.first_name}`,
          eventId: 'edifice-conference-2026',
          eventTitle: "God's Edifice Church Conference",
          eventDate: m.meeting_date || '2026-10-01',
          eventLocation: m.address || m.nearest_branch || 'Lekki HQ',
          userName: `${m.first_name || ''} ${m.surname || ''}`.trim() || 'Attendee',
          firstName: m.first_name || '',
          surname: m.surname || '',
          userEmail: m.email || '',
          userPhone: m.phone_number || '',
          userBranch: m.nearest_branch || '',
          ticketCode: `GEC-${Math.floor(100000 + Math.random() * 900000)}`,
          registrationDate: new Date().toISOString(),
          mode: 'physical' as const,
          address: m.address || '',
          ageRange: m.age || '',
          gender: m.gender || '',
          expectations: m.expecations_prayer_request || '',
          howHeard: m.how_you_heard || ''
        })),
        ...(!rError && regsData ? regsData.map((r: any) => ({
          id: r.id,
          eventId: r.event_id || r.eventId || 'edifice-conference-2026',
          eventTitle: r.event_title || r.eventTitle || r.event_name || r.eventName || "God's Edifice Church Conference",
          eventDate: r.event_date || r.eventDate || '2026-10-01',
          eventLocation: r.event_location || r.eventLocation || 'Lekki HQ',
          userName: r.user_name || r.userName || `${r.surname || ''} ${r.first_name || ''}`.trim() || 'Attendee',
          firstName: r.first_name || '',
          surname: r.surname || '',
          userEmail: r.user_email || r.userEmail || r.email || '',
          userPhone: r.user_phone || r.userPhone || r.phone || '',
          userBranch: r.user_branch || r.userBranch || r.location || 'Main Branch',
          ticketCode: r.ticket_code || r.ticketCode || `GEC-${Math.floor(100000 + Math.random() * 900000)}`,
          registrationDate: r.registration_date || r.registrationDate || r.created_at || new Date().toISOString(),
          mode: (r.mode as 'physical' | 'virtual') || 'physical'
        })) : [])
      ];

      // Filter duplicates by email if any
      const uniqueRegs: Registration[] = [];
      const seenEmails = new Set();
      for (const reg of allCombinedRaw) {
        if (!seenEmails.has(reg.userEmail)) {
          seenEmails.add(reg.userEmail);
          uniqueRegs.push(reg);
        }
      }
      setRegistrations(uniqueRegs);

      // 3. Fetch Subscribers
      const { data: subsData, error: sError } = await supabase
        .from('subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });
      
      if (!sError && subsData) {
        const mappedSubs: Subscriber[] = subsData.map((s: any) => ({
          id: s.id,
          email: s.email,
          subscribedAt: s.subscribed_at
        }));
        setSubscribers(mappedSubs);
      }

    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setDataLoading(false);
    }
  };

  // Handle Login & Signup
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      setAuthError('Supabase is not configured yet. Please configure the environment variables.');
      return;
    }

    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) throw error;
        if (data?.session) {
          localStorage.setItem('gec_admin_authenticated', 'true');
          setSession(data.session);
          setIsAdminUser(true);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password
        });
        if (error) throw error;
        setAuthError('Registration successful! Please sign in.');
        setAuthMode('login');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('gec_admin_authenticated');
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign out error', err);
      }
    }
    setSession(null);
    setIsAdminUser(false);
    if (window.location.pathname !== '/crosswordmedia') {
      window.history.pushState(null, '', '/crosswordmedia');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Handle File Upload and Sermon Metadata Save
  const handleSermonUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!sermonTitle || !sermonSpeaker) {
      setFormError('Please fill in Title and Speaker.');
      return;
    }
    if (!audioFile) {
      setFormError('Please select an audio file to upload.');
      return;
    }

    setFormError('');
    setFormSuccess('');
    setUploadingSermon(true);
    setUploadProgress(10);

    try {
      // 1. Upload audio file to Supabase Storage
      const fileExt = audioFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = fileName;

      setUploadProgress(20);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Teachings')
        .upload(filePath, audioFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      setUploadProgress(60);

      // 2. Get Public URL of uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('Teachings')
        .getPublicUrl(filePath);

      setUploadProgress(80);

      // 3. Save Metadata to teachings table in Database
      const newSermonId = `sermon-${Date.now()}`;
      const coverImage = coverUrl.trim() || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop';

      const { error: dbError } = await supabase
        .from('teachings')
        .insert([{
          id: newSermonId,
          title: sermonTitle,
          speaker: sermonSpeaker,
          category: sermonCategory,
          duration: sermonDuration,
          date: sermonDate,
          audio_url: publicUrl,
          cover_url: coverImage,
          created_at: new Date().toISOString()
        }]);

      if (dbError) throw dbError;

      setUploadProgress(100);
      setFormSuccess('Sermon dynamic upload succeeded! File and metadata saved in Supabase.');
      
      // Reset form
      setSermonTitle('');
      setSermonSpeaker('');
      setCoverUrl('');
      setAudioFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Reload list
      fetchDashboardData();
      window.dispatchEvent(new Event('gec_teachings_updated'));

    } catch (err: any) {
      console.error('Upload failed:', err);
      setFormError(`Upload Failed: ${err.message || 'Make sure the "Teachings" bucket is public and the "teachings" table exists.'}`);
    } finally {
      setUploadingSermon(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Delete sermon
  const handleDeleteSermon = async (id: string, audioUrl: string) => {
    if (!supabase) return;
    if (!confirm('Are you sure you want to delete this teaching and its audio file?')) return;

    try {
      // 1. Delete from storage if URL matches our storage domain
      if (audioUrl.includes('/storage/v1/object/public/Teachings/')) {
        const parts = audioUrl.split('/Teachings/');
        if (parts.length > 1) {
          const filePath = parts[1];
          await supabase.storage.from('Teachings').remove([filePath]);
        }
      } else if (audioUrl.includes('/storage/v1/object/public/sermons/')) {
        const parts = audioUrl.split('/sermons/');
        if (parts.length > 1) {
          const filePath = `sermons/${parts[1]}`;
          await supabase.storage.from('sermons').remove([filePath]);
        }
      }

      // 2. Delete from database
      const { error } = await supabase
        .from('teachings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTeachings(prev => prev.filter(t => t.id !== id));
      window.dispatchEvent(new Event('gec_teachings_updated'));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Delete Subscriber
  const handleDeleteSub = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Remove this subscriber from list?')) return;
    try {
      const { error } = await supabase.from('subscribers').delete().eq('id', id);
      if (error) throw error;
      setSubscribers(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete Registration
  const handleDeleteReg = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Remove this registration record?')) return;
    try {
      const { error } = await supabase.from('meeting_registrations').delete().eq('id', id);
      if (error) {
        // Also try standard registrations table if id was not in meeting_registrations
        await supabase.from('registrations').delete().eq('id', id);
      }
      setRegistrations(prev => prev.filter(r => r.id !== id));
      setRawMeetingRegistrations(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Export meeting_registrations directly from Supabase as a CSV file
  const handleExportMeetingRegistrationsCSV = async () => {
    setExportingCsv(true);
    try {
      let rows: any[] = [];

      // 1. Fetch live entries directly from 'meeting_registrations' Supabase table
      if (supabase && isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('meeting_registrations')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            rows = data;
          } else if (error) {
            console.warn('Notice querying meeting_registrations table:', error);
          }
        } catch (queryErr) {
          console.warn('Direct query to meeting_registrations failed, using fallback:', queryErr);
        }
      }

      // 2. Fallback to rawMeetingRegistrations in state
      if (rows.length === 0 && rawMeetingRegistrations && rawMeetingRegistrations.length > 0) {
        rows = rawMeetingRegistrations;
      }

      // 3. Fallback to registrations list if meeting_registrations is not populated
      if (rows.length === 0 && registrations && registrations.length > 0) {
        rows = registrations.map(r => ({
          id: r.id,
          first_name: r.firstName || r.userName?.split(' ')[0] || '',
          surname: r.surname || r.userName?.split(' ').slice(1).join(' ') || '',
          email: r.userEmail || r.email || '',
          phone_number: r.userPhone || r.phone || '',
          address: r.address || '',
          nearest_branch: r.userBranch || r.location || '',
          age: r.ageRange || '',
          gender: r.gender || '',
          expecations_prayer_request: r.expectations || '',
          how_you_heard: r.howHeard || '',
          meeting_date: r.eventDate || '',
          created_at: r.registrationDate || new Date().toISOString()
        }));
      }

      if (rows.length === 0) {
        alert('No registration records found in meeting_registrations to export.');
        setExportingCsv(false);
        return;
      }

      // Format CSV Columns according to meeting_registrations schema
      const headers = [
        'ID',
        'First Name',
        'Surname',
        'Email Address',
        'Phone Number',
        'Address',
        'Nearest Branch',
        'Age Range',
        'Gender',
        'Expectations / Prayer Request',
        'How You Heard',
        'Meeting Date',
        'Created At (Timestamp)'
      ];

      // Sanitizer for CSV escaping
      const escapeCsvCell = (value: any): string => {
        if (value === null || value === undefined) return '""';
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
      };

      const csvDataRows = rows.map(r => [
        escapeCsvCell(r.id || ''),
        escapeCsvCell(r.first_name || r.firstName || ''),
        escapeCsvCell(r.surname || r.lastName || ''),
        escapeCsvCell(r.email || r.userEmail || ''),
        escapeCsvCell(r.phone_number || r.phone || r.userPhone || ''),
        escapeCsvCell(r.address || ''),
        escapeCsvCell(r.nearest_branch || r.userBranch || r.location || 'Lekki HQ'),
        escapeCsvCell(r.age || r.ageRange || ''),
        escapeCsvCell(r.gender || ''),
        escapeCsvCell(r.expecations_prayer_request || r.expectations || ''),
        escapeCsvCell(r.how_you_heard || r.howHeard || ''),
        escapeCsvCell(r.meeting_date || r.eventDate || ''),
        escapeCsvCell(r.created_at || r.registrationDate || '')
      ]);

      const csvString = [headers.join(','), ...csvDataRows.map(row => row.join(','))].join('\r\n');
      
      // Generate downloadable Blob with UTF-8 BOM for Excel compatibility
      const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      const filename = `meeting_registrations_export_${new Date().toISOString().split('T')[0]}.csv`;
      
      downloadLink.setAttribute('href', url);
      downloadLink.setAttribute('download', filename);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to export meeting registrations to CSV:', err);
      alert('An error occurred while generating the CSV export.');
    } finally {
      setExportingCsv(false);
    }
  };

  // Export to Excel (.xlsx) using SheetJS
  const handleExportMeetingRegistrationsExcel = async () => {
    setExportingExcel(true);
    try {
      let rows: any[] = [];
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('meeting_registrations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          rows = data;
        } else {
          rows = rawMeetingRegistrations.length > 0 ? rawMeetingRegistrations : registrations;
        }
      } else {
        rows = rawMeetingRegistrations.length > 0 ? rawMeetingRegistrations : registrations;
      }

      if (rows.length === 0) {
        alert('No registration records found to export.');
        setExportingExcel(false);
        return;
      }

      // Format Sheet 1: Master Registrations List
      const formattedMasterRows = rows.map((r, idx) => {
        const regId = r.id || `GEC-REG-${1000 + idx}`;
        const currentStatus = regStatusMap[regId] || r.status || 'Confirmed';
        return {
          'S/N': idx + 1,
          'Registration Code': regId,
          'First Name': r.first_name || r.firstName || '',
          'Surname': r.surname || r.lastName || '',
          'Full Name': `${r.surname || r.lastName || ''} ${r.first_name || r.firstName || ''}`.trim() || 'GEC Attendee',
          'Email Address': r.email || r.userEmail || '',
          'Phone Number': r.phone_number || r.phone || r.userPhone || 'N/A',
          'Nearest Branch': r.nearest_branch || r.userBranch || r.location || 'Lekki HQ',
          'Attendance Mode': r.mode || r.attendance_mode || 'Physical Attendance',
          'Residential Address': r.address || 'N/A',
          'Age Range': r.age || r.ageRange || '26-35',
          'Gender': r.gender || 'Not specified',
          'Denomination / Church': r.denomination || "God's Edifice Church",
          'Expectations / Prayer Request': r.expecations_prayer_request || r.expectations || 'Spiritual growth and alignment',
          'How You Heard': r.how_you_heard || r.howHeard || 'Church Announcement',
          'Meeting / Event Title': r.event_name || r.eventName || 'Edifice Conference 2026',
          'Meeting Date': r.meeting_date || r.eventDate || 'November 12-15, 2026',
          'Registration Date': r.created_at ? new Date(r.created_at).toLocaleString() : new Date().toLocaleString(),
          'Check-in Status': currentStatus
        };
      });

      // Create Workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: All Registrations Master Board
      const wsMaster = XLSX.utils.json_to_sheet(formattedMasterRows);
      
      // Auto-fit column widths
      const colWidths = Object.keys(formattedMasterRows[0] || {}).map(key => ({
        wch: Math.max(key.length + 4, ...formattedMasterRows.map(r => String((r as any)[key] || '').length + 2))
      }));
      wsMaster['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, wsMaster, 'All Registrations');

      // Sheet 2: Summary by Branch
      const branchCounts: { [branch: string]: { total: number; physical: number; virtual: number } } = {};
      formattedMasterRows.forEach(r => {
        const br = r['Nearest Branch'] || 'Lekki HQ';
        if (!branchCounts[br]) {
          branchCounts[br] = { total: 0, physical: 0, virtual: 0 };
        }
        branchCounts[br].total += 1;
        if (String(r['Attendance Mode']).toLowerCase().includes('virt')) {
          branchCounts[br].virtual += 1;
        } else {
          branchCounts[br].physical += 1;
        }
      });
      const branchSummaryData = Object.entries(branchCounts).map(([branch, stats]) => ({
        'Branch Location': branch,
        'Total Attendees': stats.total,
        'Physical Mode': stats.physical,
        'Virtual Mode': stats.virtual,
        'Share of Total': `${((stats.total / formattedMasterRows.length) * 100).toFixed(1)}%`
      }));
      const wsBranch = XLSX.utils.json_to_sheet(branchSummaryData);
      wsBranch['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsBranch, 'Branch Breakdown');

      // Sheet 3: Summary by Event
      const eventCounts: { [ev: string]: number } = {};
      formattedMasterRows.forEach(r => {
        const ev = r['Meeting / Event Title'] || 'Edifice Conference';
        eventCounts[ev] = (eventCounts[ev] || 0) + 1;
      });
      const eventSummaryData = Object.entries(eventCounts).map(([ev, count]) => ({
        'Event / Meeting Title': ev,
        'Total Registrations': count,
        'Percentage': `${((count / formattedMasterRows.length) * 100).toFixed(1)}%`
      }));
      const wsEvent = XLSX.utils.json_to_sheet(eventSummaryData);
      wsEvent['!cols'] = [{ wch: 35 }, { wch: 22 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsEvent, 'Event Breakdown');

      // Generate and trigger download
      const filename = `GEC_Event_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err: any) {
      console.error('Failed to export to Excel:', err);
      alert('An error occurred while generating the Excel spreadsheet.');
    } finally {
      setExportingExcel(false);
    }
  };

  // Status map updater
  const handleUpdateRegStatus = (regId: string, status: string) => {
    const updated = { ...regStatusMap, [regId]: status };
    setRegStatusMap(updated);
    localStorage.setItem('gec_reg_status_map', JSON.stringify(updated));
  };

  // Toggle Audio Playback
  const toggleAudioPlayback = (audioUrl: string) => {
    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio();
    }
    
    if (playingAudioUrl === audioUrl) {
      audioPreviewRef.current.pause();
      setPlayingAudioUrl(null);
    } else {
      audioPreviewRef.current.src = audioUrl;
      audioPreviewRef.current.play().catch(e => console.warn('Playback error:', e));
      setPlayingAudioUrl(audioUrl);
      audioPreviewRef.current.onended = () => setPlayingAudioUrl(null);
    }
  };

  // Publication Handlers
  const handleAddPublication = async (e: React.FormEvent) => {
    e.preventDefault();
    setPubError(null);
    setPubSuccess(null);

    if (!pubTitle.trim()) {
      setPubError('Publication title is required.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setPubError('Supabase is not configured. Please check your Supabase credentials.');
      return;
    }

    // Refresh and ensure active Supabase Auth session
    let authUser = session?.user;
    if (!authUser && supabase?.auth) {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        if (activeSession?.user) {
          authUser = activeSession.user;
          setSession(activeSession);
        }
      } catch (sessErr) {
        console.warn('Could not retrieve active session:', sessErr);
      }
    }

    setUploadingPub(true);
    setPubUploadProgress(15);

    let finalFileUrl = pubFileUrl.trim();
    let finalCoverUrl = pubCoverUrl.trim();

    try {
      // 1. Upload PDF document to Publications bucket under pubs/
      if (pubFile) {
        setPubUploadProgress(35);
        const fileExt = pubFile.name.split('.').pop() || 'pdf';
        const fileName = `pubs/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('Publications')
          .upload(fileName, pubFile, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          throw new Error(`PDF upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage.from('Publications').getPublicUrl(fileName);
        finalFileUrl = publicUrl;
        setPubUploadProgress(60);
      }

      // 2. Upload cover image to Publications bucket under covers/
      if (pubCoverFile) {
        setPubUploadProgress(70);
        const fileExt = pubCoverFile.name.split('.').pop() || 'jpg';
        const fileName = `covers/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        const { error: coverUploadError } = await supabase.storage
          .from('Publications')
          .upload(fileName, pubCoverFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (coverUploadError) {
          throw new Error(`Cover image upload failed: ${coverUploadError.message}`);
        }

        const { data: coverData } = supabase.storage
          .from('Publications')
          .getPublicUrl(fileName);

        finalCoverUrl = coverData.publicUrl;
      }

      if (!finalCoverUrl) {
        finalCoverUrl = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop';
      }

      setPubUploadProgress(85);

      const newPublicationId = `pub-${Date.now()}`;
      const pubYearNum = Number(pubYear) || new Date().getFullYear();

      // 3. Insert publication into Supabase `publications` table
      const { error: dbError } = await supabase
        .from('publications')
        .insert([
          {
            id: newPublicationId,
            title: pubTitle.trim(),
            type: pubType || 'bulletin',
            author: pubAuthor.trim() || 'Pastor Abiodun Adebayo',
            description: pubDescription.trim() || "Monthly bulletin available for download to get edified and equipped with God's word.",
            cover_url: finalCoverUrl,
            month: pubMonth,
            publish_year: pubYearNum,
            file_url: finalFileUrl
          }
        ]);

      if (dbError) {
        const isRls = dbError.code === '42501' || dbError.message?.toLowerCase().includes('row-level security');
        if (isRls) {
          setPubError('RLS_POLICY_ERROR');
        } else {
          setPubError(`Failed to save publication: ${dbError.message}`);
        }
        setUploadingPub(false);
        setPubUploadProgress(0);
        return;
      }

      // Refresh list from database & sync across tabs
      await fetchCloudPublications();
      window.dispatchEvent(new Event('gec_publications_updated'));

      // Reset Form
      setPubTitle('');
      setPubAuthor('Pastor Abiodun Adebayo');
      setPubType('bulletin');
      setPubDescription('');
      setPubCoverUrl('');
      setPubCoverFile(null);
      setPubYear(new Date().getFullYear());
      setPubFileUrl('');
      setPubFile(null);
      if (pubFileInputRef.current) {
        pubFileInputRef.current.value = '';
      }
      if (pubCoverInputRef.current) {
        pubCoverInputRef.current.value = '';
      }
      setUploadingPub(false);
      setPubUploadProgress(100);
      setPubSuccess('Monthly bulletin published successfully! It is now live in the GEC Publications catalog.');
      setTimeout(() => setPubUploadProgress(0), 1000);
    } catch (err: any) {
      setPubError(err?.message || 'Publication upload failed.');
      setUploadingPub(false);
      setPubUploadProgress(0);
    }
  };

  const handleDeletePublication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this publication?')) return;

    const publication = publicationsList.find(p => p.id === id);

    if (!publication) {
      console.error('Publication not found:', id);
      return;
    }

    try {
      if (isSupabaseConfigured && supabase) {
        const marker = '/storage/v1/object/public/Publications/';

        // Delete the PDF from Supabase Storage Publications bucket
        if (publication.fileUrl && publication.fileUrl.includes(marker)) {
          try {
            const url = new URL(publication.fileUrl);
            const storagePath = decodeURIComponent(url.pathname.split(marker)[1]);
            if (storagePath) {
              const { error: storageError } = await supabase.storage
                .from('Publications')
                .remove([storagePath]);

              if (storageError) {
                console.error('Failed to delete publication file from Storage:', storageError);
              }
            }
          } catch (storageErr) {
            console.error('Could not determine publication file storage path:', storageErr);
          }
        }

        // Delete the cover from Supabase Storage Publications bucket
        if (publication.coverUrl && publication.coverUrl.includes(marker)) {
          try {
            const url = new URL(publication.coverUrl);
            const storagePath = decodeURIComponent(url.pathname.split(marker)[1]);
            if (storagePath) {
              const { error: coverStorageError } = await supabase.storage
                .from('Publications')
                .remove([storagePath]);

              if (coverStorageError) {
                console.error('Failed to delete cover file from Storage:', coverStorageError);
              }
            }
          } catch (coverErr) {
            console.error('Could not determine cover file storage path:', coverErr);
          }
        }

        // Delete row from Supabase `publications` table
        const { error: dbErr } = await supabase
          .from('publications')
          .delete()
          .eq('id', id);

        if (dbErr) {
          console.error('Failed to delete publication from database:', dbErr);
          alert(`Database deletion failed: ${dbErr.message}`);
          return;
        }
      }

      // Update state immediately
      setPublicationsList(prev => prev.filter(p => p.id !== id));
      window.dispatchEvent(new Event('gec_publications_updated'));

      console.log('Publication deleted successfully:', id);
    } catch (err: any) {
      console.error('Failed to delete publication:', err);
      alert(`Failed to delete publication: ${err?.message || 'Please try again'}`);
    }
  };

  const handleDeleteAllPublications = async () => {
    if (!confirm('Are you sure you want to delete and clear ALL publications from the catalog?')) return;

    try {
      if (isSupabaseConfigured && supabase) {
        const marker = '/storage/v1/object/public/Publications/';

        // Remove files from Publications bucket
        for (const pub of publicationsList) {
          if (pub.fileUrl && pub.fileUrl.includes(marker)) {
            try {
              const url = new URL(pub.fileUrl);
              const storagePath = decodeURIComponent(url.pathname.split(marker)[1]);
              if (storagePath) {
                await supabase.storage.from('Publications').remove([storagePath]);
              }
            } catch (e) {
              // Ignore individual storage file removal errors
            }
          }

          if (pub.coverUrl && pub.coverUrl.includes(marker)) {
            try {
              const url = new URL(pub.coverUrl);
              const storagePath = decodeURIComponent(url.pathname.split(marker)[1]);
              if (storagePath) {
                await supabase.storage.from('Publications').remove([storagePath]);
              }
            } catch (e) {
              // Ignore individual storage file removal errors
            }
          }
        }

        // Delete all records from `publications` database table
        const { error: dbErr } = await supabase
          .from('publications')
          .delete()
          .neq('id', '');

        if (dbErr) {
          console.error('Failed to clear publications from database:', dbErr);
          alert(`Database clear failed: ${dbErr.message}`);
          return;
        }
      }

      setPublicationsList([]);
      window.dispatchEvent(new Event('gec_publications_updated'));
      alert('All publications cleared from the catalog successfully.');
    } catch (e: any) {
      console.error('Error clearing publications:', e);
      alert(`Failed to clear publications: ${e?.message || 'Error occurred'}`);
    }
  };

// =========================================================
// SONG HANDLERS — Songs table + Songs storage only (Single Source of Truth)
// =========================================================

// Add Song Handler
const handleAddSong = async (e: React.FormEvent) => {
  e.preventDefault();
  setSongError(null);
  setSongSuccess(null);

  if (!songTitle.trim()) {
    setSongError('Song title is required.');
    return;
  }

  if (!songFile && !songAudioUrl.trim()) {
    setSongError('Please select an audio file or provide an audio URL.');
    return;
  }

  if (!isSupabaseConfigured || !supabase) {
    setSongError('Supabase is not configured.');
    return;
  }

  // Refresh active Supabase Auth session
  if (supabase?.auth) {
    try {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      if (activeSession?.user) {
        setSession(activeSession);
      }
    } catch (sessErr) {
      console.warn('Could not retrieve active session for songs:', sessErr);
    }
  }

  setUploadingSong(true);
  setSongUploadProgress(15);

  let finalAudioUrl = songAudioUrl.trim();
  let detectedDuration = '4:30';
  let uploadedFilePath: string | null = null;

  try {
    // 1. Detect audio duration
    if (songFile) {
      try {
        const objectUrl = URL.createObjectURL(songFile);
        const tempAudio = new Audio(objectUrl);

        await new Promise<void>((resolve) => {
          let resolved = false;

          const finish = () => {
            if (resolved) return;
            resolved = true;
            URL.revokeObjectURL(objectUrl);
            resolve();
          };

          tempAudio.onloadedmetadata = () => {
            if (tempAudio.duration && !isNaN(tempAudio.duration)) {
              const mins = Math.floor(tempAudio.duration / 60);
              const secs = Math.floor(tempAudio.duration % 60);
              detectedDuration = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            }
            finish();
          };

          tempAudio.onerror = finish;
          setTimeout(finish, 2000);
        });
      } catch (durationError) {
        console.warn('Could not read audio duration:', durationError);
      }

      // 2. Upload to SONGS bucket
      setSongUploadProgress(35);

      const fileExt = songFile.name.split('.').pop()?.toLowerCase() || 'mp3';
      const safeFileName = songFile.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .toLowerCase();
      const fileName = `song-${Date.now()}-${safeFileName}.${fileExt}`;
      uploadedFilePath = `songs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('Songs')
        .upload(uploadedFilePath, songFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: songFile.type || 'audio/mpeg'
        });

      if (uploadError) {
        throw new Error(`Song audio upload failed: ${uploadError.message}`);
      }

      // 3. Get public URL
      const {
        data: { publicUrl }
      } = supabase.storage.from('Songs').getPublicUrl(uploadedFilePath);

      if (!publicUrl) {
        throw new Error('Could not generate a public URL for the uploaded song.');
      }

      finalAudioUrl = publicUrl;
      setSongUploadProgress(65);
    }

    if (!finalAudioUrl) {
      throw new Error('No valid audio URL was obtained.');
    }

    // 4. INSERT INTO SONGS TABLE
    setSongUploadProgress(80);

    const { data: insertedSong, error: dbErr } = await supabase
      .from('Songs')
      .insert([
        {
          title: songTitle.trim(),
          artist: songArtist.trim() || 'Crossworship',
          album: songAlbum.trim() || 'Edifice Anthem Single',
          duration: detectedDuration,
          description:
            songLyrics.trim() ||
            `[00:00] ${songTitle.trim()}\n[00:15] Worship the Lord in the beauty of holiness.`,
          artwork:
            songCoverUrl.trim() ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop',
          audio_url: finalAudioUrl,
          downloads: 0
        }
      ])
      .select()
      .single();

    if (dbErr) {
      // Clean up uploaded audio if DB insertion fails
      if (uploadedFilePath) {
        try {
          await supabase.storage.from('Songs').remove([uploadedFilePath]);
        } catch (cleanupErr) {
          console.warn('Could not clean up uploaded song file:', cleanupErr);
        }
      }

      const isRls = dbErr.code === '42501' || dbErr.message?.toLowerCase().includes('row-level security');
      if (isRls) {
        setSongError('RLS_POLICY_ERROR');
      } else {
        setSongError(`Song database insert failed: ${dbErr.message}`);
      }
      setUploadingSong(false);
      setSongUploadProgress(0);
      return;
    }

    // 5. Clean up stale localStorage
    try {
      localStorage.removeItem('gec_user_uploaded_songs');
      localStorage.removeItem('gec_songs_catalog');
    } catch (e) {
      // Ignore
    }

    // 6. Refresh catalog from Supabase
    await fetchCloudSongs();

    window.dispatchEvent(new Event('gec_songs_updated'));

    // 7. Reset form
    setSongTitle('');
    setSongArtist('');
    setSongAlbum('');
    setSongCoverUrl('');
    setSongLyrics('');
    setSongAudioUrl('');
    setSongFile(null);

    if (songFileInputRef.current) {
      songFileInputRef.current.value = '';
    }

    setUploadingSong(false);
    setSongUploadProgress(100);
    setSongSuccess(`Song "${insertedSong?.title || songTitle}" uploaded and saved successfully!`);

    setTimeout(() => {
      setSongUploadProgress(0);
    }, 1000);

  } catch (err: any) {
    setSongError(err?.message || 'Song upload failed.');
    setUploadingSong(false);
    setSongUploadProgress(0);
  }
};


// =========================================================
// DELETE ONE SONG (Removes from Songs Storage + Songs Table)
// =========================================================

const handleDeleteSong = async (id: string) => {
  if (!confirm('Are you sure you want to delete this song? This will remove the audio file from storage and the record from the Songs database.')) {
    return;
  }

  if (!isSupabaseConfigured || !supabase) {
    alert('Supabase is not configured.');
    return;
  }

  setDeletingSongId(id);

  try {
    // 1. Get the song first to extract audio storage path
    const { data: song, error: fetchError } = await supabase
      .from('Songs')
      .select('id, title, audio_url')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.warn('Warning fetching song record before delete:', fetchError);
    }

    // 2. Remove storage file from Songs bucket
    const audioUrl = song?.audio_url || songsList.find(s => s.id === id)?.audioUrl;
    if (audioUrl) {
      let storagePath = '';
      const marker = '/storage/v1/object/public/Songs/';
      if (audioUrl.includes(marker)) {
        storagePath = audioUrl.split(marker)[1];
      } else if (audioUrl.includes('/Songs/')) {
        storagePath = audioUrl.split('/Songs/')[1];
      }
      if (storagePath) {
        storagePath = storagePath.split('?')[0];
        const { error: storageError } = await supabase.storage
          .from('Songs')
          .remove([storagePath]);

        if (storageError) {
          console.warn('Could not remove file from Songs bucket:', storageError);
        }
      }
    }

    // 3. Delete database row from Songs table
    const { error: deleteError } = await supabase
      .from('Songs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete song row from database:', deleteError);
      alert(`Failed to delete song from database: ${deleteError.message}`);
      return;
    }

    // 4. Remove stale localStorage
    try {
      localStorage.removeItem('gec_user_uploaded_songs');
      localStorage.removeItem('gec_songs_catalog');
    } catch (e) {
      // Ignore
    }

    // 5. Refresh from Supabase
    await fetchCloudSongs();

    window.dispatchEvent(new Event('gec_songs_updated'));

    alert('Song deleted successfully.');

  } catch (err: any) {
    console.error('Error deleting song:', err);
    alert(`Error deleting song: ${err?.message || err}`);
  } finally {
    setDeletingSongId(null);
  }
};


// =========================================================
// DELETE ALL SONGS (Removes all files from Songs Bucket + Songs Table)
// =========================================================

const handleDeleteAllSongs = async () => {
  if (!confirm('Are you sure you want to delete ALL songs? This will permanently remove every song and audio file from the Songs storage and database table.')) {
    return;
  }

  if (!isSupabaseConfigured || !supabase) {
    alert('Supabase is not configured.');
    return;
  }

  try {
    // 1. Fetch all existing songs to identify storage files
    const { data: allSongs, error: fetchError } = await supabase
      .from('Songs')
      .select('id, audio_url');

    if (fetchError) {
      console.error('Failed to fetch songs for deletion:', fetchError);
      alert(`Failed to fetch songs list: ${fetchError.message}`);
      return;
    }

    if (allSongs && allSongs.length > 0) {
      // 2. Remove all audio files from Songs storage bucket
      const filePaths: string[] = [];
      const marker = '/storage/v1/object/public/Songs/';
      for (const s of allSongs) {
        if (s.audio_url) {
          let p = '';
          if (s.audio_url.includes(marker)) {
            p = s.audio_url.split(marker)[1]?.split('?')[0] || '';
          } else if (s.audio_url.includes('/Songs/')) {
            p = s.audio_url.split('/Songs/')[1]?.split('?')[0] || '';
          }
          if (p) filePaths.push(p);
        }
      }

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('Songs')
          .remove(filePaths);

        if (storageError) {
          console.warn('Warning deleting storage files:', storageError);
        }
      }

      // 3. Delete all rows from Songs database table
      const ids = allSongs.map(s => s.id);
      const { error: dbDeleteError } = await supabase
        .from('Songs')
        .delete()
        .in('id', ids);

      if (dbDeleteError) {
        console.error('Failed to delete songs from database:', dbDeleteError);
        alert(`Failed to delete songs from database: ${dbDeleteError.message}`);
        return;
      }
    }

    // 4. Clear state & stale storage
    setSongsList([]);
    try {
      localStorage.removeItem('gec_user_uploaded_songs');
      localStorage.removeItem('gec_songs_catalog');
    } catch (e) {
      // Ignore
    }

    // 5. Refresh from Supabase
    await fetchCloudSongs();

    window.dispatchEvent(new Event('gec_songs_updated'));

    alert('All songs deleted successfully.');

  } catch (err: any) {
    console.error('Error deleting songs:', err);
    alert(`Error deleting songs: ${err?.message || err}`);
  }
};


// =========================================================
// RESET SONGS (Wipes Songs database + Storage)
// =========================================================

const handleResetDefaultSongs = async () => {
  await handleDeleteAllSongs();
};

  // Add Gallery Handler
  const handleAddGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryTitle || !galleryImageUrl) {
      alert('Title and Image URL are required.');
      return;
    }
    const newItem: GalleryItem = {
      id: `gallery-${Date.now()}`,
      title: galleryTitle.trim(),
      description: galleryDesc.trim() || 'God’s Edifice Church dynamic moment.',
      category: galleryCategory,
      imageUrl: galleryImageUrl.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [newItem, ...galleryList];
    setGalleryList(updated);
    localStorage.setItem('gec_user_uploaded_gallery', JSON.stringify(updated));

    // Reset Form
    setGalleryTitle('');
    setGalleryDesc('');
    setGalleryCategory('Worship');
    setGalleryImageUrl('');
    alert('Gallery image uploaded successfully!');
  };

  // Delete Gallery Handler
  const handleDeleteGallery = (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery image?')) return;
    const updated = galleryList.filter(item => item.id !== id);
    setGalleryList(updated);
    localStorage.setItem('gec_user_uploaded_gallery', JSON.stringify(updated));
  };

  // Add Event Handler
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitleInput || !eventDateInput) {
      alert('Event title and date are required.');
      return;
    }
    const newEvent: ChurchEvent = {
      id: `event-${Date.now()}`,
      title: eventTitleInput.trim(),
      date: eventDateInput.trim(),
      time: eventTimeInput.trim() || '06:00 PM',
      location: eventLocationInput.trim() || 'GEC Lekki HQ',
      mode: eventModeInput,
      banner: eventBannerInput.trim() || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
      description: eventDescriptionInput.trim() || 'GEC centerpiece apostolic meeting.',
      speaker: eventSpeakerInput.trim() || 'Pastor Abiodun Adebayo',
      registeredCount: 0
    };

    const updated = [newEvent, ...eventsList];
    setEventsList(updated);
    localStorage.setItem('gec_upcoming_meetings', JSON.stringify(updated));

    // Reset Form
    setEventTitleInput('');
    setEventDateInput('');
    setEventTimeInput('');
    setEventLocationInput('');
    setEventModeInput('physical');
    setEventBannerInput('');
    setEventDescriptionInput('');
    setEventSpeakerInput('');
    alert('Meeting created successfully!');
  };

  // Delete Event Handler
  const handleDeleteEvent = (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const updated = eventsList.filter(ev => ev.id !== id);
    setEventsList(updated);
    localStorage.setItem('gec_upcoming_meetings', JSON.stringify(updated));
  };

  // Save Site Settings Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gec_setting_church_name', churchNameSetting.trim());
    localStorage.setItem('gec_setting_pastor', residentPastorSetting.trim());
    localStorage.setItem('gec_setting_pastor_photo', pastorPhotoSetting.trim());
    localStorage.setItem('gec_setting_email', contactEmailSetting.trim());
    localStorage.setItem('gec_setting_phone', contactPhoneSetting.trim());
    alert('Site settings saved successfully!');
  };

  // SQL Script text to render with secure, strict RLS & Storage policies
  const sqlSetupScript = `-- =========================================================================
-- GOD'S EDIFICE CHURCH - SECURE SUPABASE SQL SCHEMA & RLS SETUP
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =========================================================================

-- 1. Create Subscribers Table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Standard Registrations Table
CREATE TABLE IF NOT EXISTS public.registrations (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    address TEXT,
    status TEXT DEFAULT 'Registered'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Conference Meeting Registrations Table (Edifice Conference Source of Truth)
CREATE TABLE IF NOT EXISTS public.meeting_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    address TEXT,
    nearest_branch TEXT,
    age TEXT,
    expecations_prayer_request TEXT,
    gender TEXT,
    how_you_heard TEXT,
    meeting_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Teachings & Songs Table (category = 'Song' for songs, 'Sermon' for teachings)
CREATE TABLE IF NOT EXISTS public.teachings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    speaker TEXT NOT NULL,
    category TEXT DEFAULT 'Sermon'::text,
    duration TEXT,
    date DATE NOT NULL,
    audio_url TEXT NOT NULL,
    cover_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Profiles Table with User Roles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Helper Function to Check Admin Role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'boluakintola@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Row Trigger: Default new signups to role = 'user' (admin assigned explicitly or for designated email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id, 
    new.email, 
    CASE 
      WHEN new.email = 'boluakintola@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email,
      role = CASE 
        WHEN public.profiles.email = 'boluakintola@gmail.com' THEN 'admin'
        ELSE public.profiles.role 
      END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure primary administrator email has role = 'admin'
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'boluakintola@gmail.com';

-- 8. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- SECURE POLICIES
-- =========================================================================

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile or admin reads all" ON public.profiles;
CREATE POLICY "Users can read own profile or admin reads all" 
ON public.profiles FOR SELECT TO authenticated 
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE TO authenticated 
USING (auth.uid() = id);

-- 1. meeting_registrations Policies:
-- Public/anon users may INSERT. Admin only may SELECT, UPDATE, DELETE.
DROP POLICY IF EXISTS "Allow public insert meeting_registrations" ON public.meeting_registrations;
CREATE POLICY "Allow public insert meeting_registrations" 
ON public.meeting_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select meeting_registrations" ON public.meeting_registrations;
DROP POLICY IF EXISTS "Allow admin select meeting_registrations" ON public.meeting_registrations;
CREATE POLICY "Allow admin select meeting_registrations" 
ON public.meeting_registrations FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Allow admin update meeting_registrations" ON public.meeting_registrations;
CREATE POLICY "Allow admin update meeting_registrations" 
ON public.meeting_registrations FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow public delete meeting_registrations" ON public.meeting_registrations;
DROP POLICY IF EXISTS "Allow admin delete meeting_registrations" ON public.meeting_registrations;
CREATE POLICY "Allow admin delete meeting_registrations" 
ON public.meeting_registrations FOR DELETE TO authenticated USING (public.is_admin());

-- 2. registrations Policies:
-- Public/anon users may INSERT. Admin only may SELECT, UPDATE, DELETE.
DROP POLICY IF EXISTS "Allow public insert registrations" ON public.registrations;
CREATE POLICY "Allow public insert registrations" 
ON public.registrations FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow admin select registrations" ON public.registrations;
CREATE POLICY "Allow admin select registrations" 
ON public.registrations FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Allow admin update registrations" ON public.registrations;
CREATE POLICY "Allow admin update registrations" 
ON public.registrations FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow public delete registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow admin delete registrations" ON public.registrations;
CREATE POLICY "Allow admin delete registrations" 
ON public.registrations FOR DELETE TO authenticated USING (public.is_admin());

-- 3. subscribers Policies:
-- Public users may INSERT. Admin only may SELECT, DELETE.
DROP POLICY IF EXISTS "Allow public insert subscribers" ON public.subscribers;
CREATE POLICY "Allow public insert subscribers" 
ON public.subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow admin select subscribers" ON public.subscribers;
CREATE POLICY "Allow admin select subscribers" 
ON public.subscribers FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Allow public delete subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow admin delete subscribers" ON public.subscribers;
CREATE POLICY "Allow admin delete subscribers" 
ON public.subscribers FOR DELETE TO authenticated USING (public.is_admin());

-- 4. teachings Policies:
-- Public users may SELECT. Admin only may INSERT, UPDATE, DELETE.
DROP POLICY IF EXISTS "Allow public select teachings" ON public.teachings;
CREATE POLICY "Allow public select teachings" 
ON public.teachings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public insert teachings" ON public.teachings;
DROP POLICY IF EXISTS "Allow admin insert teachings" ON public.teachings;
CREATE POLICY "Allow admin insert teachings" 
ON public.teachings FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow admin update teachings" ON public.teachings;
CREATE POLICY "Allow admin update teachings" 
ON public.teachings FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow public delete teachings" ON public.teachings;
DROP POLICY IF EXISTS "Allow admin delete teachings" ON public.teachings;
CREATE POLICY "Allow admin delete teachings" 
ON public.teachings FOR DELETE TO authenticated USING (public.is_admin());

-- 5. Storage Bucket & Policies: "Teachings"
INSERT INTO storage.buckets (id, name, public) 
VALUES ('Teachings', 'Teachings', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public storage inserts" ON storage.objects;
DROP POLICY IF EXISTS "Allow public storage select" ON storage.objects;
DROP POLICY IF EXISTS "Allow public storage delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select storage Teachings" ON storage.objects;
CREATE POLICY "Allow public select storage Teachings" 
ON storage.objects FOR SELECT TO anon, authenticated, public 
USING (bucket_id = 'Teachings');

DROP POLICY IF EXISTS "Allow admin insert storage Teachings" ON storage.objects;
CREATE POLICY "Allow admin insert storage Teachings" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'Teachings' AND public.is_admin());

DROP POLICY IF EXISTS "Allow admin update storage Teachings" ON storage.objects;
CREATE POLICY "Allow admin update storage Teachings" 
ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'Teachings' AND public.is_admin())
WITH CHECK (bucket_id = 'Teachings' AND public.is_admin());

DROP POLICY IF EXISTS "Allow admin delete storage Teachings" ON storage.objects;
CREATE POLICY "Allow admin delete storage Teachings" 
ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'Teachings' AND public.is_admin());
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSetupScript);
    alert('SQL script copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-soft-white py-12 px-4 sm:px-6 z-50 relative" id="crosswordmedia-root">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-[#0e162d]/40 to-transparent pointer-events-none blur-3xl" />
      <div className="absolute top-1/4 right-10 w-[300px] h-[300px] rounded-full bg-royal-blue/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[350px] h-[350px] rounded-full bg-cci-gold-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Navigation back */}
        <div className="flex justify-between items-center mb-10 border-b border-midnight-blue pb-6">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-mono tracking-wider text-light-gray hover:text-white transition-all bg-midnight-blue/40 hover:bg-midnight-blue/80 px-4 py-2 rounded-xl border border-midnight-blue/50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>BACK TO WEBSITE</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cci-gold-500 animate-pulse" />
            <h1 className="font-display font-black text-lg tracking-widest text-white uppercase">
              GEC <span className="text-cci-gold-400">MEDIA HUB</span>
            </h1>
          </div>
        </div>

        {/* --- UNCONFIGURED FALLBACK UI --- */}
        {!isSupabaseConfigured && (
          <div className="max-w-2xl mx-auto bg-charcoal/50 border border-amber-500/30 rounded-3xl p-8 text-center backdrop-blur-md shadow-2xl mt-12">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
            <h2 className="font-display font-bold text-2xl text-soft-white tracking-tight">
              Supabase Connection Required
            </h2>
            <p className="text-sm text-light-gray mt-4 leading-relaxed">
              To utilize the hidden admin dashboard, you need to link your Supabase account.
              Please add the following variables under the **Settings & Secrets** panel in AI Studio:
            </p>
            <div className="bg-rich-black/90 p-4 rounded-xl border border-midnight-blue text-left font-mono text-xs text-amber-400/90 mt-6 space-y-2 select-all">
              <div>VITE_SUPABASE_URL=your-supabase-project-url</div>
              <div>VITE_SUPABASE_ANON_KEY=your-supabase-anon-key</div>
            </div>
            <p className="text-xs text-slate-450 mt-4 font-mono">
              (After setting the variables, please reload or wait for the system to redeploy).
            </p>
          </div>
        )}

        {/* --- SUPABASE CONFIGURED: AUTH LAYER --- */}
        {isSupabaseConfigured && checkingAuth && (
          <div className="flex flex-col justify-center items-center h-[50vh]">
            <Loader2 className="h-10 w-10 text-cci-gold-400 animate-spin" />
            <p className="text-xs text-light-gray mt-4 font-mono">Verifying apostolic secure session...</p>
          </div>
        )}

        {isSupabaseConfigured && !checkingAuth && !session && (
          <div className="max-w-md mx-auto bg-charcoal/45 border border-midnight-blue rounded-3xl p-8 sm:p-10 backdrop-blur-md shadow-2xl mt-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-midnight-blue/55 border border-electric-blue/30 flex items-center justify-center mx-auto mb-4 text-electric-blue shadow-inner">
                <Key className="h-7 w-7" />
              </div>
              <h2 className="font-display font-bold text-2xl text-white">
                Admin Authentication
              </h2>
              <p className="text-xs text-light-gray mt-2">
                Sign in with Supabase Auth to access GEC crosswordmedia management portal.
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-medium-gray" />
                  <input
                    type="email"
                    required
                    placeholder="admin@gacedifice.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-medium-gray" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 pl-10 pr-10 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-medium-gray hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-[11px] text-red-400 font-mono">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-royal-blue to-electric-blue hover:from-electric-blue hover:to-royal-blue font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-white disabled:opacity-50 mt-6 shadow-lg shadow-royal-blue/20"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Secure Alignment...</span>
                  </>
                ) : (
                  <span>{authMode === 'login' ? 'Sign In' : 'Register Admin'}</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-[11px] text-cci-gold-400 hover:text-cci-gold-300 font-mono"
              >
                {authMode === 'login' 
                  ? "Don't have an admin account? Register one" 
                  : "Already registered? Sign in instead"}
              </button>
            </div>
          </div>
        )}

        {/* --- EXPLICIT SECURITY LAYER: AUTHENTICATED BUT NOT ADMIN --- */}
        {isSupabaseConfigured && !checkingAuth && session && !isAdminUser && (
          <div className="max-w-md mx-auto bg-charcoal/45 border border-red-500/30 rounded-3xl p-8 sm:p-10 text-center backdrop-blur-md shadow-2xl mt-10">
            <AlertCircle className="h-14 w-14 text-red-400 mx-auto mb-6" />
            <h2 className="font-display font-bold text-2xl text-white">
              Access Restricted
            </h2>
            <p className="text-xs text-light-gray mt-3 leading-relaxed">
              Your account (**{session.user.email}**) is successfully authenticated, but you do not possess the required **Admin** role privileges in our database.
            </p>
            <p className="text-xs text-slate-400 mt-4 font-sans italic">
              (Note: For immediate development access, logging in with email **boluakintola@gmail.com** bypasses this check, or you can run the provided database setup script in your SQL editor).
            </p>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 rounded-xl border border-midnight-blue hover:bg-midnight-blue text-xs font-semibold text-soft-white transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
              <button
                onClick={() => setActiveSubTab('database')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-royal-blue to-electric-blue hover:from-electric-blue hover:to-royal-blue text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-1.5"
              >
                <Database className="h-3.5 w-3.5" />
                <span>See SQL Script</span>
              </button>
            </div>

            {/* Render Database Setup Script inside restriction page for easy config */}
            <AnimatePresence>
              {activeSubTab === 'database' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-left mt-8 bg-rich-black/95 p-4 rounded-xl border border-midnight-blue"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">PostgreSQL Setup</span>
                    <button onClick={copyToClipboard} className="text-[10px] font-mono text-cci-gold-400 hover:text-cci-gold-300 flex items-center gap-1 bg-midnight-blue/40 px-2 py-1 rounded">
                      <Clipboard className="h-3 w-3" /> Copy
                    </button>
                  </div>
                  <pre className="text-[9px] font-mono text-slate-400 max-h-[160px] overflow-y-auto whitespace-pre-wrap select-all leading-normal">
                    {sqlSetupScript}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* --- FULLY AUTHORIZED ADMIN DASHBOARD --- */}
        {isSupabaseConfigured && !checkingAuth && session && isAdminUser && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-4">
            
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 space-y-3">
              <div className="bg-[#131B2E] border-2 border-[#2A3756] rounded-2xl p-4 sm:p-5 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-widest">Active Admin</div>
                    <div className="text-sm text-white font-bold truncate font-sans">{session.user.email}</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => setActiveSubTab('overview')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-3 transition-all cursor-pointer ${
                      activeSubTab === 'overview' 
                        ? 'bg-blue-600 text-white shadow-md border-l-4 border-amber-400' 
                        : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 text-amber-300" />
                    <span>DASHBOARD OVERVIEW</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('analytics')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-3 transition-all cursor-pointer ${
                      activeSubTab === 'analytics' 
                        ? 'bg-blue-600 text-white shadow-md border-l-4 border-amber-400' 
                        : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 text-amber-300" />
                    <span>DATA ANALYTICS</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('songs')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-3 transition-all cursor-pointer ${
                      activeSubTab === 'songs' 
                        ? 'bg-blue-600 text-white shadow-md border-l-4 border-amber-400' 
                        : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                    }`}
                  >
                    <Music className="h-4 w-4 text-sky-400" />
                    <span>UPLOAD SONGS ({songsList.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('teachings')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-3 transition-all cursor-pointer ${
                      activeSubTab === 'teachings' 
                        ? 'bg-blue-600 text-white shadow-md border-l-4 border-amber-400' 
                        : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                    }`}
                  >
                    <FileText className="h-4 w-4 text-sky-400" />
                    <span>UPLOAD TEACHINGS ({teachings.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('publications')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-3 transition-all cursor-pointer ${
                      activeSubTab === 'publications' 
                        ? 'bg-blue-600 text-white shadow-md border-l-4 border-amber-400' 
                        : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                    }`}
                  >
                    <BookOpen className="h-4 w-4 text-amber-400" />
                    <span>PUBLICATIONS ({publicationsList.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('gallery')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-3 transition-all cursor-pointer ${
                      activeSubTab === 'gallery' 
                        ? 'bg-blue-600 text-white shadow-md border-l-4 border-amber-400' 
                        : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                    }`}
                  >
                    <ImageIcon className="h-4 w-4 text-sky-400" />
                    <span>UPLOAD GALLERY ({galleryList.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('events')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-3 transition-all cursor-pointer ${
                      activeSubTab === 'events' 
                        ? 'bg-blue-600 text-white shadow-md border-l-4 border-amber-400' 
                        : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                    }`}
                  >
                    <Calendar className="h-4 w-4 text-sky-400" />
                    <span>MANAGE EVENTS ({eventsList.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('registrations')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-3 transition-all cursor-pointer ${
                      activeSubTab === 'registrations' 
                        ? 'bg-blue-600 text-white shadow-md border-l-4 border-amber-400' 
                        : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                    }`}
                  >
                    <Users className="h-4 w-4 text-emerald-400" />
                    <span>DATA BOARDS & REGS ({registrations.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('subscribers')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-3 transition-all cursor-pointer ${
                      activeSubTab === 'subscribers' 
                        ? 'bg-blue-600 text-white shadow-md border-l-4 border-amber-400' 
                        : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 text-emerald-400" />
                    <span>SUBSCRIBERS ({subscribers.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('settings')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-3 transition-all cursor-pointer ${
                      activeSubTab === 'settings' 
                        ? 'bg-blue-600 text-white shadow-md border-l-4 border-amber-400' 
                        : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                    }`}
                  >
                    <Settings className="h-4 w-4 text-purple-400" />
                    <span>SITE SETTINGS</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('database')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-3 transition-all cursor-pointer ${
                      activeSubTab === 'database' 
                        ? 'bg-blue-600 text-white shadow-md border-l-4 border-amber-400' 
                        : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                    }`}
                  >
                    <Database className="h-4 w-4 text-purple-400" />
                    <span>DATABASE SETUP</span>
                  </button>
                </div>

                <div className="mt-8 pt-4 border-t border-[#2A3756]">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-red-400 hover:bg-red-950/50 flex items-center gap-3 transition-all cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>SIGN OUT ADMIN</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard Content Window */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Overview Tab */}
              {activeSubTab === 'overview' && (
                <div className="space-y-6">
                  {/* Visual Analytics Dashboard with Recharts */}
                  <AdminAnalyticsDashboard
                    registrations={registrations}
                    rawMeetingRegistrations={rawMeetingRegistrations}
                    loading={dataLoading}
                    onRefresh={fetchDashboardData}
                    onExportCsv={handleExportMeetingRegistrationsCSV}
                    exportingCsv={exportingCsv}
                  />

                  {/* Information block */}
                  <div className="bg-[#131B2E] border-2 border-[#2A3756] p-6 rounded-2xl shadow-xl">
                    <h3 className="font-display font-bold text-lg text-white mb-2">
                      Supabase Integrated Backend Active
                    </h3>
                    <p className="text-sm font-medium text-[#CBD5E1] leading-relaxed max-w-2xl">
                      Welcome to the Crossword Media Administration console. Use the sidebar sections to upload new sermons directly to Supabase storage buckets, sync teachings to the PostgreSQL database, manage attendees, and view live registration trends.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4">
                      <button 
                        onClick={() => setActiveSubTab('analytics')} 
                        className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-sky-500 hover:to-blue-600 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <BarChart3 className="h-4 w-4 text-amber-300" /> Full Visual Analytics
                      </button>
                      <button 
                        onClick={handleExportMeetingRegistrationsCSV}
                        disabled={exportingCsv}
                        className="py-2.5 px-4 rounded-xl bg-[#0A0E1A] hover:bg-[#1E293B] border-2 border-[#2A3756] text-xs font-mono font-bold text-amber-300 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        title="Export all meeting_registrations records from Supabase"
                      >
                        {exportingCsv ? (
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          <Download className="h-4 w-4 text-emerald-400" />
                        )}
                        <span>Export CSV (meeting_registrations)</span>
                      </button>
                      <button 
                        onClick={() => setActiveSubTab('registrations')} 
                        className="py-2.5 px-4 rounded-xl bg-[#1E293B] hover:bg-[#2A3756] border-2 border-[#2A3756] text-xs font-semibold text-white transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Users className="h-4 w-4 text-sky-400" /> View Attendees List
                      </button>
                      <button 
                        onClick={() => setActiveSubTab('database')} 
                        className="py-2.5 px-4 rounded-xl bg-[#1E293B] hover:bg-[#2A3756] border-2 border-[#2A3756] text-xs font-semibold text-white transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Database className="h-4 w-4 text-purple-400" /> Schema Management
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dedicated Data Analytics Tab */}
              {activeSubTab === 'analytics' && (
                <AdminAnalyticsDashboard
                  registrations={registrations}
                  rawMeetingRegistrations={rawMeetingRegistrations}
                  loading={dataLoading}
                  onRefresh={fetchDashboardData}
                  onExportCsv={handleExportMeetingRegistrationsCSV}
                  exportingCsv={exportingCsv}
                />
              )}

              {/* Songs Tab */}
              {activeSubTab === 'songs' && (
                <div className="space-y-6">
                  {/* Upload Song Form */}
                  <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-6 border-b border-midnight-blue pb-4">
                      <Music className="h-5 w-5 text-cci-gold-400" />
                      <h3 className="font-display font-bold text-lg text-white">
                        Upload & Publish New Song / Chants
                      </h3>
                    </div>

                    <form onSubmit={handleAddSong} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Song / Chant Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="E.g., Apostolic Chants: Flowing in the Spirit"
                            value={songTitle}
                            onChange={(e) => setSongTitle(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Artist / Leader
                          </label>
                          <input
                            type="text"
                            placeholder="E.g., Crossworship (Default)"
                            value={songArtist}
                            onChange={(e) => setSongArtist(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Album / Collection Name
                          </label>
                          <input
                            type="text"
                            placeholder="E.g., Spirit-Led Chants Vol. 1"
                            value={songAlbum}
                            onChange={(e) => setSongAlbum(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Cover Image URL (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            value={songCoverUrl}
                            onChange={(e) => setSongCoverUrl(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Upload Audio File from Device
                          </label>
                          <input
                            type="file"
                            accept="audio/*"
                            ref={songFileInputRef}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setSongFile(e.target.files[0]);
                              }
                            }}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-2 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all file:mr-4 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-mono file:font-semibold file:bg-cci-gold-600 file:text-black hover:file:bg-cci-gold-500 cursor-pointer"
                          />
                          {songFile && (
                            <p className="text-[10px] text-cci-gold-400 mt-1.5 font-mono">
                              ✓ Selected: {songFile.name} ({(songFile.size / (1024 * 1024)).toFixed(2)} MB)
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            OR: Audio Stream URL (Fallback if no file chosen)
                          </label>
                          <input
                            type="text"
                            placeholder="E.g., https://example.com/audio.mp3"
                            value={songAudioUrl}
                            onChange={(e) => setSongAudioUrl(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                          Lyrics (Optional)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="[00:00] We lift our voice to praise..."
                          value={songLyrics}
                          onChange={(e) => setSongLyrics(e.target.value)}
                          className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                        />
                      </div>

                      {uploadingSong && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-mono text-cci-gold-400">
                            <span>Uploading audio dynamic files...</span>
                            <span>{songUploadProgress}%</span>
                          </div>
                          <div className="w-full bg-rich-black h-1.5 rounded-full overflow-hidden border border-midnight-blue">
                            <div 
                              className="bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 h-full rounded-full transition-all duration-300"
                              style={{ width: `${songUploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {songSuccess && (
                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-400 font-mono">
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{songSuccess}</span>
                        </div>
                      )}

                      {songError && songError === 'RLS_POLICY_ERROR' && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-2.5">
                          <div className="flex items-start gap-2 text-amber-400 font-bold">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>Database Row-Level Security (RLS) Policy Notice</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Supabase rejected the insert because Row-Level Security (RLS) is active on table <code className="text-amber-400 bg-rich-black px-1.5 py-0.5 rounded font-mono">Songs</code> without an insert policy.
                          </p>
                          <div className="bg-rich-black/90 p-3 rounded-lg border border-midnight-blue space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                              <span>Run in Supabase SQL Editor:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('ALTER TABLE public."Songs" ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "Allow all operations for Songs" ON public."Songs" FOR ALL USING (true) WITH CHECK (true);');
                                  setCopiedSongSql(true);
                                  setTimeout(() => setCopiedSongSql(false), 2500);
                                }}
                                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                              >
                                {copiedSongSql ? '✓ Copied!' : 'Copy SQL'}
                              </button>
                            </div>
                            <pre className="text-[10px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
{`ALTER TABLE public."Songs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for Songs" ON public."Songs" FOR ALL USING (true) WITH CHECK (true);`}
                            </pre>
                          </div>
                        </div>
                      )}

                      {songError && songError !== 'RLS_POLICY_ERROR' && (
                        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-xs text-red-400 font-mono">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{songError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={uploadingSong}
                        className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-royal-blue to-electric-blue text-xs font-bold uppercase tracking-wider text-white hover:opacity-95 transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                      >
                        {uploadingSong ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Uploading files and recording...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            <span>Add Song</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* List of Custom Songs */}
                  <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                          <span>Songs & Anthems Catalog ({songsList.length})</span>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Live on Website</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Manage worship tracks, uploaded singles, and minister anthems.</p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {songsList.length > 0 && (
                          <button
                            onClick={handleDeleteAllSongs}
                            className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Delete all songs from website"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete All Songs</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {songsList.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-slate-700/60 rounded-xl px-4">
                        <Music className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-300">Catalog is currently empty</p>
                        <p className="text-[11px] text-slate-400 mt-1">Use the upload form above to add new audio songs and worship tracks to the website.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {songsList.map((song) => (
                          <div key={song.id} className="bg-rich-black/50 border border-midnight-blue rounded-xl p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <img src={song.coverUrl} className="w-12 h-12 rounded-lg object-cover border border-midnight-blue shrink-0" alt={song.title} referrerPolicy="no-referrer" />
                              <div className="overflow-hidden">
                                <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
                                <p className="text-[10px] text-slate-400 truncate">{song.artist} • {song.album}</p>
                                <span className="text-[9px] text-amber-400 font-mono">Audio Track</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {song.audioUrl && (
                                <button
                                  type="button"
                                  onClick={() => toggleAudioPlayback(song.audioUrl)}
                                  className={`p-2 rounded-lg border transition-all ${
                                    playingAudioUrl === song.audioUrl
                                      ? 'bg-amber-500 text-slate-900 border-amber-400'
                                      : 'bg-midnight-blue text-amber-400 border-amber-500/20 hover:bg-midnight-blue/80'
                                  }`}
                                  title={playingAudioUrl === song.audioUrl ? 'Pause Preview' : 'Play Audio Preview'}
                                >
                                  {playingAudioUrl === song.audioUrl ? (
                                    <Pause className="h-3.5 w-3.5" />
                                  ) : (
                                    <Play className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteSong(song.id)}
                                disabled={deletingSongId === song.id}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                                title="Delete song"
                              >
                                {deletingSongId === song.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upload & Teachings Tab */}
              {activeSubTab === 'teachings' && (
                <div className="space-y-6">
                  {/* Upload Form */}
                  <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-6 border-b border-midnight-blue pb-4">
                      <Upload className="h-5 w-5 text-cci-gold-400" />
                      <h3 className="font-display font-bold text-lg text-white">
                        Upload & Publish New Sermon
                      </h3>
                    </div>

                    <form onSubmit={handleSermonUpload} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Sermon Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Apostolic Alignment: Experiencing Spiritual Growth"
                            value={sermonTitle}
                            onChange={(e) => setSermonTitle(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Preaching Minister / Speaker *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Pastor Abiodun Adebayo"
                            value={sermonSpeaker}
                            onChange={(e) => setSermonSpeaker(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Category / Event
                          </label>
                          <select
                            value={sermonCategory}
                            onChange={(e) => setSermonCategory(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white focus:outline-none transition-all"
                          >
                            <option value="Sermon">Sunday Sermon</option>
                            <option value="Conference">Edifice Conference</option>
                            <option value="Seminar">Theological Foundation</option>
                            <option value="Midweek">Midweek Bulletin</option>
                            <option value="Special">Special Ministration</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Sermon Length / Duration
                          </label>
                          <input
                            type="text"
                            placeholder="58 mins"
                            value={sermonDuration}
                            onChange={(e) => setSermonDuration(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Preaching Date
                          </label>
                          <input
                            type="date"
                            required
                            value={sermonDate}
                            onChange={(e) => setSermonDate(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Sermon Cover Art Link
                          </label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/... (optional)"
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Audio Recording File (.mp3, .wav) *
                          </label>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="audio/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setAudioFile(file);
                            }}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-2 px-4 text-xs text-white focus:outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-mono file:bg-midnight-blue file:text-soft-white hover:file:bg-midnight-blue/80"
                          />
                        </div>
                      </div>

                      {uploadingSermon && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-mono text-cci-gold-400">
                            <span>Uploading audio dynamic files...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-rich-black rounded-full overflow-hidden border border-midnight-blue">
                            <div 
                              className="h-full bg-gradient-to-r from-cci-gold-500 to-amber-400 transition-all duration-300" 
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {formSuccess && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2 text-[11px] text-emerald-400 font-mono">
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{formSuccess}</span>
                        </div>
                      )}

                      {formError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-[11px] text-red-400 font-mono">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={uploadingSermon}
                        className="py-3 px-6 rounded-xl bg-gradient-to-r from-royal-blue to-electric-blue hover:from-electric-blue hover:to-royal-blue text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40"
                      >
                        {uploadingSermon ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Uploading files and recording...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            <span>Publish and Save Dynamic Sermon</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Sermon Catalog Table */}
                  <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-midnight-blue pb-4">
                      <h4 className="font-display font-bold text-base text-white">
                        Dynamic Sermon Database Catalog ({teachings.length})
                      </h4>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-medium-gray" />
                        <input
                          type="text"
                          placeholder="Search sermons..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-rich-black/95 border border-midnight-blue rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-cci-gold-500"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-light-gray">
                        <thead className="text-[10px] font-mono text-slate-400 uppercase tracking-widest border-b border-midnight-blue">
                          <tr>
                            <th className="py-3 px-4">Sermon Info</th>
                            <th className="py-3 px-4">Speaker</th>
                            <th className="py-3 px-4">Category / Length</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-midnight-blue/50">
                          {teachings
                            .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.speaker.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((t) => (
                              <tr key={t.id} className="hover:bg-midnight-blue/15 transition-all">
                                <td className="py-3.5 px-4 font-semibold text-white">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-midnight-blue">
                                      <img src={t.coverUrl} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div>
                                      <div className="line-clamp-1">{t.title}</div>
                                      <div className="text-[10px] font-mono text-slate-500 truncate max-w-xs">{t.audioUrl}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 font-sans font-medium text-slate-300">{t.speaker}</td>
                                <td className="py-3.5 px-4 font-mono text-[10px]">
                                  <span className="bg-midnight-blue/60 text-electric-blue border border-electric-blue/10 px-2 py-0.5 rounded mr-2 uppercase">
                                    {t.category}
                                  </span>
                                  <span className="text-slate-400">{t.duration}</span>
                                </td>
                                <td className="py-3.5 px-4 font-sans text-slate-400">{t.date}</td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {t.audioUrl && (
                                      <button
                                        type="button"
                                        onClick={() => toggleAudioPlayback(t.audioUrl)}
                                        className={`p-1.5 rounded-lg border transition-all ${
                                          playingAudioUrl === t.audioUrl
                                            ? 'bg-amber-500 text-slate-900 border-amber-400'
                                            : 'bg-midnight-blue text-amber-400 border-amber-500/20 hover:bg-midnight-blue/80'
                                        }`}
                                        title={playingAudioUrl === t.audioUrl ? 'Pause Preview' : 'Play Sermon Audio'}
                                      >
                                        {playingAudioUrl === t.audioUrl ? (
                                          <Pause className="h-3.5 w-3.5" />
                                        ) : (
                                          <Play className="h-3.5 w-3.5" />
                                        )}
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteSermon(t.id, t.audioUrl)}
                                      className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                                      title="Delete teaching"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          {teachings.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-10 text-center text-slate-500 font-mono">
                                No sermons uploaded yet. Get started by uploading one!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Publications Tab */}
              {activeSubTab === 'publications' && (
                <div className="space-y-6">
                  {/* Upload Publication Form */}
                  <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-6 border-b border-midnight-blue pb-4">
                      <BookOpen className="h-5 w-5 text-amber-400" />
                      <div>
                        <h3 className="font-display font-bold text-lg text-white">
                          Upload & Publish Monthly Bulletin
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Publish monthly bulletins organized by month and year for immediate church download.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleAddPublication} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Bulletin / Publication Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="E.g., Walking in Apostolic Dominion"
                            value={pubTitle}
                            onChange={(e) => setPubTitle(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-amber-400 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Author / Minister *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Pastor Abiodun Adebayo"
                            value={pubAuthor}
                            onChange={(e) => setPubAuthor(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-amber-400 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Month *
                          </label>
                          <select
                            value={pubMonth}
                            onChange={(e) => setPubMonth(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-amber-400 rounded-xl py-3 px-4 text-xs text-white focus:outline-none transition-all"
                          >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Year Published *
                          </label>
                          <input
                            type="number"
                            required
                            min="2020"
                            max="2040"
                            value={pubYear}
                            onChange={(e) => setPubYear(Number(e.target.value))}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-amber-400 rounded-xl py-3 px-4 text-xs text-white focus:outline-none transition-all"
                          />
                        </div>

                        
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Upload PDF Bulletin Document
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.epub,.docx"
                            ref={pubFileInputRef}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setPubFile(e.target.files[0]);
                              }
                            }}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-amber-400 rounded-xl py-2 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all file:mr-4 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-mono file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
                          />
                          {pubFile && (
                            <p className="text-[10px] text-amber-400 mt-1.5 font-mono">
                              ✓ Selected: {pubFile.name} ({(pubFile.size / (1024 * 1024)).toFixed(2)} MB)
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            OR: Document URL (PDF Download Link)
                          </label>
                          <input
                            type="text"
                            placeholder="https://example.com/monthly-bulletin.pdf"
                            value={pubFileUrl}
                            onChange={(e) => setPubFileUrl(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-amber-400 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
    Publication Cover
  </label>

  <input
    ref={pubCoverInputRef}
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0] || null;
      setPubCoverFile(file);
    }}
    className="w-full bg-rich-black/95 border border-midnight-blue rounded-xl py-3 px-4 text-xs text-white file:mr-3 file:rounded-lg file:border-0 file:bg-amber-400 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-black hover:file:bg-amber-300"
  />

  {pubCoverFile && (
    <p className="text-[10px] text-emerald-400 mt-2">
      Selected: {pubCoverFile.name}
    </p>
  )}
</div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Theological Synopsis & Overview
                          </label>
                          <input
                            type="text"
                            placeholder="A systematic exposition of Christ our firm foundation..."
                            value={pubDescription}
                            onChange={(e) => setPubDescription(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-amber-400 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      {uploadingPub && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[11px] font-mono text-amber-400">
                            <span>Uploading bulletin resource...</span>
                            <span>{pubUploadProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-rich-black rounded-full overflow-hidden border border-midnight-blue">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300" 
                              style={{ width: `${pubUploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {pubSuccess && (
                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-400 font-mono">
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{pubSuccess}</span>
                        </div>
                      )}

                      {pubError && pubError === 'RLS_POLICY_ERROR' && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-2.5">
                          <div className="flex items-start gap-2 text-amber-400 font-bold">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>Database Row-Level Security (RLS) Policy Notice</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Supabase rejected the insert because Row-Level Security (RLS) is active on table <code className="text-amber-400 bg-rich-black px-1.5 py-0.5 rounded font-mono">publications</code> without an insert policy.
                          </p>
                          <div className="bg-rich-black/90 p-3 rounded-lg border border-midnight-blue space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                              <span>Run in Supabase SQL Editor:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "Allow all operations for publications" ON public.publications FOR ALL USING (true) WITH CHECK (true);');
                                  setCopiedSql(true);
                                  setTimeout(() => setCopiedSql(false), 2500);
                                }}
                                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                              >
                                {copiedSql ? '✓ Copied!' : 'Copy SQL'}
                              </button>
                            </div>
                            <pre className="text-[10px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
{`ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for publications" ON public.publications FOR ALL USING (true) WITH CHECK (true);`}
                            </pre>
                          </div>
                        </div>
                      )}

                      {pubError && pubError !== 'RLS_POLICY_ERROR' && (
                        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-xs text-red-400 font-mono">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{pubError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={uploadingPub}
                        className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 cursor-pointer font-mono"
                      >
                        {uploadingPub ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Uploading bulletin...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            <span>Publish Monthly Bulletin</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Publications Catalog Board */}
                  <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-midnight-blue pb-4">
                      <div>
                        <h4 className="font-display font-bold text-base text-white flex items-center gap-2">
                          <span>Active Bulletins & Publications ({publicationsList.length})</span>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Live on Website</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Manage and distribute your monthly bulletins and written teachings.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {publicationsList.length > 0 && (
                          <button
                            onClick={handleDeleteAllPublications}
                            className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                            title="Delete all publications from catalog"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Clear Catalog</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {publicationsList.length === 0 ? (
                      <div className="py-12 text-center bg-rich-black/50 border border-dashed border-midnight-blue rounded-2xl p-6">
                        <BookOpen className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                        <h5 className="text-sm font-bold text-white mb-1">Publications Catalog is Empty</h5>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                          No publications are currently active. Upload a new manuscript above to populate the catalog.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {publicationsList.map((pub) => (
                          <div key={pub.id} className="bg-rich-black/60 border border-midnight-blue rounded-2xl p-4 flex gap-4 items-start">
                            <div className="w-16 h-22 rounded-xl overflow-hidden shrink-0 border border-midnight-blue bg-slate-900 shadow-md">
                              {pub.coverUrl ? (
                                <img src={pub.coverUrl} className="w-full h-full object-cover" alt={pub.title} referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-amber-400">
                                  <BookOpen className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                                  {pub.month || 'Bulletin'} {pub.publishYear}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-white truncate mt-1">{pub.title}</h4>
                              <p className="text-[11px] text-slate-400 truncate">{pub.author}</p>
                              <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-relaxed">{pub.description}</p>
                              
                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-midnight-blue/50">
                                <span className="text-xs font-mono font-bold text-emerald-400">
                                  FREE DOWNLOAD
                                </span>
                                <div className="flex items-center gap-2">
                                  {pub.fileUrl && (
                                    <a
                                      href={pub.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-lg bg-blue-500/10 text-sky-400 hover:bg-blue-500/20 text-[10px] font-mono flex items-center gap-1 transition-all"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" /> PDF
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePublication(pub.id)}
                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                    title="Delete publication"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gallery Tab */}
              {activeSubTab === 'gallery' && (
                <div className="space-y-6">
                  {/* Upload Gallery Image Form */}
                  <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-6 border-b border-midnight-blue pb-4">
                      <ImageIcon className="h-5 w-5 text-cci-gold-400" />
                      <h3 className="font-display font-bold text-lg text-white">
                        Upload & Publish New Gallery Moment
                      </h3>
                    </div>

                    <form onSubmit={handleAddGallery} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Moment / Event Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="E.g., Praise Night Worship Session"
                            value={galleryTitle}
                            onChange={(e) => setGalleryTitle(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Category *
                          </label>
                          <select
                            value={galleryCategory}
                            onChange={(e) => setGalleryCategory(e.target.value as any)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white focus:outline-none transition-all"
                          >
                            <option value="Worship">Worship</option>
                            <option value="Preaching">Preaching</option>
                            <option value="Outreach">Outreach</option>
                            <option value="Community">Community</option>
                            <option value="Reboot Camp">Reboot Camp</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                          Image URL *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="E.g., https://images.unsplash.com/photo-..."
                          value={galleryImageUrl}
                          onChange={(e) => setGalleryImageUrl(e.target.value)}
                          className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                          Brief Description
                        </label>
                        <input
                          type="text"
                          placeholder="E.g., Congregation lifting holy hands during worship ministration."
                          value={galleryDesc}
                          onChange={(e) => setGalleryDesc(e.target.value)}
                          className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-royal-blue to-electric-blue text-xs font-bold uppercase tracking-wider text-white hover:opacity-95 transition-all flex items-center gap-1.5 shadow-md"
                      >
                        <Plus className="h-4 w-4" /> Add Gallery Image
                      </button>
                    </form>
                  </div>

                  {/* List of Gallery Images */}
                  <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6">
                    <h3 className="font-display font-bold text-lg text-white mb-4">
                      My Gallery Catalogue ({galleryList.length})
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {galleryList.map((item) => (
                        <div key={item.id} className="bg-rich-black/50 border border-midnight-blue rounded-xl p-2 relative group overflow-hidden flex flex-col justify-between">
                          <img src={item.imageUrl} className="w-full h-32 object-cover rounded-lg border border-midnight-blue/50" alt={item.title} referrerPolicy="no-referrer" />
                          <div className="mt-2">
                            <h4 className="text-[11px] font-bold text-white truncate">{item.title}</h4>
                            <span className="text-[9px] font-mono text-cci-gold-400 uppercase tracking-wider block">{item.category}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteGallery(item.id)}
                            className="absolute top-4 right-4 p-1.5 bg-rich-black/85 text-red-400 hover:text-red-300 rounded-lg transition-all border border-midnight-blue/50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Events Tab */}
              {activeSubTab === 'events' && (
                <div className="space-y-6">
                  {/* Create Event Form */}
                  <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-6 border-b border-midnight-blue pb-4">
                      <Calendar className="h-5 w-5 text-cci-gold-400" />
                      <h3 className="font-display font-bold text-lg text-white">
                        Create & Publish New Church Event / Meeting
                      </h3>
                    </div>

                    <form onSubmit={handleAddEvent} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Event Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="E.g., Reboot Camp: Apostolic Expansion"
                            value={eventTitleInput}
                            onChange={(e) => setEventTitleInput(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Meeting Dates / Schedule *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="E.g., November 12th to 15th, 2026"
                            value={eventDateInput}
                            onChange={(e) => setEventDateInput(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Time Slot
                          </label>
                          <input
                            type="text"
                            placeholder="E.g., 05:00 PM Daily"
                            value={eventTimeInput}
                            onChange={(e) => setEventTimeInput(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Location / Venue
                          </label>
                          <input
                            type="text"
                            placeholder="E.g., GEC Main Auditorium"
                            value={eventLocationInput}
                            onChange={(e) => setEventLocationInput(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Meeting Type
                          </label>
                          <select
                            value={eventModeInput}
                            onChange={(e) => setEventModeInput(e.target.value as any)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white focus:outline-none transition-all"
                          >
                            <option value="physical">Physical Attendance</option>
                            <option value="virtual">Virtual Streamed</option>
                            <option value="hybrid">Hybrid (Both)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Speaker / Minister
                          </label>
                          <input
                            type="text"
                            placeholder="E.g., Pastor Abiodun Adebayo"
                            value={eventSpeakerInput}
                            onChange={(e) => setEventSpeakerInput(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Banner Image URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            value={eventBannerInput}
                            onChange={(e) => setEventBannerInput(e.target.value)}
                            className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                          Meeting Details / Description
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Enter key topics, seminar outlines, and who should attend."
                          value={eventDescriptionInput}
                          onChange={(e) => setEventDescriptionInput(e.target.value)}
                          className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-royal-blue to-electric-blue text-xs font-bold uppercase tracking-wider text-white hover:opacity-95 transition-all flex items-center gap-1.5 shadow-md"
                      >
                        <Plus className="h-4 w-4" /> Save Event
                      </button>
                    </form>
                  </div>

                  {/* List of Events */}
                  <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6">
                    <h3 className="font-display font-bold text-lg text-white mb-4">
                      My Church Events Calendar ({eventsList.length})
                    </h3>

                    <div className="space-y-4">
                      {eventsList.map((event) => (
                        <div key={event.id} className="bg-rich-black/50 border border-midnight-blue rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-start gap-4 overflow-hidden">
                            <img src={event.banner} className="w-24 h-16 rounded-xl object-cover border border-midnight-blue shrink-0" alt={event.title} referrerPolicy="no-referrer" />
                            <div className="overflow-hidden">
                              <h4 className="text-sm font-bold text-white">{event.title}</h4>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">{event.date} • {event.time}</p>
                              <p className="text-[10px] text-cci-gold-400 font-mono uppercase tracking-wider mt-1">{event.location} • {event.mode}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl border border-midnight-blue/50 transition-all self-end sm:self-auto shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Event Registrations & Data Boards Tab */}
              {activeSubTab === 'registrations' && (
                <div className="space-y-6">
                  {/* KPI Data Boards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-charcoal/80 to-[#18233D] border border-midnight-blue p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Registered</span>
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Users className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold font-display text-white mt-2">
                        {registrations.length}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 mt-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Live Supabase Database Sync</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-charcoal/80 to-[#18233D] border border-midnight-blue p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Physical In-Person</span>
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <MapPin className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold font-display text-amber-300 mt-2">
                        {registrations.filter(r => (r.address && !r.address.toLowerCase().includes('online')) || (r.eventLocation && !r.eventLocation.toLowerCase().includes('online'))).length}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-2">
                        {registrations.length > 0 
                          ? `${Math.round((registrations.filter(r => (r.address && !r.address.toLowerCase().includes('online')) || (r.eventLocation && !r.eventLocation.toLowerCase().includes('online'))).length / registrations.length) * 100)}% of total attendees`
                          : '0% attending in person'}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-charcoal/80 to-[#18233D] border border-midnight-blue p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Online Streamers</span>
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <Radio className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold font-display text-purple-300 mt-2">
                        {registrations.filter(r => (r.address && r.address.toLowerCase().includes('online')) || (r.eventLocation && r.eventLocation.toLowerCase().includes('online'))).length}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-2">
                        Virtual Zoom & YouTube linkers
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-charcoal/80 to-[#18233D] border border-midnight-blue p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Active Branches</span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold font-display text-emerald-400 mt-2">
                        {new Set(registrations.map(r => r.userBranch || 'Lekki HQ')).size}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-2">
                        Spread across regional centers
                      </div>
                    </div>
                  </div>

                  {/* Tab header controls & Export Buttons */}
                  <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-midnight-blue pb-4">
                      <div>
                        <h4 className="font-display font-bold text-base text-white flex items-center gap-2">
                          <Users className="h-5 w-5 text-cci-gold-400" />
                          <span>Edifice Conference & Event Data Boards</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                            {registrations.length} Records
                          </span>
                        </h4>
                        <p className="text-[11px] text-light-gray mt-1">
                          Export complete multi-tab workbooks to Excel (.xlsx) and manage attendee check-in statuses.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                        {/* View Switcher: Table vs Charts */}
                        <div className="flex items-center bg-rich-black/80 border border-midnight-blue rounded-xl p-1 text-xs">
                          <button
                            onClick={() => setRegViewMode('table')}
                            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] flex items-center gap-1.5 transition-all ${
                              regViewMode === 'table'
                                ? 'bg-royal-blue text-white font-bold shadow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Users className="h-3.5 w-3.5" />
                            <span>Attendee Table</span>
                          </button>
                          <button
                            onClick={() => setRegViewMode('charts')}
                            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] flex items-center gap-1.5 transition-all ${
                              regViewMode === 'charts'
                                ? 'bg-royal-blue text-white font-bold shadow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <BarChart3 className="h-3.5 w-3.5 text-cci-gold-400" />
                            <span>Data Charts</span>
                          </button>
                        </div>

                        {/* Export to Excel (.xlsx) Button */}
                        <button
                          onClick={handleExportMeetingRegistrationsExcel}
                          disabled={exportingExcel}
                          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/30 text-xs font-mono font-bold rounded-xl flex items-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                          title="Generate complete Excel workbook with Master List, Branch Breakdown, and KPI Data Boards"
                        >
                          {exportingExcel ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                              <span>GENERATING EXCEL...</span>
                            </>
                          ) : (
                            <>
                              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-200" />
                              <span>EXPORT EXCEL (.XLSX)</span>
                            </>
                          )}
                        </button>

                        {/* Export CSV Button */}
                        <button
                          onClick={handleExportMeetingRegistrationsCSV}
                          disabled={exportingCsv}
                          className="px-3 py-2 bg-midnight-blue hover:bg-midnight-blue/80 text-slate-300 hover:text-white border border-midnight-blue text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 transition-all shadow disabled:opacity-50 cursor-pointer"
                          title="Download as CSV text file"
                        >
                          {exportingCsv ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-300" />
                          ) : (
                            <Download className="h-3.5 w-3.5 text-slate-400" />
                          )}
                          <span>CSV</span>
                        </button>
                      </div>
                    </div>

                    {regViewMode === 'charts' ? (
                      <AdminAnalyticsDashboard
                        registrations={registrations}
                        rawMeetingRegistrations={rawMeetingRegistrations}
                        loading={dataLoading}
                        onRefresh={fetchDashboardData}
                        onExportCsv={handleExportMeetingRegistrationsCSV}
                        exportingCsv={exportingCsv}
                      />
                    ) : (
                      <>
                        {/* Filter Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-5 p-3 rounded-xl bg-rich-black/60 border border-midnight-blue">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-medium-gray" />
                            <input
                              type="text"
                              placeholder="Search attendee name, email..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full bg-rich-black border border-midnight-blue rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div>
                            <select
                              value={regBranchFilter}
                              onChange={(e) => setRegBranchFilter(e.target.value)}
                              className="w-full bg-rich-black border border-midnight-blue rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                            >
                              <option value="ALL">All Branches</option>
                              {Array.from(new Set(registrations.map(r => r.userBranch || 'Lekki HQ'))).map(branch => (
                                <option key={branch} value={branch}>{branch}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <select
                              value={regModeFilter}
                              onChange={(e) => setRegModeFilter(e.target.value)}
                              className="w-full bg-rich-black border border-midnight-blue rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                            >
                              <option value="ALL">All Modes (Physical & Virtual)</option>
                              <option value="PHYSICAL">Physical In-Person Only</option>
                              <option value="VIRTUAL">Virtual Online Streamers</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-slate-400">
                              Showing {
                                registrations
                                  .filter(r => {
                                    const matchesSearch = (r.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                      (r.surname || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                      (r.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                      (r.userBranch || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      (r.userPhone || '').toLowerCase().includes(searchTerm.toLowerCase());
                                    const matchesBranch = regBranchFilter === 'ALL' || (r.userBranch || 'Lekki HQ') === regBranchFilter;
                                    const isOnline = (r.address && r.address.toLowerCase().includes('online')) || (r.eventLocation && r.eventLocation.toLowerCase().includes('online'));
                                    const matchesMode = regModeFilter === 'ALL' || (regModeFilter === 'VIRTUAL' ? isOnline : !isOnline);
                                    return matchesSearch && matchesBranch && matchesMode;
                                  }).length
                              } of {registrations.length}
                            </span>
                            {(searchTerm || regBranchFilter !== 'ALL' || regModeFilter !== 'ALL') && (
                              <button
                                onClick={() => {
                                  setSearchTerm('');
                                  setRegBranchFilter('ALL');
                                  setRegModeFilter('ALL');
                                }}
                                className="text-[10px] font-mono text-amber-400 hover:underline"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Attendee Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-light-gray">
                            <thead className="text-[10px] font-mono text-slate-400 uppercase tracking-widest border-b border-midnight-blue">
                              <tr>
                                <th className="py-3 px-4">Attendee</th>
                                <th className="py-3 px-4">Contact Info</th>
                                <th className="py-3 px-4">Branch & Mode</th>
                                <th className="py-3 px-4">Check-In Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-midnight-blue/50">
                              {registrations
                                .filter(r => {
                                  const matchesSearch = (r.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (r.surname || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (r.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (r.userBranch || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (r.userPhone || '').toLowerCase().includes(searchTerm.toLowerCase());
                                  const matchesBranch = regBranchFilter === 'ALL' || (r.userBranch || 'Lekki HQ') === regBranchFilter;
                                  const isOnline = (r.address && r.address.toLowerCase().includes('online')) || (r.eventLocation && r.eventLocation.toLowerCase().includes('online'));
                                  const matchesMode = regModeFilter === 'ALL' || (regModeFilter === 'VIRTUAL' ? isOnline : !isOnline);
                                  return matchesSearch && matchesBranch && matchesMode;
                                })
                                .map((r) => {
                                  const currentStatus = regStatusMap[r.id] || 'Confirmed';
                                  const isOnline = (r.address && r.address.toLowerCase().includes('online')) || (r.eventLocation && r.eventLocation.toLowerCase().includes('online'));
                                  return (
                                    <tr key={r.id} className="hover:bg-midnight-blue/20 transition-all group">
                                      <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-blue to-electric-blue text-white font-bold text-xs flex items-center justify-center shrink-0 border border-white/10 shadow">
                                            {(r.firstName?.[0] || 'A').toUpperCase()}{(r.surname?.[0] || 'T').toUpperCase()}
                                          </div>
                                          <div>
                                            <div className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                                              {r.surname} {r.firstName}
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-400">
                                              {r.age || 'Adult'} • {r.gender || 'Member'}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-3.5 px-4 font-sans">
                                        <div className="text-slate-300 select-all">{r.userEmail}</div>
                                        <div className="text-[11px] font-mono text-slate-400">{r.userPhone || 'N/A'}</div>
                                      </td>
                                      <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold">
                                            {r.userBranch || 'Lekki HQ'}
                                          </span>
                                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-semibold ${
                                            isOnline 
                                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' 
                                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                          }`}>
                                            {isOnline ? 'Virtual' : 'Physical'}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="py-3.5 px-4">
                                        <select
                                          value={currentStatus}
                                          onChange={(e) => handleStatusChange(r.id, e.target.value)}
                                          className={`text-[10px] font-mono font-bold rounded-lg px-2.5 py-1 border transition-all cursor-pointer ${
                                            currentStatus === 'Checked-In'
                                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                              : currentStatus === 'Follow-Up'
                                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                              : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                          }`}
                                        >
                                          <option value="Confirmed" className="bg-slate-900 text-white">Confirmed</option>
                                          <option value="Checked-In" className="bg-slate-900 text-white">Checked-In</option>
                                          <option value="Follow-Up" className="bg-slate-900 text-white">Follow-Up</option>
                                        </select>
                                      </td>
                                      <td className="py-3.5 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <button
                                            onClick={() => setSelectedRegAttendee(r)}
                                            className="px-2.5 py-1 text-[11px] font-mono font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-lg transition-all flex items-center gap-1"
                                            title="View full attendee dossier"
                                          >
                                            <Eye className="h-3.5 w-3.5" />
                                            <span>Details</span>
                                          </button>
                                          <button
                                            onClick={() => handleDeleteReg(r.id)}
                                            className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                                            title="Delete registration"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              {registrations.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="py-12 text-center text-slate-500 font-mono">
                                    No registrations collected yet.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Attendee Dossier Modal */}
                  {selectedRegAttendee && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                      <div className="bg-[#131B2E] border border-midnight-blue rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
                        <div className="flex items-center justify-between pb-4 border-b border-midnight-blue">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold text-base flex items-center justify-center">
                              {(selectedRegAttendee.firstName?.[0] || 'A').toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-white font-display">
                                {selectedRegAttendee.surname} {selectedRegAttendee.firstName}
                              </h3>
                              <p className="text-[11px] font-mono text-amber-400">Registration Dossier</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedRegAttendee(null)}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-midnight-blue transition-all"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-4 my-5 text-xs text-slate-300">
                          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-rich-black/70 border border-midnight-blue">
                            <div>
                              <span className="text-[10px] font-mono uppercase text-slate-500 block">Email</span>
                              <span className="text-white font-medium break-all">{selectedRegAttendee.userEmail}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-mono uppercase text-slate-500 block">Phone</span>
                              <span className="text-white font-mono">{selectedRegAttendee.userPhone || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-mono uppercase text-slate-500 block">Nearest Branch</span>
                              <span className="text-amber-300 font-bold">{selectedRegAttendee.userBranch || 'Lekki HQ'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-mono uppercase text-slate-500 block">Age / Gender</span>
                              <span className="text-white">{selectedRegAttendee.age || 'N/A'} • {selectedRegAttendee.gender || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-2xl bg-rich-black/70 border border-midnight-blue">
                            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Residential Address</span>
                            <p className="text-slate-200">{selectedRegAttendee.address || selectedRegAttendee.eventLocation || 'Online Virtual Attendee'}</p>
                          </div>

                          {(selectedRegAttendee.expecations_prayer_request || selectedRegAttendee.expectations) && (
                            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                              <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1 font-bold">Expectations & Prayer Requests</span>
                              <p className="text-slate-200 italic leading-relaxed">
                                "{selectedRegAttendee.expecations_prayer_request || selectedRegAttendee.expectations}"
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-midnight-blue/60">
                            <span>How heard: {selectedRegAttendee.how_you_heard || selectedRegAttendee.howHeard || 'Member Invitation'}</span>
                            <span>Date: {selectedRegAttendee.created_at || selectedRegAttendee.registrationDate || 'Recent'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <a
                            href={`mailto:${selectedRegAttendee.userEmail}?subject=God's Edifice Church Conference Confirmation`}
                            className="px-4 py-2 rounded-xl bg-midnight-blue hover:bg-midnight-blue/80 text-white font-mono text-xs flex items-center gap-1.5 transition-all"
                          >
                            <Mail className="h-3.5 w-3.5 text-sky-400" />
                            <span>Email Attendee</span>
                          </a>
                          <button
                            onClick={() => setSelectedRegAttendee(null)}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs transition-all"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Subscribers Tab */}
              {activeSubTab === 'subscribers' && (
                <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-midnight-blue pb-4">
                    <div>
                      <h4 className="font-display font-bold text-base text-white">
                        Newsletter Subscribers ({subscribers.length})
                      </h4>
                      <p className="text-[11px] text-light-gray mt-1">
                         believers subscribed to receive spiritual resources.
                      </p>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-medium-gray" />
                      <input
                        type="text"
                        placeholder="Search emails..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-rich-black/95 border border-midnight-blue rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-cci-gold-500"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-light-gray">
                      <thead className="text-[10px] font-mono text-slate-400 uppercase tracking-widest border-b border-midnight-blue">
                        <tr>
                          <th className="py-3 px-4">Subscriber Email</th>
                          <th className="py-3 px-4">Subscribed At</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-midnight-blue/50">
                        {subscribers
                          .filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((s) => (
                            <tr key={s.id} className="hover:bg-midnight-blue/15 transition-all">
                              <td className="py-3.5 px-4 font-semibold text-white select-all">
                                {s.email}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                                {new Date(s.subscribedAt).toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => handleDeleteSub(s.id)}
                                  className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                                  title="Delete subscriber"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        {subscribers.length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-10 text-center text-slate-500 font-mono">
                              No subscribers found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Site Settings Tab */}
              {activeSubTab === 'settings' && (
                <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-6 border-b border-midnight-blue pb-4">
                    <Settings className="h-5 w-5 text-cci-gold-400" />
                    <h3 className="font-display font-bold text-lg text-white">
                      Edit Site Preferences & Branding
                    </h3>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                          Church Name
                        </label>
                        <input
                          type="text"
                          required
                          value={churchNameSetting}
                          onChange={(e) => setChurchNameSetting(e.target.value)}
                          className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                          Head / Resident Pastor
                        </label>
                        <input
                          type="text"
                          required
                          value={residentPastorSetting}
                          onChange={(e) => setResidentPastorSetting(e.target.value)}
                          className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                        Resident Pastor Photo URL
                      </label>
                      <input
                        type="text"
                        required
                        value={pastorPhotoSetting}
                        onChange={(e) => setPastorPhotoSetting(e.target.value)}
                        className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                          Contact Support Email
                        </label>
                        <input
                          type="email"
                          required
                          value={contactEmailSetting}
                          onChange={(e) => setContactEmailSetting(e.target.value)}
                          className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                          Contact Phone Number
                        </label>
                        <input
                          type="text"
                          required
                          value={contactPhoneSetting}
                          onChange={(e) => setContactPhoneSetting(e.target.value)}
                          className="w-full bg-rich-black/95 border border-midnight-blue focus:border-cci-gold-500 rounded-xl py-3 px-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-royal-blue to-electric-blue text-xs font-bold uppercase tracking-wider text-white hover:opacity-95 transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Save Configuration
                    </button>
                  </form>
                </div>
              )}

              {/* SQL setup helper tab */}
              {activeSubTab === 'database' && (
                <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4 border-b border-midnight-blue pb-4">
                    <div>
                      <h4 className="font-display font-bold text-lg text-white flex items-center gap-2">
                        <Database className="h-5 w-5 text-cci-gold-400" />
                        Supabase PostgreSQL SQL Script
                      </h4>
                      <p className="text-xs text-light-gray mt-1">
                        Run this script in your Supabase SQL Editor to instantly provision all required tables.
                      </p>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="py-2 px-4 rounded-xl bg-midnight-blue hover:bg-midnight-blue/80 border border-electric-blue/20 text-xs font-mono text-soft-white flex items-center gap-1.5 transition-all shrink-0"
                    >
                      <Clipboard className="h-4 w-4" />
                      <span>COPY SQL SCRIPT</span>
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="bg-rich-black/90 p-5 rounded-2xl border border-midnight-blue text-left font-mono text-[11px] text-emerald-400/90 max-h-[450px] overflow-y-auto overflow-x-auto whitespace-pre select-all leading-relaxed">
                      {sqlSetupScript}
                    </pre>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
