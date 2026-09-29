import type { Metadata } from "next"
import { AuthCard } from "@/components/portal/auth-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { configured } from "@/lib/env"
import { enabledProviders } from "@/lib/auth-settings"
import { safeNext } from "@/lib/origin"
import { LoginForm } from "./form"

export const metadata: Metadata = { title: "Sign in" }

const ERRORS: Record<string, string> = {
  link: "That sign-in link has expired or was already used. Ask for a new one below.",
  google: "Google sign-in did not finish. Try again, or use an email link instead.",
  profile: "We could not load your account. Sign in again, and if it keeps happening, email hello@solenix.dev.",
}

export default async function Login({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams
  const next = safeNext(sp.next)
  const error = sp.error ? (ERRORS[sp.error] ?? ERRORS.link) : null
  const providers = configured.supabase() ? await enabledProviders() : { google: false, email: false }

  return (
    <AuthCard>
      <h1 className="mt-4 font-display text-h2 font-bold">Sign in to your portal</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Your project, your website and your invoices, in one place. There is no password to remember.
      </p>

      {configured.supabase() ? (
        <LoginForm next={next} error={error} google={providers.google} />
      ) : (
        <Alert className="mt-6 border-dashed border-line-strong bg-sunken">
          <AlertTitle>Sign-in is not switched on yet</AlertTitle>
          <AlertDescription>We are still connecting the portal. Email hello@solenix.dev if you need anything today.</AlertDescription>
        </Alert>
      )}

      <p className="mt-6 text-center text-sm text-faint">
        New here? <a href="mailto:hello@solenix.dev?subject=Book%20a%20call" className="font-semibold text-ember-text no-underline hover:underline">Book a call</a> and we will set you up.
      </p>
    </AuthCard>
  )
}
