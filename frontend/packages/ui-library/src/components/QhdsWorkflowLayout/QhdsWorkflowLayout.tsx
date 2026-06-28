import type { ReactNode } from "react";

import "./QhdsWorkflowLayout.scss";

export interface QhdsWorkflowLayoutProps {
  actions?: ReactNode;
  backLink?: ReactNode;
  children: ReactNode;
  contextLabel?: ReactNode;
  heading: ReactNode;
  lead?: ReactNode;
  progress?: ReactNode;
  requiredText?: ReactNode;
}

export function QhdsWorkflowLayout({
  actions,
  backLink,
  children,
  contextLabel,
  heading,
  lead,
  progress,
  requiredText
}: QhdsWorkflowLayoutProps) {
  return (
    <div className={["qhds-workflow-layout", progress ? "qhds-workflow-layout--with-progress" : ""].filter(Boolean).join(" ")}>
      {progress ? (
        <aside aria-label="Form progress" className="qhds-workflow-layout__progress">
          {progress}
        </aside>
      ) : null}
      <div className="qhds-workflow-layout__content">
        {backLink ? <div className="qhds-workflow-layout__back">{backLink}</div> : null}
        <header className="qhds-workflow-layout__header">
          {contextLabel ? <p className="qhds-workflow-layout__context">{contextLabel}</p> : null}
          <h1 className="qhds-workflow-layout__heading">{heading}</h1>
          {lead ? <p className="qld__abstract qhds-workflow-layout__lead">{lead}</p> : null}
          {requiredText ? <p className="qhds-workflow-layout__required">{requiredText}</p> : null}
        </header>
        <div className="qhds-workflow-layout__body">{children}</div>
        {actions ? <div className="qhds-workflow-layout__actions">{actions}</div> : null}
      </div>
    </div>
  );
}
