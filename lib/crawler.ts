import * as cheerio from 'cheerio';
import { fetchSmart } from './smartScraper';
import { safeFetchWithRedirects } from './security';
import { CrawlPayload } from '../types/crawl';

/**
 * Crawl a website and extract structured data for SEO analysis
 * Pure data extraction - no LLM calls
 */
export async function crawlWebsite(url: string): Promise<CrawlPayload> {
  console.log(`🕷️ [Crawler] Starting crawl for: ${url}`);
  
  // Fetch HTML using the smart scraper
  const html = await fetchSmart(url);
  const $ = cheerio.load(html);
  
  // Parse URL for origin
  const parsedUrl = new URL(url);
  const origin = parsedUrl.origin;
  
  // Extract all data sections
  const meta = extractMeta($);
  const headings = extractHeadings($);
  const content = extractContent($, html);
  const technical = await extractTechnical($, origin, url);
  const issues = detectIssues(meta, headings, content, technical);
  
  const payload: CrawlPayload = {
    url,
    fetchedAt: new Date().toISOString(),
    meta,
    headings,
    content,
    technical,
    issues,
    rawHtml: html.substring(0, 50000),
  };
  
  console.log(`✅ [Crawler] Crawl complete for: ${url}`);
  return payload;
}

/**
 * Extract meta tags and SEO metadata
 */
function extractMeta($: cheerio.CheerioAPI) {
  return {
    title: $('title').first().text().trim() || '',
    description: $('meta[name="description"]').attr('content')?.trim() || '',
    ogTitle: $('meta[property="og:title"]').attr('content')?.trim() || '',
    ogDescription: $('meta[property="og:description"]').attr('content')?.trim() || '',
    ogSiteName: $('meta[property="og:site_name"]').attr('content')?.trim() || '',
    ogImage: $('meta[property="og:image"]').attr('content')?.trim() || '',
    applicationName: $('meta[name="application-name"]').attr('content')?.trim() || '',
    canonical: $('link[rel="canonical"]').attr('href')?.trim() || '',
    robots: $('meta[name="robots"]').attr('content')?.trim() || '',
    viewport: $('meta[name="viewport"]').attr('content')?.trim() || '',
    charset: $('meta[charset]').attr('charset')?.trim() || 
             $('meta[http-equiv="Content-Type"]').attr('content')?.match(/charset=([^;]+)/)?.[1]?.trim() || '',
  };
}

/**
 * Extract heading structure
 */
function extractHeadings($: cheerio.CheerioAPI) {
  const h1 = $('h1').map((_, el) => $(el).text().trim()).get();
  const h2 = $('h2').map((_, el) => $(el).text().trim()).get();
  const h3 = $('h3').map((_, el) => $(el).text().trim()).get();
  
  return {
    h1,
    h2,
    h3,
    h1Count: h1.length,
    hasMultipleH1: h1.length > 1,
  };
}

/**
 * Extract content and text data
 */
function extractContent($: cheerio.CheerioAPI, rawHtml: string) {
  // Remove non-content elements
  const $body = $('body').clone();
  $body.find('script, style, noscript, svg, iframe').remove();
  
  // Get visible text
  const visibleText = $body.text().trim().replace(/\s+/g, ' ');
  const bodyText = visibleText.substring(0, 30000);
  
  // Count words (split by whitespace)
  const words = visibleText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Detect if it's client-side rendered (React shell)
  const isClientSideRendered = detectClientSideRendering($, visibleText);
  
  return {
    visibleTextLength: visibleText.length,
    isClientSideRendered,
    bodyText,
    wordCount,
  };
}

/**
 * Detect if the page is client-side rendered
 */
function detectClientSideRendering($: cheerio.CheerioAPI, visibleText: string): boolean {
  // Check for common SSR/CSR indicators
  const hasReactRoot = $('#root').length > 0 || $('#__next').length > 0 || $('[data-reactroot]').length > 0;
  const hasMinimalText = visibleText.length < 300;
  const hasJavaScriptWarning = visibleText.toLowerCase().includes('enable javascript') || 
                                visibleText.toLowerCase().includes('javascript is required');
  
  return (hasReactRoot && hasMinimalText) || hasJavaScriptWarning;
}

/**
 * Extract technical SEO data
 */
async function extractTechnical($: cheerio.CheerioAPI, origin: string, currentUrl: string) {
  // Schema markup detection
  const schemaData = extractSchemaMarkup($);
  
  // Open Graph detection
  const hasOpenGraph = $('meta[property^="og:"]').length > 0;
  
  // Twitter Cards detection
  const hasTwitterCards = $('meta[name^="twitter:"]').length > 0;
  
  // Favicon detection
  const hasFavicon = $('link[rel*="icon"]').length > 0 || $('link[rel="shortcut icon"]').length > 0;
  
  // Link analysis
  const links = extractLinks($, origin, currentUrl);
  
  // Image analysis
  const images = extractImages($);
  
  // Check for robots.txt and sitemap (with timeout)
  const [hasRobotsTxt, hasSitemap] = await Promise.all([
    checkUrlExists(`${origin}/robots.txt`, 5000),
    checkUrlExists(`${origin}/sitemap.xml`, 5000),
  ]);
  
  return {
    hasSchemaMarkup: schemaData.hasSchemaMarkup,
    schemaTypes: schemaData.schemaTypes,
    hasOpenGraph,
    hasTwitterCards,
    hasFavicon,
    hasRobotsTxt,
    hasSitemap,
    internalLinkCount: links.internal,
    externalLinkCount: links.external,
    imageCount: images.total,
    imagesWithAlt: images.withAlt,
    imagesWithoutAlt: images.withoutAlt,
  };
}

