import type { HTMLAttributes, ReactElement, ReactNode } from "react";

import "./QhdsCard.scss";

export interface QhdsCardProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  action?: ReactNode;
  children: ReactNode;
  heading: ReactNode;
  headingId?: string;
  headingLevel?: 2 | 3 | 4;
}

export function QhdsCard({
  action,
  children,
  className,
  heading,
  headingId,
  headingLevel = 2,
  ...props
}: QhdsCardProps) {
  const cardClassName = ["qld__card", action ? "qld__card__multi-action" : "", "qhds-card", className].filter(Boolean).join(" ");

  return (
    <article className={cardClassName} {...props}>
      <div className="qld__card__inner qhds-card__body">
        <div className="qld__card__content qhds-card__content">
          <div className="qld__card__content-inner qhds-card__content-inner">
            {renderHeading(heading, headingId, headingLevel)}
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
  headingId: string | undefined,
  headingLevel: 2 | 3 | 4
): ReactElement {
  const props = {
    className: "qld__card__title qhds-card__heading",
    id: headingId
  };

  if (headingLevel === 3) {
    return <h3 {...props}>{heading}</h3>;
  }

  if (headingLevel === 4) {
    return <h4 {...props}>{heading}</h4>;
  }

  return <h2 {...props}>{heading}</h2>;
}
