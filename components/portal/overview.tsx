import type { Client } from "@/lib/portal";
import { getSiteStatus, getVisitors, type SiteState } from "@/lib/site-status";
import { ago, count, today } from "@/lib/format";
import { ChartIcon, Chevron, VercelIcon } from "./icons";
import { Spark, TrendChip, direction } from "./spark";

const STATE: Record<SiteState, { cls: string; word: string }> = {
  live: { cls: "ok", word: "Live" },
  building: { cls: "warn", word: "Building" },
  down: { cls: "down", word: "Down" },
  none: { cls: "quiet", word: "Not live yet" },
};

/** The site overview: is it up, when did it last change, who is visiting. */
export async function SiteOverview({ client, billingHref }: { client: Client; billingHref?: string }) {
  const [status, visitors] = await Promise.all([
    getSiteStatus(client.site_domain, client.vercel_project),
    getVisitors(client.site_domain),
  ]);
  const st = STATE[status.state];
  const domain = client.site_domain;

  const head =
    status.state === "down" ? "Your site is down"
    : status.state === "none" ? "No website yet"
    : status.state === "building" ? "Your site is live, and an update is on its way"
    : "Your site is live";
  const note =
    status.state === "down"
      ? `${domain} did not answer when we checked just now. We get the same alert and are on it — you will hear from us when it is back.`
    : status.state === "none"
      ? "When your website goes live, this shows whether it is up and how many people visit."
    : `${domain} answered when we checked, ${ago(status.checkedAt)}.`;

  return (
    <>
      <div className="page-head">
        <p className="eyebrow">{today()}</p>
        <h1 id="h-overview">{client.business_name}</h1>
        <p className="muted">Your website, in plain words: whether it is up, when it last changed, and who is visiting.</p>
        <div className="od-cluster" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
          <span className="vendor"><VercelIcon />Hosted on Vercel</span>
          <span className="vendor"><ChartIcon />Analytics by PostHog</span>
        </div>
      </div>

      <div className="hero">
        <div className="hero-sky" aria-hidden="true"><div className="hero-light"></div></div>
        <div className="hero-grid" aria-hidden="true"></div>
        <div className="hero-top">
          <span className="od-stat" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
            <span className="eyebrow">{status.state === "down" ? "Needs attention" : "Status"}</span>
            <span style={{ font: "var(--fw-bold) var(--fs-h2)/1.15 var(--font-display)", letterSpacing: "var(--track-heading)" }}>{head}</span>
            <span className="sm muted">{note}</span>
          </span>
          <span className={`badge ${st.cls} od-fixed`}>{st.word}</span>
        </div>

        {domain && (
          <div className="hero-split">
            <div className="deploy">
              <span className="eyebrow">Last updated</span>
              {status.deploy ? (
                <>
                  <span className="deploy-msg">{status.deploy.message ?? "A new version went live."}</span>
                  <span className="deploy-when">{ago(status.deploy.createdAt)}</span>
                </>
              ) : (
                <span className="deploy-msg muted">
                  {status.problems.length ? "We could not reach Vercel just now. The status above is still current." : "No updates recorded yet."}
                </span>
              )}
              <span className="deploy-links">
                <a className="extlink" href={`https://${domain}`} rel="noopener">Open {domain}</a>
              </span>
            </div>
            <Visitors result={visitors} />
          </div>
        )}
      </div>

      {billingHref && (
        <div className="doors">
          <a className="door" href={billingHref}>
            <span className="od-fill od-stat" style={{ ["--od-gap" as string]: "2px" }}>
              <span className="dtitle">Billing</span>
              <span className="dsum">Your invoices, and a button to pay each one.</span>
            </span>
            <Chevron className="chev" />
          </a>
        </div>
      )}
    </>
  );
}

function Visitors({ result }: { result: Awaited<ReturnType<typeof getVisitors>> }) {
  if (result.kind !== "ok") {
    return (
      <div className="od-stat" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
        <span className="eyebrow">Visitors · 30 days</span>
        <span className="sm muted">
          {result.kind === "not-connected"
            ? "Visitor numbers appear here once analytics is connected."
            : "We could not load visitor numbers just now. Refresh in a minute."}
        </span>
      </div>
    );
  }
  const v = result.visitors;
  if (v.total === 0 && v.previous === 0) {
    return (
      <div className="od-stat" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
        <span className="eyebrow">Visitors · 30 days</span>
        <span className="stat-v od-nowrap">0<span className="unit"> visitors</span></span>
        <span className="sm muted">No visits recorded yet. Counting starts from the day analytics went on.</span>
      </div>
    );
  }
  const delta = direction(v.total, v.previous);
  const dir = delta > 0 ? "rising" : delta < 0 ? "falling" : "steady";
  return (
    <div className="od-stat" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
      <span className="eyebrow">Visitors · 30 days</span>
      <span className="stat-v od-nowrap">{count(v.total)}<span className="unit"> {v.total === 1 ? "visitor" : "visitors"}</span></span>
      <span><TrendChip delta={delta} hasPrevious={v.previous > 0} /></span>
      <Spark series={v.series} label={`Visitors each day over the last 30 days: ${dir}. ${count(v.total)} in total.`} />
      <span className="sparkaxis" aria-hidden="true"><span>30 days ago</span><span>Today</span></span>
    </div>
  );
}
