import { useState, useEffect } from 'react';
import { BookOpen, Download, Eye, Calendar, Search, Filter, FileText, Check, X } from 'lucide-react';
import { Publication } from '../types';
import { supabase, isSupabaseConfigured } from '../supabase';
import { motion, AnimatePresence } from 'motion/react';

interface PublicationsProps {
  onPurchaseSuccess?: (pub: Publication) => void;
  userLibrary?: Publication[];
  customPublications?: Publication[];
}

const MONTHS_LIST = [
  'All Months',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export default function Publications({ onPurchaseSuccess, userLibrary = [], customPublications }: PublicationsProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('All Months');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePubDetail, setActivePubDetail] = useState<Publication | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gec_downloaded_bulletin_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Source of truth: Supabase `publications` table
  const [allPublications, setAllPublications] = useState<Publication[]>([]);

  useEffect(() => {
    const loadPublications = async () => {
      if (!isSupabaseConfigured || !supabase) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('publications')
          .select('*');

        if (error) {
          console.warn('Failed to load publications from Supabase:', error);
          return;
        }

        const publications: Publication[] = (data || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          type: row.type || 'bulletin',
          author: row.author || '',
          description: row.description || '',
          coverUrl: row.cover_url || '',
          month: row.month || '',
          publishYear: Number(row.publish_year),
          fileUrl: row.file_url || '',
        }));

        setAllPublications(publications);
      } catch (err) {
        console.warn('Network error loading publications from Supabase:', err);
      }
    };

    loadPublications();

    const handleUpdate = () => {
      loadPublications();
    };

    window.addEventListener('gec_publications_updated', handleUpdate);
    return () => {
      window.removeEventListener('gec_publications_updated', handleUpdate);
    };
  }, []);

  // Compute available years from data + current and recent year
  const availableYears = Array.from(
    new Set([
      currentYear.toString(),
      (currentYear - 1).toString(),
      ...allPublications.map((p) => (p.publishYear ? p.publishYear.toString() : ''))
    ])
  ).filter(Boolean).sort((a, b) => Number(b) - Number(a));

  // Filter publications by Year, Month, and Search query
  const filteredPublications = allPublications.filter((pub) => {
    // Year filter
    if (selectedYear !== 'all' && pub.publishYear && pub.publishYear.toString() !== selectedYear) {
      return false;
    }
    // Month filter
    if (selectedMonth !== 'All Months') {
      const pubMonth = pub.month || '';
      if (pubMonth.toLowerCase() !== selectedMonth.toLowerCase()) {
        return false;
      }
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = pub.title?.toLowerCase().includes(q);
      const matchAuthor = pub.author?.toLowerCase().includes(q);
      const matchDesc = pub.description?.toLowerCase().includes(q);
      const matchMonth = pub.month?.toLowerCase().includes(q);
      const matchYear = pub.publishYear?.toString().includes(q);
      if (!matchTitle && !matchAuthor && !matchDesc && !matchMonth && !matchYear) {
        return false;
      }
    }
    return true;
  });

  // Group filtered publications by Year and Month for structured display
  const groupedByYearAndMonth = filteredPublications.reduce((acc, pub) => {
    const yearKey = pub.publishYear ? pub.publishYear.toString() : currentYear.toString();
    const monthKey = pub.month || 'General';
    if (!acc[yearKey]) {
      acc[yearKey] = {};
    }
    if (!acc[yearKey][monthKey]) {
      acc[yearKey][monthKey] = [];
    }
    acc[yearKey][monthKey].push(pub);
    return acc;
  }, {} as { [year: string]: { [month: string]: Publication[] } });

  const sortedYears = Object.keys(groupedByYearAndMonth).sort((a, b) => Number(b) - Number(a));

  const triggerDownload = (pub: Publication) => {
    if (onPurchaseSuccess) {
      onPurchaseSuccess(pub);
    }

    if (!downloadedIds.includes(pub.id)) {
      const updated = [...downloadedIds, pub.id];
      setDownloadedIds(updated);
      try {
        localStorage.setItem('gec_downloaded_bulletin_ids', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }

    try {
      if (pub.fileUrl && (pub.fileUrl.startsWith('http') || pub.fileUrl.startsWith('data:') || pub.fileUrl.startsWith('blob:'))) {
        const link = document.createElement('a');
        link.href = pub.fileUrl;
        link.target = '_blank';
        link.download = `${pub.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Generate downloadable text representation if no direct PDF url
      const content = `GOD'S EDIFICE CHURCH - MONTHLY BULLETIN\n${pub.title.toUpperCase()}\nMonth: ${pub.month || 'Monthly Issue'} ${pub.publishYear}\nMinister / Author: ${pub.author}\n\nOVERVIEW & EXPOSITION:\n${pub.description}\n\n"Get edified and equipped with God's words in our monthly bulletin available for download."\nGod's Edifice Church - Teaching sound doctrine, faith, and apostolic truth.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pub.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_bulletin.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full bg-[#0D1A14] text-[#F2F7F4] min-h-screen transition-colors duration-300" id="publications-view">
      
      {/* Header Section in Green Family Palette: Solid NO GRADIENTS */}
      <div className="w-full bg-[#0D1A14] text-[#F2F7F4] py-14 sm:py-20 border-b border-[#234436]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-[#F2F7F4]">
            GEC Publications
          </h1>
          <div className="w-20 h-1 bg-[#52B788] mx-auto rounded-full" />
          <p className="text-sm sm:text-base text-[#F2F7F4]/80 leading-relaxed max-w-2xl mx-auto font-sans">
            Get edified and equipped with God's words in our monthly bulletin available for download.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Month & Year Filtering and Search Structure */}
        <div className="bg-[#11221B] border border-[#234436] rounded-2xl p-5 sm:p-6 mb-10 shadow-lg space-y-6" id="bulletin-filter-bar">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Year Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#52B788] shrink-0 mr-1 flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Year:
              </span>
              <button
                type="button"
                onClick={() => setSelectedYear('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedYear === 'all'
                    ? 'bg-[#52B788] text-[#0D1A14]'
                    : 'bg-[#162E24] text-[#F2F7F4]/80 hover:text-white border border-[#234436]'
                }`}
              >
                All Years
              </button>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedYear === yr
                      ? 'bg-[#52B788] text-[#0D1A14]'
                      : 'bg-[#162E24] text-[#F2F7F4]/80 hover:text-white border border-[#234436]'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#98B8A9]" />
              <input
                type="text"
                placeholder="Search bulletin or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#162E24] border border-[#234436] focus:border-[#52B788] rounded-xl py-2 pl-9 pr-4 text-xs text-[#F2F7F4] placeholder-[#98B8A9]/60 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#98B8A9] hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Month Selector Pills */}
          <div className="pt-4 border-t border-[#234436]">
            <div className="flex items-center gap-2 mb-2.5">
              <Filter className="h-3.5 w-3.5 text-[#52B788]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#52B788]">
                Filter By Month:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {MONTHS_LIST.map((m) => {
                const isActive = selectedMonth === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMonth(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#52B788] text-[#0D1A14] font-bold shadow-sm'
                        : 'bg-[#162E24] text-[#F2F7F4]/80 hover:text-white border border-[#234436] hover:border-[#52B788]/40'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Structured List / Grid by Year & Month */}
        {sortedYears.length > 0 && filteredPublications.length > 0 ? (
          <div className="space-y-12" id="bulletins-by-period">
            {sortedYears.map((yr) => {
              const monthsInYear = groupedByYearAndMonth[yr];
              const monthKeys = Object.keys(monthsInYear);
              if (monthKeys.length === 0) return null;

              return (
                <div key={yr} className="space-y-6">
                  {/* Year Header */}
                  <div className="flex items-center gap-4 border-b border-[#234436] pb-3">
                    <span className="font-cinzel text-2xl sm:text-3xl font-bold text-[#52B788]">
                      {yr}
                    </span>
                    <span className="text-xs font-mono text-[#98B8A9] uppercase tracking-widest">
                      Bulletins & Publications
                    </span>
                    <div className="h-px flex-grow bg-[#234436]" />
                  </div>

                  {/* Months in this year */}
                  <div className="space-y-8">
                    {monthKeys.map((m) => {
                      const items = monthsInYear[m];
                      return (
                        <div key={m} className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-[#162E24] border border-[#52B788]/30 rounded-md text-xs font-mono font-bold text-[#52B788] uppercase tracking-wider">
                              {m}
                            </span>
                            <span className="text-xs text-[#98B8A9] font-mono">
                              ({items.length} {items.length === 1 ? 'Bulletin' : 'Bulletins'})
                            </span>
                          </div>

                          {/* Bulletin Cards Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {items.map((pub) => {
                              const isDownloaded = downloadedIds.includes(pub.id) || userLibrary.some((lib) => lib.id === pub.id);

                              return (
                                <motion.div
                                  key={pub.id}
                                  initial={{ opacity: 0, y: 15 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.3 }}
                                  className="group flex flex-col bg-[#11221B] border border-[#234436] rounded-2xl overflow-hidden hover:border-[#52B788]/60 transition-all shadow-md hover:shadow-xl"
                                  id={`bulletin-card-${pub.id}`}
                                >
                                  {/* Cover Container */}
                                  <div
                                    className="relative aspect-[3/4] bg-[#0A1410] overflow-hidden cursor-pointer"
                                    onClick={() => setActivePubDetail(pub)}
                                  >
                                    {pub.coverUrl ? (
                                      <img
                                        src={pub.coverUrl}
                                        alt={pub.title}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#162E24]">
                                        <BookOpen className="h-12 w-12 text-[#52B788] mb-3" />
                                        <h4 className="font-cinzel font-bold text-sm text-[#F2F7F4] line-clamp-2">
                                          {pub.title}
                                        </h4>
                                        <p className="text-[11px] font-mono text-[#52B788] mt-2">
                                          {pub.month || 'Monthly'} {pub.publishYear}
                                        </p>
                                      </div>
                                    )}

                                    {/* Read Synopsis Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#52B788] flex items-center gap-1.5">
                                        <Eye className="h-4 w-4" /> View Details
                                      </span>
                                    </div>

                                    {/* Month Tag (Top Left) */}
                                    <div className="absolute top-3 left-3 bg-[#0D1A14]/90 border border-[#234436] px-2.5 py-1 rounded-md shadow">
                                      <span className="text-[10px] font-mono font-bold text-[#52B788] uppercase tracking-wider">
                                        {pub.month || 'Bulletin'} {pub.publishYear}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Content Info */}
                                  <div className="p-5 flex flex-col flex-grow justify-between">
                                    <div>
                                      <h3
                                        className="font-cinzel font-bold text-sm sm:text-base text-[#F2F7F4] group-hover:text-[#52B788] transition-colors line-clamp-2 mb-1.5 cursor-pointer"
                                        onClick={() => setActivePubDetail(pub)}
                                        title={pub.title}
                                      >
                                        {pub.title}
                                      </h3>

                                      <p className="text-xs text-[#98B8A9] font-sans mb-3">
                                        By {pub.author || 'Pastor Abiodun Adebayo'}
                                      </p>

                                      <p className="text-xs text-[#F2F7F4]/80 line-clamp-3 leading-relaxed mb-4">
                                        {pub.description}
                                      </p>
                                    </div>

                                    {/* Action: Free Download */}
                                    <div className="pt-3 border-t border-[#234436]">
                                      <button
                                        onClick={() => triggerDownload(pub)}
                                        className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                          isDownloaded
                                            ? 'bg-[#162E24] text-[#52B788] border border-[#52B788]/40'
                                            : 'bg-[#52B788] hover:bg-[#40916C] text-[#0D1A14]'
                                        }`}
                                        id={`bulletin-dl-btn-${pub.id}`}
                                      >
                                        {isDownloaded ? (
                                          <>
                                            <Check className="h-4 w-4" /> Downloaded PDF
                                          </>
                                        ) : (
                                          <>
                                            <Download className="h-4 w-4" /> Download PDF
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Clean Empty State */
          <div className="py-20 text-center bg-[#11221B] border border-[#234436] rounded-3xl p-8 max-w-xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-[#162E24] text-[#52B788] flex items-center justify-center mx-auto mb-4 border border-[#234436]">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-cinzel font-bold text-[#F2F7F4] mb-2">
              No Bulletins Available Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#98B8A9] max-w-md mx-auto leading-relaxed font-sans mb-6">
              Monthly bulletins will appear here structured by month and year once uploaded.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#52B788] bg-[#162E24] px-4 py-2 rounded-xl border border-[#234436]">
              <span>Check back shortly for new monthly releases</span>
            </div>
          </div>
        )}

        {/* Modal: Bulletin Overview & Download */}
        <AnimatePresence>
          {activePubDetail && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
              id="bulletin-detail-overlay"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl bg-[#11221B] border border-[#234436] rounded-3xl overflow-hidden shadow-2xl my-8 flex flex-col md:flex-row"
                id="bulletin-detail-container"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActivePubDetail(null)}
                  className="absolute top-4 right-4 text-[#98B8A9] hover:text-white p-1.5 rounded-full hover:bg-[#162E24] transition-all z-10 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Cover / Visual */}
                <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto bg-[#0A1410] flex items-center justify-center">
                  {activePubDetail.coverUrl ? (
                    <img
                      src={activePubDetail.coverUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-8 text-center">
                      <BookOpen className="h-16 w-16 text-[#52B788] mx-auto mb-3" />
                      <span className="font-cinzel font-bold text-sm text-[#F2F7F4]">
                        GEC Bulletin
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="w-full md:w-3/5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div>
                    <span className="px-3 py-1 rounded bg-[#162E24] text-[#52B788] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#234436]">
                      {activePubDetail.month || 'Monthly Bulletin'} {activePubDetail.publishYear}
                    </span>

                    <h3 className="font-cinzel font-bold text-xl sm:text-2xl text-[#F2F7F4] mt-4 leading-tight">
                      {activePubDetail.title}
                    </h3>
                    <p className="text-xs text-[#98B8A9] mt-1 font-medium">
                      By {activePubDetail.author || 'Pastor Abiodun Adebayo'}
                    </p>

                    <p className="text-xs sm:text-sm text-[#F2F7F4]/90 mt-4 leading-relaxed font-sans">
                      {activePubDetail.description}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setActivePubDetail(null)}
                      className="flex-1 py-3 bg-[#162E24] hover:bg-[#1E3E31] border border-[#234436] rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-[#98B8A9] hover:text-white transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        triggerDownload(activePubDetail);
                        setActivePubDetail(null);
                      }}
                      className="flex-1 py-3 bg-[#52B788] hover:bg-[#40916C] text-[#0D1A14] rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Download className="h-4 w-4" /> Download PDF
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
