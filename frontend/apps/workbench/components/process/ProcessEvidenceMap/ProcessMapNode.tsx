import type { ReactElement } from "react";
import {
  Handle,
  Position,
  type Node,
  type NodeProps
} from "@xyflow/react";

import {
  formatProcessGraphStatus,
  type ProcessEvidenceMapNodeModel
} from "./processEvidenceMapModel";

export interface ProcessMapNodeData
  extends ProcessEvidenceMapNodeModel,
    Record<string, unknown> {
  isSelectedNode: boolean;
  onSelectNode: (nodeId: string) => void;
}

export type ProcessFlowNode = Node<ProcessMapNodeData, "evidenceNode">;

export function ProcessMapNode({
  data,
  selected
}: NodeProps<ProcessFlowNode>): ReactElement {
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
          formatProcessGraphStatus(data.graphNode.status),
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
          {formatProcessGraphStatus(data.graphNode.status)}
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
