import * as cheerio from 'cheerio';
import { scoreConsultingReport } from '@/lib/report-rubric';
import { searchSerper } from '@/lib/serper';
import { validatePublicAuditUrl, safeFetchText } from '@/lib/security';
import { collectSiteEvidence } from '@/lib/site-evidence';
import { upsertOutboundProspect } from '@/lib/outbound-storage';
import type { OutboundContactInfo, OutboundProspect, OutboundSegment, OutboundSnapshot } from '@/types/outbound';

const BLOCKED_PROSPECT_DOMAINS = [
  'linkedin.com',
  'facebook.com',
  'instagram.com',
  'yelp.com',
  'angi.com',
  'angi',
  'thumbtack.com',
  'clutch.co',
  'upcity.com',
  'zoominfo.com',
  'apollo.io',
  'wikipedia.org',
  'mapquest.com',
  'birdeye.com',
  'bbb.org',
];

function buildQueries(segment: OutboundSegment, location?: string) {
  const geo = location?.trim() ? ` in ${location.trim()}` : '';

  if (segment === 'b2b_services') {
    return [
      `"marketing agency"${geo}`,
      `"consulting firm"${geo}`,
      `"recruiting firm"${geo}`,
      `"software development agency"${geo}`,
    ];
  }

  if (segment === 'home_services') {
    return [`"hvac company"${geo}`, `"plumbing company"${geo}`, `"roofing company"${geo}`, `"landscaping company"${geo}`];
  }

  return [`"law firm"${geo}`, `"personal injury lawyer"${geo}`, `"family law firm"${geo}`, `"immigration lawyer"${geo}`];
}

function normalizeRootUrl(value: string) {
  const url = new URL(value);
  return `${url.protocol}//${url.hostname}`.replace(/\/+$/, '');
}

