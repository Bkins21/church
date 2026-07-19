import { useState, useEffect, FormEvent } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Meetings from './components/Meetings';
import Teachings from './components/Teachings';
import Publications from './components/Publications';
import Branches from './components/Branches';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import Cells from './components/Cells';
import Songs from './components/Songs';
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
      // Clear registrations once based on a run-once flag to clear previous history
      const hasClearedOnce = localStorage.getItem('gec_reg_cleared_by_ai_v2');
      if (!hasClearedOnce) {
        localStorage.removeItem('gec_user_registrations');
        localStorage.removeItem('cci_user_registrations');
        localStorage.setItem('gec_reg_cleared_by_ai_v2', 'true');
      }

      const savedRegs = localStorage.getItem('gec_user_registrations') || localStorage.getItem('cci_user_registrations');
      const savedLib = localStorage.getItem('gec_user_library') || localStorage.getItem('cci_user_library');
      const savedDownloads = localStorage.getItem('gec_user_downloads') || localStorage.getItem('cci_user_downloads');
      const savedSongDownloads = localStorage.getItem('gec_user_song_downloads');

      if (savedRegs) setUserRegistrations(JSON.parse(savedRegs));
      if (savedLib) setUserLibrary(JSON.parse(savedLib));
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

  // Load teachings from Supabase or localStorage on mount
  useEffect(() => {
    let active = true;
    const loadTeachings = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('teachings')
            .select('*')
            .order('date', { ascending: false });
          
          if (!error && data && active) {
            const mapped: Teaching[] = data.map((t: any) => ({
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
            setTeachings(mapped);
            localStorage.setItem('gec_teachings_catalog', JSON.stringify(mapped));
            return;
          }
        }
        
        // Fallback to localStorage if unconfigured or error
        const saved = localStorage.getItem('gec_teachings_catalog');
        if (saved && active) {
          setTeachings(JSON.parse(saved));
        } else if (active) {
          setTeachings([]);
        }
      } catch (err) {
        console.error('Failed to load teachings on mount', err);
      }
    };

    loadTeachings();
    return () => {
      active = false;
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
    const exists = userRegistrations.some(reg => reg.eventId === registration.eventId);
    if (!exists) {
      updateRegistrations([...userRegistrations, registration]);
    }

    try {
      if (supabase) {
        const { error } = await supabase
          .from('registrations')
          .insert([{
            id: registration.id,
            event_id: registration.eventId,
            event_name: registration.eventTitle,
            first_name: registration.userName.split(' ')[1] || registration.userName || '',
            surname: registration.userName.split(' ')[0] || '',
            email: registration.userEmail,
            phone: registration.userPhone || '',
            location: registration.userBranch || '',
            status: 'Registered',
            created_at: new Date().toISOString()
          }]);
        if (error) throw error;
        console.log('Registration saved to Supabase successfully');
      }
    } catch (err) {
      console.error('Failed to save registration to Supabase', err);
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
  const handleRemoveRegistration = (id: string) => {
    updateRegistrations(userRegistrations.filter(reg => reg.id !== id));
  };

  const handleClearRegistrations = () => {
    updateRegistrations([]);
    localStorage.removeItem('gec_user_registrations');
    localStorage.removeItem('cci_user_registrations');
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
    <div className="min-h-screen bg-rich-black flex flex-col justify-between" id="app-root-container">
      
      {/* Dynamic Header / Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        registeredCount={userRegistrations.length}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {activeTab === 'home' && (
              <>
                <Hero 
                  onNavigate={setActiveTab} 
                  userRegistrations={userRegistrations}
                  onStartRegistration={(firstName, surname, email) => {
                    setPrefilledReg({ firstName, surname, email, eventId: 'edifice-conference-2026' });
                    setActiveTab('meetings');
                  }}
                />
                <Meetings 
                  onRegisterSuccess={handleRegisterSuccess} 
                  userRegistrations={userRegistrations} 
                  prefilledReg={prefilledReg}
                  onClearPrefilled={() => setPrefilledReg(null)}
                  onClearRegistrations={handleClearRegistrations}
                />
                <Teachings 
                  onDownloadSuccess={handleDownloadSuccess} 
                  userDownloads={userDownloads} 
                  teachingsList={teachings}
                  onAddTeaching={handleAddTeaching}
                  isAdmin={isAdmin}
                  onToggleAdmin={updateIsAdmin}
                  onDeleteTeaching={handleDeleteTeaching}
                />
                <Newsletter />
              </>
            )}

            {activeTab === 'meetings' && (
              <Meetings 
                onRegisterSuccess={handleRegisterSuccess} 
                userRegistrations={userRegistrations} 
                prefilledReg={prefilledReg}
                onClearPrefilled={() => setPrefilledReg(null)}
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
              <Branches />
            )}

            {activeTab === 'gallery' && (
              <Gallery />
            )}

            {activeTab === 'cells' && (
              <Cells />
            )}

            {activeTab === 'songs' && (
              <Songs
                userSongDownloads={userSongDownloads}
                onSongDownloadSuccess={handleSongDownloadSuccess}
              />
            )}


          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Details */}
      <Footer />

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
            className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 text-[#040814] shadow-xl shadow-cci-gold-500/20 hover:from-cci-gold-500 hover:to-cci-gold-300 border border-cci-gold-400/25 transition-all duration-300 cursor-pointer flex items-center justify-center"
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
