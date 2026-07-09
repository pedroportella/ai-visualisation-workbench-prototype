#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const headed = args.includes("--headed");
const build = args.includes("--build");
const composeProject =
  process.env.AIVIS_E2E_COMPOSE_PROJECT ?? "aivis-e2e";
const workbenchPort = process.env.AIVIS_E2E_WORKBENCH_PORT ?? "3200";
const backendPort = process.env.AIVIS_E2E_BACKEND_PORT ?? "8080";
const baseUrl =
  process.env.AIVIS_E2E_BASE_URL ?? `http://127.0.0.1:${workbenchPort}`;
const backendBaseUrl =
  process.env.AIVIS_E2E_BACKEND_BASE_URL ?? `http://127.0.0.1:${backendPort}`;
const commandEnv = {
  ...process.env,
  AIVIS_BACKEND_HOST_PORT: backendPort,
  AIVIS_E2E_BASE_URL: baseUrl,
  AIVIS_E2E_COMPOSE_PROJECT: composeProject,
  AIVIS_E2E_EXPECT_BACKEND: "1",
  AIVIS_E2E_MODE: "docker",
  AIVIS_E2E_RUNTIME_OWNER: "docker-compose-wrapper",
  AIVIS_E2E_WORKBENCH_PORT: workbenchPort,
  AIVIS_WORKBENCH_HOST_PORT: workbenchPort,
  COMPOSE_PROJECT_NAME: composeProject
};
const playwrightArgs = [
  "scripts/run-playwright.mjs",
  "--mode=docker",
  "test",
  "-c",
  "playwright.config.ts",
  "tests/e2e/evidence-workbench.real.spec.ts"
];

if (headed) {
  playwrightArgs.push("--headed", "--project=chromium", "--workers=1");
}

let exitCode = 0;
let teardownStatus = "not-started";

printRuntimeContract();

try {
  run("pnpm", ["docker:down"], { required: false });
  if (build) {
    run("pnpm", ["docker:build"]);
  }
  run("pnpm", ["docker:up"]);
  await waitForJson(`${backendBaseUrl}/health/live`, "backend live health");
  await waitForText(`${baseUrl}/evidence-workbench`, "frontend workbench route");
  runDockerSmoke();
  run("pnpm", ["test:backend-release-proof"]);
  run(process.execPath, playwrightArgs);
} catch (error) {
  exitCode = error.exitCode ?? 1;
  console.error(`[aivis-docker-e2e] failed: ${error.message}`);
} finally {
  const result = run("pnpm", ["docker:down"], { required: false });
  teardownStatus = result.status === 0 ? "passed" : `failed:${result.status ?? "unknown"}`;
  console.log(`[aivis-docker-e2e] teardownStatus=${teardownStatus}`);
}

process.exit(exitCode);

function printRuntimeContract() {
  console.log("[aivis-docker-e2e] runtime");
  console.log("[aivis-docker-e2e] mode=docker");
  console.log(`[aivis-docker-e2e] baseUrl=${baseUrl}`);
  console.log(`[aivis-docker-e2e] backendBaseUrl=${backendBaseUrl}`);
  console.log(`[aivis-docker-e2e] runtimeOwner=docker-compose-wrapper`);
  console.log(`[aivis-docker-e2e] composeProject=${composeProject}`);
  console.log("[aivis-docker-e2e] teardownOwner=scripts/run-docker-e2e.mjs");
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: process.cwd(),
    env: commandEnv,
    stdio: "inherit"
  });

  if (result.error) {
    if (options.required === false) {
      return { status: 1 };
    }

    throw Object.assign(result.error, { exitCode: 1 });
  }

  if (result.status !== 0 && options.required !== false) {
    throw Object.assign(
      new Error(`${command} ${commandArgs.join(" ")} exited ${result.status}`),
      { exitCode: result.status ?? 1 }
    );
  }

  return { status: result.status ?? 0 };
}

function runDockerSmoke() {
  if (backendBaseUrl === "http://127.0.0.1:8080" && baseUrl === "http://127.0.0.1:3200") {
    run("pnpm", ["docker:smoke"]);
    return;
  }

  run("backend/.venv/bin/python", [
    "scripts/local-docker-smoke.py",
    "--backend-base-url",
    backendBaseUrl,
    "--frontend-base-url",
    baseUrl
  ]);
}

async function waitForJson(url, label) {
  await waitFor(url, label, async (response) => {
    if (!response.ok) {
      return false;
    }

    const payload = await response.json();
    return payload.status === "ok" || payload.status === "ready";
  });
}

async function waitForText(url, label) {
  await waitFor(url, label, async (response) => {
    if (!response.ok) {
      return false;
    }

    const body = await response.text();
    return body.includes("Evidence Workbench");
  });
}

async function waitFor(url, label, accepts) {
  const deadline = Date.now() + 90_000;
  let lastError = "not reached";

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3_000) });
      if (await accepts(response)) {
        console.log(`[aivis-docker-e2e] wait ${label}=ready`);
        return;
      }

      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw Object.assign(new Error(`timed out waiting for ${label}: ${lastError}`), {
    exitCode: 1
  });
}
