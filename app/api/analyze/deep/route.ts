import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 10;

export async function POST(req: Request) {
  try {
    // We receive the text directly from the client (passed from Fast Scan)
    const { raw_text, industry, niche } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const genAI = new GoogleGenerativeAI(apiKey!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // DEEP PROMPT: Strategy & Scores
    const prompt = `
      Deep Audit. Context: Industry=${industry}, Niche=${niche}.
      Site Content: ${raw_text?.substring(0, 10000)}...

      Task:
      1. Score the content (0-100) based on Authority.
      2. Find 3 specific questions users ask in this niche that this content MISSES.
      3. Create a 3-step roadmap.

      Return JSON ONLY:
      {
        "scores": { "overall": Number, "content": Number, "authority": Number, "technical": Number },
        "verdict": { "status": "Invisible" | "Visible" | "Dominant", "summary": "String" },
        "missed_opportunities": [
          { "question": "Real User Question?", "volume": "High" },
          { "question": "Real User Question?", "volume": "Med" },
          { "question": "Real User Question?", "volume": "High" }
        ],
        "roadmap": [
          { "title": "Actionable Step", "difficulty": "Easy", "impact": "High", "desc": "Details" },
          { "title": "Actionable Step", "difficulty": "Med", "impact": "High", "desc": "Details" },
          { "title": "Actionable Step", "difficulty": "Hard", "impact": "High", "desc": "Details" }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();

    return NextResponse.json(JSON.parse(text));

  } catch (error) {
    return NextResponse.json({ error: true });
  }
}