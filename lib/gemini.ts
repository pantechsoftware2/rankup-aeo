import { GoogleGenerativeAI } from '@google/generative-ai';
import { AEOReportData } from '@/types/aeo-report';
import { SearchScanResult } from '@/lib/serper';

// --- CONFIGURATION ---
const GEN_AI_KEY = process.env.GEMINI_API_KEY || '';

if (!GEN_AI_KEY) {
  throw new Error("MISSING_KEY: GEMINI_API_KEY is not set in .env.local");
}

const genAI = new GoogleGenerativeAI(GEN_AI_KEY);
let cachedModelName: string | null = null;

// --- 1. DYNAMIC MODEL POLLING (Keeps API Alive) ---
async function getBestAvailableModel(): Promise<string> {
  if (cachedModelName) return cachedModelName;
  try {
    console.log('🔍 Polling Google for available models...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEN_AI_KEY}`
    );
    if (!response.ok) throw new Error(`Failed to list models: ${response.statusText}`);
    const data = await response.json();
    const models = data.models || [];
    
    const availableModels = models.filter((m: any) => 
      m.supportedGenerationMethods?.includes('generateContent')
    );

    const rankedModels = availableModels.sort((a: any, b: any) => {
      const getScore = (name: string) => {
        if (name.includes('gemini-2.0')) return 4;
        if (name.includes('gemini-1.5-pro')) return 3;
        if (name.includes('gemini-1.5-flash')) return 2;
        if (name.includes('gemini-pro')) return 1;
        return 0;
      };
      return getScore(b.name) - getScore(a.name);
    });

    if (rankedModels.length === 0) throw new Error("No generative models found.");
    
    const bestModel = rankedModels[0].name.replace('models/', '');
    console.log(`✅ Auto-selected best model: ${bestModel}`);
    cachedModelName = bestModel;
    return bestModel;
  } catch (error) {
    console.warn("⚠️ Model discovery failed, falling back to 'gemini-1.5-flash'");
    return 'gemini-1.5-flash';
  }
}

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

function cleanJson(text: string): string {
  return text.replace(/```json\n?|\n?```/g, '').trim();
}

// --- MAIN FUNCTION ---
export async function generateValidatedInsight(
  brandName: string, 
  industry: string, 
  niche: string, 
  searchResults: SearchScanResult[]
): Promise<AEOReportData> {

  console.log(`🤖 Analyzing Sources for: ${brandName}...`);

  let tierA = 0, tierB = 0, tierC = 0;
  searchResults.forEach(res => {
    const type = classifySource(res.link);
    if (type === 'TIER_A') tierA++;
    if (type === 'TIER_B') tierB++;
    if (type === 'TIER_C') tierC++;
  });

  console.log(`📊 Breakdown: Tier A: ${tierA}, Tier B: ${tierB}, Tier C: ${tierC}`);

  // --- STRICT GHOST TOWN CHECK ---
  const isGhostTown = tierA === 0;

  if (isGhostTown) {
    console.log('👻 GHOST TOWN TRIGGERED.');
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
  console.log(`🧮 Temperance Score Calculated: ${calculatedScore}/100`);

  console.log('✅ Passed Ghost Town check. Fetching best model...');

  try {
    const modelName = await getBestAvailableModel();
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { temperature: 0.2 } // Low temp for stability
    });

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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanText = cleanJson(responseText);
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
      summary: "Analysis failed due to high traffic.",
      sourceBreakdown: { tierA, tierB, tierC }
    };
  }
}