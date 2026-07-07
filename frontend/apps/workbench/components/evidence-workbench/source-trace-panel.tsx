"use client";

import { useEffect, type ReactElement } from "react";

import {
  AivisEvidenceAnchorChipList,
  AivisEvidencePanelHeader,
  AivisEvidenceStatus,
  AivisEvidenceTokenList,
  QhdsAccordion,
  QhdsButton,
  QhdsTable,
  type QhdsTableColumn,
  type QhdsTableRow
} from "@aivis/ui-library";

import type {
  EvidenceWorkbenchSource,
  EvidenceWorkbenchSourceFilter,
  EvidenceWorkbenchSourceWarning
} from "../../services/evidence-workbench/types";

interface SourceTracePanelProps {
  filters: EvidenceWorkbenchSourceFilter[];
  selectedClaimId: string;
  sources: EvidenceWorkbenchSource[];
}

export function SourceTracePanel({
  filters,
  selectedClaimId,
  sources
}: Readonly<SourceTracePanelProps>): ReactElement {
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

      <SourceInventoryTable sources={orderedSources} />
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

export function SourceRecordDetails({
  sources
}: Readonly<Pick<SourceTracePanelProps, "sources">>): ReactElement {
  const orderedSources = sourceInventoryOrder(sources);

  return (
    <div className="evidence-workbench-source-records">
      <SourceInventoryHashFocusBridge />
      <QhdsAccordion
        headingLevel={3}
        items={orderedSources.map((source, index) => {
          const warnings = sourceWarnings(source);

          return {
            content: (
              <div
                className="evidence-workbench-source-inventory__detail-panel"
                data-source-expanded-default="false"
                data-source-filter-state={source.trustState}
                data-source-priority={sourcePriority(source)}
                data-source-row-order={index + 1}
              >
                <div className="evidence-workbench-source-evidence-row">
                  <section aria-label={`${source.id} evidence preview`}>
                    <h3>Evidence preview</h3>
                    <p>
                      Source title: <strong>{source.title}</strong>
                    </p>
                    <p>{source.preview}</p>
                    <p>
                      Source type: <strong>{source.sourceType}</strong>
                    </p>
                  </section>

                  <section aria-label={`${source.id} citation relationships`}>
                    <h3>Citation relationship</h3>
                    <AivisEvidenceTokenList
                      ariaLabel={`${source.id} citation relationships`}
                      emptyMessage="Present in the inventory, not cited by this answer."
                      items={source.citations.map((citation) => ({
                        description: citation.relationship,
                        href: `#claim-${citation.claimId}`,
                        id: citation.id,
                        label: citation.marker
                      }))}
                    />
                  </section>

                  <section aria-label={`${source.id} context anchors`}>
                    <h3>Context anchors</h3>
                    <AivisEvidenceAnchorChipList
                      anchors={source.contextAnchors.map((anchor) => ({
                        description: anchor.supportingText,
                        id: anchor.id,
                        label: anchor.label,
                        meta: "Context only"
                      }))}
                      ariaLabel={`${source.id} context anchors`}
                      emptyMessage="No public context anchor attached."
                    />
                  </section>
                </div>

                <SourceWarningSummary source={source} warnings={warnings} />

                <p className="evidence-workbench-source-inventory__owner">
                  Synthetic owner queue: <code>{source.reviewOwnerQueue}</code>
                </p>
              </div>
            ),
            id: sourceAccordionItemId(source.id),
            title: <SourceRecordAccordionTitle source={source} />
          };
        })}
      />
    </div>
  );
}

function SourceInventoryHashFocusBridge(): null {
  useEffect(() => {
    const focusHashTarget = (hash = window.location.hash) => {
      let targetId = "";

      try {
        targetId = decodeURIComponent(hash.slice(1));
      } catch {
        return;
      }

      if (targetId === "source-inventory-table") {
        focusElementById(targetId);
        return;
      }

      const sourceButtonId = sourceAccordionButtonIdFromHashTarget(targetId);

      if (!sourceButtonId) {
        return;
      }

      const sourceButton = document.getElementById(sourceButtonId);

      if (!(sourceButton instanceof HTMLButtonElement)) {
        return;
      }

      openContainingAccordionPanels(sourceButton);

      if (sourceButton.getAttribute("aria-expanded") !== "true") {
        sourceButton.click();
      }

      focusElement(sourceButton);
    };

    const handleHashChange = () => focusHashTarget();
    const handleSourceAnchorClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href*='#source-'], a[href='#source-inventory-table']");

      if (!(anchor instanceof HTMLAnchorElement) || !anchor.hash) {
        return;
      }

      if (anchor.origin === window.location.origin && anchor.pathname !== window.location.pathname) {
        return;
      }

      window.requestAnimationFrame(() => {
        focusHashTarget(anchor.hash);
      });
    };

    focusHashTarget();
    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleSourceAnchorClick);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleSourceAnchorClick);
    };
  }, []);

  return null;
}

