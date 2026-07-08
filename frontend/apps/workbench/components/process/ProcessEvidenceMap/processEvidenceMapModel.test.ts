import { describe, expect, it } from "vitest";

import type { EvidenceWorkbenchViewModel } from "../../../services/evidence-workbench/types";
import {
  createProcessEvidenceMapModel,
  getProcessEvidenceMapVisibleIds
} from "./processEvidenceMapModel";

const graph: EvidenceWorkbenchViewModel["graph"] = {
  accessibleSummary:
    "CLAIM-003 is selected by default; SRC-003 is partial support and SRC-006 is missing.",
  defaultFocusedSourceIds: ["SRC-003", "SRC-006"],
  defaultFocusedWarningIds: ["WARN-002", "WARN-003"],
  defaultSelectedClaimId: "CLAIM-003",
  defaultSelectedNodeId: "NODE-CLAIM-003",
  edges: [
    edge("EDGE-Q-CONTEXT", "NODE-Q", "NODE-CONTEXT", "frames", []),
    edge("EDGE-CONTEXT-PCA001", "NODE-CONTEXT", "NODE-PCA-001", "uses_place_anchor", []),
    edge("EDGE-CONTEXT-SRC003", "NODE-CONTEXT", "NODE-SRC-003", "retrieves", []),
    edge("EDGE-CONTEXT-SRC006", "NODE-CONTEXT", "NODE-SRC-006", "retrieves", ["WARN-003"]),
    edge("EDGE-SRC003-CLAIM003", "NODE-SRC-003", "NODE-CLAIM-003", "partial_support", [
      "WARN-002"
    ]),
    edge("EDGE-SRC006-CLAIM003", "NODE-SRC-006", "NODE-CLAIM-003", "missing_evidence", [
      "WARN-003"
    ]),
    edge(
      "EDGE-CLAIM003-ACT-WARN002",
      "NODE-CLAIM-003",
      "NODE-ACT-REQUEST-SOURCE-UPDATE",
      "requires_review",
      ["WARN-002"]
    )
  ],
  fallbackSteps: [
    {
      heading: "Selected evidence gap",
      includeIds: ["NODE-SRC-003", "NODE-SRC-006", "NODE-CLAIM-003", "WARN-002", "WARN-003"],
      step: 5,
      summary: "The selected claim has partial guidance and missing confirmation."
    }
  ],
  id: "GRAPH-001",
  layoutHint: "left_to_right_review_flow",
  nodes: [
    node("NODE-Q", "question", "Staff question", "PromptContext", "CTX-001", "question", 1, 1, 1),
    node(
      "NODE-CONTEXT",
      "prompt_context",
      "Prompt context",
      "PromptContext",
      "CTX-001",
      "missing_context",
      2,
      2,
      1,
      ["WARN-004"]
    ),
    node(
      "NODE-PCA-001",
      "public_context_anchor",
      "South Bank",
      "PublicContextAnchor",
      "PCA-001",
      "context_only",
      3,
      2,
      2
    ),
    node("NODE-SRC-003", "source", "Conditional guidance", "Source", "SRC-003", "current_conditional_support", 4, 3, 2),
    node("NODE-SRC-006", "missing_source", "Missing confirmation", "Source", "SRC-006", "missing_blocker", 5, 3, 3, [
      "WARN-003"
    ]),
    node(
      "NODE-CLAIM-003",
      "answer_claim_warning",
      "Step-free shuttle claim",
      "AnswerClaim",
      "CLAIM-003",
      "requires_review",
      6,
      4,
      2,
      ["WARN-002", "WARN-003"]
    ),
    node(
      "NODE-ACT-REQUEST-SOURCE-UPDATE",
      "review_action",
      "Request source update",
      "ReviewAction",
      "ACT-REQUEST-SOURCE-UPDATE",
      "primary_action_available",
      7,
      5,
      2
    )
  ],
  smallViewportFallback: "step_list"
};

describe("process evidence map model", () => {
  it("marks the CLAIM-003 weak and missing evidence route as the selected path", () => {
    const model = createProcessEvidenceMapModel(graph);

    expect(model.selectedPathNodeIds).toEqual([
      "NODE-CLAIM-003",
      "NODE-SRC-003",
      "NODE-SRC-006",
      "NODE-Q",
      "NODE-CONTEXT",
      "NODE-ACT-REQUEST-SOURCE-UPDATE"
    ]);
    expect(model.selectedPathEdgeIds).toEqual([
      "EDGE-Q-CONTEXT",
      "EDGE-CONTEXT-SRC003",
      "EDGE-CONTEXT-SRC006",
      "EDGE-SRC003-CLAIM003",
      "EDGE-SRC006-CLAIM003",
      "EDGE-CLAIM003-ACT-WARN002"
    ]);
  });

  it("keeps public context anchors context-only while visible in the review path filter", () => {
    const model = createProcessEvidenceMapModel(graph);
    const contextAnchor = model.nodes.find((candidate) => candidate.graphNode.id === "NODE-PCA-001");
    const visibleIds = getProcessEvidenceMapVisibleIds(model, "review-path");

    expect(contextAnchor?.isContextOnly).toBe(true);
    expect(contextAnchor?.tone).toBe("context");
    expect(visibleIds.nodeIds).toContain("NODE-PCA-001");
    expect(visibleIds.edgeIds).toContain("EDGE-CONTEXT-PCA001");
  });
});

function node(
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
) {
  return {
    displayOrder,
    graphId: "GRAPH-001",
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

function edge(
  id: string,
  fromNodeId: string,
  toNodeId: string,
  type: string,
  warningIds: string[]
) {
  return {
    fromNodeId,
    graphId: "GRAPH-001",
    id,
    label: type,
    refObjectId: warningIds[0] ?? "CTX-001",
    refObjectType: warningIds.length > 0 ? "SourceWarning" : "PromptContext",
    toNodeId,
    type,
    warningIds
  };
}
