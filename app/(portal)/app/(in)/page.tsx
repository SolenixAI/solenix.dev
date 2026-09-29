import type { Metadata } from "next";
import { SiteOverview } from "@/components/portal/overview";
import { getViewer } from "@/lib/portal";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

export default async function Overview() {
  const { client, isAdmin } = await getViewer();
  if (!client) return null; // the layout already explained this

  return (
    <section className="screen" aria-labelledby="h-overview">
      <SiteOverview client={client} billingHref={isAdmin ? undefined : "/app/billing"} />
    </section>
  );
}
