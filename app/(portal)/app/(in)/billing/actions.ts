"use server";

import { redirect } from "next/navigation";
import { getViewer } from "@/lib/portal";
import { getStripe } from "@/lib/stripe";
import { requestOrigin } from "@/lib/origin";

/** Opens Stripe's customer portal for the signed-in client — never for anyone else. */
export async function openCustomerPortal() {
  const { client } = await getViewer();
  if (!client?.stripe_customer_id) redirect("/app/billing");
  const origin = await requestOrigin();
  const session = await getStripe().billingPortal.sessions.create({
    customer: client.stripe_customer_id,
    return_url: `${origin}/app/billing`,
  });
  redirect(session.url);
}
