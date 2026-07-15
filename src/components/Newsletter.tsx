import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, CheckCircle, ArrowRight, Loader2, Sparkles, Bell } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
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
      await setDoc(doc(db, 'subscribers', subscriberId), subscriberData);
      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      console.error('Failed to subscribe:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, `subscribers/${subscriberId}`);
      } catch (firestoreErr) {
        setErrorMsg('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-rich-black to-[#090b0e] relative overflow-hidden" id="newsletter-section">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-midnight-blue/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-electric-blue/10 blur-[80px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-charcoal/45 border border-midnight-blue rounded-3xl p-8 sm:p-12 md:p-16 text-center backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Subtle top badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-midnight-blue/80 border border-electric-blue/10 text-electric-blue font-mono text-[10px] uppercase tracking-widest mb-6">
            <Bell className="h-3 w-3 text-electric-blue" />
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
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-soft-white tracking-tight">
                  Subscribe to GEC Updates & Publications
                </h2>
                <p className="text-xs sm:text-sm text-light-gray mt-3 max-w-lg mx-auto leading-relaxed">
                  Join our global fellowship of believers. Get systematic theology resources, midweek/Sunday service bulletins, download alerts, and quarterly spiritual publications delivered straight to your inbox.
                </p>

                <form onSubmit={handleSubscribe} className="mt-8 max-w-md mx-auto relative">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-light-gray" />
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        className="w-full bg-rich-black/95 border border-midnight-blue focus:border-electric-blue rounded-xl py-3.5 pl-10 pr-4 text-xs text-soft-white placeholder-medium-gray focus:outline-none transition-all font-sans"
                        id="newsletter-email-input"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-royal-blue to-electric-blue hover:from-electric-blue hover:to-royal-blue text-soft-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-royal-blue/5 hover:shadow-royal-blue/20 disabled:opacity-50 shrink-0"
                      id="newsletter-submit-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Subscribing...</span>
                        </>
                      ) : (
                        <>
                          <span>Subscribe Now</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                  {errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-amber-500 text-[11px] font-mono mt-3 text-left pl-1"
                    >
                      {errorMsg}
                    </motion.p>
                  )}
                </form>

                <div className="mt-6 flex justify-center items-center gap-4 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-cci-gold-400" /> No Spam, Ever
                  </span>
                  <span>•</span>
                  <span>Unsubscribe anytime</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="subscription-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                className="py-6 flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/25">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                  You're Subscribed!
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  Thank you for joining. You are now subscribed to God's Edifice Church updates and publication digests.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 text-xs text-cci-gold-400 hover:text-cci-gold-300 font-semibold underline underline-offset-4"
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
