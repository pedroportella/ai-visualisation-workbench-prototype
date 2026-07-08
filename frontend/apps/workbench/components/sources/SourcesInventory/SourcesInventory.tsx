import type { ReactElement } from "react";

import {
  AivisEvidencePanelHeader,
  QhdsButton
} from "@aivis/ui-library";

import type {
  EvidenceWorkbenchSource,
  EvidenceWorkbenchSourceFilter
} from "@aivis/services";
import { SourcesInventoryTable } from "./SourcesInventoryTable";
import {
  hasApprovalBlocker,
  sourceFilterAriaLabel,
  sourceFilterHref,
  sourceInventoryOrder
} from "./sourcesInventoryModel";

interface SourcesInventoryProps {
  filters: EvidenceWorkbenchSourceFilter[];
  selectedClaimId: string;
  sources: EvidenceWorkbenchSource[];
}

export function SourcesInventory({
  filters,
  selectedClaimId,
  sources
}: Readonly<SourcesInventoryProps>): ReactElement {
  const focusedSources = sources.filter((source) => source.isSelectedClaimSource);
  const blockerSources = sources.filter(hasApprovalBlocker);
  const orderedSources = sourceInventoryOrder(sources);

  return (
    <div className="evidence-workbench-source-trace">
      <SourceInventorySummaryCard
        blockerCount={blockerSources.length}
        filterActions={filters}
        focusedSourceCount={focusedSources.length}
        selectedClaimId={selectedClaimId}
        sourceCount={sources.length}
      />

      <p className="evidence-workbench-source-trace__table-note">
        The inventory is ordered with approval blockers first, then selected claim sources,
        then the remaining source records. On smaller screens, scroll the table sideways
        to inspect each column.
      </p>

      <SourcesInventoryTable sources={orderedSources} />
    </div>
  );
}

function SourceInventorySummaryCard({
  blockerCount,
  filterActions,
  focusedSourceCount,
  selectedClaimId,
  sourceCount
}: Readonly<{
  blockerCount: number;
  filterActions: EvidenceWorkbenchSourceFilter[];
  focusedSourceCount: number;
  selectedClaimId: string;
  sourceCount: number;
}>): ReactElement {
  return (
    <section
      aria-labelledby="source-inventory-summary-title"
      className="evidence-workbench-summary-card evidence-workbench-summary-card--warning evidence-workbench-source-summary-card"
    >
      <AivisEvidencePanelHeader
        label="Source trace"
        status={`${blockerCount} source blocker${blockerCount === 1 ? "" : "s"}`}
        statusTone={blockerCount > 0 ? "warning" : "success"}
      />
      <h3 id="source-inventory-summary-title">Source inventory summary</h3>
      <p>
        Synthetic fixture source set: <strong>
          {sourceCount} source record{sourceCount === 1 ? "" : "s"}
        </strong>{" "}
        available. {selectedClaimId} is aligned to{" "}
        {focusedSourceCount} selected source
        {focusedSourceCount === 1 ? "" : "s"}; {blockerCount} source
        {blockerCount === 1 ? "" : "s"} currently block approval.
      </p>
      <nav aria-label="Source inventory groups">
        <ul className="qld__link-list evidence-workbench-summary-card__actions evidence-workbench-source-summary-card__actions">
          {filterActions.map((filter) => (
            <li key={filter.id}>
              <QhdsButton
                aria-label={sourceFilterAriaLabel(filter)}
                className="evidence-workbench-summary-card__action evidence-workbench-source-summary-card__action"
                href={sourceFilterHref(filter)}
                variant="secondary"
              >
                {filter.label} ({filter.count})
              </QhdsButton>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
