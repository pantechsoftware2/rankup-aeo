import * as cheerio from 'cheerio';
import { crawlWebsite } from '@/lib/crawler';
import type { CrawlPayload } from '@/types/crawl';
import type { KeywordOpportunity, PageEvidence, SiteEvidenceBundle } from '@/types/consulting-report';

function isLimitedFallback(homepage: CrawlPayload) {
  const text = `${homepage.meta.title} ${homepage.content.bodyText}`.toLowerCase();
  return text.includes('limited crawl fallback') || text.includes('limited audit capture');
}

function isParkedDomain(homepage: CrawlPayload) {
  const text = `${homepage.meta.title} ${homepage.content.bodyText}`.toLowerCase();
  return text.includes('is for sale') || text.includes('buy this domain') || text.includes('parked free');
}

function isPlaceholderLike(homepage: CrawlPayload) {
  const text = `${homepage.meta.title} ${homepage.content.bodyText}`.toLowerCase();
  return (
    text.includes('documentation examples without needing permission') ||
    text.includes('avoid use in operations') ||
    text.includes('never use https') ||
    text.includes('is for sale') ||
    text.includes('not secure') ||
    text.includes('placeholder')
  );
}

function formatHostnameRoot(root: string) {
  return root
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function cleanBrandCandidate(value: string) {
  return value.replace(/[™®©]/g, '').replace(/\s+/g, ' ').trim();
}

function scoreBrandCandidate(candidate: string, hostnameRoot: string) {
  const cleaned = cleanBrandCandidate(candidate);
  const lower = cleaned.toLowerCase();
  const words = cleaned.split(/\s+/).filter(Boolean);
  let score = 0;

  if (!cleaned) return Number.NEGATIVE_INFINITY;
  if (cleaned.includes('.')) score -= 1;
  if (lower === hostnameRoot) score += 12;
  if (lower.includes(hostnameRoot)) score += 8;
  if (words.length >= 1 && words.length <= 3) score += 6;
  if (cleaned.length <= 24) score += 4;
  if (!/[.!?]/.test(cleaned)) score += 2;
  if (/^(the|best|all|everything|your)\b/i.test(cleaned)) score -= 4;
  if (/\b(ai|software|platform|tool|tools|works|you|team|teams|workspace|app|apps|business|businesses)\b/i.test(cleaned)) score -= 3;
  if (words.length > 5) score -= 6;

  return score;
}

function extractSchemaBrandCandidates(rawHtml: string) {
  const $ = cheerio.load(rawHtml || '');
  const candidates: string[] = [];

  const visit = (value: any) => {
    if (!value || typeof value !== 'object') return;

    if (typeof value.name === 'string') {
      const typeValue = Array.isArray(value['@type']) ? value['@type'].join(' ') : value['@type'] || '';
      if (/(organization|website|softwareapplication|localbusiness|corporation|product)/i.test(String(typeValue))) {
        candidates.push(cleanBrandCandidate(value.name));
      }
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (Array.isArray(value['@graph'])) {
      value['@graph'].forEach(visit);
    }
  };

  $('script[type="application/ld+json"]').each((_, element) => {
    const content = $(element).html();
    if (!content) return;

    try {
      visit(JSON.parse(content));
    } catch {
      // ignore invalid JSON-LD
    }
  });

  return candidates.filter(Boolean);
}

function inferBrandName(homepage: CrawlPayload) {
  if (isLimitedFallback(homepage) || isParkedDomain(homepage)) {
    return new URL(homepage.url).hostname.replace(/^www\./, '');
  }

  const hostnameRoot = new URL(homepage.url).hostname.replace(/^www\./, '').split('.')[0] || '';
  const schemaCandidates = extractSchemaBrandCandidates(homepage.rawHtml);
  const titleCandidates = [homepage.meta.ogSiteName, homepage.meta.applicationName, homepage.meta.ogTitle, homepage.meta.title]
    .flatMap((value) => value.split(/[-|:]/))
    .map(cleanBrandCandidate)
    .filter(Boolean);
  const headingCandidates = homepage.headings.h1.map(cleanBrandCandidate).filter(Boolean);
  const candidates = Array.from(
    new Set([...schemaCandidates, ...titleCandidates, ...headingCandidates, formatHostnameRoot(hostnameRoot)].filter(Boolean))
  );
  const ranked = candidates.sort((a, b) => scoreBrandCandidate(b, hostnameRoot) - scoreBrandCandidate(a, hostnameRoot));
  return ranked[0] || formatHostnameRoot(hostnameRoot) || new URL(homepage.url).hostname.replace(/^www\./, '');
}

function classifyPageType(url: string) {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname === '/' || pathname === '') return 'homepage';
  if (pathname.includes('blog') || pathname.includes('article')) return 'blog';
  if (pathname.includes('pricing') || pathname.includes('plan')) return 'pricing';
  if (pathname.includes('about') || pathname.includes('team')) return 'about';
  if (pathname.includes('faq')) return 'faq';
  if (pathname.includes('product')) return 'product';
  if (pathname.includes('feature') || pathname.includes('solution')) return 'feature';
  if (pathname.includes('collection') || pathname.includes('category')) return 'collection';
  return 'other';
}

function buildKeywordOpportunities(homepage: CrawlPayload, brandName: string): KeywordOpportunity[] {
  if (isLimitedFallback(homepage) || isPlaceholderLike(homepage) || isParkedDomain(homepage)) {
    return [
      {
        keyword: `${brandName} credibility`,
        intent: 'commercial',
        rationale: 'Focuses on rebuilding basic trust and legitimacy signals first.',
      },
      {
        keyword: `${brandName} reviews`,
        intent: 'commercial',
        rationale: 'Surfaces the lack of third-party proof and review visibility.',
      },
      {
        keyword: `${brandName} about`,
        intent: 'informational',
        rationale: 'Encourages stronger foundational brand and entity information.',
      },
    ];
  }

  const title = homepage.meta.title || '';
  const description = homepage.meta.description || '';
  const seed = `${title} ${description}`.toLowerCase();
  const topic = seed.split(/[.,|:-]/).find(Boolean)?.trim() || brandName;

  return [
    {
      keyword: `best ${topic}`.slice(0, 80),
      intent: 'commercial',
      rationale: 'High-intent discovery query tied to the core category.',
    },
    {
      keyword: `${brandName} alternatives`,
      intent: 'comparison',
      rationale: 'Captures buyers comparing your offer against obvious substitutes.',
    },
    {
      keyword: `${brandName} review`,
      intent: 'commercial',
      rationale: 'Supports branded demand and third-party validation behavior.',
    },
    {
      keyword: `how to choose ${topic}`.slice(0, 80),
      intent: 'informational',
      rationale: 'Supports citable educational content and top-of-funnel authority.',
    },
  ];
}

function extractCandidateLinks(homepage: CrawlPayload) {
  const $ = cheerio.load(homepage.rawHtml || '');
  const origin = new URL(homepage.url).origin;
  const candidates = new Set<string>();

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return;
    }

    try {
      const absolute = new URL(href, homepage.url);
      if (absolute.origin !== origin) return;
      if (absolute.pathname === '/' || absolute.pathname === '') return;
      if (absolute.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|pdf)$/)) return;
      candidates.add(absolute.toString());
    } catch {
      // ignore invalid urls
    }
  });

  const prioritized = [...candidates].sort((a, b) => {
    const score = (value: string) => {
      const path = new URL(value).pathname.toLowerCase();
      if (path.includes('pricing')) return 0;
      if (path.includes('feature') || path.includes('solution')) return 1;
      if (path.includes('product')) return 2;
      if (path.includes('blog') || path.includes('article')) return 3;
      if (path.includes('about') || path.includes('team')) return 4;
      if (path.includes('faq')) return 5;
      return 6;
    };
    return score(a) - score(b);
  });

  return prioritized.slice(0, 5);
}

