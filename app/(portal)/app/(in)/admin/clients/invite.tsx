"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/portal/client-bits";
import { AlertIcon, CheckIcon, MailIcon, Plus } from "@/components/portal/icons";
import { inviteClient, type InviteState } from "../actions";

/** The invite sheet from the design, on a native <dialog>: focus trap and Escape for free. */
export function InviteButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action] = useActionState<InviteState, FormData>(inviteClient, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "sent") {
      formRef.current?.reset();
      dialog.current?.close();
    }
  }, [state]);

  const field = (name: "business" | "owner" | "email" | "domain") => ({
    "aria-invalid": state.errors?.[name] ? ("true" as const) : undefined,
    "aria-describedby": `inv-${name}-err`,
    defaultValue: state.values?.[name],
  });
  const Err = ({ name }: { name: "business" | "owner" | "email" | "domain" }) => (
    <p className={"err" + (state.errors?.[name] ? " is-shown" : "")} id={`inv-${name}-err`} role="alert">
      <AlertIcon /><span>{state.errors?.[name]}</span>
    </p>
  );

  return (
    <>
      <button className="btn btn-primary od-fixed" type="button" onClick={() => dialog.current?.showModal()}>
        <Plus />
        Invite a client
      </button>

      {state.status === "sent" && (
        <div className="toast" role="status">
          <CheckIcon /><span>{state.message}</span>
        </div>
      )}

      <dialog ref={dialog} className="sheet" aria-labelledby="sheet-title"
        style={{ margin: "auto", color: "inherit" }}
        onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}>
        <span className="icon-chip" aria-hidden="true"><MailIcon /></span>
        <h2 id="sheet-title">Invite a client</h2>
        <p>We email them a sign-in link. They see their website and their invoices — nothing else.</p>

        <form ref={formRef} action={action} noValidate>
          <div className="sheet-fields">
            <div className="od-field" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
              <label className="lbl" htmlFor="inv-business">Business name <span className="req">(required)</span></label>
              <input type="text" id="inv-business" name="business" autoComplete="organization" placeholder="Harbourview Books" {...field("business")} />
              <Err name="business" />
            </div>
            <div className="od-field" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
              <label className="lbl" htmlFor="inv-owner">Who runs it <span className="req">(required)</span></label>
              <input type="text" id="inv-owner" name="owner" autoComplete="name" placeholder="Ruth Power" {...field("owner")} />
              <Err name="owner" />
            </div>
            <div className="od-field" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
              <label className="lbl" htmlFor="inv-email">Their email <span className="req">(required)</span></label>
              <input type="email" id="inv-email" name="email" autoComplete="email" inputMode="email" placeholder="ruth@harbourviewbooks.ca" {...field("email")} />
              <Err name="email" />
            </div>
            <div className="od-field" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
              <label className="lbl" htmlFor="inv-domain">Their website</label>
              <input type="text" id="inv-domain" name="domain" inputMode="url" placeholder="harbourviewbooks.ca" {...field("domain")} />
              <p className="xs faint">Leave it empty if the site is not live yet.</p>
              <Err name="domain" />
            </div>
            <div className="od-field" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
              <label className="lbl" htmlFor="inv-project">Vercel project</label>
              <input type="text" id="inv-project" name="project" placeholder="harbourview-books" defaultValue={state.values?.project} />
              <p className="xs faint">The project name on team Solenix. It shows when the site last changed.</p>
            </div>
          </div>

          {(state.status === "error" || state.status === "exists") && (
            <p className="err is-shown" role="alert" style={{ marginTop: "var(--space-4)" }}>
              <AlertIcon /><span>{state.message}</span>
            </p>
          )}

          <div className="sheet-actions">
            <button className="btn btn-ghost" type="button" onClick={() => dialog.current?.close()}>Cancel</button>
            <SubmitButton busy="Sending…">Send the invite</SubmitButton>
          </div>
        </form>
      </dialog>
    </>
  );
}
