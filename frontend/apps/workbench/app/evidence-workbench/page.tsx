import { EvidenceWorkbenchClient } from "../../components/evidence/EvidenceWorkbenchClient";
import { getEvidenceWorkbenchData } from "../../services/EvidenceWorkbenchBackendService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EvidenceWorkbenchPage() {
  const data = await getEvidenceWorkbenchData();

  return <EvidenceWorkbenchClient data={data} />;
}
