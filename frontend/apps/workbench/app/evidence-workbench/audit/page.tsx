import { EvidenceWorkbenchClient } from "../../../components/evidence/EvidenceWorkbenchClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function EvidenceWorkbenchAuditPage() {
  return <EvidenceWorkbenchClient activeView="audit" />;
}
