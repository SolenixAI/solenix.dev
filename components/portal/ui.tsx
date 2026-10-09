import { ArrowUpRight, BarChart3, ChevronRight, CreditCard, Triangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// The portal's recurring shapes. Every one is built from tokens via Tailwind and shadcn primitives.

export function PageHead({
  eyebrow,
  title,
  id,
  lede,
  children,
}: {
  eyebrow: string
  title: string
  id: string
  lede?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="mb-8 grid gap-3">
      <p className="eyebrow eyebrow-quiet">{eyebrow}</p>
      <h1 id={id} className="font-display text-h1 font-bold tracking-heading">{title}</h1>
      {lede && <p className="max-w-[46rem] text-muted-foreground">{lede}</p>}
      {children}
    </div>
  )
}

export function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-h3 font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/** The dominant element on a screen: glass over its own small light. */
export function HeroPanel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("hero-panel p-6 sm:p-8", className)}>
      <div className="hero-light" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      {children}
    </div>
  )
}

export function Empty({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="grid justify-items-center gap-3 rounded-xl border border-dashed border-line-strong bg-sunken p-8 text-center">
      <h3 className="font-display text-h4 font-semibold">{title}</h3>
      <p className="max-w-[30rem] text-sm text-muted-foreground">{children}</p>
      {action}
    </div>
  )
}

/** Where a click crosses to a vendor. Labelled, so nobody is surprised where it lands. */
export function ExtLink({ href, children, icon = "out" }: { href: string; children: React.ReactNode; icon?: "out" | "chart" }) {
  const Icon = icon === "chart" ? BarChart3 : ArrowUpRight
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ember-text no-underline hover:underline hover:underline-offset-3">
      <Icon className="size-[13px]" aria-hidden="true" />
      {children}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

const VENDOR_ICON = { vercel: Triangle, posthog: BarChart3, stripe: CreditCard }

export function VendorChip({ vendor, children }: { vendor: keyof typeof VENDOR_ICON; children: React.ReactNode }) {
  const Icon = VENDOR_ICON[vendor]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-sunken px-2 py-1 font-mono text-2xs font-semibold tracking-label whitespace-nowrap text-muted-foreground uppercase">
      <Icon className={cn("size-[11px]", vendor === "vercel" && "fill-current")} aria-hidden="true" />
      {children}
    </span>
  )
}

export type SiteState = "live" | "building" | "down" | "none"
const SITE_STATE: Record<SiteState, { v: "ok" | "warn" | "down" | "quiet"; word: string }> = {
  live: { v: "ok", word: "Live" },
  building: { v: "warn", word: "Building" },
  down: { v: "down", word: "Down" },
  none: { v: "quiet", word: "Not live yet" },
}
export function StateBadge({ state, className }: { state: SiteState; className?: string }) {
  const s = SITE_STATE[state]
  return <Badge variant={s.v} live={state === "live"} className={className}>{s.word}</Badge>
}

/** A row inside a .rows list; a link row gets the chevron. */
export function Rows({ children }: { children: React.ReactNode }) {
  return <ul className="overflow-hidden rounded-xl border border-line bg-surface [&>li+li]:border-t [&>li+li]:border-line">{children}</ul>
}

export function RowLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex w-full items-center gap-3 px-4 py-4 text-inherit no-underline transition-colors hover:bg-sunken sm:gap-4 sm:px-5"
    >
      {children}
      {external ? (
        <ArrowUpRight className="size-[18px] shrink-0 text-faint" aria-hidden="true" />
      ) : (
        <ChevronRight className="size-[18px] shrink-0 text-faint" aria-hidden="true" />
      )}
    </a>
  )
}

export function RowStatic({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5">{children}</div>
}

export function Door({ href, title, summary }: { href: string; title: string; summary: string }) {
  return (
    <a
      href={href}
      className="flex w-full items-center gap-4 rounded-xl border border-line bg-surface px-5 py-4 text-inherit no-underline transition-colors duration-(--dur-base) hover:border-line-strong hover:bg-sunken"
    >
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="font-semibold">{title}</span>
        <span className="text-sm text-muted-foreground">{summary}</span>
      </span>
      <ChevronRight className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" />
    </a>
  )
}
