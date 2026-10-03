"use server"

import type Stripe from "stripe"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getViewer } from "@/lib/portal"
import { createAdminClient } from "@/lib/supabase/server"
import { getStripe } from "@/lib/stripe"
import { requestOrigin } from "@/lib/origin"

/** The client approves something waiting on them. Only their own asks, only while waiting. */
export async function answerAsk(form: FormData) {
  const { client, profile } = await getViewer()
  const id = String(form.get("id") ?? "")
  if (!client || !/^[0-9a-f-]{36}$/i.test(id)) return

  const db = createAdminClient()
  const { data: ask } = await db.from("project_asks").select("id, status, projects!inner(client_id)").eq("id", id).single()
  const owner = (ask?.projects as unknown as { client_id: string } | null)?.client_id
  if (!ask || owner !== client.id || ask.status !== "waiting") return

  await db
    .from("project_asks")
    .update({ status: "approved", answered_at: new Date().toISOString(), answered_by: profile.id })
    .eq("id", id)
  revalidatePath("/app", "layout")
}

/** Opens Stripe's customer portal for the signed-in client — never for anyone else. */
export async function openCustomerPortal() {
  const { client } = await getViewer()
  if (!client?.stripe_customer_id) redirect("/app/billing")
  const origin = await requestOrigin()
  const session = await getStripe().billingPortal.sessions.create({
    customer: client.stripe_customer_id,
    return_url: `${origin}/app/billing`,
  })
  redirect(session.url)
}

/**
 * Start the client's plan: one Stripe Checkout page that takes the setup fee
 * and starts the monthly subscription together. Stripe hosts the page; the
 * resulting subscription is read back live, so nothing is stored here.
 */
export async function startPlan() {
  const { client } = await getViewer()
  if (!client?.stripe_customer_id || !client.monthly_cents) redirect("/app/billing")
  const origin = await requestOrigin()
  const name = client.plan_name || "Website hosting and care"
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      quantity: 1,
      price_data: { currency: "cad", unit_amount: client.monthly_cents, recurring: { interval: "month" }, product_data: { name } },
    },
  ]
  if (client.setup_cents) {
    line_items.push({
      quantity: 1,
      price_data: { currency: "cad", unit_amount: client.setup_cents, product_data: { name: "Website build and setup" } },
    })
  }
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: client.stripe_customer_id,
    line_items,
    success_url: `${origin}/app?plan=started`,
    cancel_url: `${origin}/app/billing`,
    metadata: { client_id: client.id },
    subscription_data: { metadata: { client_id: client.id } },
  })
  if (!session.url) redirect("/app/billing")
  redirect(session.url)
}
