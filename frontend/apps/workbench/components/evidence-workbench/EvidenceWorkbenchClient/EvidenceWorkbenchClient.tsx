"use client";

import { useMemo, useReducer, useState } from "react";

import type { EvidenceWorkbenchViewModel } from "../../../services/evidence-workbench/types";
import { EvidenceWorkbenchTaskHeader } from "../EvidenceWorkbenchTaskHeader";
import type { EvidenceWorkbenchView } from "../routeModel";
import {
  createInitialReviewDecisionState,
  reviewDecisionReducer
} from "../state/reviewDecisionState";
import { summaryMap } from "../viewFormatters";
import { OverviewWorkspace } from "../overview/OverviewWorkspace";
import { ReviewWorkspace } from "../review/ReviewWorkspace";
import {
  buildSourceBlockerIssues,
  selectedSourceIssue
} from "../sources/SourcesBlockerTarget";
import { SourcesWorkspace } from "../sources/SourcesWorkspace";
import { ProcessWorkspace } from "../process/ProcessWorkspace";
import { WorkbenchAuditWorkspace } from "../workbench-audit-workspace";

export function EvidenceWorkbenchClient({
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
    <>
      <EvidenceWorkbenchTaskHeader activeView={activeView} review={review} />

      {activeView === "overview" ? (
        <OverviewWorkspace
          data={data}
          decisionState={decisionState}
          summary={summary}
        />
      ) : null}

      {activeView === "review" ? (
        <ReviewWorkspace
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
        <SourcesWorkspace
          data={data}
          onSelectIssue={setSelectedSourceIssueId}
          selectedClaimId={review.selectedClaimId}
          selectedIssue={selectedIssue}
          sourceBlockerIssues={sourceBlockerIssues}
        />
      ) : null}

      {activeView === "process" ? (
        <ProcessWorkspace data={data} decisionState={decisionState} />
      ) : null}

      {activeView === "audit" ? (
        <WorkbenchAuditWorkspace
          data={data}
          decisionState={decisionState}
          onReset={resetReviewState}
          selectedIssue={selectedIssue}
        />
      ) : null}
    </>
  );
}
