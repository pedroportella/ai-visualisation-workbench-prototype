"use client";

import { useState, type ReactNode } from "react";

import { QhdsIcon } from "../QhdsIcon";

import "./QhdsGlobalAlert.scss";

export type QhdsGlobalAlertLevel = "critical" | "default" | "general";

export interface QhdsGlobalAlertAction {
  href: string;
  label: ReactNode;
}

export interface QhdsGlobalAlertProps {
  action?: QhdsGlobalAlertAction;
  children?: ReactNode;
  className?: string;
  closeLabel?: string;
  dismissible?: boolean;
  level?: QhdsGlobalAlertLevel;
  title?: ReactNode;
  verticalNav?: boolean;
}

const levelLabels: Record<QhdsGlobalAlertLevel, string> = {
  critical: "Alert",
  default: "Warning",
  general: "Information"
};

const levelIconLabels: Record<QhdsGlobalAlertLevel, string> = {
  critical: "Alert icon",
  default: "Warning icon",
  general: "Information icon"
};

const levelIcons: Record<QhdsGlobalAlertLevel, string> = {
  critical: "alert-danger",
  default: "alert-warning",
  general: "alert-information"
};

export function QhdsGlobalAlert({
  action,
  children,
  className,
  closeLabel = "Close alert",
  dismissible = false,
  level = "default",
  title,
  verticalNav = false
}: QhdsGlobalAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  const includeClassName = [
    "qld__global_alert_include",
    "qld__global-alert_include",
    "qhds-global-alert-include",
    verticalNav ? "qhds-global-alert-include--vertical-nav" : ""
  ]
    .filter(Boolean)
    .join(" ");
  const alertClassName = [
    "qld__global-alert",
    `qld__global-alert--${level}`,
    verticalNav ? "qld__global-alert-with-vertical-nav" : "",
    "qhds-global-alert",
    `qhds-global-alert--${level}`,
    className
  ]
    .filter(Boolean)
    .join(" ");

  if (dismissed) {
    return null;
  }

  return (
    <div className={includeClassName}>
      <div aria-label={levelLabels[level]} className={alertClassName} role="region">
        <div className="container-fluid">
          <div className="qld__global-alert__main qhds-global-alert__main">
            <div className="qld__global-alert__icon qhds-global-alert__icon">
              <QhdsIcon label={levelIconLabels[level]} size="md" symbol={levelIcons[level]} />
            </div>

            <div className="qld__global-alert__content qhds-global-alert__content">
              {title || children ? (
                <div className="qld__global-alert__message qhds-global-alert__message">
                  {title ? <strong>{title}</strong> : null}
                  {title && children ? " " : null}
                  {children}
                </div>
              ) : null}

              {action ? (
                <div className="qld__global-alert__action qhds-global-alert__action">
                  <a href={action.href}>
                    <span>{action.label}</span>
                    <QhdsIcon size="sm" symbol="arrow-right" />
                  </a>
                </div>
              ) : null}
            </div>

            {dismissible ? (
              <div className="qld__global-alert__close qhds-global-alert__close">
                <button aria-label={closeLabel} onClick={() => setDismissed(true)} type="button">
                  <QhdsIcon size="sm" symbol="close" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
