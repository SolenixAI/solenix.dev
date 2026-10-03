"use server";

import { redirect } from "next/navigation";
import { getViewer } from "@/lib/portal";
import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { cleanDomain } from "@/lib/format";

export type WelcomeState = {
  status: "idle" | "invalid" | "error";
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FIELDS = ["business", "contact", "email", "domain", "line1", "line2", "city", "province", "postal", "country"] as const;

export async function completeWelcome(_prev: WelcomeState, form: FormData): Promise<WelcomeState> {
  const { client, profile } = await getViewer();
  if (!client) redirect("/app");

  const v = Object.fromEntries(FIELDS.map((f) => [f, String(form.get(f) ?? "").trim()])) as Record<(typeof FIELDS)[number], string>;
  v.domain = cleanDomain(v.domain);
  v.postal = v.postal.toUpperCase();

  const errors: Record<string, string> = {};
  if (!v.business) errors.business = "Enter your business name as you would write it on an invoice.";
  if (!v.contact) errors.contact = "Enter the name of the person we should talk to.";
  if (!EMAIL.test(v.email)) errors.email = "That does not look like an email address. Check for a missing @ or a typo in the domain.";
  if (!v.line1) errors.line1 = "Enter the street address. Stripe uses it to work out the right tax.";
  if (!v.city) errors.city = "Enter the city or town.";
  if (!v.postal) errors.postal = "Enter the postal code.";
  if (!/^[A-Z]{2}$/.test(v.country)) errors.country = "Choose a country.";
  if (Object.keys(errors).length) return { status: "invalid", errors, values: v };

  const details = {
    name: v.business,
    email: v.email,
    address: { line1: v.line1, line2: v.line2 || undefined, city: v.city, state: v.province || undefined, postal_code: v.postal, country: v.country },
    metadata: { client_id: client.id, contact_name: v.contact, site_domain: v.domain },
  };

  try {
    const stripe = getStripe();
    let customerId = client.stripe_customer_id;
    if (customerId) {
      // Re-submitting updates the same customer. It never makes a second one.
      await stripe.customers.update(customerId, details);
    } else {
      const customer = await stripe.customers.create(
        { ...details, preferred_locales: ["en-CA"] },
        { idempotencyKey: `solenix-client-${client.id}` },
      );
      customerId = customer.id;
    }

    // Service role: the client row is not writable through the API, by design.
    const { error } = await createAdminClient()
      .from("clients")
      .update({
        business_name: v.business,
        contact_name: v.contact,
        billing_email: v.email,
        site_domain: v.domain || client.site_domain,
        stripe_customer_id: customerId,
        status: "active",
        onboarded_at: client.onboarded_at ?? new Date().toISOString(),
      })
      .eq("id", client.id);
    if (error) throw new Error(error.message);

    // Their website is a service; its live status and visitors are read, not stored.
    const domain = v.domain || client.site_domain;
    if (domain) {
      const db = createAdminClient();
      const { count } = await db.from("services").select("id", { count: "exact", head: true }).eq("client_id", client.id).eq("site_domain", domain);
      if (!count) {
        await db.from("services").insert({
          client_id: client.id, name: domain, kind: "Website and domain", vendor: "Vercel",
          site_domain: domain, vercel_project: client.vercel_project, seats: [v.contact.split(" ")[0]],
        });
      }
    }
  } catch (e) {
    console.error("welcome", profile.id, (e as Error).message);
    return { status: "error", values: v };
  }

  redirect("/app");
}
