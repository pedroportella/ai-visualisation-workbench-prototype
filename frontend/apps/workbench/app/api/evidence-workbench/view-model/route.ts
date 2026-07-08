import "server-only";

import { NextResponse } from "next/server";

import { getEvidenceWorkbenchData } from "@aivis/services/server";

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
