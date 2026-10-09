// One source of truth per thing: fail when a copy of something that has an owner appears elsewhere.
// Run by scripts/check.sh before every commit. Add a row when a new thing gets one owner.
import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"

const RULES = [
  {
    what: "the site nav, the mark or the sun's light",
    owner: "lib/site-nav.ts",
    re: /Solenix platform|Client sign in|class="f?nav"|<header class="snav"|cx="27" cy="9"|cx=\{27\}|cx="\.42" cy="\.38"/,
    allow: [] as string[],
  },
]

const files = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { encoding: "utf8" })
  .split("\n")
  // A tracked file deleted in the working tree is still listed by git: it has no text to check.
  .filter((f) => existsSync(f) && /\.(m?[jt]sx?|html|css|py)$/.test(f) && !f.startsWith("public/") && !f.startsWith("scripts/sot-check"))

let bad = 0
for (const r of RULES)
  for (const f of files) {
    if (f === r.owner || r.allow.includes(f)) continue
    const text = readFileSync(f, "utf8")
    const m = text.match(r.re)
    if (m) {
      const line = text.slice(0, m.index).split("\n").length
      console.log(`sot: ${f}:${line} copies ${r.what} ("${m[0]}"). Derive it from ${r.owner}.`)
      bad++
    }
  }
process.exit(bad ? 1 : 0)
