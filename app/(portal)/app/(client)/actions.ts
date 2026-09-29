"use server"

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
