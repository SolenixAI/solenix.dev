// The decisions gate (run by scripts/check.sh): every bans comment in DESIGN.md's Decisions is held in the files its
// paths name. The files are the repo's tracked and unignored text files, so a build output or a dependency is never read.
import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { bansIn, hitsIn, inScope } from "../lib/decisions.ts"

const TEXT = /\.(tsx?|html?|css|md|json|txt|xml)$/
const files = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { encoding: "utf8" })
  .split("\n").filter((f) => TEXT.test(f) && existsSync(f))
let bad = 0
for (const ban of bansIn(readFileSync("DESIGN.md", "utf8"))) {
  const scope = files.filter((f) => inScope(f, ban.paths))
  for (const hit of hitsIn(ban, scope.map((path) => ({ path, text: readFileSync(path, "utf8") })))) {
    console.log(`check: a decision is broken (DESIGN.md:${ban.line}): ${hit}`)
    bad++
  }
}
process.exit(bad ? 1 : 0)
