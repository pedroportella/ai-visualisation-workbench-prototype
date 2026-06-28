import type { EvidenceWorkbenchViewModel } from "./types";

export const fallbackEvidenceWorkbenchData: EvidenceWorkbenchViewModel = {
  answer: {
    generatedAt: "Bundled fallback",
    status: "Needs review",
    summary:
      "The draft guidance can describe a temporary step-free transfer, but it should stay blocked until stale and missing fixture evidence is resolved.",
    title: "Reviewer answer preview"
  },
  context: {
    anchors: [
      {
        id: "PCA-FALLBACK-001",
        label: "South Brisbane station",
        supportingText: "Context anchor only"
      },
      {
        id: "PCA-FALLBACK-002",
        label: "QPAC/Grey Street",
        supportingText: "Context anchor only"
      },
      {
        id: "PCA-FALLBACK-003",
        label: "Princess Alexandra Hospital",
        supportingText: "Context anchor only"
      }
    ],
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
  sourceItems: [
    {
      id: "SRC-FALLBACK-001",
      meta: "Fixture timestamp unavailable",
      preview: "Synthetic fixture preview is bundled with the app fallback.",
      status: "Synthetic fixture",
      title: "Synthetic station access notice"
    },
    {
      id: "SRC-FALLBACK-002",
      meta: "Review note: source may be stale",
      preview: "Synthetic wayfinding map extract remains blocked for review.",
      status: "Stale source",
      title: "Synthetic wayfinding map extract"
    },
    {
      id: "SRC-FALLBACK-003",
      meta: "Evidence state: missing-source placeholder",
      preview: "Dispatch confirmation remains unavailable in the fallback view.",
      status: "Missing evidence",
      title: "Dispatch confirmation placeholder"
    }
  ],
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
