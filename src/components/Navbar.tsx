import { useState, useEffect } from 'react';
import { Menu, X, BookOpen, MapPin, Calendar, Music, Disc, Users, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  registeredCount: number;
}

const navThemes: Record<string, {
  bg: string;
  bgScrolled: string;
  border: string;
  borderScrolled: string;
  logoColor: string;
  titleColor: string;
  inactiveText: string;
  hoverText: string;
  hoverBg: string;
  activeText: string;
  activeBg: string;
  indicator: string;
  badgeBg: string;
  badgeText: string;
  mobileMenuBg: string;
}> = {
  home: {
    bg: 'rgba(247, 245, 240, 0.90)',
    bgScrolled: '#f7f5f0fa',
    border: '#EFEAE1',
    borderScrolled: '#E4DCD0',
    logoColor: '#141416',
    titleColor: '#141416',
    inactiveText: '#54575E',
    hoverText: '#141416',
    hoverBg: 'rgba(239, 234, 225, 0.65)',
    activeText: '#A36B3B',
    activeBg: 'rgba(239, 234, 225, 0.95)',
    indicator: '#A36B3B',
    badgeBg: '#A36B3B',
    badgeText: '#FFFFFF',
    mobileMenuBg: '#F7F5F0',
  },
  about: {
   bg: 'rgba(247, 245, 240, 0.90)',
    bgScrolled: '#f7f5f0fa',
    border: '#EFEAE1',
    borderScrolled: '#E4DCD0',
    logoColor: '#141416',
    titleColor: '#141416',
    inactiveText: '#54575E',
    hoverText: '#141416',
    hoverBg: 'rgba(239, 234, 225, 0.65)',
    activeText: '#A36B3B',
    activeBg: 'rgba(239, 234, 225, 0.95)',
    indicator: '#A36B3B',
    badgeBg: '#A36B3B',
    badgeText: '#FFFFFF',
    mobileMenuBg: '#F7F5F0',
  },
  meetings: {
   bg: 'rgba(247, 245, 240, 0.90)',
    bgScrolled: '#f7f5f0fa',
    border: '#EFEAE1',
    borderScrolled: '#E4DCD0',
    logoColor: '#141416',
    titleColor: '#141416',
    inactiveText: '#54575E',
    hoverText: '#141416',
    hoverBg: 'rgba(239, 234, 225, 0.65)',
    activeText: '#A36B3B',
    activeBg: 'rgba(239, 234, 225, 0.95)',
    indicator: '#A36B3B',
    badgeBg: '#A36B3B',
    badgeText: '#FFFFFF',
    mobileMenuBg: '#F7F5F0',
  },
  teachings: {
  bg: 'rgba(247, 245, 240, 0.90)',
    bgScrolled: '#f7f5f0fa',
    border: '#EFEAE1',
    borderScrolled: '#E4DCD0',
    logoColor: '#141416',
    titleColor: '#141416',
    inactiveText: '#54575E',
    hoverText: '#141416',
    hoverBg: 'rgba(239, 234, 225, 0.65)',
    activeText: '#A36B3B',
    activeBg: 'rgba(239, 234, 225, 0.95)',
    indicator: '#A36B3B',
    badgeBg: '#A36B3B',
    badgeText: '#FFFFFF',
    mobileMenuBg: '#F7F5F0',
  },
  songs: {
bg: 'rgba(247, 245, 240, 0.90)',
    bgScrolled: '#f7f5f0fa',
    border: '#EFEAE1',
    borderScrolled: '#E4DCD0',
    logoColor: '#141416',
    titleColor: '#141416',
    inactiveText: '#54575E',
    hoverText: '#141416',
    hoverBg: 'rgba(239, 234, 225, 0.65)',
    activeText: '#A36B3B',
    activeBg: 'rgba(239, 234, 225, 0.95)',
    indicator: '#A36B3B',
    badgeBg: '#A36B3B',
    badgeText: '#FFFFFF',
    mobileMenuBg: '#F7F5F0',
  },
  publications: {
  bg: 'rgba(247, 245, 240, 0.90)',
    bgScrolled: '#f7f5f0fa',
    border: '#EFEAE1',
    borderScrolled: '#E4DCD0',
    logoColor: '#141416',
    titleColor: '#141416',
    inactiveText: '#54575E',
    hoverText: '#141416',
    hoverBg: 'rgba(239, 234, 225, 0.65)',
    activeText: '#A36B3B',
    activeBg: 'rgba(239, 234, 225, 0.95)',
    indicator: '#A36B3B',
    badgeBg: '#A36B3B',
    badgeText: '#FFFFFF',
    mobileMenuBg: '#F7F5F0',
  },
  branches: {
  bg: 'rgba(247, 245, 240, 0.90)',
    bgScrolled: '#f7f5f0fa',
    border: '#EFEAE1',
    borderScrolled: '#E4DCD0',
    logoColor: '#141416',
    titleColor: '#141416',
    inactiveText: '#54575E',
    hoverText: '#141416',
    hoverBg: 'rgba(239, 234, 225, 0.65)',
    activeText: '#A36B3B',
    activeBg: 'rgba(239, 234, 225, 0.95)',
    indicator: '#A36B3B',
    badgeBg: '#A36B3B',
    badgeText: '#FFFFFF',
    mobileMenuBg: '#F7F5F0',
  },
  cells: {
   bg: 'rgba(247, 245, 240, 0.90)',
    bgScrolled: '#f7f5f0fa',
    border: '#EFEAE1',
    borderScrolled: '#E4DCD0',
    logoColor: '#141416',
    titleColor: '#141416',
    inactiveText: '#54575E',
    hoverText: '#141416',
    hoverBg: 'rgba(239, 234, 225, 0.65)',
    activeText: '#A36B3B',
    activeBg: 'rgba(239, 234, 225, 0.95)',
    indicator: '#A36B3B',
    badgeBg: '#A36B3B',
    badgeText: '#FFFFFF',
    mobileMenuBg: '#F7F5F0',
  }
};

