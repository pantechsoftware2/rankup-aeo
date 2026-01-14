import { z } from 'zod';

// 1. The Interface (Used by Frontend & Gemini)
export interface AEOReportData {
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

// 2. The Schema (Used by API Routes for Validation)
export const AEOReportDataSchema = z.object({
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