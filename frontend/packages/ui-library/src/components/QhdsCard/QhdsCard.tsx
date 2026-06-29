import type { HTMLAttributes, ReactElement, ReactNode } from "react";

import "./QhdsCard.scss";

export type QhdsCardActionMode = "none" | "single" | "multi";
export type QhdsCardDensity = "default" | "compact";
export type QhdsCardVariant = "default" | "workbench" | "feature";

export interface QhdsCardProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  action?: ReactNode;
  actionMode?: QhdsCardActionMode;
  children: ReactNode;
  density?: QhdsCardDensity;
  heading: ReactNode;
  headingHref?: string;
  headingId?: string;
  headingLevel?: 2 | 3 | 4;
  variant?: QhdsCardVariant;
}

export function QhdsCard({
  action,
  actionMode,
  children,
  className,
  density = "default",
  heading,
  headingHref,
  headingId,
  headingLevel = 2,
  variant = "default",
  ...props
}: QhdsCardProps) {
  const resolvedActionMode = actionMode ?? (headingHref ? "single" : "none");
  const isFeature = variant === "feature";
  const cardClassName = [
    "qld__card",
    resolvedActionMode === "single" ? "qld__card__action" : "",
    resolvedActionMode === "multi" || isFeature ? "qld__card__multi-action" : "",
    isFeature ? "qld__card__multi-action--feature" : "",
    "qhds-card",
    `qhds-card--variant-${variant}`,
    `qhds-card--density-${density}`,
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClassName} {...props}>
      <div className="qld__card__inner qhds-card__body">
        <div className="qld__card__content qhds-card__content">
          <div className="qld__card__content-inner qhds-card__content-inner">
            {renderHeading(heading, headingHref, headingId, headingLevel)}
            <div className="qhds-card__content-body">{children}</div>
          </div>
        </div>
      </div>
      {action ? (
        <div className="qld__card__footer qhds-card__action">
          <div className="qld__card__footer-inner">{action}</div>
        </div>
      ) : null}
    </article>
  );
}

function renderHeading(
  heading: ReactNode,
  headingHref: string | undefined,
  headingId: string | undefined,
  headingLevel: 2 | 3 | 4
): ReactElement {
  const props = {
    className: "qld__card__title qhds-card__heading",
    id: headingId
  };
  const headingContent = headingHref ? (
    <a className="qhds-card__heading-link" href={headingHref}>
      {heading}
    </a>
  ) : (
    heading
  );

  if (headingLevel === 3) {
    return <h3 {...props}>{headingContent}</h3>;
  }

  if (headingLevel === 4) {
    return <h4 {...props}>{headingContent}</h4>;
  }

  return <h2 {...props}>{headingContent}</h2>;
}
