"use client";

import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import type {
  EvidenceWorkbenchReviewActionMutationRequest,
  EvidenceWorkbenchReviewActionMutationResult,
  EvidenceWorkbenchSummaryItem,
  EvidenceWorkbenchViewModel
} from "@aivis/services";

export const EVIDENCE_WORKBENCH_VIEW_MODEL_API_ROUTE =
  "/api/evidence-workbench/view-model";
export const EVIDENCE_WORKBENCH_REVIEW_ACTIONS_API_ROUTE =
  "/api/evidence-workbench/review-actions";
export const EVIDENCE_WORKBENCH_VIEW_MODEL_QUERY_KEY = [
  "evidence-workbench",
  "view-model"
] as const;

export function useEvidenceWorkbenchViewModel(
  initialData: EvidenceWorkbenchViewModel
) {
  return useQuery({
    initialData,
    queryFn: fetchEvidenceWorkbenchViewModel,
    queryKey: EVIDENCE_WORKBENCH_VIEW_MODEL_QUERY_KEY
  });
}

export function useEvidenceWorkbenchReviewActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordReviewAction,
    onSuccess: (result) => {
      queryClient.setQueryData<EvidenceWorkbenchViewModel>(
        EVIDENCE_WORKBENCH_VIEW_MODEL_QUERY_KEY,
        (currentData) =>
          currentData ? applyReviewActionResult(currentData, result) : currentData
      );
    }
  });
}

export function applyReviewActionResult(
  data: EvidenceWorkbenchViewModel,
  result: EvidenceWorkbenchReviewActionMutationResult
): EvidenceWorkbenchViewModel {
  return {
    ...data,
    audit: result.audit,
    fetchState: result.fetchState,
    review: result.review,
    summary: updateReviewSummary(data.summary, result.review.status),
    warnings: result.warnings
  };
}

async function fetchEvidenceWorkbenchViewModel(): Promise<EvidenceWorkbenchViewModel> {
  const response = await fetch(EVIDENCE_WORKBENCH_VIEW_MODEL_API_ROUTE, {
    cache: "no-store",
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Evidence data could not be refreshed.");
  }

  return (await response.json()) as EvidenceWorkbenchViewModel;
}

async function recordReviewAction(
  request: EvidenceWorkbenchReviewActionMutationRequest
): Promise<EvidenceWorkbenchReviewActionMutationResult> {
  const response = await fetch(EVIDENCE_WORKBENCH_REVIEW_ACTIONS_API_ROUTE, {
    method: "POST",
    cache: "no-store",
    headers: {
      accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(await responseMessage(response));
  }

  return (await response.json()) as EvidenceWorkbenchReviewActionMutationResult;
}

async function responseMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };

    return body.message ?? "Review action could not be recorded.";
  } catch {
    return "Review action could not be recorded.";
  }
}

function updateReviewSummary(
  summary: EvidenceWorkbenchSummaryItem[],
  reviewStatus: string
): EvidenceWorkbenchSummaryItem[] {
  return summary.map((item) => {
    if (item.label === "Data source") {
      return {
        ...item,
        value: "Backend fixture"
      };
    }

    if (item.label === "Review state") {
      return {
        ...item,
        value: reviewStatus
      };
    }

    return item;
  });
}
