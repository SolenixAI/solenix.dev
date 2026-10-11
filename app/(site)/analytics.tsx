"use client";

import { useEffect } from "react";
import { captureGoal, POSTHOG_KEY, POSTHOG_OPTIONS, POSTHOG_PROPERTIES } from "@/lib/analytics";

// Measurement for every page of the public site (one setup, lib/analytics.ts): PostHog on the live site, and Vercel
// Speed Insights, as the homepage loaded them when it was served as raw HTML. Only the top window measures, so a page
// shown inside a frame (a live preview on an article card) does not inflate the numbers.
// `host` is the live site's host, derived on the server (SITE_HOST): a browser bundle cannot read Vercel's variable.
export function Analytics({ host }: { host: string }) {
  useEffect(() => {
    if (window.top !== window.self) return;
    // The click listener is kept by name, so cleanup can remove it; a posthog-js import that resolves after cleanup does nothing.
    let disposed = false;
    const onBookClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.('a[href="/book"]')) captureGoal("book_call_clicked");
    };
    if (location.hostname === host) {
      import("posthog-js").then(({ default: posthog }) => {
        if (disposed) return;
        posthog.init(POSTHOG_KEY, { ...POSTHOG_OPTIONS });
        posthog.register(POSTHOG_PROPERTIES);
        window.posthog = posthog;
        // Every "Book a call" link points at /book: a click on one is the book-call goal.
        addEventListener("click", onBookClick);
      });
    }
    loadSpeedInsights();
    return () => {
      disposed = true;
      removeEventListener("click", onBookClick);
    };
  }, [host]);
  return null;
}

// Vercel Speed Insights, loaded once per page.
function loadSpeedInsights() {
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
}
