import { act } from "react";

import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { QhdsHeader } from "./QhdsHeader";
import {
  appendHiddenRegions,
  cleanupInteractiveRender,
  flushEffects,
  mobileMainNavItems,
  renderInteractive
} from "./QhdsHeader.test-helpers";

afterEach(() => {
  cleanupInteractiveRender();
});

describe("QhdsHeader mobile main navigation", () => {
  it("renders the mobile pre-header Menu control and QHDS main navigation drawer when enabled", () => {
    const html = renderToStaticMarkup(
      <QhdsHeader
        accountHref="/account"
        accountName="Fixture reviewer"
        ctaItems={[{ href: "/support", label: "Support" }]}
        logoutHref="/exit"
        logoutLabel="Exit"
        mobileMainNavActiveHref="/evidence-workbench/sources"
        mobileMainNavItems={mobileMainNavItems}
        showMobileMainNav
      />
    );

    expect(html).toContain('id="main-nav-mobile"');
    expect(html).toContain('aria-controls="main-nav"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain("qld__main-nav__toggle-search");
    expect(html).toContain("qld__main-nav__toggle--open main-nav__toggle-open");
    expect(html).toContain('class="qld__header__main-nav-controls qhds-header__main-nav-controls"');
    expect(html).toContain('class="qld__main-nav qld__main-nav--mega qhds-header__main-nav"');
    expect(html).toContain('class="qld__main-nav__content qld__main-nav__content--closed qhds-header__main-nav-content" id="main-nav"');
    expect(html).toContain('class="qld__main-nav__menu qld__main-nav__menu--dark-alt qhds-header__main-nav-menu"');
    expect(html).toContain('class="qld__main-nav__header qld__main-nav__header--dark-alt"');
    expect(html).toContain("qld__main-nav__item-link--desktop-hide");
    expect(html).toContain("qld__main-nav__item-link--open");
    expect(html).toContain('class="qld__main-nav__sub-head"');
    expect(html).toContain('class="qld__main-nav__sub-heading"');
    expect(html).toContain('class="qld__horizontal-rule qld__horizontal-rule--lg"');
    expect(html).toContain('class="qld__link-columns qld__link-columns--3-col qld__link-list"');
    expect(html).toContain('class="qld__main-nav__sub-footer"');
    expect(html).toContain('class="qld__cta-link qld__cta-link--view-all"');
    expect(html).toContain('class="qld__cta-link--view-all-icon--wrapper"');
    expect(html).toContain("View all");
    expect(html).toContain('<div aria-controls="main-nav" class="qld__main-nav__overlay"></div>');
    expect(html).toContain('class="qld__main-nav__cta-wrapper qld__main-nav__cta-wrapper--dark-alt qhds-header__main-nav-cta-wrapper"');
    expect(html).toContain("Overview");
    expect(html).toContain("Review answer");
    expect(html).toContain("Source evidence");
    expect(html).toContain("Evidence map");
    expect(html).toContain("Audit state");
    expect(html).toContain("Fixture reviewer");
    expect(html).toContain("Exit");
    expect(html).toContain("Support");
  });

  it("opens the mobile drawer, locks scroll, hides page regions and closes with Escape", async () => {
    const { footer, main } = appendHiddenRegions();
    const element = renderInteractive(
      <QhdsHeader
        accountHref="/account"
        accountName="Fixture reviewer"
        logoutHref="/exit"
        logoutLabel="Exit"
        mobileMainNavItems={mobileMainNavItems}
        showMobileMainNav
      />
    );
    const menuButton = element.querySelector<HTMLButtonElement>("#main-nav-mobile");
    const drawerContent = element.querySelector<HTMLElement>("#main-nav");
    const heading = element.querySelector<HTMLHeadingElement>(".qld__main-nav__menu-heading");

    expect(menuButton).not.toBeNull();
    expect(drawerContent?.className).not.toContain("qld__main-nav__content--open");
    expect(menuButton?.getAttribute("aria-expanded")).toBe("false");

    act(() => {
      menuButton?.click();
    });
    await flushEffects();

    expect(drawerContent?.className).toContain("qld__main-nav__content--open");
    expect(menuButton?.getAttribute("aria-expanded")).toBe("true");
    expect(document.body.classList.contains("qld__main-nav__scroll--locked")).toBe(true);
    expect(main.getAttribute("aria-hidden")).toBe("true");
    expect(footer.getAttribute("aria-hidden")).toBe("true");
    expect(document.activeElement).toBe(heading);

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    await flushEffects();

    expect(drawerContent?.className).not.toContain("qld__main-nav__content--open");
    expect(menuButton?.getAttribute("aria-expanded")).toBe("false");
    expect(document.body.classList.contains("qld__main-nav__scroll--locked")).toBe(false);
    expect(main.hasAttribute("aria-hidden")).toBe(false);
    expect(footer.hasAttribute("aria-hidden")).toBe(false);
    expect(document.activeElement).toBe(menuButton);

    main.remove();
    footer.remove();
  });

  it("closes the mobile drawer from the overlay and contains focus with QHDS focus traps", async () => {
    const element = renderInteractive(
      <QhdsHeader
        accountHref="/account"
        accountName="Fixture reviewer"
        logoutHref="/exit"
        logoutLabel="Exit"
        mobileMainNavItems={mobileMainNavItems}
        showMobileMainNav
      />
    );
    const menuButton = element.querySelector<HTMLButtonElement>("#main-nav-mobile");
    const drawerContent = element.querySelector<HTMLElement>("#main-nav");
    const closeButton = element.querySelector<HTMLButtonElement>(".qld__main-nav__toggle--close");
    const topTrap = element.querySelector<HTMLDivElement>(".qld__main-nav__focus-trap-top");
    const bottomTrap = element.querySelector<HTMLDivElement>(".qld__main-nav__focus-trap-bottom");
    const overlay = element.querySelector<HTMLElement>(".qld__main-nav__overlay");
    const exitLink = element.querySelector<HTMLAnchorElement>('.qld__main-nav__cta-wrapper a[href="/exit"]');

    act(() => {
      menuButton?.click();
    });
    await flushEffects();

    act(() => {
      bottomTrap?.focus();
    });

    expect(document.activeElement).toBe(closeButton);

    act(() => {
      topTrap?.focus();
    });

    expect(document.activeElement).toBe(exitLink);

    act(() => {
      overlay?.click();
    });
    await flushEffects();

    expect(drawerContent?.className).not.toContain("qld__main-nav__content--open");
    expect(menuButton?.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(menuButton);
  });
});
