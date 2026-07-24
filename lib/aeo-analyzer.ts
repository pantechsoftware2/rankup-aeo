import { AEOReportData } from '@/types/aeo-report';
import { SearchScanResult } from '@/lib/serper';
import { callLLM, cleanJsonResponse } from '@/lib/openrouter';
import { MODELS } from '@/lib/models';
import { debugLog } from '@/lib/logger';

// --- 2. SOURCE CLASSIFICATION (The Filter) ---
function classifySource(url: string): 'TIER_A' | 'TIER_B' | 'TIER_C' {
  const lower = url.toLowerCase();
  
  if (lower.includes('reddit.com') || lower.includes('quora.com') || 
      lower.includes('twitter.com') || lower.includes('x.com') || 
      lower.includes('ycombinator.com') || lower.includes('indiehackers.com') ||
      lower.includes('producthunt.com')) return 'TIER_A'; // Discussions

  if (lower.includes('justdial') || lower.includes('sulekha') || 
      lower.includes('ambitionbox') || lower.includes('glassdoor') || 
      lower.includes('zoominfo') || lower.includes('linkedin.com/company') ||
      lower.includes('crunchbase') || lower.includes('scamadviser') ||
      lower.includes('trustpilot') || lower.includes('zaubacorp') ||
      lower.includes('tofler')) return 'TIER_C'; // Spam

  return 'TIER_B'; // General/Official
}

// --- 3. TEMPERANCE SCORING (The Math) ---
// This ensures the score is calculated mathematically, not "guessed" by AI.
function calculateTemperanceScore(tierA: number, tierB: number, tierC: number): number {
  // WEIGHTS:
  // Tier A (Discussions): Gold standard. +15 points each.
  // Tier B (Official): Silver standard. +5 points each.
  // Tier C (Spam): Noise. -2 points each (penalty).
  
  let rawScore = (tierA * 15) + (tierB * 5) - (tierC * 2);
  
  // BONUSES:
  // If you have at least 2 discussions, small multiplier bonus
  if (tierA >= 2) rawScore *= 1.2;

  // CLAMPING:
  // Ensure score stays between 0 and 100
  return Math.min(Math.max(Math.round(rawScore), 0), 100);
}



// --- MAIN FUNCTION ---
export async function generateValidatedInsight(
  brandName: string, 
  industry: string, 
  niche: string, 
  searchResults: SearchScanResult[]
): Promise<AEOReportData> {

  debugLog('[AEO Analyzer] Analyzing sources.', { brandName });

  let tierA = 0, tierB = 0, tierC = 0;
  searchResults.forEach(res => {
    const type = classifySource(res.link);
    if (type === 'TIER_A') tierA++;
    if (type === 'TIER_B') tierB++;
    if (type === 'TIER_C') tierC++;
  });

  debugLog('[AEO Analyzer] Source tier breakdown.', { tierA, tierB, tierC });

  // --- STRICT GHOST TOWN CHECK ---
  const isGhostTown = tierA === 0;

  if (isGhostTown) {
    debugLog('[AEO Analyzer] Ghost-town path selected.');
    return {
      status: 'GHOST_TOWN',
      visibility: { score: 0, rank: 0, competitors: [] },
      sentiment: { score: 0, positive: 0, negative: 0, neutral: 100 },
      citations: { 
        sources: searchResults.slice(0, 5).map(s => {
          try { return { name: new URL(s.link).hostname.replace('www.', ''), percentage: 20 }; }
          catch (e) { return { name: "Directory", percentage: 20 }; }
        })
      },
      content_strategy: { score: 0, opportunities: [], missing_topics: [] },
      summary: `We found ${tierC} directories and ${tierB} general sites, but ZERO narrative discussions.`,
      sourceBreakdown: { tierA, tierB, tierC }
    };
  }

  // --- CALCULATE DETERMINISTIC SCORE ---
  const calculatedScore = calculateTemperanceScore(tierA, tierB, tierC);
  debugLog('[AEO Analyzer] Temperance score calculated.', { score: calculatedScore });

  debugLog('[AEO Analyzer] Calling OpenRouter for insight generation.');

  try {
    const prompt = `
      Act as an AEO Expert. Analyze "${brandName}" (${industry}) based on these results:
      ${JSON.stringify(searchResults)}

      The mathematically calculated AEO Visibility Score is: ${calculatedScore}.
      You MUST use this exact score (${calculatedScore}) in your JSON response. Do not recalculate it.

      Return JSON strictly matching this schema:
      {
        "status": "SUCCESS",
        "visibility": { "score": ${calculatedScore}, "rank": 1-10, "competitors": [] },
        "sentiment": { "score": 0-100, "positive": %, "negative": %, "neutral": % },
        "citations": { "sources": [{ "name": "string", "percentage": number }] },
        "content_strategy": { "score": 0-100, "opportunities": [], "missing_topics": [] },
        "summary": "string",
        "sourceBreakdown": { "tierA": ${tierA}, "tierB": ${tierB}, "tierC": ${tierC} }
      }
    `;

    const responseText = await callLLM({
      model: MODELS.FAST,
      userPrompt: prompt,
      temperature: 0.2,
    });
    
    const cleanText = cleanJsonResponse(responseText);
    const parsedData = JSON.parse(cleanText);

    // Double-check the score didn't drift
    parsedData.visibility.score = calculatedScore;

    return { ...parsedData, sourceBreakdown: { tierA, tierB, tierC } };

  } catch (error) {
    console.error("❌ Fatal AI Analysis Error:", error);
    return {
      status: 'ERROR',
      visibility: { score: 0, rank: 0, competitors: [] },
      sentiment: { score: 0, positive: 0, negative: 0, neutral: 0 },
      citations: { sources: [] },
      content_strategy: { score: 0, opportunities: [], missing_topics: [] },
      summary: "Analysis failed due to API error.",
      sourceBreakdown: { tierA, tierB, tierC }
    };
  }
}
