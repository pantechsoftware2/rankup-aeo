export type Verdict = string;

export interface DimensionResult {
  score: number;
  findings: string[];
  verdict: string;
}

export interface ContentMarketFitResult extends DimensionResult {
  artifacts: string[];
}

export interface CredibilityResult extends DimensionResult {
  typosFound: string[];
}

export interface ConversionArchitectureResult extends DimensionResult {
  ctaCount: number;
  primaryCTA: string;
}

export interface TechnicalSEOResult extends DimensionResult {
  missingSchema: string[];
}

export interface GeoReadinessResult extends DimensionResult {
  citationWorthiness: 'low' | 'medium' | 'high';
  aiOverviewLikelihood: 'unlikely' | 'possible' | 'likely';
}

export interface CompetitivePositionResult extends DimensionResult {
  contentGaps: string[];
}

export interface PriorityAction {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'quick-win' | 'moderate' | 'significant';
  category: 'content' | 'technical' | 'geo' | 'conversion' | 'credibility';
}

export interface GeoRecommendation {
  title: string;
  description: string;
  rationale: string;
}

export interface DeepAuditReport {
  overallScore: number;
  executiveSummary: string;
  dimensions: {
    contentMarketFit: ContentMarketFitResult;
    credibility: CredibilityResult;
    conversionArchitecture: ConversionArchitectureResult;
    technicalSEO: TechnicalSEOResult;
    geoReadiness: GeoReadinessResult;
    competitivePosition: CompetitivePositionResult;
  };
  priorityActions: PriorityAction[];
  geoSpecificRecommendations: GeoRecommendation[];
}
