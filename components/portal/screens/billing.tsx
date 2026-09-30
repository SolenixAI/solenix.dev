import { ArrowLeft, ArrowUpRight, Download } from "lucide-react"
import type { Client } from "@/lib/portal"
import { configured } from "@/lib/env"
import { getInvoice, getPlan, listInvoices, money, type InvoiceRow } from "@/lib/stripe"
import { day } from "@/lib/format"
import { openCustomerPortal, startPlan } from "@/app/(portal)/app/(client)/actions"
import { SubmitButton } from "../submit-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Empty, HeroPanel, PageHead, RowLink, RowStatic, Rows, Section, VendorChip } from "../ui"

const INV: Record<InvoiceRow["status"], { v: "ok" | "warn" | "down" | "quiet"; word: string }> = {
  paid: { v: "ok", word: "Paid" },
  due: { v: "warn", word: "Due" },
  overdue: { v: "down", word: "Overdue" },
  void: { v: "quiet", word: "Cancelled" },
  uncollectible: { v: "quiet", word: "Written off" },
}

const when = (i: InvoiceRow) =>
  i.status === "paid" ? `Paid ${day((i.paidAt ?? i.created) * 1000)}`
  : i.status === "overdue" ? `Overdue since ${day((i.dueDate ?? i.created) * 1000)}`
  : i.status === "due" ? (i.dueDate ? `Due ${day(i.dueDate * 1000)}` : "Due now")
  : `Sent ${day(i.created * 1000)}`

const label = (i: InvoiceRow) => (i.number ? `Invoice ${i.number}` : "Invoice")

function Head({ base }: { base: string }) {
  return (
    <PageHead
      eyebrow="Billing"
      title="One bill, not seven"
      id="h-billing"
      lede={
        <>
          Your care plan and every invoice in one place. What each vendor bills you directly is on{" "}
          <a className="font-semibold text-ember-text" href={`${base}/tech`}>Your tech</a>. Payments, receipts and card
          details are handled by Stripe — we never store your card.
        </>
      }
    >
      <div className="flex flex-wrap gap-2"><VendorChip vendor="stripe">Payments by Stripe</VendorChip></div>
    </PageHead>
  )
}

