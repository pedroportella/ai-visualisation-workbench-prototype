import { defineConfig, devices } from "@playwright/test";

const mode = process.env.AIVIS_E2E_MODE ?? "mock";
const defaultPort = mode === "docker" ? "3200" : "3210";
const port = process.env.AIVIS_E2E_WORKBENCH_PORT ?? defaultPort;
const baseURL =
  process.env.AIVIS_E2E_BASE_URL ?? `http://127.0.0.1:${port}`;
const startsMockServer =
  mode === "mock" && process.env.AIVIS_E2E_RUNTIME_OWNER === "mock-next-dev";

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  retries: 0,
  testDir: ".",
  timeout: 60_000,
  use: {
    baseURL,
    screenshot: "off",
    trace: "off",
    video: "off"
  },
  webServer: startsMockServer
    ? {
        command: `pnpm --filter @aivis/workbench exec next dev --hostname 127.0.0.1 --port ${port}`,
        env: {
          AIVIS_BACKEND_ORIGIN:
            process.env.AIVIS_MOCK_BACKEND_ORIGIN ?? "http://127.0.0.1:9"
        },
        reuseExistingServer: false,
        timeout: 120_000,
        url: `${baseURL}/evidence-workbench`
      }
    : undefined,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
