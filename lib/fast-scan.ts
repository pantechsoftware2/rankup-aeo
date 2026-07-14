import { crawlWebsite } from '@/lib/crawler';
import { callLLM, cleanJsonResponse, parseJsonResponse } from '@/lib/openrouter';
import { MODELS } from '@/lib/models';
import { performBrandSearch, searchSerper, type SearchScanResult } from '@/lib/serper';
import type { CrawlPayload } from '@/types/crawl';

interface ClassificationResult {
  industry: string;
  niche: string;
  confidence: 'high' | 'medium' | 'low';
}

interface ClarityResult {
  clarityScore: number;
  whatItDoes: string;
  whoItsFor: string;
  critique: string;
  isCSR: boolean;
}

interface TechnicalResult {
  technicalScore: number;
  deductions: { reason: string; points: number }[];
}

interface CompetitorResult {
  competitors: { name: string; estimatedVisibility: number }[];
}

interface PresenceResult {
  status: 'ghost-town' | 'emerging' | 'visible' | 'unknown';
  signal: 'off-site' | 'heuristic' | 'unavailable';
  sourceCount: number;
  discussionCount: number;
  summary: string;
}

interface ReadinessResult {
  segment: 'foundation' | 'audit';
  recommendedPath: 'foundation' | 'retainer';
  summary: string;
  reasons: string[];
}

// Utility for timing out slow analysis tasks to avoid >10s fast scan stalls.
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutHandle = setTimeout(() => resolve(fallback), timeoutMs);
  });

  const result = await Promise.race([promise, timeoutPromise]);
  clearTimeout(timeoutHandle!);
  return result;
}

interface FastScanOptions {
  crawlPayload?: CrawlPayload;
}

