import { MapPin, Phone, Mail, ArrowUp, Instagram } from 'lucide-react';

interface FooterProps {
  activeTab?: string;
}

export default function Footer({ activeTab = 'home' }: FooterProps) {
  // Universal Home Footer Palette & Design across all pages
  const footerBg = 'bg-[#141416]';
  const footerBorder = 'border-[#2A2724]';
  const footerText = 'text-[#D5C9B8]';
  const headingColor = 'text-white';
  const logoColor = 'text-white';
  const subtitleColor = '#C28B57';
  const accentColor = '#C28B57';
  const descColor = 'text-[#8A8E96]';
  const legalBorder = 'border-[#2A2724]';
  const legalText = 'text-[#8A8E96]';
  const btnClass = 'bg-[#222326] border-[#383A3F] hover:border-[#C28B57] hover:bg-[#383A3F] text-[#D5C9B8] hover:text-white';
  const btnIconColor: string | undefined = undefined;
  const linkHoverClass = 'hover:text-white';
  const creditColor = '#8A8E96';

  return (
    <footer 
      className={`border-t transition-colors duration-500 py-16 ${footerBg} ${footerBorder} ${footerText}`} 
      id="footer-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core details layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 items-start">
          
          {/* Column 1: Logo & Slogan */}
          <div className="md:col-span-7 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className={`w-10 h-10 flex items-center justify-center shrink-0 ${logoColor}`}
              >
                <svg viewBox="920 620 650 750" className="w-full h-full" fill="currentColor">
                  <path d="M1085.557,1321.922l25.142,0l0,-490.404l-31.046,22.771l5.904,467.633Zm49.213,24.071l-72.983,0l-6.358,-503.792l79.342,-58.183l0,561.975Z" />
                  <path d="M1395.037,1321.922l25.146,0l5.9,-467.633l-31.046,-22.771l0,490.404Zm48.908,24.071l-72.979,0l0,-561.975l79.342,58.183l-6.362,503.792Z" />
                  <path d="M1354.935,1345.993l-201.308,0l0,-596.846l97.483,-107.225l103.825,103.825l0,528.496l-119.129,0l0,-454.513l24.071,0l0,430.442l70.987,0l0,-494.454l-78.925,-78.925l-74.242,81.658l0,563.471l153.167,0l0,-24.763l24.071,0l0,48.833Z" />
                  <path d="M1545.665,1345.993l-79.267,0l0,-476.475l79.267,102.167l0,55.025l-24.071,0l0,-46.783l-31.125,-40.112l0,382.108l31.125,0l0,-211.196l24.071,0l0,235.267Z" />
                  <path d="M1036.645,1345.993l-93.983,0l0,-324.713l93.983,-49.462l0,65.929l-24.071,0l0,-26.058l-45.842,24.125l0,286.108l45.842,0l0,-234.5l24.071,0l0,258.571Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className={`font-cinzel font-bold text-[18px] tracking-wide leading-none ${headingColor}`}>
                  GOD'S EDIFICE
                </span>
                <span 
                  className="font-cinzel font-bold text-[14px] tracking-wide leading-none mt-1"
                  style={{ color: subtitleColor }}
                >
                  CHURCH
                </span>
              </div>
            </div>
            
            <p className={`text-xs leading-relaxed max-w-lg mb-6 ${descColor}`}>
              <span 
                className="block text-[9px] leading-[2.0] font-mono font-bold text-left w-full mb-2 uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                "God's Nurturing place"
              </span>
              </p>
          </div>

          {/* Column 2: Headquarters */}
          <div className="md:col-span-5 md:pl-6">
            <h4 className={`font-cinzel font-bold text-xs uppercase tracking-wider mb-4 ${headingColor}`}>
              Headquarters
            </h4>
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: accentColor }} />
                <span>God's Edifice Hall, Macjob Secondary school, Onikolobo, Oluwo junction, Abeokuta, Ogun state</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
                <span>+234 707 695 8715</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
                <span className="truncate">godsedificechurch@gmail.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Instagram className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
                <a
                  href="https://www.instagram.com/godsedificechurch?igsi=MTY4Z2M4b3Jsc2h0bQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors ${linkHoverClass} underline-offset-4 hover:underline`}
                  id="footer-instagram-link"
                >
                  God's Edifice Church
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal bar */}
        <div 
          className={`pt-8 border-t text-center text-[11px] flex flex-col md:flex-row justify-between items-center gap-4 ${legalBorder} ${legalText}`}
        >
          <div className="flex flex-col items-center md:items-start gap-1">
            <p>© {new Date().getFullYear()} God's Edifice Church. All Rights Reserved.</p>
          </div>
          
          {/* Back to Top Button */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all duration-300 group cursor-pointer ${btnClass}`}
            title="Scroll back to top of page"
            id="footer-back-to-top-btn"
          >
            <span className="text-xs font-medium tracking-wide">Back to Top</span>
            <ArrowUp className="h-3.5 w-3.5 group-hover:-translate-y-0.5 transition-transform duration-300" style={{ color: btnIconColor }} />
          </button>

          {/* 
          <div className="flex gap-4">
            <span className={`cursor-pointer transition-colors ${linkHoverClass}`}>Terms of Service</span>
            <span className={`cursor-pointer transition-colors ${linkHoverClass}`}>Privacy Policy</span>
            <span className={`cursor-pointer transition-colors ${linkHoverClass}`}>Doctrinal Statement</span>
          </div> 
          */}
        </div>

        {/* Designer Credit Row */}
        <div 
          className={`mt-8 pt-6 border-t text-center ${legalBorder}`}
        >
          <p 
            className="font-sans font-light text-[10px] tracking-[0.1em]"
            style={{ color: creditColor }}
          >
            Designed by Crossword Media; the Media, Sound and Tech department of God's Edifice Church
          </p>
        </div>
      </div>
    </footer>
  );
}
