import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60; // Vercel Pro Limit

// HELPER: Ask Google which models are available for this Key
async function getBestModel(apiKey: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    const models = data.models || [];

    // Prioritize models in this order
    const priority = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro', 'gemini-pro'];
    
    for (const p of priority) {
      const found = models.find((m: any) => m.name.includes(p));
      if (found) return found.name.replace('models/', '');
    }
    
    // Fallback to the first available generative model
    const fallback = models.find((m: any) => m.supportedGenerationMethods.includes('generateContent'));
    return fallback ? fallback.name.replace('models/', '') : 'gemini-pro';
  } catch (e) {
    console.error("Model fetch failed, defaulting to gemini-pro");
    return "gemini-pro";
  }
}

export async function POST(req: Request) {
  try {
    const { website } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: true, details: "API Key Missing" });

    // 1. ROBUST SCRAPE
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); 
    let liveContent = "";
    try {
      const response = await fetch(website, { 
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RankUpBot/1.0)' }
      });
      if (response.ok) {
        const text = await response.text();
        liveContent = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").substring(0, 20000);
      }
    } catch (e) { console.log("Scrape warning"); }
    clearTimeout(timeout);

    const contextInput = liveContent || `URL: ${website}`;

    // 2. AUTO-DETECT MODEL
    const modelName = await getBestModel(apiKey);
    console.log("Selected Model:", modelName); // Debug log

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
      Analyze this brand identity.
      SOURCE: ${contextInput}
      
      Task:
      1. Define the specific Industry & Niche.
      2. Identify 3 ACTUAL competitors based on the text.
      
      RETURN JSON ONLY:
      {
        "meta": { "industry": "String", "niche": "String" },
        "competitors": [
          { "name": "Real Brand 1", "traffic_share": 80 },
          { "name": "Real Brand 2", "traffic_share": 60 },
          { "name": "Real Brand 3", "traffic_share": 40 }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    
    return NextResponse.json({ ...JSON.parse(text), raw_text: liveContent });

  } catch (error: any) {
    console.error("Fast Scan Error:", error.message);
    return NextResponse.json({ error: true, details: error.message });
  }
}