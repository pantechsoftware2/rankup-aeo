import { NextResponse } from "next/server";
import { performBrandSearch } from "@/lib/serper";
import { generateValidatedInsight } from "@/lib/gemini";

// Prevent Vercel timeouts - 5 minutes for comprehensive analysis
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { brandName, industry, niche } = await req.json();

    if (!brandName) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting Analysis for: ${brandName}`);

    // Step 1: Search (Get the results array)
    // Note: We expect performBrandSearch to return SearchScanResult[]
    const searchResults = await performBrandSearch(brandName);

    // Step 2: Analyze (Pass all 4 required arguments)
    const report = await generateValidatedInsight(
      brandName,
      industry || "General",  // Default if missing
      niche || "General",     // Default if missing
      searchResults
    );

    return NextResponse.json(report);

  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze brand" },
      { status: 500 }
    );
  }
}