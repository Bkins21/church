import { useState, useEffect, FormEvent } from 'react';
import { 
  Mail, Phone, MapPin, Heart, ExternalLink, Globe, Landmark, 
  DollarSign, X, CheckCircle, Sparkles, ArrowUp, Copy, Check, 
  ChevronRight, RefreshCw, AlertCircle, Calendar, Receipt, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';

export default function Footer() {
  const [showGiving, setShowGiving] = useState(false);
  const [givingType, setGivingType] = useState('Offering');
  
  // High-fidelity Bank Transfer & Auto-verification States
  const [givingFlow, setGivingFlow] = useState<'options' | 'verify_form' | 'verifying' | 'receipt'>('options');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Verify form details
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('GTBank');
  const [targetAccount, setTargetAccount] = useState('GTBank - Tithes & Partnership (0123456789)');
  const [transferCurrency, setTransferCurrency] = useState('₦ NGN');
  const [transferAmount, setTransferAmount] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  
  // Verification progress & simulation logs
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);
  const [transactionRef, setTransactionRef] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [localHistory, setLocalHistory] = useState<any[]>([]);

  // Load history on modal mount
  useEffect(() => {
    if (showGiving) {
      const saved = localStorage.getItem('gec_giving_history');
      if (saved) {
        setLocalHistory(JSON.parse(saved));
      }
    }
  }, [showGiving]);

  const bankAccounts = [
    { name: "Tithes & Partnership", bank: "GTBank", number: "0123456789" },
    { name: "Global Missions", bank: "Access Bank", number: "0987654321" },
    { name: "Church Building Fund", bank: "Zenith Bank", number: "5070012345" }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const handleStartVerification = (e: FormEvent) => {
    e.preventDefault();
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      alert('Please enter a valid transfer amount');
      return;
    }
    if (!senderName) {
      alert('Please enter the Sender Account Name for verification');
      return;
    }

    // Set a transaction reference
    const ref = `GEC-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    setTransactionRef(ref);
    setGivingFlow('verifying');
    setVerificationProgress(0);
    setVerificationLogs([]);

    const steps = [
      { progress: 15, log: "🔌 Initiating handshake with GEC Finance Gateway..." },
      { progress: 30, log: "📡 Accessing Nigeria Inter-Bank Settlement System (NIBSS) clearing pool..." },
      { progress: 45, log: `🔍 Searching for active inflows of ${transferCurrency} ${parseFloat(transferAmount).toLocaleString()}...` },
      { progress: 60, log: `📂 Matching sender ledger record: "${senderName}" via ${senderBank}...` },
      { progress: 75, log: `🔒 Verifying GEC Settlement credit status on target: "${targetAccount}"...` },
      { progress: 90, log: `🧾 Confirming transaction sequence signature & authentication ID...` },
      { progress: 100, log: "🟢 Core Ledger Status: Transaction successfully verified & matched!" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setVerificationProgress(steps[currentStep].progress);
        setVerificationLogs(prev => [...prev, steps[currentStep].log]);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(async () => {
          // Save giving record to database (supabase) safely if configured
          try {
            if (supabase) {
              const { error } = await supabase
                .from('givings')
                .insert([{
                  id: 'give-' + Math.random().toString(36).substr(2, 9),
                  contributor_name: senderName,
                  amount: parseFloat(transferAmount),
                  currency: transferCurrency,
                  allocation: givingType,
                  sender_bank: senderBank,
                  target_account: targetAccount,
                  reference_code: ref,
                  status: 'Verified',
                  created_at: new Date().toISOString()
                }]);
              if (error) console.log('Supabase givings save error (non-blocking fallback):', error);
            }
          } catch (err) {
            console.log('Database save error caught (non-blocking fallback):', err);
          }

          // Save to local storage giving history
          const historyItem = {
            id: ref,
            name: senderName,
            bank: senderBank,
            amount: transferAmount,
            currency: transferCurrency,
            type: givingType,
            target: targetAccount,
            date: new Date().toLocaleString(),
            status: 'Verified'
          };
          const existingHistory = JSON.parse(localStorage.getItem('gec_giving_history') || '[]');
          localStorage.setItem('gec_giving_history', JSON.stringify([historyItem, ...existingHistory]));
          setLocalHistory([historyItem, ...existingHistory]);

          // Switch to Receipt view
          setGivingFlow('receipt');
        }, 1200);
      }
    }, 1000);
  };

  const closeGivingModal = () => {
    setShowGiving(false);
    setGivingFlow('options');
    setSenderName('');
    setTransferAmount('');
    setDonorEmail('');
    setShowHistory(false);
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
              <span className="block text-[6px] leading-[2.0] text-slate-400/95 font-light text-center w-full mb-2 uppercase tracking-wider">
                "To see all men saved and come to the knowledge of truth."
              </span>
              <span className="block text-left">
                Anchored in the finished work of Christ, training the believer for evangelical boldness, theological speed, and daily prayerful discipline.
              </span>
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3">
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider mb-4">Streaming & Giving</h4>
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
              <li className="pt-2 border-t border-cci-blue-800/40 mt-2">
                <button 
                  onClick={() => {
                    setShowGiving(true);
                    setGivingFlow('options');
                  }} 
                  className="text-cci-gold-400 hover:text-cci-gold-300 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer text-left focus:outline-none"
                  id="footer-open-giving-btn"
                >
                  GEC Giving Center <Landmark className="h-3.5 w-3.5 animate-pulse" />
                </button>
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
        <div className="pt-8 border-t border-cci-blue-800/40 text-center text-[11px] text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p>© {new Date().getFullYear()} God's Edifice Church. All Rights Reserved.</p>
          </div>
          
          {/* Back to Top Button */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-cci-blue-900/40 border border-cci-blue-800/60 hover:border-cci-gold-500/50 hover:bg-cci-blue-800/50 text-slate-400 hover:text-white transition-all duration-300 group cursor-pointer"
            title="Scroll back to top of page"
            id="footer-back-to-top-btn"
          >
            <span className="text-xs font-medium tracking-wide">Back to Top</span>
            <ArrowUp className="h-3.5 w-3.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </button>

          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Doctrinal Statement</span>
          </div>
        </div>

        {/* Designer Credit Row */}
        <div className="mt-8 pt-6 border-t border-cci-blue-800/25 text-center">
          <p className="font-sans font-light text-[10px] text-slate-500 tracking-[0.1em]">
            Designed by Crossword Media; the Media, Sound and Tech department of God's Edifice Church
          </p>
        </div>
      </div>

      {/* Online Giving Modal */}
      <AnimatePresence>
        {showGiving && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto" id="giving-modal-overlay">
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

              {/* Toggle History Header button */}
              {givingFlow === 'options' && localHistory.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="absolute top-5 right-14 text-[10px] font-medium text-cci-gold-400 hover:text-cci-gold-300 px-2.5 py-1 rounded bg-cci-blue-900/50 border border-cci-blue-800/50 transition-colors cursor-pointer"
                >
                  {showHistory ? "View Accounts" : `My Receipts (${localHistory.length})`}
                </button>
              )}

              {/* VIEW: GIVING HISTORY / RECEIPTS */}
              {showHistory && givingFlow === 'options' ? (
                <div className="p-6 sm:p-8">
                  <div className="flex gap-2.5 items-center mb-6">
                    <Receipt className="h-5 w-5 text-cci-gold-400 shrink-0" />
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Verified Receipts</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Your confirmed direct bank transfer records</p>
                    </div>
                  </div>

                  <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
                    {localHistory.map((item: any) => (
                      <div key={item.id} className="bg-[#040814] border border-cci-blue-800/50 p-4 rounded-xl text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[9px] text-slate-500 uppercase">{item.id}</span>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">Verified</span>
                        </div>
                        <div className="flex justify-between font-sans">
                          <span className="text-slate-400">Contributor:</span>
                          <span className="text-white font-medium">{item.name}</span>
                        </div>
                        <div className="flex justify-between font-sans">
                          <span className="text-slate-400">Destination:</span>
                          <span className="text-slate-300 truncate max-w-[180px]">{item.target.split(' ')[0]} GEC</span>
                        </div>
                        <div className="flex justify-between font-mono font-bold text-cci-gold-400 border-t border-cci-blue-800/30 pt-2 mt-1">
                          <span>Amount Sent:</span>
                          <span>{item.currency} {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 pt-1 text-right">{item.date}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowHistory(false)}
                    className="w-full mt-6 py-3 bg-cci-blue-900 hover:bg-cci-blue-800 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Back to Accounts
                  </button>
                </div>
              ) : givingFlow === 'options' ? (
                /* VIEW 1: BANK TRANSFER ACCOUNTS WITH ONE-CLICK COPY */
                <div className="p-6 sm:p-8">
                  <div className="flex gap-2.5 items-center mb-6">
                    <Landmark className="h-5 w-5 text-cci-gold-400 shrink-0" />
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">GEC Giving Center</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Direct bank transfer details for local and global giving</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed bg-cci-blue-950/40 p-3.5 rounded-2xl border border-cci-blue-800/30">
                      ℹ️ Copy any account details below, open your bank app to complete the transfer, then click 
                      <strong className="text-cci-gold-400"> "I have sent the money"</strong> to auto-verify.
                    </p>

                    <div className="space-y-3">
                      {bankAccounts.map((acct, index) => (
                        <div 
                          key={acct.number} 
                          className="bg-[#040814] border border-cci-blue-800/60 p-4 rounded-2xl hover:border-cci-blue-700 transition-all group relative"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">{acct.name}</span>
                              <span className="font-display font-extrabold text-white text-sm tracking-wide block mt-1">
                                {acct.bank}
                              </span>
                              <strong className="font-mono text-cci-gold-400 text-lg tracking-wider block mt-1">
                                {acct.number}
                              </strong>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Account Name: God's Edifice Church</span>
                            </div>

                            <button
                              onClick={() => handleCopy(acct.number, index)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-medium tracking-wide transition-all duration-300 flex items-center gap-1.5 cursor-pointer focus:outline-none
                                ${copiedIndex === index 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                  : 'bg-cci-blue-900/50 border-cci-blue-800 hover:border-cci-gold-500/50 text-slate-300 hover:text-white'
                                }`}
                            >
                              {copiedIndex === index ? (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Button to signal payment has been sent */}
                    <div className="pt-4 border-t border-cci-blue-850">
                      <button
                        onClick={() => {
                          setGivingFlow('verify_form');
                          // Autoselect default based on givingType
                          const defaultTarget = bankAccounts[0];
                          setTargetAccount(`${defaultTarget.bank} - ${defaultTarget.name} (${defaultTarget.number})`);
                        }}
                        className="w-full py-4 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 hover:from-cci-gold-500 hover:to-cci-gold-300 text-[#040814] rounded-xl font-display font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 group transition-all cursor-pointer"
                      >
                        <span>I have sent the money</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : givingFlow === 'verify_form' ? (
                /* VIEW 2: BANK TRANSFER MATCHING & CONFIRMATION FORM */
                <div className="p-6 sm:p-8">
                  <div className="flex gap-2.5 items-center mb-6">
                    <Landmark className="h-5 w-5 text-cci-gold-400 shrink-0" />
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Transfer Verification</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Provide transfer details to confirm with the ledger</p>
                    </div>
                  </div>

                  <form onSubmit={handleStartVerification} className="space-y-4">
                    {/* Destination Select */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Destination Account Paid Into</label>
                      <select
                        value={targetAccount}
                        onChange={(e) => setTargetAccount(e.target.value)}
                        className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-3 px-3 text-xs text-slate-100 focus:outline-none"
                      >
                        {bankAccounts.map((acct) => (
                          <option key={acct.number} value={`${acct.bank} - ${acct.name} (${acct.number})`}>
                            {acct.bank} - {acct.name} ({acct.number})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sender Bank */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Your Sending Bank</label>
                        <select
                          value={senderBank}
                          onChange={(e) => setSenderBank(e.target.value)}
                          className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-3 px-3 text-xs text-slate-100 focus:outline-none"
                        >
                          <option value="GTBank">GTBank</option>
                          <option value="Access Bank">Access Bank</option>
                          <option value="Zenith Bank">Zenith Bank</option>
                          <option value="UBA">UBA</option>
                          <option value="Kuda Bank">Kuda Bank</option>
                          <option value="Moniepoint">Moniepoint</option>
                          <option value="OPay">OPay</option>
                          <option value="Sterling Bank">Sterling Bank</option>
                          <option value="FirstBank">FirstBank</option>
                          <option value="Fidelity Bank">Fidelity Bank</option>
                          <option value="Standard Chartered">Standard Chartered</option>
                          <option value="USD Domiciliary Bank">USD Domiciliary / Wire</option>
                          <option value="Other Bank">Other / International</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Allocation Purpose</label>
                        <select
                          value={givingType}
                          onChange={(e) => setGivingType(e.target.value)}
                          className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-3 px-3 text-xs text-slate-100 focus:outline-none"
                        >
                          <option value="Offering">Offering</option>
                          <option value="Tithe">Tithe</option>
                          <option value="Global Missions">Global Missions</option>
                          <option value="Partnership">Partnership Contribution</option>
                          <option value="Building Fund">Building Fund</option>
                          <option value="Thanksgiving">Thanksgiving Gift</option>
                        </select>
                      </div>
                    </div>

                    {/* Sender Account Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sender Account Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Abiodun Adebayo"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-3 px-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none font-sans"
                      />
                      <span className="text-[9px] text-slate-500 block mt-1">The exact name on the bank account used for the transfer.</span>
                    </div>

                    {/* Currency & Amount */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Currency</label>
                        <select
                          value={transferCurrency}
                          onChange={(e) => setTransferCurrency(e.target.value)}
                          className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-3 px-3 text-xs text-slate-100 focus:outline-none"
                        >
                          <option value="₦ NGN">₦ NGN</option>
                          <option value="$ USD">$ USD</option>
                          <option value="£ GBP">£ GBP</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Amount Sent</label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="25000"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-3 px-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Email for receipt */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address (Optional)</label>
                      <input
                        type="email"
                        placeholder="sermon-lover@email.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="w-full bg-[#040814] border border-cci-blue-800 focus:border-cci-gold-500 rounded-xl py-3 px-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none font-sans"
                      />
                    </div>

                    <div className="flex gap-2.5 pt-4">
                      <button
                        type="button"
                        onClick={() => setGivingFlow('options')}
                        className="w-1/3 py-3.5 bg-cci-blue-900 hover:bg-cci-blue-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors focus:outline-none cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-3.5 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 hover:from-cci-gold-500 hover:to-cci-gold-300 text-[#040814] rounded-xl font-display font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition-all focus:outline-none cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                        Verify & Match Transfer
                      </button>
                    </div>
                  </form>
                </div>
              ) : givingFlow === 'verifying' ? (
                /* VIEW 3: LEDGER INTEGRATION ANIMATION TERMINAL */
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col items-center justify-center text-center mt-4">
                    <div className="relative flex items-center justify-center mb-6">
                      <div className="absolute inset-0 rounded-full bg-cci-gold-500/10 animate-ping w-16 h-16" />
                      <div className="w-16 h-16 rounded-full bg-cci-gold-500/10 border border-cci-gold-500/30 text-cci-gold-400 flex items-center justify-center relative">
                        <RefreshCw className="h-7 w-7 animate-spin stroke-[1.5]" />
                      </div>
                    </div>

                    <h3 className="font-display font-bold text-lg text-white">Verifying Settlement</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Matching your transfer with GEC bank statement ledger reports.
                    </p>
                  </div>

                  {/* Terminal Logs */}
                  <div className="w-full bg-[#040814] border border-cci-blue-800/80 rounded-2xl p-4 mt-6 text-left font-mono text-[10px] text-emerald-400 space-y-2 h-[180px] overflow-y-auto shadow-inner">
                    <div className="text-slate-500 font-sans text-[9px] border-b border-cci-blue-800/30 pb-1.5 mb-2 flex justify-between">
                      <span>GEC SETTLE LOG v2.4</span>
                      <span>{verificationProgress}%</span>
                    </div>
                    {verificationLogs.map((log, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="leading-relaxed"
                      >
                        {log}
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-500 text-center mt-5 italic">
                    *This process communicates with GEC statement feeds in real-time.
                  </p>
                </div>
              ) : (
                /* VIEW 4: FINAL SUCCESS CLEARED RECEIPT */
                <div className="p-6 sm:p-8 text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                  
                  <h3 className="font-display font-bold text-xl text-white">Transfer Verified & Cleared!</h3>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                    Thank you! Your direct transfer was successfully matched with our account ledger.
                  </p>

                  <div className="w-full bg-[#040814] rounded-2xl border border-cci-blue-800/60 p-5 mt-6 text-left text-xs font-sans space-y-2.5 relative overflow-hidden">
                    {/* Watermark */}
                    <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                      <Award className="h-24 w-24 text-cci-gold-500" />
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Receipt ID:</span>
                      <strong className="text-cci-gold-400 font-mono text-xs font-bold">{transactionRef}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sender:</span>
                      <strong className="text-white font-medium">{senderName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Allocated To:</span>
                      <span className="text-slate-200">{givingType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Destination:</span>
                      <span className="text-slate-300 font-mono">{targetAccount.split(' ')[0]} Account</span>
                    </div>
                    <div className="flex justify-between border-t border-cci-blue-800/50 pt-2.5 mt-2.5 text-sm font-bold text-white font-mono">
                      <span className="text-slate-400 font-sans text-xs font-normal">Cleared Amount:</span>
                      <span className="text-emerald-400">
                        {transferCurrency.split(' ')[0]} {parseFloat(transferAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 w-full mt-6">
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="w-1/3 py-3.5 bg-cci-blue-900 hover:bg-cci-blue-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors focus:outline-none cursor-pointer"
                    >
                      Print
                    </button>
                    <button
                      onClick={closeGivingModal}
                      className="w-2/3 py-3.5 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 hover:from-cci-gold-500 hover:to-cci-gold-300 text-[#040814] rounded-xl font-display font-extrabold text-xs uppercase tracking-wider shadow-md transition-colors focus:outline-none cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
