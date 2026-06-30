'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertCircleIcon, ArrowRightIcon, CheckCircleIcon, MenuIcon, SparklesIcon, XIcon } from '@/components/InlineIcons';

export default function Hero({ onAnalyze }: { onAnalyze: (url: string) => Promise<void> }) {
  const [url, setUrl] = useState('');
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#050505]">
      
      {/* --- NAVIGATION BAR --- */}
      <nav className="absolute inset-x-0 top-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        {/* LOGO SECTION */}
        <Link href="/" className="relative h-10 w-28 cursor-pointer transition-transform hover:scale-105 sm:h-12 sm:w-40">
          <Image 
            src="/logo.png" 
            alt="RankUp Logo" 
            fill
            sizes="160px"
            className="object-contain object-left"
            priority
          />
        </Link>

        {/* RIGHT ACTIONS */}
        <div className="hidden items-center gap-6 md:flex">
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
            <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/audit-flow"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-black transition hover:bg-gray-200"
          >
            Get audit
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          >
            {menuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen ? (
          <div className="absolute left-4 right-4 top-20 rounded-2xl border border-white/10 bg-[#080808]/95 p-4 shadow-2xl backdrop-blur md:hidden">
            <div className="grid gap-1 text-sm font-bold uppercase tracking-wider text-zinc-300">
              {[
                ['Services', '/services'],
                ['Industries', '/industries'],
                ['About', '/about'],
                ['Method', '/methodology'],
                ['Blog', '/blog'],
                ['Contact', '/contact'],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 transition hover:bg-white/5 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </nav>

      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-black to-black pointer-events-none"></div>
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/20 to-transparent"></div>

      {/* --- HERO CONTENT --- */}
      <div className="relative z-10 mt-24 w-full max-w-4xl px-4 text-center sm:px-6">
        
        {/* Animated Badge */}
        <div 
          className="mb-8 inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-center font-mono text-[10px] uppercase tracking-widest text-green-400"
        >
          <SparklesIcon className="w-3 h-3" />
          SEO + AEO Visibility Audit
        </div>

        {/* Headline */}
        <h1 
          className="mb-6 font-space text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-7xl"
        >
          Your business should be{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-800">getting found on Google.</span>
        </h1>

        {/* Subhead */}
        <p 
          className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg md:mb-12 md:text-xl"
        >
          Your business should be getting found on Google and AI answer engines more often. When it is not, that is usually a packaging, authority, and search-structure problem. We fix both <span className="text-white font-semibold">SEO and AEO together</span>, then turn the audit into a focused 90-day retainer that starts moving visibility in the right direction.
        </p>

        <div
          className="mb-10 flex flex-wrap justify-center gap-3 text-[11px] font-mono uppercase tracking-wider text-zinc-300"
        >
          <div className="max-w-full rounded-full border border-white/10 bg-white/5 px-4 py-2">Google rankings</div>
          <div className="max-w-full rounded-full border border-white/10 bg-white/5 px-4 py-2">AI answer visibility</div>
          <div className="max-w-full rounded-full border border-white/10 bg-white/5 px-4 py-2">90-day retainer rollout</div>
        </div>

        <div
          className="mb-8 flex flex-wrap justify-center gap-3 text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 sm:tracking-[0.22em]"
        >
          <div className="max-w-full rounded-full border border-white/10 px-4 py-2">1. Get your free visibility audit</div>
          <div className="max-w-full rounded-full border border-white/10 px-4 py-2">2. Unlock report</div>
          <div className="max-w-full rounded-full border border-white/10 px-4 py-2">3. Book strategy call</div>
        </div>

        {/* Input Box Area */}
        <div
          className="mx-auto w-full max-w-lg"
        >
          <form onSubmit={handleSubmit} className="relative group mb-3">
            <div className={`absolute -inset-1 bg-gradient-to-r ${isInvalid ? 'from-red-500/50 to-red-900/50' : 'from-green-500 to-emerald-600'} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000`}></div>
            
            <div className={`relative flex flex-col items-stretch gap-2 bg-[#0A0A0A] border ${isInvalid && touched ? 'border-red-500/50' : 'border-white/10'} rounded-xl p-2 shadow-2xl transition-colors sm:flex-row sm:items-center`}>
              <input 
                type="text" 
                placeholder="e.g. stayiq.ai" 
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (touched) setTouched(false);
                }}
                className="min-w-0 flex-1 border-none bg-transparent px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:ring-0"
              />
              <button 
                type="submit"
                disabled={!isValidDomain(url) || isSubmitting}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-xs font-bold transition-colors sm:w-auto sm:whitespace-nowrap md:text-sm ${isSubmitting ? 'bg-emerald-500 text-white cursor-wait shadow-md' : 'bg-white text-black hover:bg-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? 'SCANNING…' : 'GET YOUR FREE VISIBILITY AUDIT'}
              </button>
            </div>
          </form>

          {/* Validation & Trust Micro-Copy */}
          <div className="flex min-h-6 items-center justify-center gap-2 text-[10px] font-mono md:text-xs">
            {isInvalid && url.length > 0 ? (
              <div 
                className="flex items-center gap-2 text-red-400"
              >
                <AlertCircleIcon className="w-3 h-3" />
                Please enter a valid domain (e.g., .com, .ai)
              </div>
            ) : (
              <div className="flex items-start gap-2 text-gray-500 sm:items-center">
                <CheckCircleIcon className="w-3 h-3 text-green-500" />
                <span>Free teaser now. Custom report after review. If it&apos;s a fit, we&apos;ll show where a 3-month retainer changes the game.</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Trust Signals */}
        <div 
          className="mt-16 flex flex-wrap justify-center gap-4 opacity-30 grayscale sm:gap-8"
        >
           <span className="text-xs font-mono font-bold text-white">VISIBILITY ACROSS:</span>
           <span className="text-xs font-mono text-white">CHATGPT</span>
           <span className="text-xs font-mono text-white">GEMINI</span>
           <span className="text-xs font-mono text-white">PERPLEXITY</span>
           <span className="text-xs font-mono text-white">GOOGLE</span>
        </div>

      </div>
    </div>
  );
}
