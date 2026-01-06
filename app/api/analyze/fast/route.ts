import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Vercel Pro allows up to 300s, but 60s is plenty for us.
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { website } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: true, details: "API Key Missing" });

    // 1. ROBUST SCRAPE (Wait up to 10s if needed - we have time now!)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s limit for scraper
    
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
        // UNLEASHED: Read up to 25,000 characters (capture footer, testimonials, hidden FAQs)
        liveContent = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").substring(0, 25000);
      }
    } catch (e) {
      console.log("Scrape warning:", e);
    }
    clearTimeout(timeout);

    const contextInput = liveContent || `URL: ${website}`;

    // 2. UPGRADED BRAIN: Use "gemini-1.5-pro" if available, else Flash
    const genAI = new GoogleGenerativeAI(apiKey);
    // Note: If your key doesn't support Pro, change back to "gemini-1.5-flash"
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

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
          { "name": "Real Brand 1", "traffic_share": Number },
          { "name": "Real Brand 2", "traffic_share": Number },
          { "name": "Real Brand 3", "traffic_share": Number }
        ]
      }
    `;

    // No Timer. We wait for the real answer.
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    
    return NextResponse.json({ ...JSON.parse(text), raw_text: liveContent });

  } catch (error: any) {
    console.error("Fast Scan Error:", error);
    return NextResponse.json({ error: true, details: error.message });
  }
}