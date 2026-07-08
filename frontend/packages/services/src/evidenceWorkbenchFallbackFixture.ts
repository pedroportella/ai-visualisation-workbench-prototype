import type {
  EvidenceWorkbenchContextAnchor,
  EvidenceWorkbenchGraphEdge,
  EvidenceWorkbenchGraphNode,
  EvidenceWorkbenchSource,
  EvidenceWorkbenchSourceFilter,
  EvidenceWorkbenchViewModel
} from "./evidenceWorkbenchTypes";
import { REVIEW_ACTION_RECORDS } from "./evidenceWorkbenchReviewActionFixture";

const fallbackContextAnchors: EvidenceWorkbenchContextAnchor[] = [
  {
    evidenceUseProhibited: true,
    id: "PCA-FALLBACK-001",
    kind: "Station",
    label: "South Brisbane station",
    supportingText: "Context anchor only"
  },
  {
    evidenceUseProhibited: true,
    id: "PCA-FALLBACK-002",
    kind: "Place",
    label: "QPAC/Grey Street",
    supportingText: "Context anchor only"
  },
  {
    evidenceUseProhibited: true,
    id: "PCA-FALLBACK-003",
    kind: "Hospital",
    label: "Princess Alexandra Hospital",
    supportingText: "Context anchor only"
  }
];

const fallbackSourceItems: EvidenceWorkbenchSource[] = [
  {
    citationCount: 0,
    citations: [],
    contextAnchors: [fallbackContextAnchors[0]],
    directWarnings: [],
    excerptIds: ["SRC-FALLBACK-001-EXCERPT-001"],
    expiresAt: null,
    freshness: "Unknown",
    id: "SRC-FALLBACK-001",
    isClaimSupportingEvidence: true,
    isSelectedClaimSource: false,
    lastUpdated: null,
    meta: "Fixture timestamp unavailable",
    ownerLabel: "Fallback source set",
    preview: "Synthetic fixture preview is bundled with the app fallback.",
    relationshipWarnings: [],
    reviewOwnerQueue: "fallback-source-review",
    sourceOrigin: "synthetic_fixture",
    sourceType: "Fallback source",
    status: "Synthetic fixture",
    title: "Synthetic station access notice",
    trustState: "fallback_current"
  },
  {
    citationCount: 0,
    citations: [],
    contextAnchors: [fallbackContextAnchors[1]],
    directWarnings: [
      {
        blocksApproval: true,
        code: "Source stale",
        evidenceImpact: "Fallback source remains blocked for a freshness check.",
        id: "WARN-FALLBACK-001",
        message: "Temporary boarding map needs a freshness check.",
        severity: "High"
      }
    ],
    excerptIds: ["SRC-FALLBACK-002-EXCERPT-001"],
    expiresAt: null,
    freshness: "Unknown",
    id: "SRC-FALLBACK-002",
    isClaimSupportingEvidence: true,
    isSelectedClaimSource: false,
    lastUpdated: null,
    meta: "Review note: source may be stale",
    ownerLabel: "Fallback source set",
    preview: "Synthetic wayfinding map extract remains blocked for review.",
    relationshipWarnings: [
      {
        blocksApproval: true,
        code: "Claim weak support",
        evidenceImpact: "Fallback relationship keeps shuttle wording conditional.",
        id: "WARN-FALLBACK-002",
        message: "Step-free shuttle wording is stronger than the evidence.",
        severity: "High"
      }
    ],
    reviewOwnerQueue: "fallback-source-review",
    sourceOrigin: "synthetic_fixture",
    sourceType: "Fallback source",
    status: "Stale source",
    title: "Synthetic wayfinding map extract",
    trustState: "stale_blocker"
  },
  {
    citationCount: 0,
    citations: [],
    contextAnchors: [],
    directWarnings: [
      {
        blocksApproval: true,
        code: "Missing source",
        evidenceImpact: "Fallback placeholder keeps dispatch confirmation unresolved.",
        id: "WARN-FALLBACK-003",
        message: "Dispatch confirmation is missing.",
        severity: "High"
      }
    ],
    excerptIds: ["SRC-FALLBACK-003-EXCERPT-MISSING"],
    expiresAt: null,
    freshness: "Missing",
    id: "SRC-FALLBACK-003",
    isClaimSupportingEvidence: false,
    isSelectedClaimSource: true,
    lastUpdated: null,
    meta: "Evidence state: missing-source placeholder",
    ownerLabel: "Fallback source set",
    preview: "Dispatch confirmation remains unavailable in the fallback view.",
    relationshipWarnings: [],
    reviewOwnerQueue: "fallback-source-review",
    sourceOrigin: "missing_source_placeholder",
    sourceType: "Missing-source placeholder",
    status: "Missing evidence",
    title: "Dispatch confirmation placeholder",
    trustState: "missing_blocker"
  }
];

