import type { NextConfig } from "next";
import { POSTHOG_ASSETS_HOST, POSTHOG_HOST, POSTHOG_PROXY } from "./lib/analytics";

const nextConfig: NextConfig = {
  // PostHog through the site's own domain (lib/analytics.ts). Its API paths end in slashes.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: `${POSTHOG_PROXY}/static/:path*`, destination: `${POSTHOG_ASSETS_HOST}/static/:path*` },
      { source: `${POSTHOG_PROXY}/array/:path*`, destination: `${POSTHOG_ASSETS_HOST}/array/:path*` },
      { source: `${POSTHOG_PROXY}/:path*`, destination: `${POSTHOG_HOST}/:path*` },
    ];
  },
  // The static site served /index.html and /agents.html under clean URLs.
  // Keep the old file names working.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/agents.html", destination: "/agents", permanent: true },
      // Book a call: Jager's booking page on the jager@solenix.dev calendar.
      {
        source: "/book",
        destination:
          "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2-BiW6yOBaQKhP46VLsniVKUUgECDGJoa0Oy5wKbbnbUVr9AQw64WVwMf8osSPg8LbyhUg9IGz",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
