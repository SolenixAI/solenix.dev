"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "@/lib/env"

// Invite links from Supabase's default email template put the session in the
// URL fragment (#access_token=…). Invites do not support PKCE, so the server
// never sees a code. This page reads the fragment and stores the session in
// cookies. URL detection is off, because the PKCE-mode client rejects
// fragment tokens on start-up.

export function Finish() {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const access_token = hash.get("access_token")
    const refresh_token = hash.get("refresh_token")
    const raw = new URLSearchParams(window.location.search).get("next") ?? "/app"
    const next = raw.startsWith("/app") && !raw.startsWith("//") ? raw : "/app"

    if (!access_token || !refresh_token) {
      setFailed(true)
      return
    }
    createBrowserClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, { auth: { detectSessionInUrl: false } })
      .auth.setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) setFailed(true)
        else window.location.replace(next)
      })
  }, [])

  if (failed) {
    return (
      <>
        <h1 className="mt-4 font-display text-h2 font-bold">That link did not work</h1>
        <p className="mt-3 text-sm text-muted-foreground">It may have expired or been used already. Ask for a new one and it will be in your inbox in a minute.</p>
        <Button asChild className="mt-6 w-full"><a href="/app/login">Get a new link</a></Button>
      </>
    )
  }
  return (
    <>
      <h1 className="mt-4 font-display text-h2 font-bold">Signing you in…</h1>
      <p className="mt-3 text-sm text-muted-foreground" role="status">One moment.</p>
    </>
  )
}
