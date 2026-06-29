import type { ReactElement } from "react";

import {
  AivisEvidenceCallout,
  AivisEvidencePanelHeader,
  AivisEvidenceStatus,
  AivisEvidenceWarningGroup,
  QhdsButton
} from "@aivis/ui-library";

import type {
  EvidenceWorkbenchClaim,
  EvidenceWorkbenchSource,
  EvidenceWorkbenchSourceWarning
} from "../../services/evidence-workbench/types";

interface SelectedSourceInspectorProps {
  selectedClaim?: EvidenceWorkbenchClaim;
  selectedClaimId: string;
  sources: EvidenceWorkbenchSource[];
}

export function SelectedSourceInspector({
  selectedClaim,
  selectedClaimId,
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

      <section
        aria-label={`Selected claim ${selectedClaimId}`}
        className="evidence-workbench-source-inspector__claim"
      >
        <p className="evidence-workbench-source-inspector__eyebrow">Selected claim</p>
        <h3>{selectedClaimId}</h3>
        {selectedClaim ? <p>{selectedClaim.text}</p> : null}
        {selectedClaim?.status ? (
          <AivisEvidenceStatus tone={/missing|stale|weak|partial/i.test(selectedClaim.status) ? "warning" : "success"}>
            {selectedClaim.status}
          </AivisEvidenceStatus>
        ) : null}
      </section>

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
                  href={`#source-${source.id}`}
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
        <AivisEvidenceCallout
          className="evidence-workbench-source-inspector__top-warning"
          heading="Top selected-source blocker"
          tone="warning"
        >
          <AivisEvidenceStatus tone="warning">{topWarning.id}</AivisEvidenceStatus>
          <p>{topWarning.message}</p>
          <small>{topWarning.evidenceImpact}</small>
        </AivisEvidenceCallout>
      ) : null}

      <ul
        aria-label={`Selected sources for ${selectedClaimId}`}
        className="evidence-workbench-source-inspector__source-list"
      >
        {focusedSources.map((source) => (
          <li key={source.id}>
            <article className="evidence-workbench-source-inspector__source">
              <div className="evidence-workbench-source-inspector__source-heading">
                <a href={`#source-${source.id}`}>{source.id}</a>
                <AivisEvidenceStatus tone={sourceStatusTone(source.status)}>
                  {source.status}
                </AivisEvidenceStatus>
              </div>
              <h4>{source.title}</h4>
              <dl
                aria-label={`${source.id} selected source details`}
                className="evidence-workbench-source-inspector__source-meta"
              >
                <div>
                  <dt>Owner</dt>
                  <dd>{source.ownerLabel}</dd>
                </div>
                <div>
                  <dt>Freshness</dt>
                  <dd>{source.freshness}</dd>
                </div>
                <div>
                  <dt>Citations</dt>
                  <dd>{source.citationCount}</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{source.sourceType}</dd>
                </div>
              </dl>
              <p>{source.preview}</p>
              <details className="evidence-workbench-source-inspector__warning-details">
                <summary>
                  {source.directWarnings.length + source.relationshipWarnings.length} source warning
                  {source.directWarnings.length + source.relationshipWarnings.length === 1
                    ? ""
                    : "s"}
                </summary>
                <AivisEvidenceWarningGroup
                  label="Direct source warning"
                  warnings={source.directWarnings.map(inspectorWarning)}
                />
                <AivisEvidenceWarningGroup
                  label="Citation or claim warning"
                  warnings={source.relationshipWarnings.map(inspectorWarning)}
                />
              </details>
            </article>
          </li>
        ))}
      </ul>

      <QhdsButton
        className="evidence-workbench-source-inspector__inventory-link"
        href="#source-inventory"
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

function inspectorWarning(warning: EvidenceWorkbenchSourceWarning) {
  return {
    id: warning.id,
    impact: warning.evidenceImpact,
    message: warning.message,
    severity: `${warning.severity}${warning.blocksApproval ? " approval blocker" : " review note"}`
  };
}
