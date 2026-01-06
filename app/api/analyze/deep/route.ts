import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60; 

// HELPER: Ask Google which models are available
async function getBestModel(apiKey: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    const models = data.models || [];

    const priority = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro', 'gemini-pro'];
    for (const p of priority) {
      const found = models.find((m: any) => m.name.includes(p));
      if (found) return found.name.replace('models/', '');
    }
    return 'gemini-pro';
  } catch (e) {
    return "gemini-pro";
  }
}

export async function POST(req: Request) {
  try {
    const { raw_text, industry, niche } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    const cleanText = (raw_text || "").substring(0, 25000);

    // AUTO-DETECT MODEL
    const modelName = await getBestModel(apiKey!);
    const genAI = new GoogleGenerativeAI(apiKey!);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
      Deep Audit for AEO.
      Industry: ${industry} | Niche: ${niche}
      Content: ${cleanText}...

      Task:
      1. Score (0-100) on Information Gain.
      2. 3 SPECIFIC questions users ask that this site FAILS to answer.
      3. 3-step technical roadmap.

      RETURN JSON ONLY:
      {
        "scores": { "overall": Number, "content": Number, "authority": Number, "technical": Number },
        "verdict": { "status": "Invisible" | "Emerging" | "Visible" | "Dominant", "summary": "String" },
        "missed_opportunities": [
          { "question": "Specific Question?", "volume": "High" },
          { "question": "Specific Question?", "volume": "High" },
          { "question": "Specific Question?", "volume": "Med" }
        ],
        "roadmap": [
          { "title": "Strategy Title", "difficulty": "Easy", "impact": "High", "desc": "Instruction." },
          { "title": "Strategy Title", "difficulty": "Med", "impact": "High", "desc": "Instruction." },
          { "title": "Strategy Title", "difficulty": "Hard", "impact": "High", "desc": "Instruction." }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();

    return NextResponse.json(JSON.parse(text));

  } catch (error: any) {
    console.error("Deep Scan Error:", error.message);
    return NextResponse.json({ error: true, details: error.message });
  }
}