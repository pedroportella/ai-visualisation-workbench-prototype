"use client";

import qgovLogoUrlBrand from "@aivis/ui-assets/logos/header-logo-qgov-url";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";

import { QhdsIcon } from "../QhdsIcon";

import "./QhdsHeader.scss";

const MOBILE_MAIN_NAV_ANIMATION_MS = 250;

export interface QhdsHeaderNavItem {
  href: string;
  icon?: ReactNode;
  id?: string;
  items?: QhdsHeaderNavItem[];
  label: ReactNode;
}

export interface QhdsHeaderCtaItem {
  href: string;
  icon?: ReactNode;
  label: string;
}

export interface QhdsHeaderProps {
  accountHref?: string;
  accountName?: string | null;
  actions?: ReactNode;
  baseUrlHref?: string;
  baseUrlText?: string;
  brandHref?: string;
  ctaItems?: QhdsHeaderCtaItem[];
  logoutHref?: string;
  logoutLabel?: string;
  mobileMainNavActiveHref?: string;
  mobileMainNavAriaLabel?: string;
  mobileMainNavHeading?: string;
  mobileMainNavId?: string;
  mobileMainNavItems?: QhdsHeaderNavItem[];
  navItems?: QhdsHeaderNavItem[];
  onNavigate?: (href: string) => void;
  serviceDescription?: string;
  serviceName?: string;
  showAccountControls?: boolean;
  showMobileMainNav?: boolean;
  width?: "app" | "contained";
}

function getPlainLabel(label: ReactNode, fallback: string): string {
  if (typeof label === "string" || typeof label === "number") {
    return String(label);
  }

  return fallback;
}

function slugify(value: string): string {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "item";
}

function getMobileNavItemId(item: QhdsHeaderNavItem, index: number, parentKey: string): string {
  const source = item.id ?? item.href ?? getPlainLabel(item.label, `${parentKey}-${index}`);

  return `${parentKey}-${index}-${slugify(source)}`;
}

function containsActiveHref(item: QhdsHeaderNavItem, activeHref?: string): boolean {
  return Boolean(activeHref && (item.href === activeHref || item.items?.some((child) => containsActiveHref(child, activeHref))));
}

