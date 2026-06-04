import type {
  ComprehensiveAuditEvidence,
  ComprehensiveAuditReport,
  PlatformReadiness,
  PrioritizedAction,
  WeightedAuditScore,
  AuditStatus,
} from '@/types/comprehensive-report';

const SCORE_KEYS: Array<WeightedAuditScore['key']> = [
  'aiCitability',
  'brandAuthority',
  'contentQuality',
  'technicalFoundations',
  'schemaMarkup',
  'platformOptimization',
];

const SCORE_LABELS: Record<WeightedAuditScore['key'], string> = {
  aiCitability: 'AI Citability',
  brandAuthority: 'Brand Authority',
  contentQuality: 'Content Quality',
  technicalFoundations: 'Technical Foundations',
  schemaMarkup: 'Schema Markup',
  platformOptimization: 'Platform Optimization',
};

const SCORE_WEIGHTS: Record<WeightedAuditScore['key'], number> = {
  aiCitability: 25,
  brandAuthority: 20,
  contentQuality: 20,
  technicalFoundations: 15,
  schemaMarkup: 10,
  platformOptimization: 10,
};

function clamp(value: number, min = 0, max = 100): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function average(...values: number[]): number {
  const numeric = values.filter((value) => Number.isFinite(value));
  if (!numeric.length) return 0;
  return numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
}

function statusFromScore(score: number): AuditStatus {
  if (score >= 85) return 'STRONG';
  if (score >= 70) return 'GOOD';
  if (score >= 50) return 'FAIR';
  if (score >= 30) return 'POOR';
  return 'CRITICAL';
}

function scoreOffsiteEvidence(evidence: ComprehensiveAuditEvidence): number {
  const sourceCount = evidence.offsiteResearch?.sourceCount || 0;
  const platformDiversity = Object.keys(evidence.offsiteResearch?.platformCounts || {}).length;
  const mentionCount = evidence.offsiteResearch?.mentionSummary?.length || 0;
  const competitorCount = evidence.offsiteResearch?.competitorNames?.length || 0;
  const base = sourceCount * 5 + platformDiversity * 8 + mentionCount * 4 + competitorCount * 2;
  return clamp(base, 0, 100);
}

function scoreContentQuality(evidence: ComprehensiveAuditEvidence): number {
  const deepContent = evidence.deep?.dimensions?.contentMarketFit?.score || 0;
  const credibility = evidence.deep?.dimensions?.credibility?.score || 0;
  const homepageWords = evidence.crawl?.content?.wordCount || 0;
  const internalPages = evidence.internalPages?.length || 0;
  const contentBreadth = clamp(homepageWords / 8 + internalPages * 8, 0, 100);
  return clamp(average(deepContent, credibility, contentBreadth));
}

function scoreTechnicalFoundations(evidence: ComprehensiveAuditEvidence): number {
  const deepTechnical = evidence.deep?.dimensions?.technicalSEO?.score || 0;
  const crawlIssues = evidence.crawl?.issues || {};
  const issuePenalty = Object.values(crawlIssues).filter(Boolean).length * 8;
  return clamp(average(deepTechnical, 100 - issuePenalty));
}

function scoreSchemaMarkup(evidence: ComprehensiveAuditEvidence): number {
  const schemaTypes = evidence.crawl?.technical?.schemaTypes || [];
  const deepSchema = evidence.deep?.dimensions?.technicalSEO?.score || 0;
  const missingSchema = evidence.deep?.dimensions?.technicalSEO?.missingSchema?.length || 0;
  const crawlBonus = schemaTypes.length * 6 + (evidence.crawl?.technical?.hasSchemaMarkup ? 18 : 0);
  const penalty = missingSchema * 4;
  return clamp(average(deepSchema, crawlBonus * 2 - penalty + 20));
}

