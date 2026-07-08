import { EvidenceWorkbenchClient } from "../../../components/evidence/EvidenceWorkbenchClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function EvidenceWorkbenchReviewPage() {
  return <EvidenceWorkbenchClient activeView="review" />;
}
