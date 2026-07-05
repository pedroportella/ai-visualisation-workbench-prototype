import type { ReactNode } from "react";

import type { QhdsHeaderNavItem } from "./QhdsHeader.types";

export function getPlainLabel(label: ReactNode, fallback: string): string {
  if (typeof label === "string" || typeof label === "number") {
    return String(label);
  }

  return fallback;
}

function slugify(value: string): string {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "item";
}

export function getMobileNavItemId(item: QhdsHeaderNavItem, index: number, parentKey: string): string {
  const source = item.id ?? item.href ?? getPlainLabel(item.label, `${parentKey}-${index}`);

  return `${parentKey}-${index}-${slugify(source)}`;
}

export function containsActiveHref(item: QhdsHeaderNavItem, activeHref?: string): boolean {
  return Boolean(activeHref && (item.href === activeHref || item.items?.some((child) => containsActiveHref(child, activeHref))));
}

export function collectOpenMobileNavIds(
  items: QhdsHeaderNavItem[],
  activeHref: string | undefined,
  parentKey: string
): string[] {
  return items.flatMap((item, index) => {
    const itemId = getMobileNavItemId(item, index, parentKey);
    const childItems = item.items ?? [];
    const childOpenIds = collectOpenMobileNavIds(childItems, activeHref, itemId);
    const shouldOpen = childItems.length > 0 && childItems.some((child) => containsActiveHref(child, activeHref));

    return shouldOpen ? [itemId, ...childOpenIds] : childOpenIds;
  });
}
