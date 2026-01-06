import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Vercel Pro allows up to 60s (or more).
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { website } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: true, details: "API Key Missing" });

    // 1. DEEP SCRAPE (Wait up to 10s if needed)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); 
    
    let liveContent = "";
    try {
      const response = await fetch(website, { 
        signal: controller.signal,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
        }
      });
      if (response.ok) {
        const text = await response.text();
        // UNLEASHED: Read 30,000 characters. Capture everything.
        liveContent = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").substring(0, 30000);
      }
    } catch (e) {
      console.log("Scrape warning:", e);
    }
    clearTimeout(timeout);

    const contextInput = liveContent || `URL: ${website}`;

    // 2. USE THE FERRARI: GEMINI 1.5 PRO
    const genAI = new GoogleGenerativeAI(apiKey);
    // We hardcode the best model because you paid for it.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); 

    const prompt = `
      Analyze this brand identity deeply.
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
    console.error("Fast Scan Error:", error);
    return NextResponse.json({ error: true, details: error.message });
  }
}