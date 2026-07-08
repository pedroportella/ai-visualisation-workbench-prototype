import type { ReactElement, ReactNode } from "react";

import {
  AivisEvidencePanelHeader,
  QhdsAccordion
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../../services/EvidenceWorkbenchTypes";
import { AnswerMarkdown } from "../../answer/AnswerMarkdownRenderer";
import { SOURCE_INVENTORY_ROUTE } from "../../shared/routeModel";
import type { ReviewDecisionState } from "../../state/reviewDecisionState";
import type { SourceBlockerIssue } from "../../sources/SourcesBlockerTarget";
import { ReviewActionForm, type ReviewActionFormProps } from "../ReviewActionForm";
import { ReviewBlockerSelector } from "../ReviewBlockerSelector";
import { ReviewDecisionGate } from "../ReviewDecisionGate";
import { ReviewSupportingEvidence } from "../ReviewSupportingEvidence";

interface ReviewWorkspaceProps {
  data: EvidenceWorkbenchViewModel;
  decisionState: ReviewDecisionState;
  onApplyAction: ReviewActionFormProps["onApplyAction"];
  onReset: () => void;
  onSelectIssue: (issueId: string) => void;
  selectedIssue: SourceBlockerIssue | null;
  sourceBlockerIssues: SourceBlockerIssue[];
}

export function ReviewWorkspace({
  data,
  decisionState,
  onApplyAction,
  onReset,
  onSelectIssue,
  selectedIssue,
  sourceBlockerIssues
}: Readonly<ReviewWorkspaceProps>): ReactElement {
  const review = decisionState.review;

  return (
    <>
      <ReviewDecisionGate review={review} selectedIssue={selectedIssue} />

      <div className="evidence-workbench-review-accordion">
        <QhdsAccordion
          headingLevel={2}
          items={[
            {
              content: (
                <ReviewAccordionPanel
                  className="evidence-workbench-current-blocker-section"
                  lead="The next review action will target this blocker."
                >
                  <ReviewBlockerSelector
                    issues={sourceBlockerIssues}
                    onSelectIssue={onSelectIssue}
                    selectedIssue={selectedIssue}
                  />
                </ReviewAccordionPanel>
              ),
              id: "review-current-blocker",
              title: "Current blocker"
            },
            {
              content: (
                <ReviewAccordionPanel lead={data.answer.summary}>
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
                </ReviewAccordionPanel>
              ),
              id: "review-answer",
              title: "Draft answer"
            },
            {
              content: (
                <ReviewAccordionPanel
                  className="evidence-workbench-supporting-evidence-section"
                  lead="Open this when you need the source, claim and citation detail behind the decision."
                >
                  <ReviewSupportingEvidence
                    data={data}
                    selectedClaimId={review.selectedClaimId}
                  />
                </ReviewAccordionPanel>
              ),
              id: "review-supporting-evidence",
              title: "Supporting evidence"
            },
            {
              content: (
                <ReviewActionForm
                  flow="decision"
                  labelledBy="review-take-action-accordion-button"
                  onApplyAction={onApplyAction}
                  onReset={onReset}
                  selectedIssue={selectedIssue}
                  state={decisionState}
                />
              ),
              id: "review-take-action",
              title: "Take action"
            }
          ]}
        />
      </div>
    </>
  );
}

function ReviewAccordionPanel({
  children,
  className,
  lead
}: Readonly<{
  children: ReactNode;
  className?: string;
  lead?: ReactNode;
}>): ReactElement {
  const classes = [
    "evidence-workbench-panel",
    "evidence-workbench-review-accordion__panel",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {lead ? (
        <p className="qhds-content-section__lead qhds-content-section__lead--compact">
          {lead}
        </p>
      ) : null}
      {children}
    </div>
  );
}
