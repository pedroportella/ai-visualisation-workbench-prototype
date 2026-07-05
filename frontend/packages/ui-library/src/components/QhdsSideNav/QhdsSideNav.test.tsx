import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { QhdsIcon } from "../QhdsIcon";
import { QhdsSideNav } from "./QhdsSideNav";

const styles = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "QhdsSideNav.scss"), "utf8");
let root: Root | undefined;
let container: HTMLDivElement | undefined;

function renderSideNav(element: ReactElement) {
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
  root = undefined;
  container = undefined;
});

describe("QhdsSideNav", () => {
  it("renders accessible QHDS-compatible left navigation with current page state", () => {
    const html = renderToStaticMarkup(
      <QhdsSideNav
        activeHref="/"
        heading="Home"
        headingHref="/"
        headingIcon={<QhdsIcon size="md" symbol="home" />}
        items={[
          { href: "/requests", label: "Requests", badge: "2" }
        ]}
      />
    );

    expect(html).toContain('class="qld__left-nav qhds-side-nav"');
    expect(html).toContain('id="left-nav"');
    expect(html).toContain("qld__left-nav__content");
    expect(html).toContain("qld__left-nav__item-link");
    expect(html).toContain("qld__left-nav__item-text");
    expect(html).toContain("qld__left-nav__item-icon");
    expect(html).toContain('class="qld__icon qld__icon--md"');
    expect(html).toContain('aria-label="left navigation"');
    expect(html).toContain('class="active qhds-side-nav__item"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Home");
    expect(html).toContain("Requests");
    expect(html).not.toContain("qld__side-nav");
    expect(html).not.toContain("qhds-side-nav__heading");
  });

  it("renders nested accordion items when their parent is active", () => {
    const html = renderToStaticMarkup(
      <QhdsSideNav
        activeHref="/requests/seniors-card"
        items={[
          {
            href: "/requests",
            label: "Requests",
            items: [{ href: "/requests/seniors-card", label: "Seniors Card" }]
          }
        ]}
      />
    );

    expect(html).toContain("has-child");
    expect(html).toContain("qld__left-nav__item-link--open");
    expect(html).toContain("qld__left-nav__item-toggle qld__accordion--open");
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('aria-controls="left-nav-0-requests-children"');
    expect(html).toContain('id="left-nav-0-requests-children"');
    expect(html).toContain("qld__accordion__body");
    expect(html).toContain("qhds-side-nav__list--nested");
    expect(html).toContain("Seniors Card");
  });

  it("keeps inactive accordion branches closed until expanded", () => {
    const html = renderToStaticMarkup(
      <QhdsSideNav
        items={[
          {
            href: "/requests",
            label: "Requests",
            items: [{ href: "/requests/seniors-card", label: "Seniors Card" }]
          }
        ]}
      />
    );

    expect(html).toContain("qld__left-nav__item-toggle qld__accordion--closed");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-selected="false"');
    expect(html).toContain("qld__accordion--closed qld__accordion__body");
    expect(html).toContain("hidden");
  });

  it("toggles inactive branches open and closed with QHDS state classes", () => {
    const element = renderSideNav(
      <QhdsSideNav
        items={[
          {
            href: "/requests",
            label: "Requests",
            items: [{ href: "/requests/seniors-card", label: "Seniors Card" }]
          }
        ]}
      />
    );
    const parentLink = element.querySelector(".qld__left-nav__item-link");
    const toggle = element.querySelector<HTMLButtonElement>(".qld__left-nav__item-toggle");
    const childList = element.querySelector<HTMLUListElement>("#left-nav-0-requests-children");

    expect(parentLink?.className).not.toContain("qld__left-nav__item-link--open");
    expect(toggle?.className).toContain("qld__accordion--closed");
    expect(toggle?.getAttribute("aria-expanded")).toBe("false");
    expect(toggle?.getAttribute("aria-selected")).toBe("false");
    expect(childList?.className).toContain("qld__accordion--closed");
    expect(childList?.hidden).toBe(true);

    act(() => {
      toggle?.click();
    });

    expect(parentLink?.className).toContain("qld__left-nav__item-link--open");
    expect(toggle?.className).toContain("qld__accordion--open");
    expect(toggle?.getAttribute("aria-expanded")).toBe("true");
    expect(toggle?.getAttribute("aria-selected")).toBe("true");
    expect(childList?.className).toContain("qld__accordion--open");
    expect(childList?.hidden).toBe(false);
    expect(document.activeElement).not.toBe(childList);

    act(() => {
      toggle?.click();
    });

    expect(parentLink?.className).not.toContain("qld__left-nav__item-link--open");
    expect(toggle?.className).toContain("qld__accordion--closed");
    expect(toggle?.getAttribute("aria-expanded")).toBe("false");
    expect(toggle?.getAttribute("aria-selected")).toBe("false");
    expect(childList?.className).toContain("qld__accordion--closed");
    expect(childList?.hidden).toBe(true);
  });

  it("matches QGDS left navigation shell and accordion control styling", () => {
    expect(styles).toContain("--qhds-left-nav-background: var(--qhds-color-left-nav-background)");
    expect(styles).toContain("--qhds-left-nav-border: var(--qhds-color-left-nav-border)");
    expect(styles).toContain("box-sizing: border-box");
    expect(styles).toContain("border-right: var(--QLD-border-width-default) solid var(--qhds-left-nav-border)");
    expect(styles).toContain("box-shadow: var(--qhds-shadow-side-nav-toggle)");
    expect(styles).toContain("display: block");
    expect(styles).toContain("position: relative");
    expect(styles).toContain("height: 1.25rem");
    expect(styles).toContain("inset: 0");
    expect(styles).toContain("position: absolute");
    expect(styles).toContain("transform: rotate(-180deg)");
    expect(styles).not.toContain("qhds-side-nav__heading");
  });

  it("keeps visited navigation links on the accessible side-nav palette", () => {
    expect(styles).toContain("a.qld__left-nav__item-link:visited");
    expect(styles).toContain("color: var(--qhds-left-nav-text)");
    expect(styles).toContain("a.qld__left-nav__item-link:visited:hover");
    expect(styles).toContain("color: var(--qhds-left-nav-link)");
    expect(styles).toContain("a.qld__left-nav__item-link--open:visited");
    expect(styles).toContain(".qld__accordion__body a.qld__left-nav__item-link:visited");
    expect(styles).toContain(".qld__accordion__body a.qld__left-nav__item-link:visited:hover");
    expect(styles).not.toContain("var(--qhds-color-link-visited)");
  });

  it("keeps focus and hover affordances visible for link rows and icon toggles", () => {
    expect(styles).toContain("a.qld__left-nav__item-link:focus-visible");
    expect(styles).toContain("box-shadow: inset 0 0 0 3px var(--qhds-left-nav-focus)");
    expect(styles).toContain(".qld__left-nav__item-toggle:focus-visible");
    expect(styles).toContain("outline: 3px solid var(--qhds-left-nav-focus)");
    expect(styles).toContain(".qld__left-nav__item-toggle:hover .qld__icon");
    expect(styles).toContain("fill: var(--qhds-left-nav-link-hover)");
  });
});
