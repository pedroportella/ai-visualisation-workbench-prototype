import type { ReactElement } from "react";

import {
  AivisEvidencePanelHeader,
  QhdsDirectionLink,
  QhdsRadioGroup,
  QhdsSummaryList,
  QhdsTable,
  type QhdsTableColumn,
  type QhdsTableRow
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
  selectedSummaryPosition?: "after-selector" | "before-selector";
  showIssueTable?: boolean;
  sourceInventoryPath: string;
}

export function SourceBlockerReview({
  actionMode = "select",
  issues,
  onSelectIssue,
  reviewActionPath,
  selectedIssueId,
  selectedSummaryPosition = "after-selector",
  showIssueTable = true,
  sourceInventoryPath
}: Readonly<SourceBlockerReviewProps>): ReactElement {
  const selectedIssue = selectedSourceIssue(issues, selectedIssueId);
  const selectsActionTarget = actionMode === "select";
  const selectedIssueSummary = selectedIssue ? (
    <SelectedSourceIssueSummary
      reviewActionPath={reviewActionPath}
      selectedIssue={selectedIssue}
      selectsActionTarget={selectsActionTarget}
      sourceInventoryPath={sourceInventoryPath}
    />
  ) : null;

  if (issues.length === 0) {
    return (
      <div className="evidence-workbench-source-review" data-selected-source-issue-id="">
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

      <p className="evidence-workbench-source-review__description">
        {selectsActionTarget
          ? "Choose the source issue the local action is about. The action buttons use this selected issue as their local audit target."
          : "Inspect source issues here, then continue to the review route to choose the local action target."}
      </p>

      {selectedSummaryPosition === "before-selector" ? selectedIssueSummary : null}

      <QhdsRadioGroup
        className="evidence-workbench-source-review__issue-selector"
        hint="The selected blocker determines the source, warning and owner queue recorded in the local audit state."
        legend={
          selectsActionTarget
            ? "Choose source issue for local action"
            : "Choose source issue to inspect"
        }
        name="evidence-workbench-source-issue"
        onChange={(issueId) => onSelectIssue(issueId)}
        options={issues.map((issue) => ({
          hint: selectsActionTarget
            ? `${issue.warningMessage} ${issue.sourceFreshness}; ${issue.ownerLabel}.`
            : issue.warningMessage,
          label: issueLabel(issue),
          value: issue.id
        }))}
        value={selectedIssue?.id ?? undefined}
      />

      {selectedSummaryPosition === "after-selector" ? selectedIssueSummary : null}

      {showIssueTable ? (
        <SourceBlockerIssueTable issues={issues} selectedIssueId={selectedIssue?.id ?? null} />
      ) : null}
    </div>
  );
}

function SelectedSourceIssueSummary({
  reviewActionPath,
  selectedIssue,
  selectsActionTarget,
  sourceInventoryPath
}: Readonly<{
  reviewActionPath?: string;
  selectedIssue: SourceBlockerIssue;
  selectsActionTarget: boolean;
  sourceInventoryPath: string;
}>): ReactElement {
  const summaryItems = selectsActionTarget
    ? [
        {
          description: `${selectedIssue.warningId}: ${selectedIssue.warningMessage}`,
          term: "Selected issue"
        },
        {
          description: `${selectedIssue.sourceId}: ${selectedIssue.sourceTitle}`,
          term: "Source record"
        },
        {
          description: selectedIssue.sourceStatus,
          term: "Source status"
        },
        {
          description: selectedIssue.sourceFreshness,
          term: "Freshness"
        },
        {
          description: selectedIssue.ownerLabel,
          term: "Synthetic owner"
        },
        {
          description: selectedIssue.reviewOwnerQueue,
          term: "Owner queue"
        }
      ]
    : [
        {
          description: `${selectedIssue.warningId}: ${selectedIssue.warningMessage}`,
          term: "Focused issue"
        },
        {
          description: (
            <a href={`${sourceInventoryPath}${sourceRecordHash(selectedIssue.sourceId)}`}>
              {selectedIssue.sourceId}
            </a>
          ),
          term: "Source record"
        },
        {
          description: "Continue to the review route to record a local action.",
          term: "Action route"
        }
      ];

  return (
    <section
      aria-labelledby="selected-source-issue-title"
      className="evidence-workbench-source-review__selected-summary"
    >
      <h3 id="selected-source-issue-title">
        {selectsActionTarget ? "Selected source issue" : "Focused source issue"}
      </h3>
      <QhdsSummaryList
        ariaLabel={
          selectsActionTarget
            ? "Selected source issue for local action"
            : "Focused source issue"
        }
        className="evidence-workbench-source-review__metadata"
        items={summaryItems}
      />
      <p>{selectedIssue.evidenceImpact}</p>
      <div className="evidence-workbench-source-review__actions">
        <QhdsDirectionLink
          direction="down"
          href={`${sourceInventoryPath}${sourceRecordHash(selectedIssue.sourceId)}`}
        >
          Open source record
        </QhdsDirectionLink>
        {reviewActionPath ? (
          <QhdsDirectionLink direction="right" href={reviewActionPath}>
            Continue to review actions
          </QhdsDirectionLink>
        ) : null}
      </div>
    </section>
  );
}

function sourceRecordHash(sourceId: string): string {
  return `#source-${sourceId}-accordion-button`;
}

function SourceBlockerIssueTable({
  issues,
  selectedIssueId
}: Readonly<{
  issues: SourceBlockerIssue[];
  selectedIssueId: string | null;
}>): ReactElement {
  const columns: QhdsTableColumn[] = [
    { dataLabel: "Issue", header: "Issue", key: "issue" },
    { dataLabel: "Source", header: "Source", key: "source" },
    { dataLabel: "Freshness", header: "Freshness", key: "freshness" },
    { dataLabel: "Owner", header: "Owner", key: "owner" },
    { dataLabel: "Selection", header: "Selection", key: "selection" }
  ];
  const rows: QhdsTableRow[] = issues.map((issue) => ({
    freshness: issue.sourceFreshness,
    id: issue.id,
    issue: (
      <span className="evidence-workbench-source-review__table-cell">
        <strong>{issueLabel(issue)}</strong>
        <span>{issue.warningMessage}</span>
      </span>
    ),
    owner: issue.ownerLabel,
    selection: issue.id === selectedIssueId ? "Selected for action" : "Available",
    source: (
      <span className="evidence-workbench-source-review__table-cell">
        <strong>{issue.sourceId}</strong>
        <span>{issue.sourceTitle}</span>
      </span>
    )
  }));

  return (
    <div className="evidence-workbench-source-review__issue-table">
      <QhdsTable
        caption="Source blocker issues"
        captionDescription="Source issue, source record, freshness and local action selection."
        columns={columns}
        rows={rows}
        striped
      />
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
