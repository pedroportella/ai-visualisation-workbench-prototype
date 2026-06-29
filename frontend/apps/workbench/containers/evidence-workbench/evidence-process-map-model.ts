import type {
  EvidenceWorkbenchGraphEdge,
  EvidenceWorkbenchGraphNode,
  EvidenceWorkbenchViewModel
} from "../../services/evidence-workbench/types";

export type EvidenceProcessMapFilterId = "review-path" | "warnings" | "context" | "all";
export type EvidenceProcessMapTone =
  | "claim"
  | "context"
  | "evidence"
  | "question"
  | "review"
  | "warning";

export interface EvidenceProcessMapNodeModel {
  graphNode: EvidenceWorkbenchGraphNode;
  isContextOnly: boolean;
  isSelectedPath: boolean;
  refLabel: string;
  tone: EvidenceProcessMapTone;
  typeLabel: string;
  warningLabel: string;
}

export interface EvidenceProcessMapEdgeModel {
  edge: EvidenceWorkbenchGraphEdge;
  isContextOnly: boolean;
  isSelectedPath: boolean;
  typeLabel: string;
  warningLabel: string;
}

export interface EvidenceProcessMapFilter {
  id: EvidenceProcessMapFilterId;
  label: string;
  summary: string;
}

export interface EvidenceProcessMapVisibleIds {
  edgeIds: string[];
  nodeIds: string[];
}

export interface EvidenceProcessMapModel {
  defaultSelectedNodeId: string;
  edges: EvidenceProcessMapEdgeModel[];
  filters: EvidenceProcessMapFilter[];
  graphId: string;
  nodes: EvidenceProcessMapNodeModel[];
  selectedPathEdgeIds: string[];
  selectedPathNodeIds: string[];
}

const REVIEW_ACTION_TYPES = new Set(["review_action"]);
const CONTEXT_TYPES = new Set(["question", "prompt_context", "public_context_anchor"]);
const WARNING_NODE_TYPES = new Set([
  "answer_claim_warning",
  "missing_source",
  "source_warning"
]);

export const evidenceProcessMapFilters: EvidenceProcessMapFilter[] = [
  {
    id: "review-path",
    label: "Selected path",
    summary: "Focuses the weak and missing evidence route for the selected claim."
  },
  {
    id: "warnings",
    label: "Warnings",
    summary: "Shows stale, weak-support and missing-evidence blockers."
  },
  {
    id: "context",
    label: "Context",
    summary: "Shows the question, prompt context and context-only place anchors."
  },
  {
    id: "all",
    label: "All nodes",
    summary: "Shows the full synthetic graph fixture."
  }
];

export function createEvidenceProcessMapModel(
  graph: EvidenceWorkbenchViewModel["graph"]
): EvidenceProcessMapModel {
  const selectedPath = createSelectedPath(graph);
  const nodes = graph.nodes.map((node) => ({
    graphNode: node,
    isContextOnly: isContextOnlyNode(node),
    isSelectedPath: selectedPath.nodeIds.has(node.id),
    refLabel: `${node.refObjectType}:${node.refObjectId}`,
    tone: nodeTone(node),
    typeLabel: formatGraphLabel(node.type),
    warningLabel: formatWarningIds(node.warningIds)
  }));
  const edges = graph.edges.map((edge) => ({
    edge,
    isContextOnly: edge.type === "uses_place_anchor",
    isSelectedPath: selectedPath.edgeIds.has(edge.id),
    typeLabel: formatGraphLabel(edge.type),
    warningLabel: formatWarningIds(edge.warningIds)
  }));

  return {
    defaultSelectedNodeId: graph.defaultSelectedNodeId,
    edges,
    filters: evidenceProcessMapFilters,
    graphId: graph.id,
    nodes,
    selectedPathEdgeIds: [...selectedPath.edgeIds],
    selectedPathNodeIds: [...selectedPath.nodeIds]
  };
}

