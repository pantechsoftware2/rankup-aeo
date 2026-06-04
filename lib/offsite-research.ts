import { searchSerper, type SearchScanResult } from '@/lib/serper';
import type { MentionBreakdown, MentionEvidence, CompetitorEvidence, SiteEvidenceBundle } from '@/types/consulting-report';

function getHostParts(website: string) {
  try {
    const hostname = new URL(website).hostname.replace(/^www\./, '').toLowerCase();
    const parts = hostname.split('.').filter(Boolean);
    return {
      hostname,
      root: parts.length >= 2 ? parts[parts.length - 2] : hostname,
    };
  } catch {
    return {
      hostname: website.toLowerCase(),
      root: website.toLowerCase(),
    };
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getLinkRoot(link: string) {
  try {
    return getHostParts(link).root;
  } catch {
    return '';
  }
}

function classifyChannel(link: string): keyof MentionBreakdown | 'other' {
  const value = link.toLowerCase();
  if (value.includes('youtube.com') || value.includes('youtu.be')) return 'youtube';
  if (value.includes('reddit.com')) return 'reddit';
  if (value.includes('amazon.')) return 'amazon';
  if (value.includes('linkedin.com')) return 'linkedin';
  if (value.includes('trustpilot.com') || value.includes('g2.com') || value.includes('capterra.com')) return 'reviews';
  if (value.includes('news') || value.includes('forbes.com') || value.includes('techcrunch.com')) return 'news';
  if (value.includes('directory') || value.includes('clutch.co') || value.includes('tracxn.com')) return 'directories';
  return 'other';
}

function inferSentiment(snippet: string): 'positive' | 'neutral' | 'mixed' {
  const value = snippet.toLowerCase();
  if (value.includes('complaint') || value.includes('problem') || value.includes('issue')) return 'mixed';
  if (value.includes('best') || value.includes('review') || value.includes('top')) return 'positive';
  return 'neutral';
}

function isLimitedEvidenceSite(evidence: SiteEvidenceBundle) {
  const text = `${evidence.homepage.meta.title} ${evidence.homepage.content.bodyText}`.toLowerCase();
  return text.includes('limited crawl fallback') || text.includes('limited audit capture');
}

function isPlaceholderLikeSite(evidence: SiteEvidenceBundle) {
  const text = `${evidence.homepage.meta.title} ${evidence.homepage.content.bodyText}`.toLowerCase();
  return (
    text.includes('documentation examples without needing permission') ||
    text.includes('avoid use in operations') ||
    text.includes('never use https') ||
    text.includes('is for sale') ||
    text.includes('placeholder')
  );
}

function tokenizeBrand(brandName: string, website: string) {
  const { hostname, root } = getHostParts(website);
  return Array.from(
    new Set(
      [brandName, hostname, root]
        .join(' ')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 3)
    )
  );
}

function scoreResultRelevance(result: SearchScanResult, brandTokens: string[], website: string) {
  const text = `${result.title} ${result.snippet}`.toLowerCase();
  const { hostname, root } = getHostParts(website);
  let score = 0;

  for (const token of brandTokens) {
    if (text.includes(token)) score += 2;
    if (result.link.toLowerCase().includes(token)) score += 1;
  }

  if (text.includes(root)) score += 3;
  if (result.link.toLowerCase().includes(hostname)) score += 3;
  if (text.includes(new URL(website).hostname.replace(/^www\./, '').toLowerCase())) score += 2;
  if (/reviews?|alternatives?|competitors?|compare|versus|vs\b/.test(text)) score += 1;
  if (/directory|listing|profile|company|software/i.test(text)) score += 1;
  if (!brandTokens.some((token) => text.includes(token))) score -= 3;

  return score;
}

function isLikelyCompetitorName(value: string, brandName: string) {
  const normalized = value.trim();
  const lower = normalized.toLowerCase();
  const brandLower = brandName.toLowerCase();
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;

  if (!normalized || normalized.length < 3 || normalized.length > 40) return false;
  if (wordCount > 4) return false;
  if (lower.includes(brandLower)) return false;
  if (/[?@]|\.{3}/.test(normalized)) return false;
  if (!/^[a-z0-9&+.'-]+(?:\s+[a-z0-9&+.'-]+){0,3}$/i.test(normalized)) return false;

  const blockedTerms = [
    'reddit',
    'review',
    'reviews',
    'site',
    'domain',
    'email',
    'contact',
    'pricing',
    'compare',
    'comparison',
    'versus',
    'vs',
    'software',
    'platform',
    'guide',
    'list',
    'tools',
    'best',
    'alternatives',
    'competitors',
    'how',
    'what',
    'why',
  ];

  return !blockedTerms.some((term) => lower === term || lower.startsWith(`${term} `) || lower.endsWith(` ${term}`));
}

function buildMentionBreakdown(results: MentionEvidence[]): MentionBreakdown {
  return results.reduce<MentionBreakdown>(
    (breakdown, result) => {
      breakdown[result.channel] = (breakdown[result.channel] || 0) + 1;
      return breakdown;
    },
    {
      youtube: 0,
      reddit: 0,
      amazon: 0,
      linkedin: 0,
      directories: 0,
      news: 0,
      reviews: 0,
      other: 0,
    }
  );
}

function hasComparisonIntent(result: SearchScanResult) {
  const text = `${result.title} ${result.snippet}`.toLowerCase();
  return /alternatives?|competitors?|compare|versus|vs\b|best\b|top\b/.test(text);
}

