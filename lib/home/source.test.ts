import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

// The homepage's description is written once, in design/home.html (lib/home/source.ts reads it). Each clause of it
// is a claim PRODUCT.md makes: one AI at the centre of the tools a business uses, set up and taught by a tech expert
// based in St. John's. The clauses PRODUCT.md does not make are not in it.
test("the homepage's meta description is the one sentence the brief sets", () => {
  const html = readFileSync(new URL("../../design/home.html", import.meta.url), "utf8")
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1]
  assert.equal(description, "One AI at the centre of the tools you already use, set up, taught to your team, and your website built by a St. John's tech expert. A fixed price in writing.")
})