export async function performFastScan(inputUrl: string, options: FastScanOptions = {}) {
  const startTime = Date.now();

  if (!inputUrl || typeof inputUrl !== 'string') {
    throw new Error('URL required');
  }

  let normalizedUrl = inputUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  console.log(`[Fast Scan] Starting fast scan for: ${normalizedUrl}`);

  const crawlStart = Date.now();

  let crawlPayload: CrawlPayload;
  let crawlMs = 0;

  if (options.crawlPayload) {
    crawlPayload = options.crawlPayload;
    crawlMs = Date.now() - crawlStart;
    console.log(`[Fast Scan] Using pre-crawled payload (crawl time: ${crawlMs}ms)`);
  } else {
    console.log(`[Fast Scan] Starting crawl for: ${normalizedUrl}`);
    crawlPayload = await crawlWebsite(normalizedUrl);
    crawlMs = Date.now() - crawlStart;
    console.log(`[Fast Scan] Crawl completed in ${crawlMs}ms`);
  }

  const analysisStart = Date.now();

  const classificationPromise = runClassificationAnalysis(crawlPayload);
  const clarityPromise = runClarityAnalysis(crawlPayload);
  const technicalPromise = Promise.resolve(runTechnicalAnalysis(crawlPayload));

  const brandName = deriveBrandName(crawlPayload);

  const competitorPromise = classificationPromise
    .then((classification) => runCompetitorAnalysis(classification, brandName))
    .catch((error) => {
      console.warn('[Fast Scan] Classification failed, using fallback for competitor analysis:', error?.message || error);

      const fallbackIndustry = crawlPayload.meta.description
        ? crawlPayload.meta.description.split(/[\.\-\|\–]/)[0].trim().slice(0, 80)
        : 'Unknown';
      const fallbackNiche = crawlPayload.meta.title
        ? crawlPayload.meta.title.split(/[\-\|]/)[0].trim().slice(0, 80)
        : 'Unknown';
      const fallbackClassification: ClassificationResult = {
        industry: fallbackIndustry || 'Unknown',
        niche: fallbackNiche || 'Unknown',
        confidence: 'low',
      };

      return runCompetitorAnalysis(fallbackClassification, brandName);
    });

  // Enforce a per-task cap for fast analysis and run in parallel.
  const FAST_ANALYSIS_TASK_TIMEOUT_MS = 12000;

  const classificationSettledPromise = classificationPromise
    .then((value) => ({ status: 'fulfilled' as const, value }))
    .catch((reason) => ({ status: 'rejected' as const, reason }));

  const claritySettledPromise = clarityPromise
    .then((value) => ({ status: 'fulfilled' as const, value }))
    .catch((reason) => ({ status: 'rejected' as const, reason }));

  const technicalSettledPromise = technicalPromise
    .then((value) => ({ status: 'fulfilled' as const, value }))
    .catch((reason) => ({ status: 'rejected' as const, reason }));

  const competitorsSettledPromise = competitorPromise
    .then((value) => ({ status: 'fulfilled' as const, value }))
    .catch((reason) => ({ status: 'rejected' as const, reason }));

  const [classificationSettled, claritySettled, technicalSettled, competitorsSettled] =
    await Promise.all([
      withTimeout(classificationSettledPromise, FAST_ANALYSIS_TASK_TIMEOUT_MS, { status: 'rejected' as const, reason: new Error('Timeout') }),
      withTimeout(claritySettledPromise, FAST_ANALYSIS_TASK_TIMEOUT_MS, { status: 'rejected' as const, reason: new Error('Timeout') }),
      withTimeout(technicalSettledPromise, FAST_ANALYSIS_TASK_TIMEOUT_MS, { status: 'rejected' as const, reason: new Error('Timeout') }),
      withTimeout(competitorsSettledPromise, FAST_ANALYSIS_TASK_TIMEOUT_MS, { status: 'rejected' as const, reason: new Error('Timeout') }),
    ]);

  const analysisMs = Date.now() - analysisStart;
  const totalMs = Date.now() - startTime;

  const resolvedClassification: ClassificationResult = classificationSettled.status === 'fulfilled'
    ? classificationSettled.value
    : {
        industry: extractMainTopic(crawlPayload.meta.description || crawlPayload.meta.ogDescription || crawlPayload.meta.title || 'Unknown'),
        niche: crawlPayload.meta.title || 'Unknown Niche',
        confidence: 'low',
      };

  const clarity = claritySettled.status === 'fulfilled'
    ? claritySettled.value
    : generateClarityFallback(crawlPayload);

  if (claritySettled.status === 'rejected') {
    console.warn('[Fast Scan] Clarity task timed out / failed, applied fallback:', clarity);
  }

  const technical = technicalSettled.status === 'fulfilled'
    ? technicalSettled.value
    : { technicalScore: 0, deductions: [{ reason: 'Analysis failed', points: 100 }] };

  const competitors = await normalizeCompetitorResult(
    competitorsSettled.status === 'fulfilled' ? competitorsSettled.value : null,
    resolvedClassification,
    brandName
  );

  const presence = await withTimeout(
    runPresenceAssessment(crawlPayload),
    5000,
    generatePresenceFallback()
  );
  const readiness = determineReadiness(crawlPayload, clarity, technical, presence);

  const response = {
    crawl: crawlPayload,
    fast: {
      classification: resolvedClassification,
      clarity,
      technical,
      competitors,
      presence,
      readiness,
    },
    timing: {
      crawlMs,
      analysisMs,
      totalMs,
    },
  };

  console.log(`[Fast Scan] Complete in ${totalMs}ms (crawl: ${crawlMs}ms, analysis: ${analysisMs}ms)`);
  return response;
}

async function runClassificationAnalysis(crawl: CrawlPayload): Promise<ClassificationResult> {
  const input = `META TITLE: ${crawl.meta.title}\nMETA DESCRIPTION: ${crawl.meta.description}\nOG TITLE: ${crawl.meta.ogTitle}\nOG DESCRIPTION: ${crawl.meta.ogDescription}\n\nFIRST 2000 CHARS OF BODY:\n${crawl.content.bodyText.substring(0, 2000)}`;

  const systemPrompt = `You are a business classification expert. Given website metadata and content, identify the exact industry and niche. Be specific - 'Airbnb automation software for property managers' not 'Real Estate Technology'. Return JSON only.`;

  const userPrompt = `Analyze this website and identify its industry and niche:\n\n${input}\n\nReturn a JSON object with this exact structure:\n{\n  "industry": "string",\n  "niche": "string",\n  "confidence": "high" | "medium" | "low"\n}`;

  try {
    const response = await callLLM({
      model: MODELS.FAST,
      systemPrompt,
      userPrompt,
      temperature: 0.2,
      maxTokens: 400,
      timeoutMs: 10000,
      json: true,
    });

    const parsed = parseJsonResponse(response);

    const industry = (parsed.industry || '').toString().trim();
    const niche = (parsed.niche || '').toString().trim();
    const confidenceRaw = (parsed.confidence || 'medium').toString().toLowerCase();
    const confidence = ['high', 'medium', 'low'].includes(confidenceRaw) ? (confidenceRaw as 'high' | 'medium' | 'low') : 'medium';

    if (!industry || !niche) {
      throw new Error('Missing industry or niche in response');
    }

    console.log('[Classification Analysis] Success:', { industry, niche, confidence });
    return { industry, niche, confidence };
  } catch (error: any) {
    console.error('[Classification Analysis] Failed:', {
      message: error?.message || String(error),
      type: error?.constructor?.name || 'Unknown',
      timestamp: new Date().toISOString(),
    });

    const industry = extractMainTopic(crawl.meta.description || crawl.meta.ogDescription || crawl.meta.title || 'Unknown');
    const niche = crawl.meta.title || 'Unknown Niche';
    return { industry, niche, confidence: 'low' };
  }
}

