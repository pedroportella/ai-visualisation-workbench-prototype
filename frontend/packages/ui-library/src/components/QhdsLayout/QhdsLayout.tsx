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
  const contentClasses = [
    "col-xs-12",
    "col-lg-12 col-xl-12",
    "qhds-layout__content",
    `qhds-layout__content--${resolvedContentWidth}`
  ];
  const layoutClasses = [
    "qld__grid",
    hasSideNav ? "vertical-nav" : "",
    "qhds-layout",
    `qhds-layout--${width}`,
    hasSideNav ? "qhds-layout--has-left-nav" : "",
    focusMode ? "qhds-layout--focus" : "",
    className
  ];
  const bodyContent = (
    <section className="qld__body qhds-layout__body">
      <div className="container-fluid qhds-layout__container">
        <div className="row">
          <div aria-labelledby={contentLabelledBy} className={contentClasses.filter(Boolean).join(" ")} id={mainId} tabIndex={-1}>
            {children}
          </div>
        </div>
      </div>
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
        {hasSideNav ? <div className="qld__body--left-nav qhds-layout__left-nav-content">{bodyContent}</div> : bodyContent}
      </main>
      {footer}
    </div>
  );
}
