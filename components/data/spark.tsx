import { cn } from "@/lib/utils"

// Sparkline, per DESIGN.md §10: baselined at zero (a floating baseline
// exaggerates small changes), end point drawn as a zero-length path so it
// stays round when the svg stretches, and always a text alternative.

export function sparkGeom(series: number[], w: number, h: number, pad: number) {
  const max = Math.max(...series, 1)
  const n = Math.max(series.length - 1, 1)
  const pts = series.map((v, i) => [(i / n) * w, h - pad - (v / max) * (h - pad * 2)] as const)
  const line = "M" + pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" L")
  const last = pts[pts.length - 1] ?? [w, h - pad]
  return { line, area: `${line} L${w},${h} L0,${h} Z`, last: `M${last[0].toFixed(1)},${last[1].toFixed(1)} l0 0` }
}

export function Spark({ series, label, className }: { series: number[]; label: string; className?: string }) {
  const g = sparkGeom(series, 300, 46, 5)
  return (
    <svg className={cn("spark h-[46px]", className)} viewBox="0 0 300 46" preserveAspectRatio="none" role="img" aria-label={label}>
      <path className="area" d={g.area} />
      <path className="line" d={g.line} />
      <path className="last" d={g.last} />
    </svg>
  )
}

export function RowSpark({ series, label }: { series: number[]; label: string }) {
  const g = sparkGeom(series, 76, 26, 3)
  return (
    <svg className="spark spark-sm h-[26px] w-[52px] shrink-0 sm:w-[76px]" viewBox="0 0 76 26" preserveAspectRatio="none" role="img" aria-label={label}>
      <path className="line" d={g.line} />
      <path className="last" d={g.last} />
    </svg>
  )
}

export function SparkAxis() {
  return (
    <p className="flex justify-between font-mono text-2xs text-muted-foreground" aria-hidden="true">
      <span>30 days ago</span>
      <span>Today</span>
    </p>
  )
}

export const percentChange = (now: number, before: number) => (before ? Math.round(((now - before) / before) * 100) : 0)

/**
 * Stat trend. Direction lives in the arrow and the sign; the judgement
 * (good / bad / neutral) is set per use, because a rise is not always good.
 */
export function Trend({
  delta,
  sentiment = "neutral",
  hasPrevious = true,
}: {
  delta: number
  sentiment?: "good" | "bad" | "neutral"
  hasPrevious?: boolean
}) {
  if (!hasPrevious) {
    return <span className="inline-flex rounded-pill bg-sunken px-2 py-0.5 font-mono text-2xs font-semibold text-muted-foreground">First month of data</span>
  }
  const arrow = delta > 0 ? "M5 17 12 9l3 3 5-6" : delta < 0 ? "M5 7 12 15l3-3 5 6" : "M5 12h14"
  const word =
    delta > 0 ? `${delta}% more than the month before`
    : delta < 0 ? `${Math.abs(delta)}% fewer than the month before`
    : "about the same as the month before"
  const tone =
    delta === 0 || sentiment === "neutral"
      ? "bg-[var(--trend-flat-tint)] text-[var(--trend-flat)]"
      : (delta > 0) === (sentiment === "good")
        ? "bg-ok-tint text-ok"
        : "bg-down-tint text-down"
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-pill px-2 py-0.5 font-mono text-2xs font-semibold whitespace-nowrap tabular-nums", tone)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-[11px]">
        <path d={arrow} />
      </svg>
      {word}
    </span>
  )
}
