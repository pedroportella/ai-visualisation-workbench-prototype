import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { prototypeTokens } from "./index";

const styles = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "styles.scss"),
  "utf8"
);

describe("prototypeTokens", () => {
  it("documents the selected QHDS token boundary", () => {
    expect(prototypeTokens.source).toBe("qhds-reference-css-snapshot");
    expect(prototypeTokens.selectedPalette).toBe("qld-health");
    expect(prototypeTokens.color.primitive.heading).toBe("#000053");
    expect(prototypeTokens.color.primitive.text).toBe("#353535");
    expect(prototypeTokens.color.primitive.link).toBe("#005eb8");
    expect(prototypeTokens.color.primitive.lightFocus).toBe("#002e85");
    expect(prototypeTokens.color.primitive.neutral50).toBe("#f5f5f5");
    expect(prototypeTokens.color.primitive.neutral100).toBe("#ebebeb");
    expect(prototypeTokens.color.primitive.lightBackground).toBe("#e6f6ff");
    expect(prototypeTokens.color.primitive.lightBackgroundAlt).toBe("#e3e7ea");
    expect(prototypeTokens.color.primitive.darkBackground).toBe("#005eb8");
    expect(prototypeTokens.color.primitive.darkBackgroundAlt).toBe("#001d74");
    expect(prototypeTokens.color.primitive.darkModeBackground).toBe("#000053");
    expect(prototypeTokens.color.primitive.darkVisitedLink).toBe("#ffffff");
  });

  it("exposes QHDS custom properties and stable copied aliases for components", () => {
    expect(prototypeTokens.color.qldVariables).toContain("--QLD-color-light__heading");
    expect(prototypeTokens.color.qldVariables).toContain("--QLD-color-dark__background--alt");
    expect(prototypeTokens.color.qldVariables).toContain("--QLD-underline__offset");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-color-background");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-color-heading");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-color-action");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-color-link");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-color-error-border");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-color-invalid-border");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-color-info-text");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-color-success-text");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-color-warning-text");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-color-header-background");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-color-left-nav-background");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-color-left-nav-border");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-color-left-nav-link-hover");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-color-left-nav-active-accent");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-shadow-button-hover");
    expect(prototypeTokens.color.semanticVariables).toContain("--qhds-shadow-side-nav-toggle");
  });

  it("documents QHDS typography and spacing tokens", () => {
    expect(prototypeTokens.typography.fontFamilyBase).toContain("Noto Sans");
    expect(prototypeTokens.typography.fontFamilySiteTitle).toContain("Noto Sans");
    expect(prototypeTokens.typography.h1Desktop).toBe("3rem");
    expect(prototypeTokens.typography.h1DesktopLineHeight).toBe("3.75rem");
    expect(prototypeTokens.typography.h1Mobile).toBe("2rem");
    expect(prototypeTokens.typography.h2Mobile).toBe("1.75rem");
    expect(prototypeTokens.typography.h3).toBe("1.5rem");
    expect(prototypeTokens.typography.h6).toBe("0.875rem");
    expect(prototypeTokens.typography.fontWeightRegular).toBe(400);
    expect(prototypeTokens.typography.fontWeightSemibold).toBe(600);
    expect(prototypeTokens.typography.fontWeightBold).toBe(700);
    expect(prototypeTokens.typography.lineHeightParagraph).toBe(1.75);
    expect(prototypeTokens.typography.letterSpacingDefault).toBe(0);
    expect(prototypeTokens.layout.sectionPaddingDesktop).toBe("4rem");
    expect(prototypeTokens.layout.sectionPaddingMobile).toBe("2.25rem");
  });

  it("documents AIVIS workbench semantic token boundaries", () => {
    expect(prototypeTokens.aivis.theme.defaultMode).toBe("system");
    expect(prototypeTokens.aivis.theme.modes).toEqual(["light", "dark"]);
    expect(prototypeTokens.aivis.theme.selectors).toContain("[data-aivis-theme=\"dark\"]");
    expect(prototypeTokens.aivis.theme.selectors).toContain("[data-theme=\"light\"]");
    expect(prototypeTokens.aivis.theme.systemPreference).toBe("@media (prefers-color-scheme: dark)");
    expect(prototypeTokens.aivis.color.paletteVariables).toContain("--aivis-palette-page");
    expect(prototypeTokens.aivis.color.paletteVariables).toContain("--aivis-palette-warning-surface");
    expect(prototypeTokens.aivis.color.semanticVariables).toContain("--aivis-shell-page");
    expect(prototypeTokens.aivis.color.semanticVariables).toContain("--aivis-shell-header-background");
    expect(prototypeTokens.aivis.color.semanticVariables).toContain("--aivis-shell-footer-muted");
    expect(prototypeTokens.aivis.color.semanticVariables).toContain("--aivis-shell-sidebar-active-background");
    expect(prototypeTokens.aivis.color.semanticVariables).toContain("--aivis-shell-chip-background");
    expect(prototypeTokens.aivis.color.semanticVariables).toContain("--aivis-color-hero-background");
    expect(prototypeTokens.aivis.color.semanticVariables).toContain("--aivis-color-context-background");
    expect(prototypeTokens.aivis.color.semanticVariables).toContain("--aivis-color-warning-border");
    expect(prototypeTokens.aivis.spacingVariables).toContain("--aivis-workbench-card-padding");
    expect(prototypeTokens.aivis.typographyVariables).toContain("--aivis-font-size-title-fluid");
    expect(prototypeTokens.aivis.typographyVariables).toContain("--aivis-font-size-title-mobile");
    expect(prototypeTokens.aivis.layoutVariables).toContain("--aivis-workbench-grid-columns");
    expect(styles).toContain("--aivis-shell-page: var(--aivis-palette-page)");
    expect(styles).toContain("--aivis-shell-header-background: var(--aivis-palette-accent)");
    expect(styles).toContain("--aivis-shell-footer-muted: var(--QLD-color-dark__text--lighter)");
    expect(styles).toContain("--aivis-shell-sidebar-active-background: var(--aivis-palette-accent-soft)");
    expect(styles).toContain("--aivis-shell-radius: var(--aivis-radius-md)");
    expect(styles).toContain("--aivis-color-hero-background: var(--aivis-palette-accent-strong)");
    expect(styles).toContain("--aivis-color-context-background: var(--aivis-palette-surface-muted)");
    expect(styles).toContain("--aivis-color-warning-border: rgb(var(--aivis-palette-warning-border-rgb) / 28%)");
    expect(styles).toContain("--aivis-workbench-card-padding: var(--aivis-space-3-25)");
    expect(styles).toContain("[data-aivis-theme=\"light\"]");
    expect(styles).toContain("[data-aivis-theme=\"dark\"]");
    expect(styles).toContain("--aivis-color-scheme: dark");
    expect(styles).toContain("--aivis-palette-page: var(--qhds-palette-strong-background)");
    expect(styles).toContain("--aivis-palette-surface: var(--qhds-palette-strong-surface)");
    expect(styles).toContain("--aivis-palette-text: var(--qhds-palette-strong-text)");
    expect(styles).toContain(":root:not(.light):not(.light-theme)");
  });

  it("maps QHDS light, alt, dark and dark-alt layers in SCSS", () => {
    expect(styles).toContain('--qhds-palette-name: "qld-health"');
    expect(styles).toContain("--QLD-color-light__heading: #000053");
    expect(styles).toContain("--QLD-color-light__text: #353535");
    expect(styles).toContain("--QLD-color-light__link: #005eb8");
    expect(styles).toContain("--QLD-color-light__focus: #002e85");
    expect(styles).toContain("--QLD-color-light__background: #e6f6ff");
    expect(styles).toContain("--QLD-color-light__background--alt: #e3e7ea");
    expect(styles).toContain("--QLD-color-dark__background: #005eb8");
    expect(styles).toContain("--QLD-color-dark__background--alt: #001d74");
    expect(styles).toContain("--qhds-color-background: var(--qhds-palette-default-background)");
    expect(styles).toContain("--qhds-palette-bright-background: var(--QLD-color-light__background)");
    expect(styles).toContain("--qhds-palette-left-nav-background: var(--qhds-primitive-color-neutral-50)");
    expect(styles).toContain("--qhds-palette-left-nav-border: var(--qhds-primitive-color-neutral-100)");
    expect(styles).toContain("--qhds-palette-left-nav-link-hover: var(--QLD-color-light__action--primary-hover)");
    expect(styles).toContain("--qhds-color-left-nav-background: var(--qhds-palette-left-nav-background)");
    expect(styles).toContain("--qhds-color-left-nav-border: var(--qhds-palette-left-nav-border)");
    expect(styles).toContain("--qhds-color-left-nav-link-hover: var(--qhds-palette-left-nav-link-hover)");
    expect(styles).toContain("--qhds-color-left-nav-background: var(--qhds-palette-strong-background)");
    expect(styles).toContain("--qhds-color-left-nav-link-hover: var(--qhds-palette-strong-action)");
    expect(styles).toContain("--qhds-palette-alt-background: var(--QLD-color-light__background--alt)");
    expect(styles).toContain("--qhds-palette-bold-background: var(--QLD-color-dark__background)");
    expect(styles).toContain("--qhds-palette-bold-link-visited: var(--QLD-color-dark__link)");
    expect(styles).toContain("--qhds-palette-strong-background: var(--QLD-color-dark__background--alt)");
    expect(styles).toContain("--qhds-palette-strong-link-visited: var(--QLD-color-dark__link)");
    expect(styles).toContain("--qhds-palette-feedback-error: var(--QLD-color-status__error--darker)");
    expect(styles).toContain("--qhds-palette-feedback-error-border: var(--QLD-color-status__error)");
    expect(styles).toContain("--qhds-palette-feedback-warning-border: var(--QLD-color-status__caution--darker)");
    expect(styles).toContain("--qhds-palette-feedback-dark-background: var(--qhds-palette-bold-surface)");
    expect(styles).toContain("--qhds-palette-feedback-info-text: var(--QLD-color-light__text)");
    expect(styles).toContain("--qhds-color-overlay-disabled: rgb(0 0 0 / 10%)");
    expect(styles).toContain("--qhds-shadow-button-hover: 0 0.125rem 0.25rem rgb(0 0 0 / 20%)");
    expect(styles).toContain("@media (prefers-color-scheme: dark)");
    expect(styles).toContain(':root:not(.light):not(.light-theme):not([data-qhds-theme="light"])');
    expect(styles).toContain("--qhds-color-background: var(--qhds-primitive-color-black)");
    expect(styles).toContain("--qhds-color-link-visited: var(--qhds-palette-bold-link-visited)");
    expect(styles).toContain("--qhds-color-error: var(--QLD-color-status__error--lightest)");
    expect(styles).toContain("--qhds-color-warning-background: var(--qhds-palette-feedback-dark-background)");
    expect(styles).toContain("--qhds-color-invalid-border: var(--QLD-color-status__error--lightest)");
    expect(styles).toContain("--qhds-color-focus: var(--qhds-palette-bold-focus)");
  });

  it("keeps key CSS custom properties aligned with QHDS reference values", () => {
    expect(styles).toContain("--qhds-font-family-base: \"Noto Sans\"");
    expect(styles).toContain("--qhds-font-family-site-title: \"Noto Sans\"");
    expect(styles).toContain("--qhds-font-size-h1-mobile: 2rem");
    expect(styles).toContain("--qhds-font-size-h1-desktop: 3rem");
    expect(styles).toContain("--qhds-font-size-h2-mobile: 1.75rem");
    expect(styles).toContain("--qhds-font-size-h2-desktop: 2rem");
    expect(styles).toContain("--qhds-line-height-h1-desktop: 3.75rem");
    expect(styles).toContain("--qhds-line-height-h3: 2rem");
    expect(styles).toContain("--qhds-link-decoration-thickness: var(--QLD-underline__thickness-thin)");
    expect(styles).toContain("--qhds-link-decoration-thickness-hover: var(--QLD-underline__thickness-thick)");
    expect(styles).toContain("--qhds-link-decoration-offset: var(--QLD-underline__offset)");
    expect(styles).toContain("--qhds-section-padding-mobile: 2.25rem");
    expect(styles).toContain("--qhds-section-padding-desktop: 4rem");
  });
});
