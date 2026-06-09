'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero({ onAnalyze }: { onAnalyze: (url: string) => Promise<void> }) {
  const [url, setUrl] = useState('');
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Regex: matches "text" + "." + "2+ letters" (e.g. .com, .ai, .co)
  const isValidDomain = (input: string) => {
    // Strip http/https/www for the check if needed, but simple regex works for user input
    // This allows "google.com" or "https://google.com" but fails "google"
    return /\.[a-z]{2,}$/i.test(input);
  };

  const isInvalid = url.length > 0 && !isValidDomain(url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidDomain(url)) {
      setIsSubmitting(true);
      setTouched(false);
      try {
        await onAnalyze(url);
      } catch (err) {
        console.error('onAnalyze failed:', err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setTouched(true); // Show error if they try to force submit via Enter key
    }
  };

  return (
    <div className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#050505]">
      
      {/* --- NAVIGATION BAR --- */}
      <nav className="absolute top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        {/* LOGO SECTION */}
        <div className="relative w-40 h-12 transition-transform hover:scale-105 cursor-pointer">
          <Image 
            src="/logo.png" 
            alt="RankUp Logo" 
            fill
            sizes="160px"
            className="object-contain object-left"
            priority
          />
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-6">
          <Link
            href="/services"
            className="hidden text-xs font-bold uppercase tracking-wider text-zinc-400 transition hover:text-white lg:inline"
          >
            Services
          </Link>
          <Link
            href="/industries"
            className="hidden text-xs font-bold uppercase tracking-wider text-zinc-400 transition hover:text-white lg:inline"
          >
            Industries
          </Link>
          <Link
            href="/about"
            className="text-xs font-bold uppercase tracking-wider text-zinc-400 transition hover:text-white"
          >
            About
          </Link>
          <Link
            href="/methodology"
            className="hidden text-xs font-bold uppercase tracking-wider text-zinc-400 transition hover:text-white sm:inline"
          >
            Method
          </Link>
          <Link
            href="/blog"
            className="text-xs font-bold uppercase tracking-wider text-zinc-400 transition hover:text-white"
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className="hidden text-xs font-bold uppercase tracking-wider text-zinc-400 transition hover:text-white md:inline"
          >
            Contact
          </Link>
          <a
            href="/audit-flow"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-white uppercase tracking-wider transition-all hover:scale-105 flex items-center gap-2 group"
          >
            Get audit
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </nav>

      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-black to-black pointer-events-none"></div>
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/20 to-transparent"></div>

      {/* --- HERO CONTENT --- */}
      <div className="relative z-10 max-w-4xl px-6 text-center mt-20">
        
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-green-400 mb-8"
        >
          <Sparkles className="w-3 h-3" />
          SEO + AEO Visibility Audit
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight font-space"
        >
          Your business should be <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-800">getting found on Google.</span>
        </motion.h1>

        {/* Subhead */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Your business should be getting found on Google and AI answer engines more often. When it is not, that is usually a packaging, authority, and search-structure problem. We fix both <span className="text-white font-semibold">SEO and AEO together</span>, then turn the audit into a focused 90-day retainer that starts moving visibility in the right direction.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-10 flex flex-wrap justify-center gap-3 text-[11px] font-mono uppercase tracking-wider text-zinc-300"
        >
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Google rankings</div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">AI answer visibility</div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">90-day retainer rollout</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
          className="mb-8 flex flex-wrap justify-center gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500"
        >
          <div className="rounded-full border border-white/10 px-4 py-2">1. Get your free visibility audit</div>
          <div className="rounded-full border border-white/10 px-4 py-2">2. Unlock report</div>
          <div className="rounded-full border border-white/10 px-4 py-2">3. Book strategy call</div>
        </motion.div>

        {/* Input Box Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }} 
          className="max-w-lg mx-auto"
        >
          <form onSubmit={handleSubmit} className="relative group mb-3">
            <div className={`absolute -inset-1 bg-gradient-to-r ${isInvalid ? 'from-red-500/50 to-red-900/50' : 'from-green-500 to-emerald-600'} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000`}></div>
            
            <div className={`relative flex items-center bg-[#0A0A0A] border ${isInvalid && touched ? 'border-red-500/50' : 'border-white/10'} rounded-xl p-2 shadow-2xl transition-colors`}>
              <input 
                type="text" 
                placeholder="e.g. stayiq.ai" 
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (touched) setTouched(false);
                }}
                className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-gray-600 font-mono text-sm focus:ring-0"
              />
              <button 
                type="submit"
                disabled={!isValidDomain(url) || isSubmitting}
                className={`px-6 py-3 rounded-lg font-bold text-xs md:text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${isSubmitting ? 'bg-emerald-500 text-white cursor-wait shadow-md' : 'bg-white text-black hover:bg-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? 'SCANNING…' : 'GET YOUR FREE VISIBILITY AUDIT'}
              </button>
            </div>
          </form>

          {/* Validation & Trust Micro-Copy */}
          <div className="h-6 flex items-center justify-center gap-2 text-[10px] md:text-xs font-mono">
            {isInvalid && url.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-red-400 flex items-center gap-2"
              >
                <AlertCircle className="w-3 h-3" />
                Please enter a valid domain (e.g., .com, .ai)
              </motion.div>
            ) : (
              <div className="text-gray-500 flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span>Free teaser now. Custom report after review. If it&apos;s a fit, we&apos;ll show where a 3-month retainer changes the game.</span>
              </div>
            )}
          </div>

        </motion.div>

        {/* Footer Trust Signals */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex justify-center gap-8 opacity-30 grayscale"
        >
           <span className="text-xs font-mono font-bold text-white">VISIBILITY ACROSS:</span>
           <span className="text-xs font-mono text-white">CHATGPT</span>
           <span className="text-xs font-mono text-white">GEMINI</span>
           <span className="text-xs font-mono text-white">PERPLEXITY</span>
           <span className="text-xs font-mono text-white">GOOGLE</span>
        </motion.div>

      </div>
    </div>
  );
}
