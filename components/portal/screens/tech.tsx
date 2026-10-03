import type { Client } from "@/lib/portal"
import { listServices } from "@/lib/portal"
import { posthogWebAnalyticsUrl, resolveServices, type LiveService } from "@/lib/live"
import { money } from "@/lib/stripe"
import { ago, count } from "@/lib/format"
import { Spark, SparkAxis, Trend, percentChange } from "@/components/data/spark"
import { cn } from "@/lib/utils"
import { Empty, ExtLink, PageHead, StateBadge, VendorChip } from "../ui"

const AI_STATE = { hub: "This is your AI", connected: "Connected to your AI", can: "Can connect to your AI" } as const

/** Your tech: every account and service we run, what it costs, when it renews, who can get in. */
export async function TechScreen({ client, base }: { client: Client; base: string }) {
  const services = await resolveServices(await listServices(client.id))
  const total = services.reduce((t, s) => t + s.monthly_cents, 0)
  const wired = services.filter((s) => s.ai === "connected").length
  const could = services.filter((s) => s.ai === "can").length
  const analytics = posthogWebAnalyticsUrl()

  return (
    <section aria-labelledby="h-tech">
      <PageHead
        eyebrow="Your tech"
        title="Every account and service we run for you"
        id="h-tech"
        lede={
          <>
            One list instead of a dozen logins: your AI workspace, email, domain, website, store and local listing. What
            each one costs, when it renews, who on your team can get in — and which of them your AI is connected to.
            Where a line says <em>can connect</em>, that is something we have spotted and not done yet. The real controls
            stay in each vendor&apos;s own admin; we just make them findable.
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <VendorChip vendor="vercel">Hosted on Vercel</VendorChip>
          <VendorChip vendor="posthog">Analytics by PostHog</VendorChip>
        </div>
      </PageHead>

      {services.length === 0 ? (
        <Empty
          title="Nothing hosted yet"
          action={<a className="text-sm font-semibold text-ember-text" href={`${base}/projects`}>See the project instead</a>}
        >
          As we set up each account — your AI workspace, email, domain, website, store or local listing — it appears here
          with what it costs, when it renews, who can get in, and whether your AI is connected to it.
        </Empty>
      ) : (
        <>
          <div className="grid gap-4">
            {services.map((s) => <Item key={s.id} s={s} analytics={analytics} />)}
          </div>
          {total > 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              <strong className="text-foreground">{money(total)} a month</strong> across {services.length}{" "}
              {services.length === 1 ? "account" : "accounts"}, billed by each vendor to you — not through us. Our care plan
              is separate and on <a className="font-semibold text-ember-text" href={`${base}/billing`}>Billing</a>.
              {wired > 0 && could > 0 && ` ${wired} ${wired === 1 ? "is" : "are"} connected to your AI, and ${could} more could be — marked above.`}
              {wired > 0 && could === 0 && ` ${wired} ${wired === 1 ? "is" : "are"} connected to your AI.`}
              {wired === 0 && could > 0 && ` None of them are connected to your AI yet. ${could} could be — marked above.`}
            </p>
          )}
        </>
      )}
    </section>
  )
}

function Item({ s, analytics }: { s: LiveService; analytics: string | null }) {
  const v = s.visitors?.kind === "ok" ? s.visitors.visitors : null
  const deploy = s.site?.deploy
  const latest = deploy?.message ?? s.note
  const when = deploy ? `Deployed ${ago(deploy.createdAt)}` : s.site ? `Checked ${ago(s.site.checkedAt)}` : null

  return (
    <article className="grid gap-4 rounded-xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <span className="grid gap-0.5">
          <span className="font-mono text-2xs tracking-label text-muted-foreground uppercase">{s.kind} · {s.vendor}</span>
          <span className="font-semibold [overflow-wrap:anywhere]">{s.name}</span>
        </span>
        <StateBadge state={s.live} className="shrink-0" />
      </div>

      {s.ai && (
        <p className="grid grid-cols-[8px_minmax(0,1fr)] items-start gap-3 text-sm text-muted-foreground">
          <span
            aria-hidden="true"
            className={cn("mt-[0.45em] size-2 rounded-full", s.ai === "can" ? "shadow-[inset_0_0_0_1.5px_var(--accent)]" : "bg-ok")}
          />
          <span>
            <strong className="font-semibold text-foreground">{AI_STATE[s.ai]}</strong>
            {s.ai_note && <> — {s.ai_note}</>}
          </span>
        </p>
      )}

      <dl className="grid gap-3 border-y border-line py-4 sm:grid-cols-3 sm:gap-4">
        <div className="grid min-w-0 gap-0.5">
          <dt className="font-mono text-2xs font-semibold tracking-label text-muted-foreground uppercase">Costs you</dt>
          <dd className="font-mono text-sm whitespace-nowrap tabular-nums">
            {s.monthly_cents > 0 ? <>{money(s.monthly_cents)} <span className="text-2xs text-muted-foreground">/mo</span></> : "No charge"}
          </dd>
        </div>
        <div className="grid min-w-0 gap-0.5">
          <dt className="font-mono text-2xs font-semibold tracking-label text-muted-foreground uppercase">Renews</dt>
          <dd className="text-sm [overflow-wrap:anywhere]">{s.renews ?? "—"}</dd>
        </div>
        <div className="grid min-w-0 gap-0.5">
          <dt className="font-mono text-2xs font-semibold tracking-label text-muted-foreground uppercase">Who has access</dt>
          <dd className="text-sm [overflow-wrap:anywhere]">{s.seats.length ? s.seats.join(", ") : "—"}</dd>
        </div>
      </dl>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_13rem] md:items-end">
        <div className="grid gap-2 rounded-lg border border-line bg-sunken p-4">
          <span className="eyebrow eyebrow-quiet">Latest</span>
          {latest && <span className="text-sm [overflow-wrap:anywhere]">{latest}</span>}
          {when && <span className="font-mono text-2xs text-muted-foreground">{when}</span>}
          {s.admin_url && (
            <span className="mt-1 flex flex-wrap gap-x-4 gap-y-2">
              <ExtLink href={s.admin_url}>Opens {s.vendor}</ExtLink>
            </span>
          )}
        </div>

        {s.site_domain && (
          <div className="grid gap-2">
            <span className="eyebrow eyebrow-quiet">Visitors · 30 days</span>
            {v ? (
              <>
                <span className="font-display text-stat leading-[1.05] font-bold tracking-stat whitespace-nowrap tabular-nums">
                  {count(v.total)}
                  <span className="ml-1 text-[0.46em] font-semibold text-muted-foreground">{v.total === 1 ? "visit" : "visits"}</span>
                </span>
                <span><Trend delta={percentChange(v.total, v.previous)} sentiment="good" hasPrevious={v.previous > 0} /></span>
                {v.total > 0 && (
                  <>
                    <Spark series={v.series} label={`Visitors each day over the last 30 days. ${count(v.total)} in total.`} />
                    <SparkAxis />
                  </>
                )}
                {analytics && <span><ExtLink href={analytics} icon="chart">View full analytics</ExtLink></span>}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                {s.visitors?.kind === "not-connected" ? "Visitor numbers appear here once analytics is connected." : "We could not load visitor numbers just now."}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
