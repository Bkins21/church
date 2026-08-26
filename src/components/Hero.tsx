import { useState, useEffect } from 'react';
import { Calendar, Music, MapPin, ArrowRight, Clock, BookOpen, Volume2, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Registration } from '../types';
import choirHeroBg from '../assets/images/gec_worship_choir_bg_1786828117713.jpg';
import congregationHeroBg from '../assets/images/gec_hero_worship_bg_1786827665903.jpg';
import { supabase, isSupabaseConfigured } from '../supabase';

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

  // Calculate dynamic countdown to Edifice Conference (October 28th, 2026, 9:00 AM)
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const targetDate = new Date('2026-10-28T09:00:00');
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
        className="relative w-full min-h-[calc(100svh-135px)] md:min-h-[calc(100svh-120px)] flex items-center justify-center overflow-hidden"
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
                className="w-full h-full object-cover object-center filter brightness-60 contrast-110 will-change-transform"
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

          {/* Full Edge-to-Edge Cinematic Gradient Overlays for Supreme Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141416]/95 via-[#141416]/65 to-[#141416]/40 z-[2]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#141416_85%)] opacity-80 z-[2]" />
        </div>

        {/* Heading & Action Content Overlay - Centered Responsive Container */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
          
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-cinzel text-3xl sm:text-5xl md:text-6xl lg:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-2xl"
          >
            Belong. Build. Become.
          </motion.h1>

          {/* Welcome Home with smooth staggered expanding and collapsing motion from center */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full flex items-center justify-center overflow-visible py-2"
          >
            <div className="relative flex items-center justify-center w-full max-w-4xl px-2 sm:px-4">
              {/* Left spreading gold accent ray */}
              <motion.span
                animate={{
                  scaleX: [0.2, 1, 0.2],
                  opacity: [0.2, 0.85, 0.2],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="hidden sm:block h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#E6C35C]/60 to-[#E6C35C] origin-right mr-3 sm:mr-6"
              />

              {/* Staggered outward expanding & collapsing container */}
              <div className="flex items-center justify-center select-none">
                {/* WELCOME - Letters expanding left from center with outward stagger */}
                <div className="inline-flex items-center">
                  {['W', 'E', 'L', 'C', 'O', 'M', 'E'].map((char, idx) => {
                    const distFromCenter = 6 - idx + 1;
                    const targetX = -distFromCenter * 5.2;
                    const staggerDelay = (6 - idx) * 0.07;

                    return (
                      <motion.span
                        key={`welcome-${idx}`}
                        animate={{
                          x: [0, targetX, 0],
                          opacity: [0.8, 1, 0.8],
                          scale: [1, 1.06, 1],
                        }}
                        transition={{
                          duration: 4.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: staggerDelay,
                        }}
                        className="text-xs sm:text-sm md:text-base lg:text-lg font-sans font-medium text-white/95 uppercase drop-shadow-xl inline-block tracking-[0.2em] sm:tracking-[0.3em]"
                      >
                        {char}
                      </motion.span>
                    );
                  })}
                </div>

                {/* Expanding & contracting center gap between Welcome and Home */}
                <motion.span
                  animate={{
                    width: ["0.6rem", "2.2rem", "0.6rem"],
                  }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-block"
                />

                {/* HOME - Letters expanding right from center with outward stagger */}
                <div className="inline-flex items-center">
                  {['H', 'O', 'M', 'E'].map((char, idx) => {
                    const distFromCenter = idx + 1;
                    const targetX = distFromCenter * 8.5;
                    const staggerDelay = idx * 0.07;

                    return (
                      <motion.span
                        key={`home-${idx}`}
                        animate={{
                          x: [0, targetX, 0],
                          opacity: [0.8, 1, 0.8],
                          scale: [1, 1.06, 1],
                        }}
                        transition={{
                          duration: 4.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: staggerDelay,
                        }}
                        className="text-xs sm:text-sm md:text-base lg:text-lg font-sans font-medium text-white/95 uppercase drop-shadow-xl inline-block tracking-[0.2em] sm:tracking-[0.3em]"
                      >
                        {char}
                      </motion.span>
                    );
                  })}
                </div>
              </div>

              {/* Right spreading gold accent ray */}
              <motion.span
                animate={{
                  scaleX: [0.2, 1, 0.2],
                  opacity: [0.2, 0.85, 0.2],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="hidden sm:block h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#E6C35C]/60 to-[#E6C35C] origin-left ml-3 sm:ml-6"
              />
            </div>
          </motion.div>

          {/* Primary Action Buttons (Warm Bronze & Editorial Translucent) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 pt-2 sm:pt-4"
          >
            <button
              onClick={() => onNavigate('meetings')}
              className="px-8 sm:px-10 py-4 rounded-2xl font-display font-bold text-sm sm:text-base tracking-wide bg-[#A36B3B] hover:bg-[#8D5A30] text-white flex items-center justify-center gap-2.5 shadow-xl shadow-[#A36B3B]/30 hover:shadow-[#A36B3B]/45 transition-all cursor-pointer transform hover:-translate-y-0.5"
              id="hero-btn-meetings"
            >
              <Calendar className="h-5 w-5" />
              <span>Register for Meetings</span>
            </button>

            <button
              onClick={() => onNavigate('teachings')}
              className="px-8 sm:px-10 py-4 rounded-2xl font-display font-bold text-sm sm:text-base tracking-wide bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 hover:border-white text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer transform hover:-translate-y-0.5 shadow-lg"
              id="hero-btn-teachings"
            >
              <Music className="h-5 w-5 text-[#EFEAE1]" />
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
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 text-[#A36B3B] text-xs font-mono font-bold uppercase tracking-wider">
                  <span>Next Flagship Gathering</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#141416]">
                  Edifice Conference 2026
                </h3>
                <p className="text-xs sm:text-sm text-[#54575E]">
                  October 28th – November 1st, 2026 
                </p>
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
