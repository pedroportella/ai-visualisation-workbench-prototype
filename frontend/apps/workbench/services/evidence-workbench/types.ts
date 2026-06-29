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
  blocksApproval?: boolean;
  code?: string;
  evidenceImpact?: string;
  id: string;
  introducedByActionId?: string;
  message: string;
  severity: string;
}

export interface EvidenceWorkbenchReviewAction {
  addsWarningIds: string[];
  allowedFromStatuses: string[];
  auditEventType: string;
  clearsWarningIds: string[];
  description: string;
  id: string;
  label: string;
  requiresNote: boolean;
  statusAfter: string;
  targetObjectIds: string[];
  type: string;
  uiTone: "caution" | "destructive" | "primary" | "secondary";
}

export interface EvidenceWorkbenchAuditMetadata {
  boundaryNoteForDocs?: string;
  contractMode: string;
  id: string;
  lastReviewActionId: string | null;
  modelLabel: string;
  reviewEventIds: string[];
  runtimeModeLabel: string;
}

export interface EvidenceWorkbenchGraphStep {
  includeIds: string[];
  step: number;
  heading: string;
  summary: string;
}

export interface EvidenceWorkbenchGraphPosition {
  column: number;
  row: number;
}

export interface EvidenceWorkbenchGraphNode {
  displayOrder: number;
  graphId: string;
  id: string;
  label: string;
  positionHint: EvidenceWorkbenchGraphPosition;
  refObjectId: string;
  refObjectType: string;
  status: string;
  type: string;
  warningIds: string[];
}

export interface EvidenceWorkbenchGraphEdge {
  fromNodeId: string;
  graphId: string;
  id: string;
  label: string;
  refObjectId: string;
  refObjectType: string;
  toNodeId: string;
  type: string;
  warningIds: string[];
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
    defaultFocusedSourceIds: string[];
    defaultFocusedWarningIds: string[];
    defaultSelectedClaimId: string;
    defaultSelectedNodeId: string;
    edges: EvidenceWorkbenchGraphEdge[];
    fallbackSteps: EvidenceWorkbenchGraphStep[];
    id: string;
    layoutHint: string;
    nodes: EvidenceWorkbenchGraphNode[];
    smallViewportFallback: string;
  };
  review: {
    actions: EvidenceWorkbenchReviewAction[];
    activeWarningCount: number;
    activeWarningIds: string[];
    availableActionIds: string[];
    blockedByWarningIds: string[];
    completedActionIds: string[];
    copyState: string;
    id: string;
    lastActionId: string | null;
    reviewerIdLabel: string;
    reviewerNote: string | null;
    selectedClaimId: string;
    status: string;
    statusId: string;
    updatedAt: string;
  };
  audit: EvidenceWorkbenchAuditMetadata;
  reviewClaims: EvidenceWorkbenchClaim[];
  sourceFilters: EvidenceWorkbenchSourceFilter[];
  sourceItems: EvidenceWorkbenchSource[];
  summary: EvidenceWorkbenchSummaryItem[];
  warnings: EvidenceWorkbenchWarning[];
}
