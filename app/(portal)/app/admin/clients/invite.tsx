"use client"

import { Mail, Plus } from "lucide-react"
import { useActionState, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { SubmitButton } from "@/components/portal/submit-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { inviteClient, type InviteState } from "../actions"

type Key = "business" | "owner" | "email" | "domain"

/** The invite sheet from the design: three required fields, two optional, one email. */
export function InviteButton() {
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState<InviteState, FormData>(inviteClient, { status: "idle" })
  const form = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === "sent") {
      form.current?.reset()
      setOpen(false)
      toast.success(state.message ?? "Invite sent")
    }
  }, [state])

  const f = (name: Key) => ({
    id: `inv-${name}`,
    name,
    defaultValue: state.values?.[name],
    "aria-invalid": state.errors?.[name] ? true : undefined,
  })
  const err = (name: Key) => state.errors?.[name] && <FieldError>{state.errors[name]}</FieldError>

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus />Invite a client</Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-line bg-surface-solid p-8 sm:max-w-md">
        <DialogHeader className="gap-3 text-left">
          <span className="grid size-10 place-items-center rounded-md bg-ember-quiet text-ember-text" aria-hidden="true"><Mail className="size-5" /></span>
          <DialogTitle className="font-display text-h3 font-semibold">Invite a client</DialogTitle>
          <DialogDescription>We email them a sign-in link. They see their website, their projects and their invoices — nothing else.</DialogDescription>
        </DialogHeader>

        <form ref={form} action={action} noValidate>
          <FieldGroup className="mt-2 gap-4">
            <Field data-invalid={!!state.errors?.business}>
              <FieldLabel htmlFor="inv-business">Business name <span className="font-normal text-ember-text">(required)</span></FieldLabel>
              <Input {...f("business")} autoComplete="organization" placeholder="Harbourview Books" />
              {err("business")}
            </Field>
            <Field data-invalid={!!state.errors?.owner}>
              <FieldLabel htmlFor="inv-owner">Who runs it <span className="font-normal text-ember-text">(required)</span></FieldLabel>
              <Input {...f("owner")} autoComplete="name" placeholder="Ruth Power" />
              {err("owner")}
            </Field>
            <Field data-invalid={!!state.errors?.email}>
              <FieldLabel htmlFor="inv-email">Their email <span className="font-normal text-ember-text">(required)</span></FieldLabel>
              <Input {...f("email")} type="email" inputMode="email" autoComplete="email" placeholder="ruth@harbourviewbooks.ca" />
              {err("email")}
            </Field>
            <Field data-invalid={!!state.errors?.domain}>
              <FieldLabel htmlFor="inv-domain">Their website</FieldLabel>
              <Input {...f("domain")} inputMode="url" placeholder="harbourviewbooks.ca" />
              <FieldDescription>Leave it empty if the site is not live yet.</FieldDescription>
              {err("domain")}
            </Field>
            <Field>
              <FieldLabel htmlFor="inv-project">Vercel project</FieldLabel>
              <Input id="inv-project" name="project" defaultValue={state.values?.project} placeholder="harbourview-books" />
              <FieldDescription>The project name on team Solenix. It shows when the site last changed.</FieldDescription>
            </Field>
          </FieldGroup>

          {(state.status === "error" || state.status === "exists") && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="mt-6 grid grid-cols-1 gap-3 xs:grid-cols-2">
            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
            <SubmitButton busy="Sending…">Send the invite</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
