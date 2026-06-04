import * as cheerio from 'cheerio';
import { crawlWebsite } from '@/lib/crawler';
import type { CrawlPayload } from '@/types/crawl';
import type { InternalPageEvidence } from './types';

const PAGE_KEYWORDS = [
  'about',
  'team',
  'founder',
  'services',
  'service',
  'solution',
  'solutions',
  'pricing',
  'plans',
  'faq',
  'blog',
  'guide',
  'compare',
  'comparison',
  'case-study',
  'case-studies',
  'science',
  'ingredients',
  'research',
  'reviews',
  'contact',
  'resources',
  'article',
];

function normalizePathUrl(url: string) {
  const parsed = new URL(url);
  parsed.hash = '';
  parsed.search = '';
  if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }
  return parsed.toString();
}

function scoreLink(link: string) {
  const lower = link.toLowerCase();
  return PAGE_KEYWORDS.reduce((score, keyword) => {
    if (lower.includes(keyword)) return score + 3;
    return score;
  }, 0);
}

function extractInternalLinks(home: CrawlPayload) {
  const $ = cheerio.load(home.rawHtml || '');
  const origin = new URL(home.url).origin;
  const seen = new Set<string>();
  const links: Array<{ url: string; score: number }> = [];

  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').trim();
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    try {
      const absolute = new URL(href, home.url);
      if (absolute.origin !== origin) return;
      const normalized = normalizePathUrl(absolute.toString());
      if (seen.has(normalized)) return;
      seen.add(normalized);
      links.push({ url: normalized, score: scoreLink(normalized) });
    } catch {
      return;
    }
  });

  return links.sort((a, b) => b.score - a.score).map((item) => item.url);
}

function buildExcerpt(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  return normalized.slice(0, 280);
}

function toInternalPageEvidence(page: CrawlPayload): InternalPageEvidence {
  const issues = Object.entries(page.issues)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key);

  return {
    url: page.url,
    title: page.meta.title || page.meta.ogTitle || page.url,
    description: page.meta.description || page.meta.ogDescription || '',
    h1: page.headings.h1[0] || '',
    wordCount: page.content.wordCount,
    schemaTypes: page.technical.schemaTypes || [],
    issues,
    excerpt: buildExcerpt(page.content.bodyText || ''),
  };
}

export async function collectMultiPageEvidence(
  website: string,
  options: {
    maxPages?: number;
  } = {}
) {
  const maxPages = Math.max(1, Math.min(options.maxPages || 4, 6));

  const home = await crawlWebsite(website);
  const internalLinks = extractInternalLinks(home);

  const selectedUrls = [home.url];
  for (const link of internalLinks) {
    if (selectedUrls.length >= maxPages) break;
    if (!selectedUrls.includes(link)) {
      selectedUrls.push(link);
    }
  }

  const crawledPages: CrawlPayload[] = [];
  for (const pageUrl of selectedUrls) {
    if (pageUrl === home.url) {
      crawledPages.push(home);
      continue;
    }

    try {
      const page = await crawlWebsite(pageUrl);
      crawledPages.push(page);
    } catch (error) {
      console.warn(`[Deep Report] Failed to crawl page ${pageUrl}:`, error);
    }
  }

  const internalPages = crawledPages.map(toInternalPageEvidence);
  const keyEvidenceBlocks = internalPages
    .filter((page) => page.excerpt.length > 0)
    .map((page) => `${page.title}: ${page.excerpt}`);

  return {
    home,
    crawledPages,
    internalPages,
    keyEvidenceBlocks,
  };
}

