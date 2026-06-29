"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  Controls,
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
import { QhdsCard } from "@aivis/ui-library";

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

export function EvidenceProcessMap({ graph }: EvidenceProcessMapProps) {
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
            fill: "var(--aivis-color-card-surface)"
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
              ? "var(--aivis-shell-accent)"
              : "var(--aivis-shell-border-muted)",
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
            <button
              aria-label={`Show ${filter.label.toLowerCase()} in the evidence process map`}
              aria-pressed={filter.id === filterId}
              className="evidence-workbench-process-map__filter"
              key={filter.id}
              onClick={() => setFilterId(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        {selectedFilter ? (
          <p className="evidence-workbench-process-map__filter-summary">
            {selectedFilter.summary}
          </p>
        ) : null}
      </div>

      <ReactFlowProvider>
        <div
          aria-describedby="process-map-text-fallback"
          aria-label="Interactive evidence process map"
          className="evidence-workbench-process-map__viewport"
          data-small-viewport-fallback={graph.smallViewportFallback}
          role="region"
        >
          <ReactFlow<EvidenceFlowNode, EvidenceFlowEdge>
            colorMode="light"
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
        {selectedNode ? <SelectedNodeDetail node={selectedNode} /> : null}
        <div
          aria-labelledby="process-map-text-fallback-title"
          className="evidence-workbench-process-map__fallback"
          id="process-map-text-fallback"
          role="region"
          tabIndex={0}
        >
          <h3 id="process-map-text-fallback-title">Text process map</h3>
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
      </div>
    </div>
  );
}

function EvidenceFlowNodeComponent({
  data,
  selected
}: NodeProps<EvidenceFlowNode>) {
  return (
    <button
      aria-label={[
        data.graphNode.label,
        data.typeLabel,
        formatGraphStatus(data.graphNode.status),
        data.warningLabel,
        data.isSelectedNode || selected ? "Selected node" : "Select node for detail"
      ].join(". ")}
      aria-pressed={data.isSelectedNode || selected}
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
  );
}

function ProcessMapCanvasControls() {
  const { fitView, setViewport } = useReactFlow<EvidenceFlowNode, EvidenceFlowEdge>();

  return (
    <Panel className="evidence-workbench-process-map__canvas-controls" position="top-right">
      <button
        aria-label="Fit evidence process map to the visible nodes"
        onClick={() => fitView({ duration: 240, padding: 0.16 })}
        type="button"
      >
        Fit
      </button>
      <button
        aria-label="Reset evidence process map viewport"
        onClick={() => setViewport({ x: 0, y: 0, zoom: 0.82 }, { duration: 240 })}
        type="button"
      >
        Reset
      </button>
    </Panel>
  );
}

function SelectedNodeDetail({ node }: { node: EvidenceProcessMapNodeModel }) {
  return (
    <QhdsCard
      actionMode="none"
      className="evidence-workbench-process-map__selected-node"
      density="compact"
      heading="Selected graph node"
      headingId="process-map-selected-node-title"
      headingLevel={3}
      variant="workbench"
    >
      <dl>
        <div>
          <dt>Node</dt>
          <dd>{node.graphNode.label}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{node.typeLabel}</dd>
        </div>
        <div>
          <dt>Reference</dt>
          <dd>{node.refLabel}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{formatGraphStatus(node.graphNode.status)}</dd>
        </div>
        <div>
          <dt>Warnings</dt>
          <dd>{node.warningLabel}</dd>
        </div>
      </dl>
    </QhdsCard>
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
