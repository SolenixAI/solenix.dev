import { Check } from "lucide-react"
import { startPlan } from "@/app/(portal)/app/(client)/actions"
import { Button } from "@/components/ui/button"
import { money } from "@/lib/stripe"
import type { Client } from "@/lib/portal"
import { cn } from "@/lib/utils"
import { SubmitButton } from "./submit-button"

type Step = { title: string; body: string; done: boolean; action?: React.ReactNode }

/**
 * "Start here": the first thing a new client sees. Every tick comes from its
 * source — details from the portal, the plan from Stripe, the site from a live
 * check — so it can never claim something that is not true. It disappears once
 * everything is done.
 */
export function StartHere({
  client,
  planActive,
  siteLive,
  previewUrl,
  canAct,
}: {
  client: Client
  planActive: boolean
  siteLive: boolean
  previewUrl: string | null
  canAct: boolean
}) {
  const offer = client.monthly_cents
    ? `${client.setup_cents ? `${money(client.setup_cents)} to set up, then ` : ""}${money(client.monthly_cents)} a month`
    : null

  const steps: Step[] = [
    {
      title: "Confirm your details",
      body: "Your business name, billing email and address, for your invoices.",
      done: Boolean(client.onboarded_at),
    },
    {
      title: "Start your plan",
      body: offer
        ? `${client.plan_name || "Website hosting and care"}: ${offer}. Stripe takes the payment; cancel any month.`
        : "We send your plan here after our first call. Nothing to pay before then.",
      done: planActive,
      action:
        canAct && offer && !planActive ? (
          <form action={startPlan}>
            <SubmitButton busy="Opening Stripe…">Start my plan</SubmitButton>
          </form>
        ) : null,
    },
    {
      title: "Your website goes live",
      body: siteLive
        ? `${client.site_domain ?? "Your site"} is live and we are looking after it.`
        : "We put it on your own domain once you are happy with it.",
      done: siteLive,
      action:
        !siteLive && previewUrl ? (
          <Button asChild variant="ghost" size="sm">
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">See the preview</a>
          </Button>
        ) : null,
    },
  ]

  const left = steps.filter((s) => !s.done).length
  if (left === 0) return null

  return (
    <section aria-labelledby="h-start" className="mb-6 rounded-2xl border border-[color-mix(in_oklch,var(--accent)_35%,var(--line))] bg-surface p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="h-start" className="font-display text-h3 font-semibold">Start here</h2>
        <p className="font-mono text-xs tracking-label text-muted-foreground uppercase">
          {steps.length - left} of {steps.length} done
        </p>
      </div>
      <ol className="grid gap-4">
        {steps.map((s, i) => (
          <li key={s.title} className="grid grid-cols-[32px_minmax(0,1fr)] gap-4 sm:grid-cols-[32px_minmax(0,1fr)_auto] sm:items-center">
            <span
              aria-hidden="true"
              className={cn(
                "grid size-8 place-items-center rounded-full border-2 font-mono text-xs font-semibold",
                s.done ? "border-ok bg-ok-tint text-ok" : "border-line-strong text-muted-foreground"
              )}
            >
              {s.done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
            </span>
            <span className="grid gap-1">
              <span className={cn("font-semibold", s.done && "text-muted-foreground line-through decoration-line-strong")}>
                {s.title}
                <span className="sr-only">{s.done ? " (done)" : " (to do)"}</span>
              </span>
              <span className="text-sm text-muted-foreground">{s.body}</span>
            </span>
            {s.action && <span className="col-start-2 sm:col-start-3">{s.action}</span>}
          </li>
        ))}
      </ol>
    </section>
  )
}
