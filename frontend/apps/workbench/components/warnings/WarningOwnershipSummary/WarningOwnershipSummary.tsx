import type { ReactElement } from "react";

import {
  AivisEvidenceStatus,
  AivisEvidenceWarningList,
  QhdsAccordion
} from "@aivis/ui-library";

import type {
  EvidenceWorkbenchSource,
  EvidenceWorkbenchWarning
} from "@aivis/services";
import { SOURCE_INVENTORY_ROUTE } from "../../shared/routeModel";

interface WarningOwnershipSectionProps {
  blockedWarningIds: string[];
  context: "audit" | "process";
  heading: string;
  headingId: string;
  sourceItems: EvidenceWorkbenchSource[];
  summary: string;
  warnings: EvidenceWorkbenchWarning[];
}

type WarningOwnershipContentProps = Omit<
  WarningOwnershipSectionProps,
  "context" | "headingId"
>;

export function WarningOwnershipSection({
  blockedWarningIds,
  context,
  heading,
  headingId,
  sourceItems,
  summary,
  warnings
}: Readonly<WarningOwnershipSectionProps>): ReactElement {
  return (
    <section
      aria-labelledby={headingId}
      className="evidence-workbench-supporting-evidence evidence-workbench-warning-ownership"
    >
      <div className="evidence-workbench-supporting-evidence__section evidence-workbench-warning-ownership__summary">
        <h3 id={headingId}>{heading}</h3>
        <WarningOwnershipSummary
          blockedWarningIds={blockedWarningIds}
          heading={heading}
          sourceItems={sourceItems}
          summary={summary}
          warnings={warnings}
        />
      </div>

      <QhdsAccordion
        headingLevel={4}
        items={[
          {
            content: (
              <WarningOwnershipDetail
                heading={heading}
                warnings={warnings}
              />
            ),
            id: `${context}-supporting-warning-detail`,
            title: "Supporting warning detail"
          }
        ]}
      />
    </section>
  );
}

export function WarningOwnershipSummary({
  blockedWarningIds,
  heading,
  sourceItems,
  summary,
  warnings
}: Readonly<WarningOwnershipContentProps>): ReactElement {
  const sourceOwners = warningSourceOwners(warnings, sourceItems);

  return (
    <>
      <p>{summary}</p>
      <div
        aria-label={`${heading} counts`}
        className="evidence-workbench-warning-ownership__counts"
      >
        <AivisEvidenceStatus tone={warnings.length > 0 ? "warning" : "success"}>
          {warnings.length} active warning{warnings.length === 1 ? "" : "s"}
        </AivisEvidenceStatus>
        <AivisEvidenceStatus tone={blockedWarningIds.length > 0 ? "warning" : "success"}>
          {blockedWarningIds.length} approval blocker{blockedWarningIds.length === 1 ? "" : "s"}
        </AivisEvidenceStatus>
      </div>
      <p>
        Source evidence owns warning records. Open{" "}
        <a href={SOURCE_INVENTORY_ROUTE}>source evidence</a>
        {sourceOwners.length > 0 ? " or jump to the source owner records below." : "."}
      </p>
      {sourceOwners.length > 0 ? (
        <ul
          aria-label={`${heading} source owner links`}
          className="evidence-workbench-warning-ownership__owner-links"
        >
          {sourceOwners.map((source) => (
            <li key={source.id}>
              <a href={`${SOURCE_INVENTORY_ROUTE}#source-${source.id}`}>
                {source.id}
              </a>
              <span>{source.title}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export function WarningOwnershipDetail({
  heading,
  warnings
}: Readonly<Pick<WarningOwnershipContentProps, "heading" | "warnings">>): ReactElement {
  return (
    <div className="evidence-workbench-warning-ownership__detail-panel">
      <p>
        Full warning messages are supporting evidence here. Use Source evidence
        to review the source records and owner queues.
      </p>
      <AivisEvidenceWarningList
        ariaLabel={`${heading} supporting warning details`}
        warnings={warnings.map((warning) => ({
          id: warning.id,
          impact: warning.evidenceImpact,
          message: warning.message,
          severity: warning.severity
        }))}
      />
    </div>
  );
}

function warningSourceOwners(
  warnings: EvidenceWorkbenchWarning[],
  sourceItems: EvidenceWorkbenchSource[]
): EvidenceWorkbenchSource[] {
  const warningIds = new Set(warnings.map((warning) => warning.id));

  return sourceItems.filter((source) =>
    [...source.directWarnings, ...source.relationshipWarnings].some((warning) =>
      warningIds.has(warning.id)
    )
  );
}
