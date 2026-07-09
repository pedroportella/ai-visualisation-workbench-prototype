import { EvidenceWorkbenchStatus } from "../../components/evidence/EvidenceWorkbenchAdapters";

export default function EvidenceWorkbenchLoading() {
  return (
    <header className="workbench-task-header">
      <h1 className="workbench-task-header__heading" id="evidence-workbench-title">
        Evidence Workbench
      </h1>
      <div
        aria-label="Review task state"
        className="workbench-task-header__status"
      >
        <EvidenceWorkbenchStatus tone="neutral">Loading review task</EvidenceWorkbenchStatus>
      </div>
    </header>
  );
}
