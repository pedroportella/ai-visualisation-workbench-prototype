import type { ReactElement } from "react";

import {
  AivisEvidencePanelHeader,
  AivisEvidenceStatus,
  QhdsButton,
  QhdsSummaryList
} from "@aivis/ui-library";

import type {
  EvidenceWorkbenchSource,
  EvidenceWorkbenchSourceWarning
} from "../../services/evidence-workbench/types";
import type { ReviewActionTarget } from "./review-action-state";

export interface SourceBlockerIssue extends ReviewActionTarget {
  code: string;
  id: string;
  isSelectedClaimSource: boolean;
  severity: string;
  sourceFreshness: string;
  sourceStatus: string;
  trustState: string;
}

interface SourceBlockerReviewProps {
  actionMode?: "inspect" | "select";
  issues: SourceBlockerIssue[];
  onSelectIssue: (issueId: string) => void;
  reviewActionPath?: string;
  selectedIssueId: string | null;
  sourceInventoryPath: string;
}

export function SourceBlockerReview({
  actionMode = "select",
  issues,
  onSelectIssue,
  reviewActionPath,
  selectedIssueId,
  sourceInventoryPath
}: Readonly<SourceBlockerReviewProps>): ReactElement {
  const selectedIssue = selectedSourceIssue(issues, selectedIssueId);
  const selectsActionTarget = actionMode === "select";

  if (issues.length === 0) {
    return (
      <div className="evidence-workbench-source-review" data-selected-source-issue-id="">
        <AivisEvidencePanelHeader label="Source blockers" status="No blockers" statusTone="success" />
        <p>No source blocker issues are active in this local fixture state.</p>
      </div>
    );
  }

  return (
    <div
      className="evidence-workbench-source-review"
      data-selected-source-issue-id={selectedIssue?.id ?? ""}
    >
      <AivisEvidencePanelHeader
        label="Source blockers"
        status={`${issues.length} blocker issue${issues.length === 1 ? "" : "s"}`}
        statusTone="warning"
      />
      <p>
        {selectsActionTarget
          ? "Select the source issue the local action is about. The action buttons use this selected issue as their local audit target."
          : "Inspect source issues here, then continue to the review route to choose the local action target."}
      </p>

      {selectedIssue ? (
        <QhdsSummaryList
          ariaLabel={
            selectsActionTarget
              ? "Selected source issue for local action"
              : "Focused source issue"
          }
          className="evidence-workbench-source-review__selected-summary"
          items={[
            {
              description: `${selectedIssue.warningId}: ${selectedIssue.warningMessage}`,
              term: selectsActionTarget ? "Selected issue" : "Focused issue"
            },
            {
              description: `${selectedIssue.sourceId}: ${selectedIssue.sourceTitle}`,
              term: "Source record"
            },
            {
              description: selectedIssue.ownerLabel,
              term: "Synthetic owner"
            }
          ]}
        />
      ) : null}

      <ol
        aria-label="Source blocker issues available for action"
        className="evidence-workbench-source-review__issue-list"
      >
        {issues.map((issue) => {
          const selected = issue.id === selectedIssue?.id;

          return (
            <li
              className="evidence-workbench-source-review__issue"
              data-source-issue-selected={selected ? "true" : "false"}
              key={issue.id}
            >
              <details
                className="evidence-workbench-source-review__details"
                data-source-filter-state={issue.trustState}
                open={selected}
              >
                <summary className="evidence-workbench-source-review__summary">
                  <span>
                    <strong>{issueLabel(issue)}</strong>
                    <span>{issue.warningMessage}</span>
                  </span>
                  <AivisEvidenceStatus tone="warning">
                    {issue.severity} blocker
                  </AivisEvidenceStatus>
                </summary>

                <div className="evidence-workbench-source-review__detail-panel">
                  <QhdsSummaryList
                    ariaLabel={`${issue.warningId} source issue details`}
                    className="evidence-workbench-source-review__metadata"
                    items={[
                      {
                        description: `${issue.sourceId}: ${issue.sourceTitle}`,
                        term: "Source"
                      },
                      {
                        description: issue.sourceStatus,
                        term: "Status"
                      },
                      {
                        description: issue.sourceFreshness,
                        term: "Freshness"
                      },
                      {
                        description: issue.reviewOwnerQueue,
                        term: "Owner queue"
                      }
                    ]}
                  />
                  <p>{issue.evidenceImpact}</p>
                  <div className="evidence-workbench-source-review__actions">
                    <QhdsButton
                      aria-pressed={selected ? "true" : "false"}
                      onClick={() => onSelectIssue(issue.id)}
                      type="button"
                      variant={selected ? "secondary" : "primary"}
                    >
                      {selected
                        ? selectsActionTarget
                          ? "Selected for action"
                          : "Focused issue"
                        : selectsActionTarget
                          ? "Select for action"
                          : "Focus issue"}
                    </QhdsButton>
                    <QhdsButton
                      href={`${sourceInventoryPath}#source-${issue.sourceId}`}
                      variant="tertiary"
                    >
                      Open source record
                    </QhdsButton>
                    {reviewActionPath ? (
                      <QhdsButton href={reviewActionPath} variant="tertiary">
                        Continue to review actions
                      </QhdsButton>
                    ) : null}
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function buildSourceBlockerIssues(
  sources: EvidenceWorkbenchSource[]
): SourceBlockerIssue[] {
  return sources.flatMap((source) =>
    sourceWarnings(source)
      .filter((warning) => warning.blocksApproval)
      .map((warning) => sourceBlockerIssue(source, warning))
  );
}

export function selectedSourceIssue(
  issues: SourceBlockerIssue[],
  selectedIssueId: string | null
): SourceBlockerIssue | null {
  return (
    issues.find((issue) => issue.id === selectedIssueId) ??
    issues[0] ??
    null
  );
}

function sourceBlockerIssue(
  source: EvidenceWorkbenchSource,
  warning: EvidenceWorkbenchSourceWarning
): SourceBlockerIssue {
  return {
    code: warning.code,
    evidenceImpact: warning.evidenceImpact,
    id: `${source.id}-${warning.id}`,
    isSelectedClaimSource: source.isSelectedClaimSource,
    ownerLabel: source.ownerLabel,
    reviewOwnerQueue: source.reviewOwnerQueue,
    severity: warning.severity,
    sourceFreshness: source.freshness,
    sourceId: source.id,
    sourceStatus: source.status,
    sourceTitle: source.title,
    trustState: source.trustState,
    warningId: warning.id,
    warningMessage: warning.message
  };
}

function sourceWarnings(source: EvidenceWorkbenchSource): EvidenceWorkbenchSourceWarning[] {
  return [...source.directWarnings, ...source.relationshipWarnings];
}

function issueLabel(issue: SourceBlockerIssue): string {
  return `${issue.warningId} on ${issue.sourceId}`;
}
