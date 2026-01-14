'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Added for the redirect logic

// --- COMPONENTS ---
// Restoring your exact component imports
import Hero from '../components/Hero';
import LoadingHud from '../components/LoadingHud';
import LandingContent from '../components/LandingContent';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Updated handler to use the NEW single endpoint (backend fix)
  const handleAnalyze = async (website: string) => {
    setLoading(true);

    try {
      // CALL THE WORKING SINGLE ENDPOINT
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Map the input (website/brand) to what the API expects
        body: JSON.stringify({ brandName: website }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Analysis failed');

      // SUCCESS: Save data and redirect to the working Preview Page
      console.log("Analysis success, redirecting...");
      localStorage.setItem('latestAnalysis', JSON.stringify(data));
      router.push('/report-preview');

    } catch (error: any) {
      console.error("Audit Failed:", error);
      alert(error.message || "Failed to connect to RankUp Neural Cloud.");
      setLoading(false); // Only stop loading if we failed (otherwise we are redirecting)
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30">
      
      {/* 1. LOADING STATE (Restored your LoadingHud) */}
      {loading && <LoadingHud />}

      {/* 2. MAIN CONTENT */}
      {/* We removed the inline ResultDashboard conditional because we now redirect 
          to the dedicated /report-preview page to prevent the crash loop. */}
      
      <div className="relative z-0">
        {/* Your Input Section */}
        <Hero onAnalyze={handleAnalyze} />
        
        {/* Your "Scintillating" Educational Content */}
        <LandingContent />
      </div>

    </main>
  );
}