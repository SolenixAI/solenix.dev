"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/portal/client-bits";
import { AlertIcon, CheckIcon, GoogleIcon } from "@/components/portal/icons";
import { sendMagicLink, signInWithGoogle, type LinkState } from "./actions";

export function LoginForm({ next, error }: { next: string; error: string | null }) {
  const [state, action] = useActionState<LinkState, FormData>(sendMagicLink, { status: "idle" });
  const invalid = state.status === "invalid";

  return (
    <>
      {error && (
        <p className="err is-shown" role="alert" style={{ marginTop: "var(--space-5)" }}>
          <AlertIcon /><span>{error}</span>
        </p>
      )}

      <form action={signInWithGoogle} style={{ marginTop: "var(--space-6)" }}>
        <input type="hidden" name="next" value={next} />
        <SubmitButton className="btn btn-ghost btn-block" busy="Opening Google…">
          <GoogleIcon />
          Continue with Google
        </SubmitButton>
      </form>

      <p className="or" style={{ marginTop: "var(--space-5)" }}>or</p>

      {state.status === "sent" ? (
        <div className="ok-note" role="status" style={{ marginTop: "var(--space-5)" }}>
          <CheckIcon />
          <span>
            If <strong>{state.email}</strong> has a portal, a sign-in link is on its way. It works once, for one hour.
            Nothing arrived? Check spam, or email hello@solenix.dev.
          </span>
        </div>
      ) : (
        <form action={action} noValidate style={{ marginTop: "var(--space-5)" }}>
          <input type="hidden" name="next" value={next} />
          <div className="od-field" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
            <label className="lbl" htmlFor="email">Email <span className="req">(required)</span></label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder="dana@mapleandrye.ca"
              defaultValue={state.email}
              aria-invalid={invalid ? "true" : undefined}
              aria-describedby="email-help email-err"
              required
            />
            <p className="xs faint" id="email-help">Use the address we send your invoices to.</p>
          </div>
          <p className={"err" + (invalid || state.status === "error" ? " is-shown" : "")} id="email-err" role="alert">
            <AlertIcon />
            <span>
              {state.status === "error"
                ? "We could not send the link just now. Try again in a minute."
                : "That does not look like an email address. Check for a missing @ or a typo in the domain."}
            </span>
          </p>
          <SubmitButton busy="Sending…">Email me a link</SubmitButton>
        </form>
      )}
    </>
  );
}
