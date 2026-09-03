import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal ./.next/standalone folder with only the files needed
  // to run `node server.js` - what the Dockerfile copies into the runtime image.
  output: "standalone",
};

export default nextConfig;
