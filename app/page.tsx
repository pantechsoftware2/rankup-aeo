'use client';

import { useState } from 'react';

// --- COMPONENTS ---
// Make sure these files exist in your 'components' folder!
import Hero from '../components/Hero';
import ResultDashboard from '../components/ResultDashboard';
import LoadingHud from '../components/LoadingHud';
import LandingContent from '../components/LandingContent';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async (website: string) => {
    setLoading(true);
    setResult(null);

    try {
      // PHASE 1: FAST SCAN (Identity & Competitors)
      const fastRes = await fetch('/api/analyze/fast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website })
      });
      const fastData = await fastRes.json();

      if (fastData.error) throw new Error(fastData.details);

      // PHASE 2: DEEP SCAN (Strategy & Roadmap)
      // We pass the raw text found in Phase 1 to save time/bandwidth
      const deepRes = await fetch('/api/analyze/deep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          raw_text: fastData.raw_text,
          industry: fastData.meta?.industry,
          niche: fastData.meta?.niche
        })
      });
      const deepData = await deepRes.json();

      // MERGE RESULTS
      setResult({ ...fastData, ...deepData });

    } catch (error: any) {
      console.error("Audit Failed:", error);
      setResult({ 
        error: true, 
        details: error.message || "Failed to connect to RankUp Neural Cloud." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30">
      
      {/* 1. LOADING STATE (Fixed Overlay) */}
      {loading && <LoadingHud />}

      {/* 2. MAIN CONTENT SWITCHER */}
      {result ? (
        // STATE A: Show Results when analysis is done
        <div className="relative z-20 pt-10">
          <ResultDashboard result={result} onReset={() => setResult(null)} />
        </div>
      ) : (
        // STATE B: Show Hero + Landing Page by default
        <div className="relative z-0">
          {/* Your Input Section */}
          <Hero onAnalyze={handleAnalyze} />
          
          {/* The New "Scintillating" Educational Content */}
          <LandingContent />
        </div>
      )}

    </main>
  );
}