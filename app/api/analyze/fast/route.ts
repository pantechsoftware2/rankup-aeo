import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';
import { fetchSmart } from "@/lib/smartScraper";

export const maxDuration = 60; 

async function getBestModel(apiKey: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    const models = data.models || [];

    // 1. Try to find the BEST model (Pro)
    const priority = ['gemini-1.5-pro', 'gemini-1.5-pro-latest', 'gemini-1.5-pro-001'];
    for (const p of priority) {
      const found = models.find((m: any) => m.name.includes(p));
      if (found) return found.name.replace('models/', '');
    }

    // 2. If no Pro, find ANY model that generates text (Panic Mode)
    const anyGenModel = models.find((m: any) => m.supportedGenerationMethods?.includes('generateContent'));
    if (anyGenModel) return anyGenModel.name.replace('models/', '');

    // 3. Absolute last resort (Flash is safest)
    return 'gemini-1.5-flash';
  } catch (e) {
    console.error("Model list failed", e);
    return "gemini-1.5-flash"; 
  }
}

export async function POST(req: Request) {
  try {
    let { website } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!website) return NextResponse.json({ error: true, details: "Website URL required" });
    if (!website.startsWith("http")) website = `https://${website}`;

    if (!apiKey) return NextResponse.json({ error: true, details: "API Key Missing" });

    // 1. DEEP SCRAPE
    let liveContent = "";
    let metaTags = { title: "", description: "" };

    try {
      const html = await fetchSmart(website);
      if (html) {
        const $ = cheerio.load(html);
        const title = $('title').first().text().trim() || $('meta[property="og:title"]').attr('content') || "";
        const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || "";
        metaTags = { title, description };
        $('script, style, noscript, iframe, svg').remove();
        liveContent = $('body').text().replace(/\s+/g, " ").trim().substring(0, 30000);
      }
    } catch (e) { console.log("Scrape warning", e); }

    // 2. DUAL BRAIN PROMPT
    const isCSR = liveContent.length < 200;
    const contextInput = `
      URL: ${website}
      HIDDEN META TITLE: ${metaTags.title}
      HIDDEN META DESC: ${metaTags.description}
      VISIBLE BODY TEXT: ${isCSR ? "[[Scraper Warning: Minimal content detected. Site is likely Client-Side Rendered.]]" : liveContent}
    `;

    const modelName = await getBestModel(apiKey);
    console.log("Using Model:", modelName); 
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0, // Deterministic output for consistent scoring
      }
    });

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
      Or is it vague (e.g. "Unlock potential") or missing due to the Scraper Warning?
      
      If Vague: Set 'is_clear' to false. Write a critique saying: "We identified you as [Niche] by decoding your metadata, but your homepage text is too vague for human users."
      If Vague or Warning: Set 'is_clear' to false. 
      If Scraper Warning present, critique: "This site appears to be Client-Side Rendered (JavaScript), so I couldn't read the visible text to audit clarity."
      Else, critique: "We identified you as [Niche] by decoding your metadata, but your homepage text is too vague for human users."

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
    let text = result.response.text().replace(/```json|```/g, '').trim();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }
    
    return NextResponse.json({ ...JSON.parse(text), raw_text: liveContent });

  } catch (error: any) {
    console.error("Fast Scan Error:", error);
    return NextResponse.json({ error: true, details: error.message });
  }
}