import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import {
  EvidenceWorkbenchBackendRequestError,
  recordEvidenceWorkbenchReviewAction
} from "../../../../services/EvidenceWorkbenchBackendService";
import type { EvidenceWorkbenchReviewActionMutationRequest } from "../../../../services/EvidenceWorkbenchTypes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await parseBody(request);
  const reviewActionRequest = parseReviewActionRequest(body);

  if (!reviewActionRequest) {
    return NextResponse.json(
      {
        message: "Choose a review action and add a reviewer note before recording."
      },
      { status: 400 }
    );
  }

  try {
    const result = await recordEvidenceWorkbenchReviewAction(reviewActionRequest);

    return NextResponse.json(result, {
      headers: {
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    const statusCode =
      error instanceof EvidenceWorkbenchBackendRequestError ? error.statusCode : 502;
    const message =
      error instanceof Error
        ? error.message
        : "Review action could not be recorded by the backend fixture.";

    return NextResponse.json({ message }, { status: statusCode });
  }
}

async function parseBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function parseReviewActionRequest(
  body: unknown
): EvidenceWorkbenchReviewActionMutationRequest | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const source = body as Record<string, unknown>;
  const reviewActionId = textValue(source.reviewActionId);
  const reviewerNote = textValue(source.reviewerNote);

  if (!reviewActionId || !reviewerNote) {
    return null;
  }

  return {
    answerId: textValue(source.answerId) || undefined,
    reviewActionId,
    reviewerNote,
    reviewStateId: textValue(source.reviewStateId) || undefined,
    selectedClaimId: textValue(source.selectedClaimId) || undefined
  };
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
