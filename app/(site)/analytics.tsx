"use client";

import { useEffect } from "react";
import { LIVE_HOST, POSTHOG_KEY, POSTHOG_OPTIONS } from "@/lib/analytics";

// PostHog for the React pages of the public site, with the same setup as the
// homepage (lib/analytics.ts).
export function Analytics() {
  useEffect(() => {
    if (location.hostname !== LIVE_HOST) return;
    import("posthog-js").then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, { ...POSTHOG_OPTIONS });
    });
  }, []);
  return null;
}
