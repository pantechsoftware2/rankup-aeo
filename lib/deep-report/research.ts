import type { OffsiteResearch, OffsiteSource } from './types';

const SERPER_ENDPOINT = 'https://google.serper.dev/search';

function platformFromResult(result: { title: string; link: string; snippet: string }): OffsiteSource['platform'] {
  const joined = `${result.title} ${result.link} ${result.snippet}`.toLowerCase();

  if (joined.includes('youtube.com') || joined.includes('youtu.be')) return 'youtube';
  if (joined.includes('reddit.com')) return 'reddit';
  if (joined.includes('amazon.')) return 'amazon';
  if (joined.includes('linkedin.com')) return 'linkedin';
  if (
    joined.includes('trustpilot') ||
    joined.includes('reviews.io') ||
    joined.includes('g2.com') ||
    joined.includes('capterra') ||
    joined.includes('sitejabber') ||
    joined.includes('producthunt')
  ) {
    return 'reviews';
  }
  if (
    joined.includes('news') ||
    joined.includes('forbes') ||
    joined.includes('techcrunch') ||
    joined.includes('businesswire') ||
    joined.includes('prnewswire')
  ) {
    return 'news';
  }
  if (joined.includes('alternative') || joined.includes('alternatives') || joined.includes('vs ') || joined.includes('compare') || joined.includes('comparison')) {
    return 'comparison';
  }

  return 'other';
}

async function serperSearch(query: string): Promise<OffsiteSource[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    return [];
  }

  const response = await fetch(SERPER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({
      q: query,
      num: 10,
      gl: 'us',
      hl: 'en',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Serper search failed for "${query}" (${response.status}): ${body}`);
  }

  const data = await response.json();
  const organic = Array.isArray(data?.organic) ? data.organic : [];

  return organic.map((item: any) => ({
    title: item?.title || '',
    link: item?.link || '',
    snippet: item?.snippet || '',
    platform: platformFromResult({
      title: item?.title || '',
      link: item?.link || '',
      snippet: item?.snippet || '',
    }),
  }));
}

function extractCompetitorCandidates(sources: OffsiteSource[], brandLabel: string) {
  const candidates = new Set<string>();
  const stopWords = new Set([
    'best',
    'top',
    'the',
    'and',
    'for',
    'with',
    'vs',
    'versus',
    'review',
    'reviews',
    'alternatives',
    'alternative',
    'comparison',
    'compare',
    brandLabel.toLowerCase(),
  ]);

  const textSources = sources.map((source) => `${source.title} ${source.snippet}`);
  for (const text of textSources) {
    const matches = text.match(/[A-Z][A-Za-z0-9&.-]+(?:\s+[A-Z][A-Za-z0-9&.-]+){0,2}/g) || [];
    for (const match of matches) {
      const normalized = match.trim();
      const lower = normalized.toLowerCase();
      if (lower.length < 3 || stopWords.has(lower)) continue;
      if (/^(The|And|For|With|Best|Top|Why|How|What|When|Where|Which)$/i.test(normalized)) continue;
      candidates.add(normalized);
    }
  }

  return Array.from(candidates).slice(0, 8);
}

export async function performOffsiteResearch(input: {
  brandLabel: string;
  website: string;
  industry?: string;
  niche?: string;
}) : Promise<OffsiteResearch> {
  const { brandLabel, industry, niche } = input;
  const baseQuery = niche || industry || brandLabel;
  const queries = [
    `"${brandLabel}" reviews`,
    `"${brandLabel}" competitors`,
    `"${brandLabel}" alternatives`,
    `site:reddit.com "${brandLabel}"`,
    `site:youtube.com "${brandLabel}"`,
    `best ${baseQuery} companies`,
    `${baseQuery} comparison`,
  ];

  const settled = await Promise.allSettled(queries.map((query) => serperSearch(query)));
  const sources = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

  const platformCounts = sources.reduce<Record<string, number>>((acc, source) => {
    acc[source.platform] = (acc[source.platform] || 0) + 1;
    return acc;
  }, {});

  const competitorNames = extractCompetitorCandidates(sources, brandLabel);

  const mentionSummary: string[] = [];
  if ((platformCounts.youtube || 0) > 0) {
    mentionSummary.push(`Found ${platformCounts.youtube} YouTube-result citations or mentions.`);
  }
  if ((platformCounts.reddit || 0) > 0) {
    mentionSummary.push(`Found ${platformCounts.reddit} Reddit discussions or search hits.`);
  }
  if ((platformCounts.reviews || 0) > 0) {
    mentionSummary.push(`Found ${platformCounts.reviews} review-platform results that can support trust.`);
  }
  if ((platformCounts.comparison || 0) > 0) {
    mentionSummary.push(`Found ${platformCounts.comparison} comparison or alternatives pages.`);
  }
  if (mentionSummary.length === 0) {
    mentionSummary.push('No strong third-party discussion signals were found in the current Serper sample.');
  }

  return {
    sourceCount: sources.length,
    platformCounts,
    notableSources: sources.slice(0, 12),
    competitorNames,
    mentionSummary,
    queries,
  };
}

