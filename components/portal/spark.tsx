// Sparkline, per DESIGN.md §10: baselined at zero, the end point drawn as a
// zero-length path so it stays round when the svg stretches.

export function sparkGeom(series: number[], w: number, h: number, pad: number) {
  const max = Math.max(...series, 1);
  const n = Math.max(series.length - 1, 1);
  const pts = series.map((v, i) => [(i / n) * w, h - pad - (v / max) * (h - pad * 2)] as const);
  const line = "M" + pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" L");
  const last = pts[pts.length - 1] ?? [w, h - pad];
  return {
    line,
    area: line + ` L${w},${h} L0,${h} Z`,
    last: `M${last[0].toFixed(1)},${last[1].toFixed(1)} l0 0`,
  };
}

export function Spark({ series, label }: { series: number[]; label: string }) {
  const g = sparkGeom(series, 300, 46, 5);
  return (
    <svg className="spark" viewBox="0 0 300 46" preserveAspectRatio="none" role="img" aria-label={label}>
      <path className="area" d={g.area} />
      <path className="line" d={g.line} />
      <path className="last" d={g.last} />
    </svg>
  );
}

export function RowSpark({ series, label }: { series: number[]; label: string }) {
  const g = sparkGeom(series, 76, 26, 3);
  return (
    <svg className="rowspark" viewBox="0 0 76 26" preserveAspectRatio="none" role="img" aria-label={label}>
      <path className="line" d={g.line} />
      <path className="last" d={g.last} />
    </svg>
  );
}

export function direction(total: number, previous: number) {
  if (!previous) return 0;
  return Math.round(((total - previous) / previous) * 100);
}

export function TrendChip({ delta, hasPrevious }: { delta: number; hasPrevious: boolean }) {
  if (!hasPrevious) return <span className="trend flat">First month of data</span>;
  const cls = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const arrow = delta > 0 ? "M5 17 12 9l3 3 5-6" : delta < 0 ? "M5 7 12 15l3-3 5 6" : "M5 12h14";
  const word =
    delta > 0 ? `${delta}% more than the month before`
    : delta < 0 ? `${Math.abs(delta)}% fewer than the month before`
    : "about the same as the month before";
  return (
    <span className={`trend ${cls}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={arrow} /></svg>
      {word}
    </span>
  );
}
