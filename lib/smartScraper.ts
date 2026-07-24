import * as cheerio from 'cheerio'; // You likely already have this or a similar parser
import { safeFetchText, safeFetchWithRedirects } from './security';
import { debugLog } from './logger';

// --- CONFIGURATION ---
// Threshold: If visible text is less than this, we assume it's a "React Shell" and trigger fallback
const MIN_TEXT_LENGTH = 300; 

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

function getErrorCode(error: unknown) {
  if (typeof error === 'object' && error && 'cause' in error) {
    const cause = (error as { cause?: { code?: string } }).cause;
    if (cause?.code) return cause.code;
  }

  if (typeof error === 'object' && error && 'code' in error) {
    const code = (error as { code?: string }).code;
    if (code) return code;
  }

  return '';
}

function isTlsFetchError(error: unknown) {
  const code = getErrorCode(error);
  return [
    'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
    'DEPTH_ZERO_SELF_SIGNED_CERT',
    'CERT_HAS_EXPIRED',
    'ERR_TLS_CERT_ALTNAME_INVALID',
  ].includes(code);
}

function buildLimitedFallbackHtml(url: string, reason: string) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <title>Limited audit capture for ${url}</title>
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body>
        <main>
          <h1>Limited crawl fallback</h1>
          <p>The audit could not fetch the target page normally and switched into a limited fallback mode.</p>
          <p>Reason: ${reason}</p>
          <p>URL: ${url}</p>
          <p>This means the report should emphasize fetch reliability, crawl access, and technical trust issues before making broader SEO claims.</p>
        </main>
      </body>
    </html>
  `;
}

export async function fetchSmart(url: string) {
  debugLog('[SmartScraper] Attempting Tier 1 direct fetch.', { url });
  let tierOneHtml = '';
  let tierOneError: unknown = null;
  
  // --- TIER 1: FAST DIRECT FETCH ---
  try {
    const res = await safeFetchWithRedirects(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      next: { revalidate: 0 } // Don't cache for audits
    });

    if (!res.ok) throw new Error(`Direct fetch failed: ${res.status}`);
    
    const html = await res.text();
    tierOneHtml = html;
    
    // Check Quality
    if (isContentValid(html)) {
      debugLog('[SmartScraper] Tier 1 succeeded.');
      return html;
    } else {
      console.warn(`⚠️ [SmartScraper] Tier 1 yielded low content (React Shell?). Triggering Tier 2.`);
    }

  } catch (error) {
    tierOneError = error;
    console.warn(`⚠️ [SmartScraper] Tier 1 Error:`, error);
  }

  // --- TIER 2: HEADLESS BROWSER API (Fallback) ---
  if (!SCRAPER_API_KEY) {
    console.error('❌ [SmartScraper] No API Key found for Tier 2. Falling back to limited result.');

    if (tierOneHtml) {
      return tierOneHtml;
    }

    if (tierOneError) {
      const reason = isTlsFetchError(tierOneError)
        ? `TLS certificate fetch failure (${getErrorCode(tierOneError)})`
        : tierOneError instanceof Error
        ? tierOneError.message
        : 'Direct fetch failed';
      return buildLimitedFallbackHtml(url, reason);
    }

    try {
      return await safeFetchText(url);
    } catch (fallbackError) {
      const reason =
        fallbackError instanceof Error
          ? fallbackError.message
          : 'Direct fetch failed with no alternate scraper configured';
      return buildLimitedFallbackHtml(url, reason);
    }
  }

  debugLog('[SmartScraper] Attempting Tier 2 scraping API.');
  
  try {
    // Example using ZenRows / ScraperAPI pattern (Adjust based on your provider)
    // Most work like: https://api.provider.com/?api_key=XYZ&url=TARGET&js_render=true
    
    const apiUrl = `https://api.zenrows.com/v1/?apikey=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}&js_render=true&premium_proxy=true`;
    
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API fetch failed: ${res.status}`);
    
    const html = await res.text();
    debugLog('[SmartScraper] Tier 2 succeeded.', { htmlLength: html.length });
    return html;

  } catch (error) {
    console.error(`❌ [SmartScraper] Tier 2 Failed. Returning fallback result.`);

    if (tierOneHtml) {
      return tierOneHtml;
    }

    const reason =
      error instanceof Error
        ? error.message
        : tierOneError instanceof Error
        ? tierOneError.message
        : 'Scraping API fetch failed';

    return buildLimitedFallbackHtml(url, reason);
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
