import type { ReactElement } from "react";

import {
  AivisEvidenceContextAnchors,
  QhdsContentSection
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";

export function ScenarioContextSection({
  data
}: Readonly<{ data: EvidenceWorkbenchViewModel }>): ReactElement {
  return (
    <QhdsContentSection
      className="evidence-workbench-panel evidence-workbench-context-section"
      heading={data.context.title}
      headingId="scenario-title"
      headingLevel={3}
      lead="Local review case"
      leadDensity="compact"
      withBodyClass={false}
    >
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
    </QhdsContentSection>
  );
}
