"use client";

import { useMemo, useReducer, useState } from "react";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import { summaryMap } from "./evidence-workbench-formatters";
import type { EvidenceWorkbenchView } from "./evidence-workbench-routes";
import { WorkbenchAuditWorkspace } from "./workbench-audit-workspace";
import { WorkbenchMobileSectionNav } from "./workbench-section-nav";
import { WorkbenchOverview } from "./workbench-overview";
import { WorkbenchProcessWorkspace } from "./workbench-process-workspace";
import { WorkbenchReviewWorkspace } from "./workbench-review-workspace";
import { WorkbenchSourcesWorkspace } from "./workbench-sources-workspace";
import { WorkbenchViewIntro } from "./workbench-view-intro";
import {
  createInitialReviewDecisionState,
  reviewDecisionReducer
} from "./review-action-state";
import {
  buildSourceBlockerIssues,
  selectedSourceIssue
} from "./source-blocker-review";

export default function EvidenceWorkbenchContainer({
  activeView = "overview",
  data
}: Readonly<{
  activeView?: EvidenceWorkbenchView;
  data: EvidenceWorkbenchViewModel;
}>) {
  const summary = summaryMap(data);
  const initialDecisionState = useMemo(() => createInitialReviewDecisionState(data), [data]);
  const [decisionState, dispatchReviewDecision] = useReducer(
    reviewDecisionReducer,
    initialDecisionState
  );
  const review = decisionState.review;
  const sourceBlockerIssues = useMemo(
    () => buildSourceBlockerIssues(data.sourceItems),
    [data.sourceItems]
  );
  const initialSourceIssueId = sourceBlockerIssues[0]?.id ?? null;
  const [selectedSourceIssueId, setSelectedSourceIssueId] = useState(initialSourceIssueId);
  const selectedIssue = selectedSourceIssue(sourceBlockerIssues, selectedSourceIssueId);
  const applyReviewAction = (actionId: string, reviewerNote: string) =>
    dispatchReviewDecision({
      actionId,
      reviewerNote,
      targetIssue: selectedIssue,
      type: "apply-action"
    });
  const resetReviewState = () => {
    dispatchReviewDecision({ type: "reset" });
    setSelectedSourceIssueId(initialSourceIssueId);
  };

  return (
    <section
      aria-labelledby="evidence-workbench-title"
      className="qld__body qld__body--light evidence-workbench"
      data-workbench-view={activeView}
    >
      <WorkbenchViewIntro activeView={activeView} data={data} review={review} />

      <WorkbenchMobileSectionNav activeView={activeView} />

      {activeView === "overview" ? (
        <WorkbenchOverview
          data={data}
          decisionState={decisionState}
          summary={summary}
        />
      ) : null}

      {activeView === "review" ? (
        <WorkbenchReviewWorkspace
          data={data}
          decisionState={decisionState}
          onApplyAction={applyReviewAction}
          onReset={resetReviewState}
          onSelectIssue={setSelectedSourceIssueId}
          selectedIssue={selectedIssue}
          sourceBlockerIssues={sourceBlockerIssues}
        />
      ) : null}

      {activeView === "sources" ? (
        <WorkbenchSourcesWorkspace
          data={data}
          onSelectIssue={setSelectedSourceIssueId}
          selectedClaimId={review.selectedClaimId}
          selectedIssue={selectedIssue}
          sourceBlockerIssues={sourceBlockerIssues}
        />
      ) : null}

      {activeView === "process" ? (
        <WorkbenchProcessWorkspace data={data} decisionState={decisionState} />
      ) : null}

      {activeView === "audit" ? (
        <WorkbenchAuditWorkspace
          decisionState={decisionState}
          onApplyAction={applyReviewAction}
          onReset={resetReviewState}
          selectedIssue={selectedIssue}
        />
      ) : null}
    </section>
  );
}