function scoreAiCitability(evidence: ComprehensiveAuditEvidence): number {
  const geoScore = evidence.deep?.dimensions?.geoReadiness?.score || 0;
  const offsiteScore = scoreOffsiteEvidence(evidence);
  const citationWorthiness = evidence.deep?.dimensions?.geoReadiness?.citationWorthiness;
  const worthinessBonus = citationWorthiness === 'high' ? 12 : citationWorthiness === 'medium' ? 6 : 0;
  const platformBonus = (evidence.offsiteResearch?.platformCounts?.reddit || 0) * 2 + (evidence.offsiteResearch?.platformCounts?.youtube || 0) * 3;
  return clamp(average(geoScore, offsiteScore + worthinessBonus + platformBonus));
}

function scoreBrandAuthority(evidence: ComprehensiveAuditEvidence): number {
  const credibility = evidence.deep?.dimensions?.credibility?.score || 0;
  const offsiteScore = scoreOffsiteEvidence(evidence);
  const structuredProof = (evidence.internalPages?.length || 0) * 5;
  return clamp(average(credibility, offsiteScore, structuredProof));
}

function platformScore(status: PlatformReadiness['status']): number {
  switch (status) {
    case 'STRONG':
      return 88;
    case 'PROMISING':
      return 68;
    case 'WEAK':
      return 42;
    case 'NOT CITABLE':
    default:
      return 18;
  }
}

function derivePlatformReadiness(evidence: ComprehensiveAuditEvidence): PlatformReadiness[] {
  const offsiteScore = scoreOffsiteEvidence(evidence);
  const schemaScore = scoreSchemaMarkup(evidence);
  const contentScore = scoreContentQuality(evidence);
  const technicalScore = scoreTechnicalFoundations(evidence);
  const geoScore = evidence.deep?.dimensions?.geoReadiness?.score || 0;

  const readiness: PlatformReadiness[] = [
    {
      platform: 'ChatGPT',
      status: offsiteScore >= 70 ? 'PROMISING' : offsiteScore >= 45 ? 'WEAK' : 'NOT CITABLE',
      summary: offsiteScore >= 70
        ? 'Third-party validation is starting to exist, but the brand still needs more citable proof blocks to become a reliable answer source.'
        : 'There is not enough third-party validation or mention depth for ChatGPT to confidently use the brand in answers.',
    },
    {
      platform: 'Perplexity',
      status: contentScore >= 70 ? 'PROMISING' : contentScore >= 45 ? 'WEAK' : 'NOT CITABLE',
      summary: contentScore >= 70
        ? 'The site has enough crawlable structure to support discovery, but it still needs stronger comparison content and evidence pages.'
        : 'Perplexity will likely prefer stronger competitors until the site has more crawlable, question-answer content.',
    },
    {
      platform: 'Gemini',
      status: schemaScore >= 70 && technicalScore >= 60 ? 'PROMISING' : 'WEAK',
      summary: schemaScore >= 70 && technicalScore >= 60
        ? 'Schema and technical foundations are usable, but the audit still suggests more explicit entity and FAQ coverage.'
        : 'Gemini will have a hard time extracting the site cleanly until schema and technical trust signals improve.',
    },
    {
      platform: 'Google AI Overviews',
      status: geoScore >= 70 && schemaScore >= 60 ? 'PROMISING' : 'WEAK',
      summary: geoScore >= 70 && schemaScore >= 60
        ? 'The site is on the edge of citation eligibility, but it needs stronger authority and citable blocks before it can dominate.'
        : 'Google AI Overviews will likely favor better-structured, better-cited competitors right now.',
    },
  ];

  return readiness;
}

function buildStatusSummary(score: number): string {
  if (score >= 85) return 'This is close to best-in-class and needs only incremental refinement.';
  if (score >= 70) return 'This is competitive, but the site still has clear leverage to unlock.';
  if (score >= 50) return 'This is functional but incomplete, with meaningful gaps worth fixing fast.';
  if (score >= 30) return 'This is underperforming and needs foundational work before scale.';
  return 'This is critically weak and will not produce consistent AI visibility yet.';
}

