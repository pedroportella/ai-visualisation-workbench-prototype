#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const mode = process.argv[2] ?? "all";
const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".pnpm-store",
  ".pytest_cache",
  ".ruff_cache",
  ".venv",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "playwright-report",
  "test-results",
  "__pycache__"
]);
const allowedEnvFiles = new Set([".env.example"]);
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".py",
  ".scss",
  ".svg",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml"
]);
const browserVisibleExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".json",
  ".mjs",
  ".scss",
  ".ts",
  ".tsx"
]);
const publicDocRoots = [
  "README.md",
  "AGENTS.md",
  "backend/README.md",
  "docker/README.md",
  "frontend/README.md",
  "scripts/README.md"
];
const privatePlanningPatterns = [
  { label: "internal notes path", pattern: new RegExp("ai-" + "notes", "i") },
  { label: "internal planning term", pattern: new RegExp("\\bdeep-" + "end\\b", "i") },
  { label: "internal work-item term", pattern: new RegExp("\\bpa" + "cket\\b", "i") },
  {
    label: "internal delivery term",
    pattern: new RegExp("delivery\\s+la" + "ne|\\bdelivery-la" + "ne\\b", "i")
  },
  { label: "internal stage code", pattern: /\b[BCFIQR][0-9]{2}[A-Z]?\b/ }
];
const browserBundlePrivatePlanningPatterns = privatePlanningPatterns.filter(
  (pattern) => pattern.label !== "internal stage code"
);
const claimBoundaryPatterns = [
  { label: "real TMR data", pattern: /\breal TMR data\b/i },
  { label: "official TMR system", pattern: /\bofficial TMR\b/i },
  { label: "QChat integration", pattern: /\bQChat integration\b/i },
  { label: "production GraphRAG", pattern: /\bproduction GraphRAG\b/i },
  { label: "production RAG", pattern: /\bproduction RAG\b/i },
  { label: "GraphRAG", pattern: /\bGraphRAG\b/i },
  { label: "Neo4j", pattern: /\bNeo4j\b/i },
  { label: "Amazon Bedrock", pattern: /\bAmazon Bedrock\b|\bBedrock\b/i },
  { label: "Terraform", pattern: /\bTerraform\b/i },
  { label: "source-system writeback", pattern: /\bsource-system writeback\b/i },
  { label: "live retrieval", pattern: /\blive retrieval\b/i },
  { label: "production platform operation", pattern: /\bproduction platform operation\b/i },
  { label: "formal assurance", pattern: /\bformal assurance\b/i },
  { label: "high availability", pattern: /\bhigh availability\b/i }
];
const secretPatterns = [
  { label: "AWS access key", pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { label: "private key", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  {
    label: "connection string with password",
    pattern: /(postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@|(?:Server|Host)=.*;(?:Password|Pwd)=)/i
  },
  { label: "secret assignment", pattern: /\b(?:jwt|token|client|api|aws)?_?secret\s*[:=]/i }
];
const intentionalSecretScannerFiles = new Set([
  "scripts/local-docker-smoke.py",
  "scripts/quality-guards.mjs",
  "scripts/reviewer-evidence-smoke.mjs"
]);
const backendOriginPatterns = [
  { label: "public backend env var", pattern: /NEXT_PUBLIC_[A-Z0-9_]*BACKEND/g },
  { label: "server backend env var", pattern: /\bAIVIS_BACKEND_ORIGIN\b/g },
  { label: "local backend origin", pattern: /https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(?:8000|8080)\b/gi },
  { label: "compose backend origin", pattern: /http:\/\/backend:8000\b/g },
  { label: "local machine path", pattern: /\/Users\/pedroportella\b/g },
  { label: "internal service host", pattern: /https?:\/\/[a-z0-9.-]+\.internal(?::\d+)?/gi }
];
const generatedPathRules = [
  { label: "dependency directory", pattern: /(^|\/)node_modules(\/|$)/ },
  { label: "build output", pattern: /(^|\/)(\.next|dist|build|out)(\/|$)/ },
  { label: "coverage output", pattern: /(^|\/)(coverage|playwright-report|test-results)(\/|$)/ },
  { label: "TypeScript build info", pattern: /\.tsbuildinfo$/i },
  { label: "log file", pattern: /\.log$/i }
];

const checks = {
  all: () => {
    checkArtifacts();
    if (process.exitCode) return;
    checkPublicDocs();
    if (process.exitCode) return;
    checkClaimBoundaries();
    if (process.exitCode) return;
    checkSecrets();
    if (process.exitCode) return;
    checkBrowserOrigins();
  },
  artifacts: checkArtifacts,
  "browser-bundles": checkBrowserBundles,
  "browser-origins": checkBrowserOrigins,
  "claim-boundaries": checkClaimBoundaries,
  "public-docs": checkPublicDocs,
  secrets: checkSecrets
};

if (!checks[mode]) {
  console.error(`Unknown quality guard mode: ${mode}`);
  console.error(`Expected one of: ${Object.keys(checks).join(", ")}`);
  process.exit(1);
}

checks[mode]();

function checkArtifacts() {
  const failures = [];

  for (const filePath of listGitCandidateFiles()) {
    const fileName = filePath.split("/").at(-1) ?? "";

    if (fileName.startsWith(".env") && !allowedEnvFiles.has(fileName)) {
      failures.push(`${filePath} (local environment file)`);
      continue;
    }

    for (const rule of generatedPathRules) {
      if (rule.pattern.test(filePath)) {
        failures.push(`${filePath} (${rule.label})`);
      }
    }
  }

  report("Tracked and unignored artefact guard", failures);
}

function checkPublicDocs() {
  const publicDocs = listPublicDocFiles();
  const failures = [];

  for (const filePath of publicDocs) {
    const contents = readText(filePath);

    if (/^(<<<<<<<|=======|>>>>>>>)$/m.test(contents)) {
      failures.push(`${filePath} contains a merge conflict marker`);
    }

    for (const rule of privatePlanningPatterns) {
      if (rule.pattern.test(contents)) {
        failures.push(`${filePath} contains ${rule.label}`);
      }
    }
  }

  report("Public docs leakage guard", failures);
}

function checkClaimBoundaries() {
  const scanFiles = [
    ...listPublicDocFiles(),
    ...listGitCandidateFiles().filter(
      (filePath) =>
        (filePath.startsWith("frontend/apps/") ||
          filePath.startsWith("frontend/packages/") ||
          filePath.startsWith("backend/")) &&
        !filePath.includes("/tests/") &&
        isTextCandidate(filePath)
    )
  ];
  const failures = [];

  for (const filePath of unique(scanFiles)) {
    const lines = readText(filePath).split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const rule of claimBoundaryPatterns) {
        rule.pattern.lastIndex = 0;
        if (!rule.pattern.test(line)) {
          continue;
        }

        if (isNegativeGuardrailLine(line, lines, index)) {
          continue;
        }

        failures.push(`${filePath}:${index + 1} contains unsupported claim marker: ${rule.label}`);
      }
    });
  }

  report("Claim-boundary guard", failures);
}

