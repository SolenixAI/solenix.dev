import { test } from "node:test"
import assert from "node:assert/strict"
import { bansIn, hitsIn, inScope } from "./decisions.ts"

// The words here are placeholders: a test file under lib/ is itself in the scope of the real bans.
const LINE = "- A rule. <!-- bans: /\\b(Acme|Globex)\\b/ in design/home.html app lib -->"

test("a bans comment gives its line, its pattern, its flags and the paths it covers", () => {
  const [ban] = bansIn(`# Title\n\n## Decisions\n\n${LINE}\n- A line with no comment.`)
  assert.equal(ban.line, 5)
  assert.equal(ban.pattern.source, "\\b(Acme|Globex)\\b")
  assert.equal(ban.pattern.flags, "")
  assert.deepEqual(ban.paths, ["design/home.html", "app", "lib"])
})

test("a ban is case-sensitive unless its flags say otherwise: a CSS property is not a product name", () => {
  const [ban] = bansIn(LINE)
  assert.deepEqual(hitsIn(ban, [{ path: "app/x.css", text: ".a{acme:pointer}" }]), [])
  assert.deepEqual(hitsIn(ban, [{ path: "app/x.tsx", text: "Ask Acme for help" }]), ["app/x.tsx:1: Ask Acme for help"])
  const [loose] = bansIn(LINE.replace("/ in", "/i in"))
  assert.equal(hitsIn(loose, [{ path: "app/x.css", text: ".a{acme:pointer}" }]).length, 1)
})

test("a hit names the file and the line, and a clean file is no hit", () => {
  const [ban] = bansIn(LINE)
  const files = [{ path: "lib/a.ts", text: "const x = 1\n  // Globex\n" }, { path: "lib/b.ts", text: "nothing here" }]
  assert.deepEqual(hitsIn(ban, files), ["lib/a.ts:2: // Globex"])
})

test("a path covers the files under it and nothing that only shares its start", () => {
  assert.equal(inScope("app/page.tsx", ["app"]), true)
  assert.equal(inScope("design/home.html", ["design/home.html"]), true)
  assert.equal(inScope("application/page.tsx", ["app"]), false)
  assert.equal(inScope("design/home.html.bak", ["design/home.html"]), false)
})

test("a path may be a glob: one star stays in a folder, two stars reach every folder under it", () => {
  assert.equal(inScope("lib/home/journey.ts", ["lib/home/**"]), true)
  assert.equal(inScope("lib/home/a/b.ts", ["lib/home/**"]), true)
  assert.equal(inScope("design/home.html", ["design/*.html"]), true)
  assert.equal(inScope("design/old/home.html", ["design/*.html"]), false)
  assert.equal(inScope("lib/site-meta.ts", ["lib/site-*.ts"]), true)
})

test("the line that declares a ban is never a hit, so a decision may name the rule it replaced", () => {
  const [ban] = bansIn(LINE)
  assert.deepEqual(hitsIn(ban, [{ path: "app/DESIGN.md", text: LINE.replace("A rule.", "Acme is gone.") }]), [])
})
