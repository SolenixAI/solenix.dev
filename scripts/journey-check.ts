// Every page belongs to a user journey (design/journeys.md), and every journey names real pages.
// The pages are read from the code each time: app/**/page.tsx, the raw HTML and feed routes,
// one page per article folder, and the redirects in next.config.ts that leave the site. Nothing is listed by hand.
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

const DOC = "design/journeys.md"
const problems = []

// Pages, from the code.
const pages = new Set<string>()
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name)
    if (statSync(file).isDirectory()) walk(file)
    else if (name === "page.tsx" || name === "route.ts") {
      if (name === "route.ts" && !/servePage|serveArticle|application\/rss\+xml/.test(readFileSync(file, "utf8"))) continue
      const route = "/" + path.dirname(file).split(path.sep).slice(1).filter((s) => !/^\(.*\)$/.test(s)).join("/")
      if (route.includes("[slug]") && route.startsWith("/articles"))
        for (const a of readdirSync("articles")) {
          if (!a.startsWith("_") && statSync(path.join("articles", a)).isDirectory()) pages.add(route.replace("[slug]", a))
        }
      else pages.add(route)
    }
  }
}
walk("app")
// A redirect that leaves the site (like /book) is a step people take; an old alias of a page is not.
for (const m of readFileSync("next.config.ts", "utf8").matchAll(/source:\s*["']([^"']+)["'][\s\S]*?destination:\s*["']([^"']+)["']/g))
  if (/^https?:/.test(m[2])) pages.add(m[1])

// Journeys, from the doc.
const doc = readFileSync(DOC, "utf8")
const named = new Set()
const sections = doc.split(/\n(?=## )/)
for (const s of sections) {
  const line = s.match(/^Pages:\s*(.+)$/m)
  if (!line) continue
  const title = s.match(/^## (.+)$/m)?.[1] ?? "?"
  if (!/```mermaid\s*\n\s*journey\b/.test(s)) problems.push(`"${title}" lists pages but has no journey diagram`)
  for (const p of line[1].split(",").map((x) => x.trim()).filter(Boolean)) {
    named.add(p)
    if (!pages.has(p)) problems.push(`"${title}" names ${p}, which is not a page on the site`)
  }
}
for (const p of pages) if (!named.has(p)) problems.push(`${p} belongs to no journey: add it to a journey in ${DOC}`)

// Every step has a feeling from 1 to 5.
for (const block of doc.matchAll(/```mermaid\s*\n\s*journey\b([\s\S]*?)```/g))
  for (const step of block[1].split("\n").map((l) => l.trim()).filter((l) => l && !/^(title|section)\b/.test(l)))
    if (!/^.+:\s*[1-5]\s*(:\s*.+)?$/.test(step)) problems.push(`journey step "${step}" needs a feeling from 1 to 5`)

for (const p of problems) console.log(`journey: ${p}`)
process.exit(problems.length ? 1 : 0)
