"use client";

import { useEffect } from "react";

// Pageviews for the public site, so the portal can show solenix.dev's visitors.
// One PostHog project holds every client site; the portal separates them by host.
// The project token is public by design (it only allows sending events).
const TOKEN = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "phc_pNXLaGwzrx5ghbpWQKT9SBmv4JNVZzDrdFjCBs2Zo9Ap";
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export function Analytics() {
  useEffect(() => {
    // Only the live site counts. Previews and localhost would inflate the numbers.
    if (location.hostname !== "solenix.dev") return;
    import("posthog-js").then(({ default: posthog }) => {
      posthog.init(TOKEN, {
        api_host: HOST,
        defaults: "2025-05-24",
        person_profiles: "identified_only",
        autocapture: false,
        disable_session_recording: true,
      });
    });
  }, []);
  return null;
}
