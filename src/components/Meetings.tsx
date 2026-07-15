import { useState, useEffect, FormEvent } from 'react';
import { Calendar, MapPin, Clock, User, Mail, Phone, Ticket, QrCode, Printer, ChevronLeft, CheckCircle2, Trash2, ArrowRight, ShieldCheck, Sparkles, Map } from 'lucide-react';
import { Registration, ChurchEvent } from '../types';
import { upcomingMeetings } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface MeetingsProps {
  onRegisterSuccess: (registration: Registration) => void;
  userRegistrations: Registration[];
  prefilledReg: { firstName: string; surname: string; email: string; eventId: string } | null;
  onClearPrefilled: () => void;
  onClearRegistrations?: () => void;
}

export default function Meetings({
  onRegisterSuccess,
  userRegistrations,
  prefilledReg,
  onClearPrefilled,
  onClearRegistrations
}: MeetingsProps) {
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [activeTicket, setActiveTicket] = useState<Registration | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('GEC Lekki HQ (Lekki HQ)');
  const [mode, setMode] = useState<'physical' | 'virtual'>('physical');
  const [address, setAddress] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');
  const [expectations, setExpectations] = useState('');
  const [howHeard, setHowHeard] = useState('');

  // Form Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Countdown State
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  // Branches list
  const branches = [
    'GEC Lekki HQ (Lekki HQ)',
    'GEC Abeokuta (Onikolobo)',
    'GEC Lagos Mainland (Yaba)',
    'GEC Obada Branch',
    'GEC Port Harcourt',
    'GEC Abuja',
    'GEC London Branch',
    'GEC Houston Branch',
    'Online Campus (Global)'
  ];

  // Handle prefilled registration from Hero
  useEffect(() => {
    if (prefilledReg) {
      const eventToRegister = upcomingMeetings.find(e => e.id === prefilledReg.eventId);
      if (eventToRegister) {
        setSelectedEvent(eventToRegister);
        setFirstName(prefilledReg.firstName);
        setSurname(prefilledReg.surname);
        setEmail(prefilledReg.email);
        onClearPrefilled();
      }
    }
  }, [prefilledReg, onClearPrefilled]);

  // Edifice Conference 2026 Countdown
  useEffect(() => {
    const targetDate = new Date('2026-10-01T09:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds, expired: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!surname.trim()) newErrors.surname = 'Surname is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.trim().length < 8) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!address.trim()) {
      newErrors.address = 'Residential address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (!validateForm()) {
      const firstError = document.querySelector('.text-red-400');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const ticketCode = `GEC-${selectedEvent.id.substring(0, 4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const registration: Registration = {
      id: `reg-${Date.now()}`,
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      eventDate: selectedEvent.date,
      eventLocation: selectedEvent.location,
      userName: `${firstName.trim()} ${surname.trim()}`,
      userEmail: email.trim().toLowerCase(),
      userPhone: phone.trim(),
      userBranch: branch,
      ticketCode,
      registrationDate: new Date().toLocaleDateString('en-GB'),
      mode,
      address: address.trim(),
      ageRange,
      gender,
      expectations: expectations.trim(),
      howHeard
    };

    onRegisterSuccess(registration);
    setActiveTicket(registration);
    setSelectedEvent(null);

    // Reset Form
    setFirstName('');
    setSurname('');
    setEmail('');
    setPhone('');
    setAddress('');
    setAgeRange('');
    setGender('');
    setExpectations('');
    setHowHeard('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="meetings-view">
      <AnimatePresence mode="wait">
        
        {/* Ticket Detail / Active Ticket View */}
        {activeTicket && (
          <motion.div
            key="ticket-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-2xl mx-auto"
            id="ticket-details-panel"
          >
            <div className="flex justify-between items-center mb-6 no-print">
              <button
                onClick={() => setActiveTicket(null)}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors py-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Meetings</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-cci-blue-800 hover:bg-cci-blue-700 border border-cci-blue-700/60 px-4 py-2 rounded-xl text-xs font-bold text-cci-gold-400 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>Print Pass</span>
              </button>
            </div>

            {/* Skeuomorphic Boarding Pass / Ticket */}
            <div className="bg-[#0a1128] border border-cci-blue-700/60 rounded-3xl overflow-hidden shadow-2xl relative">
              {/* Top Banner Accent */}
              <div className="h-2 bg-gradient-to-r from-cci-gold-600 via-cci-gold-400 to-cci-gold-600" />
              
              {/* Ticket Body */}
              <div className="p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cci-blue-700/40 pb-6 mb-6 gap-4">
                  <div>
                    <span className="text-xs font-mono tracking-wider text-cci-gold-400 uppercase font-semibold">
                      Official Attendance Pass
                    </span>
                    <h3 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight mt-1">
                      {activeTicket.eventTitle}
                    </h3>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full px-4 py-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Registered ({activeTicket.mode})</span>
                  </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Attendee Name</span>
                      <span className="text-base font-bold text-white block">{activeTicket.userName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Email Address</span>
                      <span className="text-sm text-slate-200 block truncate">{activeTicket.userEmail}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Phone Number</span>
                      <span className="text-sm text-slate-200 block">{activeTicket.userPhone || 'Not Provided'}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Local Branch</span>
                      <span className="text-sm text-slate-200 block font-semibold">{activeTicket.userBranch}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Event Date</span>
                      <span className="text-sm text-slate-200 block">{activeTicket.eventDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Location / Venue</span>
                      <span className="text-sm text-slate-200 block line-clamp-2">{activeTicket.eventLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Perforation Divider Line */}
                <div className="relative my-8 border-t-2 border-dashed border-cci-blue-700/50">
                  <div className="absolute -left-11 -top-3 w-6 h-6 bg-[#040814] rounded-full border-r border-cci-blue-700/60" />
                  <div className="absolute -right-11 -top-3 w-6 h-6 bg-[#040814] rounded-full border-l border-cci-blue-700/60" />
                </div>

                {/* QR Code and Code Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Unique Ticket ID</span>
                    <span className="text-xl font-mono font-bold text-white tracking-widest block mt-1">
                      {activeTicket.ticketCode}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Registered on: {activeTicket.registrationDate}</span>
                  </div>
                  
                  {/* Decorative QR Code */}
                  <div className="p-3 bg-white rounded-2xl shrink-0 flex items-center justify-center relative group">
                    <QrCode className="h-28 w-28 text-slate-900" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-[#040814]/90 rounded-2xl transition-opacity no-print">
                      <span className="text-[10px] font-mono text-cci-gold-400 font-bold uppercase tracking-wider">Valid Entry</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-cci-blue-700/20 text-center no-print">
                  <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                    Please present this digital ticket pass or a printed copy at the entrance desk of the venue for confirmation.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Registration Form View */}
        {selectedEvent && !activeTicket && (
          <motion.div
            key="register-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-3xl mx-auto"
            id="registration-form-panel"
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6 py-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Meetings</span>
            </button>

            <div className="bg-gradient-to-b from-[#0a1128] to-[#040814] border border-cci-blue-700/60 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cci-gold-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="mb-8 border-b border-cci-blue-700/40 pb-6">
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cci-gold-400 block mb-2">
                  Conference Registration Form
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                  {selectedEvent.title}
                </h3>
                <div className="flex flex-wrap gap-y-2 gap-x-4 mt-4 text-xs text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-cci-gold-500" />
                    {selectedEvent.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-cci-gold-500" />
                    {selectedEvent.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-cci-gold-500 shrink-0" />
                    {selectedEvent.location}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-semibold">
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full bg-[#050b18] border border-cci-blue-700/50 hover:border-cci-blue-700/80 focus:border-cci-gold-500/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                    {errors.firstName && <span className="text-red-400 text-xs mt-1 block font-mono">{errors.firstName}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-semibold">
                      Surname / Last Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        placeholder="Doe"
                        className="w-full bg-[#050b18] border border-cci-blue-700/50 hover:border-cci-blue-700/80 focus:border-cci-gold-500/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                    {errors.surname && <span className="text-red-400 text-xs mt-1 block font-mono">{errors.surname}</span>}
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-semibold">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john.doe@example.com"
                        className="w-full bg-[#050b18] border border-cci-blue-700/50 hover:border-cci-blue-700/80 focus:border-cci-gold-500/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                    {errors.email && <span className="text-red-400 text-xs mt-1 block font-mono">{errors.email}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-semibold">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 ..."
                        className="w-full bg-[#050b18] border border-cci-blue-700/50 hover:border-cci-blue-700/80 focus:border-cci-gold-500/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                    {errors.phone && <span className="text-red-400 text-xs mt-1 block font-mono">{errors.phone}</span>}
                  </div>
                </div>

                {/* Nearest GEC Branch */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-semibold">
                    Your Nearest GEC Branch <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-[#050b18] border border-cci-blue-700/50 hover:border-cci-blue-700/80 focus:border-cci-gold-500/80 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition-colors"
                  >
                    {branches.map((b) => (
                      <option key={b} value={b} className="bg-[#050b18] text-white">{b}</option>
                    ))}
                  </select>
                </div>

                {/* Residential Address - Required if physical */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-semibold">
                    Residential Address {mode === 'physical' && <span className="text-red-400">*</span>}
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Provide your city or full residential address..."
                    rows={2}
                    className="w-full bg-[#050b18] border border-cci-blue-700/50 hover:border-cci-blue-700/80 focus:border-cci-gold-500/80 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors resize-none"
                  />
                  {errors.address && <span className="text-red-400 text-xs mt-1 block font-mono">{errors.address}</span>}
                </div>

                {/* Demographics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-semibold">
                      Age Range
                    </label>
                    <select
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      className="w-full bg-[#050b18] border border-cci-blue-700/50 hover:border-cci-blue-700/80 focus:border-cci-gold-500/80 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition-colors"
                    >
                      <option value="" className="bg-[#050b18]">Select Age range (Optional)</option>
                      <option value="Under 18" className="bg-[#050b18]">Under 18</option>
                      <option value="18 - 25" className="bg-[#050b18]">18 - 25 years</option>
                      <option value="26 - 35" className="bg-[#050b18]">26 - 35 years</option>
                      <option value="36 - 45" className="bg-[#050b18]">36 - 45 years</option>
                      <option value="46 and Above" className="bg-[#050b18]">46 and Above</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-semibold">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-[#050b18] border border-cci-blue-700/50 hover:border-cci-blue-700/80 focus:border-cci-gold-500/80 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition-colors"
                    >
                      <option value="" className="bg-[#050b18]">Select Gender (Optional)</option>
                      <option value="Male" className="bg-[#050b18]">Male</option>
                      <option value="Female" className="bg-[#050b18]">Female</option>
                    </select>
                  </div>
                </div>

                {/* expectations */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-semibold">
                    What are your expectations or prayer requests?
                  </label>
                  <textarea
                    value={expectations}
                    onChange={(e) => setExpectations(e.target.value)}
                    placeholder="Share what you are believing God for at this conference..."
                    rows={3}
                    className="w-full bg-[#050b18] border border-cci-blue-700/50 hover:border-cci-blue-700/80 focus:border-cci-gold-500/80 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* how heard */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-semibold">
                    How did you hear about this meeting?
                  </label>
                  <select
                    value={howHeard}
                    onChange={(e) => setHowHeard(e.target.value)}
                    className="w-full bg-[#050b18] border border-cci-blue-700/50 hover:border-cci-blue-700/80 focus:border-cci-gold-500/80 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition-colors"
                  >
                    <option value="" className="bg-[#050b18]">Select Option (Optional)</option>
                    <option value="Church Service Announcement" className="bg-[#050b18]">Church Service Announcement</option>
                    <option value="Friend or Family Member" className="bg-[#050b18]">Friend or Family Member</option>
                    <option value="Social Media (X, Facebook, Instagram)" className="bg-[#050b18]">Social Media (X, Facebook, Instagram)</option>
                    <option value="WhatsApp Status / Group" className="bg-[#050b18]">WhatsApp Status / Group</option>
                    <option value="Mixlr / Audio stream" className="bg-[#050b18]">Mixlr / Audio stream</option>
                    <option value="Flyers / Billboard" className="bg-[#050b18]">Flyers / Billboard</option>
                  </select>
                </div>

                {/* Consent & Submit */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-display font-bold text-sm tracking-wider bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 hover:from-cci-gold-500 hover:to-cci-gold-300 text-[#040814] flex items-center justify-center gap-2 shadow-lg shadow-cci-gold-600/10 hover:shadow-cci-gold-600/25 transition-all transform hover:-translate-y-0.5"
                  >
                    <Ticket className="h-4 w-4" />
                    <span>Complete Registration</span>
                  </button>
                </div>

              </form>
            </div>
          </motion.div>
        )}

        {/* Catalog and Countdown (Active Meetings Dashboard) */}
        {!selectedEvent && !activeTicket && (
          <motion.div
            key="meetings-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-16"
          >
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Upcoming Meetings & Conferences
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 mx-auto mb-5 rounded-full" />
              <p className="text-sm sm:text-base text-slate-300">
                Register for GEC meetings, lock in your official entrance passes, and join believers across the globe as we build deep scriptural clarity and experience spiritual outpouring.
              </p>
            </div>

            {/* Countdown Panel */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0c1635] to-[#040814] border border-emerald-500/20 rounded-3xl p-6 sm:p-10 shadow-xl" id="hero-countdown-panel">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    <span>Our next special meeting is...</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                    Edifice Conference 2026
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                    Register now for the premier spiritual gathering of the year. Build a rigorous scriptural foundation, clarify Christian doctrines, and build intense prayer capacity with Pastor Abiodun Adebayo and guest ministers.
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-300 font-semibold pt-2">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-cci-gold-500" />
                      October 1st - 4th, 2026
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-cci-gold-500" />
                      GEC Lekki HQ
                    </span>
                  </div>
                </div>

                {/* Countdown Timer Block */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
                  <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full">
                    {[
                      { label: 'Days', value: countdown.days },
                      { label: 'Hours', value: countdown.hours },
                      { label: 'Minutes', value: countdown.minutes },
                      { label: 'Seconds', value: countdown.seconds }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center bg-[#050b18] border border-cci-blue-700/40 rounded-2xl py-3 px-2 sm:py-4">
                        <span className="text-2xl sm:text-3xl font-mono font-bold text-cci-gold-400">
                          {String(item.value).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1.5">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {userRegistrations.some(r => r.eventId === 'edifice-conference-2026') ? (
                    <button
                      onClick={() => {
                        const pass = userRegistrations.find(r => r.eventId === 'edifice-conference-2026');
                        if (pass) setActiveTicket(pass);
                      }}
                      className="w-full py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-2 transition-all"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>View My Active Pass</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const edificeEvent = upcomingMeetings.find(e => e.id === 'edifice-conference-2026');
                        if (edificeEvent) setSelectedEvent(edificeEvent);
                      }}
                      className="w-full py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 hover:from-cci-gold-500 hover:to-cci-gold-300 text-[#040814] flex items-center justify-center gap-2 shadow-lg shadow-cci-gold-600/10 transition-all transform hover:-translate-y-0.5"
                    >
                      <Ticket className="h-4 w-4" />
                      <span>Register to Attend</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Upcoming Events Catalog List */}
            <div className="space-y-6">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                Event Calendar
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {upcomingMeetings.map((event) => {
                  const isRegistered = userRegistrations.some(r => r.eventId === event.id);
                  const regDetails = userRegistrations.find(r => r.eventId === event.id);

                  return (
                    <div
                      key={event.id}
                      className="flex flex-col bg-gradient-to-b from-[#0a1128] to-[#040814] border border-cci-blue-700/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-cci-gold-600/5 hover:border-cci-blue-700/80 transition-all duration-300 group"
                    >
                      {/* Banner Image */}
                      <div className="h-48 overflow-hidden relative">
                        <img
                          src={event.banner}
                          alt={event.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#040814] via-[#040814]/40 to-transparent" />
                      </div>

                      {/* Card Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-display text-lg sm:text-xl font-bold text-white leading-snug">
                            {event.title}
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                            {event.description}
                          </p>
                        </div>

                        {/* Speaker & Meta info */}
                        <div className="pt-2 border-t border-cci-blue-700/20 space-y-2.5 text-xs text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-cci-gold-500 shrink-0" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-cci-gold-500 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2">
                          {event.id === 'edifice-conference-2026' ? (
                            isRegistered && regDetails ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setActiveTicket(regDetails)}
                                  className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <Ticket className="h-4 w-4" />
                                  <span>My Pass / Pass Code</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  document.getElementById('hero-countdown-panel')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all bg-gradient-to-r from-cci-gold-600/10 to-cci-gold-400/10 border border-cci-gold-500/40 hover:border-cci-gold-500 text-cci-gold-400 hover:bg-gradient-to-r hover:from-cci-gold-600 hover:to-cci-gold-400 hover:text-[#040814] transform hover:-translate-y-0.5"
                              >
                                <span>Learn More</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            )
                          ) : (
                            <button
                              disabled
                              className="w-full py-3 bg-slate-800/50 border border-slate-700/20 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed"
                            >
                              <span>Registration Opens Later</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* My Active Passes Summary */}
            {userRegistrations.length > 0 && (
              <div className="pt-4 border-t border-cci-blue-700/20 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                    My Active Registration Passes ({userRegistrations.length})
                  </h3>
                  {onClearRegistrations && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear your entire registration history? This will delete all active passes.')) {
                          onClearRegistrations();
                        }
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10 transition-colors self-start sm:self-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear Registration History</span>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userRegistrations.map((pass) => (
                    <button
                      key={pass.id}
                      onClick={() => setActiveTicket(pass)}
                      className="flex items-center justify-between p-4 bg-[#0a1128] border border-cci-blue-700/50 hover:border-cci-gold-500 rounded-2xl shadow-md transition-all group text-left"
                    >
                      <div className="space-y-1 pr-4 truncate">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-cci-gold-500 font-semibold">
                          {pass.ticketCode}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-cci-gold-400 transition-colors">
                          {pass.eventTitle}
                        </h4>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {pass.userName} • {pass.userBranch}
                        </span>
                      </div>
                      <div className="bg-cci-gold-500/10 group-hover:bg-cci-gold-500/20 text-cci-gold-400 p-2.5 rounded-xl transition-colors shrink-0">
                        <Ticket className="h-4 w-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
