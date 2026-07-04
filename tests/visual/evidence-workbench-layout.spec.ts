import { expect, test, type Page } from "@playwright/test";

const routes = [
  { heading: "Evidence Workbench", path: "/evidence-workbench", ceiling: 12_000 },
  { heading: "Review answer", path: "/evidence-workbench/review", ceiling: 16_000 },
  { heading: "Source blockers", path: "/evidence-workbench/sources", ceiling: 18_000 },
  { heading: "Evidence map", path: "/evidence-workbench/process", ceiling: 14_000 },
  { heading: "Audit state", path: "/evidence-workbench/audit", ceiling: 12_000 }
];
const viewports = [
  { height: 900, label: "desktop", width: 1440 },
  { height: 768, label: "constrained", width: 1024 },
  { height: 844, label: "mobile", width: 390 }
];

for (const viewport of viewports) {
  test.describe(`no-screenshot layout checks at ${viewport.label}`, () => {
    test.use({ viewport });

    for (const route of routes) {
      test(`${route.path} has visible ordered regions without horizontal overflow`, async ({
        page
      }) => {
        assertRuntime();
        printRuntime(route.path);

        await page.goto(route.path);
        await expect(
          page.getByRole("heading", { level: 1, name: route.heading })
        ).toBeVisible();
        await expect(page.locator("[data-workbench-view]")).toHaveAttribute(
          "data-workbench-view",
          /overview|review|sources|process|audit/
        );

        await expectNoHorizontalOverflow(page);
        await expectMainRegionsHaveBoxes(page);
        await expectHeadingsAreVisibleAndOrdered(page);
        await expectRouteHeightWithinCeiling(page, route.ceiling);
        await expectActionControlsFitContainers(page);

        if (route.path.endsWith("/process")) {
          await expect(page.locator("#process-map-text-fallback")).toBeVisible();
          await page.locator("#process-map-text-fallback").focus();
          await expect(page.locator("#process-map-text-fallback")).toBeFocused();
        }
      });
    }
  });
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
    const route = document.querySelector("[data-workbench-view]");
    if (!route) {
      return ["active workbench route is missing"];
    }

    const visibleMajorRegions = Array.from(
      route.querySelectorAll(
        [
          ".evidence-workbench-overview",
          ".evidence-workbench-task-launcher",
          ".evidence-workbench-primary-frame",
          ".evidence-workbench-source-review-section",
          ".evidence-workbench-source-inventory",
          ".evidence-workbench-process-map",
          ".evidence-workbench-audit-summary",
          ".evidence-workbench-review-actions",
          "article"
        ].join(", ")
      )
    ).filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    return visibleMajorRegions.length > 0 ? [] : ["active workbench route has no visible major content region"];
  });

  expect(failures).toEqual([]);
}

async function expectHeadingsAreVisibleAndOrdered(page: Page) {
  const failures = await page.evaluate(() => {
    const route = document.querySelector("[data-workbench-view]");
    const h1 = route?.querySelector("h1") ?? null;
    const nextHeading =
      Array.from(route?.querySelectorAll("h2, h3") ?? []).find((heading) => {
        const rect = heading.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }) ?? null;

    if (!h1 || !nextHeading) {
      return ["missing route heading or primary content heading"];
    }

    const h1Rect = h1.getBoundingClientRect();
    const nextRect = nextHeading.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const result = [];

    if (h1Rect.width <= 0 || h1Rect.height <= 0) {
      result.push("route H1 has an empty box");
    }

    if (h1Rect.bottom <= 0 || h1Rect.top >= viewportHeight) {
      result.push("route H1 is outside the viewport");
    }

    if (nextRect.width <= 0 || nextRect.height <= 0) {
      result.push("primary route heading has an empty box");
    }

    if (h1.compareDocumentPosition(nextHeading) & Node.DOCUMENT_POSITION_PRECEDING) {
      result.push("primary route heading appears before the route H1 in DOM order");
    }

    return result;
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

function assertRuntime() {
  expect(process.env.AIVIS_E2E_MODE).toBe("mock");
  expect(process.env.AIVIS_E2E_EXPECT_BACKEND).toBe("0");
  expect(process.env.AIVIS_E2E_BASE_URL).toBeTruthy();
}

function printRuntime(path: string) {
  console.log(
    [
      `[aivis-visual] route=${path}`,
      `[aivis-visual] mode=${process.env.AIVIS_E2E_MODE}`,
      `[aivis-visual] baseUrl=${process.env.AIVIS_E2E_BASE_URL}`,
      `[aivis-visual] runtimeOwner=${process.env.AIVIS_E2E_RUNTIME_OWNER}`,
      "[aivis-visual] screenshotCapture=disabled",
      "[aivis-visual] teardownStatus=owned-by-wrapper"
    ].join("\n")
  );
}
