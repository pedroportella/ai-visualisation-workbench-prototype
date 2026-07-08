import type { ReactElement } from "react";

import {
  QhdsTable,
  type QhdsTableColumn,
  type QhdsTableRow
} from "@aivis/ui-library";

import type { EvidenceWorkbenchSource } from "../../../services/EvidenceWorkbenchTypes";
import {
  sourceAccordionHash,
  sourceIssueSummary
} from "./sourcesInventoryModel";

export function SourcesInventoryTable({
  sources
}: Readonly<{ sources: EvidenceWorkbenchSource[] }>): ReactElement {
  const columns: QhdsTableColumn[] = [
    { dataLabel: "Source", header: "Source", key: "source" },
    { dataLabel: "Status", header: "Status", key: "status" },
    { dataLabel: "Freshness", header: "Freshness", key: "freshness" },
    { dataLabel: "Owner", header: "Owner", key: "owner" },
    { dataLabel: "Citations", header: "Citations", key: "citations" },
    { dataLabel: "Issue", header: "Issue", key: "issue" },
    { dataLabel: "Details", header: "Details", key: "details" }
  ];
  const rows = sources.map(sourceInventoryTableRow);

  return (
    <div
      aria-label="Source inventory table target"
      className="evidence-workbench-source-inventory-table"
      id="source-inventory-table"
      tabIndex={-1}
    >
      <QhdsTable
        caption="Source inventory table"
        captionDescription="Primary source list ordered with approval blockers first, then selected claim sources, then remaining source records."
        columns={columns}
        rows={rows}
        striped
      />
    </div>
  );
}

function sourceInventoryTableRow(source: EvidenceWorkbenchSource): QhdsTableRow {
  const issueSummary = sourceIssueSummary(source);

  return {
    citations: source.citationCount,
    details: (
      <a
        aria-label={`Open details for ${source.id}: ${source.title}`}
        className="evidence-workbench-source-inventory-table__detail-link"
        href={sourceAccordionHash(source.id)}
      >
        Open details
      </a>
    ),
    freshness: source.freshness,
    id: source.id,
    issue: (
      <span className="evidence-workbench-source-inventory-table__issue">
        <strong>{issueSummary.label}</strong>
        <span>{issueSummary.description}</span>
      </span>
    ),
    owner: source.ownerLabel,
    source: (
      <span className="evidence-workbench-source-inventory-table__source">
        <strong>{source.id}</strong>
        <span>{source.title}</span>
      </span>
    ),
    status: source.status
  };
}
