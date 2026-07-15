import { useState, FormEvent } from 'react';
import { BookOpen, Award, Download, ShoppingBag, Eye, DollarSign, Check, ChevronRight, X, Heart, CreditCard, ShieldCheck } from 'lucide-react';
import { Publication } from '../types';
import { publicationsCatalog } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface PublicationsProps {
  onPurchaseSuccess: (pub: Publication) => void;
  userLibrary: Publication[];
}

export default function Publications({ onPurchaseSuccess, userLibrary }: PublicationsProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activePubDetail, setActivePubDetail] = useState<Publication | null>(null);
  
  // Checkout States
  const [checkoutPub, setCheckoutPub] = useState<Publication | null>(null);
  const [shippingName, setShippingName] = useState('');
  const [shippingEmail, setShippingEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const filteredPublications = publicationsCatalog.filter(pub => {
    if (selectedType === 'all') return true;
    return pub.type === selectedType;
  });

  const handlePurchaseClick = (pub: Publication) => {
    // Check if already in user library
    const hasBought = userLibrary.some(item => item.id === pub.id);
    if (hasBought) {
      alert(`"${pub.title}" is already in your portal library. You can read/download it there!`);
      return;
    }
    setCheckoutPub(pub);
    setShippingName('');
    setShippingEmail('');
    setErrors({});
  };

  const handleCheckoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!shippingName.trim()) newErrors.shippingName = 'Full name is required';
    if (!shippingEmail.trim() || !/\S+@\S+\.\S+/.test(shippingEmail)) newErrors.shippingEmail = 'Valid email is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0 || !checkoutPub) return;

    setIsProcessing(true);

    // Simulate Payment gateway
    setTimeout(() => {
      onPurchaseSuccess(checkoutPub);
      setIsProcessing(false);
      setCheckoutPub(null);
      alert(`Success! "${checkoutPub.title}" has been added to your GEC Portal under "My Library". You can now download and read it free of charge.`);
    }, 1500);
  };

  const triggerFreeDownload = (pub: Publication) => {
    onPurchaseSuccess(pub);
    
    try {
      // Simulate real download of devotional chapter preview
      const content = `GOD'S EDIFICE CHURCH\n${pub.title.toUpperCase()}\nAuthor: ${pub.author}\nPublished: ${pub.publishYear}\n\nChapter 1 preview compiled successfully. Thank you for studying with GEC resources.\nTo see all men saved and come to the knowledge of truth.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pub.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_preview.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="publications-view">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          GEC Publications & Study Guides
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 mx-auto mb-5 rounded-full" />
        <p className="text-sm sm:text-base text-slate-300">
          Equip your mind with literature designed to anchor your faith. Purchase the highly acclaimed books written by Pastor Abiodun Adebayo, or instantly download the digital Daily Creed devotionals to power your morning devotions.
        </p>
      </div>

      {/* Publications Type Selector */}
      <div className="flex justify-center gap-3 mb-12" id="publication-filters">
        {[
          { id: 'all', label: 'All Publications' },
          { id: 'book', label: 'Books' },
          { id: 'devotional', label: 'Daily Devotionals' }
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`px-5 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all
              ${selectedType === type.id
                ? 'bg-cci-gold-500 text-[#040814] shadow-md shadow-cci-gold-600/10'
                : 'bg-cci-blue-800/40 hover:bg-cci-blue-700/40 border border-cci-blue-800/40 text-slate-300'
              }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Publications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" id="publications-grid">
        {filteredPublications.map((pub) => {
          const isOwned = userLibrary.some(item => item.id === pub.id);
          return (
            <motion.div
              key={pub.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="group flex flex-col bg-[#0a1128]/45 border border-cci-blue-800/60 rounded-2xl overflow-hidden hover:border-cci-gold-500/30 transition-all shadow-lg hover:shadow-xl"
              id={`pub-card-${pub.id}`}
            >
              {/* Cover Container */}
              <div className="relative aspect-[3/4] bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setActivePubDetail(pub)}>
                <img
                  src={pub.coverUrl}
                  alt={pub.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Visual Accent */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cci-gold-400 flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> Read Synopsis
                  </span>
                </div>

                {/* Price tag */}
                <div className="absolute top-4 right-4 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cci-blue-850 shadow-md">
                  <span className="text-xs font-mono font-bold text-cci-gold-400">
                    {pub.price === 0 ? 'FREE' : `$${pub.price}.00`}
                  </span>
                </div>
              </div>

              {/* Book metadata */}
              <div className="p-5 flex flex-col flex-grow">
                <span className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-wider mb-1">{pub.type}</span>
                
                <h3 className="font-display font-bold text-sm sm:text-base text-slate-100 hover:text-cci-gold-300 transition-colors line-clamp-1 mb-1" title={pub.title}>
                  {pub.title}
                </h3>
                
                <p className="text-xs text-slate-400 font-sans mb-4">By: {pub.author}</p>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed flex-grow mb-6">{pub.description}</p>

                {/* Actions */}
                <div className="pt-4 border-t border-cci-blue-800/40">
                  {pub.price === 0 ? (
                    <button
                      onClick={() => triggerFreeDownload(pub)}
                      className={`w-full py-3 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5
                        ${isOwned 
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-cci-blue-850 hover:bg-cci-blue-800 text-slate-200 border border-cci-blue-800'
                        }`}
                      id={`pub-dl-btn-${pub.id}`}
                    >
                      {isOwned ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Checked Out
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5 text-cci-gold-400" /> Free PDF Download
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchaseClick(pub)}
                      className={`w-full py-3 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5
                        ${isOwned 
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-gradient-to-r from-cci-gold-600 to-cci-gold-500 hover:from-cci-gold-500 hover:to-cci-gold-400 text-[#040814] shadow-md shadow-cci-gold-600/5'
                        }`}
                      id={`pub-buy-btn-${pub.id}`}
                    >
                      {isOwned ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> In My Portal Library
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-3.5 w-3.5" /> Order Digital Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        </div>

        {/* Synopsis detail Modal Overlay */}
        <AnimatePresence>
          {activePubDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" id="pub-detail-overlay">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl bg-[#0a1128] border border-cci-blue-700/60 rounded-3xl overflow-hidden shadow-2xl my-8 flex flex-col md:flex-row"
                id="pub-detail-container"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActivePubDetail(null)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-cci-blue-800/40 transition-all z-10"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Book cover (Left / Top) */}
                <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto bg-slate-950">
                  <img
                    src={activePubDetail.coverUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details (Right / Bottom) */}
                <div className="w-full md:w-3/5 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <span className="px-3 py-1 rounded bg-cci-blue-800 text-cci-gold-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                      {activePubDetail.type}
                    </span>
                    
                    <h3 className="font-display font-bold text-xl sm:text-2xl text-white mt-4 leading-tight">
                      {activePubDetail.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">By {activePubDetail.author}</p>

                    <p className="text-xs sm:text-sm text-slate-300 mt-6 leading-relaxed">
                      {activePubDetail.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-6 py-4 border-t border-b border-cci-blue-800/50 text-xs text-slate-400 font-sans">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Pages</span>
                        <strong className="text-slate-200 font-semibold">{activePubDetail.pages} Pages</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Published</span>
                        <strong className="text-slate-200 font-semibold">{activePubDetail.publishYear}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={() => setActivePubDetail(null)}
                      className="flex-1 py-3 bg-[#040814] hover:bg-cci-blue-900/50 border border-cci-blue-800 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
                    >
                      Close Synopsis
                    </button>
                    {activePubDetail.price === 0 ? (
                      <button
                        onClick={() => {
                          triggerFreeDownload(activePubDetail);
                          setActivePubDetail(null);
                        }}
                        className="flex-1 py-3 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 hover:from-cci-gold-500 hover:to-cci-gold-300 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#040814] font-display font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                      >
                        <Download className="h-4 w-4" /> Download PDF
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handlePurchaseClick(activePubDetail);
                          setActivePubDetail(null);
                        }}
                        className="flex-1 py-3 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 hover:from-cci-gold-500 hover:to-cci-gold-300 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#040814] font-display font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                      >
                        <ShoppingBag className="h-4 w-4" /> Get Copy
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Purchase checkout Modal Overlay */}
        <AnimatePresence>
          {checkoutPub && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" id="checkout-modal-overlay">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md bg-[#0a1128] border border-cci-blue-700/60 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8"
                id="checkout-form-container"
              >
                {/* Close Button */}
                <button
                  onClick={() => setCheckoutPub(null)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-cci-blue-800/40 transition-all z-10"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex gap-2.5 items-center mb-6">
                  <CreditCard className="h-5 w-5 text-cci-gold-400 shrink-0" />
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">Order Digital Copy</h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{checkoutPub.title}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#040814] border border-cci-blue-800/80 flex gap-4 items-center mb-6 text-xs">
                  <img
                    src={checkoutPub.coverUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-12 h-16 object-cover rounded shadow"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-100">{checkoutPub.title}</h4>
                    <p className="text-slate-400 font-mono text-[10px] mt-0.5">Author: {checkoutPub.author}</p>
                    <div className="flex justify-between items-center mt-2 font-semibold">
                      <span className="text-slate-500">Order Total:</span>
                      <span className="text-cci-gold-400 font-mono text-sm">${checkoutPub.price}.00</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  {/* Shipping Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      className={`w-full bg-[#040814]/80 border rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cci-gold-500 transition-all
                        ${errors.shippingName ? 'border-red-500/50' : 'border-cci-blue-800'}`}
                    />
                    {errors.shippingName && <p className="text-[11px] text-red-500 mt-1">{errors.shippingName}</p>}
                  </div>

                  {/* Shipping Email */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      value={shippingEmail}
                      onChange={(e) => setShippingEmail(e.target.value)}
                      className={`w-full bg-[#040814]/80 border rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cci-gold-500 transition-all
                        ${errors.shippingEmail ? 'border-red-500/50' : 'border-cci-blue-800'}`}
                    />
                    {errors.shippingEmail && <p className="text-[11px] text-red-500 mt-1">{errors.shippingEmail}</p>}
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Free order simulator (no credit card required)</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 hover:from-cci-gold-500 hover:to-cci-gold-300 text-[#040814] font-display font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-[#040814]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Simulating Payment...
                      </span>
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> Complete Free Order
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
}
