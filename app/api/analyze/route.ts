import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Helper: Scrape text from a URL
async function fetchWebsiteContent(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); 
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RankUpBot/1.0)' }
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    return html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
               .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
               .replace(/<[^>]+>/g, " ")
               .replace(/\s+/g, " ")
               .substring(0, 15000);
  } catch (error) {
    console.error("Scraping failed:", error);
    return null; 
  }
}

export async function POST(req: Request) {
  try {
    const { website } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

    const liveContent = await fetchWebsiteContent(website);
    const contextInput = liveContent ? `LIVE CONTENT START: ${liveContent} END LIVE CONTENT` : `URL: ${website}`;

    // Model Discovery
    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listResp.json();
    const bestModel = listData.models?.find((m: any) => 
      m.name.includes('gemini') && !m.name.includes('vision') && m.supportedGenerationMethods?.includes('generateContent')
    );
    const targetModelName = bestModel ? bestModel.name.replace('models/', '') : "gemini-1.5-flash";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: targetModelName });

    // --- THE "RUTHLESS AUDITOR" PROMPT ---
    const prompt = `
      Analyze this brand for Answer Engine Optimization (AEO).
      Target: ${contextInput}
      
      ROLE: You are a cynical, high-end SEO Auditor. You do NOT trust marketing copy.
      
      SCORING RULES (Strict Enforcement):
      - BASE SCORE: 30/100.
      - +10 pts ONLY IF specific, unique data/stats are found in text.
      - +10 pts ONLY IF named author bios with credentials are found.
      - +10 pts ONLY IF highly authoritative external sources are cited.
      - MAX SCORE for a generic business site is 60. 
      - SCORE > 75 is reserved for Wikipedia, Government sites, or Major Brands (Nike, Apple).
      
      CRITERIA:
      1. Is this site a "Primary Source" of new information? (If no, Verdict = Invisible).
      2. Does it just list services? (If yes, heavily penalize Score).
      3. Compare it to giants like WebMD, Mayo Clinic, or Industry Leaders.
      
      OUTPUT JSON (Raw, no markdown):
      {
        "score": Number (0-100),
        "verdict": "Invisible" | "Emerging" | "Visible" | "Dominant",
        "summary": "Brutally honest 1-sentence summary of why they won't rank.",
        "visibilityRank": Number (Estimate 1-100, where 1 is top),
        "sentiment": { "positive": Number, "negative": Number },
        "sentimentBreakdown": ["Reason 1", "Reason 2", "Reason 3"],
        "competitors": [{ "name": "String", "visibility": Number }],
        "citationSources": [{ "name": "String", "percentage": Number }],
        "contentRoadmap": [{ "type": "String", "title": "String", "desc": "String" }]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json|```/g, '').trim();

    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("Analysis Error:", error.message);
    return NextResponse.json({ error: true, details: "Analysis failed." }, { status: 500 });
  }
}