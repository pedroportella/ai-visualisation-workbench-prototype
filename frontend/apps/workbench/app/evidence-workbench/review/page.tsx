import { EvidenceWorkbenchClient } from "../../../components/evidence/EvidenceWorkbenchClient";
import { getEvidenceWorkbenchData } from "../../../services/evidence-workbench/backend-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EvidenceWorkbenchReviewPage() {
  const data = await getEvidenceWorkbenchData();

  return <EvidenceWorkbenchClient activeView="review" data={data} />;
}
