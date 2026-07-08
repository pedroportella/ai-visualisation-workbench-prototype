"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";

import type { EvidenceWorkbenchViewModel } from "@aivis/services";
import {
  useEvidenceWorkbenchReviewActionMutation,
  useEvidenceWorkbenchViewModel
} from "../../../services/EvidenceWorkbenchQueryState";
import { EvidenceWorkbenchDataState } from "../EvidenceWorkbenchDataState";
import { EvidenceWorkbenchTaskHeader } from "../EvidenceWorkbenchTaskHeader";
import {
  EvidenceWorkbenchQueryProvider,
  useOptionalEvidenceWorkbenchInitialData
} from "../EvidenceWorkbenchQueryProvider";
import type { EvidenceWorkbenchView } from "../../shared/routeModel";
import {
  createInitialReviewDecisionState,
  reviewDecisionReducer
} from "../../state/reviewDecisionState";
import {
  refreshStateLabel,
  summaryMap
} from "../../shared/viewFormatters";
import { OverviewWorkspace } from "../../overview/OverviewWorkspace";
import { ReviewWorkspace } from "../../review/ReviewWorkspace";
import {
  buildSourceBlockerIssues,
  selectedSourceIssue
} from "../../sources/SourcesBlockerTarget";
import { SourcesWorkspace } from "../../sources/SourcesWorkspace";
import { ProcessWorkspace } from "../../process/ProcessWorkspace";
import { AuditWorkspace } from "../../audit/AuditWorkspace";

export function EvidenceWorkbenchClient({
  activeView = "overview",
  data
}: Readonly<{
  activeView?: EvidenceWorkbenchView;
  data?: EvidenceWorkbenchViewModel;
}>) {
  const shellInitialData = useOptionalEvidenceWorkbenchInitialData();
  const initialData = data ?? shellInitialData;

  if (!initialData) {
    throw new Error("Evidence Workbench initial data is required.");
  }

  const content = (
    <EvidenceWorkbenchClientContent activeView={activeView} data={initialData} />
  );

  return shellInitialData ? (
    content
  ) : (
    <EvidenceWorkbenchQueryProvider initialData={initialData}>
      {content}
    </EvidenceWorkbenchQueryProvider>
  );
}

function EvidenceWorkbenchClientContent({
  activeView = "overview",
  data: initialData
}: Readonly<{
  activeView?: EvidenceWorkbenchView;
  data: EvidenceWorkbenchViewModel;
}>) {
  const viewModelQuery = useEvidenceWorkbenchViewModel(initialData);
  const data = viewModelQuery.data ?? initialData;
  const seededDataRef = useRef(data);
  const reviewActionMutation = useEvidenceWorkbenchReviewActionMutation();
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
  const applyReviewAction = (actionId: string, reviewerNote: string) => {
    if (data.fetchState.source === "backend") {
      reviewActionMutation.mutate({
        reviewActionId: actionId,
        reviewerNote,
        reviewStateId: review.id,
        selectedClaimId: review.selectedClaimId
      });
      return;
    }

    dispatchReviewDecision({
      actionId,
      reviewerNote,
      targetIssue: selectedIssue,
      type: "apply-action"
    });
  };
  const resetReviewState = () => {
    reviewActionMutation.reset();
    dispatchReviewDecision({ type: "reset" });
    setSelectedSourceIssueId(initialSourceIssueId);
  };
  const refreshWorkbenchData = () => {
    void viewModelQuery.refetch();
  };

  useEffect(() => {
    if (seededDataRef.current === data) {
      return;
    }

    seededDataRef.current = data;
    dispatchReviewDecision({ data, type: "replace-seed" });
    setSelectedSourceIssueId(initialSourceIssueId);
  }, [data, initialSourceIssueId]);

  return (
    <>
      <EvidenceWorkbenchTaskHeader
        activeView={activeView}
        review={review}
      />
      <EvidenceWorkbenchDataState
        state={{
          errorMessage: viewModelQuery.error instanceof Error ? viewModelQuery.error.message : null,
          isError: viewModelQuery.isError,
          isRefreshing: viewModelQuery.isFetching,
          onRefresh: refreshWorkbenchData,
          refreshLabel: refreshStateLabel(
            viewModelQuery.dataUpdatedAt,
            viewModelQuery.isFetchedAfterMount
          ),
          source: data.fetchState.source
        }}
      />

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
          reviewActionState={{
            errorMessage:
              reviewActionMutation.error instanceof Error
                ? reviewActionMutation.error.message
                : null,
            isPending: reviewActionMutation.isPending,
            mode: data.fetchState.source,
            successMessage: reviewActionMutation.data?.message ?? null
          }}
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
        <AuditWorkspace
          data={data}
          decisionState={decisionState}
          onReset={resetReviewState}
          selectedIssue={selectedIssue}
        />
      ) : null}
    </>
  );
}