async function runClarityAnalysis(crawl: CrawlPayload): Promise<ClarityResult> {
  const headingsText = [
    ...crawl.headings.h1.map((h) => `H1: ${h}`),
    ...crawl.headings.h2.map((h) => `H2: ${h}`),
    ...crawl.headings.h3.map((h) => `H3: ${h}`),
  ].join('\n');

  const input = `HEADINGS:\n${headingsText}\n\nMETA DESCRIPTION: ${crawl.meta.description}\n\nFIRST 3000 CHARS OF BODY:\n${crawl.content.bodyText.substring(0, 3000)}\n\nIS CLIENT-SIDE RENDERED: ${crawl.content.isClientSideRendered}\nVISIBLE TEXT LENGTH: ${crawl.content.visibleTextLength}`;

  const systemPrompt = `You are a conversion rate optimization expert. Evaluate whether this website's homepage clearly communicates: 1) What the product/service is, 2) Who it's for, 3) Why someone should care. Grade clarity 0-100. If the visible content is under 200 chars, note it's likely client-side rendered and score accordingly. Be brutally honest - vague aspirational copy ('Unlock your potential') gets a low score. Return JSON only.`;

  const userPrompt = `Evaluate the clarity of this website's homepage messaging:\n\n${input}\n\nReturn a JSON object with this exact structure:\n{\n  "clarityScore": number (0-100),\n  "whatItDoes": "string (what the product/service does)",\n  "whoItsFor": "string (target audience)",\n  "critique": "string (honest assessment)",\n  "isCSR": boolean (true if client-side rendered with minimal content)\n}`;

  try {
    const response = await callLLM({
      model: MODELS.FAST,
      systemPrompt,
      userPrompt,
      temperature: 0.2,
      maxTokens: 500,
      timeoutMs: 10000,
      json: true,
    });

    const parsed = parseJsonResponse(response);

    if (parsed.clarityScore == null || typeof parsed.clarityScore !== 'number' || parsed.clarityScore < 0 || parsed.clarityScore > 100) {
      throw new Error(`Invalid clarityScore: ${parsed.clarityScore}`);
    }
    if (!parsed.whatItDoes || typeof parsed.whatItDoes !== 'string') {
      throw new Error(`Invalid whatItDoes: ${parsed.whatItDoes}`);
    }
    if (!parsed.whoItsFor || typeof parsed.whoItsFor !== 'string') {
      throw new Error(`Invalid whoItsFor: ${parsed.whoItsFor}`);
    }
    if (!parsed.critique || typeof parsed.critique !== 'string') {
      throw new Error(`Invalid critique: ${parsed.critique}`);
    }
    if (typeof parsed.isCSR !== 'boolean') {
      throw new Error(`Invalid isCSR: ${parsed.isCSR}`);
    }

    console.log('[Clarity Analysis] Success:', {
      score: parsed.clarityScore,
      isCSR: parsed.isCSR,
    });

    return {
      clarityScore: parsed.clarityScore,
      whatItDoes: parsed.whatItDoes,
      whoItsFor: parsed.whoItsFor,
      critique: parsed.critique,
      isCSR: parsed.isCSR,
    };
  } catch (error: any) {
    console.error('[Clarity Analysis] Failed:', {
      message: error?.message || String(error),
      type: error?.constructor?.name || 'Unknown',
      timestamp: new Date().toISOString(),
    });
    return generateClarityFallback(crawl);
  }
}

