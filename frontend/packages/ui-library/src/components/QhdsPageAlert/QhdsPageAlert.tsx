import type { HTMLAttributes, ReactNode } from "react";

import "./QhdsPageAlert.scss";

type PageAlertTone = "info" | "success" | "warning";

export interface QhdsPageAlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  ariaLabel?: string;
  children: ReactNode;
  heading: string;
  tone?: PageAlertTone;
}

export function QhdsPageAlert({
  ariaLabel,
  children,
  className,
  heading,
  role = "region",
  tone = "info",
  ...props
}: QhdsPageAlertProps) {
  const alertClassName = [
    "qld__page-alerts",
    "qld__page-alerts--svg",
    `qld__page-alerts--${tone}`,
    "qhds-page-alert",
    `qhds-page-alert--${tone}`,
    className
  ].filter(Boolean).join(" ");

  return (
    <div
      {...props}
      aria-label={ariaLabel ?? heading}
      className={alertClassName}
      role={role}
    >
      <div aria-hidden="true" className="qld__page-alerts__icon qhds-page-alert__icon">
        <PageAlertIcon tone={tone} />
      </div>
      <div className="qld__page-alerts--wrapper qhds-page-alert__wrapper">
        <h2 className="qld__page-alerts--heading qhds-page-alert__heading">{heading}</h2>
        <div className="qhds-page-alert__content">{children}</div>
      </div>
    </div>
  );
}

function PageAlertIcon({ tone }: Readonly<{ tone: PageAlertTone }>) {
  if (tone === "success") {
    return (
      <svg focusable="false" viewBox="0 0 24 24">
        <path d="M9.4 16.6 4.8 12l-1.4 1.4 6 6 12-12L20 6z" fill="currentColor" />
      </svg>
    );
  }

  if (tone === "warning") {
    return (
      <svg focusable="false" viewBox="0 0 24 24">
        <path d="M12 3 1.8 20.5h20.4zm1 14h-2v-2h2zm0-4h-2V8h2z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg focusable="false" viewBox="0 0 24 24">
      <path d="M11 17h2v-6h-2zm0-8h2V7h-2zm1-7a10 10 0 1 0 0 20 10 10 0 0 0 0-20" fill="currentColor" />
    </svg>
  );
}
