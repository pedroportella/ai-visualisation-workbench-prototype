"use client";

import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";

import { QhdsIcon } from "../QhdsIcon";

import "./QhdsSideNav.scss";

export interface QhdsSideNavItem {
  badge?: ReactNode;
  expanded?: boolean;
  href: string;
  icon?: ReactNode;
  id?: string;
  items?: QhdsSideNavItem[];
  label: ReactNode;
}

export interface QhdsSideNavProps {
  activeHref?: string;
  ariaLabel?: string;
  headingHref?: string;
  headingIcon?: ReactNode;
  heading?: ReactNode;
  id?: string;
  items: QhdsSideNavItem[];
  navId?: string;
  onNavigate?: (href: string) => void;
}

function containsActiveItem(item: QhdsSideNavItem, activeHref?: string): boolean {
  return Boolean(activeHref && (item.href === activeHref || item.items?.some((child) => containsActiveItem(child, activeHref))));
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

function getItemId(item: QhdsSideNavItem, index: number, parentKey: string): string {
  const source = item.id ?? item.href ?? getPlainLabel(item.label, `${parentKey}-${index}`);

  return `${parentKey}-${index}-${slugify(source)}`;
}

function collectExpandableItemIds(items: QhdsSideNavItem[], parentKey: string): string[] {
  return items.flatMap((item, index) => {
    const itemId = getItemId(item, index, parentKey);
    const childItems = item.items ?? [];
    const childIds = collectExpandableItemIds(childItems, itemId);

    return childItems.length > 0 ? [itemId, ...childIds] : childIds;
  });
}

function collectOpenItemIds(items: QhdsSideNavItem[], activeHref: string | undefined, parentKey: string): string[] {
  return items.flatMap((item, index) => {
    const itemId = getItemId(item, index, parentKey);
    const childItems = item.items ?? [];
    const childOpenIds = collectOpenItemIds(childItems, activeHref, itemId);
    const current = Boolean(activeHref && item.href === activeHref);
    const childIsActive = childItems.some((child) => containsActiveItem(child, activeHref));
    const shouldOpen = childItems.length > 0 && Boolean(item.expanded || current || childIsActive);

    return shouldOpen ? [itemId, ...childOpenIds] : childOpenIds;
  });
}

function arraysEqual(first: string[], second: string[]): boolean {
  return first.length === second.length && first.every((value, index) => value === second[index]);
}

export function QhdsSideNav({
  activeHref,
  ariaLabel = "left navigation",
  heading,
  headingHref,
  headingIcon,
  id,
  items,
  navId = "left-nav",
  onNavigate
}: QhdsSideNavProps) {
  const navItems = useMemo(
    () => (heading && headingHref ? [{ href: headingHref, icon: headingIcon, id: "home", label: heading }, ...items] : items),
    [heading, headingHref, headingIcon, items]
  );
  const expandableItemIds = useMemo(() => collectExpandableItemIds(navItems, navId), [navItems, navId]);
  const openItemIds = useMemo(() => collectOpenItemIds(navItems, activeHref, navId), [activeHref, navItems, navId]);
  const [expandedItemIds, setExpandedItemIds] = useState<string[]>(openItemIds);

  useEffect(() => {
    setExpandedItemIds((currentExpandedItemIds) => {
      const knownIds = new Set(expandableItemIds);
      const nextExpandedItemIds = currentExpandedItemIds.filter((itemId) => knownIds.has(itemId));

      for (const itemId of openItemIds) {
        if (!nextExpandedItemIds.includes(itemId)) {
          nextExpandedItemIds.push(itemId);
        }
      }

      return arraysEqual(currentExpandedItemIds, nextExpandedItemIds) ? currentExpandedItemIds : nextExpandedItemIds;
    });
  }, [expandableItemIds, openItemIds]);

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

  function renderLinkContent(item: QhdsSideNavItem) {
    return (
      <>
        {item.icon ? <span className="qld__left-nav__item-icon">{item.icon}</span> : null}
        <span className="qld__left-nav__item-text">{item.label}</span>
        {item.badge ? <span className="qhds-side-nav__badge">{item.badge}</span> : null}
      </>
    );
  }

  function toggleItem(itemId: string) {
    setExpandedItemIds((currentExpandedItemIds) =>
      currentExpandedItemIds.includes(itemId)
        ? currentExpandedItemIds.filter((expandedItemId) => expandedItemId !== itemId)
        : [...currentExpandedItemIds, itemId]
    );
  }

  function renderItem(item: QhdsSideNavItem, index: number, parentKey: string) {
    const childItems = item.items ?? [];
    const hasChildren = childItems.length > 0;
    const current = Boolean(activeHref && item.href === activeHref);
    const itemId = getItemId(item, index, parentKey);
    const expanded = hasChildren ? expandedItemIds.includes(itemId) : false;
    const key = item.id ?? item.href;
    const childListId = `${itemId}-children`;
    const linkClasses = ["qld__left-nav__item-link", hasChildren && expanded ? "qld__left-nav__item-link--open" : undefined]
      .filter(Boolean)
      .join(" ");
    const labelText = getPlainLabel(item.label, `item ${index + 1}`);

    return (
      <li
        aria-current={current ? "page" : undefined}
        className={[current ? "active" : undefined, hasChildren ? "has-child" : undefined, "qhds-side-nav__item"]
          .filter(Boolean)
          .join(" ")}
        key={key}
      >
        {current ? (
          <span className={linkClasses}>{renderLinkContent(item)}</span>
        ) : (
          <a className={linkClasses} href={item.href} {...getNavigationProps(item.href)}>
            {renderLinkContent(item)}
          </a>
        )}
        {hasChildren ? (
          <>
            <button
              aria-controls={childListId}
              aria-expanded={expanded ? "true" : "false"}
              aria-selected={expanded ? "true" : "false"}
              aria-label={`Toggle navigation, ${labelText}`}
              className={["qld__left-nav__item-toggle", expanded ? "qld__accordion--open" : "qld__accordion--closed"].join(" ")}
              onClick={() => toggleItem(itemId)}
              type="button"
            >
              <QhdsIcon size="sm" symbol="chevron-up" />
            </button>
            {renderItems(childItems, true, itemId, childListId, expanded)}
          </>
        ) : null}
      </li>
    );
  }

  function renderItems(navItems: QhdsSideNavItem[], nested = false, parentKey = navId, listId?: string, expanded = true) {
    const classes = [
      "qld__link-list",
      nested ? (expanded ? "qld__accordion--open" : "qld__accordion--closed") : undefined,
      nested ? "qld__accordion__body" : undefined,
      "qhds-side-nav__list",
      nested ? "qhds-side-nav__list--nested" : undefined
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <ul className={classes} hidden={nested ? !expanded : undefined} id={listId}>
        {navItems.map((item, index) => renderItem(item, index, parentKey))}
      </ul>
    );
  }

  return (
    <div className="qld__left-nav qhds-side-nav" id={id}>
      <nav aria-label={ariaLabel} className="qld__left-nav__content qhds-side-nav__content" id={navId}>
        {renderItems(navItems)}
      </nav>
    </div>
  );
}
