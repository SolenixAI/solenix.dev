import "server-only";
import Stripe from "stripe";

let stripe: Stripe | null = null;

/** The Stripe client. Sandbox key until go-live (M5); the key lives in Vercel only. */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  stripe ??= new Stripe(key);
  return stripe;
}

export type InvoiceRow = {
  id: string;
  number: string | null;
  title: string;
  status: "paid" | "due" | "overdue" | "void" | "uncollectible";
  total: number;
  tax: number;
  currency: string;
  created: number;
  dueDate: number | null;
  paidAt: number | null;
  payUrl: string | null;
  pdf: string | null;
};

export function toRow(inv: Stripe.Invoice): InvoiceRow | null {
  if (inv.status === "draft") return null; // not sent yet — not the client's business
  const now = Date.now() / 1000;
  const status: InvoiceRow["status"] =
    inv.status === "paid" ? "paid"
    : inv.status === "void" ? "void"
    : inv.status === "uncollectible" ? "uncollectible"
    : inv.due_date && inv.due_date < now ? "overdue"
    : "due";
  const tax = (inv.total_taxes ?? []).reduce((t, x) => t + x.amount, 0);
  return {
    id: inv.id!,
    number: inv.number,
    title: inv.description || inv.lines.data[0]?.description || "Invoice",
    status,
    total: inv.total,
    tax,
    currency: inv.currency,
    created: inv.created,
    dueDate: inv.due_date,
    paidAt: inv.status_transitions?.paid_at ?? null,
    payUrl: inv.hosted_invoice_url ?? null,
    pdf: inv.invoice_pdf ?? null,
  };
}

/** Read live from Stripe on every visit: no webhook, no copy to keep in sync. */
export async function listInvoices(customerId: string) {
  const res = await getStripe().invoices.list({ customer: customerId, limit: 50 });
  return res.data.map(toRow).filter((x): x is InvoiceRow => x !== null);
}

export type PlanRow = { name: string; amount: number; currency: string; interval: string; since: number };

export async function getPlan(customerId: string): Promise<PlanRow | null> {
  const subs = await getStripe().subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
    expand: ["data.items.data.price.product"],
  });
  const sub = subs.data[0];
  const item = sub?.items.data[0];
  if (!sub || !item) return null;
  const product = item.price.product as Stripe.Product | string;
  return {
    name: typeof product === "string" ? "Website hosting" : product.name,
    amount: (item.price.unit_amount ?? 0) * (item.quantity ?? 1),
    currency: item.price.currency,
    interval: item.price.recurring?.interval ?? "month",
    since: sub.start_date,
  };
}

export const money = (cents: number, currency = "cad") =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

export type BillingSummary =
  | { kind: "none" }
  | { kind: "error" }
  | { kind: "ok"; owed: number; open: number; currency: string; plan: PlanRow | null }

/** What the Overview's Billing door says — from the same live list the Billing screen shows. */
export async function billingSummary(customerId: string | null): Promise<BillingSummary> {
  if (!customerId || !process.env.STRIPE_SECRET_KEY) return { kind: "none" }
  try {
    const [invoices, plan] = await Promise.all([listInvoices(customerId), getPlan(customerId)])
    const open = invoices.filter((i) => i.status === "due" || i.status === "overdue")
    return {
      kind: "ok",
      owed: open.reduce((t, i) => t + i.total, 0),
      open: open.length,
      currency: invoices[0]?.currency ?? "cad",
      plan,
    }
  } catch (e) {
    console.error("billing summary", (e as Error).message)
    return { kind: "error" }
  }
}

export type InvoiceLine = { description: string; detail: string | null; amount: number }
export type InvoiceDetail = InvoiceRow & {
  lines: InvoiceLine[]
  subtotal: number
  receiptEmail: string | null
  card: string | null
}

/**
 * One invoice, only if it belongs to `customerId`. The id comes from the URL,
 * so the ownership check is what stops one client reading another's invoice.
 */
export async function getInvoice(customerId: string, invoiceId: string): Promise<InvoiceDetail | null> {
  if (!/^in_[A-Za-z0-9]+$/.test(invoiceId)) return null
  const stripe = getStripe()
  let inv: Stripe.Invoice
  try {
    inv = await stripe.invoices.retrieve(invoiceId, { expand: ["payments.data.payment.payment_intent.payment_method"] })
  } catch {
    return null
  }
  const owner = typeof inv.customer === "string" ? inv.customer : inv.customer?.id
  if (owner !== customerId) return null
  const row = toRow(inv)
  if (!row) return null

  const lines = await stripe.invoices.listLineItems(invoiceId, { limit: 100 })
  const fmt = (s: number) => new Date(s * 1000).toLocaleDateString("en-CA", { day: "numeric", month: "short", year: "numeric" })
  const pay = inv.payments?.data?.[0]?.payment
  const pi = pay && typeof pay.payment_intent === "object" ? pay.payment_intent : null
  const pm = pi && typeof pi.payment_method === "object" ? pi.payment_method : null

  return {
    ...row,
    subtotal: inv.subtotal,
    receiptEmail: inv.customer_email ?? null,
    card: pm?.card ? `${pm.card.brand.replace(/^\w/, (c) => c.toUpperCase())} ending ${pm.card.last4}` : null,
    lines: lines.data.map((l) => ({
      description: l.description ?? "Item",
      detail: l.period && l.period.start !== l.period.end ? `${fmt(l.period.start)} to ${fmt(l.period.end)}` : null,
      amount: l.amount,
    })),
  }
}
