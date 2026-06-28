export interface EvidenceWorkbenchSummaryItem {
  label: string;
  value: string;
}

export interface EvidenceWorkbenchContextAnchor {
  evidenceUseProhibited?: boolean;
  id: string;
  kind?: string;
  label: string;
  supportingText: string;
}

export interface EvidenceWorkbenchClaim {
  id: string;
  title: string;
  status: string;
  text: string;
  warningIds: string[];
}

export interface EvidenceWorkbenchSource {
  citationCount: number;
  citations: EvidenceWorkbenchSourceCitation[];
  contextAnchors: EvidenceWorkbenchContextAnchor[];
  directWarnings: EvidenceWorkbenchSourceWarning[];
  excerptIds: string[];
  expiresAt: string | null;
  freshness: string;
  isClaimSupportingEvidence: boolean;
  isSelectedClaimSource: boolean;
  id: string;
  lastUpdated: string | null;
  meta: string;
  ownerLabel: string;
  preview: string;
  relationshipWarnings: EvidenceWorkbenchSourceWarning[];
  reviewOwnerQueue: string;
  sourceOrigin: string;
  sourceType: string;
  status: string;
  title: string;
  trustState: string;
}

export interface EvidenceWorkbenchSourceCitation {
  claimId: string;
  excerptId: string;
  id: string;
  marker: string;
  relationship: string;
  status: string;
  warningIds: string[];
}

export interface EvidenceWorkbenchSourceWarning {
  blocksApproval: boolean;
  code: string;
  evidenceImpact: string;
  id: string;
  message: string;
  severity: string;
}

export interface EvidenceWorkbenchSourceFilter {
  count: number;
  description: string;
  id: string;
  label: string;
  sourceIds: string[];
}

export interface EvidenceWorkbenchCitation {
  id: string;
  claimId: string;
  excerptId: string;
  marker: string;
  relationship: string;
  sourceId: string;
  sourceLabel: string;
  status: string;
  warningIds: string[];
}

export interface EvidenceWorkbenchWarning {
  id: string;
  message: string;
  severity: string;
}

export interface EvidenceWorkbenchGraphStep {
  heading: string;
  summary: string;
}

export interface EvidenceWorkbenchFetchState {
  message?: string;
  source: "backend" | "fallback";
}

export interface EvidenceWorkbenchViewModel {
  answer: {
    generatedAt: string;
    markdown: string;
    status: string;
    summary: string;
    title: string;
  };
  citations: EvidenceWorkbenchCitation[];
  context: {
    anchors: EvidenceWorkbenchContextAnchor[];
    plannedTravelDate: string;
    question: string;
    title: string;
  };
  fetchState: EvidenceWorkbenchFetchState;
  graph: {
    accessibleSummary: string;
    fallbackSteps: EvidenceWorkbenchGraphStep[];
  };
  review: {
    activeWarningCount: number;
    blockedByWarningIds: string[];
    copyState: string;
    selectedClaimId: string;
    status: string;
  };
  reviewClaims: EvidenceWorkbenchClaim[];
  sourceFilters: EvidenceWorkbenchSourceFilter[];
  sourceItems: EvidenceWorkbenchSource[];
  summary: EvidenceWorkbenchSummaryItem[];
  warnings: EvidenceWorkbenchWarning[];
}