function checkSecrets() {
  const failures = [];

  for (const filePath of listGitCandidateFiles().filter(isTextCandidate)) {
    const contents = readText(filePath);

    for (const secret of secretPatterns) {
      secret.pattern.lastIndex = 0;
      if (secret.pattern.test(contents)) {
        if (intentionalSecretScannerFiles.has(filePath)) {
          continue;
        }

        failures.push(`${filePath} contains ${secret.label}`);
      }
    }
  }

  report("Secret marker guard", failures);
}

function checkBrowserOrigins() {
  const failures = [];
  const candidates = listGitCandidateFiles().filter(isBrowserVisibleSourceCandidate);

  for (const filePath of candidates) {
    const contents = readText(filePath);
    const isServerOnly = contents.includes("server-only");

    for (const origin of backendOriginPatterns) {
      origin.pattern.lastIndex = 0;
      if (!origin.pattern.test(contents)) {
        continue;
      }

      if (isServerOnly && origin.label !== "public backend env var") {
        continue;
      }

      failures.push(`${filePath} contains ${origin.label}`);
    }
  }

  report("Browser-origin guard", failures);
}

function checkBrowserBundles() {
  const staticRoot = "frontend/apps/workbench/.next/static";

  if (!existsSync(staticRoot)) {
    report("Browser bundle leakage guard", [
      `${staticRoot} is missing; run pnpm check or pnpm --filter @aivis/workbench build before this guard`
    ]);
    return;
  }

  const bundleFiles = listFiles(staticRoot).filter((filePath) =>
    [".css", ".js", ".json", ".txt"].includes(extname(filePath).toLowerCase())
  );
  const failures = [];

  if (bundleFiles.length === 0) {
    failures.push(`${staticRoot} contains no browser bundle files`);
  }

  for (const filePath of bundleFiles) {
    const rel = relativePath(filePath);
    const contents = readFileSync(filePath, "utf8");

    for (const marker of [
      ...backendOriginPatterns,
      ...browserBundlePrivatePlanningPatterns,
      ...secretPatterns
    ]) {
      marker.pattern.lastIndex = 0;
      if (marker.pattern.test(contents)) {
        failures.push(`${rel} contains ${marker.label}`);
      }
    }
  }

  report("Browser bundle leakage guard", failures);
}

