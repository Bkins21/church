import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export default function AdminLogin({ onLoginSuccess, onNavigateHome }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect straight to admin
  useEffect(() => {
    if (localStorage.getItem('gec_admin_authenticated') === 'true') {
      onLoginSuccess();
      return;
    }
    if (!isSupabaseConfigured || !supabase) return;
    
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          localStorage.setItem('gec_admin_authenticated', 'true');
          onLoginSuccess();
        }
      }).catch(err => {
        console.warn('Supabase session error:', err);
      });
    } catch (err) {
      console.warn('Supabase getSession exception:', err);
    }
  }, [onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const isExplicitAdmin = email.trim().toLowerCase() === 'boluakintola@gmail.com' && password === 'crosswordmedia2026';

    if (isExplicitAdmin) {
      localStorage.setItem('gec_admin_authenticated', 'true');
      onLoginSuccess();
      setLoading(false);
      return;
    }

    try {
      if (!isSupabaseConfigured || !supabase) {
        setError('Supabase is not configured yet. Please configure the environment variables.');
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data?.session) {
        localStorage.setItem('gec_admin_authenticated', 'true');
        onLoginSuccess();
      } else {
        throw new Error('Authentication succeeded but no session was established.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1013] text-soft-white flex flex-col justify-center items-center px-4 relative overflow-hidden" id="admin-login-page">
      {/* Premium Ambient Background Glows */}
      <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-royal-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-[400px] h-[400px] bg-electric-blue/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-10 w-[300px] h-[300px] bg-royal-blue/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-charcoal/40 border border-midnight-blue/80 rounded-3xl p-8 sm:p-10 backdrop-blur-xl shadow-2xl relative z-10"
        id="login-card-container"
      >
        {/* Church Logo & Branding at the top */}
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={onNavigateHome}
            className="w-16 h-16 text-white cursor-pointer flex items-center justify-center bg-midnight-blue/50 border border-royal-blue/20 rounded-2xl p-2.5 shadow-lg transition-all"
            id="login-logo-wrapper"
          >
            <svg viewBox="920 620 650 750" className="w-full h-full text-white" fill="currentColor">
              <path d="M1085.557,1321.922l25.142,0l0,-490.404l-31.046,22.771l5.904,467.633Zm49.213,24.071l-72.983,0l-6.358,-503.792l79.342,-58.183l0,561.975Z" />
              <path d="M1395.037,1321.922l25.146,0l5.9,-467.633l-31.046,-22.771l0,490.404Zm48.908,24.071l-72.979,0l0,-561.975l79.342,58.183l-6.362,503.792Z" />
              <path d="M1354.935,1345.993l-201.308,0l0,-596.846l97.483,-107.225l103.825,103.825l0,528.496l-119.129,0l0,-454.513l24.071,0l0,430.442l70.987,0l0,-494.454l-78.925,-78.925l-74.242,81.658l0,563.471l153.167,0l0,-24.763l24.071,0l0,48.833Z" />
              <path d="M1545.665,1345.993l-79.267,0l0,-476.475l79.267,102.167l0,55.025l-24.071,0l0,-46.783l-31.125,-40.112l0,382.108l31.125,0l0,-211.196l24.071,0l0,235.267Z" />
              <path d="M1036.645,1345.993l-93.983,0l0,-324.713l93.983,-49.462l0,65.929l-24.071,0l0,-26.058l-45.842,24.125l0,286.108l45.842,0l0,-234.5l24.071,0l0,258.571Z" />
            </svg>
          </motion.div>
          
          <h2 className="font-display font-black text-xl tracking-wider text-white uppercase mt-4" id="login-church-name">
            God's Edifice Church
          </h2>
          <p className="text-[10px] font-mono tracking-widest text-electric-blue uppercase mt-1">
            Media Administration
          </p>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-church text-center text-white" id="login-heading">
            Admin Login
          </h1>
          <p className="text-xs text-light-gray text-center mt-1.5">
            Authenticate to access the administrative dashboard.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" id="admin-login-form">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-light-gray">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-light-gray">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gacedifice.com"
                className="w-full bg-rich-black/95 border border-midnight-blue focus:border-royal-blue rounded-2xl py-3.5 pl-11 pr-4 text-xs text-white placeholder-medium-gray focus:outline-none transition-all duration-200"
                id="login-email-input"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-light-gray">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-light-gray">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-rich-black/95 border border-midnight-blue focus:border-royal-blue rounded-2xl py-3.5 pl-11 pr-11 text-xs text-white placeholder-medium-gray focus:outline-none transition-all duration-200"
                id="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-light-gray hover:text-white transition-colors cursor-pointer"
                id="login-toggle-password"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-red-400 font-mono"
              id="login-error-display"
            >
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </motion.div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-royal-blue to-electric-blue hover:from-electric-blue hover:to-royal-blue font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 text-white disabled:opacity-50 shadow-lg shadow-royal-blue/20 cursor-pointer"
            id="login-submit-button"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <button
            onClick={onNavigateHome}
            className="text-[11px] text-light-gray hover:text-white transition-colors font-mono uppercase tracking-widest cursor-pointer"
            id="login-back-home-button"
          >
            ← Back to Website
          </button>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <p className="absolute bottom-6 text-[10px] font-mono tracking-widest text-medium-gray text-center select-none">
        © {new Date().getFullYear()} GOD'S EDIFICE CHURCH. COVENANT PORTAL.
      </p>
    </div>
  );
}
