import type { Metadata } from "next";
import { Chevron } from "@/components/portal/icons";
import { RowSpark } from "@/components/portal/spark";
import { listClients, requireAdmin, type Client } from "@/lib/portal";
import { getSiteStatus, getVisitors, type SiteState } from "@/lib/site-status";
import { count } from "@/lib/format";
import { InviteButton } from "./invite";

export const metadata: Metadata = { title: "Clients" };
export const dynamic = "force-dynamic";

const SITE: Record<SiteState, { cls: string; word: string }> = {
  live: { cls: "ok", word: "Live" },
  building: { cls: "warn", word: "Building" },
  down: { cls: "down", word: "Down" },
  none: { cls: "quiet", word: "Not live yet" },
};

async function Row({ c }: { c: Client }) {
  const [status, visitors] = await Promise.all([
    getSiteStatus(c.site_domain, c.vercel_project),
    getVisitors(c.site_domain),
  ]);
  const site = SITE[status.state];
  const v = visitors.kind === "ok" ? visitors.visitors : null;

  return (
    <li>
      <a className="row clientrow" href={`/app/admin/clients/${c.id}`}>
        <span className="cr-main">
          <span className="cr-name od-truncate">{c.business_name}</span>
          <span className="cr-meta">
            <span className={`badge ${site.cls}`}>{site.word}</span>
            {c.status === "invited" ? (
              <span className="badge warn">Invited</span>
            ) : (
              <span className="badge quiet">Set up</span>
            )}
            {c.site_domain && <span className="badge quiet">{c.site_domain}</span>}
          </span>
        </span>
        {v && v.total > 0 ? (
          <RowSpark series={v.series} label={`${count(v.total)} visitors in the last 30 days.`} />
        ) : (
          <span className="rowspark-none od-fixed">{c.site_domain ? "no visits yet" : "no site"}</span>
        )}
        <Chevron />
      </a>
    </li>
  );
}

export default async function Clients() {
  await requireAdmin();
  const clients = await listClients();
  const waiting = clients.filter((c) => c.status === "invited").length;

  return (
    <section className="screen" aria-labelledby="h-clients">
      <div className="page-head">
        <p className="eyebrow">Your clients</p>
        <h1 id="h-clients">Clients</h1>
        <p className="muted">
          {clients.length === 1 ? "One business" : `${clients.length} businesses`}
          {waiting ? `, ${waiting === 1 ? "one has" : `${waiting} have`} not accepted their invite yet.` : "."}
        </p>
      </div>

      <div className="od-row" style={{ ["--od-gap" as string]: "var(--space-4)", flexWrap: "wrap", marginBottom: "var(--space-5)", justifyContent: "flex-end" }}>
        <InviteButton />
      </div>

      {clients.length ? (
        <ul className="rows">
          {clients.map((c) => <Row key={c.id} c={c} />)}
        </ul>
      ) : (
        <div className="empty">
          <h3>No clients yet</h3>
          <p>Invite your first client. They get an email with a sign-in link, and appear here straight away.</p>
        </div>
      )}

      <p className="sm faint" style={{ marginTop: "var(--space-5)" }}>Opening a client shows you exactly what they see when they sign in.</p>
    </section>
  );
}