function generateClarityFallback(crawl: CrawlPayload): ClarityResult {
  const bodyText = crawl.content.bodyText.toLowerCase();
  const title = (crawl.meta.title || '').toLowerCase();
  const description = (crawl.meta.description || '').toLowerCase();

  let clarityScore = 50;
  let whatItDoes = extractMainTopic(crawl.meta.description || crawl.meta.title);
  let whoItsFor = 'Businesses and professionals';
  let critique = '';

  if (crawl.headings.h1.length === 0) {
    clarityScore -= 15;
    critique += 'Missing H1 tag. ';
  } else if (crawl.headings.h1.length > 1) {
    clarityScore -= 10;
    critique += 'Multiple H1 tags found. ';
  } else {
    const h1Text = crawl.headings.h1[0].toLowerCase();
    whatItDoes = crawl.headings.h1[0];
    if (h1Text.includes('welcome') || h1Text.includes('home') || h1Text === 'untitled') {
      clarityScore -= 10;
      critique += `H1 is generic ("${crawl.headings.h1[0]}"). `;
    } else {
      clarityScore += 10;
    }
  }

  const clarityKeywords = ['benefit', 'feature', 'solution', 'help', 'support', 'service', 'product', 'platform', 'tool', 'app'];
  const foundKeywords = clarityKeywords.filter((k) => bodyText.includes(k)).length;
  clarityScore += Math.min(foundKeywords * 3, 15);

  if (crawl.content.visibleTextLength < 200) {
    clarityScore -= 25;
    critique += 'Very minimal visible content (likely client-side rendered). ';
  } else if (crawl.content.visibleTextLength < 500) {
    clarityScore -= 15;
    critique += 'Limited visible content on homepage. ';
  } else {
    clarityScore += 5;
  }

  if (!crawl.meta.description) {
    clarityScore -= 5;
    critique += 'No meta description. ';
  } else if (crawl.meta.description.length < 30) {
    clarityScore -= 3;
    critique += 'Meta description is very short. ';
  }

  const vagueTerms = ['unlock', 'potential', 'transform', 'empower', 'revolutionize', 'innovate'];
  const foundVague = vagueTerms.filter((t) => bodyText.includes(t)).length;
  if (foundVague > 2) {
    clarityScore -= 10;
    critique += `Uses vague aspirational language (${foundVague} instances). `;
  }

  clarityScore = Math.max(25, Math.min(100, clarityScore));

  if (bodyText.includes('business') || bodyText.includes('enterprise')) {
    whoItsFor = 'Businesses';
  } else if (bodyText.includes('developer') || bodyText.includes('engineer')) {
    whoItsFor = 'Developers and engineers';
  } else if (bodyText.includes('personal') || bodyText.includes('individual')) {
    whoItsFor = 'Individual users';
  }

  if (!critique) {
    critique = 'Website structure is clear with decent messaging. ';
  }
  critique += 'Analyzed from page structure (LLM analysis unavailable).';

  console.log('[Clarity Fallback] Generated from content analysis:', {
    clarityScore,
    isCSR: crawl.content.isClientSideRendered,
  });

  return {
    clarityScore,
    whatItDoes,
    whoItsFor,
    critique,
    isCSR: crawl.content.isClientSideRendered,
  };
}

function extractMainTopic(text: string | null): string {
  if (!text) return 'Unknown';
  const firstSentence = text.split(/[\.!?]/)[0];
  return firstSentence.substring(0, 100) || 'Unknown';
}

function runTechnicalAnalysis(crawl: CrawlPayload): TechnicalResult {
  let score = 100;
  const deductions: { reason: string; points: number }[] = [];

  if (crawl.issues.missingSchemaMarkup) {
    score -= 15;
    deductions.push({ reason: 'Missing schema markup', points: 15 });
  }

  if (crawl.issues.missingMetaDescription) {
    score -= 10;
    deductions.push({ reason: 'Missing meta description', points: 10 });
  }

  if (crawl.issues.missingH1) {
    score -= 10;
    deductions.push({ reason: 'Missing H1 tag', points: 10 });
  } else if (crawl.issues.multipleH1s) {
    score -= 10;
    deductions.push({ reason: 'Multiple H1 tags found', points: 10 });
  }

  if (crawl.issues.missingCanonical) {
    score -= 5;
    deductions.push({ reason: 'Missing canonical URL', points: 5 });
  }

  if (crawl.issues.missingViewport) {
    score -= 5;
    deductions.push({ reason: 'Missing viewport meta tag', points: 5 });
  }

  if (crawl.issues.noAltTextOnImages) {
    score -= 10;
    deductions.push({ reason: 'More than 50% of images missing alt text', points: 10 });
  }

  if (crawl.technical.hasRobotsTxt === false) {
    score -= 5;
    deductions.push({ reason: 'Missing robots.txt', points: 5 });
  }

  if (crawl.technical.hasSitemap === false) {
    score -= 5;
    deductions.push({ reason: 'Missing sitemap.xml', points: 5 });
  }

  if (crawl.issues.lowContentLength) {
    score -= 10;
    deductions.push({ reason: 'Low content (less than 300 words)', points: 10 });
  }

  return {
    technicalScore: Math.max(0, score),
    deductions,
  };
}

