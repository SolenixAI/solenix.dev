import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { articleProblems, pageEdges } from "./article-rules.ts"

const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8")
const TEMPLATE = read("../articles/_template/index.html")
const placeholders = (html: string) => articleProblems("my-new-piece", html).filter((p) => p.includes("template text"))
const marks = (html: string) => [...html.matchAll(/<[a-z][^>]*\bdata-placeholder\b/gi)].length // marked elements, not mentions in comments

test("a copy of the template fails once for every piece of template text it still holds", () => {
  assert.ok(marks(TEMPLATE) >= 10, "the template marks its placeholder text")
  assert.equal(placeholders(TEMPLATE).length, marks(TEMPLATE))
  for (const words of ["Article title", "The headline with one", "Tie the story", "Every fact links to its source"])
    assert.ok(placeholders(TEMPLATE).some((p) => p.includes(words)), `a problem names "${words}"`)
})

test("a copy with its marks dropped passes the placeholder rule, and so does the real article", () => {
  assert.deepEqual(placeholders(TEMPLATE.replace(/\s*\bdata-placeholder\b/g, "")), [])
  assert.deepEqual(articleProblems("proof-flood", read("../articles/proof-flood/index.html")), [])
})

test("the page edge is .wrap's left and right padding, read from every form of the property", () => {
  const edge = (css: string) => pageEdges(`<style>.wrap{${css}}</style>`)
  assert.deepEqual(edge("padding-inline:var(--gutter)"), ["var(--gutter)", "var(--gutter)"])
  assert.deepEqual(edge("padding:0 var(--gutter) 96px"), ["var(--gutter)", "var(--gutter)"])
  assert.deepEqual(edge("padding:0 20px 96px"), ["20px", "20px"])
  assert.deepEqual(edge("padding:20px"), ["20px", "20px"])
  assert.deepEqual(edge("padding:var(--space-6) var(--space-4)"), ["var(--space-4)", "var(--space-4)"])
  assert.deepEqual(edge("padding-left:20px"), ["20px"])
  assert.deepEqual(edge("padding-block:0 80px"), [])
})

test("a page edge other than the gutter fails, and the template's own edge passes", () => {
  const fails = (css: string) => articleProblems("x", TEMPLATE.replace(/\.wrap\{[^}]*\}/, `.wrap{${css}}`)).some((p) => p.includes("page edge"))
  assert.equal(fails("padding:0 20px 96px"), true)
  assert.equal(fails("padding:0"), true)
  assert.equal(fails("padding-right:16px"), true)
  assert.equal(fails("padding-inline:var(--gutter);padding-bottom:96px"), false)
  assert.equal(articleProblems("my-new-piece", TEMPLATE).some((p) => p.includes("page edge")), false)
})
