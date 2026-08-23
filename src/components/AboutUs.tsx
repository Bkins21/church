import { Heart, Users, BookOpen, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutUsProps {
  onNavigate?: (tab: string) => void;
}

export default function AboutUs({ onNavigate }: AboutUsProps) {
  const values = [
    {
      title: 'Belong',
      subtitle: 'A True Spiritual Family',
      description: 'We believe church is a home where believers find genuine community, unconditional love, and spiritual belonging in Jesus Christ.',
      icon: Heart,
    },
    {
      title: 'Built',
      subtitle: 'Systematic Biblical Discipleship',
      description: 'Equipping saints with clear, unapologetic, verse-by-verse Christocentric teaching to build unshakeable spiritual conviction.',
      icon: BookOpen,
    },
    {
      title: 'Build',
      subtitle: 'Kingdom Advance & Mission',
      description: 'Empowering every member with gifts, character, and apostolic passion to reach their world and establish God’s kingdom.',
      icon: Users,
    }
  ];

  const pillars = [
    'Systematic Expository Preaching',
    'Intense Corporate Prayer Culture',
    'Warm Fellowship & Discipleship',
    'Active Local Campus Missions',
    'Passionate Christ-Centered Worship',
    'Raising Future Ministry Leaders',
  ];

  return (
    <div className="min-h-screen bg-[#01406D] text-[#F5FEFE]" id="gec-about-page">
      {/* Header: #01406D, #01B4BA, #F5FEFE */}
      <div className="w-full bg-[#01406D] text-[#F5FEFE] py-16 sm:py-24 border-b border-[#01518A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h1 className="font-cinzel text-4xl sm:text-6xl font-bold tracking-tight text-[#F5FEFE]">
            Who Are We?
          </h1>
          <div className="w-20 h-1 bg-[#01B4BA] mx-auto rounded-full" />
          <p className="text-base sm:text-lg text-[#F5FEFE]/85 font-sans leading-relaxed max-w-2xl mx-auto">
            A vibrant apostolic ministry committed to raising mature disciples, establishing believers in the truth of God’s Word, and building lives on the unshakeable foundation of Christ.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Vision Statement Banner */}
        <div className="rounded-3xl bg-[#013256] border border-[#01B4BA]/40 p-8 sm:p-12 shadow-xl text-center max-w-4xl mx-auto">
          <div className="space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#01B4BA]">
              Our Driving Apostolic Vision
            </span>
            <blockquote className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F5FEFE] leading-tight">
              "To See All Men Saved And Come To The Knowledge Of The Truth."
            </blockquote>
            <p className="text-xs sm:text-sm font-mono text-[#01B4BA] font-semibold">
              1 Timothy 2:4 • God's Nurturing Place
            </p>
          </div>
        </div>

        {/* 3 Core Identity Pillars */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#F5FEFE]">
              Our Core Identity
            </h2>
            <p className="text-xs sm:text-sm text-[#F5FEFE]/75 mt-1">
              The three-fold mandate that defines our assembly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="rounded-2xl bg-[#013256] border border-[#01518A] hover:border-[#01B4BA] p-6 sm:p-8 shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-[#01406D] text-[#01B4BA] border border-[#01B4BA]/40 flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-cinzel text-2xl font-bold text-[#F5FEFE]">
                        {val.title}
                      </h3>
                      <p className="text-xs font-mono text-[#01B4BA] mt-0.5 font-bold uppercase tracking-wider">
                        {val.subtitle}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-[#F5FEFE]/85 leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Core Pillars & Beliefs */}
        <div className="rounded-3xl bg-[#013256] border border-[#01518A] p-8 sm:p-10 max-w-4xl mx-auto space-y-6 shadow-md">
          <div className="text-center sm:text-left">
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F5FEFE]">
              What We Emphasize
            </h3>
            <p className="text-xs text-[#F5FEFE]/75 mt-1">
              Key tenets that shape our church life across all branches
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#01406D] border border-[#01518A]">
                <CheckCircle2 className="h-4 w-4 text-[#01B4BA] shrink-0" />
                <span className="text-xs sm:text-sm text-[#F5FEFE] font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Gateway */}
        <div className="text-center pt-4 space-y-4">
          <h3 className="font-cinzel text-xl font-bold text-[#F5FEFE]">
            Ready to Connect with Us?
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('branches')}
                  className="px-6 py-3.5 rounded-xl bg-[#01B4BA] hover:bg-[#019DA3] text-[#01406D] font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Find a Branch</span>
                </button>
                <button
                  onClick={() => onNavigate('meetings')}
                  className="px-6 py-3.5 rounded-xl bg-[#013256] hover:bg-[#01406D] border border-[#01B4BA]/40 text-[#F5FEFE] font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Calendar className="h-4 w-4 text-[#01B4BA]" />
                  <span>Upcoming Gatherings</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
