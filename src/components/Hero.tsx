import { useState, useEffect } from 'react';
import { Calendar, Music, MapPin, ArrowRight, Clock, BookOpen, Volume2, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Registration } from '../types';
import choirHeroBg from '../assets/images/gec_worship_choir_bg_1786828117713.jpg';
import congregationHeroBg from '../assets/images/gec_hero_worship_bg_1786827665903.jpg';
import { supabase, isSupabaseConfigured } from '../supabase';
import { EDIFICE_CONFERENCE_2026_IMAGE } from '../data';

interface HeroProps {
  onNavigate: (tab: string) => void;
  userRegistrations?: Registration[];
  onStartRegistration?: (firstName: string, surname: string, email: string) => void;
}

interface HeroBackground {
  src: string;
  alt: string;
}

const FALLBACK_BACKGROUNDS: HeroBackground[] = [
  {
    src: choirHeroBg,
    alt: "God's Edifice Church Choir & Crossworship Ministration",
  },
  {
    src: congregationHeroBg,
    alt: "God's Edifice Church Congregation Worship Atmosphere",
  }
];

function formatAltText(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const cleaned = nameWithoutExt
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const capitalized = cleaned
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  
  if (capitalized.toLowerCase().includes("god's edifice") || capitalized.toLowerCase().includes("gec")) {
    return capitalized;
  }
  return `God's Edifice Church ${capitalized}`;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [heroBackgrounds, setHeroBackgrounds] = useState<HeroBackground[]>(FALLBACK_BACKGROUNDS);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Fetch dynamic hero images from Supabase Storage bucket "hero-images"
  useEffect(() => {
    let isMounted = true;

    const fetchHeroImages = async () => {
      if (!isSupabaseConfigured || !supabase) return;

      try {
        const { data, error } = await supabase.storage
          .from('hero-images')
          .list('', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
          });

        if (error) {
          console.warn('Could not load hero images from Supabase:', error);
          return;
        }

        if (!data || data.length === 0) return;

        const validImageRegex = /\.(jpe?g|png|webp)$/i;
        const validFiles = data
          .filter((item: any) => item.name && validImageRegex.test(item.name))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));

        if (validFiles.length === 0) return;

        const dynamicBackgrounds: HeroBackground[] = validFiles.map((file: any) => {
          const { data: urlData } = supabase.storage
            .from('hero-images')
            .getPublicUrl(file.name);

          return {
            src: urlData.publicUrl,
            alt: formatAltText(file.name),
          };
        });

        if (isMounted && dynamicBackgrounds.length > 0) {
          setHeroBackgrounds(dynamicBackgrounds);
          setCurrentBgIndex(0);
        }
      } catch (err) {
        console.warn('Could not load hero images from Supabase:', err);
      }
    };

    fetchHeroImages();

    return () => {
      isMounted = false;
    };
  }, []);

  // Rotate between worship atmosphere pictures smoothly every 7.5 seconds
  useEffect(() => {
    if (heroBackgrounds.length <= 1) return;

    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 7500);

    return () => clearInterval(bgInterval);
  }, [heroBackgrounds.length]);

  // Calculate dynamic countdown to Edifice Conference (October 30th, 2026, 5:00 PM)
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const targetDate = new Date('2026-10-30T17:00:00');
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const corePillars = [
    {
      id: 'about',
      icon: Users,
      title: 'Who are we?',
      description: 'Discover our vision, mission, and spiritual mandate as God\'s Edifice Church',
      cta: 'Learn About Us',
      cardBg: 'bg-gradient-to-br from-[#8E1B24] via-[#78141B] to-[#4F0D13] text-white',
      cardBorder: 'border-[#A3232C] hover:border-[#FECDD3]',
      cardShadow: 'hover:shadow-2xl hover:shadow-[#78141B]/40',
      iconBg: 'bg-white/15 text-[#FFE4E6] border border-white/25',
      titleColor: 'text-white group-hover:text-[#FFE4E6]',
      descColor: 'text-[#FFE4E6]/90 font-medium',
      ctaColor: 'text-white group-hover:text-[#FFE4E6]',
      badge: 'About Ministry',
      badgeColor: 'bg-white/15 text-[#FFE4E6] border-white/25',
      borderTop: 'border-white/20',
    },
    {
      id: 'teachings',
      icon: Volume2,
      title: 'Get edified here',
      description: 'Listen to, Read and Download our teachings, songs and publications as we trust God for your edification through them',
      cta: 'Explore Resources',
      cardBg: 'bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#92400E] text-stone-950',
      cardBorder: 'border-[#FBBF24] hover:border-[#FEF08A]',
      cardShadow: 'hover:shadow-2xl hover:shadow-[#D97706]/40',
      iconBg: 'bg-stone-950/15 text-stone-950 border border-stone-950/25',
      titleColor: 'text-stone-950 group-hover:text-black font-extrabold',
      descColor: 'text-stone-900 font-semibold',
      ctaColor: 'text-stone-950 group-hover:text-black font-black',
      badge: 'Media & Doctrine',
      badgeColor: 'bg-stone-950/15 text-stone-950 border-stone-950/25 font-bold',
      borderTop: 'border-stone-950/20',
    },
    {
      id: 'branches',
      icon: MapPin,
      title: 'Worship with us',
      description: 'Find the nearest assembly near you in Onikolobo, Yaba, Magboro, FUNAAB, or Itori.',
      cta: 'Find a Branch',
      cardBg: 'bg-gradient-to-br from-[#166534] via-[#0D4428] to-[#052E16] text-white',
      cardBorder: 'border-[#15803D] hover:border-[#86EFAC]',
      cardShadow: 'hover:shadow-2xl hover:shadow-[#0D4428]/40',
      iconBg: 'bg-white/15 text-[#A7F3D0] border border-white/25',
      titleColor: 'text-white group-hover:text-[#DCFCE7]',
      descColor: 'text-[#DCFCE7]/90 font-medium',
      ctaColor: 'text-white group-hover:text-[#DCFCE7]',
      badge: '5 Campuses',
      badgeColor: 'bg-white/15 text-[#DCFCE7] border-white/25',
      borderTop: 'border-white/20',
    },
  ];

  return (
    <div className="w-full bg-[#F7F5F0] text-[#141416] flex flex-col" id="gec-landing-page">
      
      {/* SECTION 1: Full-Bleed Grand Architectural Viewport Hero */}
      <section 
        className="relative w-full min-h-[100svh] sm:min-h-[calc(100svh-120px)] flex items-center justify-center overflow-hidden"
        id="hero-main-viewport"
      >
        {/* Dynamic Motion Background Image Layer with Ken Burns Effect - Spanning 100% full width and height */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
          <AnimatePresence mode="sync">
            <motion.div
              key={currentBgIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <motion.img
                src={(heroBackgrounds[currentBgIndex] || heroBackgrounds[0])?.src}
                alt={(heroBackgrounds[currentBgIndex] || heroBackgrounds[0])?.alt}
                referrerPolicy="no-referrer"
                initial={{ scale: 1.02, x: 0, y: 0 }}
                animate={{ 
                  scale: [1.02, 1.12, 1.06, 1.14, 1.02],
                  x: [0, -12, 10, -6, 0],
                  y: [0, -8, 6, -4, 0]
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  repeatType: "mirror",
                  ease: "easeInOut" 
                }}
                className="w-full h-full object-cover object-center filter brightness-70 contrast-105 will-change-transform"
              />
            </motion.div>
          </AnimatePresence>

          {/* Subtle Floating Atmospheric Stage Light Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  y: 100 + i * 40, 
                  x: `${15 + i * 14}%` 
                }}
                animate={{ 
                  opacity: [0.1, 0.45, 0.1], 
                  y: [-40, -120 - i * 30],
                  x: [`${15 + i * 14}%`, `${17 + i * 13}%`, `${14 + i * 15}%`]
                }}
                transition={{ 
                  duration: 9 + i * 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: i * 1.4 
                }}
                className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#E6C35C]/35 blur-[2px]"
              />
            ))}
          </div>

          {/* Tasteful Premium Gradient Overlays - Dark tone transitioning to warm gold tone */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141416]/95 via-[#141416]/60 to-[#141416]/40 z-[2]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#A36B3B]/25 via-transparent to-[#E6C35C]/15 mix-blend-screen pointer-events-none z-[2]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(20,20,22,0.25)_0%,_rgba(20,20,22,0.85)_100%)] pointer-events-none z-[2]" />
        </div>

        {/* Heading & Action Content Overlay - Centered Responsive Container */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
          
          {/* Main Title: Mobile Vertical Stack / Desktop Horizontal Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
            className="font-cinzel font-bold text-white tracking-tight drop-shadow-2xl"
          >
            {/* Mobile Vertical Stack */}
            <h1 className="flex sm:hidden flex-col items-center justify-center space-y-2 text-4xl sm:text-5xl leading-tight">
              <span>Belong.</span>
              <span>Build.</span>
              <span>Become.</span>
            </h1>
            {/* Desktop / Laptop Horizontal */}
            <h1 className="hidden sm:block text-5xl md:text-6xl lg:text-7xl leading-tight">
              Belong. Build. Become.
            </h1>
          </motion.div>

          {/* Welcome Home with elegant, smooth entrance animation and responsive gold line styling */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="w-full flex flex-col items-center justify-center overflow-visible"
          >
            {/* Desktop / Laptop: Golden lines beside WELCOME HOME */}
            <div className="hidden sm:flex items-center justify-center w-full max-w-2xl px-4">
              <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#E6C35C]/70 to-[#E6C35C] mr-4" />
              <span className="text-sm md:text-base lg:text-lg font-sans font-medium text-white/95 uppercase tracking-[0.3em] drop-shadow-xl select-none whitespace-nowrap">
                WELCOME HOME
              </span>
              <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#E6C35C]/70 to-[#E6C35C] ml-4" />
            </div>

            {/* Mobile: WELCOME HOME with golden decorative line BELOW it */}
            <div className="flex sm:hidden flex-col items-center justify-center space-y-2.5 select-none">
              <span className="text-xs font-sans font-medium text-white/95 uppercase tracking-[0.3em] drop-shadow-xl">
                WELCOME HOME
              </span>
              <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#E6C35C] to-transparent rounded-full shadow-sm shadow-[#E6C35C]/50" />
            </div>
          </motion.div>

          {/* Primary Action Buttons (Warm Bronze & Editorial Translucent) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 w-full sm:w-auto pt-3 sm:pt-4"
          >
            <button
              onClick={() => onNavigate('meetings')}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 rounded-2xl font-display font-bold text-sm sm:text-base tracking-wide bg-[#A36B3B] hover:bg-[#8D5A30] text-white flex items-center justify-center gap-2.5 shadow-xl shadow-[#A36B3B]/30 hover:shadow-[#A36B3B]/45 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              id="hero-btn-meetings"
            >
              <Calendar className="h-5 w-5 shrink-0" />
              <span>Register for Meetings</span>
            </button>

            <button
              onClick={() => onNavigate('teachings')}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 rounded-2xl font-display font-bold text-sm sm:text-base tracking-wide bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 hover:border-white text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg"
              id="hero-btn-teachings"
            >
              <Music className="h-5 w-5 text-[#EFEAE1] shrink-0" />
              <span>Listen to Teachings</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: Featured Upcoming Spotlight Gathering Section (Full-Width Strip) */}
      <section className="w-full bg-[#F7F5F0] py-12 sm:py-16 border-b border-[#E4DCD0]" id="spotlight-section">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl bg-white border border-[#E4DCD0] p-6 sm:p-8 shadow-xl shadow-stone-900/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#A36B3B]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#E4DCD0] shadow-md shrink-0 bg-[#F7F5F0]">
                  <img
                    src={EDIFICE_CONFERENCE_2026_IMAGE}
                    alt="Edifice Conference 2026"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#A36B3B]/10 text-[#A36B3B] text-[10px] font-mono font-bold uppercase tracking-wider">
                    <span>Next Flagship Gathering</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#141416] truncate">
                    Edifice Conference 2026
                  </h3>
                  <p className="text-xs sm:text-sm text-[#54575E]">
                    October 30th – November 1st, 2026 • Abeokuta
                  </p>
                </div>
              </div>

              {/* Countdown Grid */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 shrink-0">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Mins', value: timeLeft.minutes },
                  { label: 'Secs', value: timeLeft.seconds },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center bg-[#F7F5F0] border border-[#E4DCD0] rounded-xl px-3 py-2.5 min-w-[56px] sm:min-w-[64px]">
                    <span className="font-mono text-lg sm:text-xl font-bold text-[#A36B3B] leading-none">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-[#8A8E96] font-mono mt-1 font-semibold">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('meetings')}
                className="px-6 py-3 rounded-xl bg-[#A36B3B] hover:bg-[#8D5A30] text-white font-display font-bold text-xs uppercase tracking-wider shrink-0 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                id="hero-btn-spotlight-register"
              >
                <span>Attend</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: 3 Main Direct Gateways (Full-Width Responsive Section) */}
      <section className="w-full bg-gradient-to-b from-[#F7F5F0] via-[#F7F5F0] to-[#EFEAE1]/70 py-16 sm:py-24" id="pillars-section">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
            <h2 className="font-cinzel text-2xl sm:text-4xl font-bold tracking-tight text-[#141416]">
              Your Journey Starts Here
            </h2>
            <p className="text-sm sm:text-base text-[#54575E] leading-relaxed">
              Explore our family, immerse yourself in sound doctrine, or worship at an assembly near you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {corePillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: 0.12 * i, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate(pillar.id)}
                  className={`relative overflow-hidden border rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 group flex flex-col justify-between ${pillar.cardBg} ${pillar.cardBorder} ${pillar.cardShadow}`}
                  id={`landing-pillar-${pillar.id}`}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-2xl ${pillar.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase border ${pillar.badgeColor}`}>
                        {pillar.badge}
                      </span>
                    </div>

                    <h4 className={`font-cinzel font-bold text-xl sm:text-2xl mb-3 transition-colors ${pillar.titleColor}`}>
                      {pillar.title}
                    </h4>
                    <p className={`text-xs sm:text-sm leading-relaxed font-sans ${pillar.descColor}`}>
                      {pillar.description}
                    </p>
                  </div>

                  <div className={`relative z-10 mt-8 pt-4 border-t ${pillar.borderTop} flex items-center justify-between text-xs font-bold uppercase font-display tracking-wider transition-colors ${pillar.ctaColor}`}>
                    <span>{pillar.cta}</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
