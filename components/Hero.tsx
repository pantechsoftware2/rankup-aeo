'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function Hero({ onAnalyze }: { onAnalyze: (url: string) => void }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) onAnalyze(url);
  };

  return (
    <div className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#050505]">
      
      {/* --- NAVIGATION BAR --- */}
      <nav className="absolute top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        {/* LOGO SECTION - Image Only */}
        <div className="relative w-40 h-12 transition-transform hover:scale-105 cursor-pointer">
          <Image 
            src="/logo.png" 
            alt="RankUp Logo" 
            fill
            className="object-contain object-left"
            priority
          />
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-6">
          <button className="hidden md:block text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Log In
          </button>
          <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-white uppercase tracking-wider transition-all hover:scale-105 flex items-center gap-2 group">
            Book Demo
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>
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
          AEO Intelligence Engine v2.0
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight font-space"
        >
          Dominate Search in the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-800">Age of Answers.</span>
        </motion.h1>

        {/* Subhead (UPDATED) */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Reach millions of consumers who are using AI to discover new brands. Get your business recommended by ChatGPT, Gemini, and Perplexity.
        </motion.p>

        {/* Input Box */}
        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit}
          className="relative max-w-lg mx-auto group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative flex items-center bg-[#0A0A0A] border border-white/10 rounded-xl p-2 shadow-2xl">
            <input 
              type="text" 
              placeholder="e.g. stayiq.ai" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-gray-600 font-mono text-sm focus:ring-0"
            />
            <button 
              type="submit"
              disabled={!url}
              className="bg-white text-black px-6 py-3 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ANALYZE
            </button>
          </div>
        </motion.form>

        {/* Footer Trust Signals */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex justify-center gap-8 opacity-30 grayscale"
        >
           <span className="text-xs font-mono font-bold text-white">OPTIMIZED FOR:</span>
           <span className="text-xs font-mono text-white">CHATGPT</span>
           <span className="text-xs font-mono text-white">GEMINI</span>
           <span className="text-xs font-mono text-white">PERPLEXITY</span>
        </motion.div>

      </div>
    </div>
  );
}