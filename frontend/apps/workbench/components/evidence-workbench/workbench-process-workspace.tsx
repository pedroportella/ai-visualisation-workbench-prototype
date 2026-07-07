import type { ReactElement } from "react";

import {
  AivisEvidencePanelHeader,
  QhdsContentSection
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import { EvidenceProcessMap } from "./evidence-process-map";
import type { ReviewDecisionState } from "./state/reviewDecisionState";
import {
  WorkbenchWarningOwnershipDetail,
  WorkbenchWarningOwnershipSummary
} from "./workbench-warning-ownership";

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
      lead="Trace how the selected question, source evidence, warning path and local action connect."
      leadDensity="compact"
      withBodyClass={false}
    >
      <AivisEvidencePanelHeader
        label="React Flow graph"
        status="Local fixture"
      />
      <EvidenceProcessMap
        graph={data.graph}
        supportingEvidence={
          <div className="evidence-workbench-warning-ownership__content">
            <WorkbenchWarningOwnershipSummary
              blockedWarningIds={decisionState.review.blockedByWarningIds}
              heading="Process warning ownership"
              sourceItems={data.sourceItems}
              summary="The map explains how the evidence path happened. Warning records stay owned by Source evidence."
              warnings={decisionState.warnings}
            />
            <WorkbenchWarningOwnershipDetail
              heading="Process warning ownership"
              warnings={decisionState.warnings}
            />
          </div>
        }
        supportingEvidenceId="process-warning-ownership"
        supportingEvidenceTitle="Process warning ownership"
      />
    </QhdsContentSection>
  );
}
