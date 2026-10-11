import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { articleProblems, pageEdges, placeholderTexts, publishedDate } from "./article-rules.ts"

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

test("a copy that drops the marks but keeps the words still fails; one with its own words passes, as does the real article", () => {
  const unmarked = TEMPLATE.replace(/\s*\bdata-placeholder\b/g, "")
  assert.equal(placeholders(unmarked).length, placeholderTexts(TEMPLATE).length)
  let own = unmarked
  for (const text of placeholderTexts(TEMPLATE)) own = own.replace(text, `Words of the article's own, number ${own.length}`)
  assert.deepEqual(placeholders(own), [])
  assert.deepEqual(articleProblems("proof-flood", read("../articles/proof-flood/index.html")), [])
})

test("template text with its spacing changed is still template text", () => {
  const spaced = TEMPLATE.replace(/\s*\bdata-placeholder\b/g, "").replace("One section, one idea", "One  section,\n  one idea")
  assert.ok(placeholders(spaced).some((p) => p.includes("One section, one idea")))
})

test("an article's own sentence that merely contains template words is not template text", () => {
  const page = TEMPLATE.replace(/\s*\bdata-placeholder\b/g, "").replace("<h1>The headline with one", "<h1>An Article title explained, and the headline with one")
  assert.equal(placeholders(page).some((p) => p.includes("The headline with one")), false)
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
  assert.deepEqual(edge("padding:0 var(--gutter)!important"), ["var(--gutter)", "var(--gutter)"])
  assert.deepEqual(edge("padding-inline-start:20px"), ["20px"])
  assert.deepEqual(edge("PADDING-LEFT:20px"), ["20px"])
})

test("a page edge other than the gutter fails, and the template's own edge passes", () => {
  const fails = (css: string) => articleProblems("x", TEMPLATE.replace(/\.wrap\{[^}]*\}/, `.wrap{${css}}`)).some((p) => p.includes("page edge"))
  assert.equal(fails("padding:0 20px 96px"), true)
  assert.equal(fails("padding:0"), true)
  assert.equal(fails("padding-right:16px"), true)
  assert.equal(fails("padding-inline:var(--gutter);padding-bottom:96px"), false)
  assert.equal(articleProblems("my-new-piece", TEMPLATE).some((p) => p.includes("page edge")), false)
})

test("the publication date is a property meta tag: a name tag is refused, and the date is read from the property", () => {
  const PAGE = read("../articles/proof-flood/index.html")
  assert.equal(publishedDate(PAGE), "2026-10-08")
  assert.deepEqual(articleProblems("proof-flood", PAGE), [])
  const named = PAGE.replace('property="article:published_time"', 'name="article:published_time"')
  assert.equal(publishedDate(named), "")
  assert.ok(articleProblems("proof-flood", named).some((p) => p.includes('property="article:published_time"')))
})
