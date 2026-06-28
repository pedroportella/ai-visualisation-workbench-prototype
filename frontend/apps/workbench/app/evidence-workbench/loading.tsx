import { QhdsPageHeader, QhdsSummaryList } from "@aivis/ui-library";

export default function EvidenceWorkbenchLoading() {
  return (
    <section
      aria-labelledby="evidence-workbench-title"
      className="evidence-workbench"
    >
      <QhdsPageHeader
        aside={
          <QhdsSummaryList
            ariaLabel="Workbench status"
            items={[{ description: "Loading fixture", term: "Data source" }]}
          />
        }
        heading="Evidence Workbench"
        headingId="evidence-workbench-title"
        lead="Loading local fixture evidence for review."
      />
    </section>
  );
}
