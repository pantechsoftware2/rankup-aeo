import * as cheerio from 'cheerio';
import { crawlWebsite } from '@/lib/crawler';
import { performBrandSearch, type SearchScanResult } from '@/lib/serper';
import type { CrawlPayload } from '@/types/crawl';
import type { ComprehensiveAuditEvidence, InternalPageEvidence, OffsiteResearch, OffsiteSource } from '@/types/comprehensive-report';
import type { DeepAuditReport } from '@/types/deep-audit';
import type { FastScanResult } from '@/types/fast-scan';

const DEFAULT_MAX_INTERNAL_PAGES = 5;
const DEFAULT_MAX_OFFSITE_SOURCES = 12;

function normalizeUrl(input: string): string {
  const normalized = input.trim();
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }
  return `https://${normalized}`;
}

function toHostname(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//i, '').replace(/^www\./, '').split('/')[0];
  }
}

function scoreCandidateLink(href: string): number {
  const path = href.toLowerCase();
  let score = 0;

  if (path === '/' || path === '') score += 100;
  if (path.includes('/about')) score += 90;
  if (path.includes('/team')) score += 85;
  if (path.includes('/pricing')) score += 80;
  if (path.includes('/services')) score += 78;
  if (path.includes('/solutions')) score += 76;
  if (path.includes('/product')) score += 74;
  if (path.includes('/blog')) score += 72;
  if (path.includes('/insight')) score += 68;
  if (path.includes('/resource')) score += 66;
  if (path.includes('/faq')) score += 62;
  if (path.includes('/contact')) score += 60;
  if (path.includes('/case')) score += 58;
  if (path.includes('/compare') || path.includes('/versus')) score += 56;

  if (path.includes('?')) score -= 20;
  if (path.includes('#')) score -= 10;
  if (path.includes('/tag/')) score -= 25;
  if (path.includes('/category/')) score -= 20;
  if (path.includes('/author/')) score -= 20;
  if (path.includes('/page/')) score -= 15;

  return score;
}

function extractInternalLinks(homepage: CrawlPayload, website: string): string[] {
  const html = homepage.rawHtml || '';
  if (!html) {
    return [];
  }

  const $ = cheerio.load(html);
  const origin = new URL(normalizeUrl(website)).origin;
  const seen = new Set<string>();

  const candidates = $('a[href]')
    .map((_, el) => $(el).attr('href')?.trim() || '')
    .get()
    .filter(Boolean)
    .map((href) => {
      try {
        if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          return null;
        }

        const absolute = new URL(href, website);
        if (absolute.origin !== origin) {
          return null;
        }

        absolute.hash = '';
        absolute.search = '';
        const normalized = absolute.toString().replace(/\/$/, '');
        if (normalized === origin.replace(/\/$/, '')) {
          return `${origin}/`;
        }

        return normalized;
      } catch {
        return null;
      }
    })
    .filter((value): value is string => Boolean(value));

  const sorted = candidates.sort((a, b) => scoreCandidateLink(b) - scoreCandidateLink(a));

  return sorted.filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

function extractPageTitle($: cheerio.CheerioAPI): string {
  return $('title').first().text().trim() || '';
}

function extractPageDescription($: cheerio.CheerioAPI): string {
  return $('meta[name="description"]').attr('content')?.trim() || '';
}

function extractPrimaryHeading($: cheerio.CheerioAPI): string {
  return $('h1').first().text().trim() || '';
}

function extractSchemaTypes($: cheerio.CheerioAPI): string[] {
  const schemaTypes = new Set<string>();

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html();
      if (!content) return;

      const parsed = JSON.parse(content);
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      nodes.forEach((node: any) => {
        const types = node?.['@type'];
        if (Array.isArray(types)) {
          types.forEach((type) => typeof type === 'string' && schemaTypes.add(type));
        } else if (typeof types === 'string') {
          schemaTypes.add(types);
        }

        if (Array.isArray(node?.['@graph'])) {
          node['@graph'].forEach((graphNode: any) => {
            const graphType = graphNode?.['@type'];
            if (Array.isArray(graphType)) {
              graphType.forEach((type) => typeof type === 'string' && schemaTypes.add(type));
            } else if (typeof graphType === 'string') {
              schemaTypes.add(graphType);
            }
          });
        }
      });
    } catch {
      // Ignore malformed schema. The report should stay resilient.
    }
  });

  return Array.from(schemaTypes);
}

function buildInternalPageEvidence(url: string, crawl: CrawlPayload): InternalPageEvidence {
  const $ = cheerio.load(crawl.rawHtml || '');
  return {
    url,
    title: extractPageTitle($),
    description: extractPageDescription($),
    h1: extractPrimaryHeading($),
    wordCount: crawl.content.wordCount,
    schemaTypes: extractSchemaTypes($),
    issues: Object.entries(crawl.issues)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key),
  };
}

