"use client";

import {
  useCallback,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode
} from "react";
import {
  Background,
  Controls,
  MarkerType,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge
} from "@xyflow/react";
import {
  QhdsAccordion,
  QhdsButton,
  QhdsSummaryList,
  type QhdsAccordionItem
} from "@aivis/ui-library";

import type {
  EvidenceWorkbenchGraphPosition,
  EvidenceWorkbenchViewModel
} from "../../../../services/evidence-workbench/types";
import {
  createProcessEvidenceMapModel,
  formatProcessGraphStatus,
  getProcessEvidenceMapVisibleIds,
  type ProcessEvidenceMapFilterId,
  type ProcessEvidenceMapNodeModel
} from "./processEvidenceMapModel";
import {
  ProcessMapNode,
  type ProcessFlowNode,
  type ProcessMapNodeData
} from "./ProcessMapNode";
import { ProcessTextFallback } from "./ProcessTextFallback";

interface ProcessEvidenceMapProps {
  graph: EvidenceWorkbenchViewModel["graph"];
  supportingEvidence?: ReactNode;
  supportingEvidenceId?: string;
  supportingEvidenceTitle?: string;
}

type ProcessFlowEdge = Edge<{
  isSelectedPath: boolean;
  warningLabel: string;
}>;

const FLOW_COLUMN_GAP = 260;
const FLOW_ROW_GAP = 118;
const FLOW_X_OFFSET = 32;
const FLOW_Y_OFFSET = 28;
export const EVIDENCE_PROCESS_MAP_COLOR_MODE = "light";

const nodeTypes = {
  evidenceNode: ProcessMapNode
};

export function ProcessEvidenceMap({
  graph,
  supportingEvidence,
  supportingEvidenceId,
  supportingEvidenceTitle
}: ProcessEvidenceMapProps) {
  const model = useMemo(() => createProcessEvidenceMapModel(graph), [graph]);
  const [filterId, setFilterId] = useState<ProcessEvidenceMapFilterId>("review-path");
  const [selectedNodeId, setSelectedNodeId] = useState(graph.defaultSelectedNodeId);
  const visibleIds = useMemo(
    () => getProcessEvidenceMapVisibleIds(model, filterId),
    [filterId, model]
  );
  const visibleNodeIds = useMemo(() => new Set(visibleIds.nodeIds), [visibleIds.nodeIds]);
  const visibleEdgeIds = useMemo(() => new Set(visibleIds.edgeIds), [visibleIds.edgeIds]);
  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);
  const flowNodes = useMemo(
    () =>
      model.nodes
        .filter((node) => visibleNodeIds.has(node.graphNode.id))
        .map<ProcessFlowNode>((node) => ({
          data: {
            ...node,
            isSelectedNode: node.graphNode.id === selectedNodeId,
            onSelectNode: handleSelectNode
          } satisfies ProcessMapNodeData,
          draggable: false,
          id: node.graphNode.id,
          position: toFlowPosition(node.graphNode.positionHint),
          selected: node.graphNode.id === selectedNodeId,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          type: "evidenceNode"
        })),
    [handleSelectNode, model.nodes, selectedNodeId, visibleNodeIds]
  );
  const flowEdges = useMemo(
    () =>
      model.edges
        .filter((edge) => visibleEdgeIds.has(edge.edge.id))
        .map<ProcessFlowEdge>((edge) => ({
          animated: edge.isSelectedPath,
          className: [
            "evidence-workbench-process-map__edge",
            edge.isSelectedPath ? "evidence-workbench-process-map__edge--selected" : "",
            edge.isContextOnly ? "evidence-workbench-process-map__edge--context" : ""
          ]
            .filter(Boolean)
            .join(" "),
          data: {
            isSelectedPath: edge.isSelectedPath,
            warningLabel: edge.warningLabel
          },
          id: edge.edge.id,
          label: edge.edge.label,
          labelBgPadding: [8, 4],
          labelBgStyle: {
            fill: "var(--qhds-color-surface)"
          },
          labelShowBg: true,
          labelStyle: {
            fill: "var(--aivis-shell-text)",
            fontWeight: 600
          },
          markerEnd: {
            type: MarkerType.ArrowClosed
          },
          source: edge.edge.fromNodeId,
          style: {
            stroke: edge.isSelectedPath
              ? "var(--qhds-color-action)"
              : "var(--qhds-color-border)",
            strokeWidth: edge.isSelectedPath ? 3 : 2
          },
          target: edge.edge.toNodeId,
          type: "smoothstep"
        })),
    [model.edges, visibleEdgeIds]
  );
  const selectedNode =
    model.nodes.find((node) => node.graphNode.id === selectedNodeId) ??
    model.nodes.find((node) => node.graphNode.id === model.defaultSelectedNodeId) ??
    model.nodes[0];
  const selectedFilter = model.filters.find((filter) => filter.id === filterId);
  const detailItems: QhdsAccordionItem[] = [];

  if (selectedNode) {
    detailItems.push({
      content: <SelectedNodeDetail node={selectedNode} />,
      id: "process-selected-node",
      title: "Selected graph node"
    });
  }

  detailItems.push({
    content: <ProcessTextFallback graph={graph} />,
    id: "process-text-map",
    title: "Text process map"
  });

  if (supportingEvidence && supportingEvidenceId && supportingEvidenceTitle) {
    detailItems.push({
      content: supportingEvidence,
      id: supportingEvidenceId,
      title: supportingEvidenceTitle
    });
  }

  return (
    <div
      className="evidence-workbench-process-map"
      data-graph-id={model.graphId}
      data-selected-node-id={selectedNode?.graphNode.id}
    >
      <div className="evidence-workbench-process-map__toolbar">
        <div
          aria-label="Evidence process map filters"
          className="evidence-workbench-process-map__filters"
          role="group"
        >
          {model.filters.map((filter) => (
            <QhdsButton
              aria-label={`Show ${filter.label.toLowerCase()} in the evidence process map`}
              aria-pressed={filter.id === filterId}
              className="evidence-workbench-process-map__filter"
              key={filter.id}
              onClick={() => setFilterId(filter.id)}
              type="button"
              variant={filter.id === filterId ? "primary" : "secondary"}
            >
              {filter.label}
            </QhdsButton>
          ))}
        </div>
        {selectedFilter ? (
          <p
            className="evidence-workbench-process-map__filter-summary"
            id="process-map-filter-summary"
          >
            {selectedFilter.summary}
          </p>
        ) : null}
      </div>

      <ReactFlowProvider>
        <div
          aria-describedby={selectedFilter ? "process-map-filter-summary" : undefined}
          aria-label="Interactive evidence process map"
          className="evidence-workbench-process-map__viewport"
          data-small-viewport-fallback={graph.smallViewportFallback}
          role="region"
        >
          <ReactFlow<ProcessFlowNode, ProcessFlowEdge>
            colorMode={EVIDENCE_PROCESS_MAP_COLOR_MODE}
            edges={flowEdges}
            fitView
            maxZoom={1.3}
            minZoom={0.45}
            nodes={flowNodes}
            nodesConnectable={false}
            nodesDraggable={false}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls showInteractive={false} />
            <ProcessMapCanvasControls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>

      <div className="evidence-workbench-process-map__details">
        <QhdsAccordion headingLevel={3} items={detailItems} />
      </div>
    </div>
  );
}

