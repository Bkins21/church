import { Sparkles, Heart, BookOpen, Music, Users, ArrowRight, Calendar, Compass, ShieldCheck, Disc, Globe, Layers, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface MinistryItem {
  id: string;
  name: string;
  tagline?: string;
  badge: string;
  badgeColor: string;
  icon: any;
  cardBg: string;
  cardBorder: string;
  iconBg: string;
  summary: string;
  pillars?: string[];
  subInitiative?: {
    title: string;
    tag: string;
    description: string;
    actionLabel: string;
    actionTab: string;
  };
  action?: {
    label: string;
    tab: string;
  };
}

interface MinistriesProps {
  onNavigate?: (tab: string) => void;
}

export default function Ministries({ onNavigate }: MinistriesProps) {
  const handleNav = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const ministries: MinistryItem[] = [
    {
      id: 'oasis-mission',
      name: 'Oasis Mission',
      badge: 'Youth & Young People',
      badgeColor: 'bg-[#FFE4E6]/20 text-[#FFE4E6] border-white/20',
      icon: Users,
      cardBg: 'bg-gradient-to-br from-[#8E1B24] via-[#78141B] to-[#4F0D13] text-white',
      cardBorder: 'border-[#A3232C]',
      iconBg: 'bg-white/15 text-[#FFE4E6] border border-white/25',
      summary: `In a world where many things compete for the attention of young people, we see them drifting, often for lack of identity. We believe God can shape and anchor their lives.

Oasis is committed to raising teenagers and young people into mature, purposeful followers of Christ, helping them build a genuine relationship with God, form godly relationships, and discover God's plan for their lives.

We believe this growth raises young ministers of the Gospel, equipped to preach, teach, lead, and serve, carrying Christ's message to their generation.`,
     
      // Oasis Campmeeting is explicitly highlighted as a major meeting/event under Oasis Mission
      subInitiative: {
        title: 'Oasis Campmeeting',
        tag: 'Flagship Event under Oasis Mission',
        description: 'In a world pulling young people in every direction, Oasis Campmeeting creates a space to pause, reset, and be shaped by God. It is the annual gathering under Oasis Mission, bringing teenagers and young adults together for an intensive atmosphere of prayer, sound doctrine, mentorship, and demonstration of the things of the Spirit.',
        actionLabel: 'View in Meetings Calendar',
        actionTab: 'meetings'
      }
    },
    {
      id: 'village-outreach',
      name: 'Village Outreach',
      badge: 'Community & Missions',
      badgeColor: 'bg-[#DCFCE7]/20 text-[#DCFCE7] border-white/20',
      icon: Compass,
      cardBg: 'bg-gradient-to-br from-[#166534] via-[#0D4428] to-[#052E16] text-white',
      cardBorder: 'border-[#15803D]',
      iconBg: 'bg-white/15 text-[#A7F3D0] border border-white/25',
      summary: 'A ministry focused on reaching rural communities and the Unreached People Group (UPG) through the gospel, practical love, outreach, missions, and bringing the message of Christ to people and communities.',
      pillars: [
        'Rural Evangelism & Gospel Penetration into Hinterlands',
        'Demonstrating the Practical Love and Benevolence of Christ',
        'Missions Relief, Community Support & Health Outreach',
        'Planting Spiritual Seeds and Nurturing Rural Assemblies'
      ],
      action: {
        label: 'Connect with Our Assemblies',
        tab: 'branches'
      }
    },
    {
      id: 'crossword-media',
      name: 'Crossword Media',
      badge: 'Media & Publications',
      badgeColor: 'bg-stone-950/15 text-stone-950 border-stone-950/25',
      icon: BookOpen,
      cardBg: 'bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#92400E] text-stone-950',
      cardBorder: 'border-[#FBBF24]',
      iconBg: 'bg-stone-950/15 text-stone-950 border border-stone-950/25',
      summary: "The church's media and publication ministry. This includes church publications, digital media, creative communication, visual storytelling, and related media resources.",
      pillars: [
        'Weekly Bulletins, Doctrinal Treatises & Church Publications',
        'High-Impact Digital Media, Audio/Visual Production & Sound',
        'Creative Visual Storytelling & Theological Content Archiving',
        'Broadcast Technology & Strategic Kingdom Communication'
      ],
      action: {
        label: 'Explore Our Publications',
        tab: 'publications'
      }
    },
    {
      id: 'crossworship',
      name: 'Crossworship',
      badge: 'Worship & Music',
      badgeColor: 'bg-[#E4DCD0]/20 text-[#E4DCD0] border-[#E4DCD0]/30',
      icon: Disc,
      cardBg: 'bg-gradient-to-br from-[#2D1B0E] via-[#22130A] to-[#140B06] text-white',
      cardBorder: 'border-[#A37F3B]/50',
      iconBg: 'bg-[#A37F3B]/20 text-[#E5B869] border border-[#A37F3B]/40',
      summary: "The church's worship and music ministry. This includes worship songs, choral ministrations, and musical resources connected to our dedicated Songs catalogue.",
      pillars: [
        'Doctrinally Sound Songwriting Rooted in Grace and Scripture',
        'Leading Deep Congregational & Apostolic Worship Encounters',
        'Crossworship Psalms, Anthem Recordings & Musical Releases',
        'Nurturing Choral Ministration, Musicians & Psalmodists'
      ],
      action: {
        label: 'Listen to Crossworship Psalms',
        tab: 'songs'
      }
    }
  ];

  return (
    <div className="w-full bg-[#F7F5F0] text-[#141416]" id="gec-ministries-page">
      
      {/* SECTION 1: Grand Editorial Hero */}
      <section className="relative w-full bg-[#080E1C] text-[#F7F5F0] py-20 sm:py-28 lg:py-32 border-b border-[#1E293B] overflow-hidden">
        {/* Subtle background ambient overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(6, 11, 24, 0.85) 0%, rgba(8, 14, 28, 0.70) 50%, #080E1C 100%)'
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(163, 107, 59, 0.15) 0%, rgba(6, 11, 24, 0.85) 80%, rgba(4, 8, 18, 0.98) 100%)'
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[#F7F5F0] text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md border border-[#F7F5F0]/30 shadow-lg"
            style={{ backgroundColor: 'rgba(247, 245, 240, 0.15)' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C28B57]" />
            <span>God's Edifice Church Ministries</span>
          </div>

          <h1 className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FFFFFF] drop-shadow-lg">
            Our Ministries
          </h1>

          <div className="w-24 h-1.5 bg-[#A36B3B] mx-auto rounded-full shadow-md shadow-[#A36B3B]/40" />

          <p className="text-base sm:text-lg lg:text-xl text-[#F7F5F0]/90 font-sans leading-relaxed max-w-3xl mx-auto font-light drop-shadow-md">
            At God’s Edifice Church, our ministries are dedicated channels through which we fulfill our God-given mandate: raising men for Jesus, discipling the next generation, proclaiming Christ in communities, publishing theological truth, and cultivating heartfelt worship.
          </p>
        </div>
      </section>

      {/* SECTION 2: Four Featured Ministries Grid */}
      <section className="w-full py-16 sm:py-24" id="ministries-grid-section">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
          
          {ministries.map((ministry, index) => {
            const Icon = ministry.icon;
            const isReversed = index % 2 === 1;

            return (
              <motion.div
                key={ministry.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className={`rounded-3xl border shadow-xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between ${ministry.cardBg} ${ministry.cardBorder}`}
                id={`ministry-card-${ministry.id}`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/15">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${ministry.iconBg} flex items-center justify-center shrink-0 shadow-md`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <span className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border inline-block mb-1.5 ${ministry.badgeColor}`}>
                        {ministry.badge}
                      </span>
                      <h2 className="font-cinzel font-bold text-2xl sm:text-3xl tracking-wide">
                        {ministry.name}
                      </h2>
                    </div>
                  </div>

                  {ministry.tagline && (
                    <span className="text-xs font-mono opacity-80 italic tracking-wide">
                      {ministry.tagline}
                    </span>
                  )}
                </div>

                {/* Body Content */}
                <div className="py-6 space-y-6">
                  <p className="text-sm sm:text-base leading-relaxed font-sans opacity-95 max-w-4xl whitespace-pre-line">
                    {ministry.summary}
                  </p>

                  {/* Core Pillars / Focus Areas */}
                  {ministry.pillars && ministry.pillars.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-widest opacity-85">
                        Key Focus Areas:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ministry.pillars.map((pillar, pIdx) => (
                          <div 
                            key={pIdx}
                            className="flex items-start gap-2.5 p-3 rounded-xl bg-black/10 border border-white/10 text-xs sm:text-sm font-sans"
                          >
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
                            <span>{pillar}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explicit Sub-Initiative: Oasis Campmeeting under Oasis Mission */}
                  {ministry.subInitiative && (
                    <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-black/25 border border-white/20 backdrop-blur-sm space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#FFE4E6]" />
                          <h4 className="font-cinzel font-bold text-base sm:text-lg text-white">
                            {ministry.subInitiative.title}
                          </h4>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FFE4E6]/20 text-[#FFE4E6] text-[10px] font-mono font-bold uppercase tracking-wider border border-white/20">
                          {ministry.subInitiative.tag}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm leading-relaxed text-[#FFE4E6]/90 font-sans">
                        {ministry.subInitiative.description}
                      </p>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleNav(ministry.subInitiative.actionTab)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#78141B] font-display font-bold text-xs uppercase tracking-wider hover:bg-stone-100 transition-all cursor-pointer shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                          id="btn-oasis-campmeeting-cta"
                        >
                          <span>{ministry.subInitiative.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer CTA where applicable */}
                {ministry.action && (
                  <div className="pt-4 border-t border-white/15 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleNav(ministry.action.tab)}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md transform hover:-translate-y-0.5 active:translate-y-0 ${
                        ministry.id === 'crossword-media'
                          ? 'bg-stone-950 text-white hover:bg-stone-900 border border-stone-800'
                          : ministry.id === 'crossworship'
                          ? 'bg-[#A37F3B] hover:bg-[#8F6D2F] text-white'
                          : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                      }`}
                      id={`btn-cta-${ministry.id}`}
                    >
                      <span>{ministry.action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}

        </div>
      </section>

      {/* SECTION 3: Bottom Call to Connect Banner */}
      <section className="w-full bg-[#EFEAE1]/70 border-t border-[#E4DCD0] py-14 sm:py-18">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#141416]">
            Get Involved in Ministry
          </h3>
          <p className="text-sm sm:text-base text-[#54575E] leading-relaxed max-w-2xl mx-auto font-sans">
            Every believer has a place to grow and serve. Discover your calling, use your spiritual gifts, and partner with God's work across our branches and mission departments.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleNav('branches')}
              className="px-6 py-3 rounded-xl bg-[#A36B3B] hover:bg-[#8D5A30] text-white font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
              id="ministries-btn-locate-branch"
            >
              <span>Locate a GEC Assembly</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleNav('meetings')}
              className="px-6 py-3 rounded-xl bg-white border border-[#E4DCD0] hover:border-[#A36B3B] text-[#141416] font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-2"
              id="ministries-btn-view-meetings"
            >
              <span>View Upcoming Meetings</span>
              <Calendar className="w-3.5 h-3.5 text-[#A36B3B]" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
