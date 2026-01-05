'use client';

import { useState } from 'react';
import Image from 'next/image';
import LoadingHud from '../components/LoadingHud';
import ResultDashboard from '../components/ResultDashboard';

export default function Home() {
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    let formattedWebsite = website.trim();
    if (!formattedWebsite.startsWith('http')) formattedWebsite = `https://${formattedWebsite}`;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website: formattedWebsite }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: true, details: "Connection failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30 selection:text-green-400 flex flex-col font-sans overflow-x-hidden">
      
      {/* --- CINEMATIC BACKGROUND (Now covering the Header) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Adjusted top position to -10% so it glows BEHIND the logo */}
        <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[800px] h-[600px] bg-green-500/15 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/05 rounded-full blur-[100px]"></div>
      </div>

      {/* --- NAVIGATION --- */}
      {/* Changed bg-black/80 to bg-transparent so the glow is visible */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer relative w-32 h-10">
             {/* RESTORED LOGO */}
             <Image 
              src="/logo.png" 
              alt="RankUp Logo" 
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          <a href="#" className="hidden md:block text-xs font-bold bg-white/5 text-gray-300 px-6 py-2.5 rounded-full hover:bg-white/10 hover:text-white transition-all font-space uppercase tracking-wide border border-white/5 hover:border-green-500/30 backdrop-blur-md">
            Enterprise Demo
          </a>
        </div>
      </nav>

      <main className="flex-grow relative z-10 flex flex-col items-center pt-12 pb-20 px-4 text-center">
        
        {/* --- 1. HERO & INPUT (Visible when idle) --- */}
        {!loading && !result && (
          <div className="w-full max-w-6xl mx-auto">
            
            {/* Hero Content */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/10 backdrop-blur-md text-[10px] font-bold text-green-400 mb-8 font-space uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span>AEO Intelligence Engine v2.0</span>
              </div>

              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 font-space text-white leading-[1.1] drop-shadow-2xl">
                Dominate Search in the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-teal-500 animate-gradient">
                  Age of Answers.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 mx-auto leading-relaxed">
                Traditional SEO is invisible to AI. We help you rank in ChatGPT, Gemini, and Perplexity by decoding their "Answer Engine" algorithms.
              </p>
              
              {/* Input Box */}
              <div className="w-full max-w-lg mx-auto relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <form onSubmit={handleSubmit} className="relative flex flex-col gap-3 bg-black/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
                  <input
                    type="text"
                    required
                    placeholder="Enter your website (e.g. vizli.com)"
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-4 text-white text-center placeholder-gray-600 focus:outline-none focus:bg-[#151515] focus:border-white/10 transition-all font-space text-lg"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                  <button type="submit" className="w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded-xl transition-all font-space uppercase tracking-widest text-xs shadow-xl shadow-white/5 relative overflow-hidden">
                    Analyze Presence
                  </button>
                </form>
                <div className="mt-6 flex justify-center items-center gap-6 text-[10px] text-gray-600 font-mono uppercase tracking-widest opacity-60">
                  <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-green-500 rounded-full"></span> 12M+ Data Points</span>
                  <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-green-500 rounded-full"></span> Live Scrape</span>
                  <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-green-500 rounded-full"></span> Gemini Powered</span>
                </div>
              </div>
            </div>

            {/* --- 2. THE CONTEXT GRID (How it Works) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left border-t border-white/5 pt-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
              
              {[
                { 
                  step: "01", title: "Audit", 
                  desc: "We scan your digital footprint to see how AI models perceive your brand right now.",
                  icon: "🔍" 
                },
                { 
                  step: "02", title: "Identify", 
                  desc: "We pinpoint critical gaps in Authority and Trust that make you invisible to AI.",
                  icon: "🎯" 
                },
                { 
                  step: "03", title: "Forecast", 
                  desc: "Our engine predicts your potential visibility growth over 30 days if you fix these gaps.",
                  icon: "📈" 
                },
                { 
                  step: "04", title: "Dominate", 
                  desc: "We generate the exact Q&A content you need to publish to own the answer.",
                  icon: "👑" 
                }
              ].map((item, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-green-500/30 hover:bg-white/[0.02] transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl grayscale group-hover:grayscale-0">{item.icon}</div>
                  <div className="flex flex-col h-full justify-between relative z-10">
                    <div>
                      <div className="font-mono text-[10px] text-green-500 mb-4 border border-green-500/20 inline-block px-2 py-1 rounded bg-green-500/5">STEP {item.step}</div>
                      <h3 className="text-xl font-bold text-white mb-3 font-space">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-300 transition-colors">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            </div>

          </div>
        )}

        {/* --- 3. LOADING HUD --- */}
        {loading && <LoadingHud />}

        {/* --- 4. RESULTS DASHBOARD --- */}
        {result && !loading && <ResultDashboard result={result} onReset={() => setResult(null)} />}
      
      </main>

      <footer className="border-t border-white/5 py-8 text-center relative z-10 bg-black/80 backdrop-blur-xl">
        <p className="text-[10px] text-gray-700 font-mono uppercase tracking-widest">
          &copy; {new Date().getFullYear()} RankUp Intelligence. System Status: <span className="text-green-500">Online</span>
        </p>
      </footer>
    </div>
  );
}