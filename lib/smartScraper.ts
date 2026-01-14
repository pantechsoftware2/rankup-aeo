import * as cheerio from 'cheerio'; // You likely already have this or a similar parser

// --- CONFIGURATION ---
// Threshold: If visible text is less than this, we assume it's a "React Shell" and trigger fallback
const MIN_TEXT_LENGTH = 300; 

// Your API Key (Get a free one from ZenRows, ScraperAPI, etc.)
// For now, if this is missing, it just returns the empty shell (current behavior)
const ZENROWS_API_KEY = process.env.ZENROWS_API_KEY; 

export async function fetchSmart(url: string) {
  console.log(`⚡ [SmartScraper] Attempting Tier 1 (Direct Fetch): ${url}`);
  
  // --- TIER 1: FAST DIRECT FETCH ---
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      next: { revalidate: 0 } // Don't cache for audits
    });

    if (!res.ok) throw new Error(`Direct fetch failed: ${res.status}`);
    
    const html = await res.text();
    
    // Check Quality
    if (isContentValid(html)) {
      console.log(`✅ [SmartScraper] Tier 1 Success.`);
      return html;
    } else {
      console.warn(`⚠️ [SmartScraper] Tier 1 yielded low content (React Shell?). Triggering Tier 2.`);
    }

  } catch (error) {
    console.warn(`⚠️ [SmartScraper] Tier 1 Error:`, error);
  }

  // --- TIER 2: HEADLESS BROWSER API (Fallback) ---
  if (!ZENROWS_API_KEY) {
    console.error("❌ [SmartScraper] No API Key found for Tier 2. Returning Tier 1 result (likely empty).");
    // If we failed Tier 1 and have no Tier 2, re-fetch Tier 1 just to return something, or return empty string
    const retry = await fetch(url);
    return await retry.text();
  }

  console.log(`🚀 [SmartScraper] Attempting Tier 2 (Scraping API)...`);
  
  try {
    // Example using ZenRows / ScraperAPI pattern (Adjust based on your provider)
    // Most work like: https://api.provider.com/?api_key=XYZ&url=TARGET&js_render=true
    
    const apiUrl = `https://api.zenrows.com/v1/?apikey=${ZENROWS_API_KEY}&url=${encodeURIComponent(url)}&js_render=true&premium_proxy=true`;
    
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API fetch failed: ${res.status}`);
    
    const html = await res.text();
    console.log(`✅ [SmartScraper] Tier 2 Success (${html.length} chars).`);
    return html;

  } catch (error) {
    console.error(`❌ [SmartScraper] Tier 2 Failed. Giving up.`);
    throw error;
  }
}

// --- HELPER: DETECT EMPTY / REACT SHELL SITES ---
function isContentValid(html: string): boolean {
  const $ = cheerio.load(html);
  
  // Remove scripts, styles, and hidden elements to see "Real" text
  $('script, style, noscript, svg, path').remove();
  const visibleText = $('body').text().trim().replace(/\s+/g, ' ');

  // 1. Check Length
  if (visibleText.length < MIN_TEXT_LENGTH) return false;

  // 2. Check for "You need to enable JavaScript" messages
  if (visibleText.toLowerCase().includes('enable javascript')) return false;

  return true;
}
