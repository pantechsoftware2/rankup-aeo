// 1. EXPORT THE INTERFACE DIRECTLY
export interface SearchScanResult {
  title: string;
  link: string;
  snippet: string;
}

/**
 * Helper: Performs a single Serper query
 */
async function searchSerper(query: string, retries = 2): Promise<SearchScanResult[]> {
  const serperApiKey = process.env.SERPER_API_KEY;

  if (!serperApiKey) {
    console.error('SERPER_API_KEY is not set.');
    return [];
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: 10,
          gl: 'us',
          hl: 'en',
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        throw new Error(`Serper responded with ${response.status}`);
      }

      const data = await response.json();
      const results: SearchScanResult[] = (data.organic || []).map((item: any) => ({
        title: item.title || '',
        link: item.link || '',
        snippet: item.snippet || '',
      }));

      if (results.length > 0) {
        return results;
      }

      // If 0 results and we have retries left, throw to trigger retry
      if (attempt < retries) throw new Error('No results found');

    } catch (error: any) {
      if (attempt === retries) {
        console.warn(`⚠️ Failed query "${query}" after ${retries} retries.`);
        return [];
      }
      // Wait before retry (exponential backoff)
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  return [];
}

/**
 * Main Function: Runs 3 strategic queries and returns a FLATTENED array
 */
export async function performBrandSearch(brandName: string): Promise<SearchScanResult[]> {
  const queries = [
    `"${brandName}" reviews and complaints`,       // For Sentiment
    `"${brandName}" competitors and alternatives`, // For Market Position
    `top companies like ${brandName}`,             // For Category Context
  ];

  console.log(`\n📋 Starting Deep Search for: ${brandName}...`);

  const resultsArrays = await Promise.all(queries.map(q => searchSerper(q)));

  // Flatten and deduplicate
  const allResults: SearchScanResult[] = [];
  const seenLinks = new Set<string>();

  resultsArrays.flat().forEach(item => {
    if (!seenLinks.has(item.link)) {
      seenLinks.add(item.link);
      allResults.push(item);
    }
  });

  console.log(`✅ Search Complete. Found ${allResults.length} unique sources.`);

  return allResults;
}
