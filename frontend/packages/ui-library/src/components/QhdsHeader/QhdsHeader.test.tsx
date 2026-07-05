import { act } from "react";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QhdsHeader } from "./QhdsHeader";

const styles = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "QhdsHeader.scss"), "utf8");
const mobileMainNavItems = [
  { href: "/evidence-workbench", label: "Overview" },
  {
    href: "/evidence-workbench/review",
    label: "Review answer",
    items: [
      { href: "/evidence-workbench/sources", label: "Source blockers" },
      { href: "/evidence-workbench/process", label: "Evidence map" }
    ]
  },
  { href: "/evidence-workbench/audit", label: "Audit state" }
];

let root: Root | undefined;
let container: HTMLDivElement | undefined;

function renderInteractive(element: ReactNode) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);

  act(() => {
    root?.render(element);
  });

  return container;
}

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container?.remove();
  document.body.classList.remove("qld__main-nav__scroll--locked");
  root = undefined;
  container = undefined;
});

function appendHiddenRegions() {
  const main = document.createElement("main");
  const footer = document.createElement("footer");

  main.className = "main";
  footer.className = "qld__footer";
  document.body.append(main, footer);

  return { footer, main };
}

async function flushEffects() {
  await act(async () => {
    for (let tick = 0; tick < 4; tick += 1) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 0);
      });
    }
  });
}

