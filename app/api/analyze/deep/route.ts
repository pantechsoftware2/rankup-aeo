import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 10;

// HELPER: Find a valid model so we never get 404s
async function getValidModel(apiKey: string) {
  try {
    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listResp.json();
    
    const models = listData.models || [];
    const bestModel = models.find((m: any) => m.name.includes('flash')) 
                   || models.find((m: any) => m.name.includes('pro'))
                   || models.find((m: any) => m.name.includes('gemini'));
                   
    return bestModel ? bestModel.name.replace('models/', '') : "gemini-pro";
  } catch (e) {
    return "gemini-pro"; 
  }
}

export async function POST(req: Request) {
  try {
    const { raw_text, industry, niche } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: true, details: "API Key Missing" });

    // 1. Get Valid Model (The Fix)
    const modelName = await getValidModel(apiKey);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // 2. Deep Prompt
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

  } catch (error: any) {
    console.error("Deep Scan Error:", error);
    return NextResponse.json({ error: true, details: error.message || "Deep Scan Failed" });
  }
}