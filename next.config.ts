import type { NextConfig } from "next";
import { POSTHOG_ASSETS_HOST, POSTHOG_HOST, POSTHOG_PROXY } from "./lib/analytics";

const nextConfig: NextConfig = {
  // PostHog through the site's own domain (lib/analytics.ts). Its API paths end in slashes.
  skipTrailingSlashRedirect: true,
  // The dev badge sat on page content in every review screenshot; build errors still show as an overlay.
  devIndicators: false,
  // Makers' GitHub avatars on /agents, served through the site's own image optimiser.
  images: { remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/u/**" }] },
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
      // skipTrailingSlashRedirect is on, so Next answers "/agents/" and "/agents" alike. Each page's slashed form
      // answers a permanent redirect to the slashless one. The paths are named one by one: PostHog's proxy paths end in
      // slashes, and a pattern for every trailing slash would redirect them too.
      { source: "/agents/", destination: "/agents", permanent: true },
      { source: "/articles/", destination: "/articles", permanent: true },
      { source: "/articles/proof-flood/", destination: "/articles/proof-flood", permanent: true },
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