function listGitCandidateFiles() {
  const output = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { encoding: "utf8" }
  );

  return output.split("\0").filter(Boolean);
}

function listPublicDocFiles() {
  const packageReadmes = listGitCandidateFiles().filter(
    (filePath) =>
      filePath.endsWith("/README.md") &&
      (filePath.startsWith("frontend/apps/") || filePath.startsWith("frontend/packages/"))
  );
  const docs = listGitCandidateFiles().filter(
    (filePath) => filePath.startsWith("docs/") && filePath.endsWith(".md")
  );

  return unique([...publicDocRoots, ...packageReadmes, ...docs]).filter(existsSync);
}

function listFiles(directory) {
  const entries = readdirSync(directory);
  const files = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry)) {
      continue;
    }

    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...listFiles(fullPath));
      continue;
    }

    if (stats.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function isTextCandidate(filePath) {
  return textExtensions.has(extname(filePath).toLowerCase());
}

function isBrowserVisibleSourceCandidate(filePath) {
  if (!filePath.startsWith("frontend/")) {
    return false;
  }

  if (filePath.endsWith(".test.ts") || filePath.endsWith(".test.tsx")) {
    return false;
  }

  if (filePath.includes("/README.md") || filePath.endsWith("next-env.d.ts")) {
    return false;
  }

  return browserVisibleExtensions.has(extname(filePath).toLowerCase());
}

function isNegativeGuardrailLine(line, lines = [], index = 0) {
  const context = [
    lines[index - 8],
    lines[index - 7],
    lines[index - 6],
    lines[index - 5],
    lines[index - 4],
    lines[index - 3],
    lines[index - 2],
    lines[index - 1],
    line,
    lines[index + 1],
    lines[index + 2],
    lines[index + 3],
    lines[index + 4]
  ]
    .filter(Boolean)
    .join(" ");

  return (
    /\b(no|not|never|without|avoid|must not|does not|do not|is not|not evidence|not connected|not claim|must be decided before|not claimed|not implemented)\b/i.test(
      context
    ) || /unsupported/i.test(context)
  );
}

function readText(filePath) {
  return readFileSync(filePath, "utf8");
}

function relativePath(filePath) {
  return relative(root, filePath).replaceAll("\\", "/");
}

function unique(values) {
  return Array.from(new Set(values));
}

function report(label, failures) {
  if (failures.length === 0) {
    console.log(`${label} passed.`);
    return;
  }

  console.error(`${label} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
}
