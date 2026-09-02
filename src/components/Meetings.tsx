import { useState, useEffect, FormEvent } from 'react';
import { Calendar, MapPin, Clock, User, Mail, Phone, Ticket, QrCode, Printer, ChevronLeft, CheckCircle2, Trash2, ArrowRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { Registration, ChurchEvent } from '../types';
import { upcomingMeetings, EDIFICE_CONFERENCE_2026_IMAGE } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface MeetingsProps {
  onRegisterSuccess: (registration: Registration) => Promise<void> | void;
  userRegistrations: Registration[];
  prefilledReg: { firstName: string; surname: string; email: string; eventId: string } | null;
  onClearPrefilled: () => void;
  onRemoveRegistration?: (id: string) => void;
  onClearRegistrations?: () => void;
}

export default function Meetings({
  onRegisterSuccess,
  userRegistrations,
  prefilledReg,
  onClearPrefilled,
  onRemoveRegistration,
  onClearRegistrations
}: MeetingsProps) {
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [activeTicket, setActiveTicket] = useState<Registration | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('GEC Onikolobo');
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

  // Specified GEC Branches list
  const branches = [
    'GEC Onikolobo',
    'GEC Yaba',
    'GEC Magboro',
    'GEC FUNAAB',
    'GEC Itori'
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
    const targetDate = new Date('2026-10-28T09:00:00').getTime();

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (!validateForm()) {
      const firstError = document.querySelector('.text-red-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    const ticketCode = `GEC-${selectedEvent.id.substring(0, 4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const registration: Registration = {
      id: `reg-${Date.now()}`,
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      eventDate: selectedEvent.date,
      eventLocation: selectedEvent.location,
      userName: `${firstName.trim()} ${surname.trim()}`,
      firstName: firstName.trim(),
      surname: surname.trim(),
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

    try {
      await onRegisterSuccess(registration);
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
      setSubmitError('');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setSubmitError(err.message || 'Database registration failed. Please ensure the Supabase database tables are created.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full bg-[#F5EFEB] text-[#3A2312] py-12 transition-colors duration-300" id="meetings-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          
          {/* Ticket Detail / Active Ticket View (Beige Base, Dark Brown & Bronze Accents) */}
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
                  className="flex items-center gap-2 text-[#6B5441] hover:text-[#3A2312] font-medium transition-colors py-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Meetings</span>
                </button>
                <div className="flex items-center gap-2">
                  {onRemoveRegistration && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel and delete this registration information?')) {
                          onRemoveRegistration(activeTicket.id);
                          setActiveTicket(null);
                        }
                      }}
                      className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Pass</span>
                    </button>
                  )}
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-[#3A2312] hover:bg-[#25160B] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-colors"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Pass</span>
                  </button>
                </div>
              </div>

              {/* Skeuomorphic Boarding Pass / Ticket (Beige Base + Dark Brown Banner) */}
              <div className="bg-[#FAF7F2] border-2 border-[#E1D6C7] rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Top Banner Dark Brown & Bronze Accent */}
                <div className="h-3 bg-gradient-to-r from-[#3A2312] via-[#A37F3B] to-[#3A2312]" />
                
                {/* Ticket Body */}
                <div className="p-8">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#E1D6C7] pb-6 mb-6 gap-4">
                    <div>
                      <span className="text-xs font-mono tracking-wider text-[#A37F3B] uppercase font-bold">
                        Official Attendance Pass
                      </span>
                      <h3 className="text-xl sm:text-2xl font-display font-black text-[#3A2312] tracking-tight mt-1">
                        {activeTicket.eventTitle}
                      </h3>
                    </div>
                    <div className="bg-[#A37F3B]/15 border border-[#A37F3B]/30 text-[#3A2312] rounded-full px-4 py-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#A37F3B]" />
                      <span>Registered ({activeTicket.mode})</span>
                    </div>
                  </div>

                  {/* Grid Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-mono text-[#8A7463] uppercase tracking-wider block">Attendee Name</span>
                        <span className="text-base font-bold text-[#3A2312] block">{activeTicket.userName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#8A7463] uppercase tracking-wider block">Email Address</span>
                        <span className="text-sm text-[#5A4535] block truncate">{activeTicket.userEmail}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#8A7463] uppercase tracking-wider block">Phone Number</span>
                        <span className="text-sm text-[#5A4535] block">{activeTicket.userPhone || 'Not Provided'}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-mono text-[#8A7463] uppercase tracking-wider block">Registering From</span>
                        <span className="text-sm text-[#A37F3B] block font-bold">{activeTicket.userBranch}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#8A7463] uppercase tracking-wider block">Event Date</span>
                        <span className="text-sm text-[#5A4535] block">{activeTicket.eventDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#8A7463] uppercase tracking-wider block">Location / Venue</span>
                        <span className="text-sm text-[#5A4535] block line-clamp-2">{activeTicket.eventLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Perforation Divider Line */}
                  <div className="relative my-8 border-t-2 border-dashed border-[#D5C9B7]">
                    <div className="absolute -left-11 -top-3 w-6 h-6 bg-[#F5EFEB] rounded-full border-r-2 border-[#E1D6C7]" />
                    <div className="absolute -right-11 -top-3 w-6 h-6 bg-[#F5EFEB] rounded-full border-l-2 border-[#E1D6C7]" />
                  </div>

                  {/* QR Code and Code Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] font-mono text-[#8A7463] uppercase tracking-wider block">Unique Ticket ID</span>
                      <span className="text-xl font-mono font-bold text-[#3A2312] tracking-widest block mt-1">
                        {activeTicket.ticketCode}
                      </span>
                      <span className="text-[11px] text-[#8A7463] mt-1 block">Registered on: {activeTicket.registrationDate}</span>
                    </div>
                    
                    {/* QR Code */}
                    <div className="p-3 bg-white border border-[#E1D6C7] rounded-2xl shrink-0 flex items-center justify-center relative shadow-sm">
                      <QrCode className="h-28 w-28 text-[#3A2312]" />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#E1D6C7] text-center no-print">
                    <p className="text-xs text-[#8A7463] max-w-md mx-auto">
                      Please present this digital pass or a printed copy at the reception desk for verification.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Registration Form View (Beige Base, Dark Brown & Bronze Accents) */}
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
                className="flex items-center gap-2 text-[#6B5441] hover:text-[#3A2312] font-medium transition-colors mb-6 py-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Meetings</span>
              </button>

              <div className="bg-[#FAF7F2] border-2 border-[#E1D6C7] rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
                {/* Decorative bronze accent blur */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#A37F3B]/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* Event Flyer Banner Preview */}
                {selectedEvent.banner && (
                  <div className="w-full h-44 sm:h-64 rounded-2xl overflow-hidden mb-6 border border-[#E1D6C7] relative bg-black/10 shadow-sm">
                    <img 
                      src={selectedEvent.banner} 
                      alt={selectedEvent.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#25160B]/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-[#25160B]/90 px-2.5 py-1 rounded-md border border-white/20">
                        {selectedEvent.date}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mb-8 border-b border-[#E1D6C7] pb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#A37F3B]/15 border border-[#A37F3B]/30 text-[#3A2312] rounded-full text-[11px] font-mono uppercase font-bold tracking-wider mb-2">
                    <Sparkles className="h-3 w-3 text-[#A37F3B]" />
                    <span>Conference Registration Form</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-display font-black text-[#3A2312] tracking-tight">
                    {selectedEvent.title}
                  </h3>
                  <div className="flex flex-wrap gap-y-2 gap-x-5 mt-4 text-xs text-[#5A4535] font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#A37F3B]" />
                      {selectedEvent.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#A37F3B]" />
                      {selectedEvent.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#A37F3B] shrink-0" />
                      {selectedEvent.location}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Name section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-[#3A2312] uppercase tracking-wider mb-2 font-bold">
                        First Name <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 h-4 w-4 text-[#8A7463]" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full bg-white border border-[#D5C9B7] focus:border-[#A37F3B] focus:ring-1 focus:ring-[#A37F3B] rounded-xl py-3 pl-11 pr-4 text-sm text-[#3A2312] placeholder-[#8A7463]/60 focus:outline-none transition-colors shadow-sm"
                        />
                      </div>
                      {errors.firstName && <span className="text-red-600 text-xs mt-1 block font-mono font-medium">{errors.firstName}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#3A2312] uppercase tracking-wider mb-2 font-bold">
                        Surname / Last Name <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 h-4 w-4 text-[#8A7463]" />
                        <input
                          type="text"
                          value={surname}
                          onChange={(e) => setSurname(e.target.value)}
                          placeholder="Doe"
                          className="w-full bg-white border border-[#D5C9B7] focus:border-[#A37F3B] focus:ring-1 focus:ring-[#A37F3B] rounded-xl py-3 pl-11 pr-4 text-sm text-[#3A2312] placeholder-[#8A7463]/60 focus:outline-none transition-colors shadow-sm"
                        />
                      </div>
                      {errors.surname && <span className="text-red-600 text-xs mt-1 block font-mono font-medium">{errors.surname}</span>}
                    </div>
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-[#3A2312] uppercase tracking-wider mb-2 font-bold">
                        Email Address <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 h-4 w-4 text-[#8A7463]" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john.doe@example.com"
                          className="w-full bg-white border border-[#D5C9B7] focus:border-[#A37F3B] focus:ring-1 focus:ring-[#A37F3B] rounded-xl py-3 pl-11 pr-4 text-sm text-[#3A2312] placeholder-[#8A7463]/60 focus:outline-none transition-colors shadow-sm"
                        />
                      </div>
                      {errors.email && <span className="text-red-600 text-xs mt-1 block font-mono font-medium">{errors.email}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#3A2312] uppercase tracking-wider mb-2 font-bold">
                        Phone Number <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 h-4 w-4 text-[#8A7463]" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+234 ..."
                          className="w-full bg-white border border-[#D5C9B7] focus:border-[#A37F3B] focus:ring-1 focus:ring-[#A37F3B] rounded-xl py-3 pl-11 pr-4 text-sm text-[#3A2312] placeholder-[#8A7463]/60 focus:outline-none transition-colors shadow-sm"
                        />
                      </div>
                      {errors.phone && <span className="text-red-600 text-xs mt-1 block font-mono font-medium">{errors.phone}</span>}
                    </div>
                  </div>

                  {/* Branch selector: Which of our branches are you registering from */}
                  <div>
                    <label className="block text-xs font-mono text-[#3A2312] uppercase tracking-wider mb-2 font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-[#A37F3B]" />
                        <span>Which of our branches are you registering from?</span> <span className="text-red-600">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-white border border-[#D5C9B7] focus:border-[#A37F3B] focus:ring-1 focus:ring-[#A37F3B] rounded-xl py-3.5 px-4 text-sm text-[#3A2312] font-medium focus:outline-none transition-colors shadow-sm appearance-none cursor-pointer"
                      >
                        {branches.map((b) => (
                          <option key={b} value={b} className="bg-white text-[#3A2312] py-1">{b}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#A37F3B] font-bold text-xs">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Residential Address - Required if physical */}
                  <div>
                    <label className="block text-xs font-mono text-[#3A2312] uppercase tracking-wider mb-2 font-bold">
                      Residential Address {mode === 'physical' && <span className="text-red-600">*</span>}
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Provide your city or full residential address..."
                      rows={2}
                      className="w-full bg-white border border-[#D5C9B7] focus:border-[#A37F3B] focus:ring-1 focus:ring-[#A37F3B] rounded-xl py-3 px-4 text-sm text-[#3A2312] placeholder-[#8A7463]/60 focus:outline-none transition-colors resize-none shadow-sm"
                    />
                    {errors.address && <span className="text-red-600 text-xs mt-1 block font-mono font-medium">{errors.address}</span>}
                  </div>

                  {/* Demographics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-[#3A2312] uppercase tracking-wider mb-2 font-bold">
                        Age Range
                      </label>
                      <select
                        value={ageRange}
                        onChange={(e) => setAgeRange(e.target.value)}
                        className="w-full bg-white border border-[#D5C9B7] focus:border-[#A37F3B] focus:ring-1 focus:ring-[#A37F3B] rounded-xl py-3 px-4 text-sm text-[#3A2312] focus:outline-none transition-colors shadow-sm cursor-pointer"
                      >
                        <option value="">Select Age range (Optional)</option>
                        <option value="Under 18">Under 18</option>
                        <option value="18 - 25">18 - 25 years</option>
                        <option value="26 - 35">26 - 35 years</option>
                        <option value="36 - 45">36 - 45 years</option>
                        <option value="46 and Above">46 and Above</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#3A2312] uppercase tracking-wider mb-2 font-bold">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-white border border-[#D5C9B7] focus:border-[#A37F3B] focus:ring-1 focus:ring-[#A37F3B] rounded-xl py-3 px-4 text-sm text-[#3A2312] focus:outline-none transition-colors shadow-sm cursor-pointer"
                      >
                        <option value="">Select Gender (Optional)</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  {/* expectations */}
                  <div>
                    <label className="block text-xs font-mono text-[#3A2312] uppercase tracking-wider mb-2 font-bold">
                      What are your expectations or prayer requests?
                    </label>
                    <textarea
                      value={expectations}
                      onChange={(e) => setExpectations(e.target.value)}
                      placeholder="Share what you are believing God for at this conference..."
                      rows={3}
                      className="w-full bg-white border border-[#D5C9B7] focus:border-[#A37F3B] focus:ring-1 focus:ring-[#A37F3B] rounded-xl py-3 px-4 text-sm text-[#3A2312] placeholder-[#8A7463]/60 focus:outline-none transition-colors resize-none shadow-sm"
                    />
                  </div>

                  {/* how heard */}
                  <div>
                    <label className="block text-xs font-mono text-[#3A2312] uppercase tracking-wider mb-2 font-bold">
                      How did you hear about this meeting?
                    </label>
                    <select
                      value={howHeard}
                      onChange={(e) => setHowHeard(e.target.value)}
                      className="w-full bg-white border border-[#D5C9B7] focus:border-[#A37F3B] focus:ring-1 focus:ring-[#A37F3B] rounded-xl py-3 px-4 text-sm text-[#3A2312] focus:outline-none transition-colors shadow-sm cursor-pointer"
                    >
                      <option value="">Select Option (Optional)</option>
                      <option value="Church Service Announcement">Church Service Announcement</option>
                      <option value="Friend or Family Member">Friend or Family Member</option>
                      <option value="Social Media (X, Facebook, Instagram)">Social Media (X, Facebook, Instagram)</option>
                      <option value="WhatsApp Status / Group">WhatsApp Status / Group</option>
                      <option value="Mixlr / Audio stream">Mixlr / Audio stream</option>
                      <option value="Flyers / Billboard">Flyers / Billboard</option>
                    </select>
                  </div>

                  {/* Submit Error Banner */}
                  {submitError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-mono space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-red-800">
                        <span>Database Registration Error</span>
                      </div>
                      <p>{submitError}</p>
                      <p className="text-[11px] text-red-600">
                        Please verify that the Supabase database tables are initialized using the SQL script in Admin Setup.
                      </p>
                    </div>
                  )}

                  {/* Submit Button (Dark Brown Theme) */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl font-display font-bold text-sm tracking-wider bg-[#3A2312] hover:bg-[#25160B] disabled:opacity-60 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 shadow-lg shadow-[#3A2312]/25 transition-all transform hover:-translate-y-0.5"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving registration...</span>
                        </>
                      ) : (
                        <>
                          <Ticket className="h-4 w-4 text-white" />
                          <span>Complete Registration</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          )}

          {/* Catalog and Countdown (Beige & Dark Brown Theme + Sage Green Edifice Conference) */}
          {!selectedEvent && !activeTicket && (
            <motion.div
              key="meetings-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              {/* Themed Header: Dark Brown & Warm Bronze */}
              <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
                <h2 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-[#3A2312]">
                  Upcoming Meetings & Conferences
                </h2>
                <div className="w-16 h-1 bg-[#A37F3B] mx-auto rounded-full shadow-sm" />
                <p className="text-sm sm:text-base text-[#6B5441] leading-relaxed">
                  Register for our meetings, and join believers across our branches to get edified and trained for the ministry of our Lord Jesus
                </p>
              </div>

              {/* Countdown Panel with Rich Grass Green Gradient for Edifice Conference */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#2D6A4F] via-[#1E5138] to-[#0D2818] border-2 border-[#4E9F5A]/40 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl text-white" id="hero-countdown-panel">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#52B788]/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/20 shrink-0 shadow-lg bg-[#0D2818]/60">
                        <img 
                          src={EDIFICE_CONFERENCE_2026_IMAGE}
                          alt="Edifice Conference 2026 Flyer"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <div className="inline-flex items-center px-3 py-0.5 bg-[#0D2818]/80 text-[#D8F3DC] border border-[#4E9F5A]/40 rounded-full text-[10px] sm:text-[11px] font-mono uppercase font-bold tracking-wider shadow-sm">
                          <span>Our next special meeting is...</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-cinzel font-black text-white tracking-tight">
                          Edifice Conference 2026
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-[#E8F5E9] leading-relaxed max-w-xl">
                      Join us for another time of refreshing as we get edified in prayers, teachings and apologias of God's word and the move of the Holy Ghost.
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white font-semibold pt-2">
                      <span className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-[#B7E4C7]" />
                        October 30th - November 1st, 2026
                      </span>
                      <span className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg">
                        <MapPin className="h-3.5 w-3.5 text-[#B7E4C7]" />
                       Peter Akinola Foundation, Abeokuta.
                      </span>
                    </div>
                  </div>

                  {/* Countdown Timer Block (Grass Green Container with Crisp White & Mint Digits) */}
                  <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
                    <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full">
                      {[
                        { label: 'Days', value: countdown.days },
                        { label: 'Hours', value: countdown.hours },
                        { label: 'Minutes', value: countdown.minutes },
                        { label: 'Seconds', value: countdown.seconds }
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center bg-[#0D2818]/85 border border-[#2D6A4F]/70 rounded-2xl py-3 px-2 sm:py-4 shadow-md">
                          <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                            {String(item.value).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] font-mono text-[#B7E4C7] uppercase font-bold tracking-wider mt-1.5">
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
                        className="w-full py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-[#F7F5F0] hover:bg-white text-[#0D2818] flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        <ShieldCheck className="h-4 w-4 text-[#2D6A4F]" />
                        <span>View My Active Pass</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const edificeEvent = upcomingMeetings.find(e => e.id === 'edifice-conference-2026');
                          if (edificeEvent) setSelectedEvent(edificeEvent);
                        }}
                        className="w-full py-3.5 rounded-xl font-display font-black text-xs uppercase tracking-wider bg-[#F7F5F0] hover:bg-white text-[#0D2818] flex items-center justify-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5"
                      >
                        <Ticket className="h-4 w-4 text-[#2D6A4F]" />
                        <span>Register to Attend</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Upcoming Events Catalog List (Beige Cards, Dark Brown Accents, White) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#E1D6C7] pb-4">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#3A2312] tracking-tight flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#A37F3B]" />
                    <span>Event Calendar</span>
                  </h3>
                  <span className="text-xs font-mono text-[#8A7463]">All GEC Branches</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {upcomingMeetings.map((event) => {
                    const isRegistered = userRegistrations.some(r => r.eventId === event.id);
                    const regDetails = userRegistrations.find(r => r.eventId === event.id);

                    return (
                      <div
                        key={event.id}
                        className="flex flex-col bg-[#FAF7F2] border-2 border-[#E1D6C7] hover:border-[#A37F3B]/60 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
                      >
                        {/* Banner Image */}
                        <div className="h-48 overflow-hidden relative">
                          <img
                            src={event.banner}
                            alt={event.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#25160B]/80 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-4 right-4">
                            <span className="inline-block bg-[#25160B]/90 text-[#F7F5F0] text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                              {event.date}
                            </span>
                          </div>
                        </div>

                        {/* Card Content (Beige interior, Dark Brown Titles & CTAs) */}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-display text-lg sm:text-xl font-bold text-[#3A2312] leading-snug group-hover:text-[#A37F3B] transition-colors">
                              {event.title}
                            </h4>
                            <p className="text-xs text-[#6B5441] leading-relaxed line-clamp-3">
                              {event.description}
                            </p>
                          </div>

                          {/* Speaker & Meta info */}
                          <div className="pt-2 border-t border-[#E1D6C7] space-y-2 text-xs text-[#6B5441]">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-[#A37F3B] shrink-0" />
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
                                    className="flex-1 py-3 bg-[#A37F3B]/15 hover:bg-[#A37F3B]/25 border border-[#A37F3B]/30 text-[#3A2312] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                                  >
                                    <Ticket className="h-4 w-4 text-[#A37F3B]" />
                                    <span>My Pass / Code</span>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedEvent(event);
                                  }}
                                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all bg-[#3A2312] hover:bg-[#25160B] text-white shadow-md transform hover:-translate-y-0.5"
                                >
                                  <span>Register to Attend</span>
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                              )
                            ) : (
                              <button
                                disabled
                                className="w-full py-3 bg-[#EAE2D5] border border-[#D5C9B7] text-[#8A7463] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed"
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

              {/* My Active Passes Summary (Beige Cards, Bronze & Dark Brown Accents) */}
              {userRegistrations.length > 0 && (
                <div className="pt-8 border-t border-[#E1D6C7] space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#3A2312] tracking-tight flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-[#A37F3B]" />
                      <span>My Active Registration Passes ({userRegistrations.length})</span>
                    </h3>
                    {onClearRegistrations && (
                      <button
                        onClick={() => {
                          if (showClearConfirm) {
                            onClearRegistrations();
                            setShowClearConfirm(false);
                          } else {
                            setShowClearConfirm(true);
                          }
                        }}
                        onMouseLeave={() => setShowClearConfirm(false)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-800 border border-rose-500/30 hover:border-rose-500/50 bg-rose-500/10 transition-colors self-start sm:self-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{showClearConfirm ? 'Are you sure? Click again' : 'Clear Registration History'}</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userRegistrations.map((pass) => (
                      <button
                        key={pass.id}
                        onClick={() => setActiveTicket(pass)}
                        className="flex items-center justify-between p-4 bg-[#FAF7F2] border-2 border-[#E1D6C7] hover:border-[#A37F3B] rounded-2xl shadow-sm hover:shadow-md transition-all group text-left"
                      >
                        <div className="space-y-1 pr-4 truncate">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-[#A37F3B] font-black">
                            {pass.ticketCode}
                          </span>
                          <h4 className="text-sm font-bold text-[#3A2312] truncate group-hover:text-[#A37F3B] transition-colors">
                            {pass.eventTitle}
                          </h4>
                          <span className="text-[11px] text-[#8A7463] block truncate">
                            {pass.userName} • {pass.userBranch}
                          </span>
                        </div>
                        <div className="bg-[#A37F3B]/15 group-hover:bg-[#A37F3B] text-[#A37F3B] group-hover:text-white p-2.5 rounded-xl transition-colors shrink-0">
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
    </div>
  );
}

