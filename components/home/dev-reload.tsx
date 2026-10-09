"use client";

import { useEffect } from "react";

// Development only (app/(site)/page.tsx renders it while `next dev` runs): a saved design/home.html reloads the open
// tab, as it did when the homepage was served as raw HTML (client/dev-reload.ts). The stream is /dev/reload
// (app/dev/reload/route.ts). Only the top window listens, so a frame never adds a second connection.
export function DevReload() {
  useEffect(() => {
    if (window.self !== window.top) return;
    let start: string | null = null;
    const source = new EventSource("/dev/reload");
    source.addEventListener("hello", (e: MessageEvent<string>) => {
      if (start !== null && start !== e.data) location.reload();
      start = e.data;
    });
    source.addEventListener("change", () => location.reload());
    return () => source.close();
  }, []);
  return null;
}