function summarizePages(homepage: CrawlPayload, pages: PageEvidence[]) {
  const allPages = [homepage, ...pages.map((page) => page.crawl)];
  const averageWordCount = Math.round(
    allPages.reduce((sum, page) => sum + page.content.wordCount, 0) / Math.max(allPages.length, 1)
  );
  const pagesWithSchema = allPages.filter((page) => page.technical.hasSchemaMarkup).length;
  const pagesWithFaqContent = allPages.filter((page) =>
    page.headings.h2.some((heading) => heading.toLowerCase().includes('faq')) ||
    page.content.bodyText.toLowerCase().includes('frequently asked')
  ).length;
  const pagesWithAuthorSignals = allPages.filter((page) =>
    /(author|written by|reviewed by|founder|team)/i.test(`${page.content.bodyText} ${page.meta.title}`)
  ).length;
  const citableBlockCount = allPages.reduce((count, page) => {
    const sentences = page.content.bodyText.split(/(?<=[.!?])\s+/).filter(Boolean);
    const blocks = sentences.filter((sentence) => sentence.length >= 120 && sentence.length <= 220);
    return count + Math.min(blocks.length, 4);
  }, 0);

  return {
    indexedPageEstimate: Math.max(allPages.length * 3, 10),
    totalCrawledPages: allPages.length,
    pagesWithSchema,
    pagesWithAuthorSignals,
    pagesWithFaqContent,
    citableBlockCount,
    averageWordCount,
    botsLikelyAllowed: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot'].filter((bot) => {
      const robots = homepage.meta.robots.toLowerCase();
      return !robots.includes('noindex');
    }),
    likelyBlockedBots: homepage.meta.robots.toLowerCase().includes('noindex') ? ['GPTBot', 'ClaudeBot'] : [],
  };
}

export async function collectSiteEvidence(website: string) {
  const homepage = await crawlWebsite(website);
  const brandName = inferBrandName(homepage);
  const candidateLinks = extractCandidateLinks(homepage);

  const crawledPages = await Promise.all(
    candidateLinks.map(async (candidate) => {
      try {
        const crawl = await crawlWebsite(candidate);
        return {
          url: candidate,
          pageType: classifyPageType(candidate),
          crawl,
        } as PageEvidence;
      } catch (error) {
        console.warn('[Site Evidence] Skipping page crawl', candidate, error);
        return null;
      }
    })
  );

  const pages = crawledPages.filter(Boolean) as PageEvidence[];

  return {
    website,
    brandName,
    fetchedAt: new Date().toISOString(),
    homepage,
    pages,
    keywordOpportunities: buildKeywordOpportunities(homepage, brandName),
    offsite: {
      brandMentions: [],
      mentionBreakdown: {
        youtube: 0,
        reddit: 0,
        amazon: 0,
        linkedin: 0,
        directories: 0,
        news: 0,
        reviews: 0,
        other: 0,
      },
      competitors: [],
      discussionCount: 0,
      reviewSignals: [],
      summary: 'Off-site research not collected yet.',
    },
    derived: summarizePages(homepage, pages),
  } satisfies SiteEvidenceBundle;
}
