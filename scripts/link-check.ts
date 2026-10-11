// Every page the sitemap lists, on the local site: its head says what it is, every link and asset on it lands
// (lib/page-audit.ts). Run by scripts/check.sh whenever the local site is up.
//   node scripts/link-check.ts [<base url>]
import { auditSite } from "../lib/page-audit.ts"
import { SITE_URL } from "../lib/site-meta.ts"

const base = process.argv[2] ?? process.env.SITE_URL ?? "http://localhost:3000"
const { pages, links, problems } = await auditSite(base, { own: [SITE_URL] })
for (const p of problems) console.log(`links: ${p}`)
console.log(problems.length ? `links: ${problems.length} problem(s)` : `links: ${pages} pages, ${links} links and assets, all land; every head is complete`)
process.exit(problems.length ? 1 : 0)
