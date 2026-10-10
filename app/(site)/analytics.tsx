"use client";

import { useEffect } from "react";
import { POSTHOG_KEY, POSTHOG_OPTIONS, POSTHOG_PROPERTIES } from "@/lib/analytics";

// Measurement for every page of the public site (one setup, lib/analytics.ts): PostHog on the live site, and Vercel
// Speed Insights, as the homepage loaded them when it was served as raw HTML. Only the top window measures, so a page
// shown inside a frame (a live preview on an article card) does not inflate the numbers.
// `host` is the live site's host, derived on the server (SITE_HOST): a browser bundle cannot read Vercel's variable.
export function Analytics({ host }: { host: string }) {
  useEffect(() => {
    if (window.top !== window.self) return;
    if (location.hostname === host) {
      import("posthog-js").then(({ default: posthog }) => {
        posthog.init(POSTHOG_KEY, { ...POSTHOG_OPTIONS });
        posthog.register(POSTHOG_PROPERTIES);
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
  }, [host]);
  return null;
}
