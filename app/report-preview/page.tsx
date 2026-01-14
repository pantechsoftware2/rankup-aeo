'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Download, AlertTriangle } from 'lucide-react';
import GhostTownReceipts from '@/components/GhostTownReceipts';
import { AEOReportData } from '@/types/aeo-report';

export default function ReportPreviewPage() {
  const [data, setData] = useState<AEOReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data safely from local storage
    const loadData = () => {
      try {
        const stored = localStorage.getItem('latestAnalysis');
        if (stored) {
          setData(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load report data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading Report...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-4">
        <div className="text-red-400">No report data found.</div>
        <Link href="/" className="px-4 py-2 bg-white text-black rounded hover:bg-zinc-200">
          Start New Audit
        </Link>
      </div>
    );
  }

  // --- BRANCH 1: GHOST TOWN (The "Receipts" View) ---
  if (data.status === 'GHOST_TOWN') {
    return (
      <div className="min-h-screen bg-[#050505]">
        <nav className="p-6 border-b border-white/5">
          <Link href="/" className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> Back to Search
          </Link>
        </nav>
        <div className="flex items-center justify-center p-8">
          <GhostTownReceipts data={data} />
        </div>
      </div>
    );
  }

  // --- BRANCH 2: SUCCESS DASHBOARD ---
  // Safe defaults using optional chaining (?.)
  const visibilityScore = data.visibility?.score || 0;
  const sentimentScore = data.sentiment?.score || 0;
  const contentScore = data.content_strategy?.score || 0;
  const competitors = data.visibility?.competitors || [];
  const opportunities = data.content_strategy?.opportunities || [];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
            <ArrowLeft size={16} /> New Audit
          </Link>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white/5 rounded-full text-zinc-400 transition-colors">
              <Share2 size={18} />
            </button>
            <button className="px-4 py-1.5 bg-white text-black text-sm font-medium rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        
        {/* HERO SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* MAIN SCORE CARD */}
          <div className="md:col-span-1 bg-gradient-to-b from-zinc-900 to-black border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors duration-500" />
            
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Circular Progress Background */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                <circle 
                  cx="80" cy="80" r="70" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * visibilityScore) / 100}
                  className={`${visibilityScore > 60 ? 'text-indigo-500' : 'text-amber-500'} transition-all duration-1000 ease-out`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-bold tracking-tighter">{visibilityScore}</span>
                <span className="text-xs uppercase tracking-widest text-zinc-500 mt-1">AEO Score</span>
              </div>
            </div>
          </div>

          {/* SUMMARY CARD */}
          <div className="md:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 flex flex-col justify-center">
            <h2 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-4">Executive Summary</h2>
            <p className="text-lg text-zinc-200 leading-relaxed">
              {data.summary || "Analysis complete. Review the metrics below."}
            </p>
            <div className="mt-6 flex gap-4">
              <div className="px-3 py-1 bg-zinc-900 rounded-full border border-white/5 text-xs text-zinc-400">
                {competitors.length} Competitors Found
              </div>
              <div className="px-3 py-1 bg-zinc-900 rounded-full border border-white/5 text-xs text-zinc-400">
                {data.citations?.sources?.length || 0} Sources Analyzed
              </div>
            </div>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* CONTENT STRATEGY */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Content Strategy</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${contentScore > 50 ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {contentScore}/100 Strength
              </span>
            </div>
            
            <div className="space-y-4">
              {opportunities.slice(0, 3).map((opp, i) => (
                <div key={i} className="flex gap-4 p-4 bg-zinc-900/30 rounded-xl border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <span className="text-indigo-400 text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-zinc-300">{opp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* COMPETITORS & SENTIMENT */}
          <div className="space-y-8">
            {/* Sentiment Bar */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8">
              <h3 className="text-sm text-zinc-400 uppercase tracking-wider mb-4">Brand Sentiment</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold">{sentimentScore}%</span>
                <span className="text-sm text-zinc-500 mb-1">Positive Signal</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${data.sentiment?.positive || 0}%` }} className="h-full bg-green-500" />
                <div style={{ width: `${data.sentiment?.neutral || 0}%` }} className="h-full bg-zinc-600" />
                <div style={{ width: `${data.sentiment?.negative || 0}%` }} className="h-full bg-red-500" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-zinc-500">
                <span>Positive</span>
                <span>Negative</span>
              </div>
            </div>

            {/* Competitor Tags */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8">
              <h3 className="text-sm text-zinc-400 uppercase tracking-wider mb-4">Identified Competitors</h3>
              <div className="flex flex-wrap gap-2">
                {competitors.map((comp, i) => (
                  <span key={i} className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-sm text-zinc-300">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}