import type { Metadata } from "next"
import { listClients, listProjects, listServices, requireAdmin, type Client } from "@/lib/portal"
import { resolveServices } from "@/lib/live"
import { billingSummary, money } from "@/lib/stripe"
import { STAGES } from "@/components/data/timeline"
import { PageHead } from "@/components/portal/ui"
import { ClientList, type ClientRow } from "./list"
import { InviteButton } from "./invite"

export const metadata: Metadata = { title: "Clients" }

/** One row's facts, read live: the site from Vercel/PostHog, the project from Supabase, money from Stripe. */
async function toRow(c: Client): Promise<ClientRow> {
  const [services, projects, bill] = await Promise.all([
    listServices(c.id).then(resolveServices),
    listProjects(c.id),
    billingSummary(c.stripe_customer_id),
  ])
  const site = services.find((s) => s.site_domain)
  const project = projects.find((p) => p.stage < 4) ?? projects[0]
  const visitors = site?.visitors?.kind === "ok" ? site.visitors.visitors : null

  return {
    id: c.id,
    business: c.business_name,
    owner: c.contact_name ?? c.contact_email,
    invited: c.status === "invited",
    site: site ? site.live : services.length ? (services.some((s) => s.live === "down") ? "down" : "live") : "none",
    stage: project ? `${STAGES[project.stage - 1]} · step ${project.stage} of 4` : null,
    invoice:
      bill.kind !== "ok"
        ? { v: "quiet", word: c.stripe_customer_id ? "No invoices" : "Not set up" }
        : bill.owed > 0
          ? { v: "warn", word: `Due ${money(bill.owed, bill.currency)}` }
          : { v: "ok", word: "Paid up" },
    visitors: visitors && visitors.total > 0 ? { total: visitors.total, series: visitors.series } : null,
    hasSite: Boolean(site),
  }
}

export default async function Clients() {
  await requireAdmin()
  const clients = await listClients()
  const rows = await Promise.all(clients.map(toRow))
  const down = rows.filter((r) => r.site === "down").length
  const waiting = rows.filter((r) => r.invoice.v === "warn").length

  return (
    <section aria-labelledby="h-clients">
      <PageHead
        eyebrow="Your clients"
        title="Clients"
        id="h-clients"
        lede={
          `${rows.length === 1 ? "One business" : `${rows.length} businesses`}. ` +
          (down ? (down === 1 ? "One site is down" : `${down} sites are down`) : "Every site is working") +
          (waiting ? ` and ${waiting === 1 ? "one client has an invoice waiting" : `${waiting} clients have invoices waiting`}.` : ".")
        }
      />
      <ClientList rows={rows} invite={<InviteButton />} />
      <p className="mt-6 text-sm text-faint">Opening a client shows you exactly what they see when they sign in.</p>
    </section>
  )
}
