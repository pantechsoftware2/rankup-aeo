import type { CrawlPayload } from '@/types/crawl';

export type DeepReportJobStatus =
  | 'queued'
  | 'processing'
  | 'awaiting_review'
  | 'completed'
  | 'failed';

export type AuditStatus = 'CRITICAL' | 'POOR' | 'FAIR' | 'GOOD' | 'STRONG';

export interface DeepReportLead {
  name: string;
  email: string;
  phone: string;
  company?: string;
  website: string;
  source: string;
}

export interface InternalPageEvidence {
  url: string;
  title: string;
  description: string;
  h1: string;
  wordCount: number;
  schemaTypes: string[];
  issues: string[];
  excerpt: string;
}

export interface OffsiteSource {
  title: string;
  link: string;
  snippet: string;
  platform: 'youtube' | 'reddit' | 'amazon' | 'linkedin' | 'reviews' | 'news' | 'comparison' | 'other';
}

export interface OffsiteResearch {
  sourceCount: number;
  platformCounts: Record<string, number>;
  notableSources: OffsiteSource[];
  competitorNames: string[];
  mentionSummary: string[];
  queries: string[];
}

export interface WeightedAuditScore {
  key:
    | 'aiCitability'
    | 'brandAuthority'
    | 'contentQuality'
    | 'technicalFoundations'
    | 'schemaMarkup'
    | 'platformOptimization';
  label: string;
  weight: number;
  score: number;
  status: AuditStatus;
  summary: string;
  evidence: string[];
}

export interface PlatformReadiness {
  platform: 'ChatGPT' | 'Perplexity' | 'Gemini' | 'Google AI Overviews';
  status: 'NOT CITABLE' | 'WEAK' | 'PROMISING' | 'STRONG';
  summary: string;
  evidence: string[];
}

export interface PrioritizedAction {
  title: string;
  detail: string;
  impact: string;
  effort: string;
}

export interface ConsultingAuditNarrative {
  executiveSummary: string;
  weightedScoreNarratives: Array<{
    key: WeightedAuditScore['key'];
    summary: string;
    evidence: string[];
  }>;
  platformReadiness: PlatformReadiness[];
  surfaceLevelActions: PrioritizedAction[];
  foundationActions: PrioritizedAction[];
  accelerationActions: PrioritizedAction[];
  competitorLandscapeSummary: string;
  offerPositioningSummary: string;
  offerDeliverables: string[];
}

export interface ComprehensiveAuditEvidence {
  website: string;
  brandLabel: string;
  generatedAt: string;
  crawl: CrawlPayload;
  fast: unknown;
  deep: unknown;
  internalPages: InternalPageEvidence[];
  offsiteResearch: OffsiteResearch;
  keyEvidenceBlocks: string[];
}

export interface ComprehensiveAuditReport {
  reportId: string;
  website: string;
  brandLabel: string;
  generatedAt: string;
  compositeScore: number;
  compositeStatus: AuditStatus;
  executiveSummary: string;
  weightedScores: WeightedAuditScore[];
  evidence: ComprehensiveAuditEvidence;
  platformReadiness: PlatformReadiness[];
  surfaceLevelActions: PrioritizedAction[];
  foundationActions: PrioritizedAction[];
  accelerationActions: PrioritizedAction[];
  competitorLandscapeSummary: string;
  offerPositioningSummary: string;
  offerDeliverables: string[];
}

export interface DeepReportJobRecord {
  id: string;
  status: DeepReportJobStatus;
  createdAt: string;
  updatedAt: string;
  lead: DeepReportLead;
  report?: ComprehensiveAuditReport;
  error?: string;
  deliveredAt?: string;
  reviewedAt?: string;
  pdfPath?: string;
  evidencePath?: string;
  reviewNotes?: string;
}

export interface DeepReportRequestInput {
  website: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  source?: string;
}

export interface DeepReportProcessorResult {
  job: DeepReportJobRecord;
  processed: boolean;
  delivered: boolean;
  report?: ComprehensiveAuditReport;
}

