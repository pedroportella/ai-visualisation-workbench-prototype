import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { QhdsHeader } from "./QhdsHeader";

const styleDir = dirname(fileURLToPath(import.meta.url));
const styles = [
  "QhdsHeader.scss",
  "_QhdsHeader.tokens.scss",
  "_QhdsHeader.shell.scss",
  "_QhdsHeader.mobile-nav.scss"
]
  .map((fileName) => readFileSync(join(styleDir, fileName), "utf8"))
  .join("\n");

describe("QhdsHeader styles", () => {
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
    expect(styles).toContain(".qld__main-nav__item-link--open");
    expect(styles).toContain("background-color: var(--qhds-primitive-color-white)");
    expect(styles).toContain("border-top-right-radius: 1rem");
    expect(styles).toContain("height: 1.75rem");
    expect(styles).toContain("margin: 0 0.625rem");
    expect(styles).toContain("min-width: 1.75rem");
    expect(styles).toContain(".qld__link-columns");
    expect(styles).toContain("border-left: var(--QLD-border-width-thick) solid var(--QLD-color-light__background--alt)");
    expect(styles).toContain("box-sizing: border-box");
    expect(styles).toContain("line-height: 1.25rem");
    expect(styles).toContain("padding: 0.875rem 1.5rem 0.9375rem");
    expect(styles).toContain(".qld__main-nav__sub-footer");
    expect(styles).toContain(".qld__cta-link--view-all-icon--wrapper");
    expect(styles).toContain("padding: 0.6rem 2.5rem 0.7rem 1.5rem");
    expect(styles).toContain("body.qld__main-nav__scroll--locked");
  });

  it("keeps header links readable after visited state is applied", () => {
    expect(styles).toContain("--qhds-color-link: var(--qhds-color-header-text)");
    expect(styles).toContain("--qhds-color-link-decoration: var(--qhds-color-header-text)");
    expect(styles).toContain("--qhds-color-link-visited: var(--qhds-color-header-text)");
  });
});
