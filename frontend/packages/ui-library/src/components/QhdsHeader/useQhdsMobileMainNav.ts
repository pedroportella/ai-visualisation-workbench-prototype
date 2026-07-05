"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type RefObject } from "react";

import type { QhdsHeaderNavItem } from "./QhdsHeader.types";
import { collectOpenMobileNavIds } from "./QhdsHeader.utils";

const MOBILE_MAIN_NAV_ANIMATION_MS = 250;

interface UseQhdsMobileMainNavArgs {
  activeHref?: string;
  enabled: boolean;
  id: string;
  items: QhdsHeaderNavItem[];
  onNavigate?: (href: string) => void;
}

export interface QhdsMobileMainNavState {
  closeMobileMainNav: (restoreFocus?: boolean) => void;
  contentClasses: string;
  expandedMobileNavIds: string[];
  focusFirstMobileNavItem: () => void;
  focusLastMobileNavItem: () => void;
  getMobileNavigationProps: (href: string) => {
    onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  };
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  menuHeadingRef: RefObject<HTMLHeadingElement | null>;
  mobileMainNavOpen: boolean;
  mobileMenuRef: RefObject<HTMLDivElement | null>;
  openMobileMainNav: () => void;
  toggleMobileNavItem: (itemId: string) => void;
}

export function useQhdsMobileMainNav({
  activeHref,
  enabled,
  id,
  items,
  onNavigate
}: UseQhdsMobileMainNavArgs): QhdsMobileMainNavState {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuHeadingRef = useRef<HTMLHeadingElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileNavAnimationTimerRef = useRef<number | undefined>(undefined);
  const returnFocusOnCloseRef = useRef(true);
  const wasMobileNavOpenRef = useRef(false);
  const openMobileNavIds = useMemo(
    () => collectOpenMobileNavIds(items, activeHref, id),
    [activeHref, id, items]
  );
  const [mobileMainNavAnimating, setMobileMainNavAnimating] = useState(false);
  const [mobileMainNavRendered, setMobileMainNavRendered] = useState(false);
  const [expandedMobileNavIds, setExpandedMobileNavIds] = useState<string[]>(openMobileNavIds);
  const [mobileMainNavOpen, setMobileMainNavOpen] = useState(false);

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

  useEffect(() => {
    if (!enabled) {
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
  }, [closeMobileMainNav, enabled, mobileMainNavOpen]);

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

  const contentClasses = [
    "qld__main-nav__content",
    mobileMainNavOpen ? "qld__main-nav__content--open" : "qld__main-nav__content--closed",
    mobileMainNavRendered ? "qhds-header__main-nav-content--rendered" : undefined,
    mobileMainNavAnimating ? "qhds-header__main-nav-content--animating" : undefined,
    "qhds-header__main-nav-content"
  ]
    .filter(Boolean)
    .join(" ");

  return {
    closeMobileMainNav,
    contentClasses,
    expandedMobileNavIds,
    focusFirstMobileNavItem,
    focusLastMobileNavItem,
    getMobileNavigationProps,
    menuButtonRef,
    menuHeadingRef,
    mobileMainNavOpen,
    mobileMenuRef,
    openMobileMainNav,
    toggleMobileNavItem
  };
}
