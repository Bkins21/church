import { useState, useEffect, FormEvent } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Meetings from './components/Meetings';
import Teachings from './components/Teachings';
import Publications from './components/Publications';
import Branches from './components/Branches';
import Footer from './components/Footer';
import Songs from './components/Songs';
import AboutUs from './components/AboutUs';
import Ministries from './components/Ministries';
import { teachingsCatalog } from './data';
import Newsletter from './components/Newsletter';

import { Registration, Publication, Teaching, Song, Subscriber } from './types';
import { Play, Pause, X, Radio, MessageSquare, Send, Heart, Users, Sparkles, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import CrosswordMedia from './components/CrosswordMedia';
import AdminLogin from './components/AdminLogin';
import { supabase, isSupabaseConfigured } from './supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === '/crosswordmedia') return 'crosswordmedia';
    if (path === '/admin') return 'admin';
    return 'home';
  });
  const [prefilledReg, setPrefilledReg] = useState<{ firstName: string; surname: string; email: string; eventId: string } | null>(null);

  // Admin and Dynamic Catalog States
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('gec_is_admin') === 'true';
  });

  const [teachings, setTeachings] = useState<Teaching[]>([]);

  // States initialized from local storage
  const [userRegistrations, setUserRegistrations] = useState<Registration[]>([]);
  const [userLibrary, setUserLibrary] = useState<Publication[]>([]);
  const [userDownloads, setUserDownloads] = useState<Teaching[]>([]);
  const [userSongDownloads, setUserSongDownloads] = useState<Song[]>([]);
  const [allBackendRegistrations, setAllBackendRegistrations] = useState<Registration[]>([]);
  const [allSubscribers, setAllSubscribers] = useState<Subscriber[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Load state from local storage on mount
  useEffect(() => {
    try {
      // Delete user registration information for Edifice Conference as requested
      const savedRegs = localStorage.getItem('gec_user_registrations') || localStorage.getItem('cci_user_registrations');
      if (savedRegs) {
        const parsed: Registration[] = JSON.parse(savedRegs);
        const filtered = parsed.filter(r => r.eventId !== 'edifice-conference-2026' && !r.eventTitle?.toLowerCase().includes('edifice'));
        setUserRegistrations(filtered);
        localStorage.setItem('gec_user_registrations', JSON.stringify(filtered));
      } else {
        setUserRegistrations([]);
      }

      const savedDownloads = localStorage.getItem('gec_user_downloads') || localStorage.getItem('cci_user_downloads');
      const savedSongDownloads = localStorage.getItem('gec_user_song_downloads');

      setUserLibrary([]);
      if (savedDownloads) setUserDownloads(JSON.parse(savedDownloads));
      if (savedSongDownloads) setUserSongDownloads(JSON.parse(savedSongDownloads));
    } catch (e) {
      console.error('Failed to load portal states', e);
    }
  }, []);

  // Handle scrolling to toggle Back to Top floating visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load teachings from Supabase on mount and listen to updates
  useEffect(() => {
    let active = true;
    const loadTeachings = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('teachings')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (!error && data && active) {
            const mapped: Teaching[] = data.map((t: any) => ({
              id: t.id,
              title: t.title || '',
              preacher: t.speaker || t.preacher || 'Pastor Abiodun Adebayo',
              series: t.category || t.series || 'Sermon',
              duration: t.duration || '45 mins',
              date: t.date || '',
              description: t.description || 'No description provided.',
              audioUrl: t.audio_url || t.audioUrl || '',
              coverUrl: t.cover_url || t.coverUrl || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
              downloadCount: t.download_count || t.downloadCount || 0,
              size: t.size || '18.5 MB'
            }));
            setTeachings(mapped);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load teachings from Supabase:', err);
      }
    };

    loadTeachings();

    const handleTeachingsUpdate = () => {
      loadTeachings();
    };

    window.addEventListener('gec_teachings_updated', handleTeachingsUpdate);

    return () => {
      active = false;
      window.removeEventListener('gec_teachings_updated', handleTeachingsUpdate);
    };
  }, []);

  // Listen to popstate and initial URL path for our hidden admin routes (/crosswordmedia, /admin)
  useEffect(() => {
    const handlePath = () => {
      if (window.location.pathname === '/crosswordmedia') {
        setActiveTab('crosswordmedia');
      } else if (window.location.pathname === '/admin') {
        setActiveTab('admin');
      }
    };
    handlePath();
    window.addEventListener('popstate', handlePath);
    return () => window.removeEventListener('popstate', handlePath);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'crosswordmedia') {
      window.history.pushState(null, '', '/crosswordmedia');
    } else if (tab === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else {
      window.history.pushState(null, '', '/');
    }
  };

  // Save states to local storage on changes
  const updateIsAdmin = (value: boolean) => {
    setIsAdmin(value);
    localStorage.setItem('gec_is_admin', String(value));
  };

  const handleAddTeaching = async (newTeaching: Teaching) => {
    const updated = [newTeaching, ...teachings];
    setTeachings(updated);
    localStorage.setItem('gec_teachings_catalog', JSON.stringify(updated));

    try {
      if (supabase) {
        const { error } = await supabase
          .from('teachings')
          .insert([{
            id: newTeaching.id,
            title: newTeaching.title,
            speaker: newTeaching.preacher,
            category: newTeaching.series,
            duration: newTeaching.duration,
            date: newTeaching.date,
            audio_url: newTeaching.audioUrl,
            cover_url: newTeaching.coverUrl,
            created_at: new Date().toISOString()
          }]);
        if (error) throw error;
        console.log('Sermon uploaded to Supabase successfully');
      }
    } catch (err) {
      console.error('Failed to save teaching to Supabase', err);
    }
  };

  const handleDeleteTeaching = async (id: string) => {
    const updated = teachings.filter(t => t.id !== id);
    setTeachings(updated);
    localStorage.setItem('gec_teachings_catalog', JSON.stringify(updated));

    try {
      if (supabase) {
        const { error } = await supabase
          .from('teachings')
          .delete()
          .eq('id', id);
        if (error) throw error;
        console.log('Sermon deleted from Supabase successfully');
      }
    } catch (err) {
      console.error('Failed to delete teaching from Supabase', err);
    }
  };

  const updateRegistrations = (newRegs: Registration[]) => {
    setUserRegistrations(newRegs);
    localStorage.setItem('gec_user_registrations', JSON.stringify(newRegs));
  };

  const updateLibrary = (newLib: Publication[]) => {
    setUserLibrary(newLib);
    localStorage.setItem('gec_user_library', JSON.stringify(newLib));
  };

  const updateDownloads = (newDownloads: Teaching[]) => {
    setUserDownloads(newDownloads);
    localStorage.setItem('gec_user_downloads', JSON.stringify(newDownloads));
  };

  const updateSongDownloads = (newSongDownloads: Song[]) => {
    setUserSongDownloads(newSongDownloads);
    localStorage.setItem('gec_user_song_downloads', JSON.stringify(newSongDownloads));
  };

  // Add handlers
  const handleRegisterSuccess = async (registration: Registration) => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please verify backend connection.');
    }

    const firstName = registration.firstName || registration.userName.split(' ')[0] || '';
    const surname = registration.surname || registration.userName.split(' ').slice(1).join(' ') || '';

    // Insert into meeting_registrations table (single source of truth for Edifice registrations)
    const { error: meetingRegError } = await supabase
      .from("meeting_registrations")
      .insert({
        first_name: firstName,
        surname: surname,
        email: registration.userEmail,
        phone_number: registration.userPhone || '',
        address: registration.address || '',
        nearest_branch: registration.userBranch || '',
        age: registration.ageRange || '',
        expecations_prayer_request: registration.expectations || '',
        gender: registration.gender || '',
        how_you_heard: registration.howHeard || '',
        meeting_date: registration.eventDate || ''
      });

    if (meetingRegError) {
      console.error('Failed to save to meeting_registrations in Supabase:', meetingRegError);
      throw new Error(meetingRegError.message || 'Could not write registration record to Supabase.');
    }

    // Only update local view state when Supabase write succeeds
    const exists = userRegistrations.some(reg => reg.eventId === registration.eventId);
    if (!exists) {
      setUserRegistrations(prev => [...prev, registration]);
    }
  };

  const handleDeleteBackendRegistration = async (id: string) => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('registrations')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
      setAllBackendRegistrations(prev => prev.filter(reg => reg.id !== id));
    } catch (err) {
      console.error('Failed to delete registration from Supabase', err);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('subscribers')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
      setAllSubscribers(prev => prev.filter(sub => sub.id !== id));
    } catch (err) {
      console.error('Failed to delete subscriber from Supabase', err);
    }
  };

  const handlePurchaseSuccess = (publication: Publication) => {
    const exists = userLibrary.some(item => item.id === publication.id);
    if (!exists) {
      updateLibrary([...userLibrary, publication]);
    }
  };

  const handleDownloadSuccess = (teaching: Teaching) => {
    const exists = userDownloads.some(dl => dl.id === teaching.id);
    if (!exists) {
      updateDownloads([...userDownloads, teaching]);
    }
  };

  const handleSongDownloadSuccess = (song: Song) => {
    const exists = userSongDownloads.some(s => s.id === song.id);
    if (!exists) {
      updateSongDownloads([...userSongDownloads, song]);
    }
  };

  // Remove handlers
  const handleRemoveRegistration = async (id: string) => {
    const updated = userRegistrations.filter(reg => reg.id !== id);
    updateRegistrations(updated);

    if (supabase) {
      try {
        await supabase.from('registrations').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete registration from Supabase', err);
      }
    }
  };

  const handleClearRegistrations = async () => {
    updateRegistrations([]);
    localStorage.removeItem('gec_user_registrations');
    localStorage.removeItem('cci_user_registrations');

    if (supabase) {
      try {
        await supabase.from('registrations').delete().neq('id', '');
      } catch (err) {
        console.error('Failed to clear registrations from Supabase', err);
      }
    }
  };

  const handleRemoveLibrary = (id: string) => {
    updateLibrary(userLibrary.filter(item => item.id !== id));
  };

  const handleRemoveDownload = (id: string) => {
    updateDownloads(userDownloads.filter(dl => dl.id !== id));
  };

  const handleRemoveSongDownload = (id: string) => {
    updateSongDownloads(userSongDownloads.filter(s => s.id !== id));
  };

  // Auto scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  if (activeTab === 'crosswordmedia') {
    return (
      <AdminLogin
        onLoginSuccess={() => handleTabChange('admin')}
        onNavigateHome={() => handleTabChange('home')}
      />
    );
  }

  if (activeTab === 'admin') {
    return (
      <CrosswordMedia
        onClose={() => handleTabChange('home')}
        onNavigateHome={() => handleTabChange('home')}
      />
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#F7F5F0] text-[#141416] flex flex-col justify-between w-full max-w-full overflow-x-hidden" 
      id="app-root-container"
    >
      
      {/* Dynamic Header / Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        registeredCount={userRegistrations.length}
      />

      {/* Main Content Sections */}
      <main className="flex-grow w-full max-w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-full overflow-x-hidden"
          >
            {activeTab === 'home' && (
              <Hero 
                onNavigate={setActiveTab} 
                userRegistrations={userRegistrations}
              />
            )}

            {activeTab === 'about' && (
              <AboutUs 
                onNavigate={setActiveTab} 
              />
            )}

            {activeTab === 'ministries' && (
              <Ministries 
                onNavigate={setActiveTab} 
              />
            )}

            {activeTab === 'meetings' && (
              <Meetings 
                onRegisterSuccess={handleRegisterSuccess} 
                userRegistrations={userRegistrations} 
                prefilledReg={prefilledReg}
                onClearPrefilled={() => setPrefilledReg(null)}
                onRemoveRegistration={handleRemoveRegistration}
                onClearRegistrations={handleClearRegistrations}
              />
            )}

            {activeTab === 'teachings' && (
              <Teachings 
                onDownloadSuccess={handleDownloadSuccess} 
                userDownloads={userDownloads} 
                teachingsList={teachings}
                onAddTeaching={handleAddTeaching}
                isAdmin={isAdmin}
                onToggleAdmin={updateIsAdmin}
                onDeleteTeaching={handleDeleteTeaching}
              />
            )}

            {activeTab === 'publications' && (
              <Publications 
                onPurchaseSuccess={handlePurchaseSuccess} 
                userLibrary={userLibrary} 
              />
            )}

            {activeTab === 'branches' && (
              <Branches 
                initialSubTab="branches" 
                onSubTabChange={(subTab) => setActiveTab(subTab)} 
              />
            )}

            {activeTab === 'cells' && (
              <Branches 
                initialSubTab="cells" 
                onSubTabChange={(subTab) => setActiveTab(subTab)} 
              />
            )}

            {activeTab === 'songs' && (
              <Songs
                userSongDownloads={userSongDownloads}
                onSongDownloadSuccess={handleSongDownloadSuccess}
                isAdmin={isAdmin}
              />
            )}


          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Details */}
      <Footer activeTab={activeTab} />

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center border bg-[#A36B3B] hover:bg-[#8D5A30] text-white shadow-[#A36B3B]/25 border-[#C28B57]/30"
            id="floating-back-to-top"
            title="Scroll to top"
          >
            <ArrowUp className="h-5 w-5 stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
