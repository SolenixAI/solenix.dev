import { cn } from "@/lib/utils"
import { NAV, markShapes } from "@/lib/site-nav"

/** The mark (DESIGN.md §12), drawn from lib/site-nav.ts. Uses the shared #sun gradient. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-[26px] shrink-0", className)} dangerouslySetInnerHTML={{ __html: markShapes("url(#sun)") }} />
  )
}

/** The lockup: mark plus "Solenix" in the display face at the brand weight. */
export function Lockup({ href = NAV.home.href, label = NAV.home.aria, sub }: { href?: string; label?: string; sub?: string }) {
  return (
    <a href={href} aria-label={label} className="inline-flex shrink-0 items-center gap-2 font-display font-brand tracking-[-0.01em] no-underline">
      <Mark />
      {sub ? (
        <span className="grid leading-tight">
          <span>{NAV.home.label}</span>
          <span className="font-mono text-2xs font-semibold tracking-label text-faint uppercase">{sub}</span>
        </span>
      ) : (
        NAV.home.label
      )}
    </a>
  )
}
