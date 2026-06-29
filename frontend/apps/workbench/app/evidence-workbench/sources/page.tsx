import EvidenceWorkbenchContainer from "../../../containers/evidence-workbench/evidence-workbench-container";
import { getEvidenceWorkbenchData } from "../../../services/evidence-workbench/backend-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EvidenceWorkbenchSourcesPage() {
  const data = await getEvidenceWorkbenchData();

  return <EvidenceWorkbenchContainer activeView="sources" data={data} />;
}
