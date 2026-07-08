import { EvidenceWorkbenchClient } from "../../../components/evidence/EvidenceWorkbenchClient";
import { getEvidenceWorkbenchData } from "../../../services/EvidenceWorkbenchBackendService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EvidenceWorkbenchAuditPage() {
  const data = await getEvidenceWorkbenchData();

  return <EvidenceWorkbenchClient activeView="audit" data={data} />;
}
