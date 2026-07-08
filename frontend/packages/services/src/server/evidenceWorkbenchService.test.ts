import { describe, expect, it, vi } from "vitest";

import {
  EvidenceWorkbenchBackendRequestError,
  getEvidenceWorkbenchData,
  recordEvidenceWorkbenchReviewAction
} from "./index";
import { PRIMARY_REVIEW_ACTION_ID, REVIEW_ACTION_RECORDS } from "../index";

const sourceWarning = {
  blocksApproval: true,
  code: "missing_source",
  evidenceImpact: "Dispatch confirmation is required before approval.",
  id: "WARN-003",
  message: "Dispatch confirmation is missing.",
  severity: "high"
};

const auditMetadata = {
  contractMode: "synthetic_fixture",
  id: "AUDIT-001",
  lastReviewActionId: null,
  modelLabel: "simulated_answer_fixture",
  reviewEventIds: ["AUDIT-EVT-001"],
  runtimeModeLabel: "local_fixture"
};

const reviewState = {
  activeWarningIds: ["WARN-003"],
  answerId: "ANS-001",
  approvalBlockedByWarningIds: ["WARN-003"],
  auditMetadataId: "AUDIT-001",
  availableActionIds: [PRIMARY_REVIEW_ACTION_ID],
  completedActionIds: [],
  copyState: "disabled",
  id: "REV-001",
  lastActionId: null,
  reviewerIdLabel: "reviewer-fixture-01",
  reviewerNote: null,
  status: "needs_review",
  statusLabel: "Needs review",
  updatedAt: "2026-06-27T09:00:00+10:00"
};

function responseJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json"
    },
    status
  });
}

function createFixtureFetch() {
  return vi.fn<typeof fetch>(async (url) => {
    if (String(url).endsWith("/evidence-workbench/answer")) {
      return responseJson({
        answer: {
          defaultSelectedClaimId: "CLAIM-003",
          displayStatusLabel: "Needs review",
          generatedAt: "2026-06-27T09:00:00+10:00",
          markdown: "## Draft answer\n\nCheck the source before use.",
          status: "needs_review",
          summary: "Synthetic answer summary.",
          title: "Step-free transfer guidance"
        },
        answerClaims: [
          {
            citationIds: [],
            contextAnchorIds: [],
            displayOrder: 1,
            evidencePosture: "missing_evidence",
            id: "CLAIM-003",
            requiredMissingSourceIds: ["SRC-003"],
            reviewRequired: true,
            supportingSourceIds: [],
            text: "Dispatch confirmation is required before staff use the answer.",
            warningIds: ["WARN-003"]
          }
        ],
        auditMetadata,
        citations: [],
        contractMode: "synthetic_fixture",
        promptContext: {
          plannedTravelDate: "2026-06-27",
          question: "Can a customer use the transfer?"
        },
        publicContextAnchors: [],
        reviewActions: REVIEW_ACTION_RECORDS,
        reviewState,
        runtimeModeLabel: "local_fixture",
        sourceWarnings: [sourceWarning]
      });
    }

    if (String(url).endsWith("/evidence-workbench/sources")) {
      return responseJson({
        contractMode: "synthetic_fixture",
        publicContextAnchors: [],
        runtimeModeLabel: "local_fixture",
        sourceWarnings: [sourceWarning],
        sources: [
          {
            citationCount: 0,
            contextAnchorIds: [],
            excerptIds: ["SRC-003-EXCERPT-MISSING"],
            expiresAt: null,
            freshness: "missing",
            id: "SRC-003",
            isClaimSupportingEvidence: false,
            lastUpdated: null,
            ownerLabel: "Fixture source owner",
            reviewOwnerQueue: "fixture-source-review",
            sourceOrigin: "missing_source_placeholder",
            sourceType: "missing_source_placeholder",
            syntheticExcerptPreview: "Dispatch confirmation is unavailable.",
            title: "Dispatch confirmation placeholder",
            warningIds: ["WARN-003"]
          }
        ]
      });
    }

    if (String(url).endsWith("/evidence-workbench/graph")) {
      return responseJson({
        contractMode: "synthetic_fixture",
        evidenceEdges: [],
        evidenceGraph: {
          accessibleSummary: "Synthetic evidence graph summary.",
          defaultFocusedSourceIds: ["SRC-003"],
          defaultFocusedWarningIds: ["WARN-003"],
          defaultSelectedClaimId: "CLAIM-003",
          defaultSelectedNodeId: "NODE-CLAIM-003",
          id: "GRAPH-001",
          layoutHint: "layered",
          smallViewportFallback: "Review source warnings in order."
        },
        evidenceNodes: [],
        runtimeModeLabel: "local_fixture",
        smallViewportFallbackSteps: []
      });
    }

    return responseJson({ message: "not found" }, 404);
  });
}

