export interface EvidenceWorkbenchSummaryItem {
  label: string;
  value: string;
}

export interface EvidenceWorkbenchContextAnchor {
  id: string;
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
  id: string;
  title: string;
  meta: string;
  preview: string;
  status: string;
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
    status: string;
    summary: string;
    title: string;
  };
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
    status: string;
  };
  reviewClaims: EvidenceWorkbenchClaim[];
  sourceItems: EvidenceWorkbenchSource[];
  summary: EvidenceWorkbenchSummaryItem[];
  warnings: EvidenceWorkbenchWarning[];
}
