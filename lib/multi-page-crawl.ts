import * as cheerio from 'cheerio';
import { crawlWebsite } from '@/lib/crawler';
import type { CrawlPayload } from '@/types/crawl';
import type { InternalPageEvidence } from '@/types/comprehensive-report';

const PAGE_PRIORITY_PATTERNS = [
  /about/i,
  /product/i,
  /service/i,
  /pricing/i,
  /feature/i,
  /faq/i,
  /blog/i,
  /guide/i,
  /collection/i,
  /contact/i,
];

function normalizeUrl(url: string, origin: string) {
  try {
    const parsed = new URL(url, origin);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString();
  } catch {
    return '';
  }
}

function extractIssueLabels(crawl: CrawlPayload) {
  return Object.entries(crawl.issues)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key);
}

function scoreLink(url: string) {
  const path = new URL(url).pathname;
  const priorityBonus = PAGE_PRIORITY_PATTERNS.reduce((score, pattern, index) => {
    if (pattern.test(path)) {
      return score + (PAGE_PRIORITY_PATTERNS.length - index);
    }
    return score;
  }, 0);

  const depthPenalty = path.split('/').filter(Boolean).length;
  return priorityBonus - depthPenalty;
}

export function buildInternalPageEvidence(crawl: CrawlPayload): InternalPageEvidence {
  return {
    url: crawl.url,
    title: crawl.meta.title,
    description: crawl.meta.description,
    h1: crawl.headings.h1[0] || '',
    wordCount: crawl.content.wordCount,
    schemaTypes: crawl.technical.schemaTypes,
    issues: extractIssueLabels(crawl),
  };
}

function collectInternalLinks(homepage: CrawlPayload, maxCandidates = 8) {
  const $ = cheerio.load(homepage.rawHtml);
  const origin = new URL(homepage.url).origin;
  const seen = new Set<string>();
  const links: string[] = [];

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

    const normalized = normalizeUrl(href, origin);
    if (!normalized) return;

    try {
      const parsed = new URL(normalized);
      if (parsed.origin !== origin) return;
      if (parsed.pathname === '/' || /\.(png|jpe?g|svg|gif|webp|pdf)$/i.test(parsed.pathname)) return;

      if (!seen.has(normalized)) {
        seen.add(normalized);
        links.push(normalized);
      }
    } catch {
      // Skip invalid links.
    }
  });

  return links
    .sort((a, b) => scoreLink(b) - scoreLink(a))
    .slice(0, maxCandidates);
}

export async function collectMultiPageEvidence(homepage: CrawlPayload, maxPages = 4) {
  const pages: InternalPageEvidence[] = [buildInternalPageEvidence(homepage)];
  const candidates = collectInternalLinks(homepage, maxPages + 3);

  for (const candidate of candidates.slice(0, maxPages)) {
    try {
      const crawl = await crawlWebsite(candidate);
      pages.push(buildInternalPageEvidence(crawl));
    } catch (error) {
      console.warn('[Multi-Page Crawl] Failed to crawl candidate:', candidate, error);
    }
  }

  return pages;
}
