import type { ReactElement } from "react";

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

  return (
    <div className="evidence-workbench-source-trace">
      <section
        aria-labelledby="source-focus-title"
        className="evidence-workbench-source-focus"
        id="selected-claim-sources"
      >
        <h3 id="source-focus-title">Selected claim source focus</h3>
        <p>
          {selectedClaimId} is aligned to {focusedSources.length} source
          {focusedSources.length === 1 ? "" : "s"}.
        </p>
        <ul aria-label={`Sources linked to ${selectedClaimId}`}>
          {focusedSources.map((source) => (
            <li key={source.id}>
              <a href={`#source-${source.id}`}>
                <strong>{source.id}</strong>
                <span>{source.status}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <nav aria-label="Source trace filters" className="evidence-workbench-source-filters">
        <ul>
          {filters.map((filter) => (
            <li key={filter.id}>
              <a
                aria-label={`${filter.label}: ${filter.count} source${filter.count === 1 ? "" : "s"}. ${filter.description}`}
                href={sourceFilterHref(filter)}
              >
                <span>{filter.label}</span>
                <strong>{filter.count}</strong>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="evidence-workbench-source-list" id="source-inventory">
        {sources.map((source) => (
          <li
            aria-current={source.isSelectedClaimSource ? "true" : undefined}
            className={sourceCardClassName(source)}
            data-source-filter-state={source.trustState}
            id={`source-${source.id}`}
            key={source.id}
          >
            <article>
              <header className="evidence-workbench-source-card-header">
                <div>
                  <span className="evidence-workbench-source-id">{source.id}</span>
                  <strong>{source.title}</strong>
                </div>
                <div className="evidence-workbench-source-badges">
                  <span className={sourceStatusClassName(source.status)}>{source.status}</span>
                  {source.isSelectedClaimSource ? (
                    <span className="evidence-workbench-status">Selected claim source</span>
                  ) : null}
                </div>
              </header>

              <dl className="evidence-workbench-source-meta" aria-label={`${source.id} source metadata`}>
                <div>
                  <dt>Freshness</dt>
                  <dd>{source.freshness}</dd>
                </div>
                <div>
                  <dt>Owner</dt>
                  <dd>{source.ownerLabel}</dd>
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

              <div className="evidence-workbench-source-evidence-row">
                <section aria-label={`${source.id} citation relationships`}>
                  <h3>Citation relationship</h3>
                  {source.citations.length > 0 ? (
                    <ul className="evidence-workbench-source-token-list">
                      {source.citations.map((citation) => (
                        <li key={citation.id}>
                          <a
                            className="evidence-workbench-source-token"
                            href={`#claim-${citation.claimId}`}
                          >
                            <strong>{citation.marker}</strong>
                            <span>{citation.relationship}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="evidence-workbench-source-note">
                      Present in the inventory, not cited by this answer.
                    </p>
                  )}
                </section>

                <section aria-label={`${source.id} context anchors`}>
                  <h3>Context anchors</h3>
                  {source.contextAnchors.length > 0 ? (
                    <ul className="evidence-workbench-context-chip-list">
                      {source.contextAnchors.map((anchor) => (
                        <li key={anchor.id}>
                          <span>{anchor.label}</span>
                          <small>Context only</small>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="evidence-workbench-source-note">
                      No public context anchor attached.
                    </p>
                  )}
                </section>
              </div>

              {source.directWarnings.length > 0 ? (
                <SourceWarningGroup
                  label="Direct source warning"
                  warnings={source.directWarnings}
                />
              ) : null}

              {source.relationshipWarnings.length > 0 ? (
                <SourceWarningGroup
                  label="Citation or claim warning"
                  warnings={source.relationshipWarnings}
                />
              ) : null}

              <p className="evidence-workbench-source-owner">
                Synthetic owner queue: <code>{source.reviewOwnerQueue}</code>
              </p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SourceWarningGroup({
  label,
  warnings
}: Readonly<{
  label: string;
  warnings: EvidenceWorkbenchSourceWarning[];
}>): ReactElement {
  return (
    <section className="evidence-workbench-source-warning-group" aria-label={label}>
      <h3>{label}</h3>
      <ul>
        {warnings.map((warning) => (
          <li key={warning.id}>
            <strong>{warning.id}</strong>
            <span>
              {warning.severity}
              {warning.blocksApproval ? " approval blocker" : " review note"}
            </span>
            <p>{warning.message}</p>
            <small>{warning.evidenceImpact}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}

function sourceCardClassName(source: EvidenceWorkbenchSource): string {
  return [
    "evidence-workbench-source-card",
    source.isSelectedClaimSource ? "evidence-workbench-source-card-selected" : "",
    /missing|stale|conditional/i.test(source.status)
      ? "evidence-workbench-source-card-warning"
      : ""
  ]
    .filter(Boolean)
    .join(" ");
}

function sourceStatusClassName(status: string): string {
  return [
    "evidence-workbench-status",
    /missing|stale|conditional/i.test(status) ? "evidence-workbench-status-warning" : ""
  ]
    .filter(Boolean)
    .join(" ");
}

function sourceFilterHref(filter: EvidenceWorkbenchSourceFilter): string {
  return filter.sourceIds[0] ? `#source-${filter.sourceIds[0]}` : "#sources-title";
}
