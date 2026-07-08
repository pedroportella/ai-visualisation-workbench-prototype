import type { ReactElement } from "react";
import { QhdsButton, QhdsIcon } from "@aivis/ui-library";

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
  const sourceLabel = state.source === "backend" ? "Backend fixture" : "Local fixture";

  return (
    <section
      aria-label="Evidence data state"
      className="evidence-workbench-data-state"
    >
      <div className="evidence-workbench-data-state__summary">
        <span className="evidence-workbench-data-state__item">
          <span className="evidence-workbench-data-state__label">Source</span>
          <span className="evidence-workbench-data-state__value">{sourceLabel}</span>
        </span>
        <span aria-hidden="true" className="evidence-workbench-data-state__separator">
          /
        </span>
        <span className="evidence-workbench-data-state__refresh-state" role="status">
          {state.isRefreshing ? "Refreshing evidence" : state.refreshLabel}
        </span>
      </div>
      <QhdsButton
        aria-busy={state.isRefreshing ? true : undefined}
        className="evidence-workbench-data-state__refresh-action"
        disabled={state.isRefreshing}
        leadingIcon={<QhdsIcon symbol="refresh" />}
        onClick={state.onRefresh}
        type="button"
        variant="tertiary"
      >
        {state.isRefreshing ? "Refreshing evidence" : "Refresh evidence"}
      </QhdsButton>
      {state.isError ? (
        <span className="evidence-workbench-data-state__error" role="alert">
          {state.errorMessage ?? "Refresh failed; keeping loaded evidence."}
        </span>
      ) : null}
    </section>
  );
}
