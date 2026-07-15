import { useState, FormEvent } from 'react';
import { Users, MapPin, Calendar, Clock, UserCheck, Search, Check, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CellLeader {
  id: string;
  name: string;
  cellName: string;
  location: 'Magboro' | 'Yaba' | 'Itori' | 'Onikolobo';
  details: string;
  schedule: string;
  leaderTitle: string;
  avatarUrl: string;
}

export default function Cells() {
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<CellLeader | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  // Registration Form State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [nearestLandmark, setNearestLandmark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // GEC Cell Leaders list matching the requirements
  const cellLeadersList: CellLeader[] = [
    {
      id: 'cell-funaab',
      name: 'Bro Ayobami Komolafe',
      cellName: 'FUNAAB CELL',
      location: 'Onikolobo',
      details: 'FUNAAB Campus & environs, Abeokuta. Perfect for students and academic staff seeking rigorous theological discussions.',
      schedule: 'Every Friday, 5:30 PM',
      leaderTitle: 'Cell Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300&auto=format&fit=crop'
    },
    {
      id: 'cell-magboro-1',
      name: 'Sis. Stella Zubair',
      cellName: 'Magboro Cell 1',
      location: 'Magboro',
      details: 'Magboro Phase 1 and surrounding estates. A warm environment focusing on systematic bible study and corporate prayers.',
      schedule: 'Every Saturday, 5:00 PM',
      leaderTitle: 'Cell Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop'
    },
    {
      id: 'cell-magboro-2',
      name: 'Bro Joseph Danladi',
      cellName: 'Magboro Cell 2',
      location: 'Magboro',
      details: 'Magboro Phase 2 & border regions. Ideal for families and working professionals committed to daily prayerful discipline.',
      schedule: 'Every Saturday, 6:00 PM',
      leaderTitle: 'Cell Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop'
    },
    {
      id: 'cell-magboro-3',
      name: 'Pastor Tobi Olabode',
      cellName: 'Magboro Cell 3',
      location: 'Magboro',
      details: 'Serving the broader Magboro Expressway axis. Dynamic worship, intercession, and fellowship for spiritual empowerment.',
      schedule: 'Every Friday, 6:00 PM',
      leaderTitle: 'Resident Pastor',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop'
    },
    {
      id: 'cell-yaba',
      name: 'Pastor Kola Asaolu',
      cellName: 'Yaba Cell',
      location: 'Yaba',
      details: 'Yaba, Sabo, and Akoka axis. Connecting young professionals and university students around the Lagos Mainland.',
      schedule: 'Every Sunday, 5:00 PM',
      leaderTitle: 'Resident Pastor',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop'
    },
    {
      id: 'cell-itori',
      name: 'Sis. Taiwo Oseni',
      cellName: 'Itori Cell',
      location: 'Itori',
      details: 'Itori township and institutional environments. Grounded in the finished work of Christ and personal evangelism.',
      schedule: 'Every Saturday, 5:00 PM',
      leaderTitle: 'Cell Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
    },
    {
      id: 'cell-onikolobo-1',
      name: 'Pastor Ore Adebayo',
      cellName: 'Onikolobo Cell 1',
      location: 'Onikolobo',
      details: 'Onikolobo center, Abeokuta. Dedicated to raising believers with theological speed, solid biblical convictions, and love.',
      schedule: 'Every Sunday, 6:00 PM',
      leaderTitle: 'Resident Pastor',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop'
    },
    {
      id: 'cell-onikolobo-2',
      name: 'Pastor Clement Akintola',
      cellName: 'Onikolobo Cell 2',
      location: 'Onikolobo',
      details: 'Onikolobo Extension & housing estates. Focused on apostolic foundations, intensive intercession, and evangelical fire.',
      schedule: 'Every Saturday, 5:30 PM',
      leaderTitle: 'Resident Pastor',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop'
    }
  ];

  const locations = ['All', 'Magboro', 'Yaba', 'Itori', 'Onikolobo'];

  // Filter cell leaders
  const filteredCells = cellLeadersList.filter((cell) => {
    const matchesLocation = selectedLocation === 'All' || cell.location === selectedLocation;
    const matchesSearch = 
      cell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cell.cellName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cell.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLocation && matchesSearch;
  });

  const handleOpenJoin = (cell: CellLeader) => {
    setSelectedCell(cell);
    // Auto-fill from localStorage if available
    const savedName = localStorage.getItem('gec_member_name') || localStorage.getItem('cci_member_name') || '';
    setUserName(savedName);
    setShowJoinModal(true);
    setSubmitSuccess(false);
  };

  const handleJoinSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || !userPhone) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Save joined cell information to local storage
      const joinedCellData = {
        cellId: selectedCell?.id,
        cellName: selectedCell?.cellName,
        leaderName: selectedCell?.name,
        location: selectedCell?.location,
        joinDate: new Date().toLocaleDateString(),
        landmark: nearestLandmark
      };

      localStorage.setItem('gec_joined_cell', JSON.stringify(joinedCellData));
      
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Auto-update member name if not set
      if (!localStorage.getItem('gec_member_name')) {
        localStorage.setItem('gec_member_name', userName);
      }
    }, 1500);
  };

  return (
    <div className="py-24 bg-[#040814]" id="gec-cells-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Connect to a GEC Home Cell
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 mx-auto mb-5 rounded-full" />
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Home Cells are small groups that meet weekly for systematic Bible study, sincere fellowship, and corporate intercession. Find a family near you in our primary locations.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-[#0a1128]/40 border border-cci-blue-800/40 rounded-3xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur">
          {/* Location Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`px-4 py-2.5 rounded-xl font-display text-xs font-semibold tracking-wider uppercase transition-all duration-300
                  ${selectedLocation === loc
                    ? 'bg-gradient-to-r from-cci-gold-600 to-cci-gold-500 text-[#040814] shadow-md shadow-cci-gold-600/10'
                    : 'bg-[#040814] hover:bg-cci-blue-800/30 text-slate-300 border border-cci-blue-800/50 hover:text-white'
                  }`}
              >
                {loc === 'All' ? 'All Locations' : loc}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by cell, leader, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#040814] border border-cci-blue-800/60 focus:border-cci-gold-500 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
            />
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
          </div>
        </div>

        {/* Cells Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCells.map((cell) => (
              <motion.div
                key={cell.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0a1128]/70 border border-cci-blue-800/40 rounded-3xl overflow-hidden hover:border-cci-gold-500/50 transition-all flex flex-col justify-between group shadow-xl"
              >
                {/* Image & Header Card */}
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-4 mb-5">
                    {/* Leader Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-cci-blue-700/60 p-[1px] bg-[#040814]">
                        <img
                          src={cell.avatarUrl}
                          alt={cell.name}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-cci-gold-600 to-cci-gold-500 text-[#040814] rounded-full p-1 border border-[#040814]">
                        <Users className="h-2.5 w-2.5" />
                      </span>
                    </div>

                    {/* Cell Info */}
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-cci-gold-400 font-semibold bg-cci-gold-500/10 px-2.5 py-1 rounded-full border border-cci-gold-500/20">
                        {cell.location}
                      </span>
                      <h3 className="font-display font-bold text-base text-white mt-2 group-hover:text-cci-gold-300 transition-colors">
                        {cell.cellName}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-sans">
                        Led by <strong className="text-slate-200 font-medium">{cell.name}</strong> ({cell.leaderTitle})
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans mb-5 line-clamp-3">
                    {cell.details}
                  </p>

                  {/* Meta data */}
                  <div className="space-y-2 border-t border-cci-blue-800/40 pt-4 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <MapPin className="h-4 w-4 text-cci-gold-500 shrink-0" />
                      <span>{cell.location} Division</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <Clock className="h-4 w-4 text-cci-gold-500 shrink-0" />
                      <span>{cell.schedule}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Join Button */}
                <div className="p-6 pt-0 mt-auto">
                  <button
                    onClick={() => handleOpenJoin(cell)}
                    className="w-full py-3 bg-cci-blue-800/40 hover:bg-gradient-to-r hover:from-cci-gold-600 hover:to-cci-gold-500 hover:text-[#040814] text-cci-gold-400 text-xs font-bold uppercase tracking-widest rounded-xl border border-cci-blue-700/60 hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Connect to Cell
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredCells.length === 0 && (
            <div className="col-span-full text-center py-16 bg-[#0a1128]/30 border border-cci-blue-800/30 rounded-3xl">
              <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h4 className="font-display font-bold text-sm text-slate-400">No cell locations match your search</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Try selecting another region or clear the search field to find groups in Magboro, Yaba, Itori, or Onikolobo.</p>
            </div>
          )}
        </div>

        {/* Map and Locations Highlight Section */}
        <div className="mt-20 bg-gradient-to-br from-[#0a1128] to-[#040814] border border-cci-blue-800/40 rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-xl flex flex-col lg:flex-row gap-10 items-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cci-gold-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-full lg:w-1/2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cci-gold-500/10 text-cci-gold-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-cci-gold-500/20">
              <Sparkles className="h-3 w-3" /> Church Centers
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-4">
              Our Active Cell Hubs
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              GEC operates in designated regional hubs designed to anchor believers in solid Christian theological Conviction. Join a center near you to experience community.
            </p>

            {/* List of 4 main locations required */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex items-center gap-2.5 text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-cci-gold-400" />
                <span>Magboro Sector</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-cci-gold-400" />
                <span>Yaba Sector</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-cci-gold-400" />
                <span>Itori Sector</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-cci-gold-400" />
                <span>Onikolobo Hub</span>
              </div>
            </div>
          </div>

          {/* Interactive Graphic Map Panel */}
          <div className="w-full lg:w-1/2 relative h-48 sm:h-64 rounded-2xl bg-[#040814] border border-cci-blue-800/50 overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ebd180 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            
            <div className="relative text-center z-10 space-y-4">
              <Users className="h-8 w-8 text-cci-gold-400 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h4 className="font-display text-xs font-bold text-white tracking-widest">CONNECT WITH FELLOW BELIEVERS</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">"Anchored in the finished work of Christ, training for evangelical boldness."</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Join Cell Modal Form */}
      <AnimatePresence>
        {showJoinModal && selectedCell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto" id="join-cell-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0a1128] border border-cci-blue-700/60 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 my-8"
              id="join-cell-modal-content"
            >
              {/* Header Info */}
              <div className="flex items-center gap-3.5 mb-6 border-b border-cci-blue-850 pb-5">
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-cci-blue-950 flex items-center justify-center border border-cci-gold-500/20">
                  <Users className="h-5 w-5 text-cci-gold-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">Join {selectedCell.cellName}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Cell Leader: {selectedCell.name}</p>
                </div>
              </div>

              {!submitSuccess ? (
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bro. Bolu Akintola"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-2.5 px-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-2.5 px-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+234 80 1234 5678"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-2.5 px-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Nearest Landmark or Area
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Near FUNAAB Gate, or Magboro Junction"
                      value={nearestLandmark}
                      onChange={(e) => setNearestLandmark(e.target.value)}
                      className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-2.5 px-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="bg-[#040814] border border-cci-blue-800/40 p-4 rounded-xl text-[11px] text-slate-400 leading-relaxed">
                    🌟 <strong>Next Step:</strong> Once submitted, your cell leader (<strong>{selectedCell.name}</strong>) will be securely notified and will reach out to you via Phone/WhatsApp to provide the exact house address and meeting details.
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-cci-blue-850">
                    <button
                      type="button"
                      onClick={() => setShowJoinModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-cci-blue-800 hover:bg-cci-blue-800/20 text-slate-300 text-xs font-bold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cci-gold-600 to-cci-gold-500 text-[#040814] hover:from-cci-gold-500 hover:to-cci-gold-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-cci-gold-600/10 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Send className="h-3 w-3" /> Join Cell
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                    <Check className="h-8 w-8" />
                  </div>
                  <h4 className="font-display font-bold text-lg text-white mb-2">Connect Request Sent!</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed mb-6">
                    Congratulations! You have successfully requested to join <strong>{selectedCell.cellName}</strong>. 
                  </p>
                  <div className="bg-[#040814] border border-cci-blue-800/40 rounded-xl p-4 text-left text-xs mb-6 space-y-1.5">
                    <div className="flex justify-between"><span className="text-slate-500">Group:</span> <span className="text-white font-medium">{selectedCell.cellName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Cell Leader:</span> <span className="text-white font-medium">{selectedCell.name}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Meeting time:</span> <span className="text-white font-mono">{selectedCell.schedule}</span></div>
                  </div>
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="px-6 py-2.5 bg-gradient-to-r from-cci-gold-600 to-cci-gold-500 text-[#040814] font-bold text-xs uppercase tracking-wider rounded-xl hover:from-cci-gold-500 hover:to-cci-gold-400"
                  >
                    Done
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
