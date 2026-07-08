import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "@aivis/services/fixtures";
import {
  PRIMARY_REVIEW_ACTION_ID,
  REVIEW_ACTION_RECORDS
} from "@aivis/services";
import {
  EVIDENCE_WORKBENCH_REVIEW_ACTIONS_API_ROUTE,
  EVIDENCE_WORKBENCH_VIEW_MODEL_API_ROUTE,
  applyReviewActionResult
} from "./EvidenceWorkbenchQueryState";
import type { EvidenceWorkbenchReviewActionMutationResult } from "@aivis/services";

describe("EvidenceWorkbenchQueryState", () => {
  it("keeps browser fetch targets on same-origin API routes", () => {
    expect(EVIDENCE_WORKBENCH_VIEW_MODEL_API_ROUTE).toBe(
      "/api/evidence-workbench/view-model"
    );
    expect(EVIDENCE_WORKBENCH_REVIEW_ACTIONS_API_ROUTE).toBe(
      "/api/evidence-workbench/review-actions"
    );
    expect(EVIDENCE_WORKBENCH_VIEW_MODEL_API_ROUTE).not.toMatch(/^https?:\/\//);
    expect(EVIDENCE_WORKBENCH_REVIEW_ACTIONS_API_ROUTE).not.toMatch(/^https?:\/\//);
  });

  it("updates the view-model cache from a backend review-action result", () => {
    const result: EvidenceWorkbenchReviewActionMutationResult = {
      audit: {
        ...fallbackEvidenceWorkbenchData.audit,
        id: "AUDIT-001",
        lastReviewActionId: PRIMARY_REVIEW_ACTION_ID,
        reviewEventIds: ["AUDIT-EVT-001", "AUDIT-EVT-002", "AUDIT-EVT-003"]
      },
      fetchState: {
        source: "backend"
      },
      implementedActionIds: [PRIMARY_REVIEW_ACTION_ID],
      message: "Request source update recorded by backend fixture.",
      review: {
        ...fallbackEvidenceWorkbenchData.review,
        completedActionIds: [PRIMARY_REVIEW_ACTION_ID],
        id: "REV-001",
        lastActionId: PRIMARY_REVIEW_ACTION_ID,
        selectedClaimId: "CLAIM-003",
        status: "Source update requested",
        statusId: "source_update_requested",
        updatedAt: "2026-06-27T09:15:00+10:00"
      },
      reviewAction: REVIEW_ACTION_RECORDS[0],
      warnings: [
        {
          blocksApproval: true,
          id: "WARN-007",
          message: "Backend fixture recorded a source-update request.",
          severity: "Medium"
        }
      ]
    };
    const updated = applyReviewActionResult(fallbackEvidenceWorkbenchData, result);

    expect(updated.fetchState.source).toBe("backend");
    expect(updated.review.status).toBe("Source update requested");
    expect(updated.audit.lastReviewActionId).toBe(PRIMARY_REVIEW_ACTION_ID);
    expect(updated.warnings.map((warning) => warning.id)).toEqual(["WARN-007"]);
    expect(updated.summary).toContainEqual({
      label: "Data source",
      value: "Backend fixture"
    });
    expect(updated.summary).toContainEqual({
      label: "Review state",
      value: "Source update requested"
    });
  });
});
