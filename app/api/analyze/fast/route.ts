import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 10; // Vercel's limit

// FALLBACK DATA: The "Parachute" that deploys if things go wrong
const FALLBACK_DATA = {
  meta: { industry: "Digital Business", niche: "General Technology" },
  competitors: [
    { name: "Industry Leader A", traffic_share: 80 },
    { name: "Industry Leader B", traffic_share: 60 },
    { name: "Emerging Competitor", traffic_share: 30 }
  ],
  scraped_text: "Scraping timed out, using fallback inference."
};

async function fetchWebsiteContent(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s Hard Limit on scraping
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RankUpBot/1.0)' }
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const html = await response.text();
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").substring(0, 3000);
  } catch (error) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { website } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: true, details: "API Key Missing" });

    // 1. Scrape (Max 2s)
    const liveContent = await fetchWebsiteContent(website);
    const contextInput = liveContent || `URL: ${website}`;

    // 2. THE GUARANTEE: We race the AI against a 5-second timer.
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Fast Audit for: ${contextInput}
      Task: Identify Industry, Niche, and 3 Competitors.
      Return JSON ONLY.
      {
        "meta": { "industry": "String", "niche": "String" },
        "competitors": [
          { "name": "Name", "traffic_share": 80 }
        ]
      }
    `;

    // The Race: If AI takes > 5s, the timeout wins and returns Fallback Data.
    const aiPromise = model.generateContent(prompt);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve("TIMEOUT"), 5000));

    const raceResult: any = await Promise.race([aiPromise, timeoutPromise]);

    // Case A: Timeout Won
    if (raceResult === "TIMEOUT") {
      console.log("Fast Scan Timeout - Deploying Parachute");
      return NextResponse.json({ ...FALLBACK_DATA, raw_text: liveContent || "" });
    }

    // Case B: AI Won
    const text = raceResult.response.text().replace(/```json|```/g, '').trim();
    return NextResponse.json({ ...JSON.parse(text), raw_text: liveContent });

  } catch (error: any) {
    console.error("Fast Scan Crash:", error.message);
    // ABSOLUTE FINAL SAFETY NET: If even the logic crashes, return clean JSON.
    return NextResponse.json({ 
        ...FALLBACK_DATA, 
        error: true, // We flag it so you know, but the UI won't crash
        details: "Scan recovered from error." 
    });
  }
}