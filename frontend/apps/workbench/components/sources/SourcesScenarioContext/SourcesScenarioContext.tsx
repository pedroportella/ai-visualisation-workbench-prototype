import type { ReactElement } from "react";

import { AivisEvidenceContextAnchors } from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "@aivis/services";

export function SourcesScenarioContext({
  data
}: Readonly<{ data: EvidenceWorkbenchViewModel }>): ReactElement {
  return (
    <div className="evidence-workbench-scenario-context">
      <h3>{data.context.title}</h3>
      <AivisEvidenceContextAnchors
        anchorSummary="Place labels only; they are not treated as evidence sources."
        anchors={data.context.anchors.map((anchor) => ({
          description: anchor.supportingText,
          id: anchor.id,
          label: anchor.label,
          meta: "Context only"
        }))}
        dateLabel={`Planned fixture travel date: ${data.context.plannedTravelDate}`}
        summary={data.context.question}
      />
    </div>
  );
}
