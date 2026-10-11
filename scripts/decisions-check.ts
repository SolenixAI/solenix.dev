// Jager's decisions have one home: DESIGN.md, Decisions. A decision may carry the words that would bring an old,
// replaced rule back, as a comment at the end of its line:
//   <!-- bans: /pattern/flags in glob glob ... -->
// This check fails when any file in those globs says one of them, so a decision, once made, cannot be contradicted
// anywhere again. Run by scripts/check.sh before every commit; scripts/check-test.sh proves it fails.
// A line that itself declares bans is skipped, so a decision may name the rule it replaced.
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

type Ban = { decision: string; re: RegExp; globs: string[] }

const design = readFileSync("DESIGN.md", "utf8")
const section = design.split(/^## Decisions.*$/m)[1]?.split(/^## /m)[0] ?? ""
const bans: Ban[] = []
for (const line of section.split("\n")) {
  const m = line.match(/<!-- bans: \/(.+)\/([a-z]*) in (.+?) -->/)
  if (!m) continue
  const decision = line.replace(/^- /, "").replace(/<!--.*-->/, "").trim().split(/[.;(]/)[0]
  bans.push({ decision, re: new RegExp(m[1], m[2].replace("g", "")), globs: m[3].trim().split(/\s+/) })
}
if (!bans.length) { console.log("decisions: DESIGN.md has no Decisions with bans (the check reads nothing)"); process.exit(1) }

let bad = 0
for (const b of bans) {
  const files = execFileSync("git", ["ls-files", "-co", "--exclude-standard", "--", ...b.globs.map((g) => `:(glob)${g}`)], { encoding: "utf8" })
    .split("\n").filter(Boolean)
  for (const f of files) {
    let text: string
    try { text = readFileSync(f, "utf8") } catch { continue }
    text.split("\n").forEach((l, i) => {
      if (l.includes("<!-- bans:") || !b.re.test(l)) return
      bad++
      console.log(`decisions: ${f}:${i + 1} contradicts a decision (DESIGN.md: ${b.decision}): ${l.trim().slice(0, 100)}`)
    })
  }
}
process.exit(bad ? 1 : 0)
