import type { ReactElement } from "react";

import {
  AivisEvidenceMetadata,
  AivisEvidencePanelHeader,
  AivisEvidenceStatus,
  AivisEvidenceWarningGroup,
  AivisEvidenceWarningList,
  QhdsButton,
  QhdsCard
} from "@aivis/ui-library";

import type {
  EvidenceWorkbenchClaim,
  EvidenceWorkbenchSource,
  EvidenceWorkbenchSourceWarning
} from "../../services/evidence-workbench/types";

interface SelectedSourceInspectorProps {
  selectedClaim?: EvidenceWorkbenchClaim;
  selectedClaimId: string;
  sourceInventoryPath?: string;
  sources: EvidenceWorkbenchSource[];
}

export function SelectedSourceInspector({
  selectedClaim,
  selectedClaimId,
  sourceInventoryPath = "",
  sources
}: Readonly<SelectedSourceInspectorProps>): ReactElement {
  const focusedSources = sources.filter((source) => source.isSelectedClaimSource);
  const focusedWarnings = selectedSourceWarnings(focusedSources);
  const topWarning =
    focusedWarnings.find((warning) => warning.blocksApproval) ?? focusedWarnings[0];

  return (
    <div className="evidence-workbench-source-inspector" id="selected-claim-sources">
      <AivisEvidencePanelHeader
        label="Selected source inspector"
        status={`${focusedSources.length} linked source${focusedSources.length === 1 ? "" : "s"}`}
        statusTone={focusedSources.some((source) => sourceStatusTone(source.status) === "warning") ? "warning" : "success"}
      />

      <QhdsCard
        actionMode="none"
        aria-label={`Selected claim ${selectedClaimId}`}
        className="evidence-workbench-source-inspector__claim"
        density="compact"
        heading={selectedClaimId}
        headingLevel={3}
        variant="workbench"
      >
        <p className="evidence-workbench-source-inspector__eyebrow">Selected claim</p>
        {selectedClaim ? <p>{selectedClaim.text}</p> : null}
        {selectedClaim?.status ? (
          <AivisEvidenceStatus tone={/missing|stale|weak|partial/i.test(selectedClaim.status) ? "warning" : "success"}>
            {selectedClaim.status}
          </AivisEvidenceStatus>
        ) : null}
      </QhdsCard>

      <section
        aria-labelledby="selected-claim-linked-sources-title"
        className="evidence-workbench-source-inspector__linked-sources"
      >
        <h4 id="selected-claim-linked-sources-title">Linked sources</h4>
        {focusedSources.length > 0 ? (
          <ul aria-label={`Sources linked to ${selectedClaimId}`}>
            {focusedSources.map((source) => (
              <li key={source.id}>
                <a
                  aria-label={`${source.id}, ${source.status}. Jump to full source inventory record.`}
                  href={sourceHref(sourceInventoryPath, source.id)}
                >
                  {source.id}
                </a>
                <AivisEvidenceStatus tone={sourceStatusTone(source.status)}>
                  {source.status}
                </AivisEvidenceStatus>
              </li>
            ))}
          </ul>
        ) : (
          <p>No source is linked to the selected claim.</p>
        )}
      </section>

      {topWarning ? (
        <section
          aria-label="Top selected-source blocker"
          className="evidence-workbench-source-inspector__top-warning"
        >
          <h4>Top selected-source blocker</h4>
          <AivisEvidenceWarningList
            ariaLabel="Top selected-source blocker detail"
            warnings={[
              {
                id: topWarning.id,
                impact: topWarning.evidenceImpact,
                message: topWarning.message,
                severity: warningSeverityLabel(topWarning)
              }
            ]}
          />
        </section>
      ) : null}

      <ul
        aria-label={`Selected sources for ${selectedClaimId}`}
        className="evidence-workbench-source-inspector__source-list"
      >
        {focusedSources.map((source) => {
          const warningCount =
            source.directWarnings.length + source.relationshipWarnings.length;

          return (
            <li key={source.id}>
              <QhdsCard
                actionMode="none"
                className="evidence-workbench-source-inspector__source"
                density="compact"
                heading={source.title}
                headingLevel={4}
                variant="workbench"
              >
                <div className="evidence-workbench-source-inspector__source-heading">
                  <a href={sourceHref(sourceInventoryPath, source.id)}>{source.id}</a>
                  <AivisEvidenceStatus tone={sourceStatusTone(source.status)}>
                    {source.status}
                  </AivisEvidenceStatus>
                </div>
                <AivisEvidenceMetadata
                  ariaLabel={`${source.id} selected source details`}
                  className="evidence-workbench-source-inspector__source-meta"
                  items={[
                    { description: source.ownerLabel, term: "Owner" },
                    { description: source.freshness, term: "Freshness" },
                    { description: source.citationCount, term: "Citations" },
                    { description: source.sourceType, term: "Type" }
                  ]}
                />
                <p>{source.preview}</p>
                <details className="evidence-workbench-disclosure evidence-workbench-source-inspector__warning-details">
                  <summary className="evidence-workbench-disclosure__summary">
                    <span className="evidence-workbench-disclosure__summary-text">
                      {warningCount} source warning{warningCount === 1 ? "" : "s"}
                    </span>
                    <span className="evidence-workbench-disclosure__toggle">
                      <span className="evidence-workbench-disclosure__toggle-closed">
                        Show details
                      </span>
                      <span className="evidence-workbench-disclosure__toggle-open">
                        Hide details
                      </span>
                    </span>
                  </summary>
                  <div className="evidence-workbench-disclosure__content evidence-workbench-source-inspector__warning-panel">
                    <AivisEvidenceWarningGroup
                      label="Direct source warning"
                      warnings={source.directWarnings.map(inspectorWarning)}
                    />
                    <AivisEvidenceWarningGroup
                      label="Citation or claim warning"
                      warnings={source.relationshipWarnings.map(inspectorWarning)}
                    />
                  </div>
                </details>
              </QhdsCard>
            </li>
          );
        })}
      </ul>

      <QhdsButton
        className="evidence-workbench-source-inspector__inventory-link"
        href={`${sourceInventoryPath}#source-inventory`}
        variant="secondary"
      >
        View full source inventory
      </QhdsButton>
    </div>
  );
}

export function selectedSourceWarnings(
  sources: EvidenceWorkbenchSource[]
): EvidenceWorkbenchSourceWarning[] {
  return sources.flatMap((source) => [
    ...source.directWarnings,
    ...source.relationshipWarnings
  ]);
}

function sourceStatusTone(status: string) {
  return /missing|stale|conditional|weak|partial/i.test(status) ? "warning" : "success";
}

function sourceHref(sourceInventoryPath: string, sourceId: string): string {
  return `${sourceInventoryPath}#source-${sourceId}`;
}

function inspectorWarning(warning: EvidenceWorkbenchSourceWarning) {
  return {
    id: warning.id,
    impact: warning.evidenceImpact,
    message: warning.message,
    severity: warningSeverityLabel(warning)
  };
}

function warningSeverityLabel(warning: EvidenceWorkbenchSourceWarning): string {
  return `${warning.severity}${warning.blocksApproval ? " approval blocker" : " review note"}`;
}
