/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@aivis/ui-library", "@aivis/ui-tokens"]
};

export default nextConfig;
