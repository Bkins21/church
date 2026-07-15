import { useState, ChangeEvent, FormEvent } from 'react';
import { User, Ticket, BookOpen, Download, Calendar, Mail, Phone, MapPin, QrCode, Trash2, Heart, Award, Sparkles, CheckCircle, Edit3, Users, ShieldAlert, ShieldCheck, Lock, Unlock, Plus, FileAudio, X } from 'lucide-react';
import { Registration, Publication, Teaching, Song, Subscriber } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PortalProps {
  userRegistrations: Registration[];
  userLibrary: Publication[];
  userDownloads: Teaching[];
  userSongDownloads?: Song[];
  onRemoveRegistration: (id: string) => void;
  onRemoveLibrary: (id: string) => void;
  onRemoveDownload: (id: string) => void;
  onRemoveSongDownload?: (id: string) => void;
  onNavigate: (tab: string) => void;
  isAdmin?: boolean;
  onToggleAdmin?: (value: boolean) => void;
  onAddTeaching?: (teaching: Teaching) => void;
  allBackendRegistrations?: Registration[];
  onDeleteBackendRegistration?: (id: string) => void;
  allSubscribers?: Subscriber[];
  onDeleteSubscriber?: (id: string) => void;
  onClearRegistrations?: () => void;
}

export default function Portal({
  userRegistrations,
  userLibrary,
  userDownloads,
  userSongDownloads = [],
  onRemoveRegistration,
  onRemoveLibrary,
  onRemoveDownload,
  onRemoveSongDownload,
  onNavigate,
  isAdmin = false,
  onToggleAdmin,
  onAddTeaching,
  allBackendRegistrations = [],
  onDeleteBackendRegistration,
  allSubscribers = [],
  onDeleteSubscriber,
  onClearRegistrations
}: PortalProps) {
  // Member profile state
  const [profileName, setProfileName] = useState(() => localStorage.getItem('gec_member_name') || 'Faithful Partner');
  const [profileBranch, setProfileBranch] = useState(() => localStorage.getItem('gec_member_branch') || 'GEC Lagos Island (Lekki HQ)');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activePortalTab, setActivePortalTab] = useState<'passes' | 'books' | 'audio' | 'database' | 'subscribers'>('passes');
  
  const [joinedCell, setJoinedCell] = useState<{
    cellId: string;
    cellName: string;
    leaderName: string;
    location: string;
    joinDate: string;
    landmark: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('gec_joined_cell');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const saveProfile = () => {
    localStorage.setItem('gec_member_name', profileName);
    localStorage.setItem('gec_member_branch', profileBranch);
    setIsEditingProfile(false);
  };

  const handleLeaveCell = () => {
    if (confirm('Are you sure you want to leave your current cell group?')) {
      localStorage.removeItem('gec_joined_cell');
      setJoinedCell(null);
    }
  };

  // Admin and Upload states
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Upload Form states
  const [title, setTitle] = useState('');
  const [series, setSeries] = useState('');
  const [preacher, setPreacher] = useState('Pastor Abiodun Adebayo');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('45m');
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
      duration: duration.trim(),
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
      setDuration('45m');
      setAudioUrl('');
      setUploadedFileName('');
      setIsUploadModalOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="portal-view">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          GEC Covenant Portal
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 mx-auto mb-5 rounded-full" />
        <p className="text-sm sm:text-base text-slate-300">
          Welcome to your personalized digital ecosystem. Manage your active entrance tickets for conferences, review study publications, and listen to sermon series you’ve collected.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Membership Card Badge */}
        <div className="lg:col-span-4" id="portal-member-card">
          <div className="bg-gradient-to-b from-[#0a1128] to-[#040814] border border-cci-blue-700/60 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            {/* Visual background details */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cci-gold-500/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-cci-blue-800/20 rounded-full blur-2xl" />

            {/* Top header */}
            <div className="flex justify-between items-center pb-4 border-b border-cci-blue-800/80 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 p-[1px]">
                  <div className="w-full h-full rounded-full bg-[#040814] flex items-center justify-center">
                    <span className="font-church font-bold text-xs text-cci-gold-400">GEC</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-300 uppercase">Partner Card</span>
              </div>
              <Sparkles className="h-4 w-4 text-cci-gold-400 animate-pulse" />
            </div>

            {/* Profile Avatar & Details */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-cci-blue-800 border-2 border-cci-gold-500/30 flex items-center justify-center text-cci-gold-400 text-3xl font-bold font-display shadow-lg relative">
                <User className="h-10 w-10 text-cci-gold-400" />
                <div className="absolute bottom-0 right-0 bg-emerald-500 p-1.5 rounded-full border-2 border-[#040814] shadow animate-pulse" />
              </div>

              {isEditingProfile ? (
                <div className="w-full mt-6 space-y-3">
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500 uppercase text-left mb-1">Partner Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500 uppercase text-left mb-1">Campus Branch</label>
                    <select
                      value={profileBranch}
                      onChange={(e) => setProfileBranch(e.target.value)}
                      className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="GEC Lagos Island (Lekki HQ)">GEC Lagos Island (Lekki HQ)</option>
                      <option value="GEC Lagos Mainland (Ikeja)">GEC Lagos Mainland (Ikeja)</option>
                      <option value="GEC Abuja Campus">GEC Abuja Campus</option>
                      <option value="GEC London Campus">GEC London Campus</option>
                      <option value="GEC Houston Campus">GEC Houston Campus</option>
                      <option value="GEC Ibadan Campus">GEC Ibadan Campus</option>
                      <option value="GEC Virtual Campus (Online Only)">GEC Virtual Campus (Online Only)</option>
                    </select>
                  </div>
                  <button
                    onClick={saveProfile}
                    className="w-full py-2 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 hover:from-cci-gold-500 hover:to-cci-gold-300 text-[#040814] font-display font-bold text-xs uppercase tracking-wider rounded-lg mt-2 shadow transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="mt-5">
                  <h3 className="font-display font-bold text-lg text-white flex items-center justify-center gap-1.5">
                    {profileName}
                    <button onClick={() => setIsEditingProfile(true)} className="p-1 hover:text-cci-gold-300 text-slate-400 rounded transition-colors" title="Edit Partner details">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">{profileBranch}</p>
                </div>
              )}
            </div>

            {/* Metrics stats */}
            <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-cci-blue-800/80 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#040814]/50 border border-cci-blue-850">
                <span className="block font-mono font-bold text-cci-gold-400 text-base">{userRegistrations.length}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-sans">Passes</span>
              </div>
              <div className="p-2 rounded-xl bg-[#040814]/50 border border-cci-blue-850">
                <span className="block font-mono font-bold text-cci-gold-400 text-base">{userLibrary.length}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-sans">Books</span>
              </div>
              <div className="p-2 rounded-xl bg-[#040814]/50 border border-cci-blue-850">
                <span className="block font-mono font-bold text-cci-gold-400 text-base">{userDownloads.length}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-sans">Sermons</span>
              </div>
            </div>
          </div>

          {/* Connected Cell Section */}
          <div className="mt-6 bg-[#0a1128]/70 border border-cci-blue-800/40 rounded-3xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-2 pb-3 border-b border-cci-blue-800/60 mb-4">
              <Users className="h-4.5 w-4.5 text-cci-gold-400" />
              <h4 className="font-display font-bold text-xs tracking-wider text-slate-200 uppercase">My Home Cell</h4>
            </div>

            {joinedCell ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-cci-gold-400 bg-cci-gold-500/10 px-2 py-0.5 rounded border border-cci-gold-500/15">
                    Active Member
                  </span>
                  <h5 className="font-display font-bold text-sm text-white mt-2">{joinedCell.cellName}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Leader: <strong className="text-slate-300 font-medium">{joinedCell.leaderName}</strong></p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-[#040814]/40 border border-cci-blue-850 p-3 rounded-xl font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Region:</span>
                    <span>{joinedCell.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Joined:</span>
                    <span>{joinedCell.joinDate}</span>
                  </div>
                  {joinedCell.landmark && (
                    <div className="flex flex-col border-t border-slate-800/40 pt-1.5 mt-1.5 text-left">
                      <span className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Landmark:</span>
                      <span className="text-slate-300 text-[11px] truncate">{joinedCell.landmark}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLeaveCell}
                  className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-red-900/30 transition-all"
                >
                  Leave Cell Group
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  You have not connected to any GEC Home Cell group yet.
                </p>
                <button
                  onClick={() => onNavigate('cells')}
                  className="w-full py-2.5 bg-gradient-to-r from-cci-gold-600 to-cci-gold-500 text-[#040814] hover:from-cci-gold-500 hover:to-cci-gold-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                >
                  Find a Home Cell
                </button>
              </div>
            )}
          </div>

          {/* Admin Control Console Card */}
          <div className="mt-6 bg-[#0a1128]/70 border border-cci-blue-800/40 rounded-3xl p-5 shadow-lg relative overflow-hidden animate-fade-in" id="admin-access-card">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cci-gold-500/5 rounded-full blur-xl" />
            <div className="flex items-center justify-between pb-3 border-b border-cci-blue-800/60 mb-4">
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="h-4.5 w-4.5 text-cci-gold-400" />
                )}
                <h4 className="font-display font-bold text-xs tracking-wider text-slate-200 uppercase">
                  {isAdmin ? "Admin Console" : "Admin privileges"}
                </h4>
              </div>
            </div>

            {isAdmin ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                  <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Authorized</span>
                    <span className="text-[10px] text-slate-400">Audio Upload Unlocked</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Administrator rights are fully active. You can now publish dynamic downloadable audio teachings.
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="w-full py-2.5 bg-gradient-to-r from-cci-gold-600 to-cci-gold-500 hover:from-cci-gold-500 hover:to-cci-gold-400 text-[#040814] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                    id="btn-portal-open-upload"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Upload Audio Track</span>
                  </button>

                  <button
                    onClick={handleDeauthAdmin}
                    className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-red-900/30 transition-all"
                    id="btn-portal-revoke-admin"
                  >
                    Revoke privileges
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter the administrative passcode to authenticate permissions and enable the sermon audio uploader.
                </p>

                <div className="space-y-2">
                  <div>
                    <input
                      type="password"
                      placeholder="Enter passcode (try 'admin')"
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value);
                        setPasscodeError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAuthAdmin();
                      }}
                      className="w-full bg-[#040814] border border-cci-blue-800/80 focus:border-cci-gold-500 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                      id="input-admin-passcode"
                    />
                  </div>

                  {passcodeError && (
                    <p className="text-[10px] text-amber-500 font-mono">{passcodeError}</p>
                  )}

                  <button
                    onClick={handleAuthAdmin}
                    className="w-full py-2 bg-gradient-to-r from-cci-gold-600 to-cci-gold-500 text-[#040814] hover:from-cci-gold-500 hover:to-cci-gold-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                    id="btn-portal-auth-admin"
                  >
                    Authorize Console
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Tabbed Aggregate Library */}
        <div className="lg:col-span-8 bg-[#0a1128]/20 border border-cci-blue-800/50 rounded-3xl p-6 sm:p-8" id="portal-assets-panel">
          {/* Header tabs */}
          <div className="flex border-b border-cci-blue-800 pb-4 mb-6 gap-2 overflow-x-auto">
            {[
              { id: 'passes', label: 'My Meeting Passes', icon: Ticket, count: userRegistrations.length },
              { id: 'books', label: 'My Bookshelf', icon: BookOpen, count: userLibrary.length },
              { id: 'audio', label: 'Audio Vault', icon: Download, count: userDownloads.length + userSongDownloads.length },
              ...(isAdmin ? [
                { id: 'database', label: 'Forms Database', icon: Users, count: allBackendRegistrations.length },
                { id: 'subscribers', label: 'Subscribers', icon: Mail, count: allSubscribers.length }
              ] : [])
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activePortalTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePortalTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0
                    ${isSelected
                      ? 'bg-cci-gold-500 text-[#040414] shadow-md shadow-cci-gold-600/10'
                      : 'bg-[#040814]/40 border border-cci-blue-850 text-slate-400 hover:text-slate-200'
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${isSelected ? 'bg-[#040814] text-cci-gold-400' : 'bg-cci-blue-800 text-slate-300'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content panel */}
          <div>
            {/* TICKET PASSES TAB */}
            {activePortalTab === 'passes' && (
              <div className="space-y-6" id="portal-passes-content">
                {userRegistrations.length > 0 && onClearRegistrations && (
                  <div className="flex justify-between items-center bg-cci-blue-900/20 border border-cci-blue-800/40 p-4 rounded-2xl gap-4">
                    <div className="text-xs text-slate-400">
                      You have <strong className="text-white font-mono">{userRegistrations.length}</strong> active meeting registration pass{userRegistrations.length > 1 ? 'es' : ''}.
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear your entire registration history? This will delete all active passes from your device.')) {
                          onClearRegistrations();
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear All Passes</span>
                    </button>
                  </div>
                )}
                {userRegistrations.length > 0 ? (
                  userRegistrations.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-[#040814] border border-cci-blue-800 rounded-2xl overflow-hidden relative shadow-md flex flex-col sm:flex-row"
                    >
                      {/* Left colored bar */}
                      <div className="w-full sm:w-2 bg-gradient-to-b from-cci-gold-600 to-cci-gold-400 h-2 sm:h-auto shrink-0" />
                      
                      <div className="p-5 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-cci-blue-850 text-cci-gold-400 font-mono text-[9px] font-bold uppercase tracking-widest rounded">
                              {ticket.mode}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{ticket.registrationDate}</span>
                          </div>

                          <h4 className="font-display font-bold text-base text-slate-100 line-clamp-1">{ticket.eventTitle}</h4>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-cci-gold-500" />
                            {ticket.eventDate}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-cci-gold-500" />
                            <span className="truncate">{ticket.eventLocation}</span>
                          </p>
                        </div>

                        {/* QR Code section & cancel action */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-cci-blue-850 pt-4 sm:pt-0 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="text-left sm:text-right">
                              <span className="text-[9px] text-slate-500 block uppercase font-mono">Passcode</span>
                              <strong className="text-cci-gold-400 font-mono text-xs tracking-wider">{ticket.ticketCode}</strong>
                            </div>
                            <div className="bg-white p-1.5 rounded-lg shrink-0">
                              <QrCode className="h-8 w-8 text-black" />
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to cancel this registration?')) {
                                onRemoveRegistration(ticket.id);
                              }
                            }}
                            className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-950/20 transition-all flex items-center gap-1.5 text-xs font-semibold"
                            title="Cancel registration"
                          >
                            <Trash2 className="h-4 w-4" /> Cancel Pass
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <Ticket className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <h4 className="font-display font-bold text-sm text-slate-300">No active meeting passes</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">You haven’t registered for any meetings yet. Save your seat for upcoming programs.</p>
                    <button
                      onClick={() => onNavigate('meetings')}
                      className="px-4 py-2 bg-cci-blue-800 hover:bg-cci-blue-700 text-cci-gold-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-cci-blue-700/60"
                    >
                      Browse Upcoming Meetings
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* BOOKSHELF TAB */}
            {activePortalTab === 'books' && (
              <div className="space-y-4" id="portal-bookshelf-content">
                {userLibrary.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userLibrary.map((book) => (
                      <div
                        key={book.id}
                        className="bg-[#040814] border border-cci-blue-800/80 rounded-2xl p-4 flex gap-4 items-center justify-between"
                      >
                        <div className="flex gap-3 items-center min-w-0">
                          <img
                            src={book.coverUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-12 h-16 object-cover rounded shadow"
                          />
                          <div className="min-w-0">
                            <span className="text-[8px] font-mono uppercase bg-cci-blue-850 px-1.5 py-0.5 rounded text-cci-gold-400 font-bold">{book.type}</span>
                            <h4 className="font-display font-bold text-sm text-slate-100 mt-1.5 truncate">{book.title}</h4>
                            <p className="text-[10px] text-slate-500 font-sans mt-0.5">Author: {book.author}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            onClick={() => {
                              alert(`Simulating reader launch for "${book.title}". Opening e-reader interface...`);
                            }}
                            className="p-2 rounded bg-cci-blue-800 text-cci-gold-400 hover:bg-cci-gold-500 hover:text-[#040814] transition-all"
                            title="Read e-book"
                          >
                            <BookOpen className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => onRemoveLibrary(book.id)}
                            className="text-slate-600 hover:text-red-400 p-1 rounded hover:bg-red-950/20 transition-all"
                            title="Remove from shelf"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <h4 className="font-display font-bold text-sm text-slate-300">Your bookshelf is empty</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">Order books or download study guides by Pastor Abiodun Adebayo to feed your spirit.</p>
                    <button
                      onClick={() => onNavigate('publications')}
                      className="px-4 py-2 bg-cci-blue-800 hover:bg-cci-blue-700 text-cci-gold-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-cci-blue-700/60"
                    >
                      Explore Publications
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* AUDIO TEACHINGS TAB */}
            {activePortalTab === 'audio' && (
              <div className="space-y-6" id="portal-sermons-content">
                {userDownloads.length === 0 && userSongDownloads.length === 0 ? (
                  <div className="text-center py-16">
                    <Download className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <h4 className="font-display font-bold text-sm text-slate-300">Your Audio Vault is empty</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">Stream sermons or Crossworship songs and click download to cache them in your vault.</p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => onNavigate('teachings')}
                        className="px-4 py-2 bg-cci-blue-800 hover:bg-cci-blue-700 text-cci-gold-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-cci-blue-700/60"
                      >
                        Listen to Teachings
                      </button>
                      <button
                        onClick={() => onNavigate('songs')}
                        className="px-4 py-2 bg-[#040814]/40 hover:bg-cci-blue-850 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl border border-cci-blue-800"
                      >
                        Browse Songs
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Apostolic Sermons Section */}
                    {userDownloads.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-display font-bold text-[11px] uppercase tracking-wider text-cci-gold-400 flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cci-gold-500" />
                          Apostolic Sermons & Teachings ({userDownloads.length})
                        </h5>
                        {userDownloads.map((sermon) => (
                          <div
                            key={sermon.id}
                            className="bg-[#040814] border border-cci-blue-800/80 rounded-2xl p-4 flex items-center justify-between gap-4"
                          >
                            <div className="flex gap-4 items-center min-w-0">
                              <img
                                src={sermon.coverUrl}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-xl object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-[8px] font-mono uppercase text-cci-gold-400 font-bold tracking-wider">{sermon.series}</span>
                                <h4 className="font-display font-bold text-sm text-slate-100 truncate mt-0.5">{sermon.title}</h4>
                                <p className="text-[10px] text-slate-500">{sermon.preacher} • {sermon.duration}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                onClick={() => {
                                  onNavigate('teachings');
                                  alert(`Loading stream for: "${sermon.title}" inside the media player...`);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-cci-gold-500 hover:bg-cci-gold-400 text-[#040814] text-xs font-bold font-display uppercase tracking-wider transition-colors"
                              >
                                Listen
                              </button>
                              
                              <button
                                onClick={() => onRemoveDownload(sermon.id)}
                                className="text-slate-600 hover:text-red-400 p-1.5 rounded hover:bg-red-950/20 transition-all"
                                title="Remove download"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Worship Anthems Section */}
                    {userSongDownloads.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-display font-bold text-[11px] uppercase tracking-wider text-cci-gold-400 flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cci-gold-500" />
                          Crossworship Worship Anthems ({userSongDownloads.length})
                        </h5>
                        {userSongDownloads.map((song) => (
                          <div
                            key={song.id}
                            className="bg-[#040814] border border-cci-blue-800/80 rounded-2xl p-4 flex items-center justify-between gap-4"
                          >
                            <div className="flex gap-4 items-center min-w-0">
                              <img
                                src={song.coverUrl}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-xl object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-[8px] font-mono uppercase text-cci-gold-400 font-bold tracking-wider">{song.album}</span>
                                <h4 className="font-display font-bold text-sm text-slate-100 truncate mt-0.5">{song.title}</h4>
                                <p className="text-[10px] text-slate-500">{song.artist} • {song.duration}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                onClick={() => {
                                  onNavigate('songs');
                                  alert(`Loading playback for worship song: "${song.title}" in music player...`);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-cci-gold-500 hover:bg-cci-gold-400 text-[#040814] text-xs font-bold font-display uppercase tracking-wider transition-colors"
                              >
                                Listen
                              </button>
                              
                              <button
                                onClick={() => onRemoveSongDownload && onRemoveSongDownload(song.id)}
                                className="text-slate-600 hover:text-red-400 p-1.5 rounded hover:bg-red-950/20 transition-all"
                                title="Remove song download"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* DATABASE FORMS TAB (Admin Only) */}
            {activePortalTab === 'database' && isAdmin && (
              <div className="space-y-4 font-sans" id="portal-database-content">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#040814]/40 border border-cci-blue-800/60 rounded-2xl p-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Backend Forms Database</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Collect and monitor meeting registration forms live in Firestore.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono rounded-lg flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Live Firestore
                    </span>
                  </div>
                </div>

                {allBackendRegistrations.length > 0 ? (
                  <div className="space-y-3">
                    {allBackendRegistrations.map((form) => (
                      <div
                        key={form.id}
                        className="bg-[#040814] border border-cci-blue-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-cci-blue-600"
                      >
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-cci-gold-950/40 text-cci-gold-400 font-mono text-[9px] font-bold rounded uppercase tracking-wider">
                              {form.mode || 'physical'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-semibold">{form.ticketCode}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{form.registrationDate}</span>
                          </div>
                          
                          <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                            {form.eventTitle}
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-300 pt-1">
                            <p className="text-xs flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-cci-gold-500 shrink-0" />
                              <span className="font-semibold">{form.userName}</span>
                            </p>
                            <p className="text-xs flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-cci-gold-500 shrink-0" />
                              <span className="truncate">{form.userEmail}</span>
                            </p>
                            <p className="text-xs flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-cci-gold-500 shrink-0" />
                              <span>{form.userPhone}</span>
                            </p>
                            <p className="text-xs flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-cci-gold-500 shrink-0" />
                              <span className="truncate">{form.userBranch}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 border-cci-blue-850/40 pt-3 md:pt-0">
                          <button
                            onClick={() => {
                              if (confirm(`Delete registration for "${form.userName}" from backend database?`)) {
                                if (onDeleteBackendRegistration) onDeleteBackendRegistration(form.id);
                              }
                            }}
                            className="p-2 bg-red-950/20 hover:bg-red-950/60 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-500/50 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-semibold"
                            title="Delete Form Entry"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="md:hidden">Delete Entry</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-black/20 border border-cci-blue-850 rounded-2xl">
                    <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <h4 className="font-display font-bold text-sm text-slate-300">No Collected Registrations</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Once members register for church meetings, their backend form submissions will show up here.</p>
                  </div>
                )}
              </div>
            )}

            {/* SUBSCRIBERS TAB (Admin Only) */}
            {activePortalTab === 'subscribers' && isAdmin && (
              <div className="space-y-4 font-sans" id="portal-subscribers-content">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#040814]/40 border border-cci-blue-800/60 rounded-2xl p-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Newsletter Subscribers</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Collect and manage subscribers from the newsletter updates and publications form.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono rounded-lg flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Live Firestore
                    </span>
                  </div>
                </div>

                {allSubscribers.length > 0 ? (
                  <div className="space-y-3">
                    {allSubscribers.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-[#040814] border border-cci-blue-800 rounded-xl p-4 flex flex-row items-center justify-between gap-4 transition-all hover:border-cci-blue-600"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-cci-gold-400 shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-slate-200 truncate">{sub.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <span>ID: {sub.id}</span>
                            <span>•</span>
                            <span>Subscribed: {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString() : 'N/A'}</span>
                          </div>
                        </div>

                        <div className="flex shrink-0">
                          <button
                            onClick={() => {
                              if (confirm(`Remove subscriber "${sub.email}" from the database?`)) {
                                if (onDeleteSubscriber) onDeleteSubscriber(sub.id);
                              }
                            }}
                            className="p-2 bg-red-950/20 hover:bg-red-950/60 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-500/50 rounded-xl transition-all flex items-center justify-center"
                            title="Remove Subscriber"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-black/20 border border-cci-blue-850 rounded-2xl">
                    <Mail className="h-10 w-10 text-slate-600 mx-auto mb-3 animate-pulse" />
                    <h4 className="font-display font-bold text-sm text-slate-300">No Newsletter Subscribers</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Once members enter their email to subscribe to updates and publications, they will be listed here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Audio Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto" id="portal-upload-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0a1128] border border-cci-blue-700/60 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 my-8"
              id="upload-modal-container"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadedFileName('');
                  setAudioUrl('');
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 bg-black/35 rounded-full transition-colors z-10"
                id="btn-close-upload-modal"
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
                    id="input-sermon-title"
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
                      id="input-sermon-series"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5">Duration *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 55m or 1h 12m"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-2.5 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                      id="input-sermon-duration"
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
                    id="input-sermon-preacher"
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
                    id="input-sermon-description"
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
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5
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
                      id="file-audio-upload"
                    />
                    <label htmlFor="file-audio-upload" className="w-full h-full cursor-pointer flex flex-col items-center justify-center">
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
                  className={`w-full py-3 bg-gradient-to-r from-cci-gold-600 to-cci-gold-500 hover:from-cci-gold-500 hover:to-cci-gold-400 text-[#040814] font-display font-bold text-xs uppercase tracking-wider rounded-xl mt-4 shadow-lg transition-all flex items-center justify-center gap-1.5
                    ${isUploadingFile ? 'opacity-50 pointer-events-none' : ''}`}
                  id="btn-publish-sermon"
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
