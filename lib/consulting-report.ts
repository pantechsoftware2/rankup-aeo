import { callLLM, parseJsonResponse } from '@/lib/openrouter';
import { MODELS } from '@/lib/models';
import { collectSiteEvidence } from '@/lib/site-evidence';
import { enrichWithOffsiteResearch } from '@/lib/offsite-research';
import { scoreConsultingReport } from '@/lib/report-rubric';
import type { ConsultingAuditReport, PlatformAssessment, ReportSection, SiteEvidenceBundle, WeightedScorecard } from '@/types/consulting-report';

const SYSTEM_PROMPT = `You are a senior SEO/GEO strategist preparing a premium consulting report.

You will be given structured evidence and a fixed weighted scorecard. Do not change the scores. Use the evidence to write a sharp, specific, persuasive report in JSON.

Rules:
- Sound like a real consultant, not an AI summary.
- Be specific and evidence-led.
- Do not overclaim.
- Keep the executive summary to 3-4 sharp sentences.
- Keep each findings array to 4-6 bullets max.
- Make the report strong enough that the reader trusts the team, but hold back implementation details.
- If the evidence is limited or placeholder-like, say so plainly and avoid speculative competitor claims.
- Return valid JSON only.

Required JSON shape:
{
  "executiveSummary": "string",
  "aiVisibility": { "summary": "string", "findings": ["..."] },
  "crawlerAccess": { "summary": "string", "recommendations": ["..."] },
  "brandAuthority": { "summary": "string", "findings": ["..."] },
  "platformAssessments": [
    { "platform": "ChatGPT", "status": "NOT CITABLE|WEAK|PROMISING|COMPETITIVE", "summary": "string" }
  ],
  "contentAndEEAT": { "summary": "string", "findings": ["..."] },
  "technicalFoundations": { "summary": "string", "findings": ["..."] },
  "schemaAnalysis": { "summary": "string", "findings": ["..."], "missingSchema": ["..."] },
  "keywordGapAnalysis": { "summary": "string" },
  "competitorLandscape": { "summary": "string" },
  "actionPlan": {
    "quickWins": [{ "action": "string", "expectedImpact": "string", "effort": "string" }],
    "foundation": [{ "action": "string", "expectedImpact": "string", "effort": "string" }],
    "acceleration": [{ "action": "string", "expectedImpact": "string", "effort": "string" }]
  }
}`;

function toSection(raw: any, fallbackSummary: string): ReportSection {
  return {
    summary: typeof raw?.summary === 'string' ? raw.summary.trim() : fallbackSummary,
    findings: Array.isArray(raw?.findings) ? raw.findings.filter((item: unknown) => typeof item === 'string').slice(0, 6) : [],
  };
}

function platformRank(status: PlatformAssessment['status']) {
  switch (status) {
    case 'NOT CITABLE':
      return 0;
    case 'WEAK':
      return 1;
    case 'PROMISING':
      return 2;
    case 'COMPETITIVE':
      return 3;
  }
}

function platformStatusFromSignals(score: number): PlatformAssessment['status'] {
  if (score >= 80) return 'COMPETITIVE';
  if (score >= 62) return 'PROMISING';
  if (score >= 38) return 'WEAK';
  return 'NOT CITABLE';
}

function getDimensionScore(scorecard: WeightedScorecard, key: WeightedScorecard['dimensions'][number]['key']) {
  return scorecard.dimensions.find((dimension) => dimension.key === key)?.score || 0;
}

