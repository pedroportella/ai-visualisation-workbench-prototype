import type { ReactElement } from "react";

import {
  AivisEvidenceStatus,
  QhdsAccordion,
  QhdsRadioGroup,
  QhdsSummaryList
} from "@aivis/ui-library";

import { SOURCE_INVENTORY_ROUTE } from "../../routeModel";
import type { SourceBlockerIssue } from "../../sources/SourcesBlockerTarget";

interface ReviewBlockerSelectorProps {
  issues: SourceBlockerIssue[];
  onSelectIssue: (issueId: string) => void;
  selectedIssue: SourceBlockerIssue | null;
}

export function ReviewBlockerSelector({
  issues,
  onSelectIssue,
  selectedIssue
}: Readonly<ReviewBlockerSelectorProps>): ReactElement {
  if (!selectedIssue) {
    return (
      <div className="evidence-workbench-current-blocker">
        <p>No source blocker issue is active in this local fixture state.</p>
      </div>
    );
  }

  return (
    <div
      className="evidence-workbench-current-blocker"
      data-selected-source-issue-id={selectedIssue.id}
    >
      <section
        aria-labelledby="current-blocker-title"
        className="evidence-workbench-current-blocker__summary"
      >
        <div className="evidence-workbench-current-blocker__heading">
          <AivisEvidenceStatus tone="warning">Approval blocker</AivisEvidenceStatus>
          <h3 id="current-blocker-title">
            {selectedIssue.warningId}: {selectedIssue.warningMessage}
          </h3>
        </div>
        <p>{selectedIssue.evidenceImpact}</p>
        <QhdsSummaryList
          ariaLabel="Current blocker target"
          className="evidence-workbench-current-blocker__metadata"
          items={[
            {
              description: (
                <a href={`${SOURCE_INVENTORY_ROUTE}#source-${selectedIssue.sourceId}`}>
                  {selectedIssue.sourceId}: {selectedIssue.sourceTitle}
                </a>
              ),
              term: "Source record"
            },
            {
              description: selectedIssue.ownerLabel,
              term: "Owner"
            }
          ]}
        />
      </section>

      <div className="evidence-workbench-current-blocker__change">
        <QhdsAccordion
          headingLevel={3}
          items={[
            {
              content: (
                <div className="evidence-workbench-current-blocker__selector-panel">
                  <QhdsRadioGroup
                    className="evidence-workbench-review-blocker-selector__issue-selector"
                    hint="Changing the blocker changes the warning and source recorded against the next local action."
                    legend="Choose a different blocker"
                    name="evidence-workbench-source-issue"
                    onChange={(issueId) => onSelectIssue(issueId)}
                    options={issues.map((issue) => ({
                      hint: issue.warningMessage,
                      label: `${issue.warningId} on ${issue.sourceId}`,
                      value: issue.id
                    }))}
                    value={selectedIssue.id}
                  />
                </div>
              ),
              id: "review-change-blocker",
              title: "Change blocker"
            }
          ]}
        />
      </div>
    </div>
  );
}
