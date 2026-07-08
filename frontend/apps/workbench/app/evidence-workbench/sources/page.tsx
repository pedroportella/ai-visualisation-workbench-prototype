import { EvidenceWorkbenchClient } from "../../../components/evidence/EvidenceWorkbenchClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function EvidenceWorkbenchSourcesPage() {
  return <EvidenceWorkbenchClient activeView="sources" />;
}