function extractCompetitorCandidates(result: SearchScanResult, brandName: string, website: string) {
  const candidates = new Set<string>();
  const titleAndSnippet = `${result.title} ${result.snippet}`;
  const brandPattern = escapeRegExp(brandName);
  const patterns = [
    new RegExp(`([^|:,()]{2,60}?)\\s+(?:vs\\.?|versus)\\s+${brandPattern}`, 'gi'),
    new RegExp(`${brandPattern}\\s+(?:vs\\.?|versus)\\s+([^|:,()]{2,60}?)`, 'gi'),
  ];

  for (const pattern of patterns) {
    for (const match of titleAndSnippet.matchAll(pattern)) {
      const candidate = match[1]?.trim();
      if (!candidate || !isLikelyCompetitorName(candidate, brandName)) continue;
      candidates.add(candidate);
    }
  }

  const comparisonish = `${result.title}|${result.snippet}`
    .split(/\s+vs\.?\s+|\s+versus\s+|\s+alternatives?\s+|\s+competitors?\s+|\s+compare\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of comparisonish) {
    if (!isLikelyCompetitorName(part, brandName)) continue;
    if (getLinkRoot(result.link) === getHostParts(website).root) continue;
    candidates.add(part);
  }

  return Array.from(candidates).map((candidate) => candidate.slice(0, 60));
}

function inferCompetitors(results: SearchScanResult[], brandName: string, website: string): CompetitorEvidence[] {
  const candidateMap = new Map<string, { name: string; hits: number; sources: Set<string>; links: string[] }>();

  for (const result of results) {
    if (!hasComparisonIntent(result)) {
      continue;
    }

    for (const candidate of extractCompetitorCandidates(result, brandName, website)) {
      const key = candidate.toLowerCase();
      const current = candidateMap.get(key) || {
        name: candidate,
        hits: 0,
        sources: new Set<string>(),
        links: [],
      };
      current.hits += 1;
      current.sources.add(getLinkRoot(result.link) || result.link);
      current.links.push(result.link);
      candidateMap.set(key, current);
    }
  }

  const ranked = Array.from(candidateMap.values())
    .filter((candidate) => candidate.hits >= 2 || candidate.sources.size >= 2)
    .sort((a, b) => {
      if (b.sources.size !== a.sources.size) return b.sources.size - a.sources.size;
      return b.hits - a.hits;
    })
    .slice(0, 6)
    .map((candidate, index) => ({
      name: candidate.name,
      source: candidate.links[0],
      reason: `Repeatedly identified across ${candidate.sources.size} off-site comparison source${candidate.sources.size === 1 ? '' : 's'}.`,
      estimatedStrength: Math.max(38, 82 - index * 7),
    }));

  return ranked.length >= 2 ? ranked : [];
}

export async function enrichWithOffsiteResearch(evidence: SiteEvidenceBundle) {
  if (isLimitedEvidenceSite(evidence) || isPlaceholderLikeSite(evidence)) {
    return {
      ...evidence,
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
        reviewSignals: [
          'Off-site inference intentionally limited because on-site evidence looks placeholder or crawl-limited.',
        ],
        summary: 'Off-site research was intentionally suppressed because the site did not provide enough trustworthy on-site evidence to match brand mentions confidently.',
      },
    };
  }

  const brandTokens = tokenizeBrand(evidence.brandName, evidence.website);
  const queries = [
    `"${evidence.brandName}"`,
    `"${evidence.brandName}" reviews`,
    `"${evidence.brandName}" alternatives competitors`,
    `"${evidence.brandName}" site:reddit.com`,
    `"${evidence.brandName}" site:youtube.com`,
  ];

  const batches = await Promise.all(queries.map((query) => searchSerper(query)));
  const flattened = batches.flat();
  const deduped = flattened.filter((result, index, array) => array.findIndex((candidate) => candidate.link === result.link) === index);
  const scored = deduped
    .map((result) => ({
      result,
      score: scoreResultRelevance(result, brandTokens, evidence.website),
    }))
    .sort((a, b) => b.score - a.score);

  const relevant = scored.filter((entry) => entry.score >= 3).map((entry) => entry.result);
  const finalResults = (relevant.length >= 5 ? relevant : scored.slice(0, 10).map((entry) => entry.result)).slice(0, 12);

  const mentions: MentionEvidence[] = finalResults.map((result) => ({
    title: result.title,
    link: result.link,
    snippet: result.snippet,
    channel: classifyChannel(result.link),
    sentiment: inferSentiment(result.snippet),
  }));

  const mentionBreakdown = buildMentionBreakdown(mentions);
  const competitors = inferCompetitors(finalResults, evidence.brandName, evidence.website);
  const discussionCount = mentionBreakdown.reddit + mentionBreakdown.youtube + mentionBreakdown.reviews;

  return {
    ...evidence,
    offsite: {
      brandMentions: mentions,
      mentionBreakdown,
      competitors,
      discussionCount,
      reviewSignals: [
        mentionBreakdown.amazon > 0 ? 'Marketplace presence detected' : 'No marketplace presence detected',
        mentionBreakdown.reviews > 0 ? 'Third-party review platforms detected' : 'No third-party review platforms detected',
      ],
      summary:
        mentions.length > 0
          ? `Detected ${mentions.length} third-party references across ${Object.values(mentionBreakdown).reduce((sum, value) => sum + (value > 0 ? 1 : 0), 0)} channel types.`
          : 'No meaningful off-site mentions were detected in the initial search sweep.',
    },
  };
}