async function runCompetitorAnalysis(
  classification: ClassificationResult,
  brandName: string
): Promise<CompetitorResult> {
  const input = `INDUSTRY: ${classification.industry}\nNICHE: ${classification.niche}\nBRAND NAME: ${brandName}`;

  const systemPrompt = `You are a competitive intelligence analyst. Given this brand's industry and niche, identify 5 real competitors. For each, estimate their relative market visibility (0-100). Only name companies that actually exist in this space. Return JSON only.`;

  const userPrompt = `Identify real competitors for this brand:\n\n${input}\n\nReturn a JSON object with this exact structure:\n{\n  "competitors": [\n    { "name": "string", "estimatedVisibility": number (0-100) }\n  ]\n}\n\nProvide exactly 5 competitors.`;

  try {
    const response = await callLLM({
      model: MODELS.FAST,
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 400,
      timeoutMs: 10000,
      json: true,
    });

    const parsed = parseJsonResponse(response);

    type ParsedCompetitor = { name: string; estimatedVisibility: number };

    const competitors = Array.isArray(parsed.competitors)
      ? (parsed.competitors as any[])
          .map((c): ParsedCompetitor => ({
            name: (c?.name || '').toString().trim(),
            estimatedVisibility: Number(c?.estimatedVisibility),
          }))
          .filter((c: ParsedCompetitor) => {
            return (
              c.name &&
              !isGenericCompetitorName(c.name) &&
              !isSameBrand(c.name, brandName) &&
              !Number.isNaN(c.estimatedVisibility) &&
              c.estimatedVisibility >= 0 &&
              c.estimatedVisibility <= 100
            );
          })
          .slice(0, 5)
      : [];

    if (competitors.length < 3) {
      return findCompetitorsFromSearch(classification, brandName);
    }

    console.log('[Competitor Analysis] Success:', { count: competitors.length });
    return { competitors };
  } catch (error: any) {
    console.error('[Competitor Analysis] Failed:', {
      message: error?.message || String(error),
      industry: classification.industry,
      niche: classification.niche,
      timestamp: new Date().toISOString(),
    });

    return findCompetitorsFromSearch(classification, brandName);
  }
}

async function normalizeCompetitorResult(
  result: CompetitorResult | null,
  classification: Pick<ClassificationResult, 'industry' | 'niche'>,
  brandName: string
): Promise<CompetitorResult> {
  if (result?.competitors?.length) {
    return result;
  }

  return findCompetitorsFromSearch(classification, brandName);
}

function isGenericCompetitorName(name: string) {
  return /^(market leader|strong competitor|established player|growing competitor|emerging alternative)\s*#?\d*$/i.test(name.trim());
}

