import type { Client } from "@/lib/portal";
import { configured } from "@/lib/env";
import { getPlan, listInvoices, money, type InvoiceRow } from "@/lib/stripe";
import { day } from "@/lib/format";
import { openCustomerPortal } from "@/app/(portal)/app/(in)/billing/actions";
import { CardIcon, OutIcon } from "./icons";

const INV_STATE: Record<InvoiceRow["status"], { cls: string; word: string }> = {
  paid: { cls: "ok", word: "Paid" },
  due: { cls: "warn", word: "Due" },
  overdue: { cls: "down", word: "Overdue" },
  void: { cls: "quiet", word: "Cancelled" },
  uncollectible: { cls: "quiet", word: "Written off" },
};

const when = (i: InvoiceRow) =>
  i.status === "paid" ? "Paid " + day((i.paidAt ?? i.created) * 1000)
  : i.status === "overdue" ? "Overdue since " + day((i.dueDate ?? i.created) * 1000)
  : i.status === "due" ? (i.dueDate ? "Due " + day(i.dueDate * 1000) : "Due now")
  : "Sent " + day(i.created * 1000);

const label = (i: InvoiceRow) => (i.number ? `Invoice ${i.number}` : "Invoice");

/** Billing: the calm surface over Stripe. Read live on every visit. */
export async function Billing({ client, asAdmin = false }: { client: Client; asAdmin?: boolean }) {
  if (!configured.stripe() || !client.stripe_customer_id) {
    return (
      <>
        <BillingHead />
        <div className="empty">
          <h3>No invoices yet</h3>
          <p>
            {client.stripe_customer_id || !asAdmin
              ? "Your first invoice appears here when we send it, with a button to pay it."
              : "This client has not finished setting up yet, so there is no billing account for them."}
          </p>
        </div>
      </>
    );
  }

  let invoices: InvoiceRow[] = [];
  let plan: Awaited<ReturnType<typeof getPlan>> = null;
  let failed = false;
  try {
    [invoices, plan] = await Promise.all([listInvoices(client.stripe_customer_id), getPlan(client.stripe_customer_id)]);
  } catch (e) {
    console.error("billing", (e as Error).message);
    failed = true;
  }

  if (failed) {
    return (
      <>
        <BillingHead />
        <div className="empty">
          <h3>We could not load your invoices</h3>
          <p>Stripe did not answer just now. Refresh in a minute. Nothing about your account has changed.</p>
        </div>
      </>
    );
  }

  const open = invoices
    .filter((i) => i.status === "due" || i.status === "overdue")
    .sort((a, b) => (a.status === "overdue" ? -1 : 0) - (b.status === "overdue" ? -1 : 0));
  const owed = open.reduce((t, i) => t + i.total, 0);
  const currency = invoices[0]?.currency ?? "cad";
  const first = open[0];

  return (
    <>
      <BillingHead />

      <div className="hero">
        <div className="hero-sky" aria-hidden="true"><div className="hero-light"></div></div>
        <div className="hero-grid" aria-hidden="true"></div>
        {first ? (
          <>
            <div className="od-row" style={{ ["--od-gap" as string]: "var(--space-5)", flexWrap: "wrap", alignItems: "flex-end" }}>
              <span className="od-fill od-stat" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
                <span className="eyebrow">{open.length > 1 ? `${open.length} invoices open` : "One invoice open"}</span>
                <span className="owe-amt">{money(owed, currency)}</span>
                <span className="sm muted">{label(first)} · {when(first).toLowerCase()}. {first.title}.</span>
              </span>
              {first.payUrl && (
                <span className="od-cluster od-fixed" style={{ ["--od-gap" as string]: "var(--space-3)" }}>
                  <a className="btn btn-primary" href={first.payUrl} rel="noopener">Pay {money(first.total, first.currency)}</a>
                </span>
              )}
            </div>
            <p className="xs muted" style={{ marginTop: "var(--space-4)" }}>Pay opens Stripe&apos;s own invoice page. Solenix never sees or stores your card.</p>
          </>
        ) : (
          <div className="od-stat" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
            <span className="eyebrow">Nothing to pay</span>
            <span className="owe-amt">{money(0, currency)}</span>
            <span className="sm muted">
              {invoices.length ? "Every invoice is paid. Stripe emails the receipt each time." : "No invoices yet. The first one follows your written plan, never before it."}
            </span>
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-head"><h2>Hosting and care</h2></div>
        <div className="card card-lg plan">
          <span className="od-stat" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
            <span className="eyebrow">Your plan</span>
            <span style={{ fontWeight: "var(--fw-semibold)" }}>{plan ? plan.name : "No hosting plan yet"}</span>
            <span className="sm muted">
              {plan
                ? `Since ${day(plan.since * 1000)} · cancel whenever you like, and you keep everything.`
                : "A plan starts when your site goes live, and covers hosting, updates, backups and small changes."}
            </span>
            {!asAdmin && (
              <form action={openCustomerPortal}>
                <button className="extlink" type="submit" style={{ background: "none", border: 0, padding: 0, cursor: "pointer", minHeight: "var(--tap-min)" }}>
                  <OutIcon />
                  Manage billing: cards, receipts and cancelling
                </button>
              </form>
            )}
          </span>
          {plan && (
            <span className="od-fixed od-stat" style={{ ["--od-gap" as string]: "2px", textAlign: "right" }}>
              <span className="plan-amt">{money(plan.amount, plan.currency)}</span>
              <span className="xs muted">per {plan.interval}</span>
            </span>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-head"><h2>All invoices</h2></div>
        <ul className="rows">
          {invoices.length === 0 ? (
            <li className="row">
              <span className="od-fill od-stat" style={{ ["--od-gap" as string]: "var(--space-1)" }}>
                <span className="v">No invoices yet</span>
                <span className="k">The first one arrives after we agree a plan on your first call.</span>
              </span>
            </li>
          ) : (
            invoices.map((i) => {
              const st = INV_STATE[i.status];
              const body = (
                <>
                  <span className="od-fill od-stat" style={{ ["--od-gap" as string]: "var(--space-1)" }}>
                    <span className="v od-truncate">{label(i)}</span>
                    <span className="k od-truncate">{i.title}</span>
                  </span>
                  <span className="od-fixed od-stat" style={{ ["--od-gap" as string]: "var(--space-1)", textAlign: "right" }}>
                    <span className="v mono od-nowrap">{money(i.total, i.currency)}</span>
                    <span className="xs faint mono od-nowrap">
                      {when(i)}{i.tax > 0 ? ` · incl. ${money(i.tax, i.currency)} tax` : ""}
                    </span>
                  </span>
                  <span className={`badge ${st.cls} od-fixed`}>{st.word}</span>
                </>
              );
              return (
                <li key={i.id}>
                  {i.payUrl ? (
                    <a className="row" href={i.payUrl} rel="noopener" aria-label={`${label(i)}, ${st.word}, ${money(i.total, i.currency)}. Opens on Stripe.`}>
                      {body}
                      <OutIconRow />
                    </a>
                  ) : (
                    <div className="row">{body}</div>
                  )}
                </li>
              );
            })
          )}
        </ul>
        <p className="sm muted" style={{ marginTop: "var(--space-3)" }}>
          {open.length === 0
            ? invoices.length ? "Nothing due. Everything is paid — thank you." : "Nothing invoiced yet."
            : `${open.length === 1 ? "One invoice is waiting" : `${open.length} invoices are waiting`}, ${money(owed, currency)} in total.`}
        </p>
      </div>
    </>
  );
}

function OutIconRow() {
  return <span className="row-chev" aria-hidden="true"><OutIcon /></span>;
}

function BillingHead() {
  return (
    <div className="page-head">
      <p className="eyebrow">Billing</p>
      <h1 id="h-billing">Your invoices</h1>
      <p className="muted">Every bill from us in one place. Payments, receipts and card details are handled by Stripe — we never store your card.</p>
      <div className="od-cluster" style={{ ["--od-gap" as string]: "var(--space-2)" }}>
        <span className="vendor"><CardIcon />Payments by Stripe</span>
      </div>
    </div>
  );
}
