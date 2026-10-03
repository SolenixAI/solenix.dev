import type { Metadata } from "next"
import { AuthCard } from "@/components/portal/auth-card"
import { Button } from "@/components/ui/button"
import { safeNext } from "@/lib/origin"

export const metadata: Metadata = { title: "Sign in" }

// Email links land here first. Mail scanners open links to check them, which
// would use up a one-time link before the person clicks it. Scanners follow
// links but don't submit forms, so the link is only spent by this button.

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { token_hash, type, next } = await searchParams
  if (!token_hash || !type) {
    return (
      <AuthCard>
        <h1 className="mt-4 font-display text-h2 font-bold">That link did not work</h1>
        <p className="mt-3 text-sm text-muted-foreground">Ask for a new one and it will be in your inbox in a minute.</p>
        <Button asChild className="mt-6 w-full"><a href="/app/login">Get a new link</a></Button>
      </AuthCard>
    )
  }
  return (
    <AuthCard>
      <h1 className="mt-4 font-display text-h2 font-bold">Sign in to your portal</h1>
      <p className="mt-3 text-sm text-muted-foreground">One tap and you are in.</p>
      <form method="post" action="/app/auth/callback" className="mt-6">
        <input type="hidden" name="token_hash" value={token_hash} />
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="next" value={safeNext(next ?? null)} />
        <Button type="submit" className="w-full">Continue</Button>
      </form>
    </AuthCard>
  )
}
