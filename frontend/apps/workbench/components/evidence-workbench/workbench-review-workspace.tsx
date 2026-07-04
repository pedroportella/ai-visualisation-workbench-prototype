import type { ReactElement } from "react";

import {
  AivisEvidencePanelHeader,
  AivisEvidenceWarningList,
  QhdsCol,
  QhdsContentSection,
  QhdsRow
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import { AnswerMarkdown } from "./answer-markdown";
import { ClaimsReviewSection } from "./claims-review-section";
import { SOURCE_INVENTORY_ROUTE } from "./evidence-workbench-routes";
import type { ReviewDecisionBarProps } from "./review-decision-bar";
import type { ReviewDecisionState } from "./review-action-state";
import { ReviewDecisionBar } from "./review-decision-bar";
import {
  SelectedSourceInspector,
  selectedSourceWarnings
} from "./selected-source-inspector";
import type { SourceBlockerIssue } from "./source-blocker-review";
import { SourceBlockerReview } from "./source-blocker-review";
import { WorkbenchRouteCards } from "./workbench-route-cards";

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
  const selectedSources = data.sourceItems.filter((source) => source.isSelectedClaimSource);
  const selectedClaimTopWarning = selectedSourceWarnings(selectedSources).find(
    (warning) => warning.blocksApproval
  );

  return (
    <>
      <QhdsRow className="evidence-workbench-grid evidence-workbench-primary-frame">
        <QhdsCol lg={7} xl={7}>
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
            {selectedClaimTopWarning ? (
              <section
                aria-label={`${review.selectedClaimId} selected blocker`}
                className="evidence-workbench-selected-claim-warning"
              >
                <h3>{review.selectedClaimId} selected blocker</h3>
                <AivisEvidenceWarningList
                  ariaLabel={`${review.selectedClaimId} selected blocker detail`}
                  warnings={[
                    {
                      id: selectedClaimTopWarning.id,
                      impact: selectedClaimTopWarning.evidenceImpact,
                      message: selectedClaimTopWarning.message,
                      severity: `${selectedClaimTopWarning.severity}${
                        selectedClaimTopWarning.blocksApproval ? " approval blocker" : " review note"
                      }`
                    }
                  ]}
                />
                <p>
                  <a href="#selected-claim-sources">
                    Review the selected source inspector for linked evidence.
                  </a>
                </p>
              </section>
            ) : null}
          </QhdsContentSection>
        </QhdsCol>

        <QhdsCol lg={5} xl={5}>
          <QhdsContentSection
            className="evidence-workbench-panel evidence-workbench-source-inspector-section"
            heading="Source inspector"
            headingId="source-inspector-title"
            lead="Focused source evidence for the selected claim."
            leadDensity="compact"
            withBodyClass={false}
          >
            <SelectedSourceInspector
              selectedClaim={selectedClaim}
              selectedClaimId={review.selectedClaimId}
              sourceInventoryPath={SOURCE_INVENTORY_ROUTE}
              sources={data.sourceItems}
            />
          </QhdsContentSection>
        </QhdsCol>
      </QhdsRow>

      <QhdsContentSection
        className="evidence-workbench-panel evidence-workbench-source-review-section"
        heading="Source issue review"
        headingId="source-issue-review-title"
        lead="Inspect the blocker that the next local action will target."
        leadDensity="compact"
        withBodyClass={false}
      >
        <SourceBlockerReview
          issues={sourceBlockerIssues}
          onSelectIssue={onSelectIssue}
          selectedIssueId={selectedIssue?.id ?? null}
          sourceInventoryPath={SOURCE_INVENTORY_ROUTE}
        />
      </QhdsContentSection>

      <ReviewDecisionBar
        onApplyAction={onApplyAction}
        onReset={onReset}
        selectedIssue={selectedIssue}
        state={decisionState}
      />

      <ClaimsReviewSection data={data} selectedClaimId={review.selectedClaimId} />
      <WorkbenchRouteCards />
    </>
  );
}
