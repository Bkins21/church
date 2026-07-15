import { useState } from 'react';
import { Search, MapPin, Clock, Phone, Mail, Globe, ExternalLink, Compass, User, Info } from 'lucide-react';
import { Branch } from '../types';
import { ministryBranches } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface BranchesProps {}

export default function Branches({}: BranchesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<Branch>(ministryBranches[0]);

  // Regions filter options
  const regions = ['all', 'Nigeria', 'Europe', 'North America'];

  // Filter branches
  const filteredBranches = ministryBranches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          branch.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          branch.residentPastor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || branch.region === selectedRegion;

    return matchesSearch && matchesRegion;
  });

  const handleBranchClick = (branch: Branch) => {
    setSelectedBranch(branch);
  };

  const handleDirections = (branch: Branch) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapEmbedSearch)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="branches-view">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          GEC Branches
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 mx-auto mb-5 rounded-full" />
        <p className="text-sm sm:text-base text-slate-300">
          Join the nearest GEC branch to you today.
        </p>
      </div>

      {/* Region Filter & Search */}
      <div className="bg-[#0a1128]/45 border border-cci-blue-800/80 rounded-2xl p-4 sm:p-6 mb-10 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by city, campus name, or pastor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#040814]/85 border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
            id="branch-search"
          />
        </div>

        {/* Region tabs */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2.5 rounded-lg font-display text-xs font-semibold uppercase tracking-wider shrink-0 transition-all
                ${selectedRegion === region
                  ? 'bg-cci-gold-500 text-[#040814] shadow-md shadow-cci-gold-600/10'
                  : 'bg-cci-blue-800/50 hover:bg-cci-blue-700/50 text-slate-300'
                }`}
            >
              {region === 'all' ? 'Global network' : region}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Directory on Left, Map/Pastor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Directory List (Left Column) */}
        <div className="lg:col-span-7 space-y-4 max-h-[680px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-cci-blue-900 scrollbar-thumb-cci-blue-800" id="branch-directory-list">
          {filteredBranches.length > 0 ? (
            filteredBranches.map((branch) => {
              const isSelected = selectedBranch.id === branch.id;
              return (
                <div
                  key={branch.id}
                  onClick={() => handleBranchClick(branch)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start relative overflow-hidden
                    ${isSelected
                      ? 'bg-gradient-to-r from-cci-blue-900/55 to-cci-blue-800/40 border-cci-gold-500/40 shadow-xl'
                      : 'bg-gradient-to-r from-[#0a1128]/40 to-[#040814]/80 border-cci-blue-800/80 hover:border-cci-blue-700'
                    }`}
                  id={`branch-card-${branch.id}`}
                >
                  <div className="p-3 bg-cci-blue-800/70 text-cci-gold-400 rounded-xl shrink-0 mt-0.5">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2 py-0.5 bg-cci-blue-800 text-cci-gold-400 text-[9px] font-mono font-bold uppercase tracking-widest rounded">
                        {branch.region}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{branch.city}</span>
                    </div>

                    <h3 className="font-display font-bold text-base sm:text-lg text-slate-100 hover:text-cci-gold-300 transition-colors mt-2 mb-1.5 leading-snug">
                      {branch.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mb-4 flex items-center gap-1">
                      <Compass className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      {branch.address}
                    </p>

                    {/* Service Times Mini badge */}
                    <div className="flex gap-3 text-[11px] font-mono text-cci-gold-400">
                      <span>Sun: {branch.serviceTimes.sunday.join(', ')}</span>
                    </div>
                  </div>

                  {/* Left accent bar on selection */}
                  {isSelected && (
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-cci-gold-600 to-cci-gold-400" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-[#0a1128]/20 border border-cci-blue-800/40 rounded-2xl">
              <p className="text-sm text-slate-400">No campuses found in this region or query.</p>
            </div>
          )}
        </div>

        {/* Selected Campus Detail Card & Pastor (Right Column) */}
        <div className="lg:col-span-5" id="selected-branch-details">
          <div className="bg-[#0a1128]/60 border border-cci-blue-700/50 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-xl flex flex-col justify-between h-full min-h-[580px]">
            {/* Visual design background */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-cci-gold-500/5 rounded-full blur-2xl" />

            <div>
              {/* Branch Head */}
              <div className="border-b border-cci-blue-800/80 pb-5 mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cci-gold-400 font-bold">Selected Campus</span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white mt-1 leading-tight">{selectedBranch.name}</h3>
                <p className="text-xs text-slate-400 mt-2 font-sans flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-cci-gold-500 shrink-0" />
                  {selectedBranch.address}
                </p>
              </div>

              {/* Service times card */}
              <div className="bg-[#040814]/80 rounded-2xl border border-cci-blue-800/80 p-4 mb-6">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-cci-gold-400" /> Service Schedules
                </h4>
                
                <div className="space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-cci-blue-800/30">
                    <span className="text-slate-400">Sunday Service:</span>
                    <div className="flex gap-1.5">
                      {selectedBranch.serviceTimes.sunday.map((time, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-cci-blue-800 text-slate-100 font-mono rounded text-[10px] font-medium border border-cci-blue-700/60">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">Midweek Study:</span>
                    <div className="flex gap-1.5">
                      {selectedBranch.serviceTimes.midweek.map((time, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-cci-blue-800 text-slate-100 font-mono rounded text-[10px] font-medium border border-cci-blue-700/60">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resident Pastor info */}
              <div className="flex gap-4 items-center p-4 bg-[#040814]/40 border border-cci-blue-800/60 rounded-2xl mb-8">
                <img
                  src={selectedBranch.pastorPhoto}
                  alt={selectedBranch.residentPastor}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border border-cci-blue-800 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold">Resident Pastor</span>
                  <h4 className="font-display font-bold text-sm text-white truncate mt-0.5">{selectedBranch.residentPastor}</h4>
                  
                  <div className="flex flex-col gap-1 mt-1 text-[11px] text-slate-400">
                    <a href={`mailto:${selectedBranch.contactEmail}`} className="flex items-center gap-1 hover:text-cci-gold-400 truncate">
                      <Mail className="h-3 w-3 text-slate-500" />
                      {selectedBranch.contactEmail}
                    </a>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-500" />
                      {selectedBranch.contactPhone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Large Interactive Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-cci-blue-800/60">
              <button
                onClick={() => handleDirections(selectedBranch)}
                className="w-full py-3.5 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 hover:from-cci-gold-500 hover:to-cci-gold-300 text-[#040814] rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-cci-gold-600/10"
                id="btn-branch-directions"
              >
                <Compass className="h-4 w-4" />
                Find on Google Maps
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