function collectOpenMobileNavIds(items: QhdsHeaderNavItem[], activeHref: string | undefined, parentKey: string): string[] {
  return items.flatMap((item, index) => {
    const itemId = getMobileNavItemId(item, index, parentKey);
    const childItems = item.items ?? [];
    const childOpenIds = collectOpenMobileNavIds(childItems, activeHref, itemId);
    const shouldOpen = childItems.length > 0 && childItems.some((child) => containsActiveHref(child, activeHref));

    return shouldOpen ? [itemId, ...childOpenIds] : childOpenIds;
  });
}

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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuHeadingRef = useRef<HTMLHeadingElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileNavAnimationTimerRef = useRef<number | undefined>(undefined);
  const returnFocusOnCloseRef = useRef(true);
  const wasMobileNavOpenRef = useRef(false);
  const openMobileNavIds = useMemo(
    () => collectOpenMobileNavIds(mobileMainNavItems, mobileMainNavActiveHref, mobileMainNavId),
    [mobileMainNavActiveHref, mobileMainNavId, mobileMainNavItems]
  );
  const [mobileMainNavAnimating, setMobileMainNavAnimating] = useState(false);
  const [mobileMainNavRendered, setMobileMainNavRendered] = useState(false);
  const [expandedMobileNavIds, setExpandedMobileNavIds] = useState<string[]>(openMobileNavIds);
  const [mobileMainNavOpen, setMobileMainNavOpen] = useState(false);

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

  function clearMobileNavAnimationTimer() {
    if (mobileNavAnimationTimerRef.current !== undefined) {
      window.clearTimeout(mobileNavAnimationTimerRef.current);
      mobileNavAnimationTimerRef.current = undefined;
    }
  }

  const closeMobileMainNav = useCallback((restoreFocus = true) => {
    returnFocusOnCloseRef.current = restoreFocus;
    clearMobileNavAnimationTimer();
    setMobileMainNavAnimating(true);
    setMobileMainNavOpen(false);

    mobileNavAnimationTimerRef.current = window.setTimeout(() => {
      setMobileMainNavAnimating(false);
      setMobileMainNavRendered(false);
      mobileNavAnimationTimerRef.current = undefined;
    }, MOBILE_MAIN_NAV_ANIMATION_MS);
  }, []);

  const getMobileNavFocusableElements = useCallback(() => {
    const menu = mobileMenuRef.current;

    if (!menu) {
      return [];
    }

    return Array.from(
      menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(
      (element) =>
        !element.classList.contains("qld__main-nav__focus-trap-top") &&
        !element.classList.contains("qld__main-nav__focus-trap-bottom") &&
        !element.closest("[hidden]")
    );
  }, []);

  useEffect(() => {
    setExpandedMobileNavIds((currentIds) => {
      const nextIds = [...currentIds];

      for (const itemId of openMobileNavIds) {
        if (!nextIds.includes(itemId)) {
          nextIds.push(itemId);
        }
      }

      return nextIds.length === currentIds.length && nextIds.every((itemId, index) => itemId === currentIds[index])
        ? currentIds
        : nextIds;
    });
  }, [openMobileNavIds]);

  useEffect(() => () => clearMobileNavAnimationTimer(), []);

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
  const mobileMainNavContentClasses = [
    "qld__main-nav__content",
    mobileMainNavOpen ? "qld__main-nav__content--open" : "qld__main-nav__content--closed",
    mobileMainNavRendered ? "qhds-header__main-nav-content--rendered" : undefined,
    mobileMainNavAnimating ? "qhds-header__main-nav-content--animating" : undefined,
    "qhds-header__main-nav-content"
  ]
    .filter(Boolean)
    .join(" ");
  const mobileMainNavMenuClasses = [
    "qld__main-nav__menu",
    "qld__main-nav__menu--dark-alt",
    "qhds-header__main-nav-menu"
  ].join(" ");

  useEffect(() => {
    if (!mobileMainNavEnabled) {
      return undefined;
    }

    if (!mobileMainNavOpen) {
      if (wasMobileNavOpenRef.current) {
        wasMobileNavOpenRef.current = false;

        if (returnFocusOnCloseRef.current) {
          menuButtonRef.current?.focus();
        }
      }

      return undefined;
    }

    wasMobileNavOpenRef.current = true;

    const affectedRegions = Array.from(document.querySelectorAll<HTMLElement>(".main, .qld__footer"));
    const originalAriaHiddenValues = affectedRegions.map((region) => region.getAttribute("aria-hidden"));

    document.body.classList.add("qld__main-nav__scroll--locked");
    affectedRegions.forEach((region) => {
      region.setAttribute("aria-hidden", "true");
    });

    menuHeadingRef.current?.focus();

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMobileMainNav();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.classList.remove("qld__main-nav__scroll--locked");
      affectedRegions.forEach((region, index) => {
        const originalValue = originalAriaHiddenValues[index];

        if (originalValue === null) {
          region.removeAttribute("aria-hidden");
        } else {
          region.setAttribute("aria-hidden", originalValue);
        }
      });
    };
  }, [closeMobileMainNav, mobileMainNavEnabled, mobileMainNavOpen]);

  function openMobileMainNav() {
    returnFocusOnCloseRef.current = true;
    clearMobileNavAnimationTimer();
    setMobileMainNavRendered(true);
    setMobileMainNavAnimating(true);

    mobileNavAnimationTimerRef.current = window.setTimeout(() => {
      setMobileMainNavOpen(true);
      mobileNavAnimationTimerRef.current = window.setTimeout(() => {
        setMobileMainNavAnimating(false);
        mobileNavAnimationTimerRef.current = undefined;
      }, MOBILE_MAIN_NAV_ANIMATION_MS);
    }, 0);
  }

  function toggleMobileNavItem(itemId: string) {
    setExpandedMobileNavIds((currentIds) =>
      currentIds.includes(itemId) ? currentIds.filter((currentId) => currentId !== itemId) : [...currentIds, itemId]
    );
  }

  function getMobileNavigationProps(href: string) {
    return {
      onClick: (event: MouseEvent<HTMLAnchorElement>) => {
        if (onNavigate) {
          event.preventDefault();
          onNavigate(href);
        }

        closeMobileMainNav(false);
      }
    };
  }

  function focusFirstMobileNavItem() {
    const [firstElement] = getMobileNavFocusableElements();
    firstElement?.focus();
  }

  function focusLastMobileNavItem() {
    const focusableElements = getMobileNavFocusableElements();
    focusableElements.at(-1)?.focus();
  }

  function renderMobileNavItemLink(item: QhdsHeaderNavItem, current: boolean, className: string) {
    const label = getPlainLabel(item.label, item.href);

    if (current) {
      return (
        <span aria-current="page" className={className}>
          {item.icon}
          <span className="qld__main-nav__item-text" data-name={label}>{item.label}</span>
        </span>
      );
    }

    return (
      <a className={className} href={item.href} {...getMobileNavigationProps(item.href)}>
        {item.icon}
        <span className="qld__main-nav__item-text" data-name={label}>{item.label}</span>
      </a>
    );
  }

  function renderMobileSubNavItem(item: QhdsHeaderNavItem, index: number, parentKey: string) {
    const current = Boolean(mobileMainNavActiveHref && item.href === mobileMainNavActiveHref);
    const itemId = getMobileNavItemId(item, index, parentKey);

    return (
      <li className={current ? "active" : undefined} key={item.id ?? item.href ?? itemId}>
        {current ? (
          <span aria-current="page" className="qld__main-nav__sub-item-text">{item.label}</span>
        ) : (
          <a href={item.href} {...getMobileNavigationProps(item.href)}>
            <span className="qld__main-nav__sub-item-text">{item.label}</span>
          </a>
        )}
      </li>
    );
  }

  function renderMobileNavItem(item: QhdsHeaderNavItem, index: number, parentKey = mobileMainNavId) {
    const childItems = item.items ?? [];
    const hasChildren = childItems.length > 0;
    const current = Boolean(mobileMainNavActiveHref && item.href === mobileMainNavActiveHref);
    const active = current || childItems.some((child) => containsActiveHref(child, mobileMainNavActiveHref));
    const itemId = getMobileNavItemId(item, index, parentKey);
    const childListId = `${itemId}-children`;
    const expanded = hasChildren ? expandedMobileNavIds.includes(itemId) : false;
    const label = getPlainLabel(item.label, `item ${index + 1}`);
    const itemLinkClasses = [
      "qld__main-nav__item-link",
      active && hasChildren ? "qld__main-nav__item-link--open" : undefined,
      "qhds-header__main-nav-item-link"
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <li
        className={["qld__main-nav__item", active ? "active" : undefined, hasChildren ? "qhds-header__main-nav-item--has-children" : undefined]
          .filter(Boolean)
          .join(" ")}
        key={item.id ?? item.href ?? itemId}
      >
        <div className="qld__main-nav__item-title">
          {renderMobileNavItemLink(item, current, itemLinkClasses)}
          {hasChildren ? (
            <button
              aria-controls={childListId}
              aria-expanded={expanded ? "true" : "false"}
              aria-label={`Toggle navigation, ${label}`}
              aria-selected={expanded ? "true" : "false"}
              className={["qld__main-nav__item-toggle", expanded ? "qld__accordion--open" : "qld__accordion--closed"].join(" ")}
              onClick={() => toggleMobileNavItem(itemId)}
              type="button"
            >
              <span className="qld__main-nav__item-toggle-text" data-name={label}>{item.label}</span>
              <QhdsIcon size="xs" symbol="chevron-up" />
            </button>
          ) : null}
        </div>
        {hasChildren ? (
          <div
            className={["qld__main-nav__menu-sub", expanded ? "qld__accordion--open" : "qld__accordion--closed", "qld__accordion__body"]
              .join(" ")}
            hidden={!expanded}
            id={childListId}
          >
            <div className="qld__main-nav__menu-sub-inner">
              <ul className="qld__link-columns qld__link-columns--3-col qld__link-list">
                {childItems.map((childItem, childIndex) => renderMobileSubNavItem(childItem, childIndex, itemId))}
              </ul>
            </div>
          </div>
        ) : null}
      </li>
    );
  }

  function renderMobileMainNav() {
    if (!mobileMainNavEnabled) {
      return null;
    }

    return (
      <nav aria-label={mobileMainNavAriaLabel} className="qld__main-nav qld__main-nav--mega qhds-header__main-nav" id="mainmenu">
        <div className="container-fluid">
          <div
            aria-hidden={mobileMainNavOpen ? undefined : "true"}
            className={mobileMainNavContentClasses}
            id={mobileMainNavId}
          >
            <div className={mobileMainNavMenuClasses} ref={mobileMenuRef}>
              <div className="qld__main-nav__menu-inner">
                <div
                  className="qld__main-nav__focus-trap-top"
                  onFocus={focusLastMobileNavItem}
                  tabIndex={mobileMainNavOpen ? 0 : undefined}
                />
                <div className="qld__main-nav__header qld__main-nav__header--dark-alt">
                  <h2 className="qld__main-nav__menu-heading" ref={menuHeadingRef} tabIndex={-1}>{mobileMainNavHeading}</h2>
                  <button
                    aria-controls={mobileMainNavId}
                    aria-expanded={mobileMainNavOpen ? "true" : "false"}
                    className="qld__main-nav__toggle qld__main-nav__toggle--close"
                    onClick={() => closeMobileMainNav()}
                    type="button"
                  >
                    <QhdsIcon size="sm" symbol="close" />
                    <span className="qld__main-nav__toggle-text">Close</span>
                  </button>
                </div>
                <ul className="qld__link-list qld__link-list--flex qhds-header__main-nav-list">
                  {mobileMainNavItems.map((item, index) => renderMobileNavItem(item, index))}
                </ul>
                {preHeaderCtaItems.length > 0 ? (
                  <>
                    <div className={preHeaderCtaItems.length > 1 ? "qld__mega-nav_mobile-filler-120" : "qld__mega-nav_mobile-filler-60"} />
                    <div className="qld__main-nav__cta-wrapper qld__main-nav__cta-wrapper--dark-alt qhds-header__main-nav-cta-wrapper">
                      <ul className="qld__link-list qld__link-list--flex">
                        {preHeaderCtaItems.map((item) => (
                          <li className="qld__main-nav__item qld__main-nav__item--cta" key={`mobile-${item.href}-${item.label}`}>
                            <div className="qld__main-nav__item-title">
                              <a className="qld__main-nav__item-link" href={item.href} {...getMobileNavigationProps(item.href)}>
                                {item.icon}
                                <span className="qld__main-nav__item-text" data-name={item.label}>{item.label}</span>
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : null}
                <div
                  className="qld__main-nav__focus-trap-bottom"
                  onFocus={focusFirstMobileNavItem}
                  tabIndex={mobileMainNavOpen ? 0 : undefined}
                />
              </div>
            </div>
            <div
              aria-controls={mobileMainNavId}
              className="qld__main-nav__overlay"
              onClick={() => closeMobileMainNav()}
            />
          </div>
        </div>
      </nav>
    );
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
                  aria-expanded={mobileMainNavOpen ? "true" : "false"}
                  className="qld__header__toggle-main-nav qld__main-nav__toggle--open main-nav__toggle-open"
                  id="main-nav-mobile"
                  onClick={openMobileMainNav}
                  ref={menuButtonRef}
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
      {renderMobileMainNav()}
    </>
  );
}
