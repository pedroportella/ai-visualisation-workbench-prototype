import type { ReactElement } from "react";

import {
  QhdsButton,
  QhdsContentSection
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import { AuditSummary } from "./audit-summary";
import { REVIEW_ROUTE } from "./evidence-workbench-routes";
import type { ReviewDecisionState } from "./review-action-state";
import type { SourceBlockerIssue } from "./source-blocker-review";
import { WorkbenchWarningOwnership } from "./workbench-warning-ownership";

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
    <>
      <AuditSummary decisionState={decisionState} selectedIssue={selectedIssue} />
      <AuditResetBoundary onReset={onReset} />
      <WorkbenchWarningOwnership
        blockedWarningIds={decisionState.review.blockedByWarningIds}
        context="audit"
        heading="Audit warning ownership"
        headingId="audit-warning-ownership-title"
        sourceItems={data.sourceItems}
        summary="Audit records local action state. Warning messages are supporting evidence and remain owned by Source evidence."
        warnings={decisionState.warnings}
      />
    </>
  );
}

function AuditResetBoundary({
  onReset
}: Readonly<{ onReset: () => void }>): ReactElement {
  return (
    <QhdsContentSection
      className="evidence-workbench-panel evidence-workbench-audit-reset"
      heading="Reset boundary"
      headingId="audit-reset-boundary-title"
      lead="Reset is the only state-changing control on this route."
      leadDensity="compact"
      withBodyClass={false}
    >
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
    </QhdsContentSection>
  );
}
