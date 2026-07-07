import type { ReactElement } from "react";

import {
  QhdsAccordion,
  QhdsButton
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import { AuditSummary } from "./audit-summary";
import { REVIEW_ROUTE } from "./routeModel";
import type { ReviewDecisionState } from "./state/reviewDecisionState";
import type { SourceBlockerIssue } from "./source-blocker-review";
import {
  WorkbenchWarningOwnershipDetail,
  WorkbenchWarningOwnershipSummary
} from "./workbench-warning-ownership";

interface WorkbenchAuditWorkspaceProps {
  data: EvidenceWorkbenchViewModel;
  decisionState: ReviewDecisionState;
  onReset: () => void;
  selectedIssue: SourceBlockerIssue | null;
}

export function WorkbenchAuditWorkspace({
  data,
  decisionState,
  onReset,
  selectedIssue
}: Readonly<WorkbenchAuditWorkspaceProps>): ReactElement {
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

function AuditResetBoundary({
  onReset
}: Readonly<{ onReset: () => void }>): ReactElement {
  return (
    <div className="evidence-workbench-panel evidence-workbench-audit-reset">
      <p className="qhds-content-section__lead qhds-content-section__lead--compact">
        Reset is the only state-changing control on this route.
      </p>
      <div className="evidence-workbench-audit-reset__content">
        <p>
          Audit is read-only local state plus reset. Record or change local
          review actions on the review route.
        </p>
        <div className="evidence-workbench-audit-reset__actions">
          <QhdsButton href={REVIEW_ROUTE} variant="secondary">
            Go to review actions
          </QhdsButton>
          <QhdsButton onClick={onReset} type="button" variant="tertiary">
            Reset local review state
          </QhdsButton>
        </div>
      </div>
    </div>
  );
}

function AuditWarningOwnership({
  data,
  decisionState
}: Readonly<
  Pick<WorkbenchAuditWorkspaceProps, "data" | "decisionState">
>): ReactElement {
  return (
    <div className="evidence-workbench-supporting-evidence evidence-workbench-warning-ownership">
      <div className="evidence-workbench-supporting-evidence__section evidence-workbench-warning-ownership__summary">
        <WorkbenchWarningOwnershipSummary
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
              <WorkbenchWarningOwnershipDetail
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