function classifyPlatform(link: string): OffsiteSource['platform'] {
  const hostname = toHostname(link);
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
  if (hostname.includes('reddit.com')) return 'reddit';
  if (hostname.includes('amazon.')) return 'amazon';
  if (hostname.includes('linkedin.com')) return 'linkedin';
  if (hostname.includes('trustpilot') || hostname.includes('reviews.io') || hostname.includes('g2.com') || hostname.includes('capterra')) return 'reviews';
  if (hostname.includes('news') || hostname.includes('post') || hostname.includes('magazine') || hostname.includes('journal')) return 'news';
  if (hostname.includes('compare') || hostname.includes('versus') || hostname.includes('alternative')) return 'comparison';
  return 'other';
}

function mapSearchResultToSource(result: SearchScanResult): OffsiteSource {
  return {
    title: result.title,
    link: result.link,
    snippet: result.snippet,
    platform: classifyPlatform(result.link),
  };
}

function summarizePlatforms(sources: OffsiteSource[]): Record<string, number> {
  return sources.reduce<Record<string, number>>((acc, source) => {
    acc[source.platform] = (acc[source.platform] || 0) + 1;
    return acc;
  }, {});
}

function dedupeByLink(sources: OffsiteSource[]): OffsiteSource[] {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = source.link.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function collectInternalPageEvidence(
  website: string,
  homepageCrawl: CrawlPayload,
  maxPages = DEFAULT_MAX_INTERNAL_PAGES
): Promise<InternalPageEvidence[]> {
  const homepageUrl = normalizeUrl(website);
  const candidates = extractInternalLinks(homepageCrawl, homepageUrl);
  const selected = candidates.slice(0, maxPages);

  const homepageEvidence = buildInternalPageEvidence(homepageUrl, homepageCrawl);
  const results: InternalPageEvidence[] = [homepageEvidence];

  for (const candidate of selected) {
    if (candidate === homepageUrl || results.some((item) => item.url === candidate)) {
      continue;
    }

    try {
      const crawl = await crawlWebsite(candidate);
      results.push(buildInternalPageEvidence(candidate, crawl));
    } catch (error) {
      console.warn(`[Report Evidence] Failed to crawl internal page ${candidate}:`, error);
    }
  }

  return results.slice(0, maxPages);
}

export async function collectOffsiteResearch(
  brandName: string,
  competitorHints: string[] = [],
  maxSources = DEFAULT_MAX_OFFSITE_SOURCES
): Promise<OffsiteResearch> {
  const searchResults = await performBrandSearch(brandName);
  const mapped = dedupeByLink(searchResults.map(mapSearchResultToSource)).slice(0, maxSources);
  const platformCounts = summarizePlatforms(mapped);

  const mentionSummary = mapped.slice(0, 5).map((source) => {
    const host = toHostname(source.link);
    return `${host}: ${source.title || source.snippet || 'No snippet available'}`;
  });

  const competitorNames = Array.from(
    new Set(
      [
        ...competitorHints,
        ...searchResults
          .map((result) => result.title)
          .flatMap((title) => title.split(/\s+[|:-]\s+|\s+vs\s+|\s+versus\s+/i))
          .map((part) => part.trim())
          .filter((part) => part.length > 2),
      ]
    )
  ).slice(0, 12);

  return {
    sourceCount: mapped.length,
    platformCounts,
    notableSources: mapped,
    competitorNames,
    mentionSummary,
  };
}

export async function collectComprehensiveAuditEvidence(input: {
  website: string;
  brandLabel: string;
  fast: FastScanResult;
  deep: DeepAuditReport;
  maxInternalPages?: number;
}): Promise<ComprehensiveAuditEvidence> {
  const homepageCrawl = input.fast?.['crawl' as keyof FastScanResult] as any;
  const crawl = homepageCrawl && typeof homepageCrawl === 'object' ? homepageCrawl : undefined;

  if (!crawl) {
    throw new Error('Fast scan crawl payload is required to build comprehensive evidence.');
  }

  const [internalPages, offsiteResearch] = await Promise.all([
    collectInternalPageEvidence(input.website, crawl, input.maxInternalPages || DEFAULT_MAX_INTERNAL_PAGES),
    collectOffsiteResearch(input.brandLabel, input.fast?.competitors?.competitors?.map((competitor) => competitor.name) || []),
  ]);

  return {
    website: input.website,
    brandLabel: input.brandLabel,
    generatedAt: new Date().toISOString(),
    crawl,
    fast: input.fast,
    deep: input.deep,
    internalPages,
    offsiteResearch,
  };
}
