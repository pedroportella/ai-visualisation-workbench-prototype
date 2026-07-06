import { expect, test, type Locator, type Page } from "@playwright/test";

test("mock Evidence Workbench journey stays in fallback fixture mode", async ({
  page
}) => {
  assertRuntime("mock", "0");
  printRuntime("mock");

  await page.goto("/evidence-workbench");
  await expect(page.getByRole("heading", { level: 1, name: "Evidence Workbench" })).toBeVisible();
  await expect(
    page.getByText("Backend fixture unavailable. Showing bundled fallback data.")
  ).toBeVisible();
  await expect(page.getByText("Synthetic fixture / Bundled fallback")).toBeVisible();
  await expect(page.getByText("Synthetic fixture / Backend fixture")).toHaveCount(0);

  await page.getByRole("link", { name: /^Start review$/ }).first().click();
  await expect(page).toHaveURL(/\/evidence-workbench\/review$/);
  await expect(page.getByRole("heading", { level: 1, name: "Review answer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Draft answer" })).toBeVisible();
  await expect(page.getByText("WARN-FALLBACK-003").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Request source update" })).toBeVisible();
  await expectControlCanReceiveFocus(page, "button", "Request source update");
  await page
    .locator(".evidence-workbench-source-review__issue-selector")
    .getByText("WARN-FALLBACK-003 on SRC-FALLBACK-003")
    .click();
  await expect(
    page.getByRole("radio", { name: /WARN-FALLBACK-003 on SRC-FALLBACK-003/ })
  ).toBeChecked();
  await expect(
    page.getByText("WARN-FALLBACK-003: Dispatch confirmation is missing.").first()
  ).toBeVisible();

  await page.getByRole("button", { name: "Request source update" }).click();
  await expect(
    page.getByText(
      "Request source update recorded in local UI state. Targeted WARN-FALLBACK-003 on SRC-FALLBACK-003."
    )
  ).toBeVisible();
  await expect(
    page.getByText("WARN-FALLBACK-003 on SRC-FALLBACK-003: Dispatch confirmation is missing.")
  ).toBeVisible();
  await expect(page.getByText("Copy Disabled").first()).toBeVisible();
  await page.getByRole("button", { name: "Reset local review state" }).click();
  await expect(page.getByText("Local review state reset to the loaded fixture seed.")).toBeVisible();
  await expect(
    page.getByText("No local action target recorded.")
  ).toBeVisible();
  await expect(
    page.getByRole("radio", { name: /WARN-FALLBACK-001 on SRC-FALLBACK-002/ })
  ).toBeChecked();

  await page.goto("/evidence-workbench/sources");
  await expect(page.getByRole("heading", { level: 1, name: "Source blockers" })).toBeVisible();
  await expect(
    page.getByRole("heading", { exact: true, level: 2, name: "Source inventory" })
  ).toBeVisible();
  await expect(page.getByText("Dispatch confirmation placeholder").first()).toBeVisible();
  await expectControlCanReceiveFocus(page, "link", "Continue to review actions");

  await page.goto("/evidence-workbench/process");
  await expect(page.getByRole("heading", { level: 1, name: "Evidence map" })).toBeVisible();
  await expect(page.locator("#process-map-text-fallback")).toBeVisible();
  await expect(page.locator(".evidence-workbench-process-map")).toHaveAttribute(
    "data-graph-id",
    "GRAPH-FALLBACK"
  );
  await page.locator("#process-map-text-fallback").focus();
  await expect(page.locator("#process-map-text-fallback")).toBeFocused();

  await page.goto("/evidence-workbench/audit");
  await expect(page.getByRole("heading", { level: 1, name: "Audit state" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Audit summary" })).toBeVisible();
  await expect(page.getByText("AUDIT-FALLBACK").first()).toBeVisible();
});

test("mock evidence disclosures hide closed content and reveal open content", async ({
  page
}) => {
  assertRuntime("mock", "0");

  await page.goto("/evidence-workbench/review");

  const diagramDisclosure = page.locator(".evidence-workbench-generated-diagram__fallback");
  const diagramPanel = diagramDisclosure.locator(
    ".evidence-workbench-generated-diagram__fallback-content"
  );
  const diagramSummary = diagramDisclosure.locator("summary");

  await expect(diagramDisclosure).not.toHaveAttribute("open", "");
  await expectDisclosureCueClosed(diagramDisclosure, /Diagram text fallback.*Show details/);
  await expectDisclosureContentHidden(diagramPanel);
  await diagramSummary.click();
  await expect(diagramDisclosure).toHaveAttribute("open", "");
  await expectDisclosureCueOpen(diagramDisclosure, /Diagram text fallback.*Hide details/);
  await expectDisclosureContentVisible(diagramPanel);
  await diagramSummary.click();
  await expectDisclosureCueClosed(diagramDisclosure, /Diagram text fallback.*Show details/);
  await expectDisclosureContentHidden(diagramPanel);

  const warningDisclosure = page
    .locator(".evidence-workbench-source-inspector__warning-details")
    .first();
  const warningPanel = warningDisclosure.locator(
    ".evidence-workbench-source-inspector__warning-panel"
  );

  await expect(
    page.locator(".evidence-workbench-source-inspector__top-warning")
  ).toBeVisible();
  await expect(warningDisclosure).not.toHaveAttribute("open", "");
  await expectDisclosureCueClosed(warningDisclosure, /source warnings?.*Show details/);
  await expectDisclosureContentHidden(warningPanel);
  await warningDisclosure.locator("summary").click();
  await expectDisclosureCueOpen(warningDisclosure, /source warnings?.*Hide details/);
  await expectDisclosureContentVisible(warningPanel);
  await warningDisclosure.locator("summary").click();
  await expectDisclosureCueClosed(warningDisclosure, /source warnings?.*Show details/);
  await expectDisclosureContentHidden(warningPanel);

  await page.goto("/evidence-workbench/sources");

  const sourceDisclosure = page.locator("#source-SRC-FALLBACK-002");
  const sourcePanel = sourceDisclosure.locator(
    ".evidence-workbench-source-inventory__detail-panel"
  );
  await expect(sourceDisclosure).not.toHaveAttribute("open", "");
  await expectDisclosureCueClosed(sourceDisclosure, /SRC-FALLBACK-002.*Show details/);
  await expectSourceInventoryToggleAtTop(sourceDisclosure);
  await expectSummaryContainedByDetails(sourceDisclosure);
  await expectDisclosureContentHidden(sourcePanel);
  await sourceDisclosure.locator("summary").focus();
  await expect(sourceDisclosure.locator("summary")).toBeFocused();
  await sourceDisclosure.locator("summary").click();
  await expectDisclosureCueOpen(sourceDisclosure, /SRC-FALLBACK-002.*Hide details/);
  await expectDisclosureContentVisible(sourcePanel);
});

async function expectControlCanReceiveFocus(
  page: Page,
  role: "button" | "link",
  name: string
) {
  const control = page.getByRole(role, { name }).first();
  await control.focus();
  await expect(control).toBeFocused();
}

async function expectDisclosureContentHidden(locator: Locator) {
  await expect(locator).toBeHidden();
  await expect(
    locator.evaluate((element) => element.getBoundingClientRect().height)
  ).resolves.toBe(0);
  await expect(
    locator.evaluate((element) => getComputedStyle(element).display)
  ).resolves.toBe("none");
}

async function expectDisclosureContentVisible(locator: Locator) {
  await expect(locator).toBeVisible();
  await expect(
    locator.evaluate((element) => element.getBoundingClientRect().height)
  ).resolves.toBeGreaterThan(0);
  await expect(
    locator.evaluate((element) => getComputedStyle(element).display)
  ).resolves.not.toBe("none");
}

async function expectDisclosureCueClosed(disclosure: Locator, accessibleName: RegExp) {
  await expect(disclosure.locator(".evidence-workbench-disclosure__toggle-closed")).toBeVisible();
  await expect(disclosure.locator(".evidence-workbench-disclosure__toggle-open")).toBeHidden();
  await expect(disclosure.locator("summary")).toHaveAccessibleName(accessibleName);
}

async function expectDisclosureCueOpen(disclosure: Locator, accessibleName: RegExp) {
  await expect(disclosure.locator(".evidence-workbench-disclosure__toggle-closed")).toBeHidden();
  await expect(disclosure.locator(".evidence-workbench-disclosure__toggle-open")).toBeVisible();
  await expect(disclosure.locator("summary")).toHaveAccessibleName(accessibleName);
}

async function expectSourceInventoryToggleAtTop(disclosure: Locator) {
  const summary = disclosure.locator("summary");
  const toggle = disclosure.locator(".evidence-workbench-source-inventory__toggle");
  const sourceLabel = disclosure.locator(".evidence-workbench-source-inventory__cell-label").first();

  const verticalOffsets = await summary.evaluate((summaryElement) => {
    const toggleElement = summaryElement.querySelector(
      ".evidence-workbench-source-inventory__toggle"
    );
    const labelElement = summaryElement.querySelector(
      ".evidence-workbench-source-inventory__cell-label"
    );

    if (!toggleElement || !labelElement) {
      return null;
    }

    const summaryRect = summaryElement.getBoundingClientRect();
    const toggleRect = toggleElement.getBoundingClientRect();
    const labelRect = labelElement.getBoundingClientRect();

    return {
      labelTop: labelRect.top - summaryRect.top,
      toggleTop: toggleRect.top - summaryRect.top
    };
  });

  expect(verticalOffsets).not.toBeNull();
  expect(verticalOffsets?.toggleTop).toBeLessThan(24);
  expect(Math.abs((verticalOffsets?.toggleTop ?? 0) - (verticalOffsets?.labelTop ?? 0))).toBeLessThan(12);
  await expect(toggle).toBeVisible();
  await expect(sourceLabel).toBeVisible();
}

async function expectSummaryContainedByDetails(disclosure: Locator) {
  const geometry = await disclosure.evaluate((detailsElement) => {
    const summaryElement = detailsElement.querySelector("summary");

    if (!summaryElement) {
      return null;
    }

    const detailsRect = detailsElement.getBoundingClientRect();
    const summaryRect = summaryElement.getBoundingClientRect();

    return {
      detailsLeft: detailsRect.left,
      detailsRight: detailsRect.right,
      summaryLeft: summaryRect.left,
      summaryRight: summaryRect.right,
      summaryWidth: summaryRect.width,
      detailsWidth: detailsRect.width
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry?.summaryWidth).toBeLessThanOrEqual((geometry?.detailsWidth ?? 0) + 1);
  expect(geometry?.summaryLeft).toBeGreaterThanOrEqual((geometry?.detailsLeft ?? 0) - 1);
  expect(geometry?.summaryRight).toBeLessThanOrEqual((geometry?.detailsRight ?? 0) + 1);
}

function assertRuntime(expectedMode: string, expectedBackend: string) {
  expect(process.env.AIVIS_E2E_MODE).toBe(expectedMode);
  expect(process.env.AIVIS_E2E_EXPECT_BACKEND).toBe(expectedBackend);
  expect(process.env.AIVIS_E2E_BASE_URL).toBeTruthy();
}

function printRuntime(expectedMode: string) {
  console.log(
    [
      `[aivis-e2e] mode=${process.env.AIVIS_E2E_MODE ?? expectedMode}`,
      `[aivis-e2e] baseUrl=${process.env.AIVIS_E2E_BASE_URL}`,
      `[aivis-e2e] runtimeOwner=${process.env.AIVIS_E2E_RUNTIME_OWNER}`,
      "[aivis-e2e] teardownStatus=owned-by-wrapper"
    ].join("\n")
  );
}
