"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/portal/client-bits";
import { AlertIcon } from "@/components/portal/icons";
import { completeWelcome, type WelcomeState } from "./actions";

const PROVINCES = [
  ["AB", "Alberta"], ["BC", "British Columbia"], ["MB", "Manitoba"], ["NB", "New Brunswick"],
  ["NL", "Newfoundland and Labrador"], ["NS", "Nova Scotia"], ["NT", "Northwest Territories"],
  ["NU", "Nunavut"], ["ON", "Ontario"], ["PE", "Prince Edward Island"], ["QC", "Quebec"],
  ["SK", "Saskatchewan"], ["YT", "Yukon"],
] as const;

type Props = { initial: Record<string, string> };

export function WelcomeForm({ initial }: Props) {
  const [state, action] = useActionState<WelcomeState, FormData>(completeWelcome, { status: "idle", values: initial });
  const val = (k: string) => state.values?.[k] ?? initial[k] ?? "";

  const Field = ({ name, label, required, help, ...rest }: {
    name: string; label: string; required?: boolean; help?: string;
  } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="od-field" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
      <label className="lbl" htmlFor={`w-${name}`}>{label}{required && <> <span className="req">(required)</span></>}</label>
      <input
        id={`w-${name}`}
        name={name}
        defaultValue={val(name)}
        aria-invalid={state.errors?.[name] ? "true" : undefined}
        aria-describedby={`w-${name}-err${help ? ` w-${name}-help` : ""}`}
        {...rest}
      />
      {help && <p className="xs faint" id={`w-${name}-help`}>{help}</p>}
      <p className={"err" + (state.errors?.[name] ? " is-shown" : "")} id={`w-${name}-err`} role="alert">
        <AlertIcon /><span>{state.errors?.[name]}</span>
      </p>
    </div>
  );

  return (
    <form action={action} noValidate>
      <Field name="business" label="Business name" required type="text" autoComplete="organization" placeholder="Maple & Rye" />
      <Field name="contact" label="Your name" required type="text" autoComplete="name" placeholder="Dana Walsh" />
      <Field name="email" label="Billing email" required type="email" inputMode="email" autoComplete="email" placeholder="dana@mapleandrye.ca" help="Invoices and receipts go here." />
      <Field name="domain" label="Your website" type="text" inputMode="url" placeholder="mapleandrye.ca" help="Leave it empty if you do not have one yet." />

      <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: "var(--space-4)" }}>
        <legend className="lbl" style={{ padding: 0, marginBottom: "var(--space-3)" }}>Billing address</legend>
        <Field name="line1" label="Street address" required type="text" autoComplete="address-line1" placeholder="12 Water Street" />
        <Field name="line2" label="Unit or suite" type="text" autoComplete="address-line2" placeholder="Suite 3" />
        <div className="formgrid two">
          <Field name="city" label="City or town" required type="text" autoComplete="address-level2" placeholder="St. John's" />
          <div className="od-field" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
            <label className="lbl" htmlFor="w-province">Province</label>
            <select id="w-province" name="province" defaultValue={val("province")} autoComplete="address-level1">
              <option value="">Not in Canada</option>
              {PROVINCES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
          </div>
        </div>
        <div className="formgrid two">
          <Field name="postal" label="Postal code" required type="text" autoComplete="postal-code" placeholder="A1C 1A1" />
          <div className="od-field" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
            <label className="lbl" htmlFor="w-country">Country</label>
            <select id="w-country" name="country" defaultValue={val("country")} autoComplete="country">
              <option value="CA">Canada</option>
              <option value="US">United States</option>
            </select>
          </div>
        </div>
      </fieldset>

      {state.status === "error" && (
        <p className="err is-shown" role="alert">
          <AlertIcon /><span>We could not save that just now. Nothing was charged. Try again, and if it keeps happening, email hello@solenix.dev.</span>
        </p>
      )}

      <SubmitButton busy="Saving…">Open my portal</SubmitButton>
    </form>
  );
}
