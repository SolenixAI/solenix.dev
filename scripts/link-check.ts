// Every page the sitemap lists, on the local site: its head says what it is, every link and asset on it lands
// (lib/page-audit.ts). Run by scripts/check.sh whenever the local site is up. Every request has a time limit, so the
// check can never hold up a commit.
//   node scripts/link-check.ts [<base url>]
import { internalLinks, landed, seoProblems } from "../lib/page-audit.ts"

const base = (process.argv[2] ?? process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
const problems: string[] = []
const get = (path: string) => fetch(base + path, { signal: AbortSignal.timeout(20_000) }).then((r) => r.text())
const sitemap = await get("/sitemap.xml").catch(() => "")
const pages = [...new Set([...sitemap.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map((m) => m[1] || "/"))]
if (!pages.length) problems.push("the sitemap lists no pages (or did not answer)")

const seen = new Map<string, Promise<{ ok: boolean; why: string }>>()
for (const page of pages) {
  let html: string
  try { html = await get(page) } catch (e) { problems.push(`${page} did not load (${e instanceof Error ? e.message : e})`); continue }
  for (const p of seoProblems(html)) problems.push(`${page} ${p}`)
  for (const link of internalLinks(html)) {
    if (!seen.has(link)) seen.set(link, landed(base, link))
    const r = await seen.get(link)!
    if (!r.ok) problems.push(`${page} links to ${link}, which ${r.why}`)
  }
}
for (const p of problems) console.log(`links: ${p}`)
console.log(problems.length ? `links: ${problems.length} problem(s)` : `links: ${pages.length} pages, ${seen.size} links and assets, all land; every head is complete`)
process.exit(problems.length ? 1 : 0)