export function getEvidenceProcessMapVisibleIds(
  model: EvidenceProcessMapModel,
  filterId: EvidenceProcessMapFilterId
): EvidenceProcessMapVisibleIds {
  const nodeIds = new Set<string>();

  for (const node of model.nodes) {
    if (shouldShowNode(node, filterId)) {
      nodeIds.add(node.graphNode.id);
    }
  }

  const edgeIds = model.edges
    .filter(
      (edge) =>
        nodeIds.has(edge.edge.fromNodeId) &&
        nodeIds.has(edge.edge.toNodeId) &&
        shouldShowEdge(edge, filterId)
    )
    .map((edge) => edge.edge.id);

  return {
    edgeIds,
    nodeIds: [...nodeIds]
  };
}

function createSelectedPath(graph: EvidenceWorkbenchViewModel["graph"]): {
  edgeIds: Set<string>;
  nodeIds: Set<string>;
} {
  const nodeIds = new Set<string>([graph.defaultSelectedNodeId]);
  const edgeIds = new Set<string>();
  const focusedSourceIds = new Set(graph.defaultFocusedSourceIds);
  const focusedWarningIds = new Set(graph.defaultFocusedWarningIds);
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));

  for (const node of graph.nodes) {
    if (focusedSourceIds.has(node.refObjectId)) {
      nodeIds.add(node.id);
    }
  }

  for (const edge of graph.edges) {
    const fromNode = nodesById.get(edge.fromNodeId);
    const toNode = nodesById.get(edge.toNodeId);
    const touchesSelectedWarning = edge.warningIds.some((warningId) =>
      focusedWarningIds.has(warningId)
    );
    const retrievesFocusedSource =
      toNode?.refObjectType === "Source" && focusedSourceIds.has(toNode.refObjectId);
    const connectsFocusedSourceToClaim =
      fromNode?.refObjectType === "Source" &&
      focusedSourceIds.has(fromNode.refObjectId) &&
      edge.toNodeId === graph.defaultSelectedNodeId;
    const connectsClaimToAction =
      edge.fromNodeId === graph.defaultSelectedNodeId &&
      (touchesSelectedWarning || REVIEW_ACTION_TYPES.has(toNode?.type ?? ""));
    const framesPrompt = edge.type === "frames";

    if (
      framesPrompt ||
      retrievesFocusedSource ||
      connectsFocusedSourceToClaim ||
      connectsClaimToAction
    ) {
      edgeIds.add(edge.id);
      nodeIds.add(edge.fromNodeId);
      nodeIds.add(edge.toNodeId);
    }
  }

  return {
    edgeIds,
    nodeIds
  };
}

function shouldShowNode(
  node: EvidenceProcessMapNodeModel,
  filterId: EvidenceProcessMapFilterId
): boolean {
  if (filterId === "all") {
    return true;
  }

  if (filterId === "context") {
    return CONTEXT_TYPES.has(node.graphNode.type);
  }

  if (filterId === "warnings") {
    return (
      node.graphNode.warningIds.length > 0 ||
      WARNING_NODE_TYPES.has(node.graphNode.type) ||
      REVIEW_ACTION_TYPES.has(node.graphNode.type)
    );
  }

  return node.isSelectedPath || node.isContextOnly;
}

function shouldShowEdge(
  edge: EvidenceProcessMapEdgeModel,
  filterId: EvidenceProcessMapFilterId
): boolean {
  if (filterId === "all") {
    return true;
  }

  if (filterId === "context") {
    return edge.edge.type === "frames" || edge.isContextOnly;
  }

  if (filterId === "warnings") {
    return edge.edge.warningIds.length > 0 || edge.edge.type === "requires_review";
  }

  return edge.isSelectedPath || edge.isContextOnly;
}

function nodeTone(node: EvidenceWorkbenchGraphNode): EvidenceProcessMapTone {
  if (node.type === "question") {
    return "question";
  }

  if (node.type === "prompt_context" || node.type === "public_context_anchor") {
    return "context";
  }

  if (node.type === "review_action") {
    return "review";
  }

  if (WARNING_NODE_TYPES.has(node.type) || node.warningIds.length > 0) {
    return "warning";
  }

  if (node.type === "answer_claim") {
    return "claim";
  }

  return "evidence";
}

function isContextOnlyNode(node: EvidenceWorkbenchGraphNode): boolean {
  return node.type === "public_context_anchor" || node.status === "context_only";
}

function formatGraphLabel(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

function formatWarningIds(warningIds: string[]): string {
  return warningIds.length > 0 ? warningIds.join(", ") : "No active warnings";
}
