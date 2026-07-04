import { expect, test, type Page } from "@playwright/test";

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

async function expectControlCanReceiveFocus(
  page: Page,
  role: "button" | "link",
  name: string
) {
  const control = page.getByRole(role, { name }).first();
  await control.focus();
  await expect(control).toBeFocused();
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
