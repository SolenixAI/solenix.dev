import { ArrowUpRight, Lock } from "lucide-react"
import { StateBadge, type SiteState } from "./ui"

/**
 * The client's website, live, in a browser frame. The frame renders the real
 * page at desktop width and scales it down, so it looks like their site, not a
 * screenshot that goes stale. Clicks go to the real site in a new tab.
 */
export function SitePreview({ url, state, label }: { url: string; state: SiteState; label: string }) {
  const host = url.replace(/^https?:\/\//, "").replace(/\/$/, "")
  return (
    <section aria-labelledby="h-site" className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="h-site" className="font-display text-h3 font-semibold">{label}</h2>
        <StateBadge state={state} />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden rounded-xl border border-line bg-surface-solid no-underline shadow-md transition-[translate,box-shadow] duration-(--dur-base) hover:-translate-y-0.5 hover:shadow-lg"
      >
        <span className="flex items-center gap-2 border-b border-line bg-sunken px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-line-strong" />
            <span className="size-2.5 rounded-full bg-line-strong" />
            <span className="size-2.5 rounded-full bg-line-strong" />
          </span>
          <span className="mx-auto flex min-w-0 items-center gap-1.5 rounded-pill bg-surface-solid px-3 py-1 font-mono text-xs text-muted-foreground">
            <Lock className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{host}</span>
          </span>
          <ArrowUpRight className="size-4 text-faint transition-colors group-hover:text-foreground" aria-hidden="true" />
        </span>
        <span className="relative block aspect-[16/10] overflow-hidden bg-background">
          <iframe
            src={url}
            title={`${host}, live`}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 h-[200%] w-[200%] origin-top-left scale-50 border-0"
          />
        </span>
        <span className="sr-only">Open {host} in a new tab</span>
      </a>
    </section>
  )
}