const fallbackSourceFilters: EvidenceWorkbenchSourceFilter[] = [
  sourceFilter("all-sources", "All sources", fallbackSourceItems, "Every fallback source record."),
  sourceFilter(
    "cited-in-answer",
    "Cited in answer",
    [],
    "Fallback markdown does not carry citation metadata."
  ),
  sourceFilter(
    "stale-blockers",
    "Stale blockers",
    [fallbackSourceItems[1]],
    "Fallback source that still needs a freshness check."
  ),
  sourceFilter(
    "missing-evidence",
    "Missing evidence",
    [fallbackSourceItems[2]],
    "Fallback missing-source placeholder."
  ),
  sourceFilter(
    "needs-owner-action",
    "Needs owner action",
    [fallbackSourceItems[1], fallbackSourceItems[2]],
    "Fallback stale or missing source states."
  )
];

const fallbackGraphNodes: EvidenceWorkbenchGraphNode[] = [
  graphNode("NODE-FALLBACK-Q", "question", "Fallback review question", "PromptContext", "CTX-FALLBACK", "question", 1, 1, 1),
  graphNode("NODE-FALLBACK-CONTEXT", "prompt_context", "Bundled fixture context", "PromptContext", "CTX-FALLBACK", "missing_context", 2, 2, 1, [
    "WARN-FALLBACK-002"
  ]),
  graphNode(
    "NODE-FALLBACK-PCA-001",
    "public_context_anchor",
    "South Brisbane station",
    "PublicContextAnchor",
    "PCA-FALLBACK-001",
    "context_only",
    3,
    2,
    2
  ),
  graphNode(
    "NODE-FALLBACK-SRC-002",
    "source_warning",
    "Synthetic wayfinding map extract",
    "Source",
    "SRC-FALLBACK-002",
    "stale_blocker",
    4,
    3,
    2,
    ["WARN-FALLBACK-001", "WARN-FALLBACK-002"]
  ),
  graphNode(
    "NODE-FALLBACK-SRC-003",
    "missing_source",
    "Dispatch confirmation placeholder",
    "Source",
    "SRC-FALLBACK-003",
    "missing_blocker",
    5,
    3,
    3,
    ["WARN-FALLBACK-003"]
  ),
  graphNode(
    "NODE-FALLBACK-CLAIM-003",
    "answer_claim_warning",
    "Step-free transfer assurance",
    "AnswerClaim",
    "Claim 3",
    "requires_review",
    6,
    4,
    2,
    ["WARN-FALLBACK-002", "WARN-FALLBACK-003"]
  ),
  graphNode(
    "NODE-FALLBACK-ACT-REQUEST-SOURCE-UPDATE",
    "review_action",
    "Request source update",
    "ReviewAction",
    "ACT-FALLBACK-REQUEST-SOURCE-UPDATE",
    "primary_action_available",
    7,
    5,
    2,
    ["WARN-FALLBACK-001", "WARN-FALLBACK-003"]
  )
];

const fallbackGraphEdges: EvidenceWorkbenchGraphEdge[] = [
  graphEdge(
    "EDGE-FALLBACK-Q-CONTEXT",
    "NODE-FALLBACK-Q",
    "NODE-FALLBACK-CONTEXT",
    "frames",
    "frames fallback context",
    "PromptContext",
    "CTX-FALLBACK"
  ),
  graphEdge(
    "EDGE-FALLBACK-CONTEXT-PCA001",
    "NODE-FALLBACK-CONTEXT",
    "NODE-FALLBACK-PCA-001",
    "uses_place_anchor",
    "context anchor only",
    "PublicContextAnchor",
    "PCA-FALLBACK-001"
  ),
  graphEdge(
    "EDGE-FALLBACK-CONTEXT-SRC002",
    "NODE-FALLBACK-CONTEXT",
    "NODE-FALLBACK-SRC-002",
    "retrieves",
    "retrieves stale fallback source",
    "Source",
    "SRC-FALLBACK-002",
    ["WARN-FALLBACK-001"]
  ),
  graphEdge(
    "EDGE-FALLBACK-CONTEXT-SRC003",
    "NODE-FALLBACK-CONTEXT",
    "NODE-FALLBACK-SRC-003",
    "retrieves",
    "expects missing fallback confirmation",
    "Source",
    "SRC-FALLBACK-003",
    ["WARN-FALLBACK-003"]
  ),
  graphEdge(
    "EDGE-FALLBACK-SRC002-CLAIM003",
    "NODE-FALLBACK-SRC-002",
    "NODE-FALLBACK-CLAIM-003",
    "partial_support",
    "fallback support remains conditional",
    "Citation",
    "CIT-FALLBACK-003-A",
    ["WARN-FALLBACK-002"]
  ),
  graphEdge(
    "EDGE-FALLBACK-SRC003-CLAIM003",
    "NODE-FALLBACK-SRC-003",
    "NODE-FALLBACK-CLAIM-003",
    "missing_evidence",
    "fallback confirmation missing",
    "Citation",
    "CIT-FALLBACK-003-B",
    ["WARN-FALLBACK-003"]
  ),
  graphEdge(
    "EDGE-FALLBACK-CLAIM003-ACT",
    "NODE-FALLBACK-CLAIM-003",
    "NODE-FALLBACK-ACT-REQUEST-SOURCE-UPDATE",
    "requires_review",
    "fallback source update required",
    "SourceWarning",
    "WARN-FALLBACK-003",
    ["WARN-FALLBACK-002", "WARN-FALLBACK-003"]
  )
];