function shouldSkipDomain(url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  return BLOCKED_PROSPECT_DOMAINS.some((blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`));
}

function isLikelyProspectResult(segment: OutboundSegment, title: string, snippet: string) {
  const haystack = `${title} ${snippet}`.toLowerCase();

  if (/\b(jobs|salary|salaries|career|careers|news|events|event|community|directory|directories|list of|roundup)\b/.test(haystack)) {
    return false;
  }

  if (segment === 'b2b_services') {
    return /\b(agency|consulting|consultant|recruiting|development|marketing|design|studio|services)\b/.test(haystack);
  }

  if (segment === 'home_services') {
    return /\b(hvac|plumbing|roofing|landscaping|contractor|repair|service)\b/.test(haystack);
  }

  return /\b(law|lawyer|attorney|legal|firm)\b/.test(haystack);
}

function isLikelyRealBusinessHomepage(segment: OutboundSegment, homepageText: string) {
  const haystack = homepageText.toLowerCase();

  if (/\b(job board|careers at|latest news|upcoming events|best places to work|community platform|directory)\b/.test(haystack)) {
    return false;
  }

  if (segment === 'b2b_services') {
    return /\b(services|clients|case studies|book a call|strategy|branding|marketing|consulting|development)\b/.test(haystack);
  }

  if (segment === 'home_services') {
    return /\b(schedule service|free estimate|service area|repair|installation|residential|commercial)\b/.test(haystack);
  }

  return /\b(practice areas|attorneys|consultation|case results|legal team)\b/.test(haystack);
}

function extractContactInfo(rawHtml: string, homepageUrl: string): OutboundContactInfo {
  const $ = cheerio.load(rawHtml || '');
  const emails = new Set<string>();
  const phones = new Set<string>();
  let contactPage: string | undefined;

  const text = $.text();
  const emailMatches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  emailMatches.slice(0, 5).forEach((match) => emails.add(match.toLowerCase()));

  const phoneMatches = text.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/g) || [];
  phoneMatches.slice(0, 3).forEach((match) => phones.add(match.trim()));

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href') || '';
    const label = ($(element).text() || '').toLowerCase();

    if (href.startsWith('mailto:')) {
      emails.add(href.replace(/^mailto:/i, '').split('?')[0].trim().toLowerCase());
    }

    if (href.startsWith('tel:')) {
      phones.add(href.replace(/^tel:/i, '').trim());
    }

    if (!contactPage && (label.includes('contact') || href.toLowerCase().includes('contact'))) {
      try {
        contactPage = new URL(href, homepageUrl).toString();
      } catch {
        // ignore bad href
      }
    }
  });

  return {
    emails: [...emails].filter(Boolean).slice(0, 3),
    phones: [...phones].filter(Boolean).slice(0, 2),
    contactPage,
  };
}

async function enrichContactInfo(homepageHtml: string, homepageUrl: string) {
  const base = extractContactInfo(homepageHtml, homepageUrl);

  if (base.emails.length > 0 && base.phones.length > 0) {
    return base;
  }

  if (!base.contactPage) {
    return base;
  }

  try {
    const contactHtml = await safeFetchText(base.contactPage, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });

    const extra = extractContactInfo(contactHtml, base.contactPage);
    return {
      emails: [...new Set([...base.emails, ...extra.emails])].slice(0, 3),
      phones: [...new Set([...base.phones, ...extra.phones])].slice(0, 2),
      contactPage: base.contactPage || extra.contactPage,
    };
  } catch {
    return base;
  }
}

function buildFindings(args: {
  companyName: string;
  compositeScore: number;
  evidence: Awaited<ReturnType<typeof collectSiteEvidence>>;
}) {
  const { evidence } = args;
  const findings: string[] = [];

  if (evidence.homepage.issues.missingMetaDescription) {
    findings.push('The homepage is missing a meta description, which weakens click-through clarity in Google.');
  }
  if (evidence.homepage.issues.missingSchemaMarkup || evidence.derived.pagesWithSchema === 0) {
    findings.push('The site has little to no usable schema support, which makes machine understanding thinner than it should be.');
  }
  if (evidence.homepage.issues.lowContentLength || evidence.derived.averageWordCount < 350) {
    findings.push('The core pages are light on factual depth, which makes the business harder to rank and harder to cite.');
  }
  if (evidence.derived.pagesWithFaqContent === 0) {
    findings.push('There is almost no FAQ or decision-stage content to answer the questions buyers actually ask before they choose.');
  }
  if (evidence.derived.pagesWithAuthorSignals === 0) {
    findings.push('Trust cues are thinner than they should be, so the site does not signal enough authority or accountability.');
  }
  if (evidence.pages.length < 2) {
    findings.push('The site looks structurally thin, which usually means too few pages are doing real ranking work.');
  }

  return findings.slice(0, 3);
}

function buildSnapshot(args: {
  companyName: string;
  evidence: Awaited<ReturnType<typeof collectSiteEvidence>>;
  compositeScore: number;
}): OutboundSnapshot {
  const findings = buildFindings(args);
  const weaknessBand =
    args.compositeScore < 35 ? 'a fairly weak visibility foundation' : args.compositeScore < 60 ? 'an underpowered visibility stack' : 'a decent site that still leaks discovery';

  return {
    opener: `${args.companyName} looks like it has ${weaknessBand} across Google and answer-engine research.`,
    findings: findings.length
      ? findings
      : ['The site is usable, but it still under-explains the business and leaves trust signals thinner than they should be.'],
    implication:
      'This usually means the business is easier to skip than it should be during shortlist-stage research.',
    callToAction:
      'We can fix this over a focused 90-day retainer by tightening the pages, trust layer, and citation-readiness in the right order.',
  };
}

function computeScores(args: {
  evidence: Awaited<ReturnType<typeof collectSiteEvidence>>;
  compositeScore: number;
  contact: OutboundContactInfo;
}) {
  const weaknessScore = Math.max(0, 100 - args.compositeScore);
  const fitScore =
    (args.contact.emails.length ? 25 : 0) +
    (args.contact.phones.length ? 15 : 0) +
    Math.min(20, args.evidence.pages.length * 4) +
    (args.evidence.derived.pagesWithSchema > 0 ? 10 : 0) +
    (args.evidence.derived.totalCrawledPages >= 3 ? 15 : 0) +
    (args.evidence.homepage.content.wordCount >= 200 ? 15 : 0);

  let opportunityScore = Math.round(weaknessScore * 0.55 + fitScore * 0.45);
  if (args.compositeScore < 15) opportunityScore -= 12;
  if (args.compositeScore > 80) opportunityScore -= 15;

  return {
    fitScore: Math.max(0, Math.min(100, fitScore)),
    weaknessScore: Math.max(0, Math.min(100, weaknessScore)),
    opportunityScore: Math.max(0, Math.min(100, opportunityScore)),
  };
}

function summaryForEvidence(companyName: string, compositeScore: number) {
  if (compositeScore < 35) {
    return `${companyName} has a weak visibility foundation and likely needs core trust, structure, and content fixes before it can compete well.`;
  }
  if (compositeScore < 60) {
    return `${companyName} has real room to improve across rankings, trust, and answer-engine readiness.`;
  }
  return `${companyName} already has some decent signals, but there are still obvious gaps that could make outreach resonate.`;
}

export async function sourceOutboundProspects(input: {
  segment: OutboundSegment;
  location?: string;
  limit?: number;
}) {
  const queries = buildQueries(input.segment, input.location);
  const rawResults = await Promise.all(queries.map((query) => searchSerper(query)));
  const results = rawResults.flat();
  const seen = new Set<string>();
  const websites: Array<{ website: string; sourceQuery: string }> = [];

  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    try {
      if (!isLikelyProspectResult(input.segment, result.title, result.snippet)) continue;
      const website = normalizeRootUrl(await validatePublicAuditUrl(result.link));
      if (shouldSkipDomain(website)) continue;
      if (seen.has(website)) continue;
      seen.add(website);
      websites.push({
        website,
        sourceQuery: queries[Math.min(rawResults.length - 1, Math.floor(index / 10))] || queries[0],
      });
      if (websites.length >= (input.limit || 10)) break;
    } catch {
      // skip invalid or blocked host
    }
  }

  const prospects: OutboundProspect[] = [];

  for (const item of websites) {
    try {
      const evidence = await collectSiteEvidence(item.website);
      if (
        !isLikelyRealBusinessHomepage(
          input.segment,
          `${evidence.homepage.meta.title} ${evidence.homepage.meta.description} ${evidence.homepage.content.bodyText}`
        )
      ) {
        continue;
      }
      const scorecard = scoreConsultingReport(evidence);
      const contact = await enrichContactInfo(evidence.homepage.rawHtml, evidence.homepage.url);
      const snapshot = buildSnapshot({
        companyName: evidence.brandName,
        evidence,
        compositeScore: scorecard.compositeScore,
      });
      const { fitScore, weaknessScore, opportunityScore } = computeScores({
        evidence,
        compositeScore: scorecard.compositeScore,
        contact,
      });

      const status = opportunityScore >= 45 ? 'snapshot_ready' : 'rejected';

      const prospect = await upsertOutboundProspect({
        segment: input.segment,
        status,
        companyName: evidence.brandName,
        website: item.website,
        sourceQuery: item.sourceQuery,
        location: input.location,
        fitScore,
        weaknessScore,
        opportunityScore,
        contact,
        evidenceSummary: summaryForEvidence(evidence.brandName, scorecard.compositeScore),
        snapshot,
      });

      prospects.push(prospect);
    } catch (error) {
      console.warn('[Outbound] Failed to source prospect', item.website, error);
    }
  }

  return prospects.sort((a, b) => b.opportunityScore - a.opportunityScore);
}