function ProcessMapCanvasControls() {
  const { fitView, setViewport } = useReactFlow<ProcessFlowNode, ProcessFlowEdge>();

  return (
    <Panel className="evidence-workbench-process-map__canvas-controls" position="top-right">
      <QhdsButton
        aria-label="Fit evidence process map to the visible nodes"
        onClick={() => fitView({ duration: 240, padding: 0.16 })}
        type="button"
        variant="secondary"
      >
        Fit
      </QhdsButton>
      <QhdsButton
        aria-label="Reset evidence process map viewport"
        onClick={() => setViewport({ x: 0, y: 0, zoom: 0.82 }, { duration: 240 })}
        type="button"
        variant="secondary"
      >
        Reset
      </QhdsButton>
    </Panel>
  );
}

function SelectedNodeDetail({
  node
}: {
  node: ProcessEvidenceMapNodeModel;
}): ReactElement {
  return (
    <div
      className="evidence-workbench-process-map__selected-node"
    >
      <QhdsSummaryList
        ariaLabel="Selected graph node metadata"
        items={[
          { description: node.graphNode.label, term: "Node" },
          { description: node.typeLabel, term: "Type" },
          { description: node.refLabel, term: "Reference" },
          { description: formatProcessGraphStatus(node.graphNode.status), term: "Status" },
          { description: node.warningLabel, term: "Warnings" }
        ]}
      />
    </div>
  );
}

function toFlowPosition(position: EvidenceWorkbenchGraphPosition): { x: number; y: number } {
  return {
    x: (position.column - 1) * FLOW_COLUMN_GAP + FLOW_X_OFFSET,
    y: (position.row - 1) * FLOW_ROW_GAP + FLOW_Y_OFFSET
  };
}