/**
 * Extract and parse schema markup (JSON-LD and microdata)
 */
function extractSchemaMarkup($: cheerio.CheerioAPI) {
  const schemaTypes: string[] = [];
  let hasSchemaMarkup = false;
  
  // Extract JSON-LD schemas
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html();
      if (content) {
        const parsed = JSON.parse(content);
        hasSchemaMarkup = true;
        
        // Handle both single objects and arrays
        const schemas = Array.isArray(parsed) ? parsed : [parsed];
        
        schemas.forEach((schema: any) => {
          if (schema['@type']) {
            const type = Array.isArray(schema['@type']) ? schema['@type'] : [schema['@type']];
            type.forEach((t: string) => {
              if (!schemaTypes.includes(t)) {
                schemaTypes.push(t);
              }
            });
          }
          
          // Handle @graph arrays (common in WordPress/Yoast)
          if (schema['@graph'] && Array.isArray(schema['@graph'])) {
            schema['@graph'].forEach((item: any) => {
              if (item['@type']) {
                const type = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
                type.forEach((t: string) => {
                  if (!schemaTypes.includes(t)) {
                    schemaTypes.push(t);
                  }
                });
              }
            });
          }
        });
      }
    } catch (e) {
      // Invalid JSON, skip
      console.warn('[Crawler] Invalid JSON-LD schema:', e);
    }
  });
  
  // Extract microdata schemas
  $('[itemtype]').each((_, el) => {
    hasSchemaMarkup = true;
    const itemType = $(el).attr('itemtype');
    if (itemType) {
      // Extract the type name from the schema.org URL
      const match = itemType.match(/schema\.org\/(\w+)/);
      if (match && match[1] && !schemaTypes.includes(match[1])) {
        schemaTypes.push(match[1]);
      }
    }
  });
  
  return {
    hasSchemaMarkup,
    schemaTypes,
  };
}

/**
 * Extract and categorize links
 */
function extractLinks($: cheerio.CheerioAPI, origin: string, currentUrl: string) {
  let internal = 0;
  let external = 0;
  
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    
    try {
      // Skip anchors and javascript links
      if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      
      // Parse the URL
      const absoluteUrl = new URL(href, currentUrl);
      
      if (absoluteUrl.origin === origin) {
        internal++;
      } else {
        external++;
      }
    } catch (e) {
      // Invalid URL, skip
    }
  });
  
  return { internal, external };
}

/**
 * Extract and analyze images
 */
function extractImages($: cheerio.CheerioAPI) {
  let total = 0;
  let withAlt = 0;
  let withoutAlt = 0;
  
  $('img').each((_, el) => {
    total++;
    const alt = $(el).attr('alt');
    
    if (alt && alt.trim().length > 0) {
      withAlt++;
    } else {
      withoutAlt++;
    }
  });
  
  return { total, withAlt, withoutAlt };
}

/**
 * Check if a URL exists (for robots.txt and sitemap)
 */
async function checkUrlExists(url: string, timeoutMs: number): Promise<boolean | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const headOptions: RequestInit = {
    method: 'HEAD',
    signal: controller.signal,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SEO-Crawler/1.0)',
    },
  };

  try {
    const response = await safeFetchWithRedirects(url, headOptions);
    clearTimeout(timeout);
    if (response.ok) return true;

    if (response.status === 405 || response.status === 403 || response.status === 501) {
      // Some servers block HEAD; retry with GET in a lightweight way.
      const fallbackController = new AbortController();
      const fallbackTimeout = setTimeout(() => fallbackController.abort(), timeoutMs);

      try {
        const getResp = await safeFetchWithRedirects(url, {
          method: 'GET',
          signal: fallbackController.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEO-Crawler/1.0)',
            Range: 'bytes=0-1024',
          },
        });
        clearTimeout(fallbackTimeout);
        return getResp.ok;
      } catch {
        clearTimeout(fallbackTimeout);
        return null;
      }
    }

    return false;
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      return null;
    }
    return null;
  }
}

/**
 * Detect SEO issues based on extracted data
 */
function detectIssues(
  meta: ReturnType<typeof extractMeta>,
  headings: ReturnType<typeof extractHeadings>,
  content: ReturnType<typeof extractContent>,
  technical: Awaited<ReturnType<typeof extractTechnical>>
) {
  return {
    missingMetaDescription: !meta.description || meta.description.length === 0,
    missingH1: headings.h1Count === 0,
    multipleH1s: headings.hasMultipleH1,
    missingViewport: !meta.viewport || meta.viewport.length === 0,
    missingCanonical: !meta.canonical || meta.canonical.length === 0,
    missingSchemaMarkup: !technical.hasSchemaMarkup,
    lowContentLength: content.wordCount < 300,
    noAltTextOnImages: technical.imageCount > 0 && (technical.imagesWithoutAlt / technical.imageCount) > 0.5,
  };
}
