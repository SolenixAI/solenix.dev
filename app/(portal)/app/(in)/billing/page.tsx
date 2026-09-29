import type { Metadata } from "next";
import { Billing } from "@/components/portal/billing";
import { getViewer } from "@/lib/portal";

export const metadata: Metadata = { title: "Billing" };
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { client } = await getViewer();
  if (!client) return null;

  return (
    <section className="screen" aria-labelledby="h-billing">
      <Billing client={client} />
    </section>
  );
}