function buildPlatformDefaults(evidence: SiteEvidenceBundle, scorecard: WeightedScorecard): PlatformAssessment[] {
  const aiScore = getDimensionScore(scorecard, 'aiVisibility');
  const authorityScore = getDimensionScore(scorecard, 'brandAuthority');
  const contentScore = getDimensionScore(scorecard, 'contentQuality');
  const schemaScore = getDimensionScore(scorecard, 'schema');
  const platformScore = getDimensionScore(scorecard, 'platformReadiness');
  const mentionCount = evidence.offsite.brandMentions.length;
  const reviewCount = evidence.offsite.mentionBreakdown.reviews + evidence.offsite.mentionBreakdown.amazon;
  const discussionCount = evidence.offsite.discussionCount;
  const schemaCoverage = evidence.derived.totalCrawledPages > 0 ? evidence.derived.pagesWithSchema / evidence.derived.totalCrawledPages : 0;
  const citableBlocks = evidence.derived.citableBlockCount;

  return [
    {
      platform: 'ChatGPT',
      status: platformStatusFromSignals(Math.round(platformScore * 0.3 + contentScore * 0.25 + authorityScore * 0.2 + aiScore * 0.25)),
      summary:
        mentionCount >= 6
          ? 'This brand already has enough content depth and external signals to become more citable in ChatGPT with stronger proof packaging.'
          : 'ChatGPT will need stronger factual blocks and broader trust signals before this site becomes consistently citable.',
    },
    {
      platform: 'Perplexity',
      status: platformStatusFromSignals(Math.round(platformScore * 0.35 + aiScore * 0.3 + authorityScore * 0.2 + reviewCount * 3)),
      summary:
        reviewCount > 0 || discussionCount > 0
          ? 'Perplexity has enough external evidence to work with, but richer references and cleaner structure would improve confidence.'
          : 'Perplexity will still see too little third-party validation to cite the brand confidently.',
    },
    {
      platform: 'Gemini',
      status: platformStatusFromSignals(Math.round(platformScore * 0.25 + schemaScore * 0.35 + contentScore * 0.2 + aiScore * 0.2)),
      summary:
        schemaCoverage >= 0.5
          ? 'Gemini has a reasonable schema and content base to understand the site, though coverage can still be expanded.'
          : 'Gemini needs stronger schema coverage and clearer topical structure to interpret the site more confidently.',
    },
    {
      platform: 'Google AI Overviews',
      status: platformStatusFromSignals(Math.round(platformScore * 0.25 + aiScore * 0.3 + authorityScore * 0.2 + contentScore * 0.15 + citableBlocks * 2)),
      summary:
        mentionCount >= 8 || reviewCount > 0
          ? 'Google AI Overviews has enough authority context to work with, but stronger proof-led content would improve competitive durability.'
          : 'Google AI Overviews still needs more authority and search-facing evidence before the site can compete consistently.',
    },
  ];
}

function normalizePlatformAssessments(raw: any, defaults: PlatformAssessment[]): PlatformAssessment[] {
  if (!Array.isArray(raw)) {
    return defaults;
  }

  const byPlatform = new Map(
    raw
      .filter((item) => item && typeof item.platform === 'string')
      .map((item) => [item.platform, item])
  );

  return defaults.map((fallback, index) => {
    const item = byPlatform.get(fallback.platform) || raw[index];
    const rawStatus = ['NOT CITABLE', 'WEAK', 'PROMISING', 'COMPETITIVE'].includes(item?.status) ? item.status : fallback.status;
    const status = platformRank(rawStatus) >= platformRank(fallback.status) ? rawStatus : fallback.status;

    return {
      platform: fallback.platform,
      status,
      summary: typeof item?.summary === 'string' && item.summary.trim().length > 0 ? item.summary.trim() : fallback.summary,
    };
  });
}

