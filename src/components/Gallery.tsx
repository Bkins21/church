import { useState } from 'react';
import { Camera, Calendar, Tag, X, Image as ImageIcon, Sparkles, HelpCircle } from 'lucide-react';
import { GalleryItem } from '../types';
import { galleryItems } from '../data';
import { motion, AnimatePresence } from 'motion/react';

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Categories
  const categories = ['all', 'Worship', 'Preaching', 'Outreach', 'Community', 'Reboot Camp'];

  const filteredItems = galleryItems.filter(item => {
    return selectedCategory === 'all' || item.category === selectedCategory;
  });

  const formatItemDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="gallery-view">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          Ministry Photos & Moments
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 mx-auto mb-5 rounded-full" />
        <p className="text-sm sm:text-base text-slate-300">
          Capture a glimpse of our active ecosystem of spiritual faith, corporate prayers, fellowship, and city-wide outreach. Experience the joy and intense devotion that define the gatherings of God's Edifice Church.
        </p>
      </div>

      {/* Categories filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-12" id="gallery-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all
              ${selectedCategory === cat
                ? 'bg-cci-gold-500 text-[#040814] shadow-md shadow-cci-gold-600/10'
                : 'bg-[#0a1128] border border-cci-blue-800/60 hover:bg-cci-blue-800/40 text-slate-300'
              }`}
          >
            {cat === 'all' ? 'All Galleries' : cat}
          </button>
        ))}
      </div>

      {/* Masonry Image Grid */}
      {filteredItems.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6" id="gallery-masonry-grid">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layoutId={`gallery-card-${item.id}`}
              onClick={() => setLightboxItem(item)}
              className="break-inside-avoid relative rounded-2xl overflow-hidden bg-[#0a1128]/30 border border-cci-blue-800/60 group cursor-pointer hover:border-cci-gold-500/30 hover:shadow-xl transition-all"
              id={`gallery-item-${item.id}`}
            >
              {/* Image element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500 rounded-2xl"
              />

              {/* Cover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5" />

              {/* Text overlays */}
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                <span className="px-2 py-0.5 bg-cci-gold-500 text-[#040814] text-[9px] font-mono font-bold uppercase tracking-widest rounded">
                  {item.category}
                </span>
                
                <h3 className="font-display font-bold text-sm sm:text-base text-white mt-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[10px] text-slate-400 font-sans mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatItemDate(item.date)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#0a1128]/20 border border-cci-blue-800/40 rounded-2xl">
          <HelpCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="font-display font-bold text-lg text-slate-200">No photos found</h3>
          <p className="text-xs text-slate-400 mt-1">Check back later for recent uploads.</p>
        </div>
      )}

      {/* Lightbox Modal Overlay */}
      <AnimatePresence>
        {lightboxItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto" id="gallery-lightbox-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-[#040814] border border-cci-blue-800 rounded-3xl overflow-hidden shadow-2xl my-8 flex flex-col"
              id="gallery-lightbox-content"
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxItem(null)}
                className="absolute top-5 right-5 text-slate-300 hover:text-white p-1 rounded-full bg-black/50 hover:bg-black/80 transition-all z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Image Frame */}
              <div className="relative max-h-[70vh] bg-black flex items-center justify-center">
                <img
                  src={lightboxItem.imageUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                />
              </div>

              {/* Text Details Area */}
              <div className="p-6 bg-[#0a1128]/80 border-t border-cci-blue-800">
                <div className="flex flex-wrap gap-2 items-center mb-3">
                  <span className="px-2.5 py-0.5 bg-cci-gold-500 text-[#040814] text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                    {lightboxItem.category}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-sans">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatItemDate(lightboxItem.date)}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg sm:text-xl text-white">{lightboxItem.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {lightboxItem.description}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
