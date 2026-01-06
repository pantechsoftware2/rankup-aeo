import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 10;

async function fetchWebsiteContent(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s Hard Limit
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RankUpBot/1.0)' }
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const html = await response.text();
    // Return Cleaned Text (Limit 5000 chars for speed)
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").substring(0, 5000);
  } catch (error) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { website } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Config Error" }, { status: 500 });

    const liveContent = await fetchWebsiteContent(website);
    const contextInput = liveContent || `URL: ${website}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // FAST PROMPT: Only Identity + Competitors
    const prompt = `
      Fast Audit for: ${contextInput}
      
      Task: Identify the Industry, Niche, and 3 Real Competitors.
      Return JSON ONLY:
      {
        "meta": { "industry": "String", "niche": "String" },
        "competitors": [
          { "name": "Competitor 1", "traffic_share": 85 },
          { "name": "Competitor 2", "traffic_share": 60 },
          { "name": "Competitor 3", "traffic_share": 40 }
        ],
        "scraped_text": "${liveContent ? 'INCLUDED' : 'FAILED'}" 
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const data = JSON.parse(text);

    // CRITICAL: We pass the scraped text back to the client so the Deep Scan 
    // doesn't have to scrape it again (saving 3s).
    return NextResponse.json({ ...data, raw_text: liveContent });

} catch (error: any) {
    console.error("Fast Scan Error:", error);
    // DEBUG UPDATE: Return the actual error message
    return NextResponse.json({ 
      error: true, 
      details: error.message || "Fast Scan Internal Server Error" 
    });
  }
}