import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, CheckCircle, ArrowRight, Loader2, Bell } from 'lucide-react';
import { supabase } from '../supabase';
import { Subscriber } from '../types';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const subscriberId = `sub-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const subscriberData: Subscriber = {
      id: subscriberId,
      email: email.trim().toLowerCase(),
      subscribedAt: new Date().toISOString(),
    };

    try {
      if (!supabase) {
        throw new Error('Supabase client is not connected.');
      }
      const { error } = await supabase
        .from('subscribers')
        .insert([{
          id: subscriberId,
          email: email.trim().toLowerCase(),
          subscribed_at: subscriberData.subscribedAt
        }]);
      if (error) throw error;
      setIsSuccess(true);
      setEmail('');
    } catch (err: any) {
      console.error('Failed to subscribe to Supabase:', err);
      setErrorMsg(err.message || 'Failed to subscribe. Please verify database connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-[#F7F5F0] relative overflow-hidden" id="newsletter-section">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#A36B3B]/5 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-white border border-[#E4DCD0] rounded-3xl p-8 sm:p-12 md:p-16 text-center shadow-xl shadow-stone-900/5 relative overflow-hidden">
          {/* Subtle top badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EBE1] border border-[#E4DCD0] text-[#A36B3B] font-mono text-[10px] uppercase tracking-widest mb-6 font-semibold">
            <Bell className="h-3 w-3 text-[#A36B3B]" />
            <span>STAY EDIFIED</span>
          </div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="subscription-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#141416] tracking-tight">
                  Subscribe to GEC Updates & Publications
                </h2>
                <p className="text-xs sm:text-sm text-[#54575E] mt-3 max-w-lg mx-auto leading-relaxed">
                  Join our global fellowship of believers. Get systematic theology resources, midweek/Sunday service bulletins, download alerts, and quarterly spiritual publications delivered straight to your inbox.
                </p>

                <form onSubmit={handleSubscribe} className="mt-8 max-w-md mx-auto relative">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8E96]" />
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        className="w-full bg-[#F7F5F0] border border-[#E4DCD0] rounded-xl pl-10 pr-4 py-3 text-xs text-[#141416] placeholder-[#8A8E96] focus:outline-none focus:border-[#A36B3B] transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-xl bg-[#A36B3B] hover:bg-[#8D5A30] text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#A36B3B]/20 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <span>Subscribe</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                  {errorMsg && (
                    <p className="text-[11px] text-red-500 mt-2 text-left font-medium">{errorMsg}</p>
                  )}
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="subscription-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="py-6 space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#A36B3B]/15 text-[#A36B3B] flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-[#141416]">
                  You're Subscribed!
                </h3>
                <p className="text-xs text-[#54575E] max-w-sm mx-auto">
                  Thank you for joining our updates list. You will receive spiritual bulletins and publications as they are released.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-xs font-semibold text-[#A36B3B] hover:underline pt-2 cursor-pointer"
                >
                  Subscribe another email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