describe("QhdsHeader", () => {
  it("renders service name and primary navigation without Next.js dependencies", () => {
    const html = renderToStaticMarkup(
      <QhdsHeader navItems={[{ href: "/status", label: "Status" }]} serviceName="Header service" />
    );

    expect(html).toContain('class="qld__header qhds-header qhds-header--app"');
    expect(html).toContain('role="banner"');
    expect(html).toContain("qld__header__pre-header");
    expect(html).toContain("qld__header__main");
    expect(html).toContain('alt="Queensland Government"');
    expect(html).toContain("header-logo-qgov--brand.svg");
    expect(html).toContain("container-fluid");
    expect(html).toContain('class="qhds-header__pre-header-link"');
    expect(html).toContain('class="qld__header__pre-header-brand-image qhds-header__pre-header-brand-image"');
    expect(html).toContain('class="qld__header__brand qhds-header__brand"');
    expect(html).toContain('class="qhds-header__brand-link"');
    expect(html).not.toContain('class="row"');
    expect(html).toContain("Header service");
    expect(html).toContain("Avery Taylor");
    expect(html).toContain("Logout");
    expect(html).toContain("QLD-icons.svg#profile");
    expect(html).toContain("QLD-icons.svg#log-out");
    expect(html).toContain('class="qld__icon qhds-header__cta-svg"');
    expect(html).toContain('href="/status"');
    expect(html).toContain('id="qld-header-main-nav"');
    expect(html).toContain('aria-label="Primary"');
  });

  it("renders the RBDM-style pre-header base link and optional CTA links", () => {
    const html = renderToStaticMarkup(
      <QhdsHeader
        actions={<button type="button">Account</button>}
        baseUrlHref="/queensland-government"
        baseUrlText="Queensland Government"
        ctaItems={[
          {
            href: "/help",
            icon: <svg focusable="false" />,
            label: "Help"
          }
        ]}
      />
    );

    expect(html).toContain('class="qld__header__pre-header-url qhds-header__pre-header-url"');
    expect(html).toContain('class="qld__header__pre-header-brand-image qhds-header__pre-header-brand-image"');
    expect(html).toContain('href="/queensland-government"');
    expect(html).toContain("Queensland Government");
    expect(html).toContain('class="qld__header__cta-wrapper qhds-header__actions"');
    expect(html).toContain('class="qld__header__cta-link qhds-header__cta-link"');
    expect(html).toContain('class="qld__header__cta-link-icon qhds-header__cta-link-icon"');
    expect(html).toContain('class="qld__header__cta-link-text qhds-header__cta-link-text"');
    expect(html).toContain("Avery Taylor");
    expect(html).toContain("Logout");
    expect(html).toContain('href="/help"');
    expect(html).toContain("Help");
    expect(html).toContain("Account");
  });

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
    expect(html).toContain('<div aria-controls="main-nav" class="qld__main-nav__overlay"></div>');
    expect(html).toContain('class="qld__main-nav__cta-wrapper qld__main-nav__cta-wrapper--dark-alt qhds-header__main-nav-cta-wrapper"');
    expect(html).toContain("Overview");
    expect(html).toContain("Review answer");
    expect(html).toContain("Source blockers");
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

  it("can hide mocked account controls when a caller owns auth state", () => {
    const html = renderToStaticMarkup(<QhdsHeader showAccountControls={false} />);

    expect(html).not.toContain("qld__header__cta-wrapper");
    expect(html).not.toContain("Avery Taylor");
    expect(html).not.toContain("Logout");
    expect(html).not.toContain("QLD-icons.svg#profile");
    expect(html).not.toContain("QLD-icons.svg#log-out");
  });

  it("supports contained width mode without changing the default app-shell mode", () => {
    const html = renderToStaticMarkup(<QhdsHeader width="contained" />);

    expect(html).toContain('class="qld__header qhds-header qhds-header--contained"');
    expect(styles).toContain(".qhds-header--app .container-fluid");
    expect(styles).toContain("padding-left: 2rem");
    expect(styles).toContain(".qhds-header--contained .container-fluid");
    expect(styles).toContain("max-width: var(--qld-grid-container-max-width)");
    expect(styles).toContain("height: 1.25rem");
    expect(styles).toContain(".qld__header__pre-header-brand-image");
    expect(styles).toContain(".qhds-header__cta-svg");
    expect(styles).toContain("color: var(--QLD-color-dark__action--secondary)");
    expect(styles).toContain("fill: var(--QLD-color-dark__action--secondary)");
    expect(styles).toContain("color: var(--QLD-color-dark__action--secondary-hover)");
    expect(styles).toContain("&__main-nav-controls");
    expect(styles).toContain("height: 3.25rem");
    expect(styles).toContain("right: -1 * $qhds-main-nav-width");
    expect(styles).toContain("transition: right 0.25s ease-out");
    expect(styles).toContain("width: $qhds-main-nav-width");
    expect(styles).toContain(".qld__main-nav__content--open:not(.qhds-header__main-nav-content--animating) .qld__main-nav__cta-wrapper");
    expect(styles).toContain("width: 100%");
    expect(styles).toContain(".qhds-header__main-nav-content--rendered .qld__main-nav__menu");
    expect(styles).toContain(".qld__main-nav__content--open .qld__main-nav__menu");
    expect(styles).toContain("body.qld__main-nav__scroll--locked");
  });

  it("supports route-style navigation callbacks without importing a router", () => {
    const onNavigate = vi.fn();
    const element = renderInteractive(
      <QhdsHeader
        accountHref="/account"
        accountName="Morgan Lee"
        baseUrlHref="/qld"
        brandHref="/home"
        ctaItems={[{ href: "/support", label: "Support" }]}
        logoutHref="/logout"
        navItems={[{ href: "/status", label: "Status" }]}
        onNavigate={onNavigate}
      />
    );
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>("a"));

    for (const link of links) {
      const event = new MouseEvent("click", { bubbles: true, cancelable: true });

      act(() => {
        link.dispatchEvent(event);
      });

      expect(event.defaultPrevented).toBe(true);
    }

    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/qld",
      "/account",
      "/logout",
      "/support",
      "/home",
      "/status"
    ]);
    expect(onNavigate).toHaveBeenNthCalledWith(1, "/qld");
    expect(onNavigate).toHaveBeenNthCalledWith(2, "/account");
    expect(onNavigate).toHaveBeenNthCalledWith(3, "/logout");
    expect(onNavigate).toHaveBeenNthCalledWith(4, "/support");
    expect(onNavigate).toHaveBeenNthCalledWith(5, "/home");
    expect(onNavigate).toHaveBeenNthCalledWith(6, "/status");
  });

  it("does not own layout skip links", () => {
    const html = renderToStaticMarkup(<QhdsHeader />);

    expect(html).not.toContain("qld__skip-link");
  });

  it("keeps header links readable after visited state is applied", () => {
    expect(styles).toContain("--qhds-color-link: var(--qhds-color-header-text)");
    expect(styles).toContain("--qhds-color-link-decoration: var(--qhds-color-header-text)");
    expect(styles).toContain("--qhds-color-link-visited: var(--qhds-color-header-text)");
  });
});
