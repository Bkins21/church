import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Phone, Mail, Compass, Building2 } from 'lucide-react';
import { Branch } from '../types';
import { ministryBranches } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from '../supabase';

interface BranchesProps {}

export default function Branches({}: BranchesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [branchImageOverrides, setBranchImageOverrides] = useState<{ [id: string]: string }>(() => {
    try {
      const cached = localStorage.getItem('gec_branch_image_overrides');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

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

  // Filter local churches and cell meetings by City, Pastor, or Cell Leader name
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

  return (
    <div className="w-full bg-[#F4F6F8] text-[#141416] transition-colors duration-300 min-h-screen" id="branches-view">
      
      {/* Themed Page Header */}
      <div className="w-full bg-gradient-to-b from-[#181F26] via-[#1F2933] to-[#181F26] text-[#F0F4F8] py-16 sm:py-20 border-b border-[#32404E] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#4FA3D1]/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4FA3D1]/15 border border-[#4FA3D1]/30 text-[#4FA3D1] text-xs font-mono font-semibold tracking-wider uppercase shadow-sm">
            <Building2 className="h-3.5 w-3.5" />
            <span>Our Church & Cell Meeting Locations</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-[#F0F4F8]">
            Our Local Churches & Cells
          </h1>
          <div className="w-20 h-1 bg-[#4FA3D1] mx-auto rounded-full shadow-sm shadow-[#4FA3D1]/50" />
          <p className="text-sm sm:text-base text-[#9AA5B1] leading-relaxed max-w-2xl mx-auto">
            Join the nearest local church and cell close to you
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="bg-white border border-[#D9E2EC] rounded-2xl p-4 sm:p-5 mb-10 shadow-sm max-w-2xl mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#829AB1]" />
            <input
              type="text"
              placeholder="Search by City, Pastor or Cell Leader name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F0F4F8] border border-[#D9E2EC] focus:border-[#4FA3D1] focus:ring-2 focus:ring-[#4FA3D1]/20 rounded-xl py-3.5 pl-12 pr-4 text-sm text-[#102A43] placeholder-[#829AB1] focus:outline-none transition-all"
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
                  <div className="p-3 bg-[#F0EBE1] text-[#A36B3B] rounded-xl shrink-0 mt-0.5 border border-[#E4DCD0]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2.5 py-0.5 bg-[#F0EBE1] text-[#A36B3B] text-[10px] font-mono font-bold uppercase tracking-wider rounded border border-[#E4DCD0]">
                        {branch.city}
                      </span>
                      <span className="text-[11px] font-mono text-[#8A8E96]">{branch.residentPastor}</span>
                    </div>

                    <h3 className="font-display font-bold text-base sm:text-lg text-[#141416] hover:text-[#A36B3B] transition-colors mt-2 mb-1.5 leading-snug">
                      {branch.name}
                    </h3>
                    <p className="text-xs text-[#54575E] line-clamp-1 mb-4 flex items-center gap-1">
                      <Compass className="h-3.5 w-3.5 text-[#8A8E96] shrink-0" />
                      {branch.address}
                    </p>

                    <div className="flex gap-3 text-[11px] font-mono text-[#A36B3B] font-semibold">
                      <span>Sun: {branch.serviceTimes.sunday.join(', ')}</span>
                    </div>
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
              <p className="text-sm text-[#54575E]">No local church or cell meetings found matching your search.</p>
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
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#A36B3B] font-bold">Selected Church / Cell</span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-[#141416] mt-1 leading-tight">{selectedBranch.name}</h3>
                <p className="text-xs text-[#54575E] mt-2 font-sans flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#A36B3B] shrink-0" />
                  {selectedBranch.address}
                </p>
              </div>

              {/* Service times card */}
              <div className="bg-[#F7F5F0] rounded-2xl border border-[#E4DCD0] p-4 mb-6">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#141416] mb-3 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#A36B3B]" /> Service Schedules
                </h4>
                
                <div className="space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-[#E4DCD0]">
                    <span className="text-[#54575E]">Sunday Service:</span>
                    <div className="flex gap-1.5">
                      {selectedBranch.serviceTimes.sunday.map((time, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white text-[#141416] font-mono rounded text-[10px] font-semibold border border-[#E4DCD0]">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#54575E]">Midweek Service:</span>
                    <div className="flex gap-1.5">
                      {selectedBranch.serviceTimes.midweek.map((time, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white text-[#141416] font-mono rounded text-[10px] font-semibold border border-[#E4DCD0]">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resident Pastor / Cell Leader info */}
              <div className="flex gap-4 items-center p-4 bg-[#F7F5F0] border border-[#E4DCD0] rounded-2xl mb-8">
                <img
                  src={currentPastorPhoto}
                  alt={selectedBranch.residentPastor}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border border-[#E4DCD0] shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#8A8E96] font-bold">Resident Pastor / Cell Leader</span>
                  <h4 className="font-display font-bold text-sm text-[#141416] truncate mt-0.5">{selectedBranch.residentPastor}</h4>
                  
                  <div className="flex flex-col gap-1 mt-1 text-[11px] text-[#54575E]">
                    <a href={`mailto:${selectedBranch.contactEmail}`} className="flex items-center gap-1 hover:text-[#A36B3B] truncate">
                      <Mail className="h-3 w-3 text-[#8A8E96]" />
                      {selectedBranch.contactEmail}
                    </a>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-[#8A8E96]" />
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
    </div>
  </div>
  );
}
