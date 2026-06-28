import { WorkbenchCaseBar } from "../../containers/evidence-workbench/workbench-case-bar";

export default function EvidenceWorkbenchLoading() {
  return (
    <section
      aria-labelledby="evidence-workbench-title"
      className="qld__body qld__body--light evidence-workbench"
    >
      <WorkbenchCaseBar
        blockerCount={0}
        caseTitle="Loading local fixture evidence for review"
        dataSource="Loading fixture"
        fixtureMode="Synthetic fixture"
        generatedAt="Loading"
        runtimeMode="Local fixture"
        status="Loading"
      />
    </section>
  );
}
