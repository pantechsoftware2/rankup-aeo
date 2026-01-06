import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60; 

async function getBestModel(apiKey: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    const models = data.models || [];

    const priority = [
      'gemini-1.5-pro-latest',
      'gemini-1.5-pro-001', 
      'gemini-1.5-pro',
      'gemini-1.0-pro',
      'gemini-pro'
    ];
    
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
    
    const cleanText = (raw_text || "").substring(0, 30000);

    // SMART SELECTOR
    const modelName = await getBestModel(apiKey!);
    const genAI = new GoogleGenerativeAI(apiKey!);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
      Deep Audit. Industry: ${industry}, Niche: ${niche}
      Context: ${cleanText}...

      Task:
      1. Score (0-100).
      2. 3 Missing Questions.
      3. 3-step Roadmap.

      RETURN JSON ONLY:
      {
        "scores": { "overall": Number, "content": Number, "authority": Number, "technical": Number },
        "verdict": { "status": "Visible", "summary": "String" },
        "missed_opportunities": [
          { "question": "Q1?", "volume": "High" },
          { "question": "Q2?", "volume": "High" },
          { "question": "Q3?", "volume": "Med" }
        ],
        "roadmap": [
          { "title": "Step 1", "difficulty": "Easy", "impact": "High", "desc": "Desc" },
          { "title": "Step 2", "difficulty": "Med", "impact": "High", "desc": "Desc" },
          { "title": "Step 3", "difficulty": "Hard", "impact": "High", "desc": "Desc" }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();

    return NextResponse.json(JSON.parse(text));

  } catch (error: any) {
    console.error("Deep Scan Error:", error);
    return NextResponse.json({ error: true, details: error.message });
  }
}