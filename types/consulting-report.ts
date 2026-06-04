import type { CrawlPayload } from '@/types/crawl';

export type ConsultingScoreStatus = 'CRITICAL' | 'POOR' | 'FAIR' | 'GOOD' | 'STRONG';
export type ReportJobStatus = 'queued' | 'processing' | 'awaiting_review' | 'approved' | 'sent' | 'failed';
export type LeadSource =
  | 'report_preview_gate'
  | 'manual_smoke_test'
  | 'implementation_intake'
  | 'audit_conversion_flow'
  | 'onboarding_page'
  | 'unknown';

export interface ReportDimensionScore {
  key: 'aiVisibility' | 'brandAuthority' | 'contentQuality' | 'technicalSEO' | 'schema' | 'platformReadiness';
  label: string;
  weight: number;
  score: number;
  status: ConsultingScoreStatus;
  summary: string;
}

export interface MentionBreakdown {
  youtube: number;
  reddit: number;
  amazon: number;
  linkedin: number;
  directories: number;
  news: number;
  reviews: number;
  other: number;
}

export interface MentionEvidence {
  title: string;
  link: string;
  snippet: string;
  channel: keyof MentionBreakdown | 'other';
  sentiment: 'positive' | 'neutral' | 'mixed';
}

export interface CompetitorEvidence {
  name: string;
  source: string;
  reason: string;
  estimatedStrength: number;
}

export interface KeywordOpportunity {
  keyword: string;
  intent: 'commercial' | 'comparison' | 'informational' | 'local';
  rationale: string;
}

export interface PageEvidence {
  url: string;
  pageType: 'homepage' | 'product' | 'blog' | 'feature' | 'pricing' | 'about' | 'faq' | 'collection' | 'other';
  crawl: CrawlPayload;
}

export interface SiteEvidenceBundle {
  website: string;
  brandName: string;
  fetchedAt: string;
  homepage: CrawlPayload;
  pages: PageEvidence[];
  keywordOpportunities: KeywordOpportunity[];
  offsite: {
    brandMentions: MentionEvidence[];
    mentionBreakdown: MentionBreakdown;
    competitors: CompetitorEvidence[];
    discussionCount: number;
    reviewSignals: string[];
    summary: string;
  };
  derived: {
    indexedPageEstimate: number;
    totalCrawledPages: number;
    pagesWithSchema: number;
    pagesWithAuthorSignals: number;
    pagesWithFaqContent: number;
    citableBlockCount: number;
    averageWordCount: number;
    botsLikelyAllowed: string[];
    likelyBlockedBots: string[];
  };
}

export interface WeightedScorecard {
  compositeScore: number;
  dimensions: ReportDimensionScore[];
}

export interface PlatformAssessment {
  platform: 'ChatGPT' | 'Perplexity' | 'Gemini' | 'Google AI Overviews';
  status: 'NOT CITABLE' | 'WEAK' | 'PROMISING' | 'COMPETITIVE';
  summary: string;
}

export interface ReportSection {
  score?: number;
  summary: string;
  findings: string[];
}

export interface ActionPlanItem {
  action: string;
  expectedImpact: string;
  effort: string;
}

export interface ConsultingAuditReport {
  generatedAt: string;
  brandName: string;
  website: string;
  market: string;
  compositeScore: number;
  scorecard: ReportDimensionScore[];
  executiveSummary: string;
  aiVisibility: ReportSection;
  crawlerAccess: {
    summary: string;
    bots: { name: string; userAgent: string; status: string; impact: string }[];
    recommendations: string[];
  };
  brandAuthority: ReportSection & {
    mentionBreakdown: MentionBreakdown;
    mentionHighlights: MentionEvidence[];
  };
  platformAssessments: PlatformAssessment[];
  contentAndEEAT: ReportSection;
  technicalFoundations: ReportSection;
  schemaAnalysis: ReportSection & {
    missingSchema: string[];
  };
  keywordGapAnalysis: {
    summary: string;
    opportunities: KeywordOpportunity[];
  };
  competitorLandscape: {
    summary: string;
    competitors: CompetitorEvidence[];
  };
  actionPlan: {
    quickWins: ActionPlanItem[];
    foundation: ActionPlanItem[];
    acceleration: ActionPlanItem[];
  };
  withheldFromReport: string[];
  nextStepCTA: {
    label: string;
    href: string;
    description: string;
  };
}

export interface DeepReportLead {
  name: string;
  email: string;
  phone: string;
  company?: string;
}

export interface DeepReportJob {
  id: string;
  status: ReportJobStatus;
  source: LeadSource;
  createdAt: string;
  updatedAt: string;
  website: string;
  brandName: string;
  lead: DeepReportLead;
  notes?: string;
  error?: string;
  scorecard?: WeightedScorecard;
  evidence?: SiteEvidenceBundle;
  report?: ConsultingAuditReport;
  sentAt?: string;
  approvedAt?: string;
}
