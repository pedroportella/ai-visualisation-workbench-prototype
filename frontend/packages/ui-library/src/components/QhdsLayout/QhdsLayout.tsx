import type { ReactNode } from "react";

import "./QhdsLayout.scss";

export type QhdsLayoutContentWidth = "body" | "full" | "task";
export type QhdsLayoutWidth = "app" | "contained";

export interface QhdsLayoutProps {
  children: ReactNode;
  className?: string;
  contentLabelledBy?: string;
  contentWidth?: QhdsLayoutContentWidth;
  focusMode?: boolean;
  footer?: ReactNode;
  globalAlert?: ReactNode;
  header?: ReactNode;
  mainId?: string;
  mainLabel?: string;
  sideNav?: ReactNode;
  skipLinkLabel?: string;
  width?: QhdsLayoutWidth;
}

export function QhdsLayout({
  children,
  className,
  contentLabelledBy,
  contentWidth,
  focusMode = false,
  footer,
  globalAlert,
  header,
  mainId = "content",
  mainLabel,
  sideNav,
  skipLinkLabel = "Skip to main content",
  width = "app"
}: QhdsLayoutProps) {
  const hasSideNav = Boolean(sideNav) && !focusMode;
  const resolvedContentWidth = contentWidth ?? (focusMode ? "task" : "full");
  const layoutClasses = [
    "qld__grid",
    hasSideNav ? "vertical-nav" : "",
    "qhds-layout",
    `qhds-layout--${width}`,
    hasSideNav ? "qhds-layout--has-left-nav" : "",
    focusMode ? "qhds-layout--focus" : "",
    className
  ];
  const bodyClasses = [
    "qld__body",
    hasSideNav ? "qld__body--left-nav" : "",
    "qhds-layout__main-section-body",
    `qhds-layout__main-section-body--${resolvedContentWidth}`
  ];
  const mainBody = (
    <section aria-labelledby={contentLabelledBy} className={bodyClasses.filter(Boolean).join(" ")} id={mainId} tabIndex={-1}>
      {children}
    </section>
  );

  return (
    <div className={layoutClasses.filter(Boolean).join(" ")}>
      <nav aria-label="skip links" className="qld__skip-link qhds-layout__skip-links" tabIndex={-1}>
        <a className="qld__skip-link__link qhds-layout__skip-link" href={`#${mainId}`}>
          {skipLinkLabel}
        </a>
        {hasSideNav ? (
          <a className="qld__skip-link__link qhds-layout__skip-link qhds-layout__skip-link--section-nav" href="#section-navigation">
            Skip to section navigation
          </a>
        ) : null}
      </nav>
      {header}
      {globalAlert}
      <main aria-label={mainLabel} className="main qhds-layout__main" tabIndex={-1}>
        {hasSideNav ? <div className="qhds-layout__left-nav" id="section-navigation">{sideNav}</div> : null}
        {mainBody}
      </main>
      {footer}
    </div>
  );
}