function buildEvidenceBullets(evidence: ComprehensiveAuditEvidence, scoreKey: WeightedAuditScore['key']): string[] {
  const crawl = evidence.crawl;
  const deep = evidence.deep;

  switch (scoreKey) {
    case 'aiCitability':
      return [
        `${evidence.offsiteResearch?.sourceCount || 0} off-site sources found across ${Object.keys(evidence.offsiteResearch?.platformCounts || {}).length || 0} platforms.`,
        `${deep?.dimensions?.geoReadiness?.citationWorthiness || 'medium'} citation worthiness from the deep audit.`,
        `${evidence.offsiteResearch?.mentionSummary?.[0] || 'No strong citation-ready third-party mention yet.'}`,
      ];
    case 'brandAuthority':
      return [
        `${evidence.internalPages?.length || 0} internal pages were collected as proof of depth.`,
        `${evidence.offsiteResearch?.competitorNames?.length || 0} competitor / adjacent brand names surfaced from the research layer.`,
        `${deep?.dimensions?.credibility?.verdict || 'Credibility is still forming.'}`,
      ];
    case 'contentQuality':
      return [
        `Homepage word count: ${crawl?.content?.wordCount || 0}.`,
        `Internal pages sampled: ${evidence.internalPages?.length || 0}.`,
        `${deep?.dimensions?.contentMarketFit?.verdict || 'Content-market fit still needs work.'}`,
      ];
    case 'technicalFoundations':
      return [
        `Schema detected: ${crawl?.technical?.hasSchemaMarkup ? 'yes' : 'no'}.`,
        `Crawl issues flagged: ${Object.values(crawl?.issues || {}).filter(Boolean).length}.`,
        `${deep?.dimensions?.technicalSEO?.verdict || 'Technical SEO is incomplete.'}`,
      ];
    case 'schemaMarkup':
      return [
        `Schema types found: ${(crawl?.technical?.schemaTypes || []).slice(0, 4).join(', ') || 'none'}.`,
        `Missing schema examples: ${(deep?.dimensions?.technicalSEO?.missingSchema || []).slice(0, 4).join(', ') || 'none'}.`,
        `${deep?.dimensions?.technicalSEO?.verdict || 'Schema coverage is limited.'}`,
      ];
    case 'platformOptimization':
      return [
        `ChatGPT / Perplexity / Gemini / AIO readiness is uneven.`,
        `Platform-specific visibility still depends on authority plus clean extraction.`,
        `${deep?.dimensions?.geoReadiness?.verdict || 'Platform optimization is not yet complete.'}`,
      ];
  }
}

function buildPriorityActions(evidence: ComprehensiveAuditEvidence): PrioritizedAction[] {
  const actions: PrioritizedAction[] = [];
  const deep = evidence.deep;

  const contentScore = deep?.dimensions?.contentMarketFit?.score || 0;
  const credibilityScore = deep?.dimensions?.credibility?.score || 0;
  const technicalScore = deep?.dimensions?.technicalSEO?.score || 0;
  const geoScore = deep?.dimensions?.geoReadiness?.score || 0;
  const brandAuthority = scoreBrandAuthority(evidence);
  const schemaScore = scoreSchemaMarkup(evidence);

  if (contentScore < 70) {
    actions.push({
      title: 'Clarify the core promise above the fold',
      detail: 'Tighten the homepage message so buyers and AI systems can immediately tell what the business does, who it serves, and why it wins.',
      impact: 'High impact for AI retrieval and conversion.',
      effort: 'Quick win if the hero and supporting blocks are rewritten.',
    });
  }

  if (brandAuthority < 65) {
    actions.push({
      title: 'Build third-party validation and mention depth',
      detail: 'Create more external proof through reviews, comparisons, citations, and mentions so the brand becomes easier to trust and cite.',
      impact: 'Directly improves AI citability and brand authority.',
      effort: 'Moderate effort because it depends on off-site execution.',
    });
  }

  if (technicalScore < 70 || schemaScore < 70) {
    actions.push({
      title: 'Expand schema and technical structure',
      detail: 'Add richer schema, clean page hierarchy, and more crawlable content blocks so AI crawlers can extract the right facts reliably.',
      impact: 'High leverage for Google AI Overviews and structured extraction.',
      effort: 'Moderate effort across templates and content blocks.',
    });
  }

  if (geoScore < 75) {
    actions.push({
      title: 'Publish citation-worthy answer blocks',
      detail: 'Write dense, answer-first sections that clearly define the product, the category, and the proof points AI engines can quote.',
      impact: 'Raises citation eligibility across answer engines.',
      effort: 'Quick win once the editorial pattern is set.',
    });
  }

  return actions.slice(0, 4);
}

