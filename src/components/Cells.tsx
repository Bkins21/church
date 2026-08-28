import { useState } from 'react';
import {
  Users,
  MapPin,
  Clock,
  Search,
  Sparkles,
  Phone,
  Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CellLeader {
  id: string;
  name: string;
  cellName: string;
  location: 'Magboro' | 'UNILAG' | 'Itori' | 'Onikolobo' | 'FUNAAB';
  contactPhone?: string;
  contactEmail?: string;
  leaderTitle?: string;
  avatarUrl?: string;
  details?: string;
  schedule?: string;
  address?: string;
}

interface CellsProps {
  embedded?: boolean;
}

export default function Cells({ embedded = false }: CellsProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const cellLeadersList: CellLeader[] = [
    {
      id: 'FUNAAB',
      name: 'Ayobami Komolafe',
      cellName: 'FUNAAB Cell',
      location: 'FUNAAB',
      contactPhone: '+234 913 073 5775',
      leaderTitle: 'Cell Leader',
      address: '',
    },
    {
      id: 'Magboro-1',
      name: 'Stella Zubair',
      cellName: 'Akintonde Cell 1',
      location: 'Magboro',
      contactPhone: '+234 907 591 1784',
      leaderTitle: 'Cell Leader',
      address: 'Divine Peace Estate, Gasline, Magboro Ogun State.',
    },
    {
      id: 'Magboro-2',
      name: 'Joseph Danladi',
      cellName: 'Akintonde Cell 2',
      location: 'Magboro',
      contactPhone: '+234 903 116 6348',
      leaderTitle: 'Cell Leader',
      address: 'Blessing Clinic, Community Avenue, Magboro Ogun State.',
    },
    {
      id: 'Magboro-3',
      name: 'Oluwatobi Olabode',
      cellName: 'Akintonde Cell 3',
      location: 'Magboro',
      contactPhone: '+234 803 870 8417',
      leaderTitle: 'Cell Leader',
    },
    {
      id: 'Yaba',
      name: 'Kolawole Asaolu',
      cellName: 'Yaba Cell',
      location: 'UNILAG',
      contactPhone: '+234 812 789 4081',
      leaderTitle: 'Cell Leader',
    },
    {
      id: 'cell-itori',
      name: 'Taiwo Oseni',
      cellName: 'Itori Cell',
      location: 'Itori',
      contactPhone: '+234 813 973 9763',
      leaderTitle: 'Cell Leader',
    },
    {
      id: 'cell-onikolobo-1',
      name: 'Oreoluwa Adebayo',
      cellName: 'Onikolobo Cell 1',
      location: 'Onikolobo',
      contactPhone: '+234 816 655 2066',
      leaderTitle: 'Cell Leader',
    },
    {
      id: 'cell-onikolobo-2',
      name: 'Boluwatife Akintola',
      cellName: 'Onikolobo Cell 2',
      location: 'Onikolobo',
      contactPhone: '+234 707 695 8715',
      leaderTitle: 'Cell Leader',
    },
  ];

  const locations = [
    'All',
    'Magboro',
    'UNILAG',
    'Itori',
    'Onikolobo',
    'FUNAAB',
  ];

  const normalizedSearch = searchQuery.toLowerCase().trim();

  const filteredCells = cellLeadersList.filter((cell) => {
    const matchesLocation =
      selectedLocation === 'All' || cell.location === selectedLocation;

    const matchesSearch =
      !normalizedSearch ||
      cell.name.toLowerCase().includes(normalizedSearch) ||
      cell.cellName.toLowerCase().includes(normalizedSearch) ||
      cell.location.toLowerCase().includes(normalizedSearch) ||
      (cell.contactPhone &&
        cell.contactPhone.toLowerCase().includes(normalizedSearch)) ||
      (cell.details &&
        cell.details.toLowerCase().includes(normalizedSearch)) ||
      (cell.address &&
        cell.address.toLowerCase().includes(normalizedSearch));

    return matchesLocation && matchesSearch;
  });

  return (
    <div
      id="gec-cells-section"
      className={
        embedded
          ? 'py-4 bg-transparent text-[#141416]'
          : 'py-16 bg-[#F7F5F0] text-[#141416]'
      }
    >
      <div
        className={
          embedded
            ? 'w-full'
            : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
        }
      >
        {/* Page Header */}
        {!embedded && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold tracking-tight text-[#3A2312] mb-4">
              GEC Home Cells Directory
            </h2>

            <div className="w-16 h-1 mx-auto rounded-full bg-[#A36B3B] mb-3 shadow-sm" />

            <p className="text-sm text-[#6B5441]">
              Find and contact your nearest cell leader directly.
            </p>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-[#EFEAE1] border border-[#E4DCD0] rounded-2xl sm:rounded-3xl p-5 sm:p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
          {/* Location Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {locations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setSelectedLocation(loc)}
                className={`px-4 py-2.5 rounded-xl font-display text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                  selectedLocation === loc
                    ? 'bg-[#A36B3B] text-white shadow-sm font-bold'
                    : 'bg-[#F7F5F0] hover:bg-[#E4DCD0] text-[#6B5441] border border-[#E4DCD0] hover:text-[#3A2312]'
                }`}
              >
                {loc === 'All' ? 'All Locations' : loc}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by cell, leader, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#E4DCD0] focus:border-[#A36B3B] focus:ring-2 focus:ring-[#A36B3B]/20 rounded-xl py-3 pl-11 pr-4 text-sm text-[#3A2312] placeholder-[#8A7463] focus:outline-none transition-all"
            />

            <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#A36B3B]" />
          </div>
        </div>

        {/* Cell Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCells.map((cell) => (
              <motion.div
                key={cell.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                id={`cell-card-${cell.id}`}
                className="bg-[#EFEAE1] border border-[#E4DCD0] rounded-3xl overflow-hidden hover:border-[#A36B3B]/70 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md hover:shadow-[#A36B3B]/5"
              >
                {/* Card Information */}
                <div className="p-6 pb-4">
                  {/* Leader Header */}
                  <div className="flex items-start gap-4 mb-5">
                    {/* Leader Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#E4DCD0] p-[1px] bg-[#F7F5F0] flex items-center justify-center">
                        {cell.avatarUrl ? (
                          <img
                            src={cell.avatarUrl}
                            alt={cell.name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#F7F5F0] flex items-center justify-center rounded-2xl text-[#A36B3B] font-bold font-mono text-sm">
                            {cell.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                        )}
                      </div>

                      <span className="absolute -bottom-1 -right-1 bg-[#A36B3B] text-white rounded-full p-1 border border-[#EFEAE1]">
                        <Users className="h-2.5 w-2.5" />
                      </span>
                    </div>

                    {/* Cell Info */}
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#A36B3B] font-bold bg-[#F7F5F0] px-2.5 py-1 rounded-full border border-[#E4DCD0]">
                        {cell.location}
                      </span>

                      <h3 className="font-display font-bold text-base text-[#3A2312] mt-2 group-hover:text-[#A36B3B] transition-colors truncate">
                        {cell.cellName}
                      </h3>

                      <p className="text-xs text-[#6B5441] mt-0.5 font-sans truncate">
                        Led by{' '}
                        <strong className="text-[#3A2312] font-semibold">
                          {cell.name}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {cell.details && (
                    <p className="text-xs text-[#6B5441] leading-relaxed font-sans mb-4 line-clamp-2">
                      {cell.details}
                    </p>
                  )}

                  {/* Location, Address & Schedule */}
                  <div className="space-y-3 border-t border-[#E4DCD0] pt-4 text-xs">
                    {/* Hub */}
                    <div className="flex items-start gap-2.5 text-[#6B5441]">
                      <MapPin className="h-4 w-4 text-[#A36B3B] shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider font-bold text-[#8A7463] mb-0.5">
                          Location
                        </span>
                        <span>{cell.location} Hub</span>
                      </div>
                    </div>

                    {/* Address */}
                    {cell.address && (
                      <div className="flex items-start gap-2.5 text-[#6B5441]">
                        <MapPin className="h-4 w-4 text-[#A36B3B] shrink-0 mt-0.5" />

                        <div className="min-w-0">
                          <span className="block text-[9px] uppercase tracking-wider font-bold text-[#8A7463] mb-0.5">
                            Address
                          </span>

                          <span className="leading-relaxed break-words">
                            {cell.address}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Schedule */}
                    <div className="flex items-start gap-2.5 text-[#6B5441]">
                      <Clock className="h-4 w-4 text-[#A36B3B] shrink-0 mt-0.5" />

                      <div>
                        <span className="block text-[9px] uppercase tracking-wider font-bold text-[#8A7463] mb-0.5">
                          Schedule
                        </span>

                        <span>
                          {cell.schedule || 'Weekly Home Fellowship'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leader Contact */}
                <div className="p-6 pt-2 mt-auto">
                  <div className="bg-[#F7F5F0] border border-[#E4DCD0] rounded-2xl p-3.5 space-y-2">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-[#8A7463] font-bold block">
                      Leader's Contact
                    </span>

                    {cell.contactPhone && (
                      <a
                        href={`tel:${cell.contactPhone.replace(/\s+/g, '')}`}
                        className="flex items-center justify-between text-xs text-[#3A2312] hover:text-[#A36B3B] transition-colors py-0.5"
                      >
                        <span className="flex items-center gap-2 font-mono font-medium">
                          <Phone className="h-3.5 w-3.5 text-[#A36B3B]" />
                          {cell.contactPhone}
                        </span>

                        <span className="text-[10px] text-white font-sans font-semibold bg-[#A36B3B] hover:bg-[#8D5A30] px-2.5 py-0.5 rounded shadow-sm transition-colors">
                          Call
                        </span>
                      </a>
                    )}

                    {cell.contactEmail && (
                      <a
                        href={`mailto:${cell.contactEmail}`}
                        className="flex items-center gap-2 text-xs text-[#6B5441] hover:text-[#A36B3B] transition-colors truncate pt-1 border-t border-[#E4DCD0]/70"
                      >
                        <Mail className="h-3.5 w-3.5 text-[#8A7463] shrink-0" />

                        <span className="truncate">
                          {cell.contactEmail}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* No Results */}
          {filteredCells.length === 0 && (
            <div className="col-span-full text-center py-16 bg-[#EFEAE1] border border-[#E4DCD0] rounded-3xl">
              <Users className="h-10 w-10 text-[#8A7463] mx-auto mb-3" />

              <h4 className="font-display font-bold text-sm text-[#3A2312]">
                No cell locations match your search
              </h4>

              <p className="text-xs text-[#6B5441] max-w-sm mx-auto mt-1">
                Try selecting another region or clear the search field to find
                groups in Magboro, UNILAG, Itori, Onikolobo, or FUNAAB.
              </p>
            </div>
          )}
        </div>

        {/* Active Cell Hubs */}
        
         
        
      </div>
    </div>
  );
}