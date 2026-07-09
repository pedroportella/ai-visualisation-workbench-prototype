import { expect, test, type Page } from "@playwright/test";

const routes = [
  {
    ceiling: 12_000,
    heading: "Evidence Workbench",
    path: "/evidence-workbench",
    readySelector: ".evidence-workbench-overview"
  },
  {
    ceiling: 16_000,
    heading: "Review answer",
    path: "/evidence-workbench/review",
    readySelector: ".evidence-workbench-review-decision-section"
  },
  {
    ceiling: 18_000,
    heading: "Source evidence",
    path: "/evidence-workbench/sources",
    readySelector: ".evidence-workbench-source-trace"
  },
  {
    ceiling: 14_000,
    heading: "Evidence map",
    path: "/evidence-workbench/process",
    readySelector: ".evidence-workbench-process-map"
  },
  {
    ceiling: 12_000,
    heading: "Audit state",
    path: "/evidence-workbench/audit",
    readySelector: ".evidence-workbench-audit-summary"
  }
];
const viewports = [
  { height: 900, headerMax: 120, headerMin: 72, label: "desktop", width: 1440 },
  { height: 844, headerMax: 160, headerMin: 72, label: "mobile", width: 390 }
];
const colourSchemes = ["light", "dark"] as const;

for (const viewport of viewports) {
  for (const colourScheme of colourSchemes) {
    test.describe(`no-screenshot semantic, layout and ${colourScheme} theme checks at ${viewport.label}`, () => {
      test.use({ colorScheme: colourScheme, viewport });

      for (const route of routes) {
        test(`${route.path} preserves main semantics, contrast and themed surfaces`, async ({
          page
        }) => {
          assertRuntime();
          printRuntime(route.path, viewport.label, colourScheme);

          await page.goto(route.path);
          await expect(
            page.getByRole("heading", { level: 1, name: route.heading })
          ).toBeVisible();
          await expect(page.locator(route.readySelector).first()).toBeVisible();

          await expectMainAndHeadingContract(page, route.heading);
          await expectCompactTaskHeader(page, viewport.headerMin, viewport.headerMax);
          await expectEvidenceDataStatePlacement(page);
          await expectNoDuplicateIds(page);
          await expectAriaReferencesResolve(page);
          await expectNoVisibleFocusableContentInsideAriaHidden(page);
          await expectHeadingOrder(page);
          await expectNoHorizontalOverflow(page);
          await expectMainRegionsHaveBoxes(page);
          await expectRouteHeightWithinCeiling(page, route.ceiling);
          await expectActionControlsFitContainers(page);
          await expectActiveContrastSamples(page);
          await expectThemeColourSamples(page, route.path, viewport.label, colourScheme);
          await expectSkipLinkFocus(page);
          await expectResponsiveNavigation(page, viewport.label);

          if (route.path.endsWith("/process")) {
            const textMapButton = page.getByRole("button", { name: /Text process map/ });
            await expect(textMapButton).toHaveAttribute("aria-expanded", "false");
            await expect(page.locator("#process-map-text-fallback")).toBeHidden();
            await textMapButton.click();
            await expect(textMapButton).toHaveAttribute("aria-expanded", "true");
            await expect(page.locator("#process-map-text-fallback")).toBeVisible();
            await page.locator("#process-map-text-fallback").focus();
            await expect(page.locator("#process-map-text-fallback")).toBeFocused();
          }
        });
      }
    });
  }
}

test.describe("no-screenshot mobile drawer checks", () => {
  test.use({ viewport: { height: 844, width: 390 } });

  test("mobile drawer traps focus, hides main and restores focus", async ({
    page
  }) => {
    assertRuntime();
    printRuntime("/evidence-workbench", "mobile-drawer");

    await page.goto("/evidence-workbench");
    const menuButton = page.getByRole("button", { name: "Menu" });

    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".main")).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator(".qld__footer")).toHaveAttribute("aria-hidden", "true");
    await expect(page.getByRole("heading", { level: 2, name: "Menu" })).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { exact: true, name: "Close" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(".main")).not.toHaveAttribute("aria-hidden", "true");
    await expect(page.locator(".qld__footer")).not.toHaveAttribute("aria-hidden", "true");
    await expect(menuButton).toBeFocused();
  });
});

