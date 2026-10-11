"use client";

import { useEffect } from "react";

// Development only (app/(site)/page.tsx renders it while `next dev` runs): the homepage runs the one live-reload
// client, client/dev-reload.ts, as the raw pages do, so a saved design/home.html reloads the open tab. The script
// is loaded only here, so production never ships it; it listens once per tab, for the tab's life.
export function DevReload() {
  useEffect(() => {
    import("@/lib/client.generated").then(({ CLIENT }) => {
      const script = document.createElement("script");
      script.textContent = CLIENT["dev-reload"];
      document.head.append(script);
    });
  }, []);
  return null;
}
