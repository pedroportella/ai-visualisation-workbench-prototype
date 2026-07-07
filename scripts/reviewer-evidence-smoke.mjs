#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const repositoryFiles = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8" }
)
  .split("\0")
  .filter(Boolean);
const repositoryFileSet = new Set(repositoryFiles);
const failures = [];

const requiredEngineeringDocFiles = [
  "docs/architecture.md",
  "docs/frontend-architecture.md",
  "docs/backend-architecture.md",
  "docs/design-system-adapter.md",
  "docs/api-and-security-evidence.md",
  "docs/accessibility-and-ui-evidence.md",
  "docs/testing-and-guardrails.md",
  "docs/engineering-decisions.md"
];
const requiredFiles = [
  "README.md",
  "AGENTS.md",
  "backend/README.md",
  "docker/README.md",
  "docs/README.md",
  ...requiredEngineeringDocFiles,
  "docs/aws-release-readiness.md",
  "docs/reviewer-pack.md",
  "docs/screenshots/evidence-workbench-overview-light.png",
  "docs/screenshots/evidence-workbench-review-light.png",
  "docs/screenshots/evidence-workbench-process-light.png",
  "docs/screenshots/evidence-workbench-overview-dark-theme-preview.png",
  "docs/screenshots/evidence-workbench-review-dark-theme-preview.png",
  "docs/screenshots/evidence-workbench-process-dark-theme-preview.png",
  "docs/release-orchestration-decision.md",
  "frontend/README.md",
  "package.json",
  "playwright.config.ts",
  "scripts/README.md",
  "scripts/local-docker-smoke.py",
  "scripts/quality-guards.mjs",
  "scripts/reviewer-evidence-smoke.mjs",
  "scripts/run-docker-e2e.mjs",
  "scripts/run-playwright.mjs",
  "tests/e2e/evidence-workbench.mock.spec.ts",
  "tests/e2e/evidence-workbench.real.spec.ts",
  "tests/visual/evidence-workbench-layout.spec.ts"
];
const requiredRootScripts = [
  "guard",
  "guard:artifacts",
  "guard:browser-bundles",
  "guard:browser-origins",
  "guard:claim-boundaries",
  "guard:public-docs",
  "guard:secrets",
  "test:e2e",
  "test:e2e:mock",
  "test:e2e:mock:headed",
  "test:e2e:real",
  "test:e2e:real:headed",
  "test:e2e:report",
  "test:reviewer-evidence",
  "test:visual"
];
const requiredScriptReadmeText = [
  "pnpm guard",
  "pnpm guard:browser-bundles",
  "pnpm test:e2e:mock",
  "pnpm test:e2e:real",
  "pnpm test:reviewer-evidence",
  "pnpm test:visual",
  "no-screenshot"
];
const requiredReadmeText = [
  "pnpm guard",
  "pnpm test:e2e:mock",
  "pnpm test:visual",
  "pnpm test:reviewer-evidence",
  "docs/reviewer-pack.md",
  ...requiredEngineeringDocFiles
];
const requiredDocsIndexText = [
  "reviewer-pack.md",
  "architecture.md",
  "frontend-architecture.md",
  "backend-architecture.md",
  "design-system-adapter.md",
  "api-and-security-evidence.md",
  "accessibility-and-ui-evidence.md",
  "testing-and-guardrails.md",
  "engineering-decisions.md",
  "environment-configuration-decision.md",
  "release-orchestration-decision.md",
  "aws-release-readiness.md"
];
const requiredAwsReadinessText = [
  "pnpm guard",
  "pnpm test:e2e:mock",
  "pnpm test:visual",
  "pnpm test:reviewer-evidence",
  "pnpm test:e2e:real",
  "pnpm guard:browser-bundles"
];
const requiredReviewerPackText = [
  "pnpm --filter @aivis/workbench dev",
  "pnpm test:reviewer-evidence",
  "pnpm guard:public-docs",
  "pnpm guard:claim-boundaries",
  "pnpm test:visual",
  "/evidence-workbench",
  "/evidence-workbench/review",
  "/evidence-workbench/sources",
  "/evidence-workbench/process",
  "/evidence-workbench/audit",
  "screenshots/evidence-workbench-overview-light.png",
  "screenshots/evidence-workbench-review-light.png",
  "screenshots/evidence-workbench-process-light.png",
  "screenshots/evidence-workbench-overview-dark-theme-preview.png",
  "screenshots/evidence-workbench-review-dark-theme-preview.png",
  "screenshots/evidence-workbench-process-dark-theme-preview.png",
  "Where To Go Deeper",
  "architecture.md",
  "frontend-architecture.md",
  "backend-architecture.md",
  "design-system-adapter.md",
  "api-and-security-evidence.md",
  "accessibility-and-ui-evidence.md",
  "testing-and-guardrails.md",
  "engineering-decisions.md",
  "synthetic fixture evidence",
  "local review state only",
  "not visual baselines",
  "not proof of a user-facing theme switcher",
  "does not claim real TMR data",
  "official TMR system",
  "QChat integration",
  "live AWS deployment",
  "production RAG",
  "production GraphRAG",
  "Bedrock",
  "Neo4j",
  "Terraform",
  "SSO",
  "source-system writeback"
];
const requiredEngineeringDocText = {
  "docs/architecture.md": [
    "implemented prototype architecture",
    "synthetic fixture evidence",
    "local review state",
    "production-next"
  ],
  "docs/frontend-architecture.md": [
    "server-only backend origin",
    "NEXT_PUBLIC_*BACKEND",
    "local review state",
    "React Flow",
    "safe hash"
  ],
  "docs/backend-architecture.md": [
    "FastAPI",
    "deterministic synthetic content",
    "local process state",
    "source-system writeback"
  ],
  "docs/design-system-adapter.md": [
    "QHDS/QGDS-style",
    "@aivis/ui-tokens",
    "no-screenshot",
    "not proof of a user-facing theme switcher"
  ],
  "docs/api-and-security-evidence.md": [
    "server-only backend origin",
    "NEXT_PUBLIC_*BACKEND",
    "Generated answer markdown",
    "not a formal security assurance"
  ],
  "docs/accessibility-and-ui-evidence.md": [
    "not a formal WCAG audit",
    "Text process map",
    "no-screenshot",
    "not formal WCAG assurance"
  ],
  "docs/testing-and-guardrails.md": [
    "pnpm test:reviewer-evidence",
    "pnpm guard:public-docs",
    "pnpm guard:claim-boundaries",
    "formal WCAG assurance"
  ],
  "docs/engineering-decisions.md": [
    "Environment configuration decision",
    "Release orchestration decision",
    "Production-Next Limits"
  ]
};
const forbiddenPublicDocPatterns = [
  { label: "internal notes path", pattern: new RegExp("ai-" + "notes", "i") },
  { label: "internal planning term", pattern: new RegExp("\\bdeep-" + "end\\b", "i") },
  { label: "internal work-item term", pattern: new RegExp("\\bpa" + "cket\\b", "i") },
  {
    label: "internal delivery term",
    pattern: new RegExp("delivery\\s+la" + "ne|\\bdelivery-la" + "ne\\b", "i")
  },
  { label: "internal stage code", pattern: /\b[BCFIQR][0-9]{2}[A-Z]?\b/ },
  { label: "merge conflict marker", pattern: /^(<<<<<<<|=======|>>>>>>>)$/m },
  { label: "AWS access key", pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { label: "literal AWS account ARN", pattern: /arn:aws:iam::\d{12}:/ },
  { label: "local environment file path", pattern: /(^|[`'\s])\.env(?!\.example\b)\b/ }
];
const unsupportedClaimPatterns = [
  { label: "real TMR data", pattern: /\breal TMR data\b/i },
  { label: "official TMR", pattern: /\bofficial TMR\b/i },
  { label: "QChat integration", pattern: /\bQChat integration\b/i },
  { label: "production RAG", pattern: /\bproduction RAG\b|\bproduction GraphRAG\b/i },
  { label: "source-system writeback", pattern: /\bsource-system writeback\b/i },
  { label: "live AWS deployment proof", pattern: /\blive AWS deployment has been run\b/i }
];

for (const filePath of requiredFiles) {
  if (!repositoryFileSet.has(filePath) && !existsSync(filePath)) {
    failures.push(`required evidence file is missing: ${filePath}`);
  }
}

if (existsSync("package.json")) {
  const rootManifest = JSON.parse(readFileSync("package.json", "utf8"));
  for (const scriptName of requiredRootScripts) {
    if (!rootManifest.scripts?.[scriptName]) {
      failures.push(`package.json is missing required script: ${scriptName}`);
    }
  }
}

checkIncludes("README.md", requiredReadmeText);
checkIncludes("docs/README.md", requiredDocsIndexText);
checkIncludes("docs/aws-release-readiness.md", requiredAwsReadinessText);
checkIncludes("docs/reviewer-pack.md", requiredReviewerPackText);
checkIncludes("scripts/README.md", requiredScriptReadmeText);
for (const [filePath, expectedTexts] of Object.entries(requiredEngineeringDocText)) {
  checkIncludes(filePath, expectedTexts);
}

for (const filePath of publicMarkdownFiles()) {
  const contents = readFileSync(filePath, "utf8");

  const lines = contents.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const forbidden of forbiddenPublicDocPatterns) {
      forbidden.pattern.lastIndex = 0;
      if (!forbidden.pattern.test(line)) {
        continue;
      }

      if (
        forbidden.label === "local environment file path" &&
        /\b(excluded|ignored|example|do not commit)\b/i.test(line)
      ) {
        continue;
      }

      failures.push(`${filePath}:${index + 1} contains ${forbidden.label}`);
    }

    for (const claim of unsupportedClaimPatterns) {
      claim.pattern.lastIndex = 0;
      if (claim.pattern.test(line) && !isNegativeGuardrailLine(line, lines, index)) {
        failures.push(`${filePath}:${index + 1} contains unsupported claim marker: ${claim.label}`);
      }
    }
  });

  for (const linkTarget of extractMarkdownLinkTargets(contents)) {
    checkMarkdownLink(filePath, linkTarget);
  }
}

if (failures.length > 0) {
  console.error("Reviewer evidence smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Reviewer evidence smoke passed.");
}

function checkIncludes(filePath, expectedTexts) {
  if (!existsSync(filePath)) {
    failures.push(`${filePath} is missing`);
    return;
  }

  const contents = readFileSync(filePath, "utf8");
  for (const expected of expectedTexts) {
    if (!contents.includes(expected)) {
      failures.push(`${filePath} is missing expected reviewer evidence: ${expected}`);
    }
  }
}

function publicMarkdownFiles() {
  return repositoryFiles.filter(
    (filePath) =>
      existsSync(filePath) &&
      (filePath === "README.md" ||
        filePath === "AGENTS.md" ||
        filePath.endsWith("/README.md") ||
        (filePath.startsWith("docs/") && filePath.endsWith(".md")))
  );
}

function extractMarkdownLinkTargets(contents) {
  const targets = [];
  const markdownLinkPattern = /!?\[[^\]]*]\(([^)]+)\)/g;
  let match;

  while ((match = markdownLinkPattern.exec(contents)) !== null) {
    const rawTarget = match[1].trim().split(/\s+/)[0];
    targets.push(stripAngleBrackets(rawTarget));
  }

  return targets;
}

function stripAngleBrackets(value) {
  if (value.startsWith("<") && value.endsWith(">")) {
    return value.slice(1, -1);
  }

  return value;
}

function checkMarkdownLink(sourceFilePath, rawTarget) {
  if (
    rawTarget === "" ||
    rawTarget.startsWith("#") ||
    /^[a-z][a-z0-9+.-]*:/i.test(rawTarget)
  ) {
    return;
  }

  const [pathWithoutAnchor] = rawTarget.split("#");
  if (pathWithoutAnchor === "") {
    return;
  }

  let decodedPath = pathWithoutAnchor;
  try {
    decodedPath = decodeURIComponent(pathWithoutAnchor);
  } catch {
    failures.push(`${sourceFilePath} has an invalid encoded Markdown link: ${rawTarget}`);
    return;
  }

  const resolvedPath = normalize(join(dirname(sourceFilePath), decodedPath));

  if (!existsSync(resolvedPath)) {
    failures.push(`${sourceFilePath} links to missing local target: ${rawTarget}`);
    return;
  }

  const stats = statSync(resolvedPath);
  if (!stats.isFile() && !stats.isDirectory()) {
    failures.push(`${sourceFilePath} links to unsupported local target: ${rawTarget}`);
  }
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
    line
  ]
    .filter(Boolean)
    .join(" ");

  return /\b(no|not|never|without|avoid|must not|does not|do not|is not|not evidence|not connected|not claim|must be decided before|not claimed)\b/i.test(
    context
  );
}