test.describe("no-screenshot header and footer theme stability", () => {
  test.use({ viewport: { height: 900, width: 1440 } });

  test("keeps header and footer computed colours unchanged between light and dark", async ({
    page
  }) => {
    assertRuntime();

    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/evidence-workbench");
    await expect(page.getByRole("heading", { level: 1, name: "Evidence Workbench" })).toBeVisible();
    const lightSamples = await collectHeaderFooterSamples(page);

    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Evidence Workbench" })).toBeVisible();
    const darkSamples = await collectHeaderFooterSamples(page);

    console.log(
      [
        "[aivis-visual-theme] route=/evidence-workbench",
        "[aivis-visual-theme] viewport=desktop",
        "[aivis-visual-theme] headerFooterStable=true",
        `[aivis-visual-theme] light=${JSON.stringify(lightSamples)}`,
        `[aivis-visual-theme] dark=${JSON.stringify(darkSamples)}`
      ].join("\n")
    );

    expect(darkSamples).toEqual(lightSamples);
  });
});

async function expectMainAndHeadingContract(page: Page, expectedHeading: string) {
  const failures = await page.evaluate((heading) => {
    const isElementVisible = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0"
      );
    };
    const mains = Array.from(document.querySelectorAll("main"));
    const main = mains[0];
    const region = document.querySelector<HTMLElement>("#aivis-main");
    const h1s = Array.from(main?.querySelectorAll("h1") ?? []).filter(isElementVisible);
    const labelledBy = region?.getAttribute("aria-labelledby") ?? "";
    const title = document.getElementById(labelledBy);
    const result = [];

    if (mains.length !== 1) {
      result.push(`expected 1 main, found ${mains.length}`);
    }

    if (!region) {
      result.push("#aivis-main is missing");
    } else {
      if (region.tabIndex !== -1) {
        result.push("#aivis-main is not focusable");
      }

      if (region.parentElement !== main) {
        result.push("#aivis-main is not a direct child of main");
      }

      if (!region.classList.contains("qld__body")) {
        result.push("#aivis-main lost qld__body");
      }
    }

    if (h1s.length !== 1) {
      result.push(`expected 1 visible h1 in main, found ${h1s.length}`);
    } else if (h1s[0]?.textContent?.trim() !== heading) {
      result.push(`h1 text mismatch: ${h1s[0]?.textContent?.trim() ?? ""}`);
    }

    if (labelledBy !== "evidence-workbench-title") {
      result.push(`#aivis-main aria-labelledby mismatch: ${labelledBy}`);
    }

    if (!title || title !== h1s[0]) {
      result.push("#aivis-main is not labelled by the route H1");
    }

    if (main?.querySelector('[role="banner"]')) {
      result.push('role="banner" found inside main');
    }

    const directNestedBody = Array.from(region?.children ?? []).find((child) =>
      child.classList.contains("qld__body")
    );

    if (directNestedBody) {
      result.push("direct nested qld__body wrapper found under #aivis-main");
    }

    return result;
  }, expectedHeading);

  expect(failures).toEqual([]);
}

async function expectCompactTaskHeader(page: Page, minHeight: number, maxHeight: number) {
  const metrics = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".workbench-task-header");
    const nextContent = header?.nextElementSibling as HTMLElement | null;
    const rect = header?.getBoundingClientRect();
    const nextRect = nextContent?.getBoundingClientRect();

    return {
      bottom: rect?.bottom ?? 0,
      dataStateInHeader: Boolean(header?.querySelector('[aria-label="Evidence data state"]')),
      height: rect?.height ?? 0,
      oldIntroCount: document.querySelectorAll(".workbench-view-intro").length,
      routeDescriptionInHeader:
        header?.textContent?.includes("AIVIS is a simulated evidence workbench") ??
        false,
      top: rect?.top ?? 0,
      workGap: nextRect && rect ? Math.max(0, nextRect.top - rect.bottom) : -1
    };
  });

  console.log(
    [
      `[aivis-visual] taskHeaderHeight=${Math.round(metrics.height)}px`,
      `[aivis-visual] taskHeaderTop=${Math.round(metrics.top)}px`,
      `[aivis-visual] taskHeaderBottom=${Math.round(metrics.bottom)}px`,
      `[aivis-visual] gapToFirstContent=${Math.round(metrics.workGap)}px`
    ].join("\n")
  );

  expect(metrics.oldIntroCount).toBe(0);
  expect(metrics.height).toBeGreaterThanOrEqual(minHeight);
  expect(metrics.height).toBeLessThanOrEqual(maxHeight);
  expect(metrics.workGap).toBeGreaterThanOrEqual(0);
  expect(metrics.workGap).toBeLessThanOrEqual(32);
  expect(metrics.routeDescriptionInHeader).toBe(false);
  expect(metrics.dataStateInHeader).toBe(false);
}

