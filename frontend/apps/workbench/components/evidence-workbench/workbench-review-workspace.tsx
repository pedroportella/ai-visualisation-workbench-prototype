import type { ReactElement } from "react";

import {
  AivisEvidencePanelHeader,
  AivisEvidenceStatus,
  QhdsAccordion,
  QhdsButton,
  QhdsContentSection,
  QhdsRadioGroup,
  QhdsSummaryList
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import { AnswerMarkdown } from "./answer-markdown";
import { ClaimsReviewSection } from "./claims-review-section";
import { SOURCE_INVENTORY_ROUTE } from "./evidence-workbench-routes";
import type { ReviewDecisionBarProps } from "./review-decision-bar";
import type { ReviewDecisionState } from "./review-action-state";
import { ReviewDecisionBar } from "./review-decision-bar";
import { SelectedSourceInspector } from "./selected-source-inspector";
import type { SourceBlockerIssue } from "./source-blocker-review";

interface WorkbenchReviewWorkspaceProps {
  data: EvidenceWorkbenchViewModel;
  decisionState: ReviewDecisionState;
  onApplyAction: ReviewDecisionBarProps["onApplyAction"];
  onReset: () => void;
  onSelectIssue: (issueId: string) => void;
  selectedIssue: SourceBlockerIssue | null;
  sourceBlockerIssues: SourceBlockerIssue[];
}

export function WorkbenchReviewWorkspace({
  data,
  decisionState,
  onApplyAction,
  onReset,
  onSelectIssue,
  selectedIssue,
  sourceBlockerIssues
}: Readonly<WorkbenchReviewWorkspaceProps>): ReactElement {
  const review = decisionState.review;
  const selectedClaim = data.reviewClaims.find(
    (claim) => claim.id === review.selectedClaimId
  );
  const selectedBlockerLabel = selectedIssue
    ? `${selectedIssue.warningId}: ${selectedIssue.warningMessage}`
    : "No source blocker is selected.";

  return (
    <>
      <QhdsContentSection
        className="evidence-workbench-panel evidence-workbench-review-decision-section"
        heading="Decision required"
        headingId="review-decision-required-title"
        lead="Start here: decide what must happen before this answer can be copied or approved."
        leadDensity="compact"
        withBodyClass={false}
      >
        <div className="evidence-workbench-review-decision-card">
          <AivisEvidencePanelHeader
            label="Current decision"
            status={review.copyState === "enabled" ? "Ready to copy" : "Do not use yet"}
            statusTone={review.copyState === "enabled" ? "success" : "warning"}
          />
          <h3>
            {review.copyState === "enabled"
              ? "This answer can be copied after review."
              : "This answer cannot be used yet."}
          </h3>
          <p>
            {selectedIssue
              ? `${selectedBlockerLabel} is blocking approval. Record a local review action before anyone uses the answer.`
              : "A source blocker must be selected before the next local review action can be recorded."}
          </p>
          <div className="evidence-workbench-review-decision-card__actions">
            <QhdsButton href="#source-issue-review-title">Review blocker</QhdsButton>
            <QhdsButton href="#review-decision-title" variant="secondary">
              Skip to final action
            </QhdsButton>
            <QhdsButton href="#answer-title" variant="tertiary">
              Read draft answer
            </QhdsButton>
          </div>
        </div>
      </QhdsContentSection>

      <QhdsContentSection
        className="evidence-workbench-panel evidence-workbench-current-blocker-section"
        heading="Current blocker"
        headingId="source-issue-review-title"
        lead="The next review action will target this blocker."
        leadDensity="compact"
        withBodyClass={false}
      >
        <ReviewCurrentBlocker
          issues={sourceBlockerIssues}
          onSelectIssue={onSelectIssue}
          selectedIssue={selectedIssue}
        />
      </QhdsContentSection>

      <QhdsContentSection
        className="evidence-workbench-panel"
        heading="Draft answer"
        headingId="answer-title"
        lead={data.answer.summary}
        leadDensity="compact"
        withBodyClass={false}
      >
        <AivisEvidencePanelHeader
          label="Draft answer"
          status={data.answer.status}
          statusTone="warning"
        />
        <p className="evidence-workbench-answer-meta">
          Fixture timestamp: {data.answer.generatedAt}
        </p>
        <AnswerMarkdown
          citations={data.citations}
          markdown={data.answer.markdown}
          selectedClaimId={review.selectedClaimId}
          sourceInventoryPath={SOURCE_INVENTORY_ROUTE}
        />
      </QhdsContentSection>

      <QhdsContentSection
        className="evidence-workbench-panel evidence-workbench-supporting-evidence-section"
        heading="Supporting evidence"
        headingId="supporting-evidence-title"
        lead="Open this when you need the source, claim and citation detail behind the decision."
        leadDensity="compact"
        withBodyClass={false}
      >
        <div className="evidence-workbench-supporting-evidence">
          <QhdsAccordion
            headingLevel={3}
            items={[
              {
                content: (
                  <section
                    aria-labelledby="source-inspector-title"
                    className="evidence-workbench-supporting-evidence__section"
                  >
                    <h3 id="source-inspector-title">Source inspector</h3>
                    <p>Focused source evidence for the selected claim.</p>
                    <SelectedSourceInspector
                      selectedClaim={selectedClaim}
                      selectedClaimId={review.selectedClaimId}
                      sourceInventoryPath={SOURCE_INVENTORY_ROUTE}
                      sources={data.sourceItems}
                    />
                  </section>
                ),
                id: "review-source-inspector",
                title: "Source inspector"
              },
              {
                content: (
                  <ClaimsReviewSection
                    asPanel
                    data={data}
                    selectedClaimId={review.selectedClaimId}
                  />
                ),
                id: "review-claims",
                title: "Claims requiring review"
              }
            ]}
          />
        </div>
      </QhdsContentSection>

      <ReviewDecisionBar
        flow="decision"
        onApplyAction={onApplyAction}
        onReset={onReset}
        selectedIssue={selectedIssue}
        state={decisionState}
      />
    </>
  );
}

function ReviewCurrentBlocker({
  issues,
  onSelectIssue,
  selectedIssue
}: Readonly<{
  issues: SourceBlockerIssue[];
  onSelectIssue: (issueId: string) => void;
  selectedIssue: SourceBlockerIssue | null;
}>): ReactElement {
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
                    className="evidence-workbench-source-review__issue-selector"
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
