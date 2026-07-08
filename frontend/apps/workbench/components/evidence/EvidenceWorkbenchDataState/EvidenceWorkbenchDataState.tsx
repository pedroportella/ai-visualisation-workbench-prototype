import type { ReactElement } from "react";
import { AivisEvidenceStatus, QhdsButton } from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "@aivis/services";

export interface EvidenceWorkbenchDataStateModel {
  errorMessage: string | null;
  isError: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  refreshLabel: string;
  source: EvidenceWorkbenchViewModel["fetchState"]["source"];
}

export function EvidenceWorkbenchDataState({
  state
}: Readonly<{
  state: EvidenceWorkbenchDataStateModel;
}>): ReactElement {
  return (
    <aside
      aria-label="Evidence data state"
      className="evidence-workbench-data-state"
    >
      <div className="evidence-workbench-data-state__content">
        <AivisEvidenceStatus
          tone={state.source === "backend" ? "success" : "warning"}
        >
          {state.source === "backend" ? "Backend fixture" : "Local fixture"}
        </AivisEvidenceStatus>
        <span className="evidence-workbench-data-state__refresh-state" role="status">
          {state.isRefreshing ? "Refreshing evidence" : state.refreshLabel}
        </span>
        <QhdsButton
          disabled={state.isRefreshing}
          onClick={state.onRefresh}
          type="button"
          variant="tertiary"
        >
          Refresh
        </QhdsButton>
      </div>
      {state.isError ? (
        <span className="evidence-workbench-data-state__error" role="alert">
          {state.errorMessage ?? "Refresh failed; keeping loaded evidence."}
        </span>
      ) : null}
    </aside>
  );
}
