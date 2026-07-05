"use client";

import qgovLogoUrlBrand from "@aivis/ui-assets/logos/header-logo-qgov-url";

import type { MouseEvent } from "react";

import { QhdsIcon } from "../QhdsIcon";

import { QhdsMobileMainNav } from "./QhdsMobileMainNav";
import type { QhdsHeaderCtaItem, QhdsHeaderProps } from "./QhdsHeader.types";
import { useQhdsMobileMainNav } from "./useQhdsMobileMainNav";

import "./QhdsHeader.scss";

export type { QhdsHeaderCtaItem, QhdsHeaderNavItem, QhdsHeaderProps } from "./QhdsHeader.types";

export function QhdsHeader({
  accountHref = "/",
  accountName = "Avery Taylor",
  actions,
  baseUrlHref = "https://www.qld.gov.au",
  baseUrlText = "qld.gov.au",
  brandHref = "/",
  ctaItems = [],
  logoutHref = "/",
  logoutLabel = "Logout",
  mobileMainNavActiveHref,
  mobileMainNavAriaLabel = "main",
  mobileMainNavHeading = "Menu",
  mobileMainNavId = "main-nav",
  mobileMainNavItems = [],
  navItems = [],
  onNavigate,
  serviceDescription = "Digital Services Prototype",
  serviceName = "Smart Services Queensland",
  showAccountControls = true,
  showMobileMainNav = false,
  width = "app"
}: QhdsHeaderProps) {
  const headerClassName = ["qld__header", "qhds-header", `qhds-header--${width}`].join(" ");
  const safeAccountName = typeof accountName === "string" && accountName.trim() ? accountName.trim() : undefined;
  const accountItems: QhdsHeaderCtaItem[] =
    showAccountControls && safeAccountName
      ? [
          { href: accountHref, icon: <QhdsIcon className="qhds-header__cta-svg" symbol="profile" />, label: safeAccountName },
          { href: logoutHref, icon: <QhdsIcon className="qhds-header__cta-svg" symbol="log-out" />, label: logoutLabel }
        ]
      : [];
  const preHeaderCtaItems = [...accountItems, ...ctaItems];
  const hasPreHeaderActions = preHeaderCtaItems.length > 0 || Boolean(actions);
  const mobileMainNavEnabled = showMobileMainNav || mobileMainNavItems.length > 0;
  const mobileNav = useQhdsMobileMainNav({
    activeHref: mobileMainNavActiveHref,
    enabled: mobileMainNavEnabled,
    id: mobileMainNavId,
    items: mobileMainNavItems,
    onNavigate
  });

  function getNavigationProps(href: string) {
    if (!onNavigate) {
      return {};
    }

    return {
      onClick: (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onNavigate(href);
      }
    };
  }

  return (
    <>
      <header className={headerClassName} role="banner">
        <div className="qld__header__pre-header qld__header__pre-header--dark-alt qhds-header__pre-header">
          <div className="container-fluid">
            <a className="qhds-header__pre-header-link" href={baseUrlHref} {...getNavigationProps(baseUrlHref)}>
              <span className="qld__header__pre-header-url qhds-header__pre-header-url">{baseUrlText}</span>
              <img
                alt="Queensland Government"
                className="qld__header__pre-header-brand-image qhds-header__pre-header-brand-image"
                src={qgovLogoUrlBrand}
              />
            </a>
            {hasPreHeaderActions ? (
              <div className="qld__header__cta-wrapper qhds-header__actions">
                {preHeaderCtaItems.map((item) => (
                  <a
                    className="qld__header__cta-link qhds-header__cta-link"
                    href={item.href}
                    key={`${item.href}-${item.label}`}
                    {...getNavigationProps(item.href)}
                  >
                    {item.icon ? (
                      <span aria-hidden="true" className="qld__header__cta-link-icon qhds-header__cta-link-icon">
                        {item.icon}
                      </span>
                    ) : null}
                    <span className="qld__header__cta-link-text qhds-header__cta-link-text">{item.label}</span>
                  </a>
                ))}
                {actions}
              </div>
            ) : null}
            {mobileMainNavEnabled ? (
              <div className="qld__header__main-nav-controls qhds-header__main-nav-controls">
                <button
                  aria-controls={mobileMainNavId}
                  aria-expanded={mobileNav.mobileMainNavOpen ? "true" : "false"}
                  className="qld__header__toggle-main-nav qld__main-nav__toggle--open main-nav__toggle-open"
                  id="main-nav-mobile"
                  onClick={mobileNav.openMobileMainNav}
                  ref={mobileNav.menuButtonRef}
                  type="button"
                >
                  <QhdsIcon symbol="menu" />
                  <span className="qld__main-nav__toggle-text">Menu</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="qld__header__main qld__header__main--dark qhds-header__main">
          <div className="container-fluid">
            <div className="qld__header__brand qhds-header__brand">
              <a className="qhds-header__brand-link" href={brandHref} {...getNavigationProps(brandHref)}>
                <div className="qld__header__brand-image qhds-header__qg-lockup" aria-label="Queensland Government">
                  <img alt="Queensland Government" className="qhds-header__qg-logo" src={qgovLogoUrlBrand} />
                </div>
                <span className="qld__header__site-name qhds-header__site-name">
                  <span className="qld__header__heading qhds-header__heading">{serviceName}</span>
                  <span className="qld__header__subline qhds-header__subline">{serviceDescription}</span>
                </span>
              </a>
            </div>
            {navItems.length > 0 ? (
              <nav aria-label="Primary" className="qld__main-nav qhds-header__nav" id="qld-header-main-nav">
                <ul className="qld__link-list qhds-header__nav-list">
                  {navItems.map((item) => (
                    <li className="qhds-header__nav-item" key={item.href}>
                      <a className="qld__main-nav__item-link qhds-header__link" href={item.href} {...getNavigationProps(item.href)}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>
        </div>
      </header>
      {mobileMainNavEnabled ? (
        <QhdsMobileMainNav
          activeHref={mobileMainNavActiveHref}
          ariaLabel={mobileMainNavAriaLabel}
          ctaItems={preHeaderCtaItems}
          heading={mobileMainNavHeading}
          id={mobileMainNavId}
          items={mobileMainNavItems}
          mobileNav={mobileNav}
        />
      ) : null}
    </>
  );
}
