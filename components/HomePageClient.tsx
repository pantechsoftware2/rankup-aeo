'use client';

import { useRouter } from 'next/navigation';
import Hero from '@/components/Hero';
import LandingContent from '@/components/LandingContent';
import { useScanContext } from '@/lib/scan-context';

export default function HomePageClient() {
  const router = useRouter();
  const { startScan } = useScanContext();

  const handleAnalyze = async (website: string) => {
    startScan(website);
    const encodedUrl = encodeURIComponent(website);
    router.push(`/report-preview?url=${encodedUrl}`);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30">
      <div className="relative z-0">
        <Hero onAnalyze={handleAnalyze} />
        <LandingContent />
      </div>
    </main>
  );
}
