// The homepage journey keeps its brief (.impeccable/surfaces/design-home-html.md): one caption per stop, few words,
// sample numbers labelled, one ember action at most. Reads the stops (lib/home/journey.ts) and the words
// (design/home.html) together.
//   node --test lib/home/journey.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { JOURNEY, PLAN_STEPS } from "./journey.ts"
import { TOOL_WORLDS } from "./worlds.ts"

const html = readFileSync(fileURLToPath(new URL("../../design/home.html", import.meta.url)), "utf8")
const caps = [...html.matchAll(/<li class="cap(?: on)?" data-k="(\d+)">([\s\S]*?)<\/li>\n/g)].map((m) => ({ k: +m[1], body: m[2] }))
const text = (s: string) => s.replace(/<span class="ex">[\s\S]*?<\/span>/g, "").replace(/<svg[\s\S]*?<\/svg>/g, "")
  .replace(/<span class="no">[\s\S]*?<\/span>/g, "").replace(/<[^>]+>/g, " ").replace(/&#8209;/g, "-").replace(/&[a-z]+;/g, " ")
const words = (s: string) => text(s).split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length
const lines = (body: string) => [...body.matchAll(/<(h1|h2|p|ul)\b[^>]*>([\s\S]*?)<\/\1>/g), ...body.matchAll(/<ol\b[^>]*>([\s\S]*?)<\/ol>/g)]
  .flatMap((m) => (m[0].startsWith("<ol") ? [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((li) => li[1]) : [m[2]]))

test("there is one caption per stop, in order", () => {
  assert.equal(caps.length, JOURNEY.length)
  caps.forEach((c, i) => assert.equal(c.k, i))
})

test("each line on screen is ten words or fewer", () => {
  for (const c of caps) for (const l of lines(c.body)) assert.ok(words(l) <= 10, `stop ${c.k} (${JOURNEY[c.k].id}): "${text(l).trim()}" has ${words(l)} words`)
})

test("every figure on screen wears an Example tag", () => {
  for (const c of caps) for (const f of c.body.match(/<p class="fig">[\s\S]*?<\/p>/g) ?? []) assert.match(f, /class="ex">Example</, `stop ${c.k}`)
})

test("a stop has at most one ember action", () => {
  for (const c of caps) assert.ok((c.body.match(/btn-primary/g) ?? []).length <= 1, `stop ${c.k}`)
})

test("the story in words has one full sentence per stop, for screen readers and pages without script", () => {
  const story = html.match(/<ol class="story">([\s\S]*?)<\/ol>/)?.[1] ?? ""
  const items = [...story.matchAll(/<li>([^<]+)<\/li>/g)].map((m) => m[1])
  assert.equal(items.length, JOURNEY.length)
  for (const t of items) assert.ok(t.split(/\s+/).length >= 6, t)
})

test("each tool stop flies to a tool world that exists, and holds that tool's asks", () => {
  JOURNEY.forEach((s, k) => {
    if (!("tool" in s.scene)) return
    const tool = s.scene.tool
    assert.ok(TOOL_WORLDS.some((w) => w.id === tool), `stop ${k}: no world ${tool}`)
    assert.match(caps[k].body, new RegExp(`class="asks(?: vh)?" data-tool="${tool}"`), `stop ${k} holds its tool's asks`)
  })
})

test("the plan is one stop, and its words hold one line per step on the orbit", () => {
  const plan = JOURNEY.flatMap((s, k) => (s.sec === "plan" ? [k] : []))
  assert.equal(plan.length, 1)
  const steps = caps[plan[0]].body.match(/<ol class="steps">([\s\S]*?)<\/ol>/)?.[1] ?? ""
  assert.equal((steps.match(/<li>/g) ?? []).length, PLAN_STEPS)
})

test("the page's fallback stop count is the journey's: the scroll is one screen per stop before the script runs", () => {
  assert.match(html, new RegExp(`\\.journey \\{[^}]*var\\(--n, ${JOURNEY.length}\\)`))
})

test("the page's stylesheet is whole: every rule opens and closes, so no broken rule swallows the ones after it", () => {
  for (const css of [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1].replace(/\/\*[\s\S]*?\*\//g, ""))) {
    let depth = 0
    css.split("\n").forEach((l, i) => { for (const ch of l) { if (ch === "{") depth++; if (ch === "}") depth--; assert.ok(depth >= 0, `a stray } at style line ${i + 1}: ${l.trim().slice(0, 60)}`) } })
    assert.equal(depth, 0, "a rule is never closed")
  }
})
