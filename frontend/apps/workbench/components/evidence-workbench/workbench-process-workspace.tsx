import type { ReactElement } from "react";

import {
  AivisEvidencePanelHeader,
  AivisEvidenceWarningList,
  QhdsContentSection
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import { EvidenceProcessMap } from "./evidence-process-map";
import type { ReviewDecisionState } from "./review-action-state";

interface WorkbenchProcessWorkspaceProps {
  data: EvidenceWorkbenchViewModel;
  decisionState: ReviewDecisionState;
}

export function WorkbenchProcessWorkspace({
  data,
  decisionState
}: Readonly<WorkbenchProcessWorkspaceProps>): ReactElement {
  return (
    <QhdsContentSection
      className="evidence-workbench-panel evidence-workbench-process-map-section"
      heading="Evidence process map"
      headingId="process-map-title"
      lead="Interactive graph view of the selected evidence gap, warning path and review action."
      leadDensity="compact"
      withBodyClass={false}
    >
      <AivisEvidencePanelHeader
        label="React Flow graph"
        status="Local fixture"
      />
      <EvidenceProcessMap graph={data.graph} />
      <AivisEvidenceWarningList
        ariaLabel="Active fixture warnings"
        warnings={decisionState.warnings.map((warning) => ({
          id: warning.id,
          message: warning.message,
          severity: warning.severity
        }))}
      />
    </QhdsContentSection>
  );
}