function buildPrompt(evidence: SiteEvidenceBundle, compositeScore: number) {
  const homepageText = `${evidence.homepage.meta.title} ${evidence.homepage.content.bodyText}`.toLowerCase();
  const limitedFetch = homepageText.includes('limited crawl fallback') || homepageText.includes('limited audit capture');
  const placeholderLike =
    homepageText.includes('documentation examples without needing permission') ||
    homepageText.includes('avoid use in operations') ||
    homepageText.includes('is for sale') ||
    homepageText.includes('placeholder');

  return [
    `WEBSITE: ${evidence.website}`,
    `BRAND: ${evidence.brandName}`,
    `COMPOSITE SCORE: ${compositeScore}`,
    `LIMITED_FETCH_MODE: ${limitedFetch ? 'yes' : 'no'}`,
    `PLACEHOLDER_LIKE_SITE: ${placeholderLike ? 'yes' : 'no'}`,
    `SCORECARD: ${JSON.stringify(scoreConsultingReport(evidence).dimensions)}`,
    `HOMEPAGE TITLE: ${evidence.homepage.meta.title}`,
    `HOMEPAGE DESCRIPTION: ${evidence.homepage.meta.description}`,
    `HOMEPAGE WORD COUNT: ${evidence.homepage.content.wordCount}`,
    `CRAWLED PAGE SUMMARIES: ${JSON.stringify(evidence.pages.map((page) => ({
      url: page.url,
      type: page.pageType,
      title: page.crawl.meta.title,
      words: page.crawl.content.wordCount,
      schema: page.crawl.technical.schemaTypes,
      h1: page.crawl.headings.h1[0] || '',
    })))} `,
    `OFFSITE SUMMARY: ${evidence.offsite.summary}`,
    `MENTION BREAKDOWN: ${JSON.stringify(evidence.offsite.mentionBreakdown)}`,
    `MENTION HIGHLIGHTS: ${JSON.stringify(evidence.offsite.brandMentions.slice(0, 8))}`,
    `COMPETITORS: ${JSON.stringify(evidence.offsite.competitors.slice(0, 6))}`,
    `KEYWORD OPPORTUNITIES: ${JSON.stringify(evidence.keywordOpportunities)}`,
    `DERIVED SIGNALS: ${JSON.stringify(evidence.derived)}`,
  ].join('\n');
}