function normalizeComparableName(name: string) {
  return name
    .toLowerCase()
    .replace(/https?:\/\/|www\./g, '')
    .replace(/\.(com|in|co|net|org|edu)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isSameBrand(candidate: string, brandName: string) {
  const candidateName = normalizeComparableName(candidate);
  const brand = normalizeComparableName(brandName);

  if (!candidateName || !brand) return false;
  if (candidateName === brand) return true;
  if (brand.includes(candidateName) || candidateName.includes(brand)) return true;

  const candidateTokens = new Set(candidateName.split(/\s+/).filter((token) => token.length >= 3));
  const brandTokens = brand
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !['best', 'global', 'group', 'india', 'study'].includes(token));
  const sharedTokens = brandTokens.filter((token) => candidateTokens.has(token));

  return sharedTokens.length >= 2;
}

async function findCompetitorsFromSearch(
  classification: Pick<ClassificationResult, 'industry' | 'niche'>,
  brandName = ''
): Promise<CompetitorResult> {
  const searchSubject = [brandName, classification.niche, classification.industry]
    .map((part) => part?.trim())
    .filter((part) => part && !/^unknown/i.test(part));
  const category = [classification.niche, classification.industry]
    .map((part) => part?.trim())
    .filter((part) => part && !/^unknown/i.test(part))
    .join(' ');

  if (!brandName && !category) {
    return { competitors: [] };
  }

  const queries = Array.from(new Set([
    brandName ? `"${brandName}" competitors alternatives` : '',
    brandName ? `companies like "${brandName}"` : '',
    category ? `${category} competitors alternatives` : '',
    searchSubject.join(' ') ? `${searchSubject.join(' ')} similar companies` : '',
  ].filter(Boolean)));

  try {
    const batches = await Promise.all(queries.slice(0, 4).map((query) => searchSerper(query)));
    const results = batches.flat();
    const competitors = extractSearchCompetitors(results, brandName);

    console.log('[Competitor Search] Derived competitors from search:', {
      brandName,
      category,
      queryCount: queries.length,
      resultCount: results.length,
      competitorCount: competitors.length,
    });

    return { competitors };
  } catch (error: any) {
    console.warn('[Competitor Search] Failed to derive competitors from search:', error?.message || error);
    return { competitors: [] };
  }
}

function extractSearchCompetitors(
  results: SearchScanResult[],
  brandName: string
): { name: string; estimatedVisibility: number }[] {
  const candidates = new Map<string, { name: string; score: number }>();

  for (const result of results) {
    const sourceText = `${result.title} ${result.snippet}`;
    const sourceWeight = hasCompetitorIntent(sourceText) ? 4 : 1;
    const names = [
      ...extractComparisonNames(sourceText, brandName),
      extractDomainBrand(result.link),
    ].filter(Boolean) as string[];

    for (const name of names) {
      const cleaned = cleanCompetitorName(name);
      if (!isValidSearchCompetitor(cleaned, brandName)) {
        continue;
      }

      const key = normalizeComparableName(cleaned);
      const current = candidates.get(key) || { name: cleaned, score: 0 };
      current.score += sourceWeight;
      candidates.set(key, current);
    }
  }

  return Array.from(candidates.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((candidate, index) => ({
      name: candidate.name,
      estimatedVisibility: Math.max(45, Math.min(88, 82 - index * 7 + Math.min(candidate.score, 6))),
    }));
}

function hasCompetitorIntent(text: string) {
  return /alternatives?|competitors?|compare|comparison|versus|vs\.?|similar companies|companies like/i.test(text);
}

function extractComparisonNames(text: string, brandName: string) {
  const candidates = new Set<string>();
  const separators = /\s+vs\.?\s+|\s+versus\s+|\s+alternatives?\s+to\s+|\s+competitors?\s+to\s+|\s+similar to\s+|\s+companies like\s+/i;

  for (const part of text.split(/[|•·,\n]/)) {
    const trimmed = part.trim();
    if (!hasCompetitorIntent(trimmed)) {
      continue;
    }

    for (const segment of trimmed.split(separators)) {
      const cleaned = cleanCompetitorName(segment);
      if (cleaned && !isSameBrand(cleaned, brandName)) {
        candidates.add(cleaned);
      }
    }
  }

  for (const match of text.matchAll(/\b[A-Z][a-zA-Z0-9&+.-]{2,}(?:\s+[A-Z][a-zA-Z0-9&+.-]{2,}){0,3}\b/g)) {
    const cleaned = cleanCompetitorName(match[0]);
    if (cleaned && !isSameBrand(cleaned, brandName)) {
      candidates.add(cleaned);
    }
  }

  return Array.from(candidates);
}

function extractDomainBrand(link: string) {
  try {
    const host = new URL(link).hostname.replace(/^www\./, '');
    const parts = host.split('.');
    const root = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
    return root
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  } catch {
    return '';
  }
}

function cleanCompetitorName(name: string) {
  return name
    .replace(/\b(best|top|leading|popular|reviews?|pricing|features?|alternatives?|competitors?|comparison|compare|versus|vs)\b/gi, ' ')
    .replace(/\b(in|for|near|with|and|or|the|a|an|to|of)\b$/gi, ' ')
    .replace(/[()[\]{}"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}

function isValidSearchCompetitor(name: string, brandName: string) {
  if (!name || name.length < 3) return false;
  if (isSameBrand(name, brandName)) return false;
  if (isGenericCompetitorName(name)) return false;
  if (/^(http|https|www|com|org|net|search|result|website|homepage|limited crawl fallback)$/i.test(name)) return false;
  if (/^(google|youtube|linkedin|facebook|instagram|reddit|x|twitter|quora|medium|wikipedia)$/i.test(name)) return false;
  if (/^\d/.test(name)) return false;
  return true;
}

function deriveBrandName(crawl: CrawlPayload): string {
  const genericBrands = new Set([
    'app',
    'demo',
    'dev',
    'example',
    'localhost',
    'site',
    'staging',
    'test',
    'website',
  ]);

  try {
    const hostname = new URL(crawl.url).hostname.replace(/^www\./, '');
    const hostParts = hostname.split('.');
    const hostBrand = hostParts.length >= 2 ? hostParts[hostParts.length - 2] : hostParts[0];

    if (hostBrand && !genericBrands.has(hostBrand.toLowerCase())) {
      return hostBrand;
    }
  } catch {
    // Fall through to title-based extraction.
  }

  const titleCandidates = [
    crawl.meta.ogTitle,
    crawl.meta.title,
    crawl.headings.h1[0],
    crawl.meta.description,
  ].filter(Boolean) as string[];

  for (const candidate of titleCandidates) {
    if (/example domain|coming soon|under construction/i.test(candidate)) {
      continue;
    }

    const parts = candidate
      .split(/[\|\-–•]/)
      .map((part) => part.trim())
      .filter(Boolean);

    for (const part of parts.reverse()) {
      const cleaned = part.replace(/[^\w\s]/g, '').trim();
      if (!cleaned) continue;
      if (cleaned.length > 40) continue;
      if (genericBrands.has(cleaned.toLowerCase())) continue;
      return cleaned.slice(0, 80);
    }
  }

  return 'Unknown Brand';
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function isPlaceholderSite(crawl: CrawlPayload, brandName: string): boolean {
  const hostname = getHostname(crawl.url);
  const genericHosts = ['example.com', 'localhost', '127.0.0.1'];
  const placeholderCopy = `${crawl.meta.title} ${crawl.meta.description} ${crawl.content.bodyText.slice(0, 240)}`.toLowerCase();

  return (
    genericHosts.includes(hostname) ||
    brandName.toLowerCase() === 'unknown brand' ||
    /example domain|coming soon|under construction|hello world/.test(placeholderCopy)
  );
}

function tokenizeBrand(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

function resultMentionsBrand(result: { title: string; link: string; snippet: string }, brandName: string, hostname: string): boolean {
  const haystack = `${result.title} ${result.snippet} ${result.link}`.toLowerCase();
  const hostTokens = tokenizeBrand(hostname.replace(/\.[a-z]+$/i, ''));
  const brandTokens = tokenizeBrand(brandName);
  const tokens = Array.from(new Set([...brandTokens, ...hostTokens])).filter((token) => {
    return !['com', 'www', 'site'].includes(token);
  });

  if (hostname && haystack.includes(hostname)) {
    return true;
  }

  return tokens.some((token) => haystack.includes(token));
}

function classifyPresenceSource(url: string): 'discussion' | 'general' | 'directory' {
  const lower = url.toLowerCase();

  if (
    lower.includes('reddit.com') ||
    lower.includes('quora.com') ||
    lower.includes('twitter.com') ||
    lower.includes('x.com') ||
    lower.includes('ycombinator.com') ||
    lower.includes('indiehackers.com') ||
    lower.includes('producthunt.com')
  ) {
    return 'discussion';
  }

  if (
    lower.includes('trustpilot') ||
    lower.includes('g2.com') ||
    lower.includes('glassdoor') ||
    lower.includes('linkedin.com/company') ||
    lower.includes('crunchbase') ||
    lower.includes('zoominfo') ||
    lower.includes('justdial') ||
    lower.includes('sulekha')
  ) {
    return 'directory';
  }

  return 'general';
}

async function runPresenceAssessment(crawl: CrawlPayload): Promise<PresenceResult> {
  if (!process.env.SERPER_API_KEY) {
    return generatePresenceFallback();
  }

  const brandName = deriveBrandName(crawl);
  if (!brandName || brandName.toLowerCase() === 'unknown brand' || isPlaceholderSite(crawl, brandName)) {
    return {
      status: 'ghost-town',
      signal: 'heuristic',
      sourceCount: 0,
      discussionCount: 0,
      summary: 'This looks like a placeholder or ultra-low-signal site, so we are skipping off-site visibility claims and routing it into the foundation path.',
    };
  }

  try {
    const results = await performBrandSearch(brandName);
    if (results.length === 0) {
      return {
        status: 'unknown',
        signal: 'off-site',
        sourceCount: 0,
        discussionCount: 0,
        summary: `No off-site brand mentions were found for ${brandName}.`,
      };
    }

    const hostname = getHostname(crawl.url);
    const relevantResults = results.filter((result) => resultMentionsBrand(result, brandName, hostname));

    if (relevantResults.length === 0) {
      return {
        status: 'ghost-town',
        signal: 'off-site',
        sourceCount: 0,
        discussionCount: 0,
        summary: `Search results for ${brandName} did not clearly map back to this exact site or brand.`,
      };
    }

    let discussionCount = 0;
    let generalCount = 0;
    let directoryCount = 0;

    for (const result of relevantResults) {
      const tier = classifyPresenceSource(result.link);
      if (tier === 'discussion') discussionCount++;
      if (tier === 'general') generalCount++;
      if (tier === 'directory') directoryCount++;
    }

    if (discussionCount >= 2 || generalCount >= 6 || (generalCount >= 4 && directoryCount >= 1)) {
      return {
        status: 'visible',
        signal: 'off-site',
        sourceCount: relevantResults.length,
        discussionCount,
        summary: `${brandName} has enough branded off-site coverage to justify a deeper strategic audit.`,
      };
    }

    return {
      status: relevantResults.length >= 2 || directoryCount >= 1 || discussionCount >= 1 ? 'emerging' : 'ghost-town',
      signal: 'off-site',
      sourceCount: relevantResults.length,
      discussionCount,
      summary:
        relevantResults.length >= 2 || directoryCount >= 1 || discussionCount >= 1
          ? `We found some real branded search visibility for ${brandName}, but the off-site signal is still thin.`
          : `We found very little trustworthy off-site evidence for ${brandName} beyond scattered mentions.`,
    };
  } catch (error: any) {
    console.warn('[Presence Assessment] Failed, using fallback:', error?.message || error);
    return generatePresenceFallback();
  }
}

function generatePresenceFallback(): PresenceResult {
  return {
    status: 'unknown',
    signal: 'unavailable',
    sourceCount: 0,
    discussionCount: 0,
    summary: 'Off-site presence checks are unavailable until SERPER is configured.',
  };
}

function determineReadiness(
  crawl: CrawlPayload,
  clarity: ClarityResult,
  technical: TechnicalResult,
  presence: PresenceResult
): ReadinessResult {
  const reasons: string[] = [];
  let foundationPoints = 0;

  if (presence.status === 'ghost-town') {
    foundationPoints += 2;
    reasons.push('There is little trustworthy off-site visibility for this brand yet.');
  }

  if (presence.status === 'emerging') {
    reasons.push('There is some off-site visibility already, so a full audit can still be useful if the site fundamentals are strong.');
  }

  if (crawl.content.wordCount < 150 || crawl.content.visibleTextLength < 300) {
    foundationPoints += 2;
    reasons.push('The homepage has very little indexable copy, so a deep audit would be low-signal.');
  }

  if (clarity.clarityScore < 45) {
    foundationPoints += 2;
    reasons.push('The site messaging is not yet clear enough to support a high-confidence strategic audit.');
  }

  if (technical.technicalScore < 60) {
    foundationPoints += 1;
    reasons.push('Core technical foundations are missing, so the first step should be cleanup and setup.');
  }

  const criticalIssues = [
    crawl.issues.missingMetaDescription,
    crawl.issues.missingCanonical,
    crawl.issues.missingSchemaMarkup,
    crawl.issues.lowContentLength,
  ].filter(Boolean).length;

  if (criticalIssues >= 3) {
    foundationPoints += 2;
    reasons.push('Multiple baseline SEO/AEO foundations are still missing.');
  }

  if (crawl.content.isClientSideRendered && crawl.content.visibleTextLength < 300) {
    foundationPoints += 2;
    reasons.push('The page is mostly a shell to crawlers, so audit findings would be incomplete.');
  }

  if (foundationPoints >= 3) {
    return {
      segment: 'foundation',
      recommendedPath: 'foundation',
      summary:
        'This site is better served by a foundation package or signup flow first. Fix baseline content, structure, and visibility before showing a full retainer-style audit.',
      reasons,
    };
  }

  return {
    segment: 'audit',
    recommendedPath: 'retainer',
    summary:
      'This site has enough substance to support a full audit. Show the deep report, then drive the user into a strategy call or retainer conversation.',
    reasons:
      reasons.length > 0
        ? reasons
        : ['The site has enough content and structure for an in-depth audit and upsell conversation.'],
  };
}
