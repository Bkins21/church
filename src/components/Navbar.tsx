import { useState, useEffect } from 'react';
import { Menu, X, BookOpen, MapPin, Calendar, Music, Image, ShieldAlert, Heart, User, Users, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  registeredCount: number;
}

export default function Navbar({ activeTab, setActiveTab, registeredCount }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
    { id: 'meetings', label: 'Meetings', icon: Calendar, badge: registeredCount > 0 ? registeredCount : undefined },
    { id: 'teachings', label: 'Teachings', icon: Music },
    { id: 'songs', label: 'Songs', icon: Disc },
    { id: 'publications', label: 'Publications', icon: BookOpen },
    { id: 'branches', label: 'Branches', icon: MapPin },
    { id: 'cells', label: 'Join a Cell', icon: Users },
    { id: 'gallery', label: 'Gallery', icon: Image }
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <motion.nav 
      animate={{
        backgroundColor: isScrolled ? 'rgba(4, 8, 20, 0.95)' : 'rgba(4, 8, 20, 0.8)',
        borderColor: isScrolled ? 'rgba(212, 175, 55, 0.15)' : 'rgba(15, 32, 67, 0.4)',
        backdropFilter: isScrolled ? 'blur(16px)' : 'blur(8px)',
      }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 border-b" 
      id="main-nav"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Centered Stacked Layout */}
        <div className="hidden md:flex flex-col items-center justify-center py-5 gap-4">
          {/* Church Branding - Centered & 200% Larger */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 cursor-pointer" 
            onClick={() => handleNavClick('home')}
          >
            <div className="w-14 h-14 text-white flex items-center justify-center shrink-0">
              <svg viewBox="920 620 650 750" className="w-full h-full" fill="currentColor">
                <path d="M1085.557,1321.922l25.142,0l0,-490.404l-31.046,22.771l5.904,467.633Zm49.213,24.071l-72.983,0l-6.358,-503.792l79.342,-58.183l0,561.975Z" />
                <path d="M1395.037,1321.922l25.146,0l5.9,-467.633l-31.046,-22.771l0,490.404Zm48.908,24.071l-72.979,0l0,-561.975l79.342,58.183l-6.362,503.792Z" />
                <path d="M1354.935,1345.993l-201.308,0l0,-596.846l97.483,-107.225l103.825,103.825l0,528.496l-119.129,0l0,-454.513l24.071,0l0,430.442l70.987,0l0,-494.454l-78.925,-78.925l-74.242,81.658l0,563.471l153.167,0l0,-24.763l24.071,0l0,48.833Z" />
                <path d="M1545.665,1345.993l-79.267,0l0,-476.475l79.267,102.167l0,55.025l-24.071,0l0,-46.783l-31.125,-40.112l0,382.108l31.125,0l0,-211.196l24.071,0l0,235.267Z" />
                <path d="M1036.645,1345.993l-93.983,0l0,-324.713l93.983,-49.462l0,65.929l-24.071,0l0,-26.058l-45.842,24.125l0,286.108l45.842,0l0,-234.5l24.071,0l0,258.571Z" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-[32px] tracking-tighter text-white leading-none">GOD'S EDIFICE CHURCH</span>
            </div>
          </motion.div>

          {/* Desktop Navigation - Centered underneath */}
          <div className="flex items-center justify-center space-x-1 lg:space-x-3">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  whileHover={{ scale: 1.4, y: -0.5 }}
                  whileTap={{ scale: 0.94 }}
                  className={`relative px-3.5 py-2 rounded-md font-display text-[9.5px] font-light tracking-wider transition-all duration-300 flex items-center gap-1.5 hover:font-bold
                    ${item.special 
                      ? 'bg-gradient-to-r from-cci-gold-600 to-cci-gold-500 hover:from-cci-gold-500 hover:to-cci-gold-400 text-[#040814] !font-medium shadow-md shadow-cci-gold-600/10' 
                      : isActive 
                        ? 'text-cci-gold-400' 
                        : 'text-slate-300 hover:text-slate-100 hover:bg-cci-blue-800/40'
                    }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-black font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.special && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-2 right-2 h-[2px] bg-cci-gold-500 rounded-full"
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
            <div className="w-10 h-10 text-white flex items-center justify-center shrink-0">
              <svg viewBox="920 620 650 750" className="w-full h-full" fill="currentColor">
                <path d="M1085.557,1321.922l25.142,0l0,-490.404l-31.046,22.771l5.904,467.633Zm49.213,24.071l-72.983,0l-6.358,-503.792l79.342,-58.183l0,561.975Z" />
                <path d="M1395.037,1321.922l25.146,0l5.9,-467.633l-31.046,-22.771l0,490.404Zm48.908,24.071l-72.979,0l0,-561.975l79.342,58.183l-6.362,503.792Z" />
                <path d="M1354.935,1345.993l-201.308,0l0,-596.846l97.483,-107.225l103.825,103.825l0,528.496l-119.129,0l0,-454.513l24.071,0l0,430.442l70.987,0l0,-494.454l-78.925,-78.925l-74.242,81.658l0,563.471l153.167,0l0,-24.763l24.071,0l0,48.833Z" />
                <path d="M1545.665,1345.993l-79.267,0l0,-476.475l79.267,102.167l0,55.025l-24.071,0l0,-46.783l-31.125,-40.112l0,382.108l31.125,0l0,-211.196l24.071,0l0,235.267Z" />
                <path d="M1036.645,1345.993l-93.983,0l0,-324.713l93.983,-49.462l0,65.929l-24.071,0l0,-26.058l-45.842,24.125l0,286.108l45.842,0l0,-234.5l24.071,0l0,258.571Z" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-black text-[17px] tracking-tighter text-white leading-none">GOD'S EDIFICE CHURCH</span>
            </div>
          </motion.div>

          <div className="flex">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-slate-100 p-2 rounded-md hover:bg-cci-blue-800/40 focus:outline-none transition-colors"
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
            className="md:hidden bg-[#040814] border-b border-cci-blue-800/80 overflow-hidden"
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
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left font-display text-[10.5px] font-light transition-all
                      ${item.special 
                        ? 'bg-gradient-to-r from-cci-gold-600 to-cci-gold-500 text-[#040814] !font-medium mt-3' 
                        : isActive 
                          ? 'bg-cci-blue-800 text-cci-gold-400 border-l-4 border-cci-gold-500 pl-2.5' 
                          : 'text-slate-300 hover:bg-cci-blue-900/60 hover:text-slate-100'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 ${isActive && !item.special ? 'text-cci-gold-400' : ''}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-amber-500 text-black font-mono text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
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
