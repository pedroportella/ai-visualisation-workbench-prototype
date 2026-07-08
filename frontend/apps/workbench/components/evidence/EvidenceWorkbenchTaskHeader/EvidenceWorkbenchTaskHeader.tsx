import type { ReactElement } from "react";
import { AivisEvidenceStatus, QhdsButton } from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../../services/EvidenceWorkbenchTypes";
import type { EvidenceWorkbenchView } from "../../shared/routeModel";
import { formatStateLabel, statusTone } from "../../shared/viewFormatters";

interface EvidenceWorkbenchServerState {
  errorMessage: string | null;
  isError: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  refreshLabel: string;
  source: EvidenceWorkbenchViewModel["fetchState"]["source"];
}

interface EvidenceWorkbenchTaskHeaderProps {
  activeView: EvidenceWorkbenchView;
  review: EvidenceWorkbenchViewModel["review"];
  serverState: EvidenceWorkbenchServerState;
}

export function EvidenceWorkbenchTaskHeader({
  activeView,
  review,
  serverState
}: Readonly<EvidenceWorkbenchTaskHeaderProps>): ReactElement {
  const titles = {
    audit: "Audit state",
    overview: "Evidence Workbench",
    process: "Evidence map",
    review: "Review answer",
    sources: "Source evidence"
  } satisfies Record<EvidenceWorkbenchView, string>;
  const blockerCount = review.blockedByWarningIds.length;

  return (
    <header className="workbench-task-header">
      <h1 className="workbench-task-header__heading" id="evidence-workbench-title">
        {titles[activeView]}
      </h1>
      <div className="workbench-task-header__state">
        <div
          aria-label="Review task state"
          className="workbench-task-header__status"
        >
          <AivisEvidenceStatus tone={statusTone(review.status)}>
            {review.status}
          </AivisEvidenceStatus>
          <AivisEvidenceStatus
            aria-label={`${blockerCount} approval ${blockerCount === 1 ? "blocker" : "blockers"}`}
            tone={blockerCount > 0 ? "warning" : "success"}
          >
            {blockerCount} {blockerCount === 1 ? "blocker" : "blockers"}
          </AivisEvidenceStatus>
          <AivisEvidenceStatus tone={review.copyState === "enabled" ? "success" : "warning"}>
            Copy {formatStateLabel(review.copyState)}
          </AivisEvidenceStatus>
        </div>
        <div
          aria-label="Evidence data state"
          className="workbench-task-header__server-state"
        >
          <AivisEvidenceStatus
            tone={serverState.source === "backend" ? "success" : "warning"}
          >
            {serverState.source === "backend" ? "Backend fixture" : "Bundled fallback"}
          </AivisEvidenceStatus>
          <span className="workbench-task-header__refresh-state" role="status">
            {serverState.isRefreshing ? "Refreshing evidence" : serverState.refreshLabel}
          </span>
          <QhdsButton
            disabled={serverState.isRefreshing}
            onClick={serverState.onRefresh}
            type="button"
            variant="tertiary"
          >
            Refresh
          </QhdsButton>
          {serverState.isError ? (
            <span className="workbench-task-header__error" role="alert">
              {serverState.errorMessage ?? "Refresh failed; keeping loaded evidence."}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
