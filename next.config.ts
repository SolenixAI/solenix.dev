import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The static site served /index.html and /agents.html under clean URLs.
  // Keep the old file names working.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/agents.html", destination: "/agents", permanent: true },
    ];
  },
};

export default nextConfig;
