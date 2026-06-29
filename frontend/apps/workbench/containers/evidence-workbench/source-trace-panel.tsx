import type { ReactElement } from "react";

import {
  AivisEvidenceAnchorChipList,
  AivisEvidenceFilterNav,
  AivisEvidencePanelHeader,
  AivisEvidenceStatus,
  AivisEvidenceTokenList,
  type AivisEvidenceTone
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
      <section
        aria-label="Compact source inventory priority"
        className="evidence-workbench-source-inventory-summary"
      >
        <AivisEvidencePanelHeader
          label="Compact source inventory"
          status={`${sources.length} source${sources.length === 1 ? "" : "s"}`}
        />
        <p>
          {selectedClaimId} is aligned to {focusedSources.length} selected source
          {focusedSources.length === 1 ? "" : "s"}. {blockerSources.length} source
          {blockerSources.length === 1 ? "" : "s"} currently block approval.
        </p>
        <AivisEvidenceTokenList
          ariaLabel={`Sources linked to ${selectedClaimId}`}
          items={focusedSources.map((source) => ({
            description: source.status,
            href: `#source-${source.id}`,
            id: source.id,
            label: source.id
          }))}
        />
      </section>

      <AivisEvidenceFilterNav
        ariaLabel="Source inventory groups"
        filters={filters.map((filter) => ({
          ariaLabel: `${filter.label}: ${filter.count} source${filter.count === 1 ? "" : "s"}. ${filter.description}`,
          count: filter.count,
          href: sourceFilterHref(filter),
          id: filter.id,
          label: filter.label
        }))}
      />

      <ol className="evidence-workbench-source-inventory" id="source-inventory">
        {orderedSources.map((source, index) => {
          const issueSummary = sourceIssueSummary(source);
          const warnings = sourceWarnings(source);

          return (
            <li className="evidence-workbench-source-inventory__item" key={source.id}>
              <details
                className="evidence-workbench-source-inventory__details"
                data-source-filter-state={source.trustState}
                data-source-expanded-default="false"
                data-source-priority={sourcePriority(source)}
                data-source-row-order={index + 1}
                id={`source-${source.id}`}
              >
                <summary
                  aria-label={`${source.id}: ${source.title}. ${issueSummary.label}. Press Enter to toggle source details.`}
                  className="evidence-workbench-source-inventory__summary"
                >
                  <span className="evidence-workbench-source-inventory__source">
                    <span className="evidence-workbench-source-inventory__cell-label">
                      Source
                    </span>
                    <strong>{source.id}</strong>
                    <span>{source.title}</span>
                    <span className="evidence-workbench-source-inventory__badges">
                      {source.isSelectedClaimSource ? (
                        <AivisEvidenceStatus tone="neutral">Selected claim source</AivisEvidenceStatus>
                      ) : null}
                      {hasApprovalBlocker(source) ? (
                        <AivisEvidenceStatus tone="warning">Approval blocker</AivisEvidenceStatus>
                      ) : null}
                    </span>
                  </span>

                  <span className="evidence-workbench-source-inventory__cell">
                    <span className="evidence-workbench-source-inventory__cell-label">
                      Status
                    </span>
                    <AivisEvidenceStatus tone={sourceStatusTone(source.status)}>
                      {source.status}
                    </AivisEvidenceStatus>
                  </span>

                  <span className="evidence-workbench-source-inventory__cell">
                    <span className="evidence-workbench-source-inventory__cell-label">
                      Freshness
                    </span>
                    <strong>{source.freshness}</strong>
                  </span>

                  <span className="evidence-workbench-source-inventory__cell">
                    <span className="evidence-workbench-source-inventory__cell-label">
                      Owner
                    </span>
                    <strong>{source.ownerLabel}</strong>
                  </span>

                  <span className="evidence-workbench-source-inventory__cell">
                    <span className="evidence-workbench-source-inventory__cell-label">
                      Citations
                    </span>
                    <strong>{source.citationCount}</strong>
                  </span>

                  <span className="evidence-workbench-source-inventory__issue">
                    <span className="evidence-workbench-source-inventory__cell-label">
                      Issue
                    </span>
                    <strong>{issueSummary.label}</strong>
                    <span>{issueSummary.description}</span>
                  </span>
                </summary>

                <div className="evidence-workbench-source-inventory__detail-panel">
                  <div className="evidence-workbench-source-evidence-row">
                    <section aria-label={`${source.id} evidence preview`}>
                      <h3>Evidence preview</h3>
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
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
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
            <AivisEvidenceStatus tone="warning">{warningSeverityLabel(warning)}</AivisEvidenceStatus>
            <strong>{warning.id}</strong>
            <span>{warning.message}</span>
            <small>{warning.evidenceImpact}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}

function sourceStatusTone(status: string): AivisEvidenceTone {
  return /missing|stale|conditional|weak|partial/i.test(status) ? "warning" : "success";
}

function warningSeverityLabel(warning: EvidenceWorkbenchSourceWarning): string {
  return `${warning.severity}${warning.blocksApproval ? " approval blocker" : " review note"}`;
}

function sourceFilterHref(filter: EvidenceWorkbenchSourceFilter): string {
  return filter.sourceIds[0] ? `#source-${filter.sourceIds[0]}` : "#sources-title";
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
