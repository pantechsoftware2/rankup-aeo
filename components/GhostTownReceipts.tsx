import React from 'react';
import { AEOReportData } from '@/types/aeo-report';
import { AlertTriangle, ShieldAlert, Globe, MessageSquare, SearchX, ArrowRight, Zap } from 'lucide-react';

interface GhostTownReceiptsProps {
  data: AEOReportData;
}

export default function GhostTownReceipts({ data }: GhostTownReceiptsProps) {
  const tierC_Count = data.sourceBreakdown?.tierC || 0;
  const tierB_Count = data.sourceBreakdown?.tierB || 0;
  const tierA_Count = data.sourceBreakdown?.tierA || 0;

  const totalSources = tierA_Count + tierB_Count + tierC_Count;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* HEADER CARD */}
      <div className="bg-[#0A0A0A] border border-red-500/20 rounded-2xl p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-red-500/5 z-0" />
        <div className="relative z-10">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">Ghost Town Detected</h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            We audited <strong>{totalSources} sources</strong>, but your brand is invisible to AI models because you lack human-to-human discussion signals.
          </p>
        </div>
      </div>

      {/* THE RECEIPTS (Evidence Log) */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Audit Evidence Log</h3>
        
        <div className="space-y-3">
          {/* TIER B */}
          <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-zinc-200 text-sm">General Mentions</span>
                <span className="text-xs text-zinc-500">News, Blogs, Corporate Sites</span>
              </div>
            </div>
            <span className="font-mono text-blue-400 font-bold">{tierB_Count} found</span>
          </div>

          {/* TIER C */}
          <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <div className="flex flex-col">
                <span className="text-zinc-200 text-sm">Directory/Spam</span>
                <span className="text-xs text-zinc-500">Listings, Aggregators</span>
              </div>
            </div>
            <span className="font-mono text-amber-500 font-bold">{tierC_Count} found</span>
          </div>

          {/* TIER A */}
          <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-red-500" />
              <div className="flex flex-col">
                <span className="text-red-200 text-sm">Narrative Discussions</span>
                <span className="text-xs text-red-400/70">Reddit, Quora, Forums (Required for AI)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SearchX size={14} className="text-red-500" />
              <span className="font-mono text-red-500 font-bold">{tierA_Count} found</span>
            </div>
          </div>
        </div>

        {/* AI DIAGNOSIS BOX */}
          <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">AI Model Diagnosis</p>
          <div className="font-mono text-xs text-red-300 bg-red-950/30 p-4 rounded border border-red-900/50 leading-relaxed">
            {`> STATUS: REJECTED. AI models cannot form a &quot;personality&quot; opinion on this brand without narrative data.`}
          </div>
        </div>
      </div>

      {/* --- THE $10 TRIPWIRE OFFER --- */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative bg-[#0F0F0F] border border-indigo-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-indigo-500/20 rounded-md">
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Don&apos;t Stay Invisible</h3>
            </div>
            <p className="text-zinc-400 text-sm max-w-sm">
              We can force AI models to see you. Get a custom <span className="text-white font-medium">Discussion Injection Strategy</span> tailored to your brand.
            </p>
          </div>

          <a 
            /* 👇👇👇 PASTE YOUR NEW CAL.COM LINK HERE 👇👇👇 */
            href="https://cal.com/pantech-software/aeo-audit" 
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition flex items-center gap-2 shadow-xl shadow-indigo-500/10"
          >
            Fix My Visibility ($10)
            <ArrowRight size={16} />
          </a>

        </div>
      </div>

    </div>
  );
}
