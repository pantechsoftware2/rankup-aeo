import type { CrawlPayload } from '@/types/crawl';
import type { FastScanResult } from '@/types/fast-scan';
import type { DeepAuditReport } from '@/types/deep-audit';

export type PaymentStatus = 'free' | 'pending' | 'paid' | 'failed';

export interface AuditHistoryInput {
  userId?: string | null;
  domain: string;
  generatedAt?: string;
  freeAuditUsed: boolean;
  paymentStatus: PaymentStatus;
  stripeSessionId?: string | null;
  paymentIntent?: string | null;
  amountPaid?: number | null;
  customerEmail?: string | null;
  reportUrl?: string | null;
  crawl?: CrawlPayload | null;
  fast?: FastScanResult | null;
  deep?: DeepAuditReport | null;
}

export interface AuditHistoryRecord extends AuditHistoryInput {
  id: string;
  auditVersion: number;
  generatedAt: string;
}
