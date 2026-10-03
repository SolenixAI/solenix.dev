"use client"

import { useActionState } from "react"
import { SubmitButton } from "@/components/portal/submit-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { completeWelcome, type WelcomeState } from "./actions"

const PROVINCES = [
  ["AB", "Alberta"], ["BC", "British Columbia"], ["MB", "Manitoba"], ["NB", "New Brunswick"],
  ["NL", "Newfoundland and Labrador"], ["NS", "Nova Scotia"], ["NT", "Northwest Territories"],
  ["NU", "Nunavut"], ["ON", "Ontario"], ["PE", "Prince Edward Island"], ["QC", "Quebec"],
  ["SK", "Saskatchewan"], ["YT", "Yukon"],
] as const

export function WelcomeForm({ initial }: { initial: Record<string, string> }) {
  const [state, action] = useActionState<WelcomeState, FormData>(completeWelcome, { status: "idle", values: initial })
  const val = (k: string) => state.values?.[k] ?? initial[k] ?? ""

  const text = (name: string, label: string, props: React.ComponentProps<typeof Input> & { required?: boolean; help?: string }) => {
    const { help, required, ...rest } = props
    const err = state.errors?.[name]
    return (
      <Field data-invalid={!!err}>
        <FieldLabel htmlFor={`w-${name}`}>{label}{required && <span className="font-normal text-ember-text"> (required)</span>}</FieldLabel>
        <Input id={`w-${name}`} name={name} defaultValue={val(name)} aria-invalid={err ? true : undefined} {...rest} />
        {help && <FieldDescription>{help}</FieldDescription>}
        {err && <FieldError>{err}</FieldError>}
      </Field>
    )
  }

  return (
    <form action={action} noValidate className="mt-6 grid gap-6">
      <FieldGroup className="gap-4">
        {text("business", "Business name", { required: true, autoComplete: "organization", placeholder: "Maple & Rye" })}
        {text("contact", "Your name", { required: true, autoComplete: "name", placeholder: "Dana Walsh" })}
        {text("email", "Billing email", { required: true, type: "email", inputMode: "email", autoComplete: "email", placeholder: "dana@mapleandrye.ca", help: "Invoices and receipts go here." })}
        {text("domain", "Your website", { inputMode: "url", placeholder: "mapleandrye.ca", help: "Leave it empty if you do not have one yet." })}
      </FieldGroup>

      <FieldSet>
        <FieldLegend>Billing address</FieldLegend>
        <FieldGroup className="gap-4">
          {text("line1", "Street address", { required: true, autoComplete: "address-line1", placeholder: "12 Water Street" })}
          {text("line2", "Unit or suite", { autoComplete: "address-line2", placeholder: "Suite 3" })}
          <div className="grid gap-4 sm:grid-cols-2">
            {text("city", "City or town", { required: true, autoComplete: "address-level2", placeholder: "St. John's" })}
            <Field>
              <FieldLabel htmlFor="w-province">Province</FieldLabel>
              <NativeSelect id="w-province" name="province" defaultValue={val("province")} autoComplete="address-level1">
                <NativeSelectOption value="">Not in Canada</NativeSelectOption>
                {PROVINCES.map(([code, name]) => <NativeSelectOption key={code} value={code}>{name}</NativeSelectOption>)}
              </NativeSelect>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {text("postal", "Postal code", { required: true, autoComplete: "postal-code", placeholder: "A1C 1A1" })}
            <Field>
              <FieldLabel htmlFor="w-country">Country</FieldLabel>
              <NativeSelect id="w-country" name="country" defaultValue={val("country")} autoComplete="country">
                <NativeSelectOption value="CA">Canada</NativeSelectOption>
                <NativeSelectOption value="US">United States</NativeSelectOption>
              </NativeSelect>
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      {state.status === "error" && (
        <Alert variant="destructive">
          <AlertDescription>We could not save that just now. Nothing was charged. Try again, and if it keeps happening, email hello@solenix.dev.</AlertDescription>
        </Alert>
      )}

      <SubmitButton busy="Saving…">Open my portal</SubmitButton>
    </form>
  )
}