export default function Navbar({ activeTab, setActiveTab, registeredCount }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const currentTheme = navThemes[activeTab] || navThemes.home;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  interface MenuItem {
    id: string;
    label: string;
    icon: any;
    special?: boolean;
    badge?: number;
  }

  const menuItems: MenuItem[] = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'about', label: 'Who We Are', icon: Users },
    { id: 'meetings', label: 'Meetings', icon: Calendar, badge: registeredCount > 0 ? registeredCount : undefined },
    { id: 'teachings', label: 'Teachings', icon: Music },
    { id: 'songs', label: 'Songs', icon: Disc },
    { id: 'publications', label: 'Publications', icon: BookOpen },
    { id: 'branches', label: 'Branches', icon: MapPin },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <motion.nav 
      animate={{
        backgroundColor: isScrolled ? currentTheme.bgScrolled : currentTheme.bg,
        borderColor: isScrolled ? currentTheme.borderScrolled : currentTheme.border,
        backdropFilter: isScrolled ? 'blur(16px)' : 'blur(10px)',
      }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="sticky top-0 z-50 border-b shadow-sm transition-colors duration-300" 
      id="main-nav"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Centered Stacked Layout */}
        <div className="hidden md:flex flex-col items-center justify-center py-5 gap-4">
          {/* Church Branding - Centered & Refined */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 cursor-pointer transition-transform" 
            onClick={() => handleNavClick('home')}
          >
            <motion.div 
              animate={{ color: currentTheme.logoColor }}
              transition={{ duration: 0.3 }}
              className="w-14 h-14 flex items-center justify-center shrink-0"
            >
              <svg viewBox="920 620 650 750" className="w-full h-full" fill="currentColor">
                <path d="M1085.557,1321.922l25.142,0l0,-490.404l-31.046,22.771l5.904,467.633Zm49.213,24.071l-72.983,0l-6.358,-503.792l79.342,-58.183l0,561.975Z" />
                <path d="M1395.037,1321.922l25.146,0l5.9,-467.633l-31.046,-22.771l0,490.404Zm48.908,24.071l-72.979,0l0,-561.975l79.342,58.183l-6.362,503.792Z" />
                <path d="M1354.935,1345.993l-201.308,0l0,-596.846l97.483,-107.225l103.825,103.825l0,528.496l-119.129,0l0,-454.513l24.071,0l0,430.442l70.987,0l0,-494.454l-78.925,-78.925l-74.242,81.658l0,563.471l153.167,0l0,-24.763l24.071,0l0,48.833Z" />
                <path d="M1545.665,1345.993l-79.267,0l0,-476.475l79.267,102.167l0,55.025l-24.071,0l0,-46.783l-31.125,-40.112l0,382.108l31.125,0l0,-211.196l24.071,0l0,235.267Z" />
                <path d="M1036.645,1345.993l-93.983,0l0,-324.713l93.983,-49.462l0,65.929l-24.071,0l0,-26.058l-45.842,24.125l0,286.108l45.842,0l0,-234.5l24.071,0l0,258.571Z" />
              </svg>
            </motion.div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-baseline gap-1.5">
                <motion.span 
                  animate={{ color: currentTheme.titleColor }}
                  transition={{ duration: 0.3 }}
                  className="font-cinzel font-bold text-[26px] lg:text-[30px] tracking-wide leading-none"
                >
                  GOD'S EDIFICE CHURCH
                </motion.span>
              </div>
              
              {/* Dynamic Animated Subtitle: God's nurturing place */}
              <motion.div 
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex items-center gap-1.5 mt-1 overflow-hidden"
              >
                <motion.span
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-[#A36B3B] inline-block"
                />
                <motion.span 
                  animate={{
                    opacity: [0.85, 1, 0.85],
                    letterSpacing: ['0.22em', '0.28em', '0.22em']
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-[10px] lg:text-[11px] font-sans font-medium uppercase tracking-[0.24em] transition-colors"
                  style={{
                    color: 'rgba(0, 0, 0, 0.70)'
                  }}
                >
                  God's nurturing place
                </motion.span>
              </motion.div>
            </div>
          </motion.div>

          {/* Desktop Navigation - Centered underneath */}
          <div className="flex items-center justify-center space-x-1 lg:space-x-2">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    color: isActive ? currentTheme.activeText : currentTheme.inactiveText,
                    backgroundColor: isActive ? currentTheme.activeBg : 'transparent',
                  }}
                  className="relative px-4 py-2 rounded-lg font-display text-[11px] tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-medium hover:opacity-100"
                >
                  <span className={isActive ? 'font-bold' : 'font-medium'}>{item.label}</span>
                  {item.badge && (
                    <span 
                      style={{
                        backgroundColor: currentTheme.badgeBg,
                        color: currentTheme.badgeText
                      }}
                      className="font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      style={{ backgroundColor: currentTheme.indicator }}
                      className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Mobile Compact Layout */}
        <div className="flex md:hidden items-center justify-between h-16">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => handleNavClick('home')}
          >
            <motion.div 
              animate={{ color: currentTheme.logoColor }}
              className="w-10 h-10 flex items-center justify-center shrink-0"
            >
              <svg viewBox="920 620 650 750" className="w-full h-full" fill="currentColor">
                <path d="M1085.557,1321.922l25.142,0l0,-490.404l-31.046,22.771l5.904,467.633Zm49.213,24.071l-72.983,0l-6.358,-503.792l79.342,-58.183l0,561.975Z" />
                <path d="M1395.037,1321.922l25.146,0l5.9,-467.633l-31.046,-22.771l0,490.404Zm48.908,24.071l-72.979,0l0,-561.975l79.342,58.183l-6.362,503.792Z" />
                <path d="M1354.935,1345.993l-201.308,0l0,-596.846l97.483,-107.225l103.825,103.825l0,528.496l-119.129,0l0,-454.513l24.071,0l0,430.442l70.987,0l0,-494.454l-78.925,-78.925l-74.242,81.658l0,563.471l153.167,0l0,-24.763l24.071,0l0,48.833Z" />
                <path d="M1545.665,1345.993l-79.267,0l0,-476.475l79.267,102.167l0,55.025l-24.071,0l0,-46.783l-31.125,-40.112l0,382.108l31.125,0l0,-211.196l24.071,0l0,235.267Z" />
                <path d="M1036.645,1345.993l-93.983,0l0,-324.713l93.983,-49.462l0,65.929l-24.071,0l0,-26.058l-45.842,24.125l0,286.108l45.842,0l0,-234.5l24.071,0l0,258.571Z" />
              </svg>
            </motion.div>
            <div className="flex flex-col items-start">
              <motion.span 
                animate={{ color: currentTheme.titleColor }}
                className="font-cinzel font-bold text-[16px] tracking-wide leading-none"
              >
                GOD'S EDIFICE CHURCH
              </motion.span>
              <motion.span 
                animate={{
                  opacity: [0.75, 1, 0.75],
                  letterSpacing: ['0.16em', '0.2em', '0.16em']
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-[8px] font-sans uppercase tracking-[0.16em] mt-0.5"
                style={{
                  color: 'rgba(0, 0, 0, 0.70)'
                }}
              >
                God's nurturing place
              </motion.span>
            </div>
          </motion.div>

          <div className="flex">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              style={{ color: currentTheme.titleColor }}
              className="p-2 rounded-md hover:bg-black/10 focus:outline-none transition-colors"
              aria-label="Toggle Menu"
              id="mobile-menu-toggle"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ 
              backgroundColor: currentTheme.mobileMenuBg,
              borderColor: currentTheme.border 
            }}
            className="md:hidden border-b overflow-hidden"
            id="mobile-nav-panel"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                const IconComponent = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    id={`mobile-nav-btn-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      backgroundColor: isActive ? currentTheme.activeBg : 'transparent',
                      color: isActive ? currentTheme.activeText : currentTheme.inactiveText,
                      borderLeftWidth: isActive ? '4px' : '0px',
                      borderLeftColor: isActive ? currentTheme.indicator : 'transparent',
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left font-display text-[11px] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5" style={{ color: isActive ? currentTheme.activeText : currentTheme.inactiveText }} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span 
                        style={{
                          backgroundColor: currentTheme.badgeBg,
                          color: currentTheme.badgeText
                        }}
                        className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full"
                      >
                        {item.badge}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

