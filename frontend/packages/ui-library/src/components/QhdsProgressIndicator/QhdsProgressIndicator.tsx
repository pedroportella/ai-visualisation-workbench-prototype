import type { ReactNode } from "react";

import "./QhdsProgressIndicator.scss";

export type QhdsProgressStepStatus = "completed" | "current" | "upcoming";

export interface QhdsProgressStep {
  description?: ReactNode;
  id: string;
  label: ReactNode;
  status: QhdsProgressStepStatus;
}

export interface QhdsProgressIndicatorProps {
  label?: string;
  steps: QhdsProgressStep[];
}

export function QhdsProgressIndicator({ label = "Progress", steps }: QhdsProgressIndicatorProps) {
  return (
    <nav aria-label={label} className="qld__progress-indicator qhds-progress">
      <ol className="qld__progress-indicator__list qhds-progress__list">
        {steps.map((step) => {
          const stateClassName = `qld__progress-indicator__item--${step.status}`;

          return (
            <li
              className={`qld__progress-indicator__item ${stateClassName} qhds-progress__step qhds-progress__step--${step.status}`}
              key={step.id}
            >
              <span aria-hidden="true" className="qld__progress-indicator__marker qhds-progress__marker" />
              <span className="qld__progress-indicator__content qhds-progress__content">
                <span
                  aria-current={step.status === "current" ? "step" : undefined}
                  className="qld__progress-indicator__label qhds-progress__label"
                >
                  {step.label}
                </span>
                {step.description ? (
                  <span className="qld__progress-indicator__description qhds-progress__description">{step.description}</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
