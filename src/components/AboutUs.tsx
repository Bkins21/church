import { Heart, Users, BookOpen, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutUsProps {
  onNavigate?: (tab: string) => void;
}

export default function AboutUs({ onNavigate }: AboutUsProps) {
  const values = [
    {
      title: 'Belong',
      description: 'Connecting you into the family of God — finding true community, discovering your place, and growing in relationship with fellow believers and with Christ.',
      icon: Heart,
    },
    {
      title: 'Build',
      description: "Equipping you to become an effective minister of the Gospel of Christ — grounded in the Word, strengthened in prayer, bold in evangelism, and empowered by the demonstration of the Spirit.",
      icon: BookOpen,
    },
    {
      title: 'Become',
      description: 'Growing up into the fullness of Christ, mature in faith, established in truth, and active in the work of ministry, building up the body of Christ in love.',
      icon: Users,
    }
  ];

  

  return (
    <div className="w-full bg-[#01406D] text-[#F5FEFE]" id="gec-about-page">
      {/* SECTION 1: Full-Bleed Grand Editorial Header */}
      <section className="relative w-full bg-[#01406D] text-[#F5FEFE] py-20 sm:py-28 lg:py-32 border-b border-[#01518A] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#01B4BA]/10 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#01B4BA]/15 border border-[#01B4BA]/30 text-[#01B4BA] text-xs font-mono font-bold uppercase tracking-widest">
            <span>About God's Edifice Church</span>
          </div>
          <h1 className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F5FEFE]">
            Who Are We?
          </h1>
          <div className="w-24 h-1.5 bg-[#01B4BA] mx-auto rounded-full shadow-sm shadow-[#01B4BA]/40" />
          <p className="text-base sm:text-xl text-[#F5FEFE]/90 font-sans leading-relaxed max-w-3xl mx-auto font-light">
            We are a family held together by God — a bond that stands the test of time. We are a community of believers who stand together through every trial, edifying one another and growing together. That's our purpose for coming together.
          </p>
        </div>
      </section>

      {/* SECTION 2: Vision & Mission Section */}
      <section className="w-full bg-[#01355B] py-16 sm:py-24 border-b border-[#01518A]" id="about-vision-mission">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            {/* Vision Statement Card */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl bg-[#012A4A] border border-[#01B4BA]/30 p-8 sm:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-5 relative z-10">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#01B4BA] inline-block px-3 py-1 bg-[#01B4BA]/10 rounded-lg border border-[#01B4BA]/20">
                  Our Vision Statement
                </span>
                <blockquote className="font-cinzel text-xl sm:text-2xl font-bold text-[#F5FEFE] leading-relaxed">
                  "We have a mandate to raise men for Jesus, to bring more sons into the will and plan of God; through the reconciliation message. Christ sent us; we are set on a course and we are not looking back."
                </blockquote>
              </div>
              <p className="text-xs sm:text-sm font-mono text-[#01B4BA] font-semibold mt-6 pt-4 border-t border-[#01518A]">
                ✦ God's Nurturing Place
              </p>
            </motion.div>

            {/* Mission Statement Card */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-3xl bg-[#012A4A] border border-[#01B4BA]/30 p-8 sm:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-5 relative z-10">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#01B4BA] inline-block px-3 py-1 bg-[#01B4BA]/10 rounded-lg border border-[#01B4BA]/20">
                  Our Mission Statement
                </span>
                <div className="font-cinzel text-base sm:text-lg font-bold text-[#F5FEFE] leading-relaxed space-y-2.5">
                  <p>• "We pray without ceasing"</p>
                  <p>• "We study God's word effectively"</p>
                  <p>• "We reach the lost with the message of reconciliation"</p>
                  <p>• "We raise disciples; training them to pray, study and reach the lost"</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-mono text-[#01B4BA] font-semibold mt-6 pt-4 border-t border-[#01518A]">
                ✦ God's Nurturing Place
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* SECTION 3: 3 Core Identity Pillars */}
      <section className="w-full bg-[#01406D] py-16 sm:py-24" id="about-core-identity">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F5FEFE]">
              Our Core Identity
            </h2>
            <p className="text-sm sm:text-base text-[#F5FEFE]/75">
              The three-fold mandate that defines our assembly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="rounded-3xl bg-[#013256] border border-[#01518A] hover:border-[#01B4BA] p-8 shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#01406D] text-[#01B4BA] border border-[#01B4BA]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-cinzel text-2xl font-bold text-[#F5FEFE]">
                        {val.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[#F5FEFE]/85 leading-relaxed font-sans font-light">
                      {val.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action Gateway */}
          <div className="text-center pt-8 sm:pt-12 space-y-5">
            <h3 className="font-cinzel text-2xl font-bold text-[#F5FEFE]">
              Ready to Connect with Us?
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {onNavigate && (
                <>
                  <button
                    onClick={() => onNavigate('branches')}
                    className="px-8 py-4 rounded-xl bg-[#01B4BA] hover:bg-[#019DA3] text-[#01406D] font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg transform hover:-translate-y-0.5"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Find a Branch</span>
                  </button>
                  <button
                    onClick={() => onNavigate('meetings')}
                    className="px-8 py-4 rounded-xl bg-[#013256] hover:bg-[#012A4A] border border-[#01B4BA]/40 text-[#F5FEFE] font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md transform hover:-translate-y-0.5"
                  >
                    <Calendar className="h-4 w-4 text-[#01B4BA]" />
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