/** Billing: the calm surface over Stripe, read live on every visit. */
export async function BillingScreen({ client, base, asAdmin }: { client: Client; base: string; asAdmin: boolean }) {
  if (!configured.stripe() || !client.stripe_customer_id) {
    return (
      <section aria-labelledby="h-billing">
        <Head base={base} />
        <Empty title="No invoices yet">
          {asAdmin && !client.stripe_customer_id
            ? "This client has not finished setting up yet, so there is no billing account for them."
            : "Your first invoice appears here when we send it, with a button to pay it. The first one follows your written plan, never before it."}
        </Empty>
      </section>
    )
  }

  let invoices: InvoiceRow[]
  let plan: Awaited<ReturnType<typeof getPlan>>
  try {
    ;[invoices, plan] = await Promise.all([listInvoices(client.stripe_customer_id), getPlan(client.stripe_customer_id)])
  } catch (e) {
    console.error("billing", (e as Error).message)
    return (
      <section aria-labelledby="h-billing">
        <Head base={base} />
        <Empty title="We could not load your invoices">Stripe did not answer just now. Refresh in a minute. Nothing about your account has changed.</Empty>
      </section>
    )
  }

  const open = invoices
    .filter((i) => i.status === "due" || i.status === "overdue")
    .sort((a, b) => Number(b.status === "overdue") - Number(a.status === "overdue"))
  const owed = open.reduce((t, i) => t + i.total, 0)
  const currency = invoices[0]?.currency ?? "cad"
  const first = open[0]

  return (
    <section aria-labelledby="h-billing">
      <Head base={base} />

      <HeroPanel>
        {first ? (
          <>
            <div className="flex flex-wrap items-end gap-5">
              <span className="grid min-w-0 flex-1 gap-2">
                <span className="eyebrow eyebrow-quiet">{open.length > 1 ? `${open.length} invoices open` : "One invoice open"}</span>
                <span className="font-display text-[clamp(1.5rem,4vw,2rem)] leading-[1.1] font-bold tracking-[-0.02em] whitespace-nowrap tabular-nums">{money(owed, currency)}</span>
                <span className="text-sm text-muted-foreground">{label(first)} · {when(first).toLowerCase()}. {first.title}.</span>
              </span>
              <span className="flex shrink-0 flex-wrap gap-3">
                {first.payUrl && (
                  <Button asChild>
                    <a href={first.payUrl} target="_blank" rel="noopener noreferrer">Pay {money(first.total, first.currency)}</a>
                  </Button>
                )}
                <Button asChild variant="ghost"><a href={`${base}/billing/${first.id}`}>See the detail</a></Button>
              </span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Pay opens Stripe&apos;s own invoice page. Solenix never sees or stores your card.</p>
          </>
        ) : (
          <div className="grid gap-2">
            <span className="eyebrow eyebrow-quiet">Nothing to pay</span>
            <span className="font-display text-[clamp(1.5rem,4vw,2rem)] leading-[1.1] font-bold tracking-[-0.02em] tabular-nums">{money(0, currency)}</span>
            <span className="text-sm text-muted-foreground">
              {invoices.length ? "Every invoice is paid. Stripe emails the receipt each time." : "No invoices yet. The first one follows your written plan, never before it."}
            </span>
          </div>
        )}
      </HeroPanel>

      <Section title="Hosting and care">
        <Card size="lg" className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <span className="grid gap-2">
            <span className="eyebrow eyebrow-quiet">Your plan</span>
            <span className="font-semibold">{plan ? plan.name : "No hosting plan yet"}</span>
            <span className="text-sm text-muted-foreground">
              {plan
                ? `Since ${day(plan.since * 1000)} · cancel whenever you like, and you keep everything.`
                : client.monthly_cents
                  ? `${client.plan_name || "Website hosting and care"}: ${client.setup_cents ? `${money(client.setup_cents)} to set up, then ` : ""}${money(client.monthly_cents)} a month. Hosting, updates, backups and small changes.`
                  : "A plan starts when your first site goes live, and covers hosting, updates, backups and small changes."}
            </span>
            {!plan && client.monthly_cents && !asAdmin ? (
              <form action={startPlan} className="mt-2">
                <SubmitButton busy="Opening Stripe…">Start my plan</SubmitButton>
              </form>
            ) : null}
            {!asAdmin && (
              <form action={openCustomerPortal}>
                <Button type="submit" variant="link" className="gap-1.5 text-sm">
                  <ArrowUpRight className="size-[13px]" />
                  Manage payment method and billing details
                </Button>
              </form>
            )}
          </span>
          {plan && (
            <span className="grid gap-0.5 sm:text-right">
              <span className="font-display text-[clamp(1.35rem,3.4vw,1.7rem)] leading-[1.1] font-bold tracking-[-0.02em] whitespace-nowrap tabular-nums">{money(plan.amount, plan.currency)}</span>
              <span className="text-xs text-muted-foreground">per {plan.interval}</span>
            </span>
          )}
        </Card>
      </Section>

      <Section title="All invoices">
        <Rows>
          {invoices.length === 0 ? (
            <li>
              <RowStatic>
                <span className="grid gap-1">
                  <span className="font-semibold">No invoices yet</span>
                  <span className="text-sm text-muted-foreground">The first one arrives after we agree a plan on your first call.</span>
                </span>
              </RowStatic>
            </li>
          ) : (
            invoices.map((i) => (
              <li key={i.id}>
                <RowLink href={`${base}/billing/${i.id}`}>
                  <span className="grid min-w-0 flex-1 gap-1">
                    <span className="truncate font-semibold">{label(i)}</span>
                    <span className="truncate text-sm text-muted-foreground">{i.title}</span>
                  </span>
                  <span className="grid shrink-0 gap-1 text-right">
                    <span className="font-mono font-semibold whitespace-nowrap tabular-nums">{money(i.total, i.currency)}</span>
                    <span className="font-mono text-xs whitespace-nowrap text-faint">{when(i)}</span>
                  </span>
                  <Badge variant={INV[i.status].v} className="shrink-0">{INV[i.status].word}</Badge>
                </RowLink>
              </li>
            ))
          )}
        </Rows>
        <p className="mt-3 text-sm text-muted-foreground">
          {invoices.length === 0
            ? "Nothing invoiced yet."
            : open.length === 0
              ? "Nothing due. Everything is paid — thank you."
              : `${open.length === 1 ? "One invoice is waiting" : `${open.length} invoices are waiting`}, ${money(owed, currency)} in total.${open.some((i) => i.status === "overdue") ? " Some are past the due date." : ""}`}
        </p>
      </Section>
    </section>
  )
}

