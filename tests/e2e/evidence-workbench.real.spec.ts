import { expect, test, type Page } from "@playwright/test";

test("Docker-backed Evidence Workbench renders backend fixture journey", async ({
  page
}) => {
  assertRuntime("docker", "1");
  printRuntime();

  await page.goto("/evidence-workbench");
  await expect(page.getByRole("heading", { level: 1, name: "Evidence Workbench" })).toBeVisible();
  await expect(page.getByText("Synthetic fixture / Backend fixture")).toBeVisible();
  await expect(page.getByText("Backend fixture unavailable")).toHaveCount(0);
  await expect(page.getByText("Bundled fallback")).toHaveCount(0);
  await expect(page.getByText("CLAIM-003: Step-free shuttle wording")).toBeVisible();

  await page.getByRole("link", { name: /^Start review$/ }).first().click();
  await expect(page).toHaveURL(/\/evidence-workbench\/review$/);
  await expect(page.getByRole("heading", { level: 1, name: "Review answer" })).toBeVisible();
  await page.locator("#review-answer-accordion-button").click();
  await expect(page.getByText("CIT-003-A").first()).toBeVisible();
  await page.locator("#review-take-action-accordion-button").click();
  await expectControlCanReceiveFocus(page, "button", "Request source update");
  await page.getByRole("button", { name: "Request source update" }).click();
  await expect(page.getByText("Request source update recorded in local UI state.")).toBeVisible();

  await page.goto("/evidence-workbench/sources");
  await expect(page.getByRole("heading", { level: 1, name: "Source evidence" })).toBeVisible();
  await expect(page.getByText("Day-Of-Service Shuttle Dispatch Confirmation").first()).toBeVisible();
  await expect(page.getByText("operations-control-dispatch-confirmation").first()).toBeAttached();

  await page.goto("/evidence-workbench/process");
  await expect(page.getByRole("heading", { level: 1, name: "Evidence map" })).toBeVisible();
  await expect(page.locator(".evidence-workbench-process-map")).toHaveAttribute(
    "data-graph-id",
    "GRAPH-001"
  );
  const textMapButton = page.getByRole("button", { name: /Text process map/ });
  await expect(textMapButton).toBeVisible();
  await expect(textMapButton).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#process-map-text-fallback")).toBeHidden();
  await textMapButton.click();
  await expect(textMapButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#process-map-text-fallback")).toBeVisible();
  await expect(page.locator("#process-map-text-fallback").getByText("NODE-SRC-006")).toBeVisible();
  await page.locator("#process-map-text-fallback").focus();
  await expect(page.locator("#process-map-text-fallback")).toBeFocused();

  await page.goto("/evidence-workbench/audit");
  await expect(page.getByRole("heading", { level: 1, name: "Audit state" })).toBeVisible();
  await expect(page.getByText("AUDIT-001").first()).toBeVisible();
  await expect(page.getByText("Copy remains unavailable").first()).toBeVisible();
  await expect(page.getByText("Local state is at the loaded fixture seed.").first()).toBeVisible();
  await expect(page.getByText("SRC-FALLBACK")).toHaveCount(0);
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

function printRuntime() {
  console.log(
    [
      `[aivis-e2e] mode=${process.env.AIVIS_E2E_MODE}`,
      `[aivis-e2e] baseUrl=${process.env.AIVIS_E2E_BASE_URL}`,
      `[aivis-e2e] runtimeOwner=${process.env.AIVIS_E2E_RUNTIME_OWNER}`,
      "[aivis-e2e] teardownStatus=owned-by-wrapper"
    ].join("\n")
  );
}