async function expectEvidenceDataStatePlacement(page: Page) {
  const metrics = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".workbench-task-header");
    const dataState = document.querySelector<HTMLElement>('[aria-label="Evidence data state"]');
    const summary = document.querySelector<HTMLElement>(".evidence-workbench-data-state__summary");
    const refresh = document.querySelector<HTMLElement>(".evidence-workbench-data-state__refresh-action");
    const headerRect = header?.getBoundingClientRect();
    const dataStateRect = dataState?.getBoundingClientRect();
    const summaryRect = summary?.getBoundingClientRect();
    const refreshRect = refresh?.getBoundingClientRect();

    return {
      dataStateAfterHeader:
        Boolean(headerRect && dataStateRect && dataStateRect.top >= headerRect.bottom),
      dataStateIsNextSibling: header?.nextElementSibling === dataState,
      gapFromHeader:
        headerRect && dataStateRect ? Math.max(0, dataStateRect.top - headerRect.bottom) : -1,
      refreshGapFromSummary:
        summaryRect && refreshRect ? Math.max(0, refreshRect.left - summaryRect.right) : -1,
      refreshRightGap:
        dataStateRect && refreshRect ? Math.abs(dataStateRect.right - refreshRect.right) : -1,
      text: dataState?.textContent?.replace(/\s+/g, " ").trim() ?? ""
    };
  });

  console.log(
    [
      `[aivis-visual] dataStateGapFromHeader=${Math.round(metrics.gapFromHeader)}px`,
      `[aivis-visual] dataStateRefreshRightGap=${Math.round(metrics.refreshRightGap)}px`,
      `[aivis-visual] dataStateRefreshGapFromSummary=${Math.round(metrics.refreshGapFromSummary)}px`
    ].join("\n")
  );

  expect(metrics.dataStateIsNextSibling).toBe(true);
  expect(metrics.dataStateAfterHeader).toBe(true);
  expect(metrics.gapFromHeader).toBeGreaterThanOrEqual(0);
  expect(metrics.gapFromHeader).toBeLessThanOrEqual(12);
  expect(metrics.refreshRightGap).toBeLessThanOrEqual(2);
  expect(metrics.refreshGapFromSummary).toBeGreaterThanOrEqual(0);
  expect(metrics.refreshGapFromSummary).toBeLessThanOrEqual(24);
  expect(metrics.text).toContain("Source");
  expect(metrics.text).toContain("Refresh evidence");
}

async function expectNoDuplicateIds(page: Page) {
  const duplicates = await page.evaluate(() => {
    const seen = new Set<string>();
    const repeated = new Set<string>();

    for (const element of document.querySelectorAll<HTMLElement>("[id]")) {
      if (seen.has(element.id)) {
        repeated.add(element.id);
      }

      seen.add(element.id);
    }

    return Array.from(repeated);
  });

  expect(duplicates).toEqual([]);
}

async function expectAriaReferencesResolve(page: Page) {
  const failures = await page.evaluate(() => {
    const attributes = ["aria-controls", "aria-describedby", "aria-labelledby"] as const;

    return Array.from(document.querySelectorAll<HTMLElement>("*")).flatMap((element) =>
      attributes.flatMap((attribute) => {
        const value = element.getAttribute(attribute);

        if (!value) {
          return [];
        }

        return value
          .split(/\s+/)
          .filter(Boolean)
          .filter((id) => !document.getElementById(id))
          .map((id) => `${attribute}="${id}" missing target`);
      })
    );
  });

  expect(failures).toEqual([]);
}

