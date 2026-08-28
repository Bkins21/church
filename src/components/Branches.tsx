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

  const handleDirections = (branch: Branch) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapEmbedSearch)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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

              {/* Main Grid: All-in-one Branch Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8" id="branches-cards-grid">
                {filteredBranches.length > 0 ? (
                  filteredBranches.map((branch, idx) => {
                    const pastorPhoto = branchImageOverrides[branch.id] || branch.imageUrl || branch.pastorPhoto;
                    return (
                      <motion.div
                        key={branch.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: idx * 0.08 }}
                        className="bg-white border border-[#E4DCD0] rounded-3xl p-6 sm:p-7 shadow-lg shadow-stone-900/5 flex flex-col justify-between hover:border-[#A36B3B]/60 transition-all group relative overflow-hidden"
                        id={`branch-card-${branch.id}`}
                      >
                        {/* Top decorative gradient accent */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#A36B3B] via-[#C49B58] to-[#A36B3B]" />

                        <div className="space-y-5">
                          {/* Header / City Badge & Branch Title */}
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-3 py-1 bg-[#F7F5F0] text-[#A36B3B] text-xs font-mono font-bold uppercase tracking-wider rounded-lg border border-[#E4DCD0]">
                                {branch.city}
                              </span>
                              <span className="text-[11px] font-mono text-[#8A7463] flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5 text-[#A36B3B]" />
                                GEC Campus
                              </span>
                            </div>

                            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#3A2312] group-hover:text-[#A36B3B] transition-colors leading-tight">
                              {branch.name}
                            </h3>

                            <p className="text-xs sm:text-sm text-[#6B5441] flex items-start gap-2 leading-relaxed">
                              <MapPin className="h-4 w-4 text-[#A36B3B] shrink-0 mt-0.5" />
                              <span>{branch.address}</span>
                            </p>
                          </div>

                          {/* Resident Pastor Details */}
                          <div className="p-4 bg-[#F7F5F0] border border-[#E4DCD0] rounded-2xl flex items-center gap-4">
                            <img
                              src={pastorPhoto}
                              alt={branch.residentPastor}
                              referrerPolicy="no-referrer"
                              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                            />
                            <div className="min-w-0 flex-1 space-y-1">
                              <span className="text-[9px] font-mono uppercase tracking-widest text-[#A36B3B] font-bold block">
                                Resident Pastor
                              </span>
                              <h4 className="font-display font-bold text-sm sm:text-base text-[#3A2312] truncate">
                                {branch.residentPastor}
                              </h4>
                              
                              <div className="space-y-0.5 pt-0.5 text-xs text-[#6B5441]">
                                {branch.contactEmail && (
                                  <a 
                                    href={`mailto:${branch.contactEmail}`} 
                                    className="flex items-center gap-1.5 hover:text-[#A36B3B] transition-colors truncate"
                                  >
                                    <Mail className="h-3.5 w-3.5 text-[#A36B3B] shrink-0" />
                                    <span className="truncate">{branch.contactEmail}</span>
                                  </a>
                                )}
                                {branch.contactPhone && (
                                  <a 
                                    href={`tel:${branch.contactPhone.replace(/\s+/g, '')}`} 
                                    className="flex items-center gap-1.5 hover:text-[#A36B3B] transition-colors truncate"
                                  >
                                    <Phone className="h-3.5 w-3.5 text-[#A36B3B] shrink-0" />
                                    <span>{branch.contactPhone}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Service Schedules if present */}
                          {branch.serviceTimes && (branch.serviceTimes.sunday?.length || branch.serviceTimes.midweek?.length) ? (
                            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E4DCD0]/80 space-y-2">
                              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase font-bold text-[#3A2312]">
                                <Clock className="h-3.5 w-3.5 text-[#A36B3B]" />
                                <span>Service Schedules</span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs">
                                {branch.serviceTimes.sunday?.map((time, tIdx) => (
                                  <span key={tIdx} className="px-2.5 py-1 bg-white text-[#3A2312] font-mono text-[11px] font-semibold rounded-md border border-[#E4DCD0]">
                                    Sun: {time}
                                  </span>
                                ))}
                                {branch.serviceTimes.midweek?.map((time, tIdx) => (
                                  <span key={tIdx} className="px-2.5 py-1 bg-white text-[#3A2312] font-mono text-[11px] font-semibold rounded-md border border-[#E4DCD0]">
                                    Midweek: {time}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {/* Action: Google Maps Button */}
                        <div className="pt-5 mt-5 border-t border-[#EFEAE1]">
                          <button
                            type="button"
                            onClick={() => handleDirections(branch)}
                            className="w-full py-3 bg-[#A36B3B] hover:bg-[#8D5A30] text-white rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-[#A36B3B]/15 cursor-pointer"
                          >
                            <Compass className="h-4 w-4" />
                            <span>Find on Google Maps</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-16 bg-white border border-[#E4DCD0] rounded-3xl space-y-2">
                    <Building2 className="h-8 w-8 text-[#A36B3B] mx-auto mb-2 opacity-50" />
                    <p className="text-base font-bold text-[#3A2312]">No church branches found</p>
                    <p className="text-xs text-[#6B5441]">Try searching for a different city or center name.</p>
                  </div>
                )}
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
