"use client";

import { useEffect } from "react";

// Development only (app/(site)/page.tsx renders it while `next dev` runs): the homepage runs the one live-reload
// client, client/dev-reload.ts, as the raw pages do, so a saved design/home.html reloads the open tab. The import
// sits behind the NODE_ENV check, which the build replaces, so a production build drops it. The stream closes
// when the homepage leaves, so a client move to another page does not reload that page.
export function DevReload() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    let left = false; // the homepage may leave before the import resolves: then nothing starts
    import("@/lib/client.generated").then(({ CLIENT }) => {
      if (left) return;
      const script = document.createElement("script");
      script.textContent = CLIENT["dev-reload"];
      document.head.append(script);
    });
    return () => {
      left = true;
      const tab = window as Window & { __devReload?: EventSource };
      tab.__devReload?.close();
      tab.__devReload = undefined;
    };
  }, []);
  return null;
}
