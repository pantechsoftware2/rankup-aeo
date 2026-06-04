import type { ComprehensiveAuditReport } from '@/types/comprehensive-report';

export type DeepReportJobStatus =
  | 'queued'
  | 'processing'
  | 'awaiting_review'
  | 'completed'
  | 'failed';

export interface DeepReportJobLead {
  name: string;
  email: string;
  phone: string;
  company?: string;
  website: string;
  source: string;
}

export interface DeepReportJobRecord {
  id: string;
  status: DeepReportJobStatus;
  createdAt: string;
  updatedAt: string;
  lead: DeepReportJobLead;
  report?: ComprehensiveAuditReport;
  error?: string;
  deliveredAt?: string;
}
