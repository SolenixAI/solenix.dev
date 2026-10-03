import { cn } from "@/lib/utils"

/** Sun + one orbit ring + one agent dot, on a 32-unit grid (DESIGN.md §12). Uses the shared #sun gradient. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-[26px] shrink-0", className)}>
      <circle cx="16" cy="16" r="14" fill="none" stroke="var(--ring)" strokeOpacity=".45" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="8" fill="url(#sun)" />
      <circle cx="27" cy="9" r="2.2" fill="var(--ring)" />
    </svg>
  )
}

/** The lockup: mark plus "Solenix" in the display face at the brand weight. */
export function Lockup({ href = "/", label = "Solenix home", sub }: { href?: string; label?: string; sub?: string }) {
  return (
    <a href={href} aria-label={label} className="inline-flex shrink-0 items-center gap-2 font-display font-brand tracking-[-0.01em] no-underline">
      <Mark />
      {sub ? (
        <span className="grid leading-tight">
          <span>Solenix</span>
          <span className="font-mono text-2xs font-semibold tracking-label text-faint uppercase">{sub}</span>
        </span>
      ) : (
        "Solenix"
      )}
    </a>
  )
}