export async function generateConsultingReportForWebsite(website: string, ctaUrl: string, ctaLabel = 'Book Paid Strategy Call') {
  const baseEvidence = await collectSiteEvidence(website);
  const evidence = await enrichWithOffsiteResearch(baseEvidence);
  const scorecard = scoreConsultingReport(evidence);
  const platformDefaults = buildPlatformDefaults(evidence, scorecard);

  const response = await callLLM({
    model: MODELS.DEEP,
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildPrompt(evidence, scorecard.compositeScore),
    temperature: 0.2,
    maxTokens: 1800,
    timeoutMs: 30000,
    json: true,
  });

  const parsed = parseJsonResponse(response);

  const report: ConsultingAuditReport = {
    generatedAt: new Date().toISOString(),
    brandName: evidence.brandName,
    website,
    market: 'Primary website market',
    compositeScore: scorecard.compositeScore,
    scorecard: scorecard.dimensions,
    executiveSummary:
      typeof parsed?.executiveSummary === 'string'
        ? parsed.executiveSummary.trim()
        : `${evidence.brandName} has a real opportunity, but the current digital footprint is not yet strong enough to dominate AI-driven discovery.`,
    aiVisibility: toSection(parsed?.aiVisibility, 'AI visibility is weaker than it should be given the product promise.'),
    crawlerAccess: {
      summary:
        typeof parsed?.crawlerAccess?.summary === 'string'
          ? parsed.crawlerAccess.summary.trim()
          : 'Major crawlers can likely reach the site, but the content packaging is not doing enough to guide them.',
      bots: [
        { name: 'ChatGPT', userAgent: 'GPTBot', status: 'Likely allowed', impact: 'HIGH' },
        { name: 'Claude', userAgent: 'ClaudeBot', status: 'Likely allowed', impact: 'HIGH' },
        { name: 'Perplexity', userAgent: 'PerplexityBot', status: 'Likely allowed', impact: 'HIGH' },
        { name: 'Google AI', userAgent: 'Google-Extended', status: 'Likely allowed', impact: 'HIGH' },
      ],
      recommendations: Array.isArray(parsed?.crawlerAccess?.recommendations)
        ? parsed.crawlerAccess.recommendations.filter((item: unknown) => typeof item === 'string').slice(0, 5)
        : ['Add clearer AI-facing summaries, structured signals, and stronger crawlable text blocks across key pages.'],
    },
    brandAuthority: {
      ...toSection(parsed?.brandAuthority, 'Brand authority is being held back by thin third-party validation.'),
      mentionBreakdown: evidence.offsite.mentionBreakdown,
      mentionHighlights: evidence.offsite.brandMentions.slice(0, 6),
    },
    platformAssessments: normalizePlatformAssessments(parsed?.platformAssessments, platformDefaults),
    contentAndEEAT: toSection(parsed?.contentAndEEAT, 'Content quality is not yet strong enough to become a reliable citation source.'),
    technicalFoundations: toSection(parsed?.technicalFoundations, 'Technical foundations exist, but there are still structural issues limiting visibility.'),
    schemaAnalysis: {
      ...toSection(parsed?.schemaAnalysis, 'Schema coverage is too shallow for a high-trust AI-search presence.'),
      missingSchema: Array.isArray(parsed?.schemaAnalysis?.missingSchema)
        ? parsed.schemaAnalysis.missingSchema.filter((item: unknown) => typeof item === 'string').slice(0, 6)
        : ['Organization', 'FAQPage', 'Article', 'BreadcrumbList'],
    },
    keywordGapAnalysis: {
      summary:
        typeof parsed?.keywordGapAnalysis?.summary === 'string'
          ? parsed.keywordGapAnalysis.summary.trim()
          : 'There are clear commercial, comparison, and educational keyword gaps that should be owned deliberately.',
      opportunities: evidence.keywordOpportunities,
    },
    competitorLandscape: {
      summary:
        typeof parsed?.competitorLandscape?.summary === 'string'
          ? parsed.competitorLandscape.summary.trim()
          : evidence.offsite.competitors.length > 0
            ? 'Competitors with stronger authority signals and more citable content are likely to be preferred today.'
            : 'We intentionally held competitor claims back because the off-site evidence was not strong enough to name them confidently.',
      competitors: evidence.offsite.competitors.slice(0, 5),
    },
    actionPlan: {
      quickWins: Array.isArray(parsed?.actionPlan?.quickWins) && parsed.actionPlan.quickWins.length > 0
        ? parsed.actionPlan.quickWins.slice(0, 5)
        : [
            {
              action: 'Clarify the homepage promise and add fact-rich proof blocks.',
              expectedImpact: 'Improves both conversion confidence and AI retrievability.',
              effort: 'Medium',
            },
            {
              action: 'Fix the highest-impact technical trust gaps first.',
              expectedImpact: 'Reduces avoidable crawl and indexing drag.',
              effort: 'Low to medium',
            },
          ],
      foundation: Array.isArray(parsed?.actionPlan?.foundation) && parsed.actionPlan.foundation.length > 0
        ? parsed.actionPlan.foundation.slice(0, 5)
        : [
            {
              action: 'Build stronger entity, schema, and trust coverage across core pages.',
              expectedImpact: 'Creates a better citation and authority foundation.',
              effort: 'Medium to high',
            },
          ],
      acceleration: Array.isArray(parsed?.actionPlan?.acceleration) && parsed.actionPlan.acceleration.length > 0
        ? parsed.actionPlan.acceleration.slice(0, 5)
        : [
            {
              action: 'Expand comparison, educational, and proof-led content once the basics are fixed.',
              expectedImpact: 'Improves competitive coverage and long-tail visibility.',
              effort: 'High',
            },
          ],
    },
    withheldFromReport: [
      'Exact implementation sequence',
      'Content briefs and page-level outlines',
      'Full keyword map',
      'Outreach target list',
      'Detailed competitor playbook',
    ],
    nextStepCTA: {
      label: ctaLabel,
      href: ctaUrl,
      description: 'Use the paid strategy call to review priorities, rollout order, and whether we should execute this for you.',
    },
  };

  return {
    evidence,
    scorecard,
    report,
  };
}
