import { act } from "react";

import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QhdsHeader } from "./QhdsHeader";
import { cleanupInteractiveRender, renderInteractive } from "./QhdsHeader.test-helpers";

afterEach(() => {
  cleanupInteractiveRender();
});

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

  it("can hide mocked account controls when a caller owns auth state", () => {
    const html = renderToStaticMarkup(<QhdsHeader showAccountControls={false} />);

    expect(html).not.toContain("qld__header__cta-wrapper");
    expect(html).not.toContain("Avery Taylor");
    expect(html).not.toContain("Logout");
    expect(html).not.toContain("QLD-icons.svg#profile");
    expect(html).not.toContain("QLD-icons.svg#log-out");
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
});
