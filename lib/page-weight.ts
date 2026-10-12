// What each page costs a visitor to download: every response the browser receives while the page opens and settles
// (HTML, scripts, styles, fonts, images, the 3D engine, analytics), each body weighed gzipped, with the page's own
// inline scripts counted as script. scripts/weight-check.ts measures a production build in a real browser and holds
// each page to its budget below, so a change that makes a page heavier fails before it ships.

export type Weight = { path: string; total: number; script: number; requests: number }
export type Budget = { total: number; script: number }

const KB = 1024
// Ceilings, set 2026-10-11 from a production build that believes it is the live site (analytics and PostHog's script
// files included), each about 15% over what it measured that day.
// A page not listed is held to DEFAULT. Raise a ceiling only with the change that needs it, and say why in its commit.
export const DEFAULT: Budget = { total: 900 * KB, script: 450 * KB }
const BUDGETS: Record<string, Budget> = {
  "/": { total: 770 * KB, script: 610 * KB }, // measured 667 KB, 531 KB script (the 3D engine, analytics); live: 683 / 530
  "/agents": { total: 525 * KB, script: 455 * KB }, // measured 455 KB, 393 KB script; its live stream (/agents/live) counts the bytes it sends, none without Redis
  "/app": { total: 560 * KB, script: 420 * KB }, // measured 487 KB, 366 KB script
  "/articles": { total: 1200 * KB, script: 570 * KB }, // measured 1125 KB, 496 KB script (the newest article inline, PostHog, the sky still in both heroes)
  "/articles/proof-flood": { total: 665 * KB, script: 570 * KB }, // measured 577 KB, 492 KB script (inline, PostHog)
}

/** The budget a page is held to. Query strings share their page's budget. */
export const budgetFor = (path: string): Budget => BUDGETS[path.replace(/\?.*$/, "")] ?? DEFAULT

/** Each way a measured page is over its budget, in plain words; empty means it fits. */
export function overBudget(w: Weight, b = budgetFor(w.path)): string[] {
  const kb = (n: number) => `${Math.round(n / KB)} KB`
  const out: string[] = []
  if (w.total > b.total) out.push(`${w.path} weighs ${kb(w.total)}, over its ${kb(b.total)} budget`)
  if (w.script > b.script) out.push(`${w.path} loads ${kb(w.script)} of script, over its ${kb(b.script)} budget`)
  return out
}

/** Whether the browser can hand back a response's body. A response with none to read is weighed by the bytes it sent. */
export function hasReadableBody(status: number, contentType: string | null, contentLength: string | null): boolean {
  if (status === 204 || status === 205 || status === 304) return false // an empty status: no body by protocol
  if (status >= 300 && status < 400) return false // a redirect
  if ((contentType ?? "").startsWith("text/event-stream")) return false // a live stream: it does not end
  return contentLength !== "0" // an empty body
}