describe("Evidence Workbench server service", () => {
  it("returns package-owned fallback data in explicit mock mode", async () => {
    await expect(
      getEvidenceWorkbenchData({
        config: {
          dataSource: "mock"
        }
      })
    ).resolves.toMatchObject({
      fetchState: {
        source: "fallback"
      }
    });
  });

  it("fetches and maps backend fixture data in backend mode", async () => {
    const fetchImpl = createFixtureFetch();
    const data = await getEvidenceWorkbenchData({
      config: {
        backendUrl: "http://backend.example.test",
        dataSource: "backend"
      },
      fetchImpl
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "http://backend.example.test/evidence-workbench/answer",
      expect.objectContaining({ cache: "no-store" })
    );
    expect(data.fetchState.source).toBe("backend");
    expect(data.summary).toContainEqual({
      label: "Data source",
      value: "Backend fixture"
    });
    expect(data.sourceItems[0]?.trustState).toBe("missing_blocker");
  });

  it("keeps backend review actions server-side and uses the configured backend URL", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (url) => {
      expect(String(url)).toBe("http://backend.example.test/evidence-workbench/review-actions");

      return responseJson({
        auditMetadata: {
          ...auditMetadata,
          lastReviewActionId: PRIMARY_REVIEW_ACTION_ID,
          reviewEventIds: ["AUDIT-EVT-001", "AUDIT-EVT-002"]
        },
        contractMode: "synthetic_fixture",
        generatedAt: "2026-06-27T09:15:00+10:00",
        implementedActionIds: [PRIMARY_REVIEW_ACTION_ID],
        reviewAction: REVIEW_ACTION_RECORDS[0],
        reviewActions: REVIEW_ACTION_RECORDS,
        reviewState: {
          ...reviewState,
          completedActionIds: [PRIMARY_REVIEW_ACTION_ID],
          lastActionId: PRIMARY_REVIEW_ACTION_ID,
          reviewerNote: "Refresh this source before use.",
          status: "source_update_requested",
          statusLabel: "Source update requested",
          updatedAt: "2026-06-27T09:15:00+10:00"
        },
        runtimeModeLabel: "local_fixture",
        sourceWarnings: [sourceWarning]
      });
    });

    const result = await recordEvidenceWorkbenchReviewAction(
      {
        reviewActionId: PRIMARY_REVIEW_ACTION_ID,
        reviewerNote: "Refresh this source before use.",
        reviewStateId: "REV-001",
        selectedClaimId: "CLAIM-003"
      },
      {
        config: {
          backendUrl: "http://backend.example.test",
          dataSource: "backend"
        },
        fetchImpl
      }
    );

    expect(result.fetchState.source).toBe("backend");
    expect(result.review.status).toBe("Source update requested");
    expect(result.audit.lastReviewActionId).toBe(PRIMARY_REVIEW_ACTION_ID);
  });

  it("rejects review actions when backend mode is not configured", async () => {
    await expect(
      recordEvidenceWorkbenchReviewAction(
        {
          reviewActionId: PRIMARY_REVIEW_ACTION_ID,
          reviewerNote: "Refresh this source before use."
        },
        {
          config: {
            dataSource: "mock"
          }
        }
      )
    ).rejects.toBeInstanceOf(EvidenceWorkbenchBackendRequestError);
  });

  it("uses backend string detail messages for failed review actions", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      responseJson(
        {
          detail: "ACT-REQUEST-SOURCE-UPDATE has already been completed."
        },
        409
      )
    );

    await expect(
      recordEvidenceWorkbenchReviewAction(
        {
          reviewActionId: PRIMARY_REVIEW_ACTION_ID,
          reviewerNote: "Refresh this source before use."
        },
        {
          config: {
            backendUrl: "http://backend.example.test",
            dataSource: "backend"
          },
          fetchImpl
        }
      )
    ).rejects.toMatchObject({
      message: "ACT-REQUEST-SOURCE-UPDATE has already been completed.",
      statusCode: 409
    });
  });
});