/** One invoice: every line, the tax, the total, and what to do next. */
export async function InvoiceScreen({ client, base, invoiceId }: { client: Client; base: string; invoiceId: string }) {
  const inv = client.stripe_customer_id && configured.stripe() ? await getInvoice(client.stripe_customer_id, invoiceId) : null

  const back = (
    <a href={`${base}/billing`} className="inline-flex min-h-tap items-center gap-2 text-sm font-semibold text-muted-foreground no-underline hover:text-foreground">
      <ArrowLeft className="size-[18px]" aria-hidden="true" />
      All invoices
    </a>
  )

  if (!inv) {
    return (
      <section aria-labelledby="h-invoice">
        {back}
        <div className="mt-4">
          <PageHead eyebrow="Invoice" title="We could not find that invoice" id="h-invoice" />
          <Empty title="Nothing here">It may have been cancelled, or the link is not for this account. Every invoice you have is on the list.</Empty>
        </div>
      </section>
    )
  }

  const tax = inv.total - inv.subtotal
  return (
    <section aria-labelledby="h-invoice">
      {back}
      <div className="mt-4">
        <PageHead eyebrow={label(inv)} title={inv.title} id="h-invoice">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={INV[inv.status].v}>{INV[inv.status].word}</Badge>
            <span className="text-sm text-muted-foreground">
              Sent {day(inv.created * 1000)} · {inv.status === "paid" ? `paid ${day((inv.paidAt ?? inv.created) * 1000)}` : inv.dueDate ? `due ${day(inv.dueDate * 1000)}` : "due now"}
            </span>
          </div>
        </PageHead>
      </div>

      <Card size="lg" className="gap-0">
        <div className="mt-2">
          {inv.lines.map((l, idx) => (
            <div key={idx} className="flex items-start gap-4 border-t border-line py-4 first:border-t-0">
              <span className="grid min-w-0 flex-1 gap-1">
                <span className="font-medium">{l.description}</span>
                {l.detail && <span className="text-sm text-muted-foreground">{l.detail}</span>}
              </span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap tabular-nums">{money(l.amount, inv.currency)}</span>
            </div>
          ))}
          {tax !== 0 && (
            <div className="flex items-start gap-4 border-t border-line py-4">
              <span className="grid min-w-0 flex-1 gap-1">
                <span className="font-medium">Tax</span>
                <span className="text-sm text-muted-foreground">Worked out by Stripe Tax from your billing address.</span>
              </span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap tabular-nums">{money(tax, inv.currency)}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4 border-t-2 border-line-strong pt-4">
          <span className="grid gap-1">
            <span className="font-semibold">Total</span>
            <span className="text-xs text-faint">{tax !== 0 ? "Includes tax" : "No tax charged on this invoice"}</span>
          </span>
          <span className="font-mono text-h2 leading-none font-bold tracking-[-0.02em] whitespace-nowrap tabular-nums">{money(inv.total, inv.currency)}</span>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {inv.status === "due" || inv.status === "overdue" ? (
            <>
              {inv.payUrl && (
                <Button asChild>
                  <a href={inv.payUrl} target="_blank" rel="noopener noreferrer">Pay {money(inv.total, inv.currency)}</a>
                </Button>
              )}
              {inv.pdf && (
                <Button asChild variant="ghost"><a href={inv.pdf}><Download />Download a copy</a></Button>
              )}
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                {inv.status === "paid"
                  ? `Paid on ${day((inv.paidAt ?? inv.created) * 1000)}${inv.card ? ` with the ${inv.card}` : ""}.${inv.receiptEmail ? ` A receipt went to ${inv.receiptEmail}.` : ""}`
                  : "This invoice was cancelled and is not owed."}
              </span>
              {inv.pdf && (
                <Button asChild variant="ghost" size="sm"><a href={inv.pdf}><Download />Download {inv.status === "paid" ? "a receipt" : "a copy"}</a></Button>
              )}
            </>
          )}
        </div>
      </Card>
    </section>
  )
}