function SourceRecordAccordionTitle({
  source
}: Readonly<{ source: EvidenceWorkbenchSource }>): ReactElement {
  return (
    <span className="evidence-workbench-source-inventory__summary">
      <span className="evidence-workbench-source-inventory__source">
        <span className="evidence-workbench-source-inventory__cell-label">
          Record details
        </span>
        <strong>{source.id}</strong>
        <span>{source.title}</span>
      </span>

      <span className="evidence-workbench-source-inventory__detail-status">
        {source.isSelectedClaimSource ? (
          <AivisEvidenceStatus tone="neutral">Selected claim source</AivisEvidenceStatus>
        ) : null}
        {hasApprovalBlocker(source) ? (
          <AivisEvidenceStatus tone="warning">Approval blocker</AivisEvidenceStatus>
        ) : null}
      </span>
    </span>
  );
}

function focusElementById(targetId: string): void {
  const target = document.getElementById(targetId);

  if (target instanceof HTMLElement) {
    openContainingAccordionPanels(target);
    focusElement(target);
  }
}

function openContainingAccordionPanels(target: HTMLElement): void {
  const hiddenPanels: HTMLElement[] = [];
  let current: HTMLElement | null = target.parentElement;

  while (current) {
    if (
      current.classList.contains("qhds-accordion__panel") &&
      current.hidden
    ) {
      hiddenPanels.push(current);
    }

    current = current.parentElement;
  }

  hiddenPanels.reverse().forEach((panel) => {
    const controllingButtonId = panel.getAttribute("aria-labelledby");
    const controllingButton = controllingButtonId
      ? document.getElementById(controllingButtonId)
      : null;

    if (
      controllingButton instanceof HTMLButtonElement &&
      controllingButton.getAttribute("aria-expanded") !== "true"
    ) {
      controllingButton.click();
    }
  });
}

function focusElement(target: HTMLElement): void {
  window.requestAnimationFrame(() => {
    target.scrollIntoView({ block: "start" });
    target.focus({ preventScroll: true });
  });
}

function sourceAccordionButtonIdFromHashTarget(targetId: string): string | null {
  if (!targetId.startsWith("source-")) {
    return null;
  }

  if (targetId.endsWith("-accordion-button")) {
    return targetId;
  }

  if (targetId.endsWith("-accordion-panel")) {
    return targetId.replace(/-accordion-panel$/, "-accordion-button");
  }

  return `${targetId}-accordion-button`;
}

