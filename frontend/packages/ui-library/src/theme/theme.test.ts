import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const themeScss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "theme.scss"), "utf8");

describe("QHDS SCSS theme entrypoint", () => {
  it("applies QHDS typography, link and focus tokens globally", () => {
    expect(themeScss).toContain("@use \"../../../ui-tokens/src/styles\"");
    expect(themeScss).toContain("@use \"./qhds-grid\"");
    expect(themeScss).toContain("font-family: var(--qhds-font-family-base)");
    expect(themeScss).toContain("font-family: var(--qhds-font-family-heading)");
    expect(themeScss).toContain("font-weight: var(--qhds-font-weight-semibold)");
    expect(themeScss).toContain("font-size: var(--qhds-font-size-h1-mobile)");
    expect(themeScss).toContain("line-height: var(--qhds-line-height-h1-mobile)");
    expect(themeScss).toContain("font-size: var(--qhds-font-size-h1-desktop)");
    expect(themeScss).toContain("line-height: var(--qhds-line-height-h1-desktop)");
    expect(themeScss).toContain("font-size: var(--qhds-font-size-h2-mobile)");
    expect(themeScss).toContain("font-size: var(--qhds-font-size-h2-desktop)");
    expect(themeScss).toContain("font-size: var(--qhds-font-size-h3-mobile)");
    expect(themeScss).toContain("line-height: var(--qhds-line-height-h3)");
    expect(themeScss).toContain("font-size: var(--qhds-font-size-h6-mobile)");
    expect(themeScss).toContain("line-height: var(--qhds-line-height-h6)");
    expect(themeScss).toContain("letter-spacing: var(--qhds-letter-spacing-default)");
    expect(themeScss).toContain("color: var(--qhds-color-link)");
    expect(themeScss).toContain("text-decoration-thickness: var(--qhds-link-decoration-thickness)");
    expect(themeScss).toContain("text-decoration-thickness: var(--qhds-link-decoration-thickness-hover)");
    expect(themeScss).toContain("outline: 3px solid var(--qhds-color-focus)");
    expect(themeScss).toContain("outline-offset: 2px");
  });

  it("mirrors QHDS body, abstract and display rhythm", () => {
    expect(themeScss).toContain(".qld__body p");
    expect(themeScss).toContain("line-height: var(--qhds-line-height-paragraph)");
    expect(themeScss).toContain(".qld__body *:not([type=\"hidden\"]) + p");
    expect(themeScss).toContain("margin-top: var(--qhds-paragraph-spacing-body)");
    expect(themeScss).toContain(".qld__abstract");
    expect(themeScss).toContain("font-size: var(--qhds-font-size-lead-mobile)");
    expect(themeScss).toContain("font-size: var(--qhds-font-size-lead-desktop)");
    expect(themeScss).toContain(".qld__display-xxxl");
    expect(themeScss).toContain("font-size: 3rem");
  });

  it("exposes QHDS light, alternate and dark body surface hooks", () => {
    expect(themeScss).toContain(".qld__body--light");
    expect(themeScss).toContain(".qld__body--alt");
    expect(themeScss).toContain(".qld__body--dark");
    expect(themeScss).toContain(".qld__body--dark-alt");
    expect(themeScss).toContain(".qld__footer--dark-alt");
    expect(themeScss).toContain("--qhds-color-heading: var(--qhds-palette-bright-heading)");
    expect(themeScss).toContain("--qhds-color-background: var(--qhds-palette-alt-background)");
    expect(themeScss).toContain("--qhds-color-background: var(--qhds-palette-bold-background)");
    expect(themeScss).toContain("--qhds-color-background: var(--qhds-palette-strong-background)");
    expect(themeScss).toContain("--qhds-color-link-visited: var(--qhds-palette-bold-link-visited)");
    expect(themeScss).toContain("--qhds-color-link-visited: var(--qhds-palette-strong-link-visited)");
    expect(themeScss).toContain("--qhds-color-action: var(--qhds-palette-bright-action)");
    expect(themeScss).toContain("--qhds-color-error: var(--qhds-palette-feedback-error)");
    expect(themeScss).toContain("--qhds-color-error: var(--QLD-color-status__error--lightest)");
    expect(themeScss).toContain("--qhds-color-invalid-border: var(--qhds-palette-feedback-error)");
    expect(themeScss).toContain("--qhds-color-invalid-border: var(--QLD-color-status__error--lightest)");
  });
});
