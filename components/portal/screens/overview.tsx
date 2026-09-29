import type { Client } from "@/lib/portal"
import { listProjects, listServices } from "@/lib/portal"
import { resolveServices } from "@/lib/live"
import { billingSummary } from "@/lib/stripe"
import { money } from "@/lib/stripe"
import { today } from "@/lib/format"
import { STAGES } from "@/components/data/timeline"
import { Door, ExtLink, HeroPanel, PageHead, Section, StateBadge, type SiteState } from "../ui"
import { AskCard } from "../asks"

/** Overview: one hero line that says the most important thing, then three quiet doors. */
export async function OverviewScreen({ client, base, canAnswer }: { client: Client; base: string; canAnswer: boolean }) {
  const [services, projects, bill] = await Promise.all([
    listServices(client.id).then(resolveServices),
    listProjects(client.id),
    billingSummary(client.stripe_customer_id),
  ])

  const down = services.filter((s) => s.live === "down")
  const building = services.filter((s) => s.live === "building")
  const current = projects.find((p) => p.stage < 4) ?? projects[0]
  const waiting = projects.flatMap((p) => p.asks.filter((a) => a.status === "waiting"))

  // Worst news first.
  let eyebrow = "Status"
  let head = "Everything is running"
  let note: string
  let state: SiteState = "live"
  let action: React.ReactNode = null
  if (down.length) {
    eyebrow = "Needs attention"
    head = `${down[0].name} is down`
    note = "We get the same alert and are on it. You will get an email the moment it is back."
    state = "down"
    if (down[0].admin_url) action = <ExtLink href={down[0].admin_url}>See what we are doing</ExtLink>
  } else if (!services.length) {
    eyebrow = "Not live yet"
    head = "Nothing set up yet"
    note = "As we set up each account it appears here, with what it costs and when it renews."
    state = "none"
  } else if (building.length) {
    note = `${building.length === 1 ? "One thing is" : `${building.length} things are`} still being set up. The rest checked out fine.`
    state = "building"
  } else {
    note = `${services.length === 1 ? "One account" : `${services.length} accounts`} checked and working. Nothing needs you.`
  }

  const monthly = services.reduce((t, s) => t + s.monthly_cents, 0)
  const onAi = services.filter((s) => s.ai === "connected" || s.ai === "hub").length

  return (
    <section aria-labelledby="h-overview">
      <PageHead eyebrow={today()} title={client.business_name} id="h-overview" lede="Everything we build, host and run for you — in one place, nothing to chase." />

      <HeroPanel>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <span className="grid gap-2">
            <span className="eyebrow eyebrow-quiet">{eyebrow}</span>
            <span className="font-display text-h2 leading-[1.15] font-bold tracking-heading">{head}</span>
            <span className="text-sm text-muted-foreground">{note}</span>
          </span>
          <StateBadge state={state} className="shrink-0" />
        </div>
        {action && <div className="mt-6 flex flex-wrap gap-3">{action}</div>}
      </HeroPanel>

      <div className="mt-6 grid gap-3">
        <Door
          href={`${base}/tech`}
          title="Your tech"
          summary={
            services.length
              ? [
                  services.length === 1 ? "1 account" : `${services.length} accounts`,
                  monthly > 0 ? `${money(monthly)} a month` : null,
                  onAi ? `${onAi} on your AI` : null,
                ].filter(Boolean).join(" · ")
              : "Nothing set up yet"
          }
        />
        <Door
          href={`${base}/projects`}
          title="Projects"
          summary={current ? `${current.title} — ${STAGES[current.stage - 1].toLowerCase()} stage` : "No work in progress"}
        />
        <Door
          href={`${base}/billing`}
          title="Billing"
          summary={
            bill.kind !== "ok"
              ? "Your invoices, and a button to pay each one"
              : bill.owed > 0
                ? `${money(bill.owed, bill.currency)} open`
                : bill.plan ? "Nothing to pay · plan active" : "Nothing to pay"
          }
        />
      </div>

      {waiting.length > 0 && (
        <Section title="Waiting on you">
          <div className="grid gap-3">
            {waiting.map((a) => <AskCard key={a.id} ask={a} canAnswer={canAnswer} />)}
          </div>
        </Section>
      )}
    </section>
  )
}
