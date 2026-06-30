import type { HTMLAttributes, ReactNode } from "react";

import "./QhdsContentSection.scss";

export type QhdsContentSectionHeadingLevel = 2 | 3 | 4;
export type QhdsContentSectionLeadDensity = "abstract" | "compact";

export interface QhdsContentSectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  heading?: ReactNode;
  headingId?: string;
  headingLevel?: QhdsContentSectionHeadingLevel;
  lead?: ReactNode;
  leadDensity?: QhdsContentSectionLeadDensity;
  withBodyClass?: boolean;
}

export function QhdsContentSection({
  children,
  className,
  heading,
  headingId,
  headingLevel = 2,
  lead,
  leadDensity = "abstract",
  withBodyClass = true,
  ...props
}: QhdsContentSectionProps) {
  const generatedHeadingId =
    typeof heading === "string"
      ? `${heading.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-section`
      : undefined;
  const resolvedHeadingId = headingId ?? generatedHeadingId;
  const classes = [withBodyClass ? "qld__body" : undefined, "qhds-content-section", className].filter(Boolean).join(" ");
  const sectionProps = heading && resolvedHeadingId ? { "aria-labelledby": resolvedHeadingId, ...props } : props;

  return (
    <section className={classes} {...sectionProps}>
      {heading ? (
        <header className="qhds-content-section__header">
          {renderHeading(heading, resolvedHeadingId, headingLevel)}
          {lead ? <p className={leadClassName(leadDensity)}>{lead}</p> : null}
        </header>
      ) : null}
      <div className="qhds-content-section__body">{children}</div>
    </section>
  );
}

function renderHeading(
  heading: ReactNode,
  headingId: string | undefined,
  headingLevel: QhdsContentSectionHeadingLevel
) {
  const props = {
    className: "qhds-content-section__heading",
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

function leadClassName(leadDensity: QhdsContentSectionLeadDensity): string {
  return [
    leadDensity === "abstract" ? "qld__abstract" : "",
    "qhds-content-section__lead",
    `qhds-content-section__lead--${leadDensity}`
  ]
    .filter(Boolean)
    .join(" ");
}
