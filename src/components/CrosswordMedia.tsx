import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, User, Mail, Database, Trash2, LogOut, CheckCircle2, 
  AlertCircle, Upload, Loader2, Plus, Search, FileText, Music, 
  Settings, Key, Eye, EyeOff, LayoutDashboard, Users, MessageSquare, Clipboard, ArrowLeft,
  Image as ImageIcon, Calendar
} from 'lucide-react';
import { supabase, isSupabaseConfigured, checkIfAdmin } from '../supabase';
import { Teaching, Registration, Subscriber, Song, GalleryItem, ChurchEvent } from '../types';
import { upcomingMeetings, galleryItems } from '../data';

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
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'songs' | 'teachings' | 'gallery' | 'events' | 'registrations' | 'subscribers' | 'settings' | 'database'>('overview');
  
  // Data lists
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Songs states
  const [songsList, setSongsList] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem('gec_user_uploaded_songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songAlbum, setSongAlbum] = useState('');
  const [songCoverUrl, setSongCoverUrl] = useState('');
  const [songLyrics, setSongLyrics] = useState('');
  const [songAudioUrl, setSongAudioUrl] = useState('');

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
    const redirectToLogin = () => {
      if (window.location.pathname !== '/crosswordmedia') {
        window.history.pushState(null, '', '/crosswordmedia');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    };

    if (localStorage.getItem('gec_admin_authenticated') === 'true') {
      setIsAdminUser(true);
      setCheckingAuth(false);
      if (supabase) {
        fetchDashboardData();
      }
      return;
    }

    if (!isSupabaseConfigured) {
      setCheckingAuth(false);
      redirectToLogin();
      return;
    }

    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        verifyAdminAccess(session.user.id, session.user.email);
      } else {
        setCheckingAuth(false);
        redirectToLogin();
      }
    });

    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        verifyAdminAccess(session.user.id, session.user.email);
      } else {
        if (localStorage.getItem('gec_admin_authenticated') === 'true') {
          setIsAdminUser(true);
          setCheckingAuth(false);
        } else {
          setIsAdminUser(false);
          setCheckingAuth(false);
          redirectToLogin();
        }
      }
    }) || { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Check admin status
  const verifyAdminAccess = async (userId: string, userEmail: string | undefined) => {
    setCheckingAuth(true);
    
    // Developer safety-net / fallback: Always authorize the developer email "boluakintola@gmail.com"
    const isDeveloper = userEmail?.toLowerCase() === 'boluakintola@gmail.com';
    
    if (isDeveloper) {
      setIsAdminUser(true);
      setCheckingAuth(false);
      fetchDashboardData();
      return;
    }

    // Otherwise, check in database
    const isAdmin = await checkIfAdmin(userId);
    setIsAdminUser(isAdmin);
    setCheckingAuth(false);
    
    if (isAdmin) {
      fetchDashboardData();
    }
  };

  // Fetch all Supabase data
  const fetchDashboardData = async () => {
    if (!supabase) return;
    setDataLoading(true);
    try {
      // 1. Fetch Sermons / Teachings
      const { data: teachingsData, error: tError } = await supabase
        .from('teachings')
        .select('*')
        .order('date', { ascending: false });
      
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
      const { data: regsData, error: rError } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!rError && regsData) {
        const mappedRegs: Registration[] = regsData.map((r: any) => ({
          id: r.id,
          eventId: r.event_id || r.eventId || 'edifice-conference-2026',
          eventTitle: r.event_title || r.eventTitle || r.event_name || r.eventName || "God's Edifice Church Conference",
          eventDate: r.event_date || r.eventDate || '2026-07-25',
          eventLocation: r.event_location || r.eventLocation || 'Lekki HQ',
          userName: r.user_name || r.userName || `${r.surname || ''} ${r.first_name || ''}`.trim() || 'Attendee',
          userEmail: r.user_email || r.userEmail || r.email || '',
          userPhone: r.user_phone || r.userPhone || r.phone || '',
          userBranch: r.user_branch || r.userBranch || r.location || 'Main Branch',
          ticketCode: r.ticket_code || r.ticketCode || `GEC-${Math.floor(100000 + Math.random() * 900000)}`,
          registrationDate: r.registration_date || r.registrationDate || r.created_at || new Date().toISOString(),
          mode: (r.mode as 'physical' | 'virtual') || 'physical'
        }));
        setRegistrations(mappedRegs);
      }

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
    
    const isExplicitAdmin = email.trim().toLowerCase() === 'boluakintola@gmail.com' && password === 'crosswordmedia2026';
    
    if (isExplicitAdmin) {
      localStorage.setItem('gec_admin_authenticated', 'true');
      setIsAdminUser(true);
      setSession({
        user: {
          id: 'explicit-admin-id',
          email: 'boluakintola@gmail.com',
        },
        access_token: 'bypass-token',
        refresh_token: 'bypass-token',
        expires_in: 3600,
        token_type: 'bearer',
      } as any);
      setCheckingAuth(false);
      setAuthLoading(false);
      if (supabase) {
        fetchDashboardData();
      }
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setAuthError('Supabase is not configured yet. Please configure the environment variables.');
      return;
    }

    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'admin' // Note: Typically assigned server-side or via profile updates
            }
          }
        });
        if (error) throw error;
        setAuthError('Registration successful! Please sign in if verification is complete.');
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
      const filePath = `sermons/${fileName}`;

      setUploadProgress(20);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sermons')
        .upload(filePath, audioFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      setUploadProgress(60);

      // 2. Get Public URL of uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('sermons')
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

    } catch (err: any) {
      console.error('Upload failed:', err);
      setFormError(`Upload Failed: ${err.message || 'Make sure the "sermons" bucket is public and the "teachings" table exists.'}`);
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
      if (audioUrl.includes('/storage/v1/object/public/sermons/')) {
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
    if (!confirm('Remove this registration form?')) return;
    try {
      const { error } = await supabase.from('registrations').delete().eq('id', id);
      if (error) throw error;
      setRegistrations(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add Song Handler
  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle) {
      alert('Sermon/Song title is required.');
      return;
    }
    const newSong: Song = {
      id: `user-song-${Date.now()}`,
      title: songTitle.trim(),
      artist: songArtist.trim() || 'Crossworship',
      album: songAlbum.trim() || 'Single',
      duration: '4:30',
      audioUrl: songAudioUrl.trim() || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      coverUrl: songCoverUrl.trim() || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop',
      lyrics: songLyrics.trim() || '[00:00] Worship the Lord in the beauty of holiness...'
    };

    const updated = [newSong, ...songsList];
    setSongsList(updated);
    localStorage.setItem('gec_user_uploaded_songs', JSON.stringify(updated));

    // Reset Form
    setSongTitle('');
    setSongArtist('');
    setSongAlbum('');
    setSongCoverUrl('');
    setSongLyrics('');
    setSongAudioUrl('');
    alert('Song uploaded successfully!');
  };

  // Delete Song Handler
  const handleDeleteSong = (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;
    const updated = songsList.filter(s => s.id !== id);
    setSongsList(updated);
    localStorage.setItem('gec_user_uploaded_songs', JSON.stringify(updated));
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

  // SQL Script text to render
  const sqlSetupScript = `-- 1. Create a Public "sermons" bucket in Storage
-- (Go to Storage in Supabase Dashboard, create a new bucket named "sermons" and make it Public)

-- 2. Create the Database Tables

-- Create subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    status TEXT DEFAULT 'Registered'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create teachings (sermons) table
CREATE TABLE IF NOT EXISTS public.teachings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    speaker TEXT NOT NULL,
    category TEXT DEFAULT 'Sermon'::text,
    duration TEXT,
    date DATE NOT NULL,
    audio_url TEXT NOT NULL,
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table with user roles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security) and Policies as needed.
-- Make profiles readable by authenticated users:
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create Row Trigger to automatically seed profiles on Sign-Up:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'admin'); -- Defaulting to admin for testing, customize as needed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
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
              <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-4 sm:p-5 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-cci-gold-500/10 border border-cci-gold-500/20 flex items-center justify-center text-cci-gold-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] font-mono text-cci-gold-400 uppercase tracking-widest">Active Admin</div>
                    <div className="text-xs text-white font-semibold truncate font-sans">{session.user.email}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => setActiveSubTab('overview')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono tracking-wider flex items-center gap-3 transition-all ${
                      activeSubTab === 'overview' 
                        ? 'bg-gradient-to-r from-royal-blue to-electric-blue text-white border-l-4 border-cci-gold-400' 
                        : 'text-light-gray hover:bg-midnight-blue/40 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>DASHBOARD OVERVIEW</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('songs')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono tracking-wider flex items-center gap-3 transition-all ${
                      activeSubTab === 'songs' 
                        ? 'bg-gradient-to-r from-royal-blue to-electric-blue text-white border-l-4 border-cci-gold-400' 
                        : 'text-light-gray hover:bg-midnight-blue/40 hover:text-white'
                    }`}
                  >
                    <Music className="h-4 w-4" />
                    <span>UPLOAD SONGS ({songsList.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('teachings')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono tracking-wider flex items-center gap-3 transition-all ${
                      activeSubTab === 'teachings' 
                        ? 'bg-gradient-to-r from-royal-blue to-electric-blue text-white border-l-4 border-cci-gold-400' 
                        : 'text-light-gray hover:bg-midnight-blue/40 hover:text-white'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span>UPLOAD TEACHINGS ({teachings.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('gallery')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono tracking-wider flex items-center gap-3 transition-all ${
                      activeSubTab === 'gallery' 
                        ? 'bg-gradient-to-r from-royal-blue to-electric-blue text-white border-l-4 border-cci-gold-400' 
                        : 'text-light-gray hover:bg-midnight-blue/40 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>UPLOAD GALLERY ({galleryList.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('events')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono tracking-wider flex items-center gap-3 transition-all ${
                      activeSubTab === 'events' 
                        ? 'bg-gradient-to-r from-royal-blue to-electric-blue text-white border-l-4 border-cci-gold-400' 
                        : 'text-light-gray hover:bg-midnight-blue/40 hover:text-white'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>MANAGE EVENTS ({eventsList.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('registrations')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono tracking-wider flex items-center gap-3 transition-all ${
                      activeSubTab === 'registrations' 
                        ? 'bg-gradient-to-r from-royal-blue to-electric-blue text-white border-l-4 border-cci-gold-400' 
                        : 'text-light-gray hover:bg-midnight-blue/40 hover:text-white'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>EVENT REGS ({registrations.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('subscribers')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono tracking-wider flex items-center gap-3 transition-all ${
                      activeSubTab === 'subscribers' 
                        ? 'bg-gradient-to-r from-royal-blue to-electric-blue text-white border-l-4 border-cci-gold-400' 
                        : 'text-light-gray hover:bg-midnight-blue/40 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>SUBSCRIBERS ({subscribers.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('settings')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono tracking-wider flex items-center gap-3 transition-all ${
                      activeSubTab === 'settings' 
                        ? 'bg-gradient-to-r from-royal-blue to-electric-blue text-white border-l-4 border-cci-gold-400' 
                        : 'text-light-gray hover:bg-midnight-blue/40 hover:text-white'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>SITE SETTINGS</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('database')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono tracking-wider flex items-center gap-3 transition-all ${
                      activeSubTab === 'database' 
                        ? 'bg-gradient-to-r from-royal-blue to-electric-blue text-white border-l-4 border-cci-gold-400' 
                        : 'text-light-gray hover:bg-midnight-blue/40 hover:text-white'
                    }`}
                  >
                    <Database className="h-4 w-4" />
                    <span>DATABASE SETUP</span>
                  </button>
                </div>

                <div className="mt-8 pt-4 border-t border-midnight-blue">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-all"
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
                  {/* Overview statistics cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-charcoal/45 border border-midnight-blue p-5 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-royal-blue/15 border border-royal-blue/25 flex items-center justify-center text-electric-blue">
                        <Music className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Sermons</div>
                        <div className="text-2xl font-bold font-sans text-white mt-1">{teachings.length}</div>
                      </div>
                    </div>

                    <div className="bg-charcoal/45 border border-midnight-blue p-5 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cci-gold-500/10 border border-cci-gold-500/20 flex items-center justify-center text-cci-gold-400">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Conference Regs</div>
                        <div className="text-2xl font-bold font-sans text-white mt-1">{registrations.length}</div>
                      </div>
                    </div>

                    <div className="bg-charcoal/45 border border-midnight-blue p-5 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Subscribers</div>
                        <div className="text-2xl font-bold font-sans text-white mt-1">{subscribers.length}</div>
                      </div>
                    </div>
                  </div>

                  {/* Information block */}
                  <div className="bg-charcoal/45 border border-midnight-blue p-6 rounded-2xl">
                    <h3 className="font-display font-bold text-lg text-white mb-2">
                      Supabase Integrated Backend Active
                    </h3>
                    <p className="text-xs text-light-gray leading-relaxed max-w-2xl">
                      Welcome to the Crossword Media Administration console. Use the sidebar sections to upload new sermons directly to Supabase storage buckets, sync teachings to the PostgreSQL database, manage attendees, and export email subscriber digests.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4">
                      <button 
                        onClick={() => setActiveSubTab('teachings')} 
                        className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-royal-blue to-electric-blue text-xs font-bold uppercase tracking-wider text-white hover:opacity-95 transition-all flex items-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" /> Upload Sermon
                      </button>
                      <button 
                        onClick={() => setActiveSubTab('database')} 
                        className="py-2.5 px-4 rounded-xl border border-midnight-blue hover:bg-midnight-blue text-xs font-semibold text-soft-white transition-all flex items-center gap-1.5"
                      >
                        <Database className="h-4 w-4" /> Schema Management
                      </button>
                    </div>
                  </div>
                </div>
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

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                            Audio Stream URL (Optional, fallback provided)
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

                      <button
                        type="submit"
                        className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-royal-blue to-electric-blue text-xs font-bold uppercase tracking-wider text-white hover:opacity-95 transition-all flex items-center gap-1.5 shadow-md"
                      >
                        <Plus className="h-4 w-4" /> Add Song
                      </button>
                    </form>
                  </div>

                  {/* List of Custom Songs */}
                  <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6">
                    <h3 className="font-display font-bold text-lg text-white mb-4">
                      My Uploaded Songs ({songsList.length})
                    </h3>

                    {songsList.length === 0 ? (
                      <p className="text-xs text-light-gray">No custom songs uploaded yet. Standard preloaded hymns are displayed on the public website.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {songsList.map((song) => (
                          <div key={song.id} className="bg-rich-black/50 border border-midnight-blue rounded-xl p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <img src={song.coverUrl} className="w-12 h-12 rounded-lg object-cover border border-midnight-blue shrink-0" alt={song.title} referrerPolicy="no-referrer" />
                              <div className="overflow-hidden">
                                <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
                                <p className="text-[10px] text-slate-400 truncate">{song.artist} • {song.album}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteSong(song.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
                                  <button
                                    onClick={() => handleDeleteSermon(t.id, t.audioUrl)}
                                    className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                                    title="Delete teaching"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
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

              {/* Event Registrations Tab */}
              {activeSubTab === 'registrations' && (
                <div className="bg-charcoal/45 border border-midnight-blue rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-midnight-blue pb-4">
                    <div>
                      <h4 className="font-display font-bold text-base text-white">
                        Edifice Conference Registrations
                      </h4>
                      <p className="text-[11px] text-light-gray mt-1">
                        Attendee registrations synchronized in PostgreSQL via Supabase database.
                      </p>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-medium-gray" />
                      <input
                        type="text"
                        placeholder="Search attendees..."
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
                          <th className="py-3 px-4">Attendee Name</th>
                          <th className="py-3 px-4">Email Address</th>
                          <th className="py-3 px-4">Phone / Location</th>
                          <th className="py-3 px-4">Event</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-midnight-blue/50">
                        {registrations
                          .filter(r => r.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || r.surname.toLowerCase().includes(searchTerm.toLowerCase()) || r.email.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((r) => (
                            <tr key={r.id} className="hover:bg-midnight-blue/15 transition-all">
                              <td className="py-3.5 px-4 font-semibold text-white">
                                {r.surname} {r.firstName}
                              </td>
                              <td className="py-3.5 px-4 font-sans text-slate-300 select-all">{r.email}</td>
                              <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                                <div>{r.phone || 'N/A'}</div>
                                <div className="text-[9px] text-slate-500">{r.location || 'Online'}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="bg-cci-gold-500/10 text-cci-gold-400 border border-cci-gold-500/10 px-2 py-0.5 rounded text-[10px] font-mono uppercase">
                                  {r.eventName}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => handleDeleteReg(r.id)}
                                  className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                                  title="Delete registration"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        {registrations.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-10 text-center text-slate-500 font-mono">
                              No registrations collected yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
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
