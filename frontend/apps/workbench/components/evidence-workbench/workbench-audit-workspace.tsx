import type { ReactElement } from "react";

import { AivisEvidenceWarningList } from "@aivis/ui-library";

import { AuditSummary } from "./audit-summary";
import type { ReviewDecisionBarProps } from "./review-decision-bar";
import { ReviewDecisionBar } from "./review-decision-bar";
import type { ReviewDecisionState } from "./review-action-state";
import type { SourceBlockerIssue } from "./source-blocker-review";

interface WorkbenchAuditWorkspaceProps {
  decisionState: ReviewDecisionState;
  onApplyAction: ReviewDecisionBarProps["onApplyAction"];
  onReset: () => void;
  selectedIssue: SourceBlockerIssue | null;
}

export function WorkbenchAuditWorkspace({
  decisionState,
  onApplyAction,
  onReset,
  selectedIssue
}: Readonly<WorkbenchAuditWorkspaceProps>): ReactElement {
  return (
    <>
      <ReviewDecisionBar
        onApplyAction={onApplyAction}
        onReset={onReset}
        selectedIssue={selectedIssue}
        state={decisionState}
      />
      <AuditSummary decisionState={decisionState} />
      <AivisEvidenceWarningList
        ariaLabel="Active fixture warnings"
        warnings={decisionState.warnings.map((warning) => ({
          id: warning.id,
          message: warning.message,
          severity: warning.severity
        }))}
      />
    </>
  );
}
