// The site loads nothing from another host: every script, stylesheet, font, import map entry,
// CSS url() and ES import is served by solenix.dev itself. An outside host is a failure mode the
// repo cannot see or fix (it can be slow, down, blocked or changed). Links people click are fine.
// Vendored packages come from npm through scripts/vendor.ts; analytics go through the site's
// own path (lib/analytics.ts).
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

const OWN = /^https:\/\/(www\.)?solenix\.dev\b/
const LOADS: [RegExp, string][] = [
  [/<script\b[^>]*\bsrc=["'](https?:)?\/\/[^"']+/gi, "a script"],
  [/<link\b(?=[^>]*\brel=["'](?:stylesheet|preconnect|preload|modulepreload|dns-prefetch|prefetch|icon|manifest)["'])[^>]*\bhref=["'](https?:)?\/\/[^"']+/gi, "a stylesheet, font or preload"],
  [/@import\s+(?:url\()?["']?(https?:)?\/\/[^"')\s]+/gi, "a CSS import"],
  [/url\(\s*["']?https?:\/\/[^"')\s]+/gi, "a CSS url()"],
  [/\b(?:import|from)\s*\(?\s*["']https?:\/\/[^"']+/g, "an ES import"],
]
const MAP = /<script\b[^>]*type=["']importmap["'][^>]*>([\s\S]*?)<\/script>/gi

const files = execFileSync("git", ["ls-files", "-co", "--exclude-standard", "app", "components", "lib", "articles", "design/home.html", "design/tokens.css", "brand/motion"], { encoding: "utf8" })
  .split("\n").filter((f) => /\.(m?[jt]sx?|html|css)$/.test(f))

let bad = 0
const report = (f: string, text: string, at: number, what: string, url: string) => {
  if (OWN.test(url.replace(/^.*?(https?:\/\/|\/\/)/, "https://"))) return
  console.log(`origin: ${f}:${text.slice(0, at).split("\n").length} loads ${what} from another host (${url.slice(0, 80)}). Serve it from the site: scripts/vendor.ts`)
  bad++
}
for (const f of files) {
  const text = readFileSync(f, "utf8")
  for (const [re, what] of LOADS) for (const m of text.matchAll(re)) report(f, text, m.index ?? 0, what, m[0])
  for (const m of text.matchAll(MAP)) for (const u of (m[1] ?? "").matchAll(/["'](https?:\/\/[^"']+)["']/g)) report(f, text, m.index ?? 0, "an import map entry", u[1] ?? "")
}
process.exit(bad ? 1 : 0)
