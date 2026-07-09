import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: repoRoot,
  transpilePackages: ["@aivis/ui-assets", "@aivis/ui-library", "@aivis/ui-tokens", "@aivis/utils"]
};

export default nextConfig;
