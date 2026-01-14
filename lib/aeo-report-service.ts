import { AEOReportData } from '@/types/aeo-report';

/**
 * FALLBACK / MOCK DATA
 * Used when the AI fails or for testing.
 * Updated to match the strict AEOReportData interface.
 */
export const MOCK_REPORT: AEOReportData = {
  status: 'SUCCESS',
  visibility: {
    score: 65,
    rank: 3,
    competitors: [
      "Teladoc",
      "MDLive",
      "Amwell",
      "Doctor On Demand",
      "Zocdoc"
    ]
  },
  sentiment: {
    score: 82,
    positive: 65,
    negative: 5,
    neutral: 30
  },
  citations: {
    sources: [
      { name: "TechCrunch", percentage: 25 },
      { name: "G2 Reviews", percentage: 20 },
      { name: "Reddit", percentage: 15 },
      { name: "Hacker News", percentage: 10 },
      { name: "Company Blog", percentage: 30 }
    ]
  },
  content_strategy: {
    score: 70,
    opportunities: [
      "Create more user-generated content on Reddit.",
      "Publish technical whitepapers to increase authority.",
      "Engage with existing reviews on G2 and Capterra.",
      "Optimize knowledge base for natural language queries."
    ],
    missing_topics: [
      "Pricing transparency",
      "API documentation details",
      "Integration case studies"
    ]
  },
  summary: "The brand has decent visibility but lacks deep narrative discussions on Tier A platforms. Competitors are dominating the 'best alternative' queries.",
  sourceBreakdown: {
    tierA: 2,
    tierB: 15,
    tierC: 1
  }
};

/**
 * Legacy Service Function
 * FIX: Now accepts both 'url' and 'brandName' to prevent 'Expected 1 argument, got 2' errors.
 */
export async function generateAEOReport(url: string, brandName: string = ''): Promise<AEOReportData> {
  // Simulating a delay for legacy calls
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Use brandName if available, otherwise fallback to URL
  const displayName = brandName || url || "Brand";

  // Return the type-safe mock data
  return {
    ...MOCK_REPORT,
    summary: `Mock analysis for ${displayName}. (Legacy Service)`
  };
}

// Helper to classify sources (kept for compatibility)
export function classifySource(url: string): 'TIER_A' | 'TIER_B' | 'TIER_C' {
  const lower = url.toLowerCase();
  if (lower.includes('reddit') || lower.includes('quora')) return 'TIER_A';
  if (lower.includes('directory') || lower.includes('listing')) return 'TIER_C';
  return 'TIER_B';
}