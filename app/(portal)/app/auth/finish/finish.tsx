"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

// Invite links from Supabase's default email template put the session in the
// URL fragment (#access_token=…). The server never sees a fragment, so this
// page reads it, stores the session in cookies, and moves on.

export function Finish() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("next") ?? "/app";
    const next = raw.startsWith("/app") && !raw.startsWith("//") ? raw : "/app";

    if (!access_token || !refresh_token) {
      setFailed(true);
      return;
    }
    createClient()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) setFailed(true);
        else window.location.replace(next);
      });
  }, []);

  if (failed) {
    return (
      <>
        <h1>That link did not work</h1>
        <p className="lede">It may have expired or been used already. Ask for a new one and it will be in your inbox in a minute.</p>
        <p style={{ marginTop: "var(--space-6)" }}>
          <a className="btn btn-primary btn-block" href="/app/login">Get a new link</a>
        </p>
      </>
    );
  }
  return (
    <>
      <h1>Signing you in…</h1>
      <p className="lede" role="status">One moment.</p>
    </>
  );
}
