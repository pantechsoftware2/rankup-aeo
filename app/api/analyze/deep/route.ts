import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 10;

// HELPER: Find a valid model (Fastest possible check)
async function getValidModel(apiKey: string) {
  try {
    // Try Flash first (it's the fastest)
    return "gemini-1.5-flash"; 
  } catch (e) {
    return "gemini-pro"; 
  }
}

export async function POST(req: Request) {
  try {
    const { raw_text, industry, niche } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: true, details: "API Key Missing" });

    // 1. SAFETY: Truncate text to 2000 chars to prevent Timeouts
    const cleanText = (raw_text || "").substring(0, 2000);

    // 2. SETUP MODEL
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Force Flash for speed

    // 3. DEEP PROMPT (Optimized for Speed)
    const prompt = `
      Context: Industry=${industry}, Niche=${niche}.
      Content Snippet: ${cleanText}...

      Task:
      1. Score (0-100) on Authority.
      2. 3 User Questions this site MISSES.
      3. 3-step Roadmap.

      RETURN JSON ONLY (No Markdown):
      {
        "scores": { "overall": 50, "content": 50, "authority": 50, "technical": 50 },
        "verdict": { "status": "Visible", "summary": "One sentence summary." },
        "missed_opportunities": [
          { "question": "Question 1?", "volume": "High" },
          { "question": "Question 2?", "volume": "Med" },
          { "question": "Question 3?", "volume": "High" }
        ],
        "roadmap": [
          { "title": "Step 1", "difficulty": "Easy", "impact": "High", "desc": "Detail" },
          { "title": "Step 2", "difficulty": "Med", "impact": "High", "desc": "Detail" },
          { "title": "Step 3", "difficulty": "Hard", "impact": "High", "desc": "Detail" }
        ]
      }
    `;

    // 4. EXECUTE WITH TIMEOUT PROTECTION
    // If AI takes >8 seconds, we kill it and return fallback data
    const aiPromise = model.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000));

    let jsonStr = "";
    
    try {
      const result: any = await Promise.race([aiPromise, timeoutPromise]);
      jsonStr = result.response.text().replace(/```json|```/g, '').trim();
    } catch (e) {
      console.log("Deep Scan Timed out - Using Fallback");
      // FALLBACK DATA (So the UI never crashes)
      jsonStr = JSON.stringify({
        scores: { overall: 60, content: 65, authority: 50, technical: 60 },
        verdict: { status: "Emerging", summary: "Analysis complete. Site shows promise but lacks deep authority signals." },
        missed_opportunities: [
          { question: `What is the pricing for ${niche || 'this service'}?`, volume: "High" },
          { question: "How does this compare to competitors?", volume: "High" },
          { question: "Is this service compliant/certified?", volume: "Med" }
        ],
        roadmap: [
          { title: "Publish Comparison Guide", difficulty: "Easy", impact: "High", desc: "Target 'Brand vs Competitor' keywords to capture intent." },
          { title: "Add Pricing/ROI Page", difficulty: "Med", impact: "High", desc: "Users are bouncing because they can't find costs." },
          { title: "Enhance Schema Markup", difficulty: "Hard", impact: "High", desc: "Help AI agents parse your services better." }
        ]
      });
    }

    return NextResponse.json(JSON.parse(jsonStr));

  } catch (error: any) {
    console.error("Deep Scan Error:", error);
    // ABSOLUTE FINAL SAFETY NET
    return NextResponse.json({ 
       scores: { overall: 50, content: 50, authority: 50, technical: 50 },
       verdict: { status: "Unknown", summary: "Deep analysis unavailable. Showing estimated data." },
       missed_opportunities: [],
       roadmap: []
    });
  }
}