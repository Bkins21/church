import { Heart, Users, BookOpen, MapPin, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutUsProps {
  onNavigate?: (tab: string) => void;
}

export default function AboutUs({ onNavigate }: AboutUsProps) {
  const coreValues = [
    {
      title: 'Belong',
      badge: 'Pillar 01',
      description: 'Connecting you into the family of God — finding true community, discovering your place, and growing in relationship with fellow believers and with Christ.',
      icon: Heart,
      cardBg: 'bg-gradient-to-br from-[#8E1B24] via-[#78141B] to-[#4F0D13] text-white',
      cardBorder: 'border-[#A3232C] hover:border-[#FECDD3]',
      cardShadow: 'hover:shadow-2xl hover:shadow-[#78141B]/40',
      iconBg: 'bg-white/15 text-[#FFE4E6] border border-white/25',
      titleColor: 'text-white group-hover:text-[#FFE4E6]',
      descColor: 'text-[#FFE4E6]/90 font-medium',
      badgeColor: 'bg-white/15 text-[#FFE4E6] border-white/25',
      borderTop: 'border-white/20',
    },
    {
      title: 'Build',
      badge: 'Pillar 02',
      description: 'Equipping and strengthening believers through sound doctrinal teaching, fervent prayer, discipleship, and spiritual maturity.',
      icon: BookOpen,
      cardBg: 'bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#92400E] text-stone-950',
      cardBorder: 'border-[#FBBF24] hover:border-[#FEF08A]',
      cardShadow: 'hover:shadow-2xl hover:shadow-[#D97706]/40',
      iconBg: 'bg-stone-950/15 text-stone-950 border border-stone-950/25',
      titleColor: 'text-stone-950 group-hover:text-black font-extrabold',
      descColor: 'text-stone-900 font-semibold',
      badgeColor: 'bg-stone-950/15 text-stone-950 border-stone-950/25 font-bold',
      borderTop: 'border-stone-950/20',
    },
    {
      title: 'Become',
      badge: 'Pillar 03',
      description: 'Transforming into the fullness of Christ Jesus — manifesting Kingdom power, godly character, and walking boldly in your divine calling.',
      icon: Users,
      cardBg: 'bg-gradient-to-br from-[#166534] via-[#0D4428] to-[#052E16] text-white',
      cardBorder: 'border-[#15803D] hover:border-[#86EFAC]',
      cardShadow: 'hover:shadow-2xl hover:shadow-[#0D4428]/40',
      iconBg: 'bg-white/15 text-[#A7F3D0] border border-white/25',
      titleColor: 'text-white group-hover:text-[#DCFCE7]',
      descColor: 'text-[#DCFCE7]/90 font-medium',
      badgeColor: 'bg-white/15 text-[#DCFCE7] border-white/25',
      borderTop: 'border-white/20',
    }
  ];

  return (
    <div className="w-full bg-[#3A2312] text-[#F5FEFE]" id="gec-about-page">
      {/* SECTION 1: Full-Bleed Grand Editorial Header */}
      <section className="relative w-full bg-[#080E1C] text-[#F7F5F0] py-24 sm:py-32 lg:py-36 border-b border-[#1E293B] overflow-hidden">
        {/* Full-bleed background image with watermark cropped out & dark blue/black clarity gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="https://hnunflpzqxkwkzjhnbpz.supabase.co/storage/v1/object/public/hero-images/group%201.jpg"
            alt="God's Edifice Church Family"
            className="w-full h-full object-cover object-[center_60%] scale-[1.55] sm:scale-[1.5] -translate-y-[20%] origin-center filter brightness-[0.92] contrast-[1.08] transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          {/* Subtle dark blue to black gradient overlays maximizing picture visibility while ensuring readability */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(6, 11, 24, 0.72) 0%, rgba(8, 14, 28, 0.38) 45%, rgba(6, 11, 24, 0.85) 90%, #080E1C 100%)'
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(10, 18, 38, 0.45) 0%, rgba(6, 11, 24, 0.75) 80%, rgba(4, 8, 18, 0.92) 100%)'
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div 
            className="inline-flex items-center px-4 py-1.5 rounded-full text-[#F7F5F0] text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md border border-[#F7F5F0]/30 shadow-lg"
            style={{ backgroundColor: 'rgba(247, 245, 240, 0.20)' }}
          >
            <span>About God's Edifice Church</span>
          </div>
          <h1 className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FFFFFF] drop-shadow-lg">
            Who Are We?
          </h1>
          <div className="w-24 h-1.5 bg-[#A37F3B] mx-auto rounded-full shadow-md shadow-[#A37F3B]/40" />
          <p className="text-base sm:text-xl text-[#F7F5F0]/95 font-sans leading-relaxed max-w-3xl mx-auto font-light drop-shadow-md">
            We are a family held together by God — a bond that stands the test of time. We are a community of believers who stand together through every trial, edifying one another and growing together. That's our purpose for coming together.
          </p>
        </div>
      </section>

      {/* SECTION 2: Vision & Mission Section */}
      <section className="w-full bg-[#F5EFEB] py-16 sm:py-24 border-b border-[#E1D6C7]" id="about-vision-mission">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            {/* Vision - Green Gradient from 'Become' */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl bg-gradient-to-br from-[#166534] via-[#0D4428] to-[#052E16] border border-[#15803D]/40 p-8 sm:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden text-white"
            >
              <div className="space-y-5 relative z-10">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#DCFCE7] inline-block px-3 py-1 bg-white/15 rounded-lg border border-white/20">
                  Our Vision Statement
                </span>
                <blockquote className="font-cinzel text-xl sm:text-2xl font-bold text-white leading-relaxed">
                  "We have a mandate to raise men for Jesus, to bring more sons into the will and plan of God; through the reconciliation message. Christ sent us; we are set on a course and we are not looking back."
                </blockquote>
              </div>
              <p className="text-xs sm:text-sm font-mono text-white font-semibold mt-6 pt-4 border-t border-white/20">
                ✦ God's Nurturing Place
              </p>
            </motion.div>

            {/* Mission - Red Gradient */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-3xl bg-gradient-to-br from-[#9B2226] via-[#78141B] to-[#4F0D13] border border-[#B7242C]/40 p-8 sm:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden text-[#F7F5F0]"
            >
              <div className="space-y-5 relative z-10">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFE4E6] inline-block px-3 py-1 bg-white/15 rounded-lg border border-white/20">
                  Our Mission Statement
                </span>
                <div className="font-cinzel text-base sm:text-lg font-bold text-white leading-relaxed space-y-2.5">
                  <p>• "We pray without ceasing"</p>
                  <p>• "We study God's word effectively"</p>
                  <p>• "We reach the lost with the message of reconciliation"</p>
                  <p>• "We disciple believers until they grow into Christ"</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-mono text-white font-semibold mt-6 pt-4 border-t border-white/20">
                ✦ God's Nurturing Place
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* SECTION 3: 3 Core Identity Pillars */}
      <section className="w-full bg-[#f7f5f0e6] py-16 sm:py-24" id="about-core-identity">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="font-cinzel text-2xl sm:text-4xl font-bold tracking-tight text-[#141416]">
              Our Core Identity
            </h2>
            <p className="text-sm sm:text-base text-[#54575E] leading-relaxed">
              The three-fold mandate that defines our assembly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {coreValues.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: 0.12 * idx, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden border rounded-3xl p-6 sm:p-8 transition-all duration-300 group flex flex-col justify-between ${val.cardBg} ${val.cardBorder} ${val.cardShadow}`}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-2xl ${val.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase border ${val.badgeColor}`}>
                        {val.badge}
                      </span>
                    </div>

                    <h4 className={`font-cinzel font-bold text-xl sm:text-2xl mb-3 transition-colors ${val.titleColor}`}>
                      {val.title}
                    </h4>
                    <p className={`text-xs sm:text-sm leading-relaxed font-sans ${val.descColor}`}>
                      {val.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action Gateway */}
          <div className="text-center pt-8 sm:pt-12 space-y-5">
            <h3 className="font-cinzel text-2xl font-bold text-[#141416]">
              Ready to Connect with Us?
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {onNavigate && (
                <>
                  <button
                    onClick={() => onNavigate('branches')}
                    className="px-8 py-4 rounded-xl bg-[#A37F3B] hover:bg-[#8F6D2F] text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg transform hover:-translate-y-0.5"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Find a Branch</span>
                  </button>
                  <button
                    onClick={() => onNavigate('meetings')}
                    className="px-8 py-4 rounded-xl bg-[#141416] hover:bg-[#232326] border border-[#A37F3B]/30 text-[#F7F5F0] font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md transform hover:-translate-y-0.5"
                  >
                    <Calendar className="h-4 w-4 text-[#A37F3B]" />
                    <span>Upcoming Gatherings</span>
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

