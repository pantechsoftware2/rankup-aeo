import type { CrawlPayload } from '@/types/crawl';
import type { DeepAuditReport } from '@/types/deep-audit';
import type { FastScanResult } from '@/types/fast-scan';

export type AuditStatus = 'CRITICAL' | 'POOR' | 'FAIR' | 'GOOD' | 'STRONG';

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

export interface InternalPageEvidence {
  url: string;
  title: string;
  description: string;
  h1: string;
  wordCount: number;
  schemaTypes: string[];
  issues: string[];
}

export interface OffsiteSource {
  title: string;
  link: string;
  snippet: string;
  platform:
    | 'youtube'
    | 'reddit'
    | 'amazon'
    | 'linkedin'
    | 'reviews'
    | 'news'
    | 'comparison'
    | 'other';
}

export interface OffsiteResearch {
  sourceCount: number;
  platformCounts: Record<string, number>;
  notableSources: OffsiteSource[];
  competitorNames: string[];
  mentionSummary: string[];
}

export interface PlatformReadiness {
  platform: 'ChatGPT' | 'Perplexity' | 'Gemini' | 'Google AI Overviews';
  status: 'NOT CITABLE' | 'WEAK' | 'PROMISING' | 'STRONG';
  summary: string;
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
  fast: FastScanResult;
  deep: DeepAuditReport;
  internalPages: InternalPageEvidence[];
  offsiteResearch: OffsiteResearch;
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
