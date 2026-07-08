import { EvidenceWorkbenchClient } from "../../components/evidence/EvidenceWorkbenchClient";
import { getEvidenceWorkbenchData } from "@aivis/services/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EvidenceWorkbenchPage() {
  const data = await getEvidenceWorkbenchData();

  return <EvidenceWorkbenchClient data={data} />;
}
