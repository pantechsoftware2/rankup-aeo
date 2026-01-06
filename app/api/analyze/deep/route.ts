import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60; // 60 Seconds allowed

export async function POST(req: Request) {
  try {
    const { raw_text, industry, niche } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    // UNLEASHED: Send the full 25k characters to the AI
    const cleanText = (raw_text || "").substring(0, 25000);

    const genAI = new GoogleGenerativeAI(apiKey!);
    // Using Flash for now to ensure reliability, but we give it permission to think long.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

    const prompt = `
      Deep Audit for AEO (Answer Engine Optimization).
      Industry: ${industry} | Niche: ${niche}
      Content Context: ${cleanText}...

      ROLE: You are a Senior SEO Strategist.
      
      TASK:
      1. Score this content (0-100) on "Information Gain" (Does it add new value?).
      2. Identify 3 SPECIFIC questions that users in this niche ask, which this site FAILS to answer.
      3. Create a high-impact roadmap. Use technical terms (Schema, Entities, NLP).

      RETURN JSON ONLY:
      {
        "scores": { "overall": Number, "content": Number, "authority": Number, "technical": Number },
        "verdict": { "status": "Invisible" | "Emerging" | "Visible" | "Dominant", "summary": "String" },
        "missed_opportunities": [
          { "question": "Specific Question?", "volume": "High" | "Med" },
          { "question": "Specific Question?", "volume": "High" | "Med" },
          { "question": "Specific Question?", "volume": "High" | "Med" }
        ],
        "roadmap": [
          { "title": "Strategy Title", "difficulty": "Easy" | "Med" | "Hard", "impact": "High", "desc": "Specific instruction." },
          { "title": "Strategy Title", "difficulty": "Easy" | "Med" | "Hard", "impact": "High", "desc": "Specific instruction." },
          { "title": "Strategy Title", "difficulty": "Easy" | "Med" | "Hard", "impact": "High", "desc": "Specific instruction." }
        ]
      }
    `;

    // No Timeouts. Real Analysis.
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();

    return NextResponse.json(JSON.parse(text));

  } catch (error: any) {
    console.error("Deep Scan Error:", error);
    return NextResponse.json({ error: true, details: error.message });
  }
}