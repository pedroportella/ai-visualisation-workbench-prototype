import "server-only";

import { NextResponse } from "next/server";

import { getEvidenceWorkbenchData } from "../../../../services/EvidenceWorkbenchBackendService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const data = await getEvidenceWorkbenchData();

  return NextResponse.json(data, {
    headers: {
      "cache-control": "no-store"
    }
  });
}
