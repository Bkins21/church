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
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate actual active Supabase session on mount
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    
    try {
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        if (session?.user) {
          localStorage.setItem('gec_admin_authenticated', 'true');
          onLoginSuccess();
        } else {
          localStorage.removeItem('gec_admin_authenticated');
        }
      }).catch((err: any) => {
        console.warn('Supabase session check error:', err);
        localStorage.removeItem('gec_admin_authenticated');
      });
    } catch (err) {
      console.warn('Supabase getSession exception:', err);
      localStorage.removeItem('gec_admin_authenticated');
    }
  }, [onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        setError('Supabase is not configured yet. Please configure the environment variables.');
        return;
      }

      const cleanEmail = email.trim().toLowerCase();

      if (authMode === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (authError) {
          throw authError;
        }

        if (data?.session) {
          localStorage.setItem('gec_admin_authenticated', 'true');
          onLoginSuccess();
        } else {
          throw new Error('Authentication succeeded but no active session was established.');
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data?.session) {
          localStorage.setItem('gec_admin_authenticated', 'true');
          onLoginSuccess();
        } else {
          setSuccessMessage('Account created successfully! You can now sign in with your credentials.');
          setAuthMode('login');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col justify-center items-center px-4 relative overflow-hidden" id="admin-login-page">
      {/* Subtle Background Glows */}
      <div className="absolute -top-[250px] left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-10 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#131B2E] border-2 border-[#2A3756] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10"
        id="login-card-container"
      >
        {/* Church Logo & Branding at the top */}
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={onNavigateHome}
            className="w-16 h-16 text-white cursor-pointer flex items-center justify-center bg-[#1E293B] border border-[#38BDF8]/40 rounded-2xl p-2.5 shadow-lg transition-all"
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
          <p className="text-xs font-mono font-bold tracking-widest text-[#38BDF8] uppercase mt-1">
            Media Administration
          </p>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-church text-center text-white" id="login-heading">
            Admin Portal Access
          </h1>
          <p className="text-sm font-medium text-[#CBD5E1] text-center mt-1.5">
            Authenticate to access live registrations, media uploads, and analytics.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" id="admin-login-form">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#E2E8F0] font-semibold">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gacedifice.com"
                className="w-full bg-[#0A0E1A] border-2 border-[#2A3756] focus:border-[#38BDF8] rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder-[#64748B] focus:outline-none transition-all duration-200"
                id="login-email-input"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#E2E8F0] font-semibold">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0A0E1A] border-2 border-[#2A3756] focus:border-[#38BDF8] rounded-2xl py-3.5 pl-11 pr-11 text-sm font-medium text-white placeholder-[#64748B] focus:outline-none transition-all duration-200"
                id="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                id="login-toggle-password"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Success Message Display */}
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-emerald-950/80 border-2 border-emerald-500/50 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-200 font-mono font-medium"
              id="login-success-display"
            >
              <span className="leading-relaxed">{successMessage}</span>
            </motion.div>
          )}

          {/* Error Message Display */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-red-950/80 border-2 border-red-500/50 rounded-2xl flex items-start gap-2.5 text-xs text-red-200 font-mono font-medium"
              id="login-error-display"
            >
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-400" />
              <span className="leading-relaxed">{error}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-sky-500 hover:to-blue-600 font-display font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 text-white disabled:opacity-50 shadow-lg shadow-blue-500/25 cursor-pointer"
            id="login-submit-button"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                <span>{authMode === 'login' ? 'Signing In...' : 'Registering Account...'}</span>
              </>
            ) : (
              <span>{authMode === 'login' ? 'Sign In to Admin Portal' : 'Create Admin Account'}</span>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login');
              setError('');
              setSuccessMessage('');
            }}
            className="text-xs text-sky-400 hover:text-sky-300 font-mono transition-colors cursor-pointer"
            id="login-toggle-mode-button"
          >
            {authMode === 'login'
              ? "Don't have an admin auth user yet? Register account"
              : "Already have an admin account? Sign In"}
          </button>
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <button
            onClick={onNavigateHome}
            className="text-xs text-[#CBD5E1] hover:text-white transition-colors font-mono uppercase tracking-widest cursor-pointer font-semibold"
            id="login-back-home-button"
          >
            ← Back to Website
          </button>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <p className="absolute bottom-6 text-xs font-mono tracking-widest text-[#94A3B8] text-center select-none">
        © {new Date().getFullYear()} GOD'S EDIFICE CHURCH • MEDIA ADMINISTRATION
      </p>
    </div>
  );
}
