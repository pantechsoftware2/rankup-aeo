import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Helper: Scrape text from a URL
async function fetchWebsiteContent(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s Timeout
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RankUpBot/1.0)' }
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const html = await response.text();
    // Strip tags to get raw text (naive strip to save tokens)
    const text = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
                     .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
                     .replace(/<[^>]+>/g, " ")
                     .replace(/\s+/g, " ")
                     .substring(0, 15000); // Limit context for speed
    return text;
  } catch (error) {
    console.error("Scraping failed, falling back to URL inference:", error);
    return null; // Fallback to just analyzing the URL if scraping fails
  }
}

export async function POST(req: Request) {
  try {
    const { website } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

    // 1. SCRAPE LIVE CONTENT
    const liveContent = await fetchWebsiteContent(website);
    const contextInput = liveContent ? `LIVE WEBSITE CONTENT: ${liveContent}` : `WEBSITE URL: ${website}`;

    // 2. MODEL DISCOVERY
    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!listResp.ok) throw new Error("Failed to contact Google API.");
    const listData = await listResp.json();
    
    const bestModel = listData.models?.find((m: any) => 
      m.name.includes('gemini') && !m.name.includes('vision') && m.supportedGenerationMethods?.includes('generateContent')
    );
    if (!bestModel) throw new Error("No Gemini models found.");
    const targetModelName = bestModel.name.replace('models/', '');

    // 3. GENERATE PROFOUND-STYLE REPORT
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: targetModelName });

    const prompt = `
      Analyze this brand based on its digital footprint: ${contextInput}
      
      Act as a Senior AEO (Answer Engine Optimization) Auditor. 
      Generate a comprehensive JSON report for a high-end dashboard.
      
      Return ONLY RAW JSON with these exact keys:
      
      1. "score": Number (0-100).
      2. "verdict": String (e.g., "Invisible", "Emerging", "Visible", "Dominant").
      3. "summary": String. One punchy overview sentence.
      4. "visibilityRank": Number (Estimate rank 1-20 in their niche).
      5. "sentiment": Object { "positive": Number (0-100), "negative": Number (0-100) }.
      6. "sentimentBreakdown": Array of Strings (3 specific reasons for the sentiment).
      7. "competitors": Array of Objects { "name": String, "visibility": Number (0-100) }. (List 3 top competitors).
      8. "citationSources": Array of Objects { "name": String, "percentage": Number }. (Top 3 sites that *should* be citing them).
      9. "contentRoadmap": Array of Objects { "type": String (e.g. "Listicle"), "title": String, "desc": String }. (3 ideas).

      Be critical. If the site is generic, give a low score and "Invisible" verdict.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json|```/g, '').trim();

    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("Analysis Error:", error.message);
    return NextResponse.json({ error: true, details: "Analysis failed. Please try again." }, { status: 500 });
  }
}