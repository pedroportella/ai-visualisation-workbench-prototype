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
  await expectOverviewAndPersistentNavigationOwners(page);

  await page.getByRole("link", { name: /^Start review$/ }).first().click();
  await expect(page).toHaveURL(/\/evidence-workbench\/review$/);
  await expect(page.getByRole("heading", { level: 1, name: "Review answer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Decision required" })).toBeVisible();
  await expect(
    page.getByText("This answer cannot be used yet.")
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Review blocker" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Skip to final action" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Draft answer" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Current blocker" })
  ).toBeVisible();
  await expect(page.locator(".evidence-workbench-review-actions__decision-context")).toContainText(
    "Recommended action"
  );
  await expect(page.locator(".evidence-workbench-review-actions__copy-state")).toContainText(
    "Copy stays disabled because"
  );
  await expect(page.getByRole("heading", { name: "Supporting evidence" })).toBeVisible();
  await expect(page.locator("#review-source-inspector-accordion-button")).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  await expect(page.locator("#review-claims-accordion-button")).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  await expect(page.getByRole("heading", { name: "Take action" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Supporting workspaces" })).toHaveCount(0);
  await expect(page.getByText("Source blocker issues")).toHaveCount(0);
  await expectPersistentNavigationOwner(page);
  await expectReviewDecisionFlowOrder(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectReviewDecisionFlowOrder(page);
  await expectNoHorizontalOverflow(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.getByText("WARN-FALLBACK-001").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Request source update" })).toBeVisible();
  const changeBlockerButton = page.locator("#review-change-blocker-accordion-button");
  await changeBlockerButton.click();
  await expect(changeBlockerButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("WARN-FALLBACK-003").first()).toBeVisible();
  await expectControlCanReceiveFocus(
    page,
    "radio",
    "WARN-FALLBACK-003 on SRC-FALLBACK-003"
  );
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
  const auditDetailsButton = page.locator("#review-local-audit-accordion-button");
  await auditDetailsButton.click();
  await expect(auditDetailsButton).toHaveAttribute("aria-expanded", "true");
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
  await page
    .getByRole("link", { name: "SRC-FALLBACK-002: Synthetic wayfinding map extract" })
    .click();
  await expect(page).toHaveURL(/\/evidence-workbench\/sources#source-SRC-FALLBACK-002$/);
  await expect(page.getByRole("heading", { level: 1, name: "Source evidence" })).toBeVisible();
  await expectSourceRecordFocused(page, "SRC-FALLBACK-002");
  await expectControlCanReceiveFocus(page, "link", "Continue to review actions");
  await page.getByRole("link", { name: "Continue to review actions" }).click();
  await expect(page).toHaveURL(/\/evidence-workbench\/review$/);

  await page.goto("/evidence-workbench/sources");
  await expect(page.getByRole("heading", { level: 1, name: "Source evidence" })).toBeVisible();
  await expect(
    page.getByRole("heading", { exact: true, level: 2, name: "Source inventory" })
  ).toBeVisible();
  await expect(page.getByText("Source inventory table")).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Open details for SRC-FALLBACK-003: Dispatch confirmation placeholder"
    })
  ).toBeVisible();
  await page
    .getByRole("link", {
      name: "Open details for SRC-FALLBACK-003: Dispatch confirmation placeholder"
    })
    .click();
  await expect(page).toHaveURL(/\/evidence-workbench\/sources#source-SRC-FALLBACK-003$/);
  await expectSourceRecordFocused(page, "SRC-FALLBACK-003");
  await expect(page.getByText("Dispatch confirmation placeholder").first()).toBeVisible();
  await expectControlCanReceiveFocus(page, "link", "Continue to review actions");

  await page.goto("/evidence-workbench/process");
  await expect(page.getByRole("heading", { level: 1, name: "Evidence map" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Selected graph node/ })).toBeVisible();
  const textMapButton = page.getByRole("button", { name: /Text process map/ });
  await expect(textMapButton).toBeVisible();
  await expect(textMapButton).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#process-map-text-fallback")).toBeHidden();
  await expect(page.getByRole("button", { name: /Process warning ownership/ })).toBeVisible();
  await expect(page.locator(".evidence-workbench-process-map")).toHaveAttribute(
    "data-graph-id",
    "GRAPH-FALLBACK"
  );
  await textMapButton.click();
  await expect(textMapButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#process-map-text-fallback")).toBeVisible();
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

  const sourceInspectorButton = page.locator("#review-source-inspector-accordion-button");
  const sourceInspectorPanel = page.locator("#review-source-inspector-accordion-panel");
  const claimsButton = page.locator("#review-claims-accordion-button");
  const claimsPanel = page.locator("#review-claims-accordion-panel");

  await expectAccordionClosed(sourceInspectorButton, sourceInspectorPanel);
  await expectAccordionClosed(claimsButton, claimsPanel);
  await sourceInspectorButton.click();
  await expectAccordionOpen(sourceInspectorButton, sourceInspectorPanel);
  await expectAccordionClosed(claimsButton, claimsPanel);
  await claimsButton.click();
  await expectAccordionOpen(claimsButton, claimsPanel);

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

  await page.goto("/evidence-workbench/process");

  const processAccordion = page.locator(".evidence-workbench-process-map__details .qhds-accordion");
  const selectedNodeButton = page.locator("#process-selected-node-accordion-button");
  const selectedNodePanel = page.locator("#process-selected-node-accordion-panel");
  const textProcessButton = page.locator("#process-text-map-accordion-button");
  const textProcessPanel = page.locator("#process-text-map-accordion-panel");
  const warningOwnershipButton = page.locator("#process-warning-ownership-accordion-button");
  const warningOwnershipPanel = page.locator("#process-warning-ownership-accordion-panel");

  await expect(processAccordion.locator(".qhds-accordion__item")).toHaveCount(3);
  await expectAccordionRowsStacked(processAccordion.locator(".qhds-accordion__item"));
  await expect(selectedNodeButton).toHaveAccessibleName(/Selected graph node.*Show details/);
  await expect(textProcessButton).toHaveAccessibleName(/Text process map.*Show details/);
  await expect(warningOwnershipButton).toHaveAccessibleName(
    /Process warning ownership.*Show details/
  );
  await expectAccordionClosed(selectedNodeButton, selectedNodePanel);
  await expectAccordionClosed(textProcessButton, textProcessPanel);
  await expectAccordionClosed(warningOwnershipButton, warningOwnershipPanel);
  await expect(page.locator("#process-map-text-fallback")).toBeHidden();

  await selectedNodeButton.click();
  await expectAccordionOpen(selectedNodeButton, selectedNodePanel);
  await expect(selectedNodePanel.getByText("Step-free transfer assurance")).toBeVisible();

  await textProcessButton.click();
  await expectAccordionOpen(textProcessButton, textProcessPanel);
  await page.locator("#process-map-text-fallback").focus();
  await expect(page.locator("#process-map-text-fallback")).toBeFocused();

  await warningOwnershipButton.click();
  await expectAccordionOpen(warningOwnershipButton, warningOwnershipPanel);
  await expect(warningOwnershipPanel.getByText("3 active warnings")).toBeVisible();
  await expect(
    warningOwnershipPanel.getByRole("link", { name: "SRC-FALLBACK-002" })
  ).toBeVisible();
});

test("process map renders with deterministic colour mode and stable accessible fallback", async ({
  page
}) => {
  assertRuntime("mock", "0");

  const hydrationMessages: string[] = [];
  page.on("console", (message) => {
    const text = message.text();

    if (/hydration|hydrated|did not match|react-flow (light|dark)/i.test(text)) {
      hydrationMessages.push(`[${message.type()}] ${text}`);
    }
  });
  page.on("pageerror", (error) => {
    const text = error.message;

    if (/hydration|hydrated|did not match|react-flow (light|dark)/i.test(text)) {
      hydrationMessages.push(`[pageerror] ${text}`);
    }
  });

  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/evidence-workbench/process");
  await expect(page.getByRole("heading", { level: 1, name: "Evidence map" })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Interactive evidence process map" })
  ).toBeVisible();
  await expect(page.locator(".react-flow")).toHaveClass(/(^|\s)light(\s|$)/);
  await expect(page.locator(".react-flow.dark")).toHaveCount(0);
  await expect(page.locator(".react-flow.system")).toHaveCount(0);
  await expect(page.locator(".evidence-workbench-process-map")).toHaveAttribute(
    "data-selected-node-id",
    "NODE-FALLBACK-CLAIM-003"
  );
  await expect(page.locator(".evidence-workbench-process-map__node").first()).toBeVisible();

  const textMapButton = page.locator("#process-text-map-accordion-button");
  const textMapPanel = page.locator("#process-text-map-accordion-panel");

  await expect(textMapButton).toHaveAccessibleName(/Text process map.*Show details/);
  await expect(textMapButton).toHaveAttribute(
    "aria-controls",
    "process-text-map-accordion-panel"
  );
  await expect(textMapButton).toHaveAttribute("aria-expanded", "false");
  await expect(textMapPanel).toHaveAttribute(
    "aria-labelledby",
    "process-text-map-accordion-button"
  );
  await expect(textMapPanel).toHaveAttribute("hidden", "");
  await expect(page.locator("#process-map-text-fallback")).toBeHidden();
  await textMapButton.click();
  await expect(textMapButton).toHaveAccessibleName(/Text process map.*Hide details/);
  await expect(textMapButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#process-map-text-fallback")).toBeVisible();
  await page.locator("#process-map-text-fallback").focus();
  await expect(page.locator("#process-map-text-fallback")).toBeFocused();

  await page.waitForTimeout(250);
  expect(hydrationMessages).toEqual([]);
});

async function expectControlCanReceiveFocus(
  page: Page,
  role: "button" | "link" | "radio",
  name: string
) {
  const control = page.getByRole(role, { name }).first();
  await control.focus();
  await expect(control).toBeFocused();
}

async function expectOverviewAndPersistentNavigationOwners(page: Page) {
  const launcher = page.getByLabel("Evidence Workbench task launcher");

  await expect(launcher.getByRole("link", { name: "Start review" })).toBeVisible();
  await expect(launcher.getByRole("link", { name: "Review source evidence" })).toBeVisible();
  await expect(launcher.getByRole("link", { name: "Open evidence map" })).toBeVisible();
  await expect(launcher.getByRole("link", { name: "View audit state" })).toBeVisible();
  await expectPersistentNavigationOwner(page);
}

async function expectPersistentNavigationOwner(page: Page) {
  const sideNavigation = page.locator("#section-navigation");

  await expect(sideNavigation).toBeVisible();
  await expect(sideNavigation).toContainText("Overview");
  await expect(sideNavigation).toContainText("Review answer");
  await expect(sideNavigation).toContainText("Source evidence");
  await expect(sideNavigation).toContainText("Evidence map");
  await expect(sideNavigation).toContainText("Audit state");
}

async function expectReviewDecisionFlowOrder(page: Page) {
  const positions = await page.evaluate(() => {
    const selectors = {
      answer: "#answer-title",
      blocker: "#source-issue-review-title",
      copyState: ".evidence-workbench-review-actions__copy-state",
      decision: "#review-decision-title",
      decisionRequired: "#review-decision-required-title",
      firstAction: ".evidence-workbench-review-actions__button-grid button",
      supportingEvidence: "#supporting-evidence-title"
    };

    return Object.fromEntries(
      Object.entries(selectors).map(([key, selector]) => {
        const element = document.querySelector(selector);
        return [key, element ? element.getBoundingClientRect().top + window.scrollY : null];
      })
    ) as Record<keyof typeof selectors, number | null>;
  });

  for (const [key, value] of Object.entries(positions)) {
    expect(value, `${key} should be rendered`).not.toBeNull();
  }

  expect(positions.blocker ?? 0).toBeGreaterThan(positions.decisionRequired ?? 0);
  expect(positions.answer ?? 0).toBeGreaterThan(positions.blocker ?? 0);
  expect(positions.supportingEvidence ?? 0).toBeGreaterThan(positions.answer ?? 0);
  expect(positions.decision ?? 0).toBeGreaterThan(positions.supportingEvidence ?? 0);
  expect(positions.firstAction ?? 0).toBeGreaterThan(positions.decision ?? 0);
  expect(positions.copyState ?? 0).toBeGreaterThan(positions.firstAction ?? 0);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );

  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectSourceRecordFocused(page: Page, sourceId: string) {
  const sourceRecord = page.locator(`#source-${sourceId}`);
  const sourceSummary = sourceRecord.locator("summary");

  await expect(sourceRecord).toHaveAttribute("open", "");
  await expect(sourceSummary).toBeFocused();
  await expect(sourceSummary).toHaveAccessibleName(new RegExp(`${sourceId}.*Hide details`));
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

async function expectAccordionClosed(button: Locator, panel: Locator) {
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(button.locator(".qhds-accordion__icon")).toHaveCount(0);
  await expect(button.locator(".qhds-accordion__toggle-closed")).toBeVisible();
  await expect(button.locator(".qhds-accordion__toggle-open")).toBeHidden();
  await expect(button).toHaveAccessibleName(/Show details/);
  await expect(panel).toHaveAttribute("hidden", "");
  await expectDisclosureContentHidden(panel);
}

async function expectAccordionOpen(button: Locator, panel: Locator) {
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(button.locator(".qhds-accordion__icon")).toHaveCount(0);
  await expect(button.locator(".qhds-accordion__toggle-closed")).toBeHidden();
  await expect(button.locator(".qhds-accordion__toggle-open")).toBeVisible();
  await expect(button).toHaveAccessibleName(/Hide details/);
  await expect(panel).not.toHaveAttribute("hidden", "");
  await expectDisclosureContentVisible(panel);
}

async function expectAccordionRowsStacked(items: Locator) {
  const boxes = await items.evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();

      return {
        bottom: rect.bottom,
        top: rect.top
      };
    })
  );

  expect(boxes.length).toBe(3);

  for (let index = 1; index < boxes.length; index += 1) {
    expect(boxes[index]?.top ?? 0).toBeGreaterThanOrEqual((boxes[index - 1]?.bottom ?? 0) - 1);
  }
}

async function expectDisclosureCueClosed(disclosure: Locator, accessibleName: RegExp) {
  const summary = disclosure.locator("summary").first();

  await expect(summary.locator(".evidence-workbench-disclosure__toggle-closed")).toBeVisible();
  await expect(summary.locator(".evidence-workbench-disclosure__toggle-open")).toBeHidden();
  await expect(summary).toHaveAccessibleName(accessibleName);
}

async function expectDisclosureCueOpen(disclosure: Locator, accessibleName: RegExp) {
  const summary = disclosure.locator("summary").first();

  await expect(summary.locator(".evidence-workbench-disclosure__toggle-closed")).toBeHidden();
  await expect(summary.locator(".evidence-workbench-disclosure__toggle-open")).toBeVisible();
  await expect(summary).toHaveAccessibleName(accessibleName);
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
