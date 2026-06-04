import { searchSerper } from '@/lib/serper';
import type { OffsiteResearch, OffsiteSource } from '@/types/comprehensive-report';

const PLATFORM_MATCHERS: Array<{ platform: OffsiteSource['platform']; patterns: RegExp[] }> = [
  { platform: 'youtube', patterns: [/youtube\.com/i, /youtu\.be/i] },
  { platform: 'reddit', patterns: [/reddit\.com/i] },
  { platform: 'amazon', patterns: [/amazon\./i] },
  { platform: 'linkedin', patterns: [/linkedin\.com/i] },
  { platform: 'reviews', patterns: [/trustpilot\.com/i, /reviews\.io/i, /g2\.com/i, /capterra\.com/i] },
  { platform: 'news', patterns: [/forbes\.com/i, /techcrunch\.com/i, /businesswire\.com/i, /prnewswire\.com/i] },
  { platform: 'comparison', patterns: [/alternativeto\.net/i, /top10/i, /compare/i, /vs\./i] },
];

function detectPlatform(link: string): OffsiteSource['platform'] {
  for (const matcher of PLATFORM_MATCHERS) {
    if (matcher.patterns.some((pattern) => pattern.test(link))) {
      return matcher.platform;
    }
  }
  return 'other';
}

function uniqueByLink(sources: OffsiteSource[]) {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (seen.has(source.link)) return false;
    seen.add(source.link);
    return true;
  });
}

function extractCompetitorNames(
  sources: OffsiteSource[],
  brandLabel: string,
  fallbackCompetitors: string[] = []
) {
  const blocked = new Set(
    [brandLabel.toLowerCase(), ...fallbackCompetitors.map((item) => item.toLowerCase())].filter(Boolean)
  );
  const candidates = new Map<string, number>();

  const combined = [
    ...fallbackCompetitors,
    ...sources.flatMap((source) => {
      const text = `${source.title} ${source.snippet}`;
      return text.match(/\b[A-Z][a-zA-Z0-9+\-]{2,}\b/g) || [];
    }),
  ];

  for (const item of combined) {
    const normalized = item.trim();
    const key = normalized.toLowerCase();
    if (!normalized || blocked.has(key)) continue;
    if (normalized.includes('ChatGPT') || normalized.includes('Google')) continue;
    candidates.set(normalized, (candidates.get(normalized) || 0) + 1);
  }

  return Array.from(candidates.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
    .slice(0, 6);
}

export async function performOffsiteResearch(input: {
  brandLabel: string;
  website: string;
  industry?: string;
  niche?: string;
  fallbackCompetitors?: string[];
}) {
  const hostname = new URL(input.website).hostname.replace(/^www\./, '');
  const queries = [
    `"${input.brandLabel}" reviews`,
    `"${input.brandLabel}" alternatives competitors`,
    `site:reddit.com "${input.brandLabel}"`,
    `site:youtube.com "${input.brandLabel}" review`,
    `"${input.niche || input.industry || hostname}" best brands`,
  ];

  const queryResults = await Promise.all(queries.map((query) => searchSerper(query)));
  const sources = uniqueByLink(
    queryResults
      .flat()
      .map((result) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        platform: detectPlatform(result.link),
      }))
      .slice(0, 25)
  );

  const platformCounts = sources.reduce<Record<string, number>>((counts, source) => {
    counts[source.platform] = (counts[source.platform] || 0) + 1;
    return counts;
  }, {});

  const competitorNames = extractCompetitorNames(
    sources,
    input.brandLabel,
    input.fallbackCompetitors
  );

  const mentionSummary = [
    platformCounts.youtube ? `${platformCounts.youtube} YouTube result(s) found` : 'No YouTube review results found',
    platformCounts.reddit ? `${platformCounts.reddit} Reddit discussion result(s) found` : 'No Reddit discussion results found',
    platformCounts.amazon ? `${platformCounts.amazon} Amazon/listing result(s) found` : 'No Amazon validation results found',
    platformCounts.reviews ? `${platformCounts.reviews} review-platform result(s) found` : 'No review-platform results found',
  ];

  const research: OffsiteResearch = {
    sourceCount: sources.length,
    platformCounts,
    notableSources: sources.slice(0, 12),
    competitorNames,
    mentionSummary,
  };

  return research;
}
