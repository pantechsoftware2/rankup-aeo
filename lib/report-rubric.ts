import type { ReportDimensionScore, SiteEvidenceBundle, WeightedScorecard, ConsultingScoreStatus } from '@/types/consulting-report';

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function statusForScore(score: number): ConsultingScoreStatus {
  if (score < 25) return 'CRITICAL';
  if (score < 45) return 'POOR';
  if (score < 65) return 'FAIR';
  if (score < 80) return 'GOOD';
  return 'STRONG';
}

function dimension(key: ReportDimensionScore['key'], label: string, weight: number, score: number, summary: string): ReportDimensionScore {
  return {
    key,
    label,
    weight,
    score: clamp(score),
    status: statusForScore(score),
    summary,
  };
}

function activeChannelCount(evidence: SiteEvidenceBundle) {
  return Object.values(evidence.offsite.mentionBreakdown).filter((value) => value > 0).length;
}

function summaryForScore(options: {
  score: number;
  strong: string;
  good: string;
  fair: string;
  poor: string;
}) {
  if (options.score >= 80) return options.strong;
  if (options.score >= 65) return options.good;
  if (options.score >= 45) return options.fair;
  return options.poor;
}

export function scoreConsultingReport(evidence: SiteEvidenceBundle): WeightedScorecard {
  const mentionCount = evidence.offsite.brandMentions.length;
  const reviewCount = evidence.offsite.mentionBreakdown.reviews + evidence.offsite.mentionBreakdown.amazon;
  const discussionCount = evidence.offsite.discussionCount;
  const linkedinCount = evidence.offsite.mentionBreakdown.linkedin;
  const newsCount = evidence.offsite.mentionBreakdown.news;
  const directoryCount = evidence.offsite.mentionBreakdown.directories;
  const pages = evidence.derived.totalCrawledPages;
  const citableBlocks = evidence.derived.citableBlockCount;
  const avgWords = evidence.derived.averageWordCount;
  const faqCoverage = pages > 0 ? evidence.derived.pagesWithFaqContent / pages : 0;
  const schemaCoverage = pages > 0 ? evidence.derived.pagesWithSchema / pages : 0;
  const authorCoverage = pages > 0 ? evidence.derived.pagesWithAuthorSignals / pages : 0;
  const channelDiversity = activeChannelCount(evidence);

  const aiVisibilityScore = clamp(
    12 +
      mentionCount * 2 +
      discussionCount * 4 +
      citableBlocks * 4 +
      channelDiversity * 4 +
      faqCoverage * 12
  );
  const brandAuthorityScore = clamp(
    10 +
      mentionCount * 2 +
      reviewCount * 7 +
      linkedinCount * 5 +
      newsCount * 6 +
      directoryCount * 4 +
      channelDiversity * 4 +
      (mentionCount >= 8 ? 8 : 0)
  );
  const contentScore = clamp(
    24 + Math.min(34, avgWords / 18) + citableBlocks * 4 + authorCoverage * 18 + faqCoverage * 10
  );
  const technicalScore = clamp(
    35 +
      (evidence.homepage.technical.hasOpenGraph ? 8 : 0) +
      (evidence.homepage.technical.hasSitemap ? 10 : 0) +
      (evidence.homepage.technical.hasRobotsTxt ? 8 : 0) +
      (evidence.homepage.issues.lowContentLength ? -18 : 0) +
      (evidence.homepage.issues.missingCanonical ? -10 : 0) +
      (evidence.homepage.issues.missingViewport ? -10 : 0)
  );
  const schemaScore = clamp(12 + schemaCoverage * 55 + evidence.homepage.technical.schemaTypes.length * 5 + faqCoverage * 8);
  const platformScore = clamp(
    18 +
      evidence.derived.botsLikelyAllowed.length * 8 +
      citableBlocks * 3 +
      reviewCount * 3 +
      mentionCount * 2 +
      channelDiversity * 4 +
      schemaCoverage * 18
  );

  const dimensions = [
    dimension(
      'aiVisibility',
      'AI Citability & Visibility',
      25,
      aiVisibilityScore,
      summaryForScore({
        score: aiVisibilityScore,
        strong: 'The brand already shows meaningful visibility across third-party and AI-retrieval channels.',
        good: 'There is real off-site visibility and citation potential, but it still needs stronger breadth to dominate.',
        fair: 'Some third-party visibility exists, but it is not yet strong enough to create durable AI preference.',
        poor: 'The brand is still largely invisible to AI-retrieval channels today.',
      })
    ),
    dimension(
      'brandAuthority',
      'Brand Authority Signals',
      20,
      brandAuthorityScore,
      summaryForScore({
        score: brandAuthorityScore,
        strong: 'External authority signals are already forming a credible trust moat around the brand.',
        good: 'There are legitimate external trust signals, but more third-party proof would strengthen authority.',
        fair: 'Some external trust signals exist, but authority is still thinner than it should be.',
        poor: 'External authority signals are minimal or missing.',
      })
    ),
    dimension(
      'contentQuality',
      'Content Quality & E-E-A-T',
      20,
      contentScore,
      summaryForScore({
        score: contentScore,
        strong: 'The site has enough depth and factual substance to support stronger citation behavior.',
        good: 'The site has useful text blocks and topical depth, but it still needs more defensible authority content.',
        fair: 'The content is usable, but it is not yet distinctive enough to become a strong authority moat.',
        poor: 'The site lacks enough fact-rich, citable content to win trust quickly.',
      })
    ),
    dimension(
      'technicalSEO',
      'Technical SEO Foundations',
      15,
      technicalScore,
      summaryForScore({
        score: technicalScore,
        strong: 'Core technical foundations are in good shape and support stronger crawl efficiency.',
        good: 'Most technical foundations are present, with a few structural gaps left to close.',
        fair: 'Core technical foundations exist in parts, but there are still meaningful structural gaps.',
        poor: 'Technical issues are still dragging down crawlability and confidence.',
      })
    ),
    dimension(
      'schema',
      'Structured Data / Schema',
      10,
      schemaScore,
      summaryForScore({
        score: schemaScore,
        strong: 'Schema coverage is strong enough to materially support modern AI-search understanding.',
        good: 'Schema is present on enough pages to build on, but there is room to expand coverage.',
        fair: 'Schema coverage is still thinner than it should be for a modern AI-search strategy.',
        poor: 'Schema coverage is too thin for a modern AI-search strategy.',
      })
    ),
    dimension(
      'platformReadiness',
      'Platform-Specific Readiness',
      10,
      platformScore,
      summaryForScore({
        score: platformScore,
        strong: 'The site already shows strong platform readiness across crawlability, factual content, and trust signals.',
        good: 'Platform readiness is promising, but better authority and structure would improve consistency.',
        fair: 'Platform readiness is mixed and still depends on stronger content packaging and off-site validation.',
        poor: 'Platform readiness is weak because the underlying signals are too thin or too inconsistent.',
      })
    ),
  ];

  const compositeScore = clamp(
    dimensions.reduce((sum, current) => sum + current.score * (current.weight / 100), 0)
  );

  return {
    compositeScore,
    dimensions,
  };
}
