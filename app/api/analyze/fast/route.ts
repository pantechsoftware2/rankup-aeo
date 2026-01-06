import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 10;

async function fetchWebsiteContent(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); 
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RankUpBot/1.0)' }
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const html = await response.text();
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").substring(0, 5000);
  } catch (error) {
    return null;
  }
}

// HELPER: Find a valid model so we never get 404s
async function getValidModel(apiKey: string) {
  try {
    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listResp.json();
    
    // Try to find Flash first (fastest), then Pro (smartest), then any Gemini
    const models = listData.models || [];
    const bestModel = models.find((m: any) => m.name.includes('flash')) 
                   || models.find((m: any) => m.name.includes('pro'))
                   || models.find((m: any) => m.name.includes('gemini'));
                   
    return bestModel ? bestModel.name.replace('models/', '') : "gemini-pro";
  } catch (e) {
    return "gemini-pro"; // Ultimate fallback
  }
}

export async function POST(req: Request) {
  try {
    const { website } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: true, details: "API Key missing" });

    // 1. Get Content
    const liveContent = await fetchWebsiteContent(website);
    const contextInput = liveContent || `URL: ${website}`;

    // 2. Get Valid Model (The Fix)
    const modelName = await getValidModel(apiKey);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // 3. Fast Prompt
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
    
    return NextResponse.json({ ...JSON.parse(text), raw_text: liveContent });

  } catch (error: any) {
    console.error("Fast Scan Error:", error);
    return NextResponse.json({ error: true, details: error.message || "Fast Scan Failed" });
  }
}