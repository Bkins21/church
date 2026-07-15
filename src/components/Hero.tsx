import { useState, useEffect, FormEvent } from 'react';
import { Play, MapPin, Calendar, Heart, Shield, Award, Sparkles, ExternalLink, Headset, Ticket, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Registration } from '../types';

interface HeroProps {
  onNavigate: (tab: string) => void;
  userRegistrations?: Registration[];
  onStartRegistration?: (firstName: string, surname: string, email: string) => void;
}

export default function Hero({ onNavigate, userRegistrations, onStartRegistration }: HeroProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const colorThemes = [
    // 0: Emerald Deep
    {
      bg: 'from-emerald-950 via-[#01251a] to-[#00140e]',
      border: 'border-emerald-500/40',
      badgeBorder: 'border-emerald-500/30',
      shadow: 'shadow-emerald-500/10',
      title: 'text-emerald-300',
      subtitle: 'text-emerald-400/80',
      badgeBg: 'bg-emerald-950/80',
      badgeText: 'text-emerald-400',
      numBox: 'bg-emerald-900/10 border-emerald-500/20',
      numText: 'text-emerald-300',
      lblText: 'text-emerald-500',
      glow: 'bg-emerald-500/5',
      accentText: 'text-emerald-400/60'
    },
    // 1: Emerald Teal
    {
      bg: 'from-emerald-950 via-teal-950 to-black',
      border: 'border-teal-500/40',
      badgeBorder: 'border-emerald-500/30',
      shadow: 'shadow-teal-500/10',
      title: 'text-emerald-300',
      subtitle: 'text-teal-400/80',
      badgeBg: 'bg-emerald-900/80',
      badgeText: 'text-teal-400',
      numBox: 'bg-emerald-900/10 border-teal-500/20',
      numText: 'text-emerald-200',
      lblText: 'text-teal-400',
      glow: 'bg-teal-500/5',
      accentText: 'text-emerald-400/60'
    },
    // 2: Teal Mint
    {
      bg: 'from-teal-950 via-emerald-950 to-slate-950',
      border: 'border-emerald-400/40',
      badgeBorder: 'border-teal-400/30',
      shadow: 'shadow-emerald-400/10',
      title: 'text-emerald-200',
      subtitle: 'text-teal-300/80',
      badgeBg: 'bg-teal-900/80',
      badgeText: 'text-emerald-300',
      numBox: 'bg-emerald-950 border-emerald-500/20',
      numText: 'text-teal-300',
      lblText: 'text-emerald-400',
      glow: 'bg-emerald-400/5',
      accentText: 'text-teal-300/60'
    },
    // 3: Teal Deep
    {
      bg: 'from-[#012224] via-teal-950 to-black',
      border: 'border-teal-500/40',
      badgeBorder: 'border-teal-500/30',
      shadow: 'shadow-teal-500/10',
      title: 'text-teal-300',
      subtitle: 'text-teal-400/80',
      badgeBg: 'bg-[#012224]/80',
      badgeText: 'text-teal-400',
      numBox: 'bg-teal-900/10 border-teal-500/20',
      numText: 'text-teal-300',
      lblText: 'text-teal-500',
      glow: 'bg-teal-500/5',
      accentText: 'text-teal-400/60'
    },
    // 4: Teal Cyan
    {
      bg: 'from-[#012224] via-cyan-950 to-slate-950',
      border: 'border-cyan-500/40',
      badgeBorder: 'border-teal-500/30',
      shadow: 'shadow-cyan-500/10',
      title: 'text-teal-200',
      subtitle: 'text-cyan-350/80',
      badgeBg: 'bg-cyan-950/80',
      badgeText: 'text-cyan-400',
      numBox: 'bg-cyan-900/10 border-teal-500/20',
      numText: 'text-teal-200',
      lblText: 'text-cyan-400',
      glow: 'bg-cyan-500/5',
      accentText: 'text-teal-400/60'
    },
    // 5: Cyan Light
    {
      bg: 'from-cyan-950 via-[#011d24] to-[#000f14]',
      border: 'border-cyan-400/40',
      badgeBorder: 'border-cyan-400/30',
      shadow: 'shadow-cyan-400/10',
      title: 'text-cyan-200',
      subtitle: 'text-cyan-300/80',
      badgeBg: 'bg-cyan-950/80',
      badgeText: 'text-cyan-400',
      numBox: 'bg-cyan-900/10 border-cyan-400/20',
      numText: 'text-cyan-200',
      lblText: 'text-cyan-400',
      glow: 'bg-cyan-400/5',
      accentText: 'text-cyan-300/60'
    },
    // 6: Cyan Sky
    {
      bg: 'from-cyan-950 via-sky-950 to-black',
      border: 'border-sky-500/40',
      badgeBorder: 'border-cyan-500/30',
      shadow: 'shadow-sky-500/10',
      title: 'text-cyan-300',
      subtitle: 'text-sky-400/80',
      badgeBg: 'bg-sky-950/80',
      badgeText: 'text-sky-400',
      numBox: 'bg-sky-900/10 border-cyan-500/20',
      numText: 'text-cyan-200',
      lblText: 'text-sky-400',
      glow: 'bg-sky-500/5',
      accentText: 'text-cyan-400/60'
    },
    // 7: Sky Light
    {
      bg: 'from-sky-950 via-[#011b29] to-[#000e17]',
      border: 'border-sky-400/40',
      badgeBorder: 'border-sky-400/30',
      shadow: 'shadow-sky-400/10',
      title: 'text-sky-200',
      subtitle: 'text-sky-300/80',
      badgeBg: 'bg-sky-950/80',
      badgeText: 'text-sky-400',
      numBox: 'bg-sky-900/10 border-sky-400/20',
      numText: 'text-sky-200',
      lblText: 'text-sky-400',
      glow: 'bg-sky-400/5',
      accentText: 'text-sky-300/60'
    },
    // 8: Sky Blue
    {
      bg: 'from-sky-950 via-blue-950 to-black',
      border: 'border-blue-500/40',
      badgeBorder: 'border-sky-500/30',
      shadow: 'shadow-blue-500/10',
      title: 'text-sky-300',
      subtitle: 'text-blue-400/80',
      badgeBg: 'bg-blue-950/80',
      badgeText: 'text-blue-400',
      numBox: 'bg-blue-900/10 border-sky-500/20',
      numText: 'text-sky-200',
      lblText: 'text-blue-400',
      glow: 'bg-blue-500/5',
      accentText: 'text-sky-400/60'
    },
    // 9: Blue Pure
    {
      bg: 'from-blue-950 via-[#011429] to-[#000a14]',
      border: 'border-blue-500/40',
      badgeBorder: 'border-blue-500/30',
      shadow: 'shadow-blue-500/10',
      title: 'text-blue-300',
      subtitle: 'text-blue-400/80',
      badgeBg: 'bg-blue-950/80',
      badgeText: 'text-blue-400',
      numBox: 'bg-blue-900/10 border-blue-500/20',
      numText: 'text-blue-300',
      lblText: 'text-blue-500',
      glow: 'bg-blue-500/5',
      accentText: 'text-blue-400/60'
    },
    // 10: Blue Indigo
    {
      bg: 'from-blue-950 via-indigo-950 to-slate-950',
      border: 'border-indigo-500/40',
      badgeBorder: 'border-blue-500/30',
      shadow: 'shadow-indigo-500/10',
      title: 'text-blue-200',
      subtitle: 'text-indigo-400/80',
      badgeBg: 'bg-indigo-950/80',
      badgeText: 'text-indigo-400',
      numBox: 'bg-indigo-900/10 border-blue-500/20',
      numText: 'text-blue-200',
      lblText: 'text-indigo-400',
      glow: 'bg-indigo-500/5',
      accentText: 'text-blue-400/60'
    },
    // 11: Indigo Royal
    {
      bg: 'from-indigo-950 via-[#0a0f2b] to-[#030614]',
      border: 'border-indigo-400/40',
      badgeBorder: 'border-indigo-400/30',
      shadow: 'shadow-indigo-400/10',
      title: 'text-indigo-200',
      subtitle: 'text-indigo-300/80',
      badgeBg: 'bg-indigo-950/80',
      badgeText: 'text-indigo-400',
      numBox: 'bg-indigo-900/10 border-indigo-400/20',
      numText: 'text-indigo-200',
      lblText: 'text-indigo-400',
      glow: 'bg-indigo-400/5',
      accentText: 'text-indigo-300/60'
    },
    // 12: Indigo Violet
    {
      bg: 'from-indigo-950 via-violet-950 to-black',
      border: 'border-violet-500/40',
      badgeBorder: 'border-indigo-500/30',
      shadow: 'shadow-violet-500/10',
      title: 'text-indigo-300',
      subtitle: 'text-violet-400/80',
      badgeBg: 'bg-violet-950/80',
      badgeText: 'text-violet-400',
      numBox: 'bg-violet-900/10 border-indigo-500/20',
      numText: 'text-indigo-200',
      lblText: 'text-violet-400',
      glow: 'bg-violet-500/5',
      accentText: 'text-indigo-400/60'
    },
    // 13: Violet Deep
    {
      bg: 'from-violet-950 via-[#150124] to-[#0a0014]',
      border: 'border-violet-500/40',
      badgeBorder: 'border-violet-500/30',
      shadow: 'shadow-violet-500/10',
      title: 'text-violet-300',
      subtitle: 'text-violet-400/80',
      badgeBg: 'bg-violet-950/80',
      badgeText: 'text-violet-400',
      numBox: 'bg-violet-900/10 border-violet-500/20',
      numText: 'text-violet-300',
      lblText: 'text-violet-500',
      glow: 'bg-violet-500/5',
      accentText: 'text-violet-400/60'
    },
    // 14: Violet Purple
    {
      bg: 'from-violet-950 via-purple-950 to-slate-950',
      border: 'border-purple-500/40',
      badgeBorder: 'border-violet-500/30',
      shadow: 'shadow-purple-500/10',
      title: 'text-violet-200',
      subtitle: 'text-purple-400/80',
      badgeBg: 'bg-purple-950/80',
      badgeText: 'text-purple-400',
      numBox: 'bg-purple-900/10 border-violet-500/20',
      numText: 'text-violet-200',
      lblText: 'text-purple-400',
      glow: 'bg-purple-500/5',
      accentText: 'text-violet-400/60'
    },
    // 15: Purple Royal
    {
      bg: 'from-purple-950 via-[#180126] to-[#0e0017]',
      border: 'border-purple-500/40',
      badgeBorder: 'border-purple-500/30',
      shadow: 'shadow-purple-500/10',
      title: 'text-purple-300',
      subtitle: 'text-purple-400/80',
      badgeBg: 'bg-purple-950/80',
      badgeText: 'text-purple-400',
      numBox: 'bg-purple-900/10 border-purple-500/20',
      numText: 'text-purple-300',
      lblText: 'text-purple-500',
      glow: 'bg-purple-500/5',
      accentText: 'text-purple-400/60'
    },
    // 16: Purple Fuchsia
    {
      bg: 'from-purple-950 via-fuchsia-950 to-black',
      border: 'border-fuchsia-500/40',
      badgeBorder: 'border-purple-500/30',
      shadow: 'shadow-fuchsia-500/10',
      title: 'text-purple-300',
      subtitle: 'text-fuchsia-400/80',
      badgeBg: 'bg-fuchsia-950/80',
      badgeText: 'text-fuchsia-400',
      numBox: 'bg-fuchsia-900/10 border-purple-500/20',
      numText: 'text-purple-200',
      lblText: 'text-fuchsia-400',
      glow: 'bg-fuchsia-500/5',
      accentText: 'text-purple-400/60'
    },
    // 17: Fuchsia Neon
    {
      bg: 'from-fuchsia-950 via-[#260123] to-[#140012]',
      border: 'border-fuchsia-400/40',
      badgeBorder: 'border-fuchsia-400/30',
      shadow: 'shadow-fuchsia-400/10',
      title: 'text-fuchsia-200',
      subtitle: 'text-fuchsia-300/80',
      badgeBg: 'bg-fuchsia-950/80',
      badgeText: 'text-fuchsia-400',
      numBox: 'bg-fuchsia-900/10 border-fuchsia-400/20',
      numText: 'text-fuchsia-200',
      lblText: 'text-fuchsia-400',
      glow: 'bg-fuchsia-400/5',
      accentText: 'text-fuchsia-300/60'
    },
    // 18: Fuchsia Pink
    {
      bg: 'from-fuchsia-950 via-pink-950 to-slate-950',
      border: 'border-pink-500/40',
      badgeBorder: 'border-fuchsia-500/30',
      shadow: 'shadow-pink-500/10',
      title: 'text-fuchsia-200',
      subtitle: 'text-pink-400/80',
      badgeBg: 'bg-pink-950/80',
      badgeText: 'text-pink-400',
      numBox: 'bg-pink-900/10 border-fuchsia-500/20',
      numText: 'text-fuchsia-200',
      lblText: 'text-pink-400',
      glow: 'bg-pink-500/5',
      accentText: 'text-fuchsia-400/60'
    },
    // 19: Pink Pastel
    {
      bg: 'from-pink-950 via-[#290117] to-[#17000d]',
      border: 'border-pink-400/40',
      badgeBorder: 'border-pink-400/30',
      shadow: 'shadow-pink-400/10',
      title: 'text-pink-200',
      subtitle: 'text-pink-300/80',
      badgeBg: 'bg-pink-950/80',
      badgeText: 'text-pink-400',
      numBox: 'bg-pink-900/10 border-pink-400/20',
      numText: 'text-pink-200',
      lblText: 'text-pink-400',
      glow: 'bg-pink-400/5',
      accentText: 'text-pink-300/60'
    },
    // 20: Pink Rose
    {
      bg: 'from-pink-950 via-rose-950 to-black',
      border: 'border-rose-500/40',
      badgeBorder: 'border-pink-500/30',
      shadow: 'shadow-rose-500/10',
      title: 'text-pink-300',
      subtitle: 'text-rose-400/80',
      badgeBg: 'bg-rose-950/80',
      badgeText: 'text-rose-400',
      numBox: 'bg-rose-900/10 border-pink-500/20',
      numText: 'text-pink-200',
      lblText: 'text-rose-400',
      glow: 'bg-rose-500/5',
      accentText: 'text-pink-400/60'
    },
    // 21: Rose Crimson
    {
      bg: 'from-rose-950 via-[#26010d] to-[#170008]',
      border: 'border-rose-500/40',
      badgeBorder: 'border-rose-500/30',
      shadow: 'shadow-rose-500/10',
      title: 'text-rose-300',
      subtitle: 'text-rose-400/80',
      badgeBg: 'bg-rose-950/80',
      badgeText: 'text-rose-400',
      numBox: 'bg-rose-900/10 border-rose-500/20',
      numText: 'text-rose-300',
      lblText: 'text-rose-500',
      glow: 'bg-rose-500/5',
      accentText: 'text-rose-400/60'
    },
    // 22: Rose Red
    {
      bg: 'from-rose-950 via-red-950 to-slate-950',
      border: 'border-red-500/40',
      badgeBorder: 'border-rose-500/30',
      shadow: 'shadow-red-500/10',
      title: 'text-rose-200',
      subtitle: 'text-red-400/80',
      badgeBg: 'bg-red-950/80',
      badgeText: 'text-red-400',
      numBox: 'bg-red-900/10 border-rose-500/20',
      numText: 'text-rose-200',
      lblText: 'text-red-400',
      glow: 'bg-red-500/5',
      accentText: 'text-rose-400/60'
    },
    // 23: Red Scarlet
    {
      bg: 'from-red-950 via-[#240101] to-[#140000]',
      border: 'border-red-400/40',
      badgeBorder: 'border-red-400/30',
      shadow: 'shadow-red-400/10',
      title: 'text-red-200',
      subtitle: 'text-red-300/80',
      badgeBg: 'bg-red-950/80',
      badgeText: 'text-red-400',
      numBox: 'bg-red-900/10 border-red-400/20',
      numText: 'text-red-200',
      lblText: 'text-red-400',
      glow: 'bg-red-400/5',
      accentText: 'text-red-300/60'
    },
    // 24: Red Ruby
    {
      bg: 'from-red-950 via-red-900 to-black',
      border: 'border-red-500/40',
      badgeBorder: 'border-red-500/30',
      shadow: 'shadow-red-500/10',
      title: 'text-red-300',
      subtitle: 'text-red-400/80',
      badgeBg: 'bg-red-950/80',
      badgeText: 'text-red-400',
      numBox: 'bg-red-900/10 border-red-500/20',
      numText: 'text-red-300',
      lblText: 'text-red-500',
      glow: 'bg-red-500/5',
      accentText: 'text-red-400/60'
    },
    // 25: Red Orange
    {
      bg: 'from-red-950 via-orange-950 to-slate-950',
      border: 'border-orange-500/40',
      badgeBorder: 'border-red-500/30',
      shadow: 'shadow-orange-500/10',
      title: 'text-red-200',
      subtitle: 'text-orange-400/80',
      badgeBg: 'bg-orange-950/80',
      badgeText: 'text-orange-400',
      numBox: 'bg-orange-900/10 border-red-500/20',
      numText: 'text-red-200',
      lblText: 'text-orange-400',
      glow: 'bg-orange-500/5',
      accentText: 'text-red-400/60'
    },
    // 26: Orange Sunset
    {
      bg: 'from-orange-950 via-[#261001] to-[#140800]',
      border: 'border-orange-400/40',
      badgeBorder: 'border-orange-400/30',
      shadow: 'shadow-orange-400/10',
      title: 'text-orange-200',
      subtitle: 'text-orange-300/80',
      badgeBg: 'bg-orange-950/80',
      badgeText: 'text-orange-400',
      numBox: 'bg-orange-900/10 border-orange-400/20',
      numText: 'text-orange-200',
      lblText: 'text-orange-400',
      glow: 'bg-orange-400/5',
      accentText: 'text-orange-300/60'
    },
    // 27: Orange Tangerine
    {
      bg: 'from-orange-950 via-orange-900 to-black',
      border: 'border-orange-500/40',
      badgeBorder: 'border-orange-500/30',
      shadow: 'shadow-orange-500/10',
      title: 'text-orange-300',
      subtitle: 'text-orange-400/80',
      badgeBg: 'bg-orange-950/80',
      badgeText: 'text-orange-400',
      numBox: 'bg-orange-900/10 border-orange-500/20',
      numText: 'text-orange-350',
      lblText: 'text-orange-500',
      glow: 'bg-orange-500/5',
      accentText: 'text-orange-400/60'
    },
    // 28: Orange Gold
    {
      bg: 'from-orange-950 via-amber-950 to-slate-950',
      border: 'border-amber-500/40',
      badgeBorder: 'border-orange-500/30',
      shadow: 'shadow-amber-500/10',
      title: 'text-orange-200',
      subtitle: 'text-amber-400/80',
      badgeBg: 'bg-amber-950/80',
      badgeText: 'text-amber-400',
      numBox: 'bg-amber-900/10 border-orange-500/20',
      numText: 'text-orange-200',
      lblText: 'text-amber-400',
      glow: 'bg-amber-500/5',
      accentText: 'text-orange-400/60'
    },
    // 29: Gold Yellow
    {
      bg: 'from-amber-950 via-[#261d01] to-[#140e00]',
      border: 'border-amber-400/40',
      badgeBorder: 'border-amber-400/30',
      shadow: 'shadow-amber-400/10',
      title: 'text-amber-200',
      subtitle: 'text-amber-300/80',
      badgeBg: 'bg-amber-950/80',
      badgeText: 'text-amber-400',
      numBox: 'bg-amber-900/10 border-amber-400/20',
      numText: 'text-amber-200',
      lblText: 'text-amber-400',
      glow: 'bg-amber-400/5',
      accentText: 'text-amber-300/60'
    },
    // 30: Yellow Amber
    {
      bg: 'from-amber-950 via-yellow-950 to-black',
      border: 'border-yellow-500/40',
      badgeBorder: 'border-amber-500/30',
      shadow: 'shadow-yellow-500/10',
      title: 'text-amber-300',
      subtitle: 'text-yellow-400/80',
      badgeBg: 'bg-yellow-950/80',
      badgeText: 'text-yellow-400',
      numBox: 'bg-yellow-900/10 border-amber-500/20',
      numText: 'text-amber-200',
      lblText: 'text-yellow-400',
      glow: 'bg-yellow-500/5',
      accentText: 'text-amber-400/60'
    },
    // 31: Amber Dark
    {
      bg: 'from-amber-950 via-[#241701] to-[#140c00]',
      border: 'border-amber-500/40',
      badgeBorder: 'border-amber-500/30',
      shadow: 'shadow-amber-500/10',
      title: 'text-amber-300',
      subtitle: 'text-amber-400/80',
      badgeBg: 'bg-amber-950/80',
      badgeText: 'text-amber-400',
      numBox: 'bg-amber-900/10 border-amber-500/20',
      numText: 'text-amber-300',
      lblText: 'text-amber-500',
      glow: 'bg-amber-500/5',
      accentText: 'text-amber-400/60'
    },
    // 32: Amber Bronze
    {
      bg: 'from-[#1c1201] via-amber-950 to-slate-950',
      border: 'border-amber-600/40',
      badgeBorder: 'border-amber-500/30',
      shadow: 'shadow-amber-600/10',
      title: 'text-amber-200',
      subtitle: 'text-amber-300/80',
      badgeBg: 'bg-amber-950/80',
      badgeText: 'text-amber-400',
      numBox: 'bg-amber-950 border-amber-600/20',
      numText: 'text-amber-300',
      lblText: 'text-amber-500',
      glow: 'bg-amber-600/5',
      accentText: 'text-amber-400/60'
    },
    // 33: Bronze Orange
    {
      bg: 'from-[#1c1201] via-orange-950 to-black',
      border: 'border-orange-600/40',
      badgeBorder: 'border-amber-600/30',
      shadow: 'shadow-orange-600/10',
      title: 'text-amber-300',
      subtitle: 'text-orange-400/80',
      badgeBg: 'bg-orange-950/80',
      badgeText: 'text-orange-400',
      numBox: 'bg-orange-900/10 border-amber-600/20',
      numText: 'text-amber-200',
      lblText: 'text-orange-400',
      glow: 'bg-orange-600/5',
      accentText: 'text-amber-400/60'
    },
    // 34: Orange Rust
    {
      bg: 'from-orange-950 via-[#1c0801] to-[#0d0400]',
      border: 'border-orange-600/40',
      badgeBorder: 'border-orange-600/30',
      shadow: 'shadow-orange-600/10',
      title: 'text-orange-300',
      subtitle: 'text-orange-400/80',
      badgeBg: 'bg-[#1c0801]/80',
      badgeText: 'text-orange-400',
      numBox: 'bg-[#1c0801] border-orange-600/20',
      numText: 'text-orange-300',
      lblText: 'text-orange-500',
      glow: 'bg-orange-600/5',
      accentText: 'text-orange-400/60'
    },
    // 35: Lime Yellow
    {
      bg: 'from-lime-950 via-yellow-950 to-slate-950',
      border: 'border-lime-500/40',
      badgeBorder: 'border-yellow-500/30',
      shadow: 'shadow-lime-500/10',
      title: 'text-lime-200',
      subtitle: 'text-yellow-400/80',
      badgeBg: 'bg-yellow-950/80',
      badgeText: 'text-yellow-400',
      numBox: 'bg-lime-900/10 border-yellow-500/20',
      numText: 'text-lime-200',
      lblText: 'text-yellow-400',
      glow: 'bg-lime-500/5',
      accentText: 'text-lime-400/60'
    },
    // 36: Lime Neon
    {
      bg: 'from-lime-950 via-[#1d2601] to-[#0f1400]',
      border: 'border-lime-400/40',
      badgeBorder: 'border-lime-400/30',
      shadow: 'shadow-lime-400/10',
      title: 'text-lime-200',
      subtitle: 'text-lime-300/80',
      badgeBg: 'bg-lime-950/80',
      badgeText: 'text-lime-400',
      numBox: 'bg-lime-900/10 border-lime-400/20',
      numText: 'text-lime-200',
      lblText: 'text-lime-400',
      glow: 'bg-lime-400/5',
      accentText: 'text-lime-300/60'
    },
    // 37: Lime Forest
    {
      bg: 'from-lime-950 via-green-950 to-black',
      border: 'border-green-500/40',
      badgeBorder: 'border-lime-500/30',
      shadow: 'shadow-green-500/10',
      title: 'text-lime-300',
      subtitle: 'text-green-400/80',
      badgeBg: 'bg-green-950/80',
      badgeText: 'text-green-400',
      numBox: 'bg-green-900/10 border-lime-500/20',
      numText: 'text-lime-200',
      lblText: 'text-green-400',
      glow: 'bg-green-500/5',
      accentText: 'text-lime-400/60'
    },
    // 38: Forest Green
    {
      bg: 'from-green-950 via-[#0a2601] to-[#051400]',
      border: 'border-green-500/40',
      badgeBorder: 'border-green-500/30',
      shadow: 'shadow-green-500/10',
      title: 'text-green-300',
      subtitle: 'text-green-400/80',
      badgeBg: 'bg-green-950/80',
      badgeText: 'text-green-400',
      numBox: 'bg-green-900/10 border-green-500/20',
      numText: 'text-green-300',
      lblText: 'text-green-500',
      glow: 'bg-green-500/5',
      accentText: 'text-green-400/60'
    },
    // 39: Green Emerald
    {
      bg: 'from-green-950 via-emerald-950 to-slate-950',
      border: 'border-emerald-500/40',
      badgeBorder: 'border-green-500/30',
      shadow: 'shadow-emerald-500/10',
      title: 'text-green-200',
      subtitle: 'text-emerald-400/80',
      badgeBg: 'bg-emerald-950/80',
      badgeText: 'text-emerald-400',
      numBox: 'bg-emerald-900/10 border-green-500/20',
      numText: 'text-green-200',
      lblText: 'text-emerald-400',
      glow: 'bg-emerald-500/5',
      accentText: 'text-green-400/60'
    },
    // 40: Emerald Sea
    {
      bg: 'from-emerald-950 via-teal-900 to-black',
      border: 'border-emerald-500/40',
      badgeBorder: 'border-emerald-500/30',
      shadow: 'shadow-emerald-500/10',
      title: 'text-emerald-300',
      subtitle: 'text-teal-400/80',
      badgeBg: 'bg-emerald-950/80',
      badgeText: 'text-emerald-400',
      numBox: 'bg-[#01251a] border-emerald-500/20',
      numText: 'text-emerald-300',
      lblText: 'text-emerald-500',
      glow: 'bg-emerald-500/5',
      accentText: 'text-emerald-400/60'
    },
    // 41: Teal Ocean
    {
      bg: 'from-teal-950 via-blue-900 to-[#000814]',
      border: 'border-teal-500/40',
      badgeBorder: 'border-teal-500/30',
      shadow: 'shadow-teal-500/10',
      title: 'text-teal-300',
      subtitle: 'text-blue-400/80',
      badgeBg: 'bg-teal-950/80',
      badgeText: 'text-teal-400',
      numBox: 'bg-teal-900/10 border-teal-500/20',
      numText: 'text-teal-300',
      lblText: 'text-teal-500',
      glow: 'bg-teal-500/5',
      accentText: 'text-teal-400/60'
    },
    // 42: Blue Lagoon
    {
      bg: 'from-blue-950 via-cyan-900 to-slate-950',
      border: 'border-cyan-500/40',
      badgeBorder: 'border-blue-500/30',
      shadow: 'shadow-cyan-500/10',
      title: 'text-blue-200',
      subtitle: 'text-cyan-400/80',
      badgeBg: 'bg-cyan-950/80',
      badgeText: 'text-cyan-400',
      numBox: 'bg-cyan-900/10 border-blue-500/20',
      numText: 'text-blue-200',
      lblText: 'text-cyan-400',
      glow: 'bg-cyan-500/5',
      accentText: 'text-blue-400/60'
    },
    // 43: Indigo Dusk
    {
      bg: 'from-indigo-950 via-purple-900 to-[#0c0017]',
      border: 'border-indigo-500/40',
      badgeBorder: 'border-indigo-500/30',
      shadow: 'shadow-indigo-500/10',
      title: 'text-indigo-300',
      subtitle: 'text-purple-400/80',
      badgeBg: 'bg-indigo-950/80',
      badgeText: 'text-indigo-400',
      numBox: 'bg-indigo-900/10 border-indigo-500/20',
      numText: 'text-indigo-300',
      lblText: 'text-indigo-500',
      glow: 'bg-indigo-500/5',
      accentText: 'text-indigo-400/60'
    },
    // 44: Purple Dawn
    {
      bg: 'from-purple-950 via-rose-900 to-[#170008]',
      border: 'border-purple-500/40',
      badgeBorder: 'border-purple-500/30',
      shadow: 'shadow-purple-500/10',
      title: 'text-purple-300',
      subtitle: 'text-rose-400/80',
      badgeBg: 'bg-purple-950/80',
      badgeText: 'text-purple-400',
      numBox: 'bg-purple-900/10 border-purple-500/20',
      numText: 'text-purple-300',
      lblText: 'text-purple-500',
      glow: 'bg-purple-500/5',
      accentText: 'text-purple-400/60'
    },
    // 45: Pink Orchid
    {
      bg: 'from-pink-950 via-fuchsia-900 to-black',
      border: 'border-fuchsia-500/40',
      badgeBorder: 'border-pink-500/30',
      shadow: 'shadow-fuchsia-500/10',
      title: 'text-pink-300',
      subtitle: 'text-fuchsia-400/80',
      badgeBg: 'bg-pink-950/80',
      badgeText: 'text-pink-400',
      numBox: 'bg-pink-900/10 border-fuchsia-500/20',
      numText: 'text-pink-200',
      lblText: 'text-fuchsia-400',
      glow: 'bg-fuchsia-500/5',
      accentText: 'text-pink-400/60'
    },
    // 46: Rose Quartz
    {
      bg: 'from-rose-950 via-purple-900 to-slate-950',
      border: 'border-rose-500/40',
      badgeBorder: 'border-rose-500/30',
      shadow: 'shadow-rose-500/10',
      title: 'text-rose-200',
      subtitle: 'text-purple-400/80',
      badgeBg: 'bg-rose-950/80',
      badgeText: 'text-rose-400',
      numBox: 'bg-rose-900/10 border-rose-500/20',
      numText: 'text-rose-200',
      lblText: 'text-purple-400',
      glow: 'bg-rose-500/5',
      accentText: 'text-rose-400/60'
    },
    // 47: Red Mahogany
    {
      bg: 'from-red-950 via-amber-900 to-black',
      border: 'border-red-500/40',
      badgeBorder: 'border-red-500/30',
      shadow: 'shadow-red-500/10',
      title: 'text-red-300',
      subtitle: 'text-amber-400/80',
      badgeBg: 'bg-red-950/80',
      badgeText: 'text-red-400',
      numBox: 'bg-red-900/10 border-red-500/20',
      numText: 'text-red-350',
      lblText: 'text-amber-500',
      glow: 'bg-amber-500/5',
      accentText: 'text-red-400/60'
    },
    // 48: Orange Terracotta
    {
      bg: 'from-orange-950 via-red-900 to-[#140000]',
      border: 'border-orange-500/40',
      badgeBorder: 'border-orange-500/30',
      shadow: 'shadow-orange-500/10',
      title: 'text-orange-300',
      subtitle: 'text-red-400/80',
      badgeBg: 'bg-orange-950/80',
      badgeText: 'text-orange-400',
      numBox: 'bg-orange-900/10 border-orange-500/20',
      numText: 'text-orange-300',
      lblText: 'text-red-500',
      glow: 'bg-red-500/5',
      accentText: 'text-orange-400/60'
    },
    // 49: Amber Honey
    {
      bg: 'from-amber-950 via-orange-900 to-black',
      border: 'border-amber-500/40',
      badgeBorder: 'border-amber-500/30',
      shadow: 'shadow-amber-500/10',
      title: 'text-amber-300',
      subtitle: 'text-orange-400/80',
      badgeBg: 'bg-amber-950/80',
      badgeText: 'text-amber-400',
      numBox: 'bg-amber-900/10 border-amber-500/20',
      numText: 'text-amber-300',
      lblText: 'text-orange-500',
      glow: 'bg-orange-500/5',
      accentText: 'text-amber-400/60'
    },
    // 50: Yellow Sand
    {
      bg: 'from-amber-950 via-yellow-900 to-[#141200]',
      border: 'border-yellow-500/40',
      badgeBorder: 'border-amber-500/30',
      shadow: 'shadow-yellow-500/10',
      title: 'text-amber-350',
      subtitle: 'text-yellow-400/80',
      badgeBg: 'bg-yellow-950/80',
      badgeText: 'text-yellow-400',
      numBox: 'bg-yellow-900/10 border-amber-500/20',
      numText: 'text-yellow-300',
      lblText: 'text-yellow-500',
      glow: 'bg-yellow-500/5',
      accentText: 'text-amber-400/60'
    },
    // 51: Lime Olive
    {
      bg: 'from-lime-950 via-[#1a2102] to-black',
      border: 'border-lime-500/40',
      badgeBorder: 'border-lime-500/30',
      shadow: 'shadow-lime-500/10',
      title: 'text-lime-300',
      subtitle: 'text-lime-400/80',
      badgeBg: 'bg-lime-950/80',
      badgeText: 'text-lime-400',
      numBox: 'bg-lime-900/10 border-lime-500/20',
      numText: 'text-lime-300',
      lblText: 'text-lime-500',
      glow: 'bg-lime-500/5',
      accentText: 'text-lime-400/60'
    },
    // 52: Green Jade
    {
      bg: 'from-green-950 via-emerald-900 to-slate-[#021c0b]',
      border: 'border-green-500/40',
      badgeBorder: 'border-green-500/30',
      shadow: 'shadow-green-500/10',
      title: 'text-green-200',
      subtitle: 'text-emerald-400/80',
      badgeBg: 'bg-green-950/80',
      badgeText: 'text-green-400',
      numBox: 'bg-green-900/10 border-green-500/20',
      numText: 'text-green-200',
      lblText: 'text-emerald-400',
      glow: 'bg-green-500/5',
      accentText: 'text-green-400/60'
    },
    // 53: Emerald Malachite
    {
      bg: 'from-emerald-950 via-green-900 to-black',
      border: 'border-emerald-500/40',
      badgeBorder: 'border-emerald-500/30',
      shadow: 'shadow-emerald-500/10',
      title: 'text-emerald-300',
      subtitle: 'text-green-400/80',
      badgeBg: 'bg-emerald-950/80',
      badgeText: 'text-emerald-400',
      numBox: 'bg-emerald-900/10 border-emerald-500/20',
      numText: 'text-emerald-300',
      lblText: 'text-green-500',
      glow: 'bg-emerald-500/5',
      accentText: 'text-emerald-400/60'
    },
    // 54: Teal Turquoise
    {
      bg: 'from-teal-950 via-emerald-900 to-[#011a1c]',
      border: 'border-teal-500/40',
      badgeBorder: 'border-teal-500/30',
      shadow: 'shadow-teal-500/10',
      title: 'text-teal-300',
      subtitle: 'text-emerald-400/80',
      badgeBg: 'bg-teal-950/80',
      badgeText: 'text-teal-400',
      numBox: 'bg-teal-900/10 border-teal-500/20',
      numText: 'text-teal-300',
      lblText: 'text-emerald-500',
      glow: 'bg-teal-500/5',
      accentText: 'text-teal-400/60'
    },
    // 55: Cyan Cerulean
    {
      bg: 'from-cyan-950 via-blue-900 to-black',
      border: 'border-cyan-500/40',
      badgeBorder: 'border-cyan-500/30',
      shadow: 'shadow-cyan-500/10',
      title: 'text-cyan-300',
      subtitle: 'text-blue-400/80',
      badgeBg: 'bg-cyan-950/80',
      badgeText: 'text-cyan-400',
      numBox: 'bg-cyan-900/10 border-cyan-500/20',
      numText: 'text-cyan-300',
      lblText: 'text-blue-500',
      glow: 'bg-blue-500/5',
      accentText: 'text-cyan-400/60'
    },
    // 56: Sky Azure
    {
      bg: 'from-sky-950 via-[#011f3d] to-[#000f1f]',
      border: 'border-sky-400/40',
      badgeBorder: 'border-sky-400/30',
      shadow: 'shadow-sky-400/10',
      title: 'text-sky-200',
      subtitle: 'text-sky-300/80',
      badgeBg: 'bg-sky-950/80',
      badgeText: 'text-sky-400',
      numBox: 'bg-sky-900/10 border-sky-400/20',
      numText: 'text-sky-200',
      lblText: 'text-sky-400',
      glow: 'bg-sky-400/5',
      accentText: 'text-sky-300/60'
    },
    // 57: Blue Sapphire
    {
      bg: 'from-blue-950 via-indigo-900 to-[#000a1f]',
      border: 'border-blue-500/40',
      badgeBorder: 'border-blue-500/30',
      shadow: 'shadow-blue-500/10',
      title: 'text-blue-300',
      subtitle: 'text-indigo-400/80',
      badgeBg: 'bg-blue-950/80',
      badgeText: 'text-blue-400',
      numBox: 'bg-blue-900/10 border-blue-500/20',
      numText: 'text-blue-300',
      lblText: 'text-indigo-500',
      glow: 'bg-indigo-500/5',
      accentText: 'text-blue-400/60'
    },
    // 58: Indigo Navy
    {
      bg: 'from-indigo-950 via-slate-900 to-black',
      border: 'border-indigo-500/40',
      badgeBorder: 'border-indigo-500/30',
      shadow: 'shadow-indigo-500/10',
      title: 'text-indigo-300',
      subtitle: 'text-slate-400/80',
      badgeBg: 'bg-indigo-950/80',
      badgeText: 'text-indigo-400',
      numBox: 'bg-indigo-900/10 border-indigo-500/20',
      numText: 'text-indigo-200',
      lblText: 'text-slate-450',
      glow: 'bg-indigo-500/5',
      accentText: 'text-indigo-400/60'
    },
    // 59: Purple Amethyst
    {
      bg: 'from-purple-950 via-violet-900 to-[#12001c]',
      border: 'border-purple-500/40',
      badgeBorder: 'border-purple-500/30',
      shadow: 'shadow-purple-500/10',
      title: 'text-purple-300',
      subtitle: 'text-violet-400/80',
      badgeBg: 'bg-purple-950/80',
      badgeText: 'text-purple-400',
      numBox: 'bg-purple-900/10 border-purple-500/20',
      numText: 'text-purple-350',
      lblText: 'text-violet-500',
      glow: 'bg-violet-500/5',
      accentText: 'text-purple-400/60'
    }
  ];

  const activeTheme = colorThemes[timeLeft.seconds % colorThemes.length];

  // Calculate dynamic countdown to Edifice Conference (October 1st, 2026, 9:00 AM)
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      // Target: October 1st, 2026 at 9:00 AM local time
      const targetDate = new Date('2026-10-01T09:00:00');
      
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      let days = Math.floor(difference / (1000 * 60 * 60 * 24));
      let hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      let minutes = Math.floor((difference / 1000 / 60) % 60);
      let seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAlreadyRegistered = userRegistrations?.find(r => r.eventId === 'edifice-conference-2026');

  const handleQuickSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!firstName.trim()) {
      setValidationError('Please enter your first name.');
      return;
    }
    if (!surname.trim()) {
      setValidationError('Please enter your surname.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setQuickSubmitting(true);
    try {
      if (onStartRegistration) {
        onStartRegistration(firstName.trim(), surname.trim(), email.trim());
      } else {
        onNavigate('meetings');
      }
      setFirstName('');
      setSurname('');
      setEmail('');
    } catch (err) {
      setValidationError('Failed to start registration. Please try again.');
    } finally {
      setQuickSubmitting(false);
    }
  };

  return (
    <div className="relative bg-[#040814]" id="hero-section">
      {/* Background Graphic Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cci-blue-800/40 via-[#040814] to-[#040814] z-0" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-cci-gold-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-cci-blue-700/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 lg:pt-16 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Slogan and Text (Left Column) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6"
            >
              To See All Men <span className="bg-gradient-to-r from-cci-gold-300 via-cci-gold-400 to-cci-gold-600 bg-clip-text text-transparent">Saved</span> And Come To The Knowledge Of Truth.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-10 font-sans"
            >
              Welcome to <strong className="text-white font-medium">God's Edifice Church</strong>, where we are committed to progress, joy in the faith, and systematic exposition of the Scriptures. Discover the power of prayer, apostolic fellowship, and Christ-centered worship.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <button
                onClick={() => {
                  const element = document.getElementById('hero-countdown-panel');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onNavigate('meetings');
                  }
                }}
                className="px-8 py-4 rounded-xl font-display font-bold text-sm tracking-wide bg-gradient-to-r from-cci-gold-600 to-cci-gold-400 hover:from-cci-gold-500 hover:to-cci-gold-300 text-[#040814] flex items-center justify-center gap-2 shadow-lg shadow-cci-gold-600/10 hover:shadow-cci-gold-600/25 transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
                id="hero-register-btn"
              >
                <Calendar className="h-4 w-4" />
                Register for Meetings
              </button>
            </motion.div>
          </div>

          {/* Countdown & Highlight Panel (Right Column) */}
          <div className="lg:col-span-5 w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`relative rounded-3xl bg-gradient-to-br ${activeTheme.bg} border-2 ${activeTheme.border} p-6 sm:p-10 shadow-2xl ${activeTheme.shadow} overflow-hidden transition-all duration-1000 flex flex-col items-center justify-center min-h-[340px]`}
              id="hero-countdown-panel"
            >
              {/* Subtle background glow */}
              <div className={`absolute top-0 right-0 w-48 h-48 ${activeTheme.glow} rounded-full blur-3xl pointer-events-none transition-all duration-1000`} />

              {/* Dynamic Next Meeting Countdown */}
              <div className="text-center w-full space-y-6">
                <div className="space-y-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${activeTheme.badgeBg} border ${activeTheme.badgeBorder} ${activeTheme.badgeText} rounded-full text-[10px] font-mono uppercase font-bold tracking-wider transition-all duration-1000`}>
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span>Countdown</span>
                  </span>
                  <h3 className={`font-display text-2xl sm:text-3xl font-black ${activeTheme.title} tracking-tight transition-all duration-1000`}>
                    Edifice Conference 2026
                  </h3>
                  <p className={`text-xs ${activeTheme.subtitle} font-semibold transition-all duration-1000`}>
                    October 1st - 4th, 2026 | GEC Lekki HQ
                  </p>
                </div>

                {/* Countdown Grid with theme colors changing every second */}
                <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
                  {[
                    { label: 'Days', value: timeLeft.days },
                    { label: 'Hours', value: timeLeft.hours },
                    { label: 'Minutes', value: timeLeft.minutes },
                    { label: 'Seconds', value: timeLeft.seconds, isSecs: true }
                  ].map((item, i) => (
                    <div 
                      key={i} 
                      className={`flex flex-col items-center justify-center ${activeTheme.numBox} border rounded-2xl py-4 px-2 transition-all duration-1000 shadow-md`}
                    >
                      <span className={`block font-mono text-2xl sm:text-3xl font-black ${activeTheme.numText} leading-none ${item.isSecs ? 'animate-pulse' : ''}`}>
                        {String(item.value).padStart(2, '0')}
                      </span>
                      <span className={`text-[9px] uppercase tracking-wider ${activeTheme.lblText} font-mono mt-2 block font-extrabold`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
                
                <p className={`text-[11px] ${activeTheme.accentText} font-mono font-semibold max-w-xs mx-auto leading-relaxed`}>
                  Experience systematic theology, spiritual alignment, and apostolic power.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Info Bento Grid at Bottom */}
        <div className="mt-20 lg:mt-28 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 rounded-2xl bg-cci-blue-900/40 border border-cci-blue-800/50 hover:border-cci-gold-500/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-cci-blue-800/80 flex items-center justify-center text-cci-gold-400 mb-4 group-hover:bg-cci-gold-500 group-hover:text-[#040814] transition-all">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-base text-white mb-2">Our Vision</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We believe in the infallible authority of the Scriptures, the glorious gospel of the grace of God, and the dynamic operations of the Holy Ghost in the believer.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-2xl bg-cci-blue-900/40 border border-cci-blue-800/50 hover:border-cci-gold-500/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-cci-blue-800/80 flex items-center justify-center text-cci-gold-400 mb-4 group-hover:bg-cci-gold-500 group-hover:text-[#040814] transition-all">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-base text-white mb-2">Our Mission</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We hold high the value of systematic discipleship, encouraging prayerful discipline, daily theological Bible study, and evangelistic boldness across all generations.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
