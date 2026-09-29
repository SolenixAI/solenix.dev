import { cn } from "@/lib/utils"

export const STAGES = ["Call", "Plan", "Build", "Care"] as const

export type Step = { name: string; state: "done" | "now" | "next"; meta?: string }

/** Steps for a project at `stage` (1–4), with optional per-stage notes. */
export function stepsFor(stage: number, notes: Partial<Record<number, string>> = {}): Step[] {
  return STAGES.map((name, i) => {
    const n = i + 1
    const state = n < stage ? "done" : n === stage ? "now" : "next"
    return { name, state, meta: notes[n] ?? (state === "done" ? "Done" : state === "next" ? "Not started" : undefined) }
  })
}

/**
 * The progress timeline (DESIGN.md §10). The current stage is marked three
 * ways — fill, glow and the word Now — and carries aria-current="step".
 * Horizontal from 640px, stacked below.
 */
export function Timeline({ steps, className }: { steps: Step[]; className?: string }) {
  return (
    <ol className={cn("grid gap-4 sm:grid-cols-4 sm:gap-3", className)}>
      {steps.map((s) => (
        <li
          key={s.name}
          aria-current={s.state === "now" ? "step" : undefined}
          className="grid grid-cols-[14px_1fr] items-start gap-3 sm:grid-cols-1 sm:gap-2"
        >
          <span
            aria-hidden="true"
            className={cn(
              "mt-1 size-3.5 rounded-full border-[1.5px] sm:mt-0",
              s.state === "next" ? "border-line-strong bg-chart-track" : "border-transparent bg-ember",
              s.state === "now" && "pulse-dot text-ember"
            )}
          />
          <span className="grid gap-0.5">
            <span className={cn("text-sm font-semibold", s.state === "next" && "font-normal text-muted-foreground")}>{s.name}</span>
            {s.state === "now" && <span className="font-mono text-2xs font-semibold tracking-label text-ember-text uppercase">Now</span>}
            {s.meta && <span className="font-mono text-2xs text-muted-foreground">{s.meta}</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}
