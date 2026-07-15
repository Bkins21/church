import { useState, FormEvent } from 'react';
import { Mail, Phone, MapPin, Heart, ExternalLink, Globe, Landmark, DollarSign, X, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Footer() {
  const [showGiving, setShowGiving] = useState(false);
  const [givingAmount, setGivingAmount] = useState('');
  const [givingType, setGivingType] = useState('Offering');
  const [givingName, setGivingName] = useState('');
  const [givingEmail, setGivingEmail] = useState('');
  const [isGivingSuccess, setIsGivingSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGiveSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!givingAmount || parseFloat(givingAmount) <= 0) {
      alert('Please enter a valid contribution amount');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsGivingSuccess(true);
    }, 1500);
  };

  const closeGivingModal = () => {
    setShowGiving(false);
    setIsGivingSuccess(false);
    setGivingAmount('');
    setGivingName('');
    setGivingEmail('');
  };

  return (
    <footer className="bg-[#030610] border-t border-cci-blue-800/80 text-slate-400 py-16" id="footer-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core details layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          {/* Column 1: Logo & Slogan */}
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 text-white flex items-center justify-center shrink-0">
                <svg viewBox="920 620 650 750" className="w-full h-full" fill="currentColor">
                  <path d="M1085.557,1321.922l25.142,0l0,-490.404l-31.046,22.771l5.904,467.633Zm49.213,24.071l-72.983,0l-6.358,-503.792l79.342,-58.183l0,561.975Z" />
                  <path d="M1395.037,1321.922l25.146,0l5.9,-467.633l-31.046,-22.771l0,490.404Zm48.908,24.071l-72.979,0l0,-561.975l79.342,58.183l-6.362,503.792Z" />
                  <path d="M1354.935,1345.993l-201.308,0l0,-596.846l97.483,-107.225l103.825,103.825l0,528.496l-119.129,0l0,-454.513l24.071,0l0,430.442l70.987,0l0,-494.454l-78.925,-78.925l-74.242,81.658l0,563.471l153.167,0l0,-24.763l24.071,0l0,48.833Z" />
                  <path d="M1545.665,1345.993l-79.267,0l0,-476.475l79.267,102.167l0,55.025l-24.071,0l0,-46.783l-31.125,-40.112l0,382.108l31.125,0l0,-211.196l24.071,0l0,235.267Z" />
                  <path d="M1036.645,1345.993l-93.983,0l0,-324.713l93.983,-49.462l0,65.929l-24.071,0l0,-26.058l-45.842,24.125l0,286.108l45.842,0l0,-234.5l24.071,0l0,258.571Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-[13px] tracking-tighter text-white leading-none">GOD'S EDIFICE</span>
                <span className="font-display font-black text-[11px] tracking-tighter text-white leading-none mt-0.5">CHURCH</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-6">
              "To see all men saved and come to the knowledge of truth." 
              Anchored in the finished work of Christ, training the believer for evangelical boldness, theological speed, and daily prayerful discipline.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3">
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider mb-4">Streaming</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://mixlr.com/gods-edifice" target="_blank" rel="noreferrer" className="hover:text-cci-gold-400 transition-colors flex items-center gap-1.5">
                  GEC Mixlr Audio <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://youtube.com/@GodsEdificeChurch" target="_blank" rel="noreferrer" className="hover:text-cci-gold-400 transition-colors flex items-center gap-1.5">
                  GEC YouTube <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Headquarters */}
          <div className="md:col-span-4">
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider mb-4">Headquarters</h4>
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-cci-gold-500 shrink-0 mt-0.5" />
                <span>God's Edifice Hall, Macjob Secondary school, onikolobo, oluwo junction, Abeokuta, Ogun state</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-cci-gold-500 shrink-0" />
                <span>+234 809 999 8888</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-cci-gold-500 shrink-0" />
                <span className="truncate">info@godsedifice.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal bar */}
        <div className="pt-8 border-t border-cci-blue-800/40 text-center text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} God's Edifice Church. All Rights Reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Doctrinal Statement</span>
          </div>
        </div>
      </div>

      {/* Online Giving Modal */}
      <AnimatePresence>
        {showGiving && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto" id="giving-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0a1128] border border-cci-blue-700/60 rounded-3xl overflow-hidden shadow-2xl"
              id="giving-modal-content"
            >
              {/* Close Button */}
              <button
                onClick={closeGivingModal}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-cci-blue-800/40 transition-all z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {isGivingSuccess ? (
                /* GIVING SUCCESS SCREEN */
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  
                  <h3 className="font-display font-bold text-xl text-white">Contribution Received</h3>
                  <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                    Thank you for your generous partnership towards the spread of the Gospel. A receipt has been generated for your record.
                  </p>

                  <div className="w-full bg-[#040814] rounded-2xl border border-cci-blue-800 p-5 mt-6 text-left text-xs font-sans space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Contributor:</span>
                      <strong className="text-white font-medium">{givingName || 'Anonymous Partner'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Allocation:</span>
                      <span className="text-slate-200">{givingType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount Given:</span>
                      <strong className="text-cci-gold-400 font-mono text-sm">${parseFloat(givingAmount).toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between border-t border-cci-blue-800/50 pt-2.5 mt-2.5 text-[10px] text-slate-500">
                      <span>Receipt ID:</span>
                      <span className="font-mono uppercase">{`GEC-GIVE-${Math.floor(100000 + Math.random() * 900000)}`}</span>
                    </div>
                  </div>

                  <button
                    onClick={closeGivingModal}
                    className="w-full py-3.5 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 hover:from-cci-gold-500 hover:to-cci-gold-300 text-[#040814] rounded-xl font-display font-bold text-xs uppercase tracking-wider mt-8 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* GIVING CONFIG FORM */
                <div className="p-6 sm:p-8">
                  <div className="flex gap-2.5 items-center mb-6">
                    <Landmark className="h-5 w-5 text-cci-gold-400 shrink-0" />
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">GEC Giving Center</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Support global missions and ministry services</p>
                    </div>
                  </div>

                  {/* Tab Option 1: Direct Bank Transfer Details */}
                  <div className="bg-[#040814] border border-cci-blue-800/80 p-4 rounded-2xl mb-6 text-xs font-sans">
                    <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-cci-gold-400" />
                      Direct Bank Transfer Accounts
                    </h4>
                    
                    <div className="space-y-3 mt-3 text-slate-300">
                      <div className="py-2 border-b border-cci-blue-800/40 flex justify-between items-center">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Tithes & Partnership (GTBank)</span>
                          <strong className="font-mono text-slate-200">0123456789</strong>
                        </div>
                        <span className="text-[10px] bg-cci-blue-850 px-2 py-0.5 rounded text-cci-gold-400">Copy</span>
                      </div>
                      <div className="py-2 flex justify-between items-center">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Global Missions (Access Bank)</span>
                          <strong className="font-mono text-slate-200">0987654321</strong>
                        </div>
                        <span className="text-[10px] bg-cci-blue-850 px-2 py-0.5 rounded text-cci-gold-400">Copy</span>
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-500 mt-3">*Acct Name: God's Edifice Church</p>
                  </div>

                  <div className="text-center my-4 text-slate-500 font-mono text-[10px] relative">
                    <div className="absolute inset-0 top-1/2 border-t border-cci-blue-800/50" />
                    <span className="relative bg-[#0a1128] px-3 z-10">OR SECURE CARD SIMULATION</span>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleGiveSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Name */}
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Your Name</label>
                        <input
                          type="text"
                          placeholder="Partner Name"
                          value={givingName}
                          onChange={(e) => setGivingName(e.target.value)}
                          className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                      
                      {/* Allocation */}
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Allocation</label>
                        <select
                          value={givingType}
                          onChange={(e) => setGivingType(e.target.value)}
                          className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none"
                        >
                          <option value="Offering">Offering</option>
                          <option value="Tithe">Tithe</option>
                          <option value="Global Missions">Global Missions</option>
                          <option value="Partnership">Partnership Allocation</option>
                        </select>
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Amount ($ USD)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="number"
                          placeholder="50"
                          required
                          value={givingAmount}
                          onChange={(e) => setGivingAmount(e.target.value)}
                          className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-3.5 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 hover:from-cci-gold-500 hover:to-cci-gold-300 text-[#040814] rounded-xl font-display font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing Transaction...' : 'Process Gift Contribution'}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
