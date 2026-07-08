#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const rawArgs = process.argv.slice(2);
const { mode, playwrightArgs } = parseArgs(rawArgs);
const isTestRun = playwrightArgs[0] === "test";
const resolvedMode = mode ?? process.env.AIVIS_E2E_MODE ?? (isTestRun ? "mock" : "report");
const defaultPort = resolvedMode === "docker" ? "3200" : "3210";
let workbenchPort = process.env.AIVIS_E2E_WORKBENCH_PORT ?? defaultPort;
let baseUrl =
  process.env.AIVIS_E2E_BASE_URL ?? `http://127.0.0.1:${workbenchPort}`;
let runtimeOwner =
  resolvedMode === "mock"
    ? "mock-next-dev"
    : resolvedMode === "docker"
      ? "docker-compose-wrapper"
      : "playwright";
let teardownOwner =
  resolvedMode === "mock"
    ? "playwright-webServer"
    : resolvedMode === "docker"
      ? "scripts/run-docker-e2e.mjs"
      : "not-required";

if (
  isTestRun &&
  resolvedMode === "mock" &&
  process.env.AIVIS_E2E_BASE_URL === undefined &&
  process.env.AIVIS_E2E_WORKBENCH_PORT === undefined
) {
  const reusableMockUrl = await findReusableMockWorkbench();

  if (reusableMockUrl) {
    baseUrl = reusableMockUrl;
    workbenchPort = new URL(reusableMockUrl).port;
    runtimeOwner = "existing-next-dev";
    teardownOwner = "already-running";
  }
}

const env = normalisePlaywrightColourEnv({
  ...process.env,
  AIVIS_E2E_BASE_URL: baseUrl,
  AIVIS_E2E_EXPECT_BACKEND:
    process.env.AIVIS_E2E_EXPECT_BACKEND ?? (resolvedMode === "docker" ? "1" : "0"),
  AIVIS_E2E_MODE: resolvedMode,
  AIVIS_E2E_RUNTIME_OWNER: runtimeOwner,
  AIVIS_E2E_WORKBENCH_PORT: workbenchPort
});

if (isTestRun) {
  printRuntimeContract();
}

if (isTestRun && resolvedMode === "mock" && runtimeOwner === "mock-next-dev") {
  await assertMockPortIsAvailable(baseUrl);
}

const child = spawn(
  process.execPath,
  [require.resolve("@playwright/test/cli"), ...playwrightArgs],
  {
    cwd: process.cwd(),
    env,
    stdio: "inherit"
  }
);

child.on("exit", (code, signal) => {
  if (isTestRun) {
    console.log(`[aivis-playwright] teardownStatus=${teardownOwner}`);
  }

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

function parseArgs(args) {
  let parsedMode = null;
  const passthrough = [];

  for (const arg of args) {
    if (arg.startsWith("--mode=")) {
      parsedMode = arg.slice("--mode=".length);
      continue;
    }

    passthrough.push(arg);
  }

  return { mode: parsedMode, playwrightArgs: passthrough };
}

function normalisePlaywrightColourEnv(sourceEnv) {
  const nextEnv = { ...sourceEnv };
  const requestedForcedColour = nextEnv.AIVIS_PLAYWRIGHT_FORCE_COLOR;

  if (requestedForcedColour !== undefined) {
    delete nextEnv.NO_COLOR;
    nextEnv.FORCE_COLOR = requestedForcedColour;
    nextEnv.DEBUG_COLORS ??=
      requestedForcedColour === "0" || requestedForcedColour === "false" ? "0" : "1";
    return nextEnv;
  }

  if (nextEnv.NO_COLOR !== undefined) {
    delete nextEnv.NO_COLOR;
    nextEnv.FORCE_COLOR = "0";
    nextEnv.DEBUG_COLORS = "0";
  }

  return nextEnv;
}

function printRuntimeContract() {
  console.log("[aivis-playwright] runtime");
  console.log(`[aivis-playwright] mode=${resolvedMode}`);
  console.log(`[aivis-playwright] baseUrl=${baseUrl}`);
  console.log(`[aivis-playwright] runtimeOwner=${runtimeOwner}`);
  console.log(`[aivis-playwright] teardownOwner=${teardownOwner}`);
}

async function assertMockPortIsAvailable(url) {
  const probeUrl = `${url.replace(/\/$/, "")}/evidence-workbench`;

  try {
    const response = await fetch(probeUrl, { signal: AbortSignal.timeout(1_500) });
    const body = await response.text();
    const marker = body.includes("Evidence Workbench")
      ? "Evidence Workbench"
      : body.slice(0, 80).replace(/\s+/g, " ");
    console.error(
      [
        "[aivis-playwright] mock setup failed: the dedicated test port is already serving content.",
        `url=${probeUrl}`,
        `status=${response.status}`,
        `marker=${marker}`,
        "teardownStatus=not-started"
      ].join("\n")
    );
    process.exit(1);
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.cause?.code === "ECONNREFUSED") {
      return;
    }

    if (
      error instanceof TypeError &&
      String(error.cause?.code ?? error.message).includes("ECONNREFUSED")
    ) {
      return;
    }

    if (String(error?.message ?? "").includes("fetch failed")) {
      return;
    }

    throw error;
  }
}

async function findReusableMockWorkbench() {
  const reusableUrl = "http://127.0.0.1:3200";
  const probeUrl = `${reusableUrl}/evidence-workbench`;

  try {
    const response = await fetch(probeUrl, { signal: AbortSignal.timeout(1_500) });
    const body = await response.text();

    if (
      response.ok &&
      body.includes("Evidence Workbench") &&
      body.includes("Backend fixture unavailable. Showing bundled fallback data.")
    ) {
      return reusableUrl;
    }
  } catch {
    return null;
  }

  return null;
}
