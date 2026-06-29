import { AivisEvidenceStatus, type AivisEvidenceTone } from "@aivis/ui-library";

export interface WorkbenchCaseBarProps {
  blockerCount: number;
  caseTitle: string;
  dataSource: string;
  fixtureMode: string;
  generatedAt: string;
  runtimeMode: string;
  status: string;
}

export function WorkbenchCaseBar({
  blockerCount,
  caseTitle,
  dataSource,
  fixtureMode,
  generatedAt,
  runtimeMode,
  status
}: WorkbenchCaseBarProps) {
  return (
    <header className="evidence-workbench-case-bar">
      <div className="evidence-workbench-case-bar__identity">
        <p className="evidence-workbench-case-bar__label">Review case</p>
        <h1 className="evidence-workbench-case-bar__heading" id="evidence-workbench-title">
          Evidence Workbench
        </h1>
        <p className="evidence-workbench-case-bar__case-title">{caseTitle}</p>
      </div>

      <div aria-label="Case decision status" className="evidence-workbench-case-bar__status">
        <AivisEvidenceStatus tone={statusTone(status)}>{status}</AivisEvidenceStatus>
        <AivisEvidenceStatus tone={blockerCount > 0 ? "warning" : "success"}>
          {blockerCount} approval {blockerCount === 1 ? "blocker" : "blockers"}
        </AivisEvidenceStatus>
      </div>

      <dl aria-label="Case metadata" className="evidence-workbench-case-bar__meta">
        <div>
          <dt>Generated</dt>
          <dd>{generatedAt}</dd>
        </div>
        <div>
          <dt>Fixture mode</dt>
          <dd>{fixtureMode} / {dataSource}</dd>
        </div>
        <div>
          <dt>Runtime</dt>
          <dd>{runtimeMode}</dd>
        </div>
      </dl>
    </header>
  );
}

function statusTone(status: string): AivisEvidenceTone {
  return /needs|blocked|review|loading|update|unsafe|escalat/i.test(status)
    ? "warning"
    : "success";
}
