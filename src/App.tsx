import { useState, useEffect, FormEvent } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Meetings from './components/Meetings';
import Teachings from './components/Teachings';
import Publications from './components/Publications';
import Branches from './components/Branches';
import Gallery from './components/Gallery';
import Portal from './components/Portal';
import Footer from './components/Footer';
import Cells from './components/Cells';
import Songs from './components/Songs';
import { teachingsCatalog } from './data';
import Newsletter from './components/Newsletter';

import { Registration, Publication, Teaching, Song, Subscriber } from './types';
import { Play, Pause, X, Radio, MessageSquare, Send, Heart, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Firebase Firestore Imports
import { collection, setDoc, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
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

  // Load state from local storage on mount
  useEffect(() => {
    try {
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

  // Clear teachings and delete from Firestore on mount
  useEffect(() => {
    let active = true;
    const clearAllTeachings = async () => {
      try {
        localStorage.removeItem('gec_teachings_catalog');
        localStorage.removeItem('gec_user_downloads');
        setTeachings([]);

        const querySnapshot = await getDocs(collection(db, 'teachings'));
        querySnapshot.forEach(async (docSnap) => {
          try {
            await deleteDoc(doc(db, 'teachings', docSnap.id));
          } catch (e) {
            console.error('Failed to delete doc', docSnap.id, e);
          }
        });
      } catch (err) {
        console.error('Failed to clear teachings from Firestore on mount', err);
      }
    };

    clearAllTeachings();
    return () => {
      active = false;
    };
  }, []);

  // Sign in anonymously on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
        console.log('Signed in anonymously to Firebase Auth successfully.');
      } catch (err) {
        console.warn('Firebase Anonymous Auth is not enabled in your Firebase Console. Local storage will be used for persistence, which is fully functional.', err);
      }
    };
    initAuth();
  }, []);

  // Synchronize admin status with Firestore rules based on anonymous UID and local passcode
  const [isFirebaseAdminSynced, setIsFirebaseAdminSynced] = useState(false);

  useEffect(() => {
    let active = true;
    const syncAdminStatus = async () => {
      if (!auth.currentUser) {
        setIsFirebaseAdminSynced(false);
        return;
      }

      const uid = auth.currentUser.uid;
      if (isAdmin) {
        try {
          await setDoc(doc(db, 'admins', uid), { passcode: 'admin' });
          console.log('Synchronized Admin status with Firestore successfully');
          if (active) {
            setIsFirebaseAdminSynced(true);
          }
        } catch (err) {
          console.error('Failed to sync Admin status with Firestore', err);
          if (active) {
            setIsFirebaseAdminSynced(false);
          }
        }
      } else {
        try {
          await deleteDoc(doc(db, 'admins', uid));
          console.log('Removed Admin status from Firestore');
        } catch (err) {
          // Fine if already deleted or doesn't exist
        }
        if (active) {
          setIsFirebaseAdminSynced(false);
        }
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (active) {
        syncAdminStatus();
      }
    });

    if (auth.currentUser) {
      syncAdminStatus();
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, [isAdmin]);

  // Fetch collected registrations and subscribers from Firestore when Admin logs in and syncing completes
  useEffect(() => {
    let active = true;
    const fetchAllRegistrations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'registrations'));
        const regs: Registration[] = [];
        querySnapshot.forEach((d) => {
          regs.push(d.data() as Registration);
        });
        if (active) {
          setAllBackendRegistrations(regs);
        }
      } catch (err) {
        console.error('Failed to fetch collected registration forms from backend', err);
      }
    };

    const fetchAllSubscribers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'subscribers'));
        const subs: Subscriber[] = [];
        querySnapshot.forEach((d) => {
          subs.push(d.data() as Subscriber);
        });
        subs.sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());
        if (active) {
          setAllSubscribers(subs);
        }
      } catch (err) {
        console.error('Failed to fetch newsletter subscribers from backend', err);
      }
    };

    if (isAdmin && isFirebaseAdminSynced) {
      fetchAllRegistrations();
      fetchAllSubscribers();
    } else {
      setAllBackendRegistrations([]);
      setAllSubscribers([]);
    }
    return () => {
      active = false;
    };
  }, [isAdmin, isFirebaseAdminSynced]);

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
      await setDoc(doc(db, 'teachings', newTeaching.id), newTeaching);
      console.log('Sermon uploaded to Firestore successfully');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `teachings/${newTeaching.id}`);
    }
  };

  const handleDeleteTeaching = async (id: string) => {
    const updated = teachings.filter(t => t.id !== id);
    setTeachings(updated);
    localStorage.setItem('gec_teachings_catalog', JSON.stringify(updated));

    try {
      await deleteDoc(doc(db, 'teachings', id));
      console.log('Sermon deleted from Firestore successfully');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `teachings/${id}`);
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
      await setDoc(doc(db, 'registrations', registration.id), {
        ...registration,
        createdAt: new Date().toISOString()
      });
      if (isAdmin) {
        setAllBackendRegistrations(prev => [registration, ...prev]);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `registrations/${registration.id}`);
    }
  };

  const handleDeleteBackendRegistration = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'registrations', id));
      setAllBackendRegistrations(prev => prev.filter(reg => reg.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `registrations/${id}`);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'subscribers', id));
      setAllSubscribers(prev => prev.filter(sub => sub.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `subscribers/${id}`);
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

  return (
    <div className="min-h-screen bg-rich-black flex flex-col justify-between" id="app-root-container">
      
      {/* Dynamic Header / Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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

            {activeTab === 'portal' && (
              <Portal
                userRegistrations={userRegistrations}
                userLibrary={userLibrary}
                userDownloads={userDownloads}
                userSongDownloads={userSongDownloads}
                onRemoveRegistration={handleRemoveRegistration}
                onRemoveLibrary={handleRemoveLibrary}
                onRemoveDownload={handleRemoveDownload}
                onRemoveSongDownload={handleRemoveSongDownload}
                onNavigate={setActiveTab}
                isAdmin={isAdmin}
                onToggleAdmin={updateIsAdmin}
                onAddTeaching={handleAddTeaching}
                allBackendRegistrations={allBackendRegistrations}
                onDeleteBackendRegistration={handleDeleteBackendRegistration}
                allSubscribers={allSubscribers}
                onDeleteSubscriber={handleDeleteSubscriber}
                onClearRegistrations={handleClearRegistrations}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Details */}
      <Footer />
    </div>
  );
}
