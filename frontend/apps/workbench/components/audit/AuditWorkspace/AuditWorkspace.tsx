import type { ReactElement } from "react";

import { QhdsAccordion } from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "@aivis/services";
import { AuditResetBoundary } from "../AuditResetBoundary";
import { AuditSummary } from "../AuditSummary";
import type { ReviewDecisionState } from "../../state/reviewDecisionState";
import type { SourceBlockerIssue } from "../../sources/SourcesBlockerTarget";
import {
  WarningOwnershipDetail,
  WarningOwnershipSummary
} from "../../warnings/WarningOwnershipSummary";

interface AuditWorkspaceProps {
  data: EvidenceWorkbenchViewModel;
  decisionState: ReviewDecisionState;
  onReset: () => void;
  selectedIssue: SourceBlockerIssue | null;
}

export function AuditWorkspace({
  data,
  decisionState,
  onReset,
  selectedIssue
}: Readonly<AuditWorkspaceProps>): ReactElement {
  return (
    <div className="evidence-workbench-audit-accordion">
      <QhdsAccordion
        headingLevel={2}
        items={[
          {
            content: (
              <AuditSummary
                decisionState={decisionState}
                selectedIssue={selectedIssue}
              />
            ),
            defaultOpen: true,
            id: "audit-summary",
            title: "Audit summary"
          },
          {
            content: <AuditResetBoundary onReset={onReset} />,
            id: "audit-reset-boundary",
            title: "Reset boundary"
          },
          {
            content: (
              <AuditWarningOwnership
                data={data}
                decisionState={decisionState}
              />
            ),
            id: "audit-warning-ownership",
            title: "Audit warning ownership"
          }
        ]}
      />
    </div>
  );
}

function AuditWarningOwnership({
  data,
  decisionState
}: Readonly<
  Pick<AuditWorkspaceProps, "data" | "decisionState">
>): ReactElement {
  return (
    <div className="evidence-workbench-supporting-evidence evidence-workbench-warning-ownership">
      <div className="evidence-workbench-supporting-evidence__section evidence-workbench-warning-ownership__summary">
        <WarningOwnershipSummary
          blockedWarningIds={decisionState.review.blockedByWarningIds}
          heading="Audit warning ownership"
          sourceItems={data.sourceItems}
          summary="Audit records local action state. Warning messages are supporting evidence and remain owned by Source evidence."
          warnings={decisionState.warnings}
        />
      </div>
      <QhdsAccordion
        headingLevel={3}
        items={[
          {
            content: (
              <WarningOwnershipDetail
                heading="Audit warning ownership"
                warnings={decisionState.warnings}
              />
            ),
            id: "audit-supporting-warning-detail",
            title: "Supporting warning detail"
          }
        ]}
      />
    </div>
  );
}
