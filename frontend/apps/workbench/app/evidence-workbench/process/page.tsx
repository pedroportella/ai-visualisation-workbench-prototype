import { EvidenceWorkbenchClient } from "../../../components/evidence-workbench/EvidenceWorkbenchClient";
import { getEvidenceWorkbenchData } from "../../../services/evidence-workbench/backend-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EvidenceWorkbenchProcessPage() {
  const data = await getEvidenceWorkbenchData();

  return <EvidenceWorkbenchClient activeView="process" data={data} />;
}
