"use client";

import { useEffect } from "react";
import { LIVE_HOST, POSTHOG_KEY, POSTHOG_OPTIONS } from "@/lib/analytics";

// Measurement for every page of the public site (one setup, lib/analytics.ts): PostHog on the live site, and Vercel
// Speed Insights, as the homepage loaded them when it was served as raw HTML. Only the top window measures, so a page
// shown inside a frame (a live preview on an article card) does not inflate the numbers.
export function Analytics() {
  useEffect(() => {
    if (window.top !== window.self) return;
    if (location.hostname === LIVE_HOST) {
      import("posthog-js").then(({ default: posthog }) => {
        posthog.init(POSTHOG_KEY, { ...POSTHOG_OPTIONS });
      });
    }
    const src = "/_vercel/speed-insights/script.js";
    if (document.querySelector(`script[src="${src}"]`)) return;
    const w = window as Window & { si?: (...args: unknown[]) => void; siq?: unknown[] };
    w.si = w.si || function () {
      (w.siq = w.siq || []).push(arguments);
    };
    const s = document.createElement("script");
    s.defer = true;
    s.src = src;
    document.head.appendChild(s);
  }, []);
  return null;
}
