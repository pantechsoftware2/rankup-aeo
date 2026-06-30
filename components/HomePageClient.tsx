'use client';

import { useRouter } from 'next/navigation';
import Hero from '@/components/Hero';
import { useScanContext } from '@/lib/scan-context';

export default function HomePageClient() {
  const router = useRouter();
  const { startScan } = useScanContext();

  const handleAnalyze = async (website: string) => {
    startScan(website);
    const encodedUrl = encodeURIComponent(website);
    router.push(`/report-preview?url=${encodedUrl}`);
  };

  return <Hero onAnalyze={handleAnalyze} />;
}
