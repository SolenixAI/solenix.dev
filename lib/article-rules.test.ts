import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { articleProblems } from "./article-rules.ts"

const TEMPLATE = readFileSync(new URL("../articles/_template/index.html", import.meta.url), "utf8")
const placeholders = (html: string) => articleProblems("my-new-piece", html).filter((p) => p.includes("template text"))

test("a copy of the template that changes nothing fails on every placeholder it still holds", () => {
  const found = placeholders(TEMPLATE)
  for (const words of ["Article title", "The headline with one", "Replace with the real thing", "Every fact links to its source"])
    assert.ok(found.some((p) => p.includes(words)), `expected a problem naming "${words}", got ${JSON.stringify(found)}`)
})

test("a page whose words are its own passes the placeholder rule", () => {
  const own = TEMPLATE
    .replace("Article title", "Gaps between primes")
    .replace("One sentence a busy owner reads in a feed and wants to open: what this shows and why it matters.", "A new bound on how far apart two primes can sit, drawn as a map you can drag.")
    .replace("The headline with one <span class=\"grad\">glowing</span> word", "Primes keep their <span class=\"grad\">distance</span>")
    .replace("Replace with the real thing: a playground, a picture, a map. Show before you tell.", "A map of every prime gap below a million.")
    .replace("Every fact links to its source, newest first, with its date.", "<a href=\"https://example.org\">A paper</a>, 2026-10-01.")
    .replace("One plain sentence of what happened, then the open question it raises?", "A new bound arrived this week. How close can two primes sit?")
    .replace("The live thing itself: a playground, a simulation, the data you can touch.", "Drag the slider to change the range.")
    .replace("One section, one idea", "What changed")
    .replace("The one first step →", "See the map →")
  assert.deepEqual(placeholders(own), [])
})

test("the template's page edge and type follow the design tokens, so a copy starts right", () => {
  assert.equal(articleProblems("my-new-piece", TEMPLATE).filter((p) => p.includes("page edge")).length, 0)
  assert.match(TEMPLATE, /\.wrap\{[^}]*padding-inline:var\(--gutter\)/)
  assert.doesNotMatch(TEMPLATE, /font:17px/)
})
