import { z } from 'zod';

/**
 * LEGACY TYPE - Deprecated
 * This interface was used by the old Serper-based brand mention scan.
 * The new flow uses DeepAuditReport and FastScanResult from deep-audit.ts and scan-context.tsx
 * 
 * Kept only for backward compatibility if any old /api routes still reference it.
 * All new components should use the updated audit report types.
 */

// 1. The Interface (Used by old flow - GhostTownReceipts, aeo-analyzer.ts)
export interface LegacyAEOReport {
  status: 'SUCCESS' | 'GHOST_TOWN' | 'ERROR';
  visibility: {
    score: number;
    rank: number;
    competitors: string[];
  };
  sentiment: {
    score: number;
    positive: number;
    negative: number;
    neutral: number;
  };
  citations: {
    sources: { name: string; percentage: number }[];
  };
  content_strategy: {
    score: number;
    opportunities: string[];
    missing_topics: string[];
  };
  summary: string;
  // The new field for the receipts card
  sourceBreakdown?: {
    tierA: number;
    tierB: number;
    tierC: number;
  };
}

// Alias for backward compatibility (deprecated - use LegacyAEOReport instead)
export type AEOReportData = LegacyAEOReport;

// 2. The Schema (Used by old API Routes - deprecated)
export const LegacyAEOReportSchema = z.object({
  status: z.enum(['SUCCESS', 'GHOST_TOWN', 'ERROR']),
  visibility: z.object({
    score: z.number(),
    rank: z.number(),
    competitors: z.array(z.string())
  }),
  sentiment: z.object({
    score: z.number(),
    positive: z.number(),
    negative: z.number(),
    neutral: z.number()
  }),
  citations: z.object({
    sources: z.array(z.object({
      name: z.string(),
      percentage: z.number()
    }))
  }),
  content_strategy: z.object({
    score: z.number(),
    opportunities: z.array(z.string()),
    missing_topics: z.array(z.string())
  }),
  summary: z.string(),
  sourceBreakdown: z.object({
    tierA: z.number(),
    tierB: z.number(),
    tierC: z.number()
  }).optional()
});

// Alias for backward compatibility (deprecated - use LegacyAEOReportSchema instead)
export const AEOReportDataSchema = LegacyAEOReportSchema;