function sourceFilter(
  id: string,
  label: string,
  sources: EvidenceWorkbenchSource[],
  description: string
): EvidenceWorkbenchSourceFilter {
  return {
    count: sources.length,
    description,
    id,
    label,
    sourceIds: sources.map((source) => source.id)
  };
}

function graphNode(
  id: string,
  type: string,
  label: string,
  refObjectType: string,
  refObjectId: string,
  status: string,
  displayOrder: number,
  column: number,
  row: number,
  warningIds: string[] = []
): EvidenceWorkbenchGraphNode {
  return {
    displayOrder,
    graphId: "GRAPH-FALLBACK",
    id,
    label,
    positionHint: {
      column,
      row
    },
    refObjectId,
    refObjectType,
    status,
    type,
    warningIds
  };
}

function graphEdge(
  id: string,
  fromNodeId: string,
  toNodeId: string,
  type: string,
  label: string,
  refObjectType: string,
  refObjectId: string,
  warningIds: string[] = []
): EvidenceWorkbenchGraphEdge {
  return {
    fromNodeId,
    graphId: "GRAPH-FALLBACK",
    id,
    label,
    refObjectId,
    refObjectType,
    toNodeId,
    type,
    warningIds
  };
}

export const fallbackEvidenceWorkbenchData: EvidenceWorkbenchViewModel = {
  answer: {
    generatedAt: "Bundled fallback",
    markdown: `# Reviewer answer preview

**Review status:** Needs review. Do not approve as written.

The bundled fallback keeps the answer panel visible when the local fixture API
is unavailable. It preserves the same synthetic review posture without making
new source claims.

## Review blockers

- Boarding-point evidence still needs a freshness check.
- Step-free wording remains conditional.
- Dispatch confirmation is represented by a missing-source placeholder.

## Generated fallback diagram

\`\`\`aivis-diagram
title: Generated fallback review path
summary: Static diagram generated from bundled fallback content.
- Fallback context | Bundled fixture keeps the review case visible | context
- Source checks | Stale and missing placeholder sources remain visible | evidence
- Claim review | Step-free transfer assurance stays blocked | warning
- Reviewer action | Request source update or mark unsafe before copying | review
\`\`\`

\`\`\`text
copy_state: disabled
source_mode: bundled_fallback
\`\`\`

## Fallback evidence summary

| Claim | Current answer posture | Evidence state |
| --- | --- | --- |
| \`Claim 1\` | Access change summary | Stale source |
| \`Claim 2\` | Temporary boarding point | Weak support |
| \`Claim 3\` | Step-free transfer assurance | Missing evidence |`,
    status: "Needs review",
    summary:
      "The draft guidance can describe a temporary step-free transfer, but it should stay blocked until stale and missing fixture evidence is resolved.",
    title: "Reviewer answer preview"
  },
  citations: [],
  context: {
    anchors: fallbackContextAnchors,
    plannedTravelDate: "Fixture travel date unavailable",
    question: "Backend fixture data was unavailable, so this fallback keeps the review case visible.",
    title: "Step-free transfer guidance needs evidence review"
  },
  fetchState: {
    message: "Backend fixture unavailable. Showing bundled fallback data.",
    source: "fallback"
  },
  graph: {
    accessibleSummary:
      "Fallback review path: context anchor, draft answer, citation check and needs-review state.",
    defaultFocusedSourceIds: ["SRC-FALLBACK-002", "SRC-FALLBACK-003"],
    defaultFocusedWarningIds: ["WARN-FALLBACK-002", "WARN-FALLBACK-003"],
    defaultSelectedClaimId: "Claim 3",
    defaultSelectedNodeId: "NODE-FALLBACK-CLAIM-003",
    edges: fallbackGraphEdges,
    fallbackSteps: [
      {
        includeIds: ["NODE-FALLBACK-PCA-001"],
        step: 1,
        heading: "Context anchor",
        summary: "Place labels remain context only in the fallback view."
      },
      {
        includeIds: ["NODE-FALLBACK-CLAIM-003"],
        step: 2,
        heading: "Draft answer",
        summary: "The fallback answer remains blocked for review."
      },
      {
        includeIds: ["NODE-FALLBACK-SRC-002", "NODE-FALLBACK-SRC-003"],
        step: 3,
        heading: "Citation check",
        summary: "Stale, weak-support and missing-evidence states remain visible."
      },
      {
        includeIds: ["NODE-FALLBACK-ACT-REQUEST-SOURCE-UPDATE"],
        step: 4,
        heading: "Needs review",
        summary: "Copy and approval remain unavailable."
      }
    ],
    id: "GRAPH-FALLBACK",
    layoutHint: "left_to_right_review_flow",
    nodes: fallbackGraphNodes,
    smallViewportFallback: "step_list"
  },
  review: {
    actions: REVIEW_ACTION_RECORDS,
    activeWarningCount: 3,
    activeWarningIds: ["WARN-FALLBACK-001", "WARN-FALLBACK-002", "WARN-FALLBACK-003"],
    availableActionIds: [
      "ACT-REQUEST-SOURCE-UPDATE",
      "ACT-ADD-REVIEW-NOTE",
      "ACT-ESCALATE-SOURCE-OWNER",
      "ACT-MARK-UNSAFE"
    ],
    blockedByWarningIds: ["WARN-FALLBACK-001", "WARN-FALLBACK-002", "WARN-FALLBACK-003"],
    completedActionIds: [],
    copyState: "disabled",
    id: "REV-FALLBACK-001",
    lastActionId: null,
    reviewerIdLabel: "reviewer-fixture-01",
    reviewerNote: null,
    selectedClaimId: "Claim 3",
    status: "Needs review",
    statusId: "needs_review",
    updatedAt: "Bundled fallback"
  },
  audit: {
    boundaryNoteForDocs:
      "Real Brisbane place names are context anchors. Operational events, source freshness, warnings and reviewer actions are synthetic fixture content.",
    contractMode: "synthetic_fixture",
    id: "AUDIT-FALLBACK-001",
    lastReviewActionId: null,
    modelLabel: "simulated_answer_fixture",
    reviewEventIds: ["AUDIT-FALLBACK-EVT-001", "AUDIT-FALLBACK-EVT-002"],
    runtimeModeLabel: "local_fixture"
  },
  reviewClaims: [
    {
      id: "Claim 1",
      status: "Stale source",
      text: "Synthetic scenario says the station access note needs a freshness check before reuse.",
      title: "Access change summary",
      warningIds: ["WARN-FALLBACK-001"]
    },
    {
      id: "Claim 2",
      status: "Weak support",
      text:
        "Draft guidance references Grey Street context, but the supporting fixture source is incomplete.",
      title: "Temporary boarding point",
      warningIds: ["WARN-FALLBACK-002"]
    },
    {
      id: "Claim 3",
      status: "Missing evidence",
      text: "Day-of-service confirmation is represented by a missing-source placeholder.",
      title: "Step-free transfer assurance",
      warningIds: ["WARN-FALLBACK-003"]
    }
  ],
  sourceFilters: fallbackSourceFilters,
  sourceItems: fallbackSourceItems,
  summary: [
    {
      label: "Fixture mode",
      value: "Synthetic fixture"
    },
    {
      label: "Runtime",
      value: "Local fixture"
    },
    {
      label: "Data source",
      value: "Bundled fallback"
    },
    {
      label: "Review state",
      value: "Needs review"
    }
  ],
  warnings: [
    {
      id: "WARN-FALLBACK-001",
      message: "Temporary boarding map needs a freshness check.",
      severity: "high"
    },
    {
      id: "WARN-FALLBACK-002",
      message: "Step-free shuttle wording is stronger than the evidence.",
      severity: "high"
    },
    {
      id: "WARN-FALLBACK-003",
      message: "Dispatch confirmation is missing.",
      severity: "high"
    }
  ]
};
