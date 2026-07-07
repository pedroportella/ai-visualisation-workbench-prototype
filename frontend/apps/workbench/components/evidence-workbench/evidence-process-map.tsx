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
  Handle,
  MarkerType,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps
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
} from "../../services/evidence-workbench/types";
import {
  createEvidenceProcessMapModel,
  getEvidenceProcessMapVisibleIds,
  type EvidenceProcessMapFilterId,
  type EvidenceProcessMapNodeModel
} from "./evidence-process-map-model";

interface EvidenceProcessMapProps {
  graph: EvidenceWorkbenchViewModel["graph"];
  supportingEvidence?: ReactNode;
  supportingEvidenceId?: string;
  supportingEvidenceTitle?: string;
}

interface EvidenceFlowNodeData extends EvidenceProcessMapNodeModel, Record<string, unknown> {
  isSelectedNode: boolean;
  onSelectNode: (nodeId: string) => void;
}

type EvidenceFlowNode = Node<EvidenceFlowNodeData, "evidenceNode">;
type EvidenceFlowEdge = Edge<{
  isSelectedPath: boolean;
  warningLabel: string;
}>;

const FLOW_COLUMN_GAP = 260;
const FLOW_ROW_GAP = 118;
const FLOW_X_OFFSET = 32;
const FLOW_Y_OFFSET = 28;

const nodeTypes = {
  evidenceNode: EvidenceFlowNodeComponent
};

export function EvidenceProcessMap({
  graph,
  supportingEvidence,
  supportingEvidenceId,
  supportingEvidenceTitle
}: EvidenceProcessMapProps) {
  const model = useMemo(() => createEvidenceProcessMapModel(graph), [graph]);
  const [filterId, setFilterId] = useState<EvidenceProcessMapFilterId>("review-path");
  const [selectedNodeId, setSelectedNodeId] = useState(graph.defaultSelectedNodeId);
  const visibleIds = useMemo(
    () => getEvidenceProcessMapVisibleIds(model, filterId),
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
        .map<EvidenceFlowNode>((node) => ({
          data: {
            ...node,
            isSelectedNode: node.graphNode.id === selectedNodeId,
            onSelectNode: handleSelectNode
          },
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
        .map<EvidenceFlowEdge>((edge) => ({
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
    content: <TextProcessMapFallback graph={graph} />,
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
          <ReactFlow<EvidenceFlowNode, EvidenceFlowEdge>
            colorMode="system"
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

function EvidenceFlowNodeComponent({
  data,
  selected
}: NodeProps<EvidenceFlowNode>) {
  const selectedState = data.isSelectedNode || selected;

  return (
    <div className="evidence-workbench-process-map__node-shell">
      <Handle
        className="evidence-workbench-process-map__handle"
        isConnectable={false}
        position={Position.Left}
        type="target"
      />
      <button
        aria-label={[
          data.graphNode.label,
          data.typeLabel,
          formatGraphStatus(data.graphNode.status),
          data.warningLabel,
          selectedState ? "Selected node" : "Select node for detail"
        ].join(". ")}
        aria-pressed={selectedState}
        className={[
          "evidence-workbench-process-map__node",
          data.isSelectedPath ? "evidence-workbench-process-map__node--path" : "",
          data.isContextOnly ? "evidence-workbench-process-map__node--context-only" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        data-context-only={data.isContextOnly ? "true" : undefined}
        data-node-id={data.graphNode.id}
        data-node-tone={data.tone}
        data-node-type={data.graphNode.type}
        data-selected-path={data.isSelectedPath ? "true" : undefined}
        onClick={() => data.onSelectNode(data.graphNode.id)}
        type="button"
      >
        <span className="evidence-workbench-process-map__node-type">{data.typeLabel}</span>
        <strong>{data.graphNode.label}</strong>
        <span className="evidence-workbench-process-map__node-ref">{data.refLabel}</span>
        <span className="evidence-workbench-process-map__node-status">
          {formatGraphStatus(data.graphNode.status)}
        </span>
        {data.graphNode.warningIds.length > 0 ? (
          <small>{data.warningLabel}</small>
        ) : null}
        {data.isContextOnly ? <small>Context only</small> : null}
      </button>
      <Handle
        className="evidence-workbench-process-map__handle"
        isConnectable={false}
        position={Position.Right}
        type="source"
      />
    </div>
  );
}

function ProcessMapCanvasControls() {
  const { fitView, setViewport } = useReactFlow<EvidenceFlowNode, EvidenceFlowEdge>();

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

function TextProcessMapFallback({
  graph
}: {
  graph: EvidenceWorkbenchViewModel["graph"];
}): ReactElement {
  return (
    <div
      aria-label="Text process map"
      className="evidence-workbench-process-map__fallback"
      id="process-map-text-fallback"
      role="region"
      tabIndex={0}
    >
      <p>{graph.accessibleSummary}</p>
      <ol>
        {graph.fallbackSteps.map((step) => (
          <li key={`${step.step}-${step.heading}`}>
            <h4>
              Step {step.step}: {step.heading}
            </h4>
            <p>{step.summary}</p>
            <small>Includes: {step.includeIds.join(", ")}</small>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SelectedNodeDetail({
  node
}: {
  node: EvidenceProcessMapNodeModel;
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
          { description: formatGraphStatus(node.graphNode.status), term: "Status" },
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

function formatGraphStatus(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}
