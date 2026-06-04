export type OutboundSegment = 'b2b_services' | 'home_services' | 'law_firms';
export type OutboundProspectStatus = 'new' | 'snapshot_ready' | 'rejected';

export interface OutboundContactInfo {
  emails: string[];
  phones: string[];
  contactPage?: string;
}

export interface OutboundSnapshot {
  opener: string;
  findings: string[];
  implication: string;
  callToAction: string;
}

export interface OutboundProspect {
  id: string;
  segment: OutboundSegment;
  status: OutboundProspectStatus;
  companyName: string;
  website: string;
  sourceQuery: string;
  location?: string;
  fitScore: number;
  weaknessScore: number;
  opportunityScore: number;
  contact: OutboundContactInfo;
  evidenceSummary: string;
  snapshot: OutboundSnapshot;
  createdAt: string;
  updatedAt: string;
}