function buildFoundationActions(evidence: ComprehensiveAuditEvidence): PrioritizedAction[] {
  const crawl = evidence.crawl;
  const deep = evidence.deep;
  const actions: PrioritizedAction[] = [];

  if (!crawl?.technical?.hasSchemaMarkup) {
    actions.push({
      title: 'Add organization and product schema everywhere',
      detail: 'Make the brand machine-readable on every primary page and product template.',
      impact: 'Creates the foundation for richer AI understanding.',
      effort: 'Moderate.',
    });
  }

  if ((crawl?.content?.wordCount || 0) < 500) {
    actions.push({
      title: 'Increase crawlable page depth',
      detail: 'Replace thin content with structured blocks, FAQs, and supporting context that answer real buyer questions.',
      impact: 'Improves both SEO and citation readiness.',
      effort: 'Moderate.',
    });
  }

  if ((evidence.internalPages?.length || 0) < 3) {
    actions.push({
      title: 'Build more internal evidence pages',
      detail: 'Add about, comparison, and support pages so the report and the site can point to more proof.',
      impact: 'Strengthens topical breadth and trust.',
      effort: 'Significant if the site is very thin.',
    });
  }

  if ((deep?.dimensions?.credibility?.score || 0) < 70) {
    actions.push({
      title: 'Add authorship and proof signals',
      detail: 'Surface founders, credentials, case studies, and customer proof on the pages that matter most.',
      impact: 'Makes the site easier to trust and cite.',
      effort: 'Quick to moderate.',
    });
  }

  return actions.slice(0, 4);
}

function buildAccelerationActions(evidence: ComprehensiveAuditEvidence): PrioritizedAction[] {
  const platformReadiness = derivePlatformReadiness(evidence);
  return platformReadiness.map((platform) => ({
    title: `Tune for ${platform.platform}`,
    detail: platform.summary,
    impact: 'Improves platform-specific visibility and answer likelihood.',
    effort: 'Best done once the foundational work is in place.',
  }));
}

function buildOfferDeliverables(): string[] {
  return [
    'Multi-page crawl evidence and issue map',
    'Off-site mention and competitor research',
    'Weighted rubric with prioritized fixes',
    'PDF report delivered to inbox',
    'Paid strategy call to walk through the rollout',
  ];
}

function buildOfferPositioningSummary(evidence: ComprehensiveAuditEvidence): string {
  const strongArea = evidence.deep?.priorityActions?.[0]?.title || 'the highest-impact page and authority gaps';
  return `The report shows exactly where the site is leaking visibility, then frames ${strongArea.toLowerCase()} as the first fix. The on-page preview stays surface-level so the full implementation sequence can be handled on the paid call.`;
}

function buildCompetitorLandscapeSummary(evidence: ComprehensiveAuditEvidence): string {
  const competitorNames = evidence.offsiteResearch?.competitorNames?.slice(0, 5) || [];
  if (!competitorNames.length) {
    return 'The research layer did not surface enough competitor data to make a confident direct comparison, which is itself a signal that the brand needs more external visibility.';
  }
  return `Competitor and adjacent-brand research surfaced ${competitorNames.join(', ')} as reference points. The report should emphasize where the client is under-supported on authority, content depth, or schema relative to those names.`;
}