async function expectNoVisibleFocusableContentInsideAriaHidden(page: Page) {
  const failures = await page.evaluate(() =>
    {
      const isElementVisible = (element: Element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0"
        );
      };

      return Array.from(document.querySelectorAll<HTMLElement>('[aria-hidden="true"]')).flatMap(
        (hiddenRoot) =>
          Array.from(
            hiddenRoot.querySelectorAll<HTMLElement>(
              'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          )
            .filter(isElementVisible)
            .map((element) => element.textContent?.trim() || element.tagName)
      );
    }
  );

  expect(failures).toEqual([]);
}

async function expectHeadingOrder(page: Page) {
  const failures = await page.evaluate(() => {
    const isElementVisible = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0"
      );
    };
    const headings = Array.from(
      document.querySelectorAll<HTMLHeadingElement>("main h1, main h2, main h3, main h4, main h5, main h6")
    ).filter(isElementVisible);
    const result = [];
    let previousLevel = 0;

    for (const heading of headings) {
      const level = Number(heading.tagName.slice(1));

      if (previousLevel > 0 && level > previousLevel + 1) {
        result.push(`${heading.textContent?.trim() ?? heading.tagName} skips from h${previousLevel} to h${level}`);
      }

      previousLevel = level;
    }

    return result;
  });

  expect(failures).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    documentScrollWidth: document.documentElement.scrollWidth
  }));

  expect(metrics.documentScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 2);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 2);
}

async function expectMainRegionsHaveBoxes(page: Page) {
  const failures = await page.evaluate(() => {
    const isElementVisible = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0"
      );
    };
    const main = document.querySelector("#aivis-main");
    if (!main) {
      return ["#aivis-main is missing"];
    }

    const visibleMajorRegions = Array.from(
      main.querySelectorAll(
        [
          ".evidence-workbench-overview",
          ".evidence-workbench-task-launcher",
          ".evidence-workbench-review-decision-section",
          ".evidence-workbench-source-review-section",
          ".evidence-workbench-source-trace",
          ".evidence-workbench-source-inventory-table",
          ".evidence-workbench-process-map",
          ".evidence-workbench-audit-summary",
          ".evidence-workbench-review-actions",
          "article"
        ].join(", ")
      )
    ).filter(isElementVisible);

    return visibleMajorRegions.length > 0 ? [] : ["main has no visible major content region"];
  });

  expect(failures).toEqual([]);
}

async function expectRouteHeightWithinCeiling(page: Page, ceiling: number) {
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(scrollHeight).toBeLessThanOrEqual(ceiling);
}

async function expectActionControlsFitContainers(page: Page) {
  const failures = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        ".evidence-workbench-review-actions__action, .evidence-workbench-review-actions__copy-state"
      )
    ).flatMap((container) => {
      const parentRect = container.getBoundingClientRect();
      const controls = Array.from(container.querySelectorAll("button, a, textarea"));

      return controls.flatMap((control) => {
        const rect = control.getBoundingClientRect();
        const overflows =
          rect.left < parentRect.left - 2 ||
          rect.right > parentRect.right + 2 ||
          rect.width > parentRect.width + 2;

        return overflows
          ? [`${control.textContent?.trim() || control.tagName} overflows its action container`]
          : [];
      });
    })
  );

  expect(failures).toEqual([]);
}

