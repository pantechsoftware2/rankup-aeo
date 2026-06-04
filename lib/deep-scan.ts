import { callLLM, parseJsonResponse } from '@/lib/openrouter';
import { MODELS } from '@/lib/models';
import type { DeepAuditReport } from '@/types/deep-audit';

const SYSTEM_PROMPT = `You are an expert SEO and GEO (Generative Engine Optimization) auditor. Analyze the website data and return a concise, opinionated audit report.

AUDIT DIMENSIONS (score 0-100):
1. CONTENT-MARKET FIT: Does homepage match what the business does? Template artifacts? Blog targeting right funnel stage?
2. CREDIBILITY: Grammar/typos? Social proof? Team page substantive? Trust signals?
3. CONVERSION ARCHITECTURE: Clear primary CTA? Value prop above fold? Lead capture?
4. TECHNICAL SEO: Page speed, schema markup, critical missing elements
5. GEO READINESS: Can AI models extract content? E-E-A-T signals? Unique data? Query-focused answers?
6. COMPETITIVE POSITION: Content depth vs competitors? Gaps in coverage?

OUTPUT FORMAT (valid JSON only):
{
  "overallScore": number,
  "executiveSummary": "2-3 sentences",
  "dimensions": {
    "contentMarketFit": {"score": number, "findings": ["specific points"], "artifacts": ["template or placeholder issues"], "verdict": "one sentence"},
    "credibility": {"score": number, "findings": ["specific points"], "typosFound": ["typos or awkward phrases"], "verdict": "one sentence"},
    "conversionArchitecture": {"score": number, "ctaCount": number, "primaryCTA": "text or 'unclear'", "findings": ["specific points"], "verdict": "one sentence"},
    "technicalSEO": {"score": number, "findings": ["specific points"], "missingSchema": ["schema gaps"], "verdict": "one sentence"},
    "geoReadiness": {"score": number, "findings": ["specific points"], "citationWorthiness": "low|medium|high", "aiOverviewLikelihood": "unlikely|possible|likely", "verdict": "one sentence"},
    "competitivePosition": {"score": number, "contentGaps": ["gap examples"], "findings": ["specific points"], "verdict": "one sentence"}
  },
  "priorityActions": [{"title": "Action", "description": "What and why", "impact": "high|medium|low", "effort": "quick-win|moderate|significant", "category": "content|technical|geo|conversion|credibility"}],
  "geoSpecificRecommendations": [{"title": "Recommendation", "description": "Specific action", "rationale": "Why for AI visibility"}]
}

RULES:
- Return JSON only. No prose outside JSON.
- Be specific, not generic.
- Score based only on the provided data.
- Keep each findings array to 2-3 bullets.
- Max 3 priority actions and 2 GEO recommendations.
`;

function clampScore(value: unknown, fallback = 50): number {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, 4);
}

function asEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function normalizeDeepAuditReport(raw: any): DeepAuditReport {
  const dimensions = raw?.dimensions || {};

  return {
    overallScore: clampScore(raw?.overallScore, 60),
    executiveSummary: typeof raw?.executiveSummary === 'string' ? raw.executiveSummary.trim() : 'The site has enough substance for an audit, but the report needs follow-up review.',
    dimensions: {
      contentMarketFit: {
        score: clampScore(dimensions?.contentMarketFit?.score, 60),
        findings: asStringArray(dimensions?.contentMarketFit?.findings),
        artifacts: asStringArray(dimensions?.contentMarketFit?.artifacts),
        verdict: typeof dimensions?.contentMarketFit?.verdict === 'string' ? dimensions.contentMarketFit.verdict.trim() : 'Content-market fit is mixed.',
      },
      credibility: {
        score: clampScore(dimensions?.credibility?.score, 60),
        findings: asStringArray(dimensions?.credibility?.findings),
        typosFound: asStringArray(dimensions?.credibility?.typosFound),
        verdict: typeof dimensions?.credibility?.verdict === 'string' ? dimensions.credibility.verdict.trim() : 'Credibility signals are incomplete.',
      },
      conversionArchitecture: {
        score: clampScore(dimensions?.conversionArchitecture?.score, 60),
        ctaCount: Math.max(0, Math.round(Number(dimensions?.conversionArchitecture?.ctaCount || 0))),
        primaryCTA: typeof dimensions?.conversionArchitecture?.primaryCTA === 'string' ? dimensions.conversionArchitecture.primaryCTA.trim() : 'unclear',
        findings: asStringArray(dimensions?.conversionArchitecture?.findings),
        verdict: typeof dimensions?.conversionArchitecture?.verdict === 'string' ? dimensions.conversionArchitecture.verdict.trim() : 'Conversion architecture needs refinement.',
      },
      technicalSEO: {
        score: clampScore(dimensions?.technicalSEO?.score, 60),
        findings: asStringArray(dimensions?.technicalSEO?.findings),
        missingSchema: asStringArray(dimensions?.technicalSEO?.missingSchema),
        verdict: typeof dimensions?.technicalSEO?.verdict === 'string' ? dimensions.technicalSEO.verdict.trim() : 'Technical SEO is adequate but not complete.',
      },
      geoReadiness: {
        score: clampScore(dimensions?.geoReadiness?.score, 60),
        findings: asStringArray(dimensions?.geoReadiness?.findings),
        citationWorthiness: asEnum(dimensions?.geoReadiness?.citationWorthiness, ['low', 'medium', 'high'] as const, 'medium'),
        aiOverviewLikelihood: asEnum(dimensions?.geoReadiness?.aiOverviewLikelihood, ['unlikely', 'possible', 'likely'] as const, 'possible'),
        verdict: typeof dimensions?.geoReadiness?.verdict === 'string' ? dimensions.geoReadiness.verdict.trim() : 'GEO readiness is developing.',
      },
      competitivePosition: {
        score: clampScore(dimensions?.competitivePosition?.score, 60),
        contentGaps: asStringArray(dimensions?.competitivePosition?.contentGaps),
        findings: asStringArray(dimensions?.competitivePosition?.findings),
        verdict: typeof dimensions?.competitivePosition?.verdict === 'string' ? dimensions.competitivePosition.verdict.trim() : 'Competitive positioning is not fully differentiated.',
      },
    },
    priorityActions: Array.isArray(raw?.priorityActions)
      ? raw.priorityActions.slice(0, 4).map((action: any) => ({
          title: typeof action?.title === 'string' ? action.title.trim() : 'Improve core audit issue',
          description: typeof action?.description === 'string' ? action.description.trim() : 'Tighten the weakest part of the audit.',
          impact: asEnum(action?.impact, ['high', 'medium', 'low'] as const, 'medium'),
          effort: asEnum(action?.effort, ['quick-win', 'moderate', 'significant'] as const, 'moderate'),
          category: asEnum(action?.category, ['content', 'technical', 'geo', 'conversion', 'credibility'] as const, 'content'),
        }))
      : [],
    geoSpecificRecommendations: Array.isArray(raw?.geoSpecificRecommendations)
      ? raw.geoSpecificRecommendations.slice(0, 3).map((rec: any) => ({
          title: typeof rec?.title === 'string' ? rec.title.trim() : 'Improve AI visibility',
          description: typeof rec?.description === 'string' ? rec.description.trim() : 'Add clearer structured evidence for AI systems.',
          rationale: typeof rec?.rationale === 'string' ? rec.rationale.trim() : 'This makes the brand easier for AI systems to cite accurately.',
        }))
      : [],
  };
}

