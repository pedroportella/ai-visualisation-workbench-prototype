import type { ReactElement } from "react";

import {
  AivisEvidenceAnchorChipList,
  AivisEvidenceCallout,
  AivisEvidenceFilterNav,
  AivisEvidenceSourceCard,
  AivisEvidenceTokenList,
  AivisEvidenceWarningGroup,
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

  return (
    <div className="evidence-workbench-source-trace">
      <AivisEvidenceCallout
        className="evidence-workbench-source-focus"
        heading="Selected claim source focus"
        tone="neutral"
      >
        <p>
          {selectedClaimId} is aligned to {focusedSources.length} source
          {focusedSources.length === 1 ? "" : "s"}.
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
      </AivisEvidenceCallout>

      <AivisEvidenceFilterNav
        ariaLabel="Source trace filters"
        filters={filters.map((filter) => ({
          ariaLabel: `${filter.label}: ${filter.count} source${filter.count === 1 ? "" : "s"}. ${filter.description}`,
          count: filter.count,
          href: sourceFilterHref(filter),
          id: filter.id,
          label: filter.label
        }))}
      />

      <ul className="evidence-workbench-source-list" id="source-inventory">
        {sources.map((source) => (
          <li className="evidence-workbench-source-list__item" key={source.id}>
            <AivisEvidenceSourceCard
              data-source-filter-state={source.trustState}
              id={`source-${source.id}`}
              metadataItems={[
                { description: source.freshness, term: "Freshness" },
                { description: source.ownerLabel, term: "Owner" },
                { description: source.citationCount, term: "Citations" },
                { description: source.sourceType, term: "Type" }
              ]}
              preview={source.preview}
              selected={source.isSelectedClaimSource}
              selectedLabel="Selected claim source"
              sourceId={source.id}
              status={source.status}
              statusTone={sourceStatusTone(source.status)}
              title={source.title}
            >
              <div className="evidence-workbench-source-evidence-row">
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

              <AivisEvidenceWarningGroup
                label="Direct source warning"
                warnings={source.directWarnings.map((warning) => ({
                  id: warning.id,
                  impact: warning.evidenceImpact,
                  message: warning.message,
                  severity: warningSeverityLabel(warning)
                }))}
              />

              <AivisEvidenceWarningGroup
                label="Citation or claim warning"
                warnings={source.relationshipWarnings.map((warning) => ({
                  id: warning.id,
                  impact: warning.evidenceImpact,
                  message: warning.message,
                  severity: warningSeverityLabel(warning)
                }))}
              />

              <p className="aivis-evidence-source-card__owner">
                Synthetic owner queue: <code>{source.reviewOwnerQueue}</code>
              </p>
            </AivisEvidenceSourceCard>
          </li>
        ))}
      </ul>
    </div>
  );
}

function sourceStatusTone(status: string): AivisEvidenceTone {
  return /missing|stale|conditional/i.test(status) ? "warning" : "success";
}

function warningSeverityLabel(warning: EvidenceWorkbenchSourceWarning): string {
  return `${warning.severity}${warning.blocksApproval ? " approval blocker" : " review note"}`;
}

function sourceFilterHref(filter: EvidenceWorkbenchSourceFilter): string {
  return filter.sourceIds[0] ? `#source-${filter.sourceIds[0]}` : "#sources-title";
}
