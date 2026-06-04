export interface FastScanResult {
  classification: {
    industry: string;
    niche: string;
    confidence: 'high' | 'medium' | 'low';
  };
  clarity: {
    clarityScore: number;
    whatItDoes: string;
    whoItsFor: string;
    critique: string;
    isCSR: boolean;
  };
  technical: {
    technicalScore: number;
    deductions: { reason: string; points: number }[];
  };
  competitors: {
    competitors: { name: string; estimatedVisibility: number }[];
  };
  presence: {
    status: 'ghost-town' | 'emerging' | 'visible' | 'unknown';
    signal: 'off-site' | 'heuristic' | 'unavailable';
    sourceCount: number;
    discussionCount: number;
    summary: string;
  };
  readiness: {
    segment: 'foundation' | 'audit';
    recommendedPath: 'foundation' | 'retainer';
    summary: string;
    reasons: string[];
  };
}
