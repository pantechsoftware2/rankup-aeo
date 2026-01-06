import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60; 

async function getBestModel(apiKey: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    const models = data.models || [];
    const priority = ['gemini-1.5-pro-latest', 'gemini-1.5-pro-001', 'gemini-1.5-pro', 'gemini-1.0-pro'];
    for (const p of priority) {
      const found = models.find((m: any) => m.name.includes(p));
      if (found) return found.name.replace('models/', '');
    }
    return 'gemini-pro';
  } catch (e) { return "gemini-pro"; }
}

function extractMetaTags(html: string) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return {
    title: titleMatch ? titleMatch[1] : "",
    description: descMatch ? descMatch[1] : ""
  };
}

export async function POST(req: Request) {
  try {
    const { website } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: true, details: "API Key Missing" });

    // 1. DEEP SCRAPE
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); 
    let liveContent = "";
    let metaTags = { title: "", description: "" };

    try {
      const response = await fetch(website, { 
        signal: controller.signal,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
        }
      });
      if (response.ok) {
        const text = await response.text();
        metaTags = extractMetaTags(text);
        // Keep visible text for the "Clarity Audit"
        liveContent = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").substring(0, 30000);
      }
    } catch (e) { console.log("Scrape warning"); }
    clearTimeout(timeout);

    // 2. CONTEXT PREP
    const contextInput = `
      URL: ${website}
      HIDDEN META TITLE: ${metaTags.title} (Use this for accuracy)
      HIDDEN META DESC: ${metaTags.description} (Use this for accuracy)
      VISIBLE BODY TEXT: ${liveContent} (Critique this for clarity)
    `;

    // 3. THE "DUAL BRAIN" PROMPT
    const modelName = await getBestModel(apiKey);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
      Analyze this brand.
      DATA SOURCE: ${contextInput}
      
      TASK 1: ACCURACY (The "Goated" Part)
      Use the HIDDEN META TAGS to identify the *exact* Industry & Niche.
      (e.g., if Meta says "Airbnb Automation", do NOT say "General Real Estate").
      Identify 3 TRUE competitors based on this accurate niche.

      TASK 2: CLARITY AUDIT (The "Tough Love" Part)
      Ignore the Meta Tags now. Look ONLY at the VISIBLE BODY TEXT.
      Does the visible text *explicitly* state what the product is? 
      Or is it vague (e.g. "Unlock potential")?
      
      If Vague: Set 'is_clear' to false. Write a critique saying: "We identified you as [Niche] by decoding your metadata, but your homepage text is too vague for human users."

      RETURN JSON ONLY:
      {
        "meta": { "industry": "String", "niche": "String" },
        "clarity_audit": {
           "is_clear": Boolean,
           "critique": "String"
        },
        "competitors": [
          { "name": "Brand A", "traffic_share": 80 },
          { "name": "Brand B", "traffic_share": 60 },
          { "name": "Brand C", "traffic_share": 40 }
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