// The page-weight check: open every page the sitemap lists, and the nav's platform page (noindex, so not listed), in
// one real browser; count what each downloads until it settles, and hold it to its budget (lib/page-weight.ts).
// Each response is weighed as a visitor gets it: its body gzipped here (images barely shrink), so the result does not
// depend on whether the local server compresses. Script counts files and the page's inline scripts. Left out: live
// streams (text/event-stream), which carry a few dozen bytes on open and a short notice per change.
// Run it against a production build that believes it is the live site, so analytics load as they do for a visitor:
//   export VERCEL_PROJECT_PRODUCTION_URL=localhost; npm run build && npm start -- -p 3100
//   node scripts/weight-check.ts http://localhost:3100 [--json]
// /lumen is PostHog's proxy (the rewrites in next.config.ts, which next start serves too). Its file paths (/static/:
// the core and the replay and heatmap add-ons; /array/: the remote config that turns those on) go through the
// site's own rewrite and are counted; everything else under /lumen (events, flags) is stopped, so no visit is recorded.
import { gzipSync } from "node:zlib"
import { launch } from "./browser.ts"
import { overBudget, type Weight } from "../lib/page-weight.ts"
import { NAV } from "../lib/site-nav.ts"
import { POSTHOG_PROXY } from "../lib/analytics.ts"

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "")
const sitemap = await fetch(base + "/sitemap.xml", { signal: AbortSignal.timeout(20_000) }).then((r) => r.text(), (e) => {
  console.log(`weight: ${base} did not answer (${e instanceof Error ? e.message : e})`); process.exit(1)
})
const listed = [...sitemap.matchAll(/<loc>\s*https?:\/\/[^/<]+([^<\s]*)\s*<\/loc>/g)].map((m) => m[1] || "/")
if (!listed.length) { console.log(`weight: ${base}/sitemap.xml lists no pages`); process.exit(1) }
const paths = [...new Set([...listed, NAV.platform.href])]

const gz = (b: Buffer | string) => gzipSync(b).length
const inlineScripts = (html: string) => [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script[^>]*>/gi)].map((m) => m[1]).join("")

const browser = await launch()
const weights: Weight[] = [], problems: string[] = []
try {
  for (const path of paths) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await context.route(`**${POSTHOG_PROXY}/**`, (r) => {
      const { pathname } = new URL(r.request().url())
      const file = r.request().method() === "GET" && /^\/(static|array)\//.test(pathname.slice(POSTHOG_PROXY.length))
      return file ? r.continue() : r.abort()
    })
    const page = await context.newPage()
    const pending: Promise<{ total: number; script: number } | null>[] = []
    let analytics = 0 // PostHog files that arrived: every page on the live host loads them, so none means the measure is short
    page.on("requestfinished", (req) => pending.push((async () => {
      const res = await req.response()
      if (new URL(req.url()).pathname.startsWith(POSTHOG_PROXY + "/")) {
        if (!res?.ok()) problems.push(`${path}: PostHog's ${new URL(req.url()).pathname} answered ${res?.status() ?? "nothing"}, so analytics were not weighed`)
        else analytics++
      }
      if (!res || (res.status() >= 300 && res.status() < 400)) return { total: 0, script: 0 } // a redirect carries no body
      // A live stream (/agents/live) is left out: it sends a retry line and the catalog's version (a few dozen bytes),
      // then one short notice per catalog change while the page is open, and its body cannot be read once it closes.
      if ((await res.headerValue("content-type"))?.startsWith("text/event-stream")) return { total: 0, script: 0 }
      const body = await res.body()
      const total = gz(body)
      if (req.resourceType() === "script") return { total, script: total }
      if (req.resourceType() === "document") return { total, script: gz(inlineScripts(body.toString("utf8"))) }
      return { total, script: 0 }
    })().catch((e) => { problems.push(`${path}: could not weigh ${req.url()} (${e instanceof Error ? e.message : e})`); return null })))
    const res = await page.goto(base + path, { waitUntil: "networkidle", timeout: 60_000 })
    if (!res?.ok()) { problems.push(`${path} answered ${res?.status() ?? "nothing"}`); await context.close(); continue }
    await page.waitForTimeout(3_000) // what loads after the first idle (the 3D engine, analytics) counts too
    await page.waitForLoadState("networkidle")
    const parts = await Promise.all(pending)
    if (!analytics) problems.push(`${path} loaded no PostHog file, so its analytics were not weighed (is the build the live host?)`)
    const w: Weight = { path, total: 0, script: 0, requests: parts.length }
    for (const p of parts) if (p) { w.total += p.total; w.script += p.script }
    weights.push(w)
    await context.close()
  }
} finally {
  await browser.close()
}

if (process.argv.includes("--json")) console.log(JSON.stringify(weights, null, 2))
for (const w of weights) console.log(`weight: ${w.path} ${Math.round(w.total / 1024)} KB (${Math.round(w.script / 1024)} KB script, ${w.requests} requests)`)
problems.push(...weights.flatMap((w) => overBudget(w)))
for (const p of problems) console.log(`weight: ${p}`)
process.exit(problems.length ? 1 : 0)
