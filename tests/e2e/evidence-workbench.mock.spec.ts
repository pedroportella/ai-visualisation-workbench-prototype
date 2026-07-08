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

  const currentBlockerButton = page.locator("#review-current-blocker-accordion-button");
  const currentBlockerPanel = page.locator("#review-current-blocker-accordion-panel");
  const answerButton = page.locator("#review-answer-accordion-button");
  const answerPanel = page.locator("#review-answer-accordion-panel");
  const supportingEvidenceButton = page.locator("#review-supporting-evidence-accordion-button");
  const supportingEvidencePanel = page.locator("#review-supporting-evidence-accordion-panel");
  const takeActionButton = page.locator("#review-take-action-accordion-button");
  const takeActionPanel = page.locator("#review-take-action-accordion-panel");

  await expect(page.getByRole("link", { name: "Review blocker" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Skip to final action" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Read draft answer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Draft answer" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Current blocker" })
  ).toBeVisible();
  await expectAccordionClosed(currentBlockerButton, currentBlockerPanel);
  await expectAccordionClosed(answerButton, answerPanel);
  await expectAccordionClosed(supportingEvidenceButton, supportingEvidencePanel);
  await expectAccordionClosed(takeActionButton, takeActionPanel);

  await page.getByRole("link", { name: "Review blocker" }).click();
  await expect(page).toHaveURL(
    /\/evidence-workbench\/review#review-current-blocker-accordion-button$/
  );
  await expectAccordionOpen(currentBlockerButton, currentBlockerPanel);
  await page.getByRole("link", { name: "Read draft answer" }).click();
  await expect(page).toHaveURL(
    /\/evidence-workbench\/review#review-answer-accordion-button$/
  );
  await expectAccordionOpen(answerButton, answerPanel);
  await page.getByRole("link", { name: "Skip to final action" }).click();
  await expect(page).toHaveURL(
    /\/evidence-workbench\/review#review-take-action-accordion-button$/
  );
  await expectAccordionOpen(takeActionButton, takeActionPanel);

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
  await expect(page.locator(".evidence-workbench-review-action-choices")).toBeVisible();
  await expectReviewActionNoteBeforeOptions(page);
  await expectReviewActionOptionsFullWidth(page);
  await expectReviewActionRadioControlsDoNotOverlapText(page);
  await expectReviewActionFooterRows(page);
  await expect(page.getByRole("radio", { name: /Request source update/ })).toBeChecked();
  await expect(page.getByRole("radio", { name: /Mark reviewed/ })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Request source update" })).toBeVisible();
  await expect(page.locator(".evidence-workbench-review-actions__selected-action")).toHaveAttribute(
    "data-action-tone",
    "primary"
  );
  await expect(page.getByRole("button", { name: "Request source update" })).toHaveClass(
    /qhds-button--primary/
  );
  await getReviewActionOption(page, "Mark unsafe to use").click();
  await expect(page.getByRole("button", { name: "Mark unsafe to use" })).toHaveClass(
    /qhds-button--secondary/
  );
  await expect(page.locator(".evidence-workbench-review-actions__selected-action")).toHaveAttribute(
    "data-action-tone",
    "destructive"
  );
  await getReviewActionOption(page, "Request source update").click();
  await expect(page.getByRole("heading", { name: "Supporting workspaces" })).toHaveCount(0);
  await expect(page.getByText("Source blocker issues")).toHaveCount(0);
  await expectPersistentNavigationOwner(page);
  await expectReviewDecisionFlowOrder(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectReviewDecisionFlowOrder(page);
  await expectNoHorizontalOverflow(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.getByText("WARN-FALLBACK-001").first()).toBeVisible();
  const changeBlockerButton = page.locator("#review-change-blocker-accordion-button");
  await changeBlockerButton.click();
  await expect(changeBlockerButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("WARN-FALLBACK-003").first()).toBeVisible();
  const reviewBlockerSelector = page.locator(
    ".evidence-workbench-review-blocker-selector__issue-selector"
  );
  const fallback003Radio = reviewBlockerSelector.getByRole("radio", {
    name: "WARN-FALLBACK-003 on SRC-FALLBACK-003"
  });
  await fallback003Radio.focus();
  await expect(fallback003Radio).toBeFocused();
  await expectControlCanReceiveFocus(page, "radio", /Request source update/);
  await expectControlCanReceiveFocus(page, "button", "Request source update");
  await reviewBlockerSelector
    .getByText("WARN-FALLBACK-003 on SRC-FALLBACK-003")
    .click();
  await expect(fallback003Radio).toBeChecked();
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
    reviewBlockerSelector.getByRole("radio", {
      name: "WARN-FALLBACK-001 on SRC-FALLBACK-002"
    })
  ).toBeChecked();
  await expect(page.getByRole("radio", { name: /Request source update/ })).toBeChecked();
  await page
    .getByRole("link", { name: "SRC-FALLBACK-002: Synthetic wayfinding map extract" })
    .click();
  await expect(page).toHaveURL(/\/evidence-workbench\/sources#source-SRC-FALLBACK-002$/);
  await expect(page.getByRole("heading", { level: 1, name: "Source evidence" })).toBeVisible();
  await expectSourceRecordFocused(page, "SRC-FALLBACK-002");
  await openSourceActionTarget(page);
  await expectControlCanReceiveFocus(page, "link", "Continue to review actions");
  await page.getByRole("link", { name: "Continue to review actions" }).click();
  await expect(page).toHaveURL(/\/evidence-workbench\/review$/);

  await page.goto("/evidence-workbench/sources");
  await expect(page.getByRole("heading", { level: 1, name: "Source evidence" })).toBeVisible();
  await expectAccordionOpen(
    page.locator("#sources-title-accordion-button"),
    page.locator("#sources-title-accordion-panel")
  );
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
  await expect(page).toHaveURL(
    /\/evidence-workbench\/sources#source-SRC-FALLBACK-003-accordion-button$/
  );
  await expectSourceRecordFocused(page, "SRC-FALLBACK-003");
  await expect(page.getByText("Dispatch confirmation placeholder").first()).toBeVisible();
  await openSourceActionTarget(page);
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

  const answerButton = page.locator("#review-answer-accordion-button");
  const answerPanel = page.locator("#review-answer-accordion-panel");

  await expectAccordionClosed(answerButton, answerPanel);
  await answerButton.click();
  await expectAccordionOpen(answerButton, answerPanel);

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

  const supportingEvidenceButton = page.locator("#review-supporting-evidence-accordion-button");
  const supportingEvidencePanel = page.locator("#review-supporting-evidence-accordion-panel");
  const sourceInspectorButton = page.locator("#review-source-inspector-accordion-button");
  const sourceInspectorPanel = page.locator("#review-source-inspector-accordion-panel");
  const claimsButton = page.locator("#review-claims-accordion-button");
  const claimsPanel = page.locator("#review-claims-accordion-panel");

  await expectAccordionClosed(supportingEvidenceButton, supportingEvidencePanel);
  await supportingEvidenceButton.click();
  await expectAccordionOpen(supportingEvidenceButton, supportingEvidencePanel);
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

  const sourceRecordDetailsButton = page.locator("#source-record-details-accordion-button");
  const sourceRecordDetailsPanel = page.locator("#source-record-details-accordion-panel");
  const sourceButton = page.locator("#source-SRC-FALLBACK-002-accordion-button");
  const sourcePanel = page.locator("#source-SRC-FALLBACK-002-accordion-panel");

  await expectAccordionClosed(sourceRecordDetailsButton, sourceRecordDetailsPanel);
  await sourceRecordDetailsButton.click();
  await expectAccordionOpen(sourceRecordDetailsButton, sourceRecordDetailsPanel);
  await expectAccordionClosed(sourceButton, sourcePanel);
  await expectSourceInventoryButtonContained(sourceButton);
  await sourceButton.focus();
  await expect(sourceButton).toBeFocused();
  await sourceButton.click();
  await expectAccordionOpen(sourceButton, sourcePanel);

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
  name: RegExp | string
) {
  const control = page.getByRole(role, { name }).first();
  await control.focus();
  await expect(control).toBeFocused();
}

function getReviewActionOption(page: Page, name: string): Locator {
  return page
    .locator(".evidence-workbench-review-action-choices .qhds-radio__label")
    .filter({ hasText: name })
    .first();
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
      answer: "#review-answer-accordion-button",
      blocker: "#review-current-blocker-accordion-button",
      copyState: ".evidence-workbench-review-actions__copy-state",
      decision: "#review-take-action-accordion-button",
      decisionRequired: "#review-decision-required-title",
      firstAction: ".evidence-workbench-review-action-choices",
      supportingEvidence: "#review-supporting-evidence-accordion-button"
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

async function expectReviewActionNoteBeforeOptions(page: Page) {
  const orderState = await page.evaluate(() => {
    const fieldset = document.querySelector(".evidence-workbench-review-action-choices");
    const note = fieldset?.querySelector(".evidence-workbench-review-actions__note-input");
    const options = fieldset?.querySelector(".qhds-radio-group__options");

    return Boolean(
      fieldset &&
        note &&
        options &&
        (note.compareDocumentPosition(options) & Node.DOCUMENT_POSITION_FOLLOWING)
    );
  });

  expect(orderState).toBe(true);
}

async function expectReviewActionOptionsFullWidth(page: Page) {
  const geometry = await page.evaluate(() => {
    const fieldset = document.querySelector(".evidence-workbench-review-action-choices");
    const options = fieldset?.querySelector(".qhds-radio-group__options");

    if (!fieldset || !options) {
      return null;
    }

    const fieldsetRect = fieldset.getBoundingClientRect();
    const optionsRect = options.getBoundingClientRect();

    return {
      fieldsetWidth: fieldsetRect.width,
      optionsWidth: optionsRect.width
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry?.optionsWidth).toBeGreaterThanOrEqual((geometry?.fieldsetWidth ?? 0) - 1);
}

async function expectReviewActionRadioControlsDoNotOverlapText(page: Page) {
  const clearances = await page.evaluate(() => {
    const labels = [
      ...document.querySelectorAll<HTMLElement>(
        ".evidence-workbench-review-action-choices .qhds-radio__label"
      )
    ];

    return labels.map((label) => {
      const content = label.querySelector<HTMLElement>(
        ".evidence-workbench-review-action-choice"
      );
      const radioStyle = getComputedStyle(label, "::before");
      const radioLeft = parseFloat(radioStyle.left);
      const radioWidth = parseFloat(radioStyle.width);

      if (!content || Number.isNaN(radioLeft) || Number.isNaN(radioWidth)) {
        return null;
      }

      const labelRect = label.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();

      return contentRect.left - labelRect.left - (radioLeft + radioWidth);
    });
  });

  expect(clearances).not.toContain(null);
  for (const clearance of clearances) {
    expect(clearance ?? 0).toBeGreaterThanOrEqual(8);
  }
}

async function expectReviewActionFooterRows(page: Page) {
  const rowGeometry = await page.evaluate(() => {
    const selectors = [
      {
        expectedButtonVariant: "qhds-button--primary",
        expectedState: "primary",
        selector: ".evidence-workbench-review-actions__selected-action",
        stateAttribute: "data-action-tone"
      },
      {
        expectedButtonVariant: "qhds-button--secondary",
        expectedState: "disabled",
        selector: ".evidence-workbench-review-actions__copy-state",
        stateAttribute: "data-copy-state"
      }
    ];

    return selectors.map(({ expectedButtonVariant, expectedState, selector, stateAttribute }) => {
      const row = document.querySelector<HTMLElement>(selector);
      const text = row?.querySelector<HTMLElement>(
        ".evidence-workbench-review-actions__footer-copy"
      );
      const button = row?.querySelector<HTMLElement>(".qhds-button");

      if (!row || !text || !button) {
        return null;
      }

      const rowStyle = getComputedStyle(row);
      const textRect = text.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      return {
        borderLeftWidth: rowStyle.borderLeftWidth,
        borderRightWidth: rowStyle.borderRightWidth,
        buttonWidth: buttonRect.width,
        buttonUsesExpectedVariant: button.classList.contains(expectedButtonVariant),
        hasNoInsetAccent: rowStyle.boxShadow === "none",
        columnCount: rowStyle.gridTemplateColumns.split(" ").filter(Boolean).length,
        stateMatchesExpected: row.getAttribute(stateAttribute) === expectedState,
        textClearsButton: textRect.right <= buttonRect.left - 8
      };
    });
  });

  expect(rowGeometry).not.toContain(null);
  for (const row of rowGeometry) {
    expect(row?.borderLeftWidth).toBe(row?.borderRightWidth);
    expect(row?.columnCount).toBeGreaterThanOrEqual(2);
    expect(row?.buttonWidth).toBeGreaterThanOrEqual(160);
    expect(row?.buttonUsesExpectedVariant).toBe(true);
    expect(row?.hasNoInsetAccent).toBe(true);
    expect(row?.stateMatchesExpected).toBe(true);
    expect(row?.textClearsButton).toBe(true);
  }
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );

  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectSourceRecordFocused(page: Page, sourceId: string) {
  const sourceRecordDetailsButton = page.locator("#source-record-details-accordion-button");
  const sourceRecordDetailsPanel = page.locator("#source-record-details-accordion-panel");
  const sourceButton = page.locator(`#source-${sourceId}-accordion-button`);
  const sourcePanel = page.locator(`#source-${sourceId}-accordion-panel`);

  await expectAccordionOpen(sourceRecordDetailsButton, sourceRecordDetailsPanel);
  await expectAccordionOpen(sourceButton, sourcePanel);
  await expect(sourceButton).toBeFocused();
  await expect(sourceButton).toHaveAccessibleName(new RegExp(`${sourceId}.*Hide details`));
}

async function openSourceActionTarget(page: Page) {
  const actionTargetButton = page.locator("#source-action-target-accordion-button");
  const actionTargetPanel = page.locator("#source-action-target-accordion-panel");

  if ((await actionTargetButton.getAttribute("aria-expanded")) !== "true") {
    await actionTargetButton.click();
  }

  await expectAccordionOpen(actionTargetButton, actionTargetPanel);
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
  await expectAccordionToggleIconCentred(button, "closed");
  await expect(button).toHaveAccessibleName(/Show details/);
  await expect(panel).toHaveAttribute("hidden", "");
  await expectDisclosureContentHidden(panel);
}

async function expectAccordionOpen(button: Locator, panel: Locator) {
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(button.locator(".qhds-accordion__icon")).toHaveCount(0);
  await expect(button.locator(".qhds-accordion__toggle-closed")).toBeHidden();
  await expect(button.locator(".qhds-accordion__toggle-open")).toBeVisible();
  await expectAccordionToggleIconCentred(button, "open");
  await expect(button).toHaveAccessibleName(/Hide details/);
  await expect(panel).not.toHaveAttribute("hidden", "");
  await expectDisclosureContentVisible(panel);
}

async function expectAccordionToggleIconCentred(
  button: Locator,
  state: "closed" | "open"
) {
  const iconStyle = await button.locator(".qhds-accordion__toggle").evaluate((element) => {
    const style = getComputedStyle(element, "::after");

    return {
      alignSelf: style.alignSelf,
      boxSizing: style.boxSizing,
      position: style.position,
      top: style.top
    };
  });

  expect(iconStyle.alignSelf).toBe("center");
  expect(iconStyle.boxSizing).toBe("border-box");
  expect(iconStyle.position).toBe("relative");
  expect(iconStyle.top).toBe(state === "open" ? "1px" : "-1px");
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

async function expectSourceInventoryButtonContained(button: Locator) {
  const geometry = await button.evaluate((buttonElement) => {
    const accordionItem = buttonElement.closest(".qhds-accordion__item");

    if (!accordionItem) {
      return null;
    }

    const itemRect = accordionItem.getBoundingClientRect();
    const buttonRect = buttonElement.getBoundingClientRect();

    return {
      buttonLeft: buttonRect.left,
      buttonRight: buttonRect.right,
      buttonWidth: buttonRect.width,
      itemLeft: itemRect.left,
      itemRight: itemRect.right,
      itemWidth: itemRect.width
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry?.buttonWidth).toBeLessThanOrEqual((geometry?.itemWidth ?? 0) + 1);
  expect(geometry?.buttonLeft).toBeGreaterThanOrEqual((geometry?.itemLeft ?? 0) - 1);
  expect(geometry?.buttonRight).toBeLessThanOrEqual((geometry?.itemRight ?? 0) + 1);
  await expect(button.locator(".evidence-workbench-source-inventory__cell-label").first()).toBeVisible();
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