async function expectActiveContrastSamples(page: Page) {
  const failures = await page.evaluate(() => {
    const isElementVisible = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0"
      );
    };
    const parseRgb = (value: string) => {
      const match = /^rgba?\(([^)]+)\)$/.exec(value.trim());

      if (!match) {
        return null;
      }

      const [red, green, blue, alpha = "1"] = match[1]
        .replace(/\s*\/\s*/, " ")
        .split(/[,\s]+/)
        .filter(Boolean);
      const parsedAlpha = Number.parseFloat(alpha);

      if (parsedAlpha === 0) {
        return null;
      }

      return {
        blue: Number.parseFloat(blue),
        green: Number.parseFloat(green),
        red: Number.parseFloat(red)
      };
    };
    const findBackgroundColor = (element: HTMLElement) => {
      let current: HTMLElement | null = element;

      while (current) {
        const parsed = parseRgb(getComputedStyle(current).backgroundColor);

        if (parsed) {
          return parsed;
        }

        current = current.parentElement;
      }

      return parseRgb(getComputedStyle(document.body).backgroundColor);
    };
    const linearise = (channel: number) => {
      const value = channel / 255;

      return value <= 0.03928
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    };
    const relativeLuminance = (color: { blue: number; green: number; red: number }) =>
      0.2126 * linearise(color.red) +
      0.7152 * linearise(color.green) +
      0.0722 * linearise(color.blue);
    const contrastRatio = (
      foreground: { blue: number; green: number; red: number },
      background: { blue: number; green: number; red: number }
    ) => {
      const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
      const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));

      return (lighter + 0.05) / (darker + 0.05);
    };
    const selectors = [
      "main h1",
      "main h2",
      "main h3",
      "main a",
      "main button:not(:disabled)",
      ".aivis-evidence-card",
      ".aivis-evidence-status",
      ".aivis-evidence-warning-list__item strong",
      ".aivis-evidence-warning-list__item p",
      ".evidence-workbench-answer-markdown p",
      ".evidence-workbench-citation",
      ".evidence-workbench-code-block code",
      ".evidence-workbench-generated-diagram__step",
      ".evidence-workbench-process-map__fallback",
      ".evidence-workbench-process-map__node",
      ".evidence-workbench-review-decision-card",
      ".evidence-workbench-current-blocker",
      ".evidence-workbench-supporting-evidence",
      ".evidence-workbench-selected-claim-warning",
      ".evidence-workbench-source-inventory__summary",
      ".qhds-table td",
      ".qhds-table th",
      ".workbench-task-header .aivis-evidence-status",
      ".qhds-side-nav a"
    ].join(", ");

    return Array.from(document.querySelectorAll<HTMLElement>(selectors))
      .filter(isElementVisible)
      .filter((element) => element.getAttribute("aria-disabled") !== "true")
      .filter((element) => Boolean(element.textContent?.trim()))
      .flatMap((element) => {
        const style = getComputedStyle(element);
        const foreground = parseRgb(style.color);
        const background = findBackgroundColor(element);

        if (!foreground || !background) {
          return [];
        }

        const ratio = contrastRatio(foreground, background);
        const fontSize = Number.parseFloat(style.fontSize);
        const fontWeight = Number.parseInt(style.fontWeight, 10);
        const largeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
        const threshold = largeText ? 3 : 4.5;

        return ratio + 0.01 < threshold
          ? [`${element.textContent?.trim() || element.tagName} contrast ${ratio.toFixed(2)} below ${threshold}`]
          : [];
      });
  });

  expect(failures).toEqual([]);
}