function SourceWarningSummary({
  source,
  warnings
}: Readonly<{
  source: EvidenceWorkbenchSource;
  warnings: EvidenceWorkbenchSourceWarning[];
}>): ReactElement {
  if (warnings.length === 0) {
    return (
      <p className="evidence-workbench-source-inventory__warning-empty">
        No direct source or citation relationship warning is attached to {source.id}.
      </p>
    );
  }

  return (
    <section
      aria-label={`${source.id} warning summary`}
      className="evidence-workbench-source-inventory__warning-summary"
    >
      <h3>Warning summary</h3>
      <ul>
        {warnings.map((warning) => (
          <li key={warning.id}>
            <div className="evidence-workbench-source-inventory__warning-row-header">
              <strong>{warning.id}</strong>
              <AivisEvidenceStatus tone="warning">{warningSeverityLabel(warning)}</AivisEvidenceStatus>
            </div>
            <dl className="evidence-workbench-source-inventory__warning-row">
              <div>
                <dt>Message</dt>
                <dd>{warning.message}</dd>
              </div>
              <div>
                <dt>Evidence impact</dt>
                <dd>{warning.evidenceImpact}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SourceInventoryTable({
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

function warningSeverityLabel(warning: EvidenceWorkbenchSourceWarning): string {
  return `${warning.severity}${warning.blocksApproval ? " approval blocker" : " review note"}`;
}

function sourceFilterHref(filter: EvidenceWorkbenchSourceFilter): string {
  return filter.sourceIds.length === 1
    ? sourceAccordionHash(filter.sourceIds[0])
    : "#source-inventory-table";
}

function sourceFilterAriaLabel(filter: EvidenceWorkbenchSourceFilter): string {
  const countLabel = `${filter.count} source${filter.count === 1 ? "" : "s"}`;

  if (filter.sourceIds.length === 1) {
    return `${filter.label}: ${countLabel}. Opens source record ${filter.sourceIds[0]}. ${filter.description}`;
  }

  if (filter.sourceIds.length === 0) {
    return `${filter.label}: no source records currently match. Moves focus to the source inventory table. ${filter.description}`;
  }

  return `${filter.label}: ${countLabel}. Moves focus to the source inventory table for matching records. ${filter.description}`;
}

function sourceAccordionHash(sourceId: string): string {
  return `#${sourceAccordionButtonId(sourceId)}`;
}

function sourceAccordionButtonId(sourceId: string): string {
  return `${sourceAccordionItemId(sourceId)}-accordion-button`;
}

function sourceAccordionItemId(sourceId: string): string {
  return `source-${sourceId}`;
}

function sourceInventoryOrder(sources: EvidenceWorkbenchSource[]): EvidenceWorkbenchSource[] {
  return sources
    .map((source, index) => ({ index, source }))
    .sort((left, right) => {
      const priorityDelta = sourcePriorityRank(left.source) - sourcePriorityRank(right.source);

      return priorityDelta === 0 ? left.index - right.index : priorityDelta;
    })
    .map(({ source }) => source);
}

function sourcePriorityRank(source: EvidenceWorkbenchSource): number {
  const approvalBlocker = hasApprovalBlocker(source);

  if (source.isSelectedClaimSource && approvalBlocker) {
    return 0;
  }

  if (approvalBlocker) {
    return 1;
  }

  if (source.isSelectedClaimSource) {
    return 2;
  }

  if (sourceWarnings(source).length > 0) {
    return 3;
  }

  if (source.citationCount > 0) {
    return 4;
  }

  return 5;
}

function sourcePriority(source: EvidenceWorkbenchSource): string {
  if (source.isSelectedClaimSource && hasApprovalBlocker(source)) {
    return "selected_blocker";
  }

  if (hasApprovalBlocker(source)) {
    return "approval_blocker";
  }

  if (source.isSelectedClaimSource) {
    return "selected_claim_source";
  }

  if (sourceWarnings(source).length > 0) {
    return "warning";
  }

  if (source.citationCount > 0) {
    return "cited_source";
  }

  return "inventory_source";
}

function sourceIssueSummary(source: EvidenceWorkbenchSource): {
  description: string;
  label: string;
} {
  const warnings = sourceWarnings(source);
  const approvalBlocker = warnings.find((warning) => warning.blocksApproval);
  const firstWarning = warnings[0];

  if (approvalBlocker) {
    return {
      description: approvalBlocker.message,
      label: `${approvalBlocker.id} blocks approval`
    };
  }

  if (firstWarning) {
    return {
      description: firstWarning.message,
      label: `${warnings.length} review warning${warnings.length === 1 ? "" : "s"}`
    };
  }

  if (source.isSelectedClaimSource) {
    return {
      description: "Linked to the selected answer claim.",
      label: "Selected claim evidence"
    };
  }

  if (source.citationCount === 0) {
    return {
      description: "Available in the source set but not cited by the draft answer.",
      label: "Uncited inventory"
    };
  }

  return {
    description: "No direct source or citation relationship warning.",
    label: "No active issue"
  };
}

function hasApprovalBlocker(source: EvidenceWorkbenchSource): boolean {
  return sourceWarnings(source).some((warning) => warning.blocksApproval);
}

function sourceWarnings(source: EvidenceWorkbenchSource): EvidenceWorkbenchSourceWarning[] {
  return [...source.directWarnings, ...source.relationshipWarnings];
}