function buildNarrativeSummary(evidence: ComprehensiveAuditEvidence, weightedScores: WeightedAuditScore[]): string {
  const weakest = [...weightedScores].sort((a, b) => a.score - b.score).slice(0, 2);
  return `The brand has enough substance to justify a serious audit, but the weakest areas are ${weakest.map((item) => item.label.toLowerCase()).join(' and ')}. That means the user should get a clear, premium-sounding roadmap, while the exact execution plan stays reserved for the strategy call.`;
}

export function buildComprehensiveAuditReport(evidence: ComprehensiveAuditEvidence): ComprehensiveAuditReport {
  const weightedScores: WeightedAuditScore[] = SCORE_KEYS.map((key) => {
    const score =
      key === 'aiCitability'
        ? scoreAiCitability(evidence)
        : key === 'brandAuthority'
        ? scoreBrandAuthority(evidence)
        : key === 'contentQuality'
        ? scoreContentQuality(evidence)
        : key === 'technicalFoundations'
        ? scoreTechnicalFoundations(evidence)
        : key === 'schemaMarkup'
        ? scoreSchemaMarkup(evidence)
        : derivePlatformReadiness(evidence).reduce((sum, platform) => sum + platformScore(platform.status), 0) /
          derivePlatformReadiness(evidence).length;

    const normalizedScore = clamp(score);
    const evidenceBullets = buildEvidenceBullets(evidence, key);

    return {
      key,
      label: SCORE_LABELS[key],
      weight: SCORE_WEIGHTS[key],
      score: normalizedScore,
      status: statusFromScore(normalizedScore),
      summary: buildStatusSummary(normalizedScore),
      evidence: evidenceBullets,
    };
  });

  const compositeScore = clamp(
    weightedScores.reduce((sum, item) => sum + item.score * item.weight, 0) /
      weightedScores.reduce((sum, item) => sum + item.weight, 0)
  );

  const compositeStatus = statusFromScore(compositeScore);
  const platformReadiness = derivePlatformReadiness(evidence);
  const surfaceLevelActions = buildPriorityActions(evidence).slice(0, 3);
  const foundationActions = buildFoundationActions(evidence);
  const accelerationActions = buildAccelerationActions(evidence);

  return {
    reportId: `${evidence.brandLabel.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${new Date(evidence.generatedAt).getTime().toString(36)}`,
    website: evidence.website,
    brandLabel: evidence.brandLabel,
    generatedAt: evidence.generatedAt,
    compositeScore,
    compositeStatus,
    executiveSummary: buildNarrativeSummary(evidence, weightedScores),
    weightedScores,
    evidence,
    platformReadiness,
    surfaceLevelActions,
    foundationActions,
    accelerationActions,
    competitorLandscapeSummary: buildCompetitorLandscapeSummary(evidence),
    offerPositioningSummary: buildOfferPositioningSummary(evidence),
    offerDeliverables: buildOfferDeliverables(),
  };
}

export function buildConsultingAuditNarrative(report: ComprehensiveAuditReport) {
  return {
    executiveSummary: report.executiveSummary,
    weightedScoreNarratives: report.weightedScores.map((score) => ({
      key: score.key,
      summary: score.summary,
      evidence: score.evidence,
    })),
    platformReadiness: report.platformReadiness,
    surfaceLevelActions: report.surfaceLevelActions,
    foundationActions: report.foundationActions,
    accelerationActions: report.accelerationActions,
    competitorLandscapeSummary: report.competitorLandscapeSummary,
    offerPositioningSummary: report.offerPositioningSummary,
    offerDeliverables: report.offerDeliverables,
  };
}
