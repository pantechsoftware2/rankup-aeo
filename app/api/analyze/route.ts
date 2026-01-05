import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. ROBUST SCRAPER (With User-Agent Rotation simulation)
async function fetchWebsiteContent(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s limit to save time for AI
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      }
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const html = await response.text();
    // Clean heavily to maximize token density
    return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
               .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
               .replace(/<[^>]+>/g, " ")
               .replace(/\s+/g, " ")
               .substring(0, 15000);
  } catch (error) {
    console.log("Scrape failed, using inference mode.");
    return null; 
  }
}

export async function POST(req: Request) {
  try {
    const { website } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

    const liveContent = await fetchWebsiteContent(website);
    
    // 2. CONTEXT PREPARATION
    // If scrape fails, we force the AI to infer from the URL alone.
    const contextInput = liveContent 
      ? `LIVE SITE TEXT: ${liveContent}` 
      : `URL ONLY (INFER CONTEXT): ${website}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the latest model for best reasoning
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. THE "CHAIN OF THOUGHT" PROMPT
    const prompt = `
      Perform a deep-dive AEO (Answer Engine Optimization) Audit on this target.
      TARGET: ${contextInput}
      
      --- PHASE 1: IDENTIFICATION (CRITICAL) ---
      First, analyze the text (or URL) to determine the EXACT Industry, Niche, and Target Audience.
      (e.g., If "stayiq.ai", Industry="Hospitality Tech", Niche="Short Term Rental Analytics").
      
      --- PHASE 2: COMPETITIVE MAPPING ---
      Identify the top 3 GLOBAL leaders in that specific niche. 
      (e.g., If "Rental Analytics", use "AirDNA", "PriceLabs").
      *IF THE SITE IS EMPTY: Use the inferred industry to pick standard competitors.*
      
      --- PHASE 3: SCORING & GAPS ---
      Compare the Target against those Leaders.
      - Content Score: Do they answer user questions?
      - Authority Score: Do they have data/citations?
      - Tech Score: Is the structure clear for AI?

      --- OUTPUT FORMAT ---
      Return ONLY valid JSON. No Markdown.
      {
        "meta": {
          "industry": "String",
          "niche": "String",
          "audience": "String"
        },
        "scores": {
          "overall": Number (0-100),
          "content": Number (0-100),
          "authority": Number (0-100),
          "technical": Number (0-100)
        },
        "verdict": {
          "status": "Invisible" | "Emerging" | "Visible" | "Dominant",
          "summary": "String (2 sentences max)"
        },
        "competitors": [
          { "name": "String", "traffic_share": Number (Estimate 0-100) } 
        ],
        "missed_opportunities": [
          // Specific questions users ask that this site FAILS to answer
          { "question": "String", "volume": "High" | "Med" | "Low" },
          { "question": "String", "volume": "High" | "Med" | "Low" },
          { "question": "String", "volume": "High" | "Med" | "Low" }
        ],
        "roadmap": [
          { "title": "String", "difficulty": "Hard" | "Med" | "Easy", "impact": "High", "desc": "String" },
          { "title": "String", "difficulty": "Hard" | "Med" | "Easy", "impact": "High", "desc": "String" },
          { "title": "String", "difficulty": "Hard" | "Med" | "Easy", "impact": "High", "desc": "String" }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json|```/g, '').trim();

    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("Analysis Failed:", error);
    return NextResponse.json({ error: true, details: "Audit Engine Overload. Please retry." }, { status: 500 });
  }
}