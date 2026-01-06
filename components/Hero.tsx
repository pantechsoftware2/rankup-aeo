'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Hero({ onAnalyze }: { onAnalyze: (url: string) => void }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) onAnalyze(url);
  };

  return (
    <div className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-[#050505]">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-black to-black pointer-events-none"></div>
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/20 to-transparent"></div>

      <div className="relative z-10 max-w-4xl px-6 text-center">
        
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-green-400 mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
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

        {/* Subhead */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Traditional SEO is invisible to AI. We help you rank in ChatGPT, Gemini, and Perplexity by decoding their "Answer Engine" algorithms.
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