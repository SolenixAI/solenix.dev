// What each public page costs a visitor to download: every response the browser receives while the page opens and
// settles (HTML, scripts, styles, fonts, images, the 3D engine), counted as sent over the wire (compressed), split
// into scripts and everything. scripts/weight-check.ts measures a built site in a real browser and holds each page
// to its budget below, so a change that makes a page heavier fails before it ships.

export type Weight = { path: string; total: number; script: number; requests: number }
export type Budget = { total: number; script: number }

const KB = 1024
// Ceilings, set 2026-10-11 from a production build served by `next start` (as CI runs it, without analytics, which
// only Vercel serves), each about 15% over what it measured that day. A page not listed is held to DEFAULT. Raise a
// ceiling only with the change that needs it, and say why in its commit.
export const DEFAULT: Budget = { total: 900 * KB, script: 450 * KB }
const BUDGETS: Record<string, Budget> = {
  "/": { total: 540 * KB, script: 360 * KB }, // measured 468 KB, 307 KB script (the 3D engine)
  "/agents": { total: 310 * KB, script: 200 * KB }, // measured 269 KB, 166 KB script
  "/articles": { total: 1820 * KB, script: 32 * KB }, // measured 1577 KB, no script: the hero is the article's stills
  "/articles/proof-flood": { total: 1360 * KB, script: 32 * KB }, // measured 1179 KB, no script
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
