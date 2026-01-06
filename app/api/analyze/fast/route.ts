import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60; 

// HELPER: Ask Google for the exact model name to avoid 404s
async function getBestModel(apiKey: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    const models = data.models || [];

    // STRICT PRIORITY: Look for the best available PRO model
    const priority = [
      'gemini-1.5-pro-latest',
      'gemini-1.5-pro-001', 
      'gemini-1.5-pro',
      'gemini-1.0-pro',
      'gemini-pro'
    ];
    
    for (const p of priority) {
      const found = models.find((m: any) => m.name.includes(p));
      if (found) return found.name.replace('models/', '');
    }
    
    return 'gemini-pro'; // Ultimate fallback
  } catch (e) {
    console.error("Model list failed", e);
    return "gemini-pro";
  }
}

export async function POST(req: Request) {
  try {
    const { website } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: true, details: "API Key Missing" });

    // 1. DEEP SCRAPE
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); 
    let liveContent = "";
    try {
      const response = await fetch(website, { 
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RankUpBot/1.0)' }
      });
      if (response.ok) {
        const text = await response.text();
        liveContent = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").substring(0, 30000);
      }
    } catch (e) { console.log("Scrape warning"); }
    clearTimeout(timeout);

    const contextInput = liveContent || `URL: ${website}`;

    // 2. SMART MODEL SELECTOR
    const modelName = await getBestModel(apiKey);
    console.log("Using Model:", modelName); // This will show us exactly what works

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
      Analyze brand: ${contextInput}
      Task: Identify Industry, Niche, and 3 ACTUAL Competitors.
      RETURN JSON ONLY:
      {
        "meta": { "industry": "String", "niche": "String" },
        "competitors": [
          { "name": "Brand A", "traffic_share": 80 },
          { "name": "Brand B", "traffic_share": 60 },
          { "name": "Brand C", "traffic_share": 40 }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    
    return NextResponse.json({ ...JSON.parse(text), raw_text: liveContent });

  } catch (error: any) {
    console.error("Fast Scan Error:", error);
    return NextResponse.json({ error: true, details: error.message });
  }
}