async function expectThemeColourSamples(
  page: Page,
  path: string,
  viewportLabel: string,
  colourScheme: "dark" | "light"
) {
  const sideNavInteractionSamples = await collectSideNavInteractionSamples(page);
  const result = await page.evaluate(
    ({ colourScheme, path, viewportLabel }) => {
      const parseRgb = (value: string) => {
        const match = /^rgba?\(([^)]+)\)$/.exec(value.trim());

        if (!match) {
          return null;
        }

        const [red, green, blue, alpha = "1"] = match[1]
          .replace(/\s*\/\s*/, " ")
          .split(/[,\s]+/)
          .filter(Boolean);
        const parsedAlpha = Number.parseFloat(alpha);

        if (parsedAlpha === 0) {
          return null;
        }

        return {
          blue: Number.parseFloat(blue),
          green: Number.parseFloat(green),
          red: Number.parseFloat(red)
        };
      };
      const linearise = (channel: number) => {
        const value = channel / 255;

        return value <= 0.03928
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4;
      };
      const relativeLuminance = (color: { blue: number; green: number; red: number }) =>
        0.2126 * linearise(color.red) +
        0.7152 * linearise(color.green) +
        0.0722 * linearise(color.blue);
      const isElementVisible = (element: Element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0"
        );
      };
      const effectiveBackground = (element: HTMLElement) => {
        let current: HTMLElement | null = element;

        while (current) {
          const background = window.getComputedStyle(current).backgroundColor;

          if (parseRgb(background)) {
            return background;
          }

          current = current.parentElement;
        }

        return window.getComputedStyle(document.body).backgroundColor;
      };
      const sampleSpecs = [
        { label: "body", required: true, selector: "body" },
        { label: "layout", required: true, selector: ".qhds-layout" },
        { label: "app-shell", required: true, selector: ".aivis-app-shell" },
        { label: "main", required: true, selector: ".qhds-layout__main" },
        { label: "main-region", required: true, selector: "#aivis-main" },
        { label: "main-section-body", required: true, selector: ".qhds-layout__main-section-body" },
        { label: "side-nav-shell", required: viewportLabel === "desktop", selector: ".qhds-layout__left-nav" },
        { label: "side-nav", required: viewportLabel === "desktop", selector: ".qhds-side-nav" },
        { label: "side-nav-active", required: viewportLabel === "desktop", selector: ".qhds-side-nav__item.active > .qld__left-nav__item-link" },
        { label: "side-nav-open", selector: ".qld__left-nav__item-link--open" },
        { label: "side-nav-nested", selector: ".qhds-side-nav__list--nested .qld__left-nav__item-link" },
        { label: "side-nav-toggle", selector: ".qld__left-nav__item-toggle" },
        { label: "side-nav-badge", selector: ".qhds-side-nav__badge" },
        { label: "side-nav-icon", selector: ".qld__left-nav__item-icon .qld__icon" },
        { label: "task-header", required: true, selector: ".workbench-task-header" },
        { label: "content-section", selector: ".qhds-content-section" },
        { label: "overview-card", selector: ".evidence-workbench-overview-card" },
        { label: "review-decision", selector: ".evidence-workbench-review-decision-card" },
        { label: "current-blocker", selector: ".evidence-workbench-current-blocker" },
        { label: "review-actions", selector: ".evidence-workbench-review-actions" },
        { label: "card", selector: ".qhds-card" },
        { label: "panel", selector: ".evidence-workbench-panel" },
        { label: "tag", selector: ".aivis-evidence-status" },
        { label: "table", selector: ".qhds-table" },
        { label: "warning", selector: ".aivis-evidence-warning-list__item, .evidence-workbench-selected-claim-warning" },
        { label: "markdown", selector: ".evidence-workbench-answer-markdown" },
        { label: "code", selector: ".evidence-workbench-code-block" },
        { label: "process-map", selector: ".evidence-workbench-process-map__viewport" },
        { label: "process-node", selector: ".evidence-workbench-process-map__node" },
        { label: "fallback-panel", selector: ".evidence-workbench-process-map__fallback, .evidence-workbench-generated-diagram" },
        { label: "context-panel", selector: ".aivis-evidence-context" },
        { label: "form-control", selector: ".qhds-textarea" }
      ];
      const failures: string[] = [];
      const samples = sampleSpecs.flatMap((spec) => {
        const element = document.querySelector<HTMLElement>(spec.selector);

        if (!element || !isElementVisible(element)) {
          return spec.required ? [{ failure: `${spec.label} missing or hidden` }] : [];
        }

        const style = window.getComputedStyle(element);
        const background = effectiveBackground(element);
        const parsedBackground = parseRgb(background);
        const luminance = parsedBackground ? relativeLuminance(parsedBackground) : null;

        return [{
          background: style.backgroundColor,
          border: style.borderColor,
          color: style.color,
          effectiveBackground: background,
          failure: null,
          label: spec.label,
          luminance
        }];
      });

      for (const sample of samples) {
        if (sample.failure) {
          failures.push(sample.failure);
          continue;
        }

        if (colourScheme === "dark" && sample.luminance !== null && sample.luminance > 0.55) {
          failures.push(`${sample.label} effective background is too light for dark theme: ${sample.effectiveBackground}`);
        }

        if (
          colourScheme === "light" &&
          ["body", "layout", "app-shell", "main", "main-region", "main-section-body"].includes(sample.label) &&
          sample.luminance !== null &&
          sample.luminance < 0.45
        ) {
          failures.push(`${sample.label} effective background is too dark for light theme: ${sample.effectiveBackground}`);
        }
      }

      return {
        failures,
        path,
        samples: samples.filter((sample) => !sample.failure),
        viewportLabel
      };
    },
    { colourScheme, path, viewportLabel }
  );

  console.log(
    [
      `[aivis-visual-theme] route=${path}`,
      `[aivis-visual-theme] viewport=${viewportLabel}`,
      `[aivis-visual-theme] colourScheme=${colourScheme}`,
      ...result.samples.map(
        (sample) =>
          `[aivis-visual-theme] ${sample.label} color=${sample.color} bg=${sample.background} effectiveBg=${sample.effectiveBackground} border=${sample.border}`
      ),
      ...sideNavInteractionSamples.map(
        (sample) =>
          `[aivis-visual-theme] ${sample.label} color=${sample.color} bg=${sample.background} outline=${sample.outlineColor} boxShadow=${sample.boxShadow}`
      )
    ].join("\n")
  );

  expect(result.failures).toEqual([]);
}

