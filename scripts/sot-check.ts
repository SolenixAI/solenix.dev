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

// The marketing context (.agents/product-marketing.md, read by every marketing skill) copies two facts that PRODUCT.md owns.
// Each copy must appear word for word in PRODUCT.md, so an edit to one side alone fails here.
const CONTEXT = ".agents/product-marketing.md"
const OWNER = "PRODUCT.md"
const COPIES = [
  { what: "the one-liner", label: "**One-liner:**" },
  { what: "the audience", label: "**Target companies:**" },
]
if (!existsSync(CONTEXT) || !existsSync(OWNER)) {
  console.log(`sot: ${CONTEXT} and ${OWNER} must both exist`)
  bad++
} else {
  const owner = readFileSync(OWNER, "utf8").replace(/\s+/g, " ")
  const lines = readFileSync(CONTEXT, "utf8").split("\n")
  for (const c of COPIES) {
    const line = lines.find((l) => l.startsWith(c.label))
    if (line === undefined) {
      console.log(`sot: ${CONTEXT} has no "${c.label}" line (${c.what}). ${OWNER} owns it.`)
      bad++
      continue
    }
    const value = line.slice(c.label.length).trim().replace(/\.$/, "")
    // The copy must end where PRODUCT.md's sentence ends: a trimmed copy ("... for small businesses.") is a different copy.
    if (!owner.includes(value + ".")) {
      console.log(`sot: ${CONTEXT} copies ${c.what} ("${value}"), but ${OWNER} does not say it word for word, as a whole sentence. Change both, or derive the copy from ${OWNER}.`)
      bad++
    }
  }
}

process.exit(bad ? 1 : 0)
