import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Phone, Mail, Compass, Building2, Home } from 'lucide-react';
import { Branch } from '../types';
import { ministryBranches } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from '../supabase';
import Cells from './Cells';

interface BranchesProps {
  initialSubTab?: 'branches' | 'cells';
  onSubTabChange?: (tab: 'branches' | 'cells') => void;
}

export default function Branches({ initialSubTab = 'branches', onSubTabChange }: BranchesProps) {
  const [activeSubTab, setActiveSubTab] = useState<'branches' | 'cells'>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchImageOverrides, setBranchImageOverrides] = useState<{ [id: string]: string }>(() => {
    try {
      const cached = localStorage.getItem('gec_branch_image_overrides');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  // Keep activeSubTab in sync if parent initialSubTab changes
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSubTabSwitch = (tab: 'branches' | 'cells') => {
    setActiveSubTab(tab);
    onSubTabChange?.(tab);
  };

  // Fetch updated branch images from Supabase
  useEffect(() => {
    const fetchBranchImages = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('id, image_url, pastor_photo');

        if (!error && data && data.length > 0) {
          const map: { [id: string]: string } = {};
          data.forEach((item: any) => {
            const url = item.image_url || item.pastor_photo;
            if (url) {
              map[item.id] = url;
            }
          });
          setBranchImageOverrides(prev => ({ ...prev, ...map }));
          try {
            localStorage.setItem('gec_branch_image_overrides', JSON.stringify(map));
          } catch {}
        }
      } catch (err) {
        console.warn('Could not load branch images from Supabase:', err);
      }
    };

    fetchBranchImages();

    const handleUpdate = () => {
      fetchBranchImages();
      try {
        const cached = localStorage.getItem('gec_branch_image_overrides');
        if (cached) {
          setBranchImageOverrides(JSON.parse(cached));
        }
      } catch {}
    };

    window.addEventListener('gec_branches_updated', handleUpdate);
    return () => window.removeEventListener('gec_branches_updated', handleUpdate);
  }, []);

  const [selectedBranch, setSelectedBranch] = useState<Branch>(ministryBranches[0]);

  // Filter local churches by City, Pastor, or Center name
  const filteredBranches = ministryBranches.filter(branch => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      branch.name.toLowerCase().includes(q) ||
      branch.city.toLowerCase().includes(q) ||
      branch.address.toLowerCase().includes(q) ||
      branch.residentPastor.toLowerCase().includes(q)
    );
  });

  const handleBranchClick = (branch: Branch) => {
    setSelectedBranch(branch);
  };

  const handleDirections = (branch: Branch) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapEmbedSearch)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentPastorPhoto = branchImageOverrides[selectedBranch.id] || selectedBranch.imageUrl || selectedBranch.pastorPhoto;

  const isBranches = activeSubTab === 'branches';

  return (
    <div 
      className="w-full bg-[#F7F5F0] text-[#141416] transition-colors duration-500 min-h-screen" 
      id="branches-view"
    >
      
      {/* Themed Page Header */}
      <div 
        className="w-full py-14 sm:py-18 border-b bg-gradient-to-b from-[#EFEAE1] via-[#F7F5F0] to-[#EFEAE1] text-[#141416] border-[#E4DCD0] relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl bg-[#A36B3B]/10" 
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          
          <h1 
            className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-[#3A2312]"
          >
            {isBranches ? 'Our Church Branches' : 'GEC Home Cells'}
          </h1>
          
          <div 
            className="w-20 h-1 mx-auto rounded-full shadow-sm bg-[#A36B3B] shadow-[#A36B3B]/30" 
          />
          
          <p 
            className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto text-[#6B5441]"
          >
            {isBranches 
              ? 'Find our physical church centers, service schedules, and resident pastors across cities.' 
              : 'Connect with a weekly fellowship home cell close to your residence or campus.'}
          </p>

          {/* Sub-Tab Navigation Switcher */}
          <div className="pt-4 flex justify-center">
            <div 
              className="inline-flex p-1.5 rounded-2xl border shadow-lg backdrop-blur bg-[#E8E0D2]/90 border-[#D8CEBF]"
            >
              <button
                type="button"
                onClick={() => handleSubTabSwitch('branches')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-display text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                  isBranches
                    ? 'bg-[#A36B3B] text-white shadow-md font-bold'
                    : 'text-[#6B5441] hover:text-[#3A2312] hover:bg-white/40'
                }`}
                id="tab-btn-branches"
              >
                <Building2 className="h-4 w-4" />
                <span>Church Branches</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isBranches ? 'bg-white/20 text-white' : 'bg-[#D8CEBF] text-[#6B5441]'
                }`}>
                  {ministryBranches.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSubTabSwitch('cells')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-display text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                  !isBranches
                    ? 'bg-[#A36B3B] text-white shadow-md font-bold'
                    : 'text-[#6B5441] hover:text-[#3A2312] hover:bg-white/40'
                }`}
                id="tab-btn-cells"
              >
                <Home className="h-4 w-4" />
                <span>Home Cells</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  !isBranches ? 'bg-white/20 text-white' : 'bg-[#D8CEBF] text-[#6B5441]'
                }`}>
                  8
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {isBranches ? (
            <motion.div
              key="branches-view-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Search Bar: 70% Beige, 20% Brown, 10% White */}
              <div className="bg-white border border-[#E4DCD0] rounded-2xl p-4 sm:p-5 mb-10 shadow-sm max-w-2xl mx-auto">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A36B3B]" />
                  <input
                    type="text"
                    placeholder="Search by City, Pastor or Center name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#E4DCD0] focus:border-[#A36B3B] focus:ring-2 focus:ring-[#A36B3B]/20 rounded-xl py-3.5 pl-12 pr-4 text-sm text-[#3A2312] placeholder-[#8A7463] focus:outline-none transition-all"
                    id="branch-search"
                  />
                </div>
              </div>

              {/* Main Grid: Directory on Left, Details on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Directory List (Left Column) */}
                <div className="lg:col-span-7 space-y-4 max-h-[680px] overflow-y-auto pr-2" id="branch-directory-list">
                  {filteredBranches.length > 0 ? (
                    filteredBranches.map((branch, idx) => {
                      const isSelected = selectedBranch.id === branch.id;
                      return (
                        <motion.div
                          key={branch.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: idx * 0.05 }}
                          whileHover={{ y: -3, scale: 1.005 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleBranchClick(branch)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start relative overflow-hidden
                            ${isSelected
                              ? 'bg-white border-[#A36B3B] shadow-md ring-1 ring-[#A36B3B]/20'
                              : 'bg-white border-[#E4DCD0] hover:border-[#A36B3B]/60 shadow-sm'
                            }`}
                          id={`branch-card-${branch.id}`}
                        >
                          <div className="p-3 bg-[#F7F5F0] text-[#A36B3B] rounded-xl shrink-0 mt-0.5 border border-[#E4DCD0]">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start gap-2">
                              <span className="px-2.5 py-0.5 bg-[#F7F5F0] text-[#A36B3B] text-[10px] font-mono font-bold uppercase tracking-wider rounded border border-[#E4DCD0]">
                                {branch.city}
                              </span>
                              <span className="text-[11px] font-mono text-[#8A7463]">{branch.residentPastor}</span>
                            </div>

                            <h3 className="font-display font-bold text-base sm:text-lg text-[#3A2312] hover:text-[#A36B3B] transition-colors mt-2 mb-1.5 leading-snug">
                              {branch.name}
                            </h3>
                            <p className="text-xs text-[#6B5441] line-clamp-1 mb-4 flex items-center gap-1">
                              <Compass className="h-3.5 w-3.5 text-[#8A7463] shrink-0" />
                              {branch.address}
                            </p>

                            {branch.serviceTimes?.sunday && branch.serviceTimes.sunday.length > 0 && (
                              <div className="flex gap-3 text-[11px] font-mono text-[#A36B3B] font-semibold">
                                <span>Sun: {branch.serviceTimes.sunday.join(', ')}</span>
                              </div>
                            )}
                          </div>

                          {/* Left accent bar on selection */}
                          {isSelected && (
                            <motion.div 
                              layoutId="selectedBranchBar"
                              className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#A36B3B]" 
                            />
                          )}
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 bg-white border border-[#E4DCD0] rounded-2xl">
                      <p className="text-sm text-[#6B5441]">No local church branch found matching your search.</p>
                    </div>
                  )}
                </div>

                {/* Selected Details Card & Leader (Right Column) */}
                <div className="lg:col-span-5" id="selected-branch-details">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedBranch.id}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white border border-[#E4DCD0] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-stone-900/5 flex flex-col justify-between h-full min-h-[580px]"
                    >
                    <div>
                      {/* Branch Head */}
                      <div className="border-b border-[#EFEAE1] pb-5 mb-6">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#A36B3B] font-bold">Selected Church Center</span>
                        <h3 className="font-display font-bold text-xl sm:text-2xl text-[#3A2312] mt-1 leading-tight">{selectedBranch.name}</h3>
                        <p className="text-xs text-[#6B5441] mt-2 font-sans flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-[#A36B3B] shrink-0" />
                          {selectedBranch.address}
                        </p>
                      </div>

                      {/* Service times card */}
                      {selectedBranch.serviceTimes && (selectedBranch.serviceTimes.sunday?.length || selectedBranch.serviceTimes.midweek?.length) ? (
                        <div className="bg-[#F7F5F0] rounded-2xl border border-[#E4DCD0] p-4 mb-6">
                          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#3A2312] mb-3 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-[#A36B3B]" /> Service Schedules
                          </h4>
                          
                          <div className="space-y-3 font-sans text-xs">
                            {selectedBranch.serviceTimes.sunday && selectedBranch.serviceTimes.sunday.length > 0 && (
                              <div className="flex justify-between items-center py-2 border-b border-[#E4DCD0]">
                                <span className="text-[#6B5441]">Sunday Service:</span>
                                <div className="flex gap-1.5">
                                  {selectedBranch.serviceTimes.sunday.map((time, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-white text-[#3A2312] font-mono rounded text-[10px] font-semibold border border-[#E4DCD0]">
                                      {time}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedBranch.serviceTimes.midweek && selectedBranch.serviceTimes.midweek.length > 0 && (
                              <div className="flex justify-between items-center py-2">
                                <span className="text-[#6B5441]">Midweek Service:</span>
                                <div className="flex gap-1.5">
                                  {selectedBranch.serviceTimes.midweek.map((time, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-white text-[#3A2312] font-mono rounded text-[10px] font-semibold border border-[#E4DCD0]">
                                      {time}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {/* Resident Pastor info */}
                      <div className="flex gap-4 items-center p-4 bg-[#F7F5F0] border border-[#E4DCD0] rounded-2xl mb-8">
                        <img
                          src={currentPastorPhoto}
                          alt={selectedBranch.residentPastor}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-xl object-cover border border-[#E4DCD0] shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-[#8A7463] font-bold">Resident Pastor</span>
                          <h4 className="font-display font-bold text-sm text-[#3A2312] truncate mt-0.5">{selectedBranch.residentPastor}</h4>
                          
                          <div className="flex flex-col gap-1 mt-1 text-[11px] text-[#6B5441]">
                            <a href={`mailto:${selectedBranch.contactEmail}`} className="flex items-center gap-1 hover:text-[#A36B3B] truncate">
                              <Mail className="h-3 w-3 text-[#8A7463]" />
                              {selectedBranch.contactEmail}
                            </a>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-[#8A7463]" />
                              {selectedBranch.contactPhone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="space-y-3 pt-4 border-t border-[#EFEAE1]">
                      <button
                        onClick={() => handleDirections(selectedBranch)}
                        className="w-full py-3.5 bg-[#A36B3B] hover:bg-[#8D5A30] text-white rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-[#A36B3B]/20 cursor-pointer"
                        id="btn-branch-directions"
                      >
                        <Compass className="h-4 w-4" />
                        Find on Google Maps
                      </button>
                    </div>
                  </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="cells-view-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Cells embedded={true} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
