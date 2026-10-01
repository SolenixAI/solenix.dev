import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
