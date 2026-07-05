"use client";

import { QhdsIcon } from "../QhdsIcon";

import type { QhdsHeaderCtaItem, QhdsHeaderNavItem } from "./QhdsHeader.types";
import { containsActiveHref, getMobileNavItemId, getPlainLabel } from "./QhdsHeader.utils";
import type { QhdsMobileMainNavState } from "./useQhdsMobileMainNav";

interface QhdsMobileMainNavProps {
  activeHref?: string;
  ariaLabel: string;
  ctaItems: QhdsHeaderCtaItem[];
  heading: string;
  id: string;
  items: QhdsHeaderNavItem[];
  mobileNav: QhdsMobileMainNavState;
}

export function QhdsMobileMainNav({
  activeHref,
  ariaLabel,
  ctaItems,
  heading,
  id,
  items,
  mobileNav
}: QhdsMobileMainNavProps) {
  const menuClasses = [
    "qld__main-nav__menu",
    "qld__main-nav__menu--dark-alt",
    "qhds-header__main-nav-menu"
  ].join(" ");

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
      <a className={className} href={item.href} {...mobileNav.getMobileNavigationProps(item.href)}>
        {item.icon}
        <span className="qld__main-nav__item-text" data-name={label}>{item.label}</span>
      </a>
    );
  }

  function renderMobileSubNavItem(item: QhdsHeaderNavItem, index: number, parentKey: string) {
    const current = Boolean(activeHref && item.href === activeHref);
    const itemId = getMobileNavItemId(item, index, parentKey);

    return (
      <li className={current ? "active" : undefined} key={item.id ?? item.href ?? itemId}>
        {current ? (
          <span aria-current="page" className="qld__main-nav__sub-item-text">{item.label}</span>
        ) : (
          <a href={item.href} {...mobileNav.getMobileNavigationProps(item.href)}>
            <span className="qld__main-nav__sub-item-text">{item.label}</span>
          </a>
        )}
      </li>
    );
  }

  function renderMobileSubHeading(item: QhdsHeaderNavItem, current: boolean) {
    if (current) {
      return (
        <span aria-current="page" className="qld__main-nav__sub-heading">
          <span className="qld__main-nav__sub-item-text qld__display-lg">{item.label}</span>
          <QhdsIcon size="lg" symbol="arrow-right" />
        </span>
      );
    }

    return (
      <a className="qld__main-nav__sub-heading" href={item.href} {...mobileNav.getMobileNavigationProps(item.href)}>
        <span className="qld__main-nav__sub-item-text qld__display-lg">{item.label}</span>
        <QhdsIcon size="lg" symbol="arrow-right" />
      </a>
    );
  }

  function renderMobileSubFooterLink(item: QhdsHeaderNavItem, current: boolean) {
    if (current) {
      return (
        <span aria-current="page" className="qld__cta-link qld__cta-link--view-all">
          <span className="qld__cta-link--view-all-icon--wrapper">View all</span>
        </span>
      );
    }

    return (
      <a className="qld__cta-link qld__cta-link--view-all" href={item.href} {...mobileNav.getMobileNavigationProps(item.href)}>
        <span className="qld__cta-link--view-all-icon--wrapper">View all</span>
      </a>
    );
  }

  function renderMobileSubNav(item: QhdsHeaderNavItem, itemId: string, childListId: string, childItems: QhdsHeaderNavItem[], expanded: boolean) {
    const current = Boolean(activeHref && item.href === activeHref);

    return (
      <div
        className={["qld__main-nav__menu-sub", expanded ? "qld__accordion--open" : "qld__accordion--closed", "qld__accordion__body"]
          .join(" ")}
        hidden={!expanded}
        id={childListId}
      >
        <div className="qld__main-nav__menu-sub-inner">
          <div className="qld__main-nav__sub-head">
            {renderMobileSubHeading(item, current)}
          </div>
          <hr className="qld__horizontal-rule qld__horizontal-rule--lg" />
          <ul className="qld__link-columns qld__link-columns--3-col qld__link-list">
            {childItems.map((childItem, childIndex) => renderMobileSubNavItem(childItem, childIndex, itemId))}
          </ul>
          <div className="qld__main-nav__sub-footer">
            <hr className="qld__horizontal-rule qld__horizontal-rule--lg" />
            {renderMobileSubFooterLink(item, current)}
          </div>
        </div>
      </div>
    );
  }

  function renderMobileNavItem(item: QhdsHeaderNavItem, index: number, parentKey = id) {
    const childItems = item.items ?? [];
    const hasChildren = childItems.length > 0;
    const current = Boolean(activeHref && item.href === activeHref);
    const active = current || childItems.some((child) => containsActiveHref(child, activeHref));
    const itemId = getMobileNavItemId(item, index, parentKey);
    const childListId = `${itemId}-children`;
    const expanded = hasChildren ? mobileNav.expandedMobileNavIds.includes(itemId) : false;
    const label = getPlainLabel(item.label, `item ${index + 1}`);
    const itemLinkClasses = [
      "qld__main-nav__item-link",
      hasChildren ? "qld__main-nav__item-link--desktop-hide" : undefined,
      expanded ? "qld__main-nav__item-link--open" : undefined,
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
              onClick={() => mobileNav.toggleMobileNavItem(itemId)}
              type="button"
            >
              <span className="qld__main-nav__item-toggle-text" data-name={label}>{item.label}</span>
              <QhdsIcon size="xs" symbol="chevron-up" />
            </button>
          ) : null}
        </div>
        {hasChildren ? renderMobileSubNav(item, itemId, childListId, childItems, expanded) : null}
      </li>
    );
  }

  return (
    <nav aria-label={ariaLabel} className="qld__main-nav qld__main-nav--mega qhds-header__main-nav" id="mainmenu">
      <div className="container-fluid">
        <div aria-hidden={mobileNav.mobileMainNavOpen ? undefined : "true"} className={mobileNav.contentClasses} id={id}>
          <div className={menuClasses} ref={mobileNav.mobileMenuRef}>
            <div className="qld__main-nav__menu-inner">
              <div
                className="qld__main-nav__focus-trap-top"
                onFocus={mobileNav.focusLastMobileNavItem}
                tabIndex={mobileNav.mobileMainNavOpen ? 0 : undefined}
              />
              <div className="qld__main-nav__header qld__main-nav__header--dark-alt">
                <h2 className="qld__main-nav__menu-heading" ref={mobileNav.menuHeadingRef} tabIndex={-1}>{heading}</h2>
                <button
                  aria-controls={id}
                  aria-expanded={mobileNav.mobileMainNavOpen ? "true" : "false"}
                  className="qld__main-nav__toggle qld__main-nav__toggle--close"
                  onClick={() => mobileNav.closeMobileMainNav()}
                  type="button"
                >
                  <QhdsIcon size="sm" symbol="close" />
                  <span className="qld__main-nav__toggle-text">Close</span>
                </button>
              </div>
              <ul className="qld__link-list qld__link-list--flex qhds-header__main-nav-list">
                {items.map((item, index) => renderMobileNavItem(item, index))}
              </ul>
              {ctaItems.length > 0 ? (
                <>
                  <div className={ctaItems.length > 1 ? "qld__mega-nav_mobile-filler-120" : "qld__mega-nav_mobile-filler-60"} />
                  <div className="qld__main-nav__cta-wrapper qld__main-nav__cta-wrapper--dark-alt qhds-header__main-nav-cta-wrapper">
                    <ul className="qld__link-list qld__link-list--flex">
                      {ctaItems.map((item) => (
                        <li className="qld__main-nav__item qld__main-nav__item--cta" key={`mobile-${item.href}-${item.label}`}>
                          <div className="qld__main-nav__item-title">
                            <a className="qld__main-nav__item-link" href={item.href} {...mobileNav.getMobileNavigationProps(item.href)}>
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
                onFocus={mobileNav.focusFirstMobileNavItem}
                tabIndex={mobileNav.mobileMainNavOpen ? 0 : undefined}
              />
            </div>
          </div>
          <div
            aria-controls={id}
            className="qld__main-nav__overlay"
            onClick={() => mobileNav.closeMobileMainNav()}
          />
        </div>
      </div>
    </nav>
  );
}
