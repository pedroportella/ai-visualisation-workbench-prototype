import type { ReactElement } from "react";

import type { EvidenceWorkbenchViewModel } from "../../../../services/evidence-workbench/types";

export function ProcessTextFallback({
  graph
}: Readonly<{
  graph: EvidenceWorkbenchViewModel["graph"];
}>): ReactElement {
  return (
    <div
      aria-label="Text process map"
      className="evidence-workbench-process-map__fallback"
      id="process-map-text-fallback"
      role="region"
      tabIndex={0}
    >
      <p>{graph.accessibleSummary}</p>
      <ol>
        {graph.fallbackSteps.map((step) => (
          <li key={`${step.step}-${step.heading}`}>
            <h4>
              Step {step.step}: {step.heading}
            </h4>
            <p>{step.summary}</p>
            <small>Includes: {step.includeIds.join(", ")}</small>
          </li>
        ))}
      </ol>
    </div>
  );
}
