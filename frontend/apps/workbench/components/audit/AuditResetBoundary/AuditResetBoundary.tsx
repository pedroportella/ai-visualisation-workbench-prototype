import type { ReactElement } from "react";

import { QhdsButton } from "@aivis/ui-library";

import { REVIEW_ROUTE } from "../../shared/routeModel";

export function AuditResetBoundary({
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