function buildAuditSnapshot(crawl: any, fast: any, url: string): string {
  const headings = crawl?.headings || {};
  const content = crawl?.content || {};
  const technical = crawl?.technical || {};
  const issues = crawl?.issues || {};
  const deductions = Array.isArray(fast?.technical?.deductions)
    ? fast.technical.deductions
        .slice(0, 4)
        .map((item: any) => `${item.reason} (-${item.points})`)
        .join('; ')
    : 'none';

  return [
    `URL: ${url}`,
    `META TITLE: ${crawl?.meta?.title || 'n/a'}`,
    `META DESCRIPTION: ${crawl?.meta?.description || 'n/a'}`,
    `H1: ${(headings.h1 || []).slice(0, 3).join(' | ') || 'n/a'}`,
    `H2: ${(headings.h2 || []).slice(0, 6).join(' | ') || 'n/a'}`,
    `CONTENT: wordCount=${content.wordCount || 0}, visibleTextLength=${content.visibleTextLength || 0}, csr=${Boolean(content.isClientSideRendered)}`,
    `EXCERPT: ${(content.bodyText || '').slice(0, 1200) || 'n/a'}`,
    `TECHNICAL: schema=${Boolean(technical.hasSchemaMarkup)}, schemaTypes=${(technical.schemaTypes || []).join(', ') || 'none'}, og=${Boolean(technical.hasOpenGraph)}, twitterCards=${Boolean(technical.hasTwitterCards)}, robotsTxt=${technical.hasRobotsTxt}, sitemap=${technical.hasSitemap}, internalLinks=${technical.internalLinkCount || 0}, externalLinks=${technical.externalLinkCount || 0}, images=${technical.imageCount || 0}, imagesWithoutAlt=${technical.imagesWithoutAlt || 0}`,
    `ISSUES: ${Object.entries(issues).filter(([, value]) => Boolean(value)).map(([key]) => key).join(', ') || 'none'}`,
    `FAST CLASSIFICATION: industry=${fast?.classification?.industry || 'unknown'}, niche=${fast?.classification?.niche || 'unknown'}, confidence=${fast?.classification?.confidence || 'low'}`,
    `FAST CLARITY: score=${fast?.clarity?.clarityScore || 0}, whatItDoes=${fast?.clarity?.whatItDoes || 'n/a'}, whoItsFor=${fast?.clarity?.whoItsFor || 'n/a'}, critique=${fast?.clarity?.critique || 'n/a'}`,
    `FAST TECHNICAL: score=${fast?.technical?.technicalScore || 0}, deductions=${deductions}`,
    `FAST PRESENCE: status=${fast?.presence?.status || 'unknown'}, signal=${fast?.presence?.signal || 'unknown'}, sourceCount=${fast?.presence?.sourceCount || 0}, discussionCount=${fast?.presence?.discussionCount || 0}, summary=${fast?.presence?.summary || 'n/a'}`,
    `FAST COMPETITORS: ${(fast?.competitors?.competitors || []).slice(0, 5).map((item: any) => `${item.name} (${item.estimatedVisibility})`).join(', ') || 'none'}`,
    `READINESS: segment=${fast?.readiness?.segment || 'unknown'}, recommendedPath=${fast?.readiness?.recommendedPath || 'unknown'}, reasons=${(fast?.readiness?.reasons || []).join('; ') || 'none'}`,
  ].join('\n');
}

async function repairDeepAuditReport(rawText: string): Promise<DeepAuditReport> {
  const repairPrompt = `Convert the following malformed or overly verbose audit draft into the required JSON schema. Do not add commentary. Return valid JSON only.\n\nDRAFT:\n${rawText.slice(0, 6000)}`;
  const repaired = await callLLM({
    model: MODELS.FAST,
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: repairPrompt,
    temperature: 0,
    maxTokens: 1200,
    timeoutMs: 10000,
    json: true,
  });

  return normalizeDeepAuditReport(parseJsonResponse(repaired));
}

export async function performDeepScan(crawl: any, fast: any) {
  const start = Date.now();

  const url = crawl?.meta?.canonical || crawl?.url || fast?.url || 'unknown';
  const userPrompt = buildAuditSnapshot(crawl, fast, url);

  let usedModel: string = MODELS.DEEP;
  try {
    const responseText = await callLLM({
      model: MODELS.DEEP,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      temperature: 0,
      maxTokens: 1000,
      timeoutMs: 12000,
      json: true,
    });

    const parsed = normalizeDeepAuditReport(parseJsonResponse(responseText));
    const totalMs = Date.now() - start;
    return { success: true, report: parsed, timing: { totalMs }, model: usedModel };
  } catch (err: any) {
    const errorMessage = String(err?.message || '');
    let rawDraft = '';

    if (errorMessage.includes('cleaned=')) {
      rawDraft = errorMessage.split('cleaned=')[1]?.trim() || '';
    } else if (errorMessage.includes('cleaned output:')) {
      rawDraft = errorMessage.split('cleaned output:')[1]?.trim() || '';
    }

    if (rawDraft) {
      try {
        const repaired = await repairDeepAuditReport(rawDraft);
        const totalMs = Date.now() - start;
        return { success: true, report: repaired, timing: { totalMs }, model: `${usedModel}:repaired` };
      } catch (repairError) {
        console.error('Deep scan repair failed, retrying with FALLBACK:', repairError);
      }
    } else {
      console.error('Deep scan failed on DEEP model, retrying with FALLBACK:', err);
    }

    usedModel = MODELS.FALLBACK;
    try {
      const responseText = await callLLM({
        model: MODELS.FALLBACK,
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        temperature: 0,
        maxTokens: 1200,
        timeoutMs: 18000,
        json: true,
      });
      const parsed = normalizeDeepAuditReport(parseJsonResponse(responseText));
      const totalMs = Date.now() - start;
      return { success: true, report: parsed, timing: { totalMs }, model: usedModel };
    } catch (err2: any) {
      console.error('Deep scan failed on FALLBACK model:', err2);
      return { success: false, error: err2.message || String(err2) };
    }
  }
}
