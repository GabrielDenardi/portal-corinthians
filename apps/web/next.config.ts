import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(process.cwd(), "../../"),
  transpilePackages: ["@portal-corinthians/contracts"],
};

export default nextConfig;
