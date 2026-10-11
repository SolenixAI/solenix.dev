// Every page the sitemap lists, on the local site: its head says what it is (lib/page-audit.ts), every link and asset
// on it answers, and the site's redirects land. Run by scripts/check.sh whenever the local site is up.
//   node scripts/link-check.ts [<base url>]
import { internalLinks, seoProblems } from "../lib/page-audit.ts"

const base = (process.argv[2] ?? process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
const problems: string[] = []
const sitemap = await fetch(`${base}/sitemap.xml`).then((r) => r.text())
const pages = [...new Set([...sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1] || "/"))]
if (!pages.length) problems.push("the sitemap lists no pages")

// A link answers when it ends at a 2xx, following the site's own redirects; one that leaves the site counts as landed.
const answered = new Map<string, number>()
const status = async (path: string) => {
  if (!answered.has(path)) {
    const r = await fetch(base + path, { redirect: "manual" })
    const to = r.headers.get("location")
    answered.set(path, r.status >= 300 && r.status < 400 && to && !to.startsWith("/") && !to.startsWith(base) ? 200 : r.status >= 300 && r.status < 400 && to ? (await fetch(new URL(to, base + path))).status : r.status)
  }
  return answered.get(path)!
}

for (const page of pages) {
  const html = await fetch(base + page).then((r) => r.text())
  for (const p of seoProblems(html)) problems.push(`${page} ${p}`)
  for (const link of internalLinks(html)) {
    const code = await status(link)
    if (code >= 400) problems.push(`${page} links to ${link}, which answers ${code}`)
  }
}
for (const p of problems) console.log(`links: ${p}`)
console.log(problems.length ? `links: ${problems.length} problem(s)` : `links: ${pages.length} pages, ${answered.size} links and assets, all answer; every head is complete`)
process.exit(problems.length ? 1 : 0)