async function collectSideNavInteractionSamples(page: Page) {
  const samples: Array<{
    background: string;
    boxShadow: string;
    color: string;
    label: string;
    outlineColor: string;
  }> = [];
  const link = page.locator(".qhds-side-nav .qld__left-nav__item-link").first();
  const toggle = page.locator(".qhds-side-nav .qld__left-nav__item-toggle").first();

  if (await link.isVisible().catch(() => false)) {
    await link.hover();
    samples.push(await link.evaluate((element) => {
      const style = window.getComputedStyle(element);

      return {
        background: style.backgroundColor,
        boxShadow: style.boxShadow,
        color: style.color,
        label: "side-nav-link-hover",
        outlineColor: style.outlineColor
      };
    }));

    await link.focus();
    samples.push(await link.evaluate((element) => {
      const style = window.getComputedStyle(element);

      return {
        background: style.backgroundColor,
        boxShadow: style.boxShadow,
        color: style.color,
        label: "side-nav-link-focus",
        outlineColor: style.outlineColor
      };
    }));
  }

  if (await toggle.isVisible().catch(() => false)) {
    await toggle.hover();
    samples.push(await toggle.evaluate((element) => {
      const style = window.getComputedStyle(element);

      return {
        background: style.backgroundColor,
        boxShadow: style.boxShadow,
        color: style.color,
        label: "side-nav-toggle-hover",
        outlineColor: style.outlineColor
      };
    }));
  }

  return samples;
}

async function collectHeaderFooterSamples(page: Page) {
  return page.evaluate(() => {
    const sample = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);

      if (!element) {
        return null;
      }

      const style = window.getComputedStyle(element);

      return {
        background: style.backgroundColor,
        borderTopColor: style.borderTopColor,
        color: style.color
      };
    };

    return {
      footer: sample(".qld__footer"),
      footerContent: sample(".qhds-footer__content"),
      header: sample(".qld__header"),
      headerMain: sample(".qld__header__main"),
      preHeader: sample(".qld__header__pre-header")
    };
  });
}

async function expectSkipLinkFocus(page: Page) {
  await page.locator(".qhds-layout__skip-link").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#aivis-main")).toBeFocused();
}

async function expectResponsiveNavigation(page: Page, viewportLabel: string) {
  const state = await page.evaluate(() => {
    const sideNav = document.querySelector<HTMLElement>(".qhds-side-nav");
    const sideNavStyle = sideNav ? getComputedStyle(sideNav) : null;
    const sectionSkip = document.querySelector<HTMLElement>(".qhds-layout__skip-link--section-nav");
    const sectionSkipStyle = sectionSkip ? getComputedStyle(sectionSkip) : null;
    const menuButton = document.querySelector<HTMLElement>("#main-nav-mobile");
    const menuButtonStyle = menuButton ? getComputedStyle(menuButton) : null;

    return {
      menuButtonVisible: Boolean(menuButton && menuButtonStyle?.display !== "none"),
      sectionSkipVisible: Boolean(sectionSkip && sectionSkipStyle?.display !== "none"),
      sideNavVisible: Boolean(sideNav && sideNavStyle?.display !== "none")
    };
  });

  if (viewportLabel === "mobile") {
    expect(state.sideNavVisible).toBe(false);
    expect(state.sectionSkipVisible).toBe(false);
    expect(state.menuButtonVisible).toBe(true);
    return;
  }

  expect(state.sideNavVisible).toBe(true);
  expect(state.sectionSkipVisible).toBe(true);
}

function assertRuntime() {
  expect(process.env.AIVIS_E2E_MODE).toBe("mock");
  expect(process.env.AIVIS_E2E_EXPECT_BACKEND).toBe("0");
  expect(process.env.AIVIS_E2E_BASE_URL).toBeTruthy();
}

function printRuntime(path: string, viewportLabel: string, colourScheme?: "dark" | "light") {
  console.log(
    [
      `[aivis-visual] route=${path}`,
      `[aivis-visual] viewport=${viewportLabel}`,
      colourScheme ? `[aivis-visual] colourScheme=${colourScheme}` : null,
      `[aivis-visual] mode=${process.env.AIVIS_E2E_MODE}`,
      `[aivis-visual] baseUrl=${process.env.AIVIS_E2E_BASE_URL}`,
      `[aivis-visual] runtimeOwner=${process.env.AIVIS_E2E_RUNTIME_OWNER}`,
      "[aivis-visual] screenshotCapture=disabled",
      "[aivis-visual] teardownStatus=owned-by-wrapper"
    ].filter(Boolean).join("\n")
  );
}
