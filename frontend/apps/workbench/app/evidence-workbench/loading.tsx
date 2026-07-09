import { AivisEvidenceStatus } from "../../components/evidence/AivisEvidence";

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
        <AivisEvidenceStatus tone="neutral">Loading review task</AivisEvidenceStatus>
      </div>
    </header>
  );
}
