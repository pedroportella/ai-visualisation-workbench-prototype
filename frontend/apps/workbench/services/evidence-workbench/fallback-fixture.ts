import type {
  EvidenceWorkbenchContextAnchor,
  EvidenceWorkbenchSource,
  EvidenceWorkbenchSourceFilter,
  EvidenceWorkbenchViewModel
} from "./types";

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
    fallbackSteps: [
      {
        heading: "Context anchor",
        summary: "Place labels remain context only in the fallback view."
      },
      {
        heading: "Draft answer",
        summary: "The fallback answer remains blocked for review."
      },
      {
        heading: "Citation check",
        summary: "Stale, weak-support and missing-evidence states remain visible."
      },
      {
        heading: "Needs review",
        summary: "Copy and approval remain unavailable."
      }
    ]
  },
  review: {
    activeWarningCount: 3,
    blockedByWarningIds: ["WARN-FALLBACK-001", "WARN-FALLBACK-002", "WARN-FALLBACK-003"],
    copyState: "disabled",
    selectedClaimId: "Claim 3",
    status: "Needs review"
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
