// The page-weight check: open every page the sitemap lists in one real browser, count what it downloads until it
// settles, and hold each page to its budget (lib/page-weight.ts). Run it against a production build (next build;
// next start): a dev server sends unminified code and would measure nothing a visitor gets.
//   node scripts/weight-check.ts <base url> [--json]
import { launch } from "./browser.ts"
import { overBudget, type Weight } from "../lib/page-weight.ts"

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "")
const sitemap = await fetch(base + "/sitemap.xml", { signal: AbortSignal.timeout(20_000) }).then((r) => r.text()).catch(() => "")
const paths = [...new Set([...sitemap.matchAll(/<loc>\s*https?:\/\/[^/<]+([^<\s]*)\s*<\/loc>/g)].map((m) => m[1] || "/"))]
if (!paths.length) { console.log(`weight: ${base}/sitemap.xml lists no pages`); process.exit(1) }

const browser = await launch()
const weights: Weight[] = []
try {
  for (const path of paths) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    const pending: Promise<void>[] = []
    const w: Weight = { path, total: 0, script: 0, requests: 0 }
    page.on("requestfinished", (req) => pending.push(req.sizes().then((s) => {
      const bytes = s.responseBodySize + s.responseHeadersSize
      w.total += bytes; w.requests++
      if (req.resourceType() === "script") w.script += bytes
    }).catch(() => {})))
    await page.goto(base + path, { waitUntil: "networkidle", timeout: 60_000 })
    await page.waitForTimeout(3_000) // what loads after the first idle (the 3D engine) counts too
    await Promise.all(pending)
    weights.push(w)
    await context.close()
  }
} finally {
  await browser.close()
}

if (process.argv.includes("--json")) console.log(JSON.stringify(weights, null, 2))
const problems = weights.flatMap((w) => overBudget(w))
for (const w of weights) console.log(`weight: ${w.path} ${Math.round(w.total / 1024)} KB (${Math.round(w.script / 1024)} KB script, ${w.requests} requests)`)
for (const p of problems) console.log(`weight: ${p}`)
process.exit(problems.length ? 1 : 0)
