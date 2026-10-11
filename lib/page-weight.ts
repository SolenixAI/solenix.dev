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
  "/": { total: 650 * KB, script: 490 * KB }, // measured 569 KB, 433 KB script (the 3D engine, analytics)
  "/agents": { total: 290 * KB, script: 220 * KB }, // measured 248 KB, 187 KB script
  "/app": { total: 440 * KB, script: 300 * KB }, // measured 388 KB, 267 KB script; the world's still is most of the rest
  "/articles": { total: 1010 * KB, script: 460 * KB }, // measured 875 KB, 397 KB script (the newest article inline, PostHog)
  "/articles/proof-flood": { total: 550 * KB, script: 455 * KB }, // measured 479 KB, 394 KB script (inline, PostHog)
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
