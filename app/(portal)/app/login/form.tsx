"use client"

import { CircleCheck } from "lucide-react"
import { useActionState } from "react"
import { SubmitButton } from "@/components/portal/submit-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { sendMagicLink, signInWithGoogle, type LinkState } from "./actions"

function GoogleMark() {
  // Google's own colours are part of its mark, so they are the one exception to the token rule.
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4">
      <path fill="#4285F4" d="M19.6 10.23c0-.7-.06-1.37-.18-2.02H10v3.82h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.32 2.98-7.32z" />
      <path fill="#34A853" d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H1.07v2.58A10 10 0 0 0 10 20z" />
      <path fill="#FBBC05" d="M4.41 11.9a6 6 0 0 1 0-3.8V5.52H1.07a10 10 0 0 0 0 8.96l3.34-2.58z" />
      <path fill="#EA4335" d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 10 0 10 10 0 0 0 1.07 5.52l3.34 2.58C5.2 5.74 7.4 3.98 10 3.98z" />
    </svg>
  )
}

export function LoginForm({ next, error, google }: { next: string; error: string | null; google: boolean }) {
  const [state, action] = useActionState<LinkState, FormData>(sendMagicLink, { status: "idle" })
  const invalid = state.status === "invalid"

  return (
    <div className="mt-6 grid gap-5">
      {error && (
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      )}

      {google && (
        <>
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <SubmitButton variant="ghost" className="w-full" busy="Opening Google…">
          <GoogleMark />
          Continue with Google
        </SubmitButton>
      </form>

      <div className="flex items-center gap-3 font-mono text-xs tracking-label text-faint uppercase">
        <Separator className="flex-1" />or<Separator className="flex-1" />
      </div>

        </>
      )}

      {state.status === "sent" ? (
        <Alert className="border-ok/30 bg-ok-tint text-ok">
          <CircleCheck />
          <AlertDescription className="text-ok">
            If <strong>{state.email}</strong> has a portal, a sign-in link is on its way. It works once, for one hour.
            Nothing arrived? Check spam, or email hello@solenix.dev.
          </AlertDescription>
        </Alert>
      ) : (
        <form action={action} noValidate className="grid gap-4">
          <input type="hidden" name="next" value={next} />
          <Field data-invalid={invalid || state.status === "error"}>
            <FieldLabel htmlFor="email">Email <span className="font-normal text-ember-text">(required)</span></FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="dana@mapleandrye.ca"
              defaultValue={state.email}
              aria-invalid={invalid || undefined}
              required
            />
            <FieldDescription>Use the address we send your invoices to.</FieldDescription>
            {invalid && <FieldError>That does not look like an email address. Check for a missing @ or a typo in the domain.</FieldError>}
            {state.status === "error" && <FieldError>We could not send the link just now. Try again in a minute.</FieldError>}
          </Field>
          <SubmitButton busy="Sending…">Email me a link</SubmitButton>
        </form>
      )}
    </div>
  )
}
