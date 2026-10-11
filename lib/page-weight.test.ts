import { test } from "node:test"
import assert from "node:assert/strict"
import { budgetFor, DEFAULT, hasReadableBody, overBudget } from "./page-weight.ts"

const KB = 1024

test("a page within its budget has no problem; each way over is named with sizes", () => {
  const b = { total: 100 * KB, script: 50 * KB }
  assert.deepEqual(overBudget({ path: "/x", total: 100 * KB, script: 50 * KB, requests: 3 }, b), [])
  assert.deepEqual(overBudget({ path: "/x", total: 120 * KB, script: 60 * KB, requests: 3 }, b), [
    "/x weighs 120 KB, over its 100 KB budget",
    "/x loads 60 KB of script, over its 50 KB budget",
  ])
})

test("a page's query shares its budget, and an unlisted page gets the default", () => {
  assert.deepEqual(budgetFor("/agents?world=toolkit"), budgetFor("/agents"))
  assert.deepEqual(budgetFor("/never-listed"), DEFAULT)
})

test("a 204 No Content has no body to read: /agents/live answers 204 when no Redis is set", () => {
  assert.equal(hasReadableBody(204, null, null), false)
})

test("an empty status (205, 304) and a redirect have no body to read", () => {
  assert.equal(hasReadableBody(205, null, null), false)
  assert.equal(hasReadableBody(304, "text/html; charset=utf-8", null), false)
  assert.equal(hasReadableBody(301, "text/html; charset=utf-8", null), false)
})

test("an empty body (content-length 0) has no body to read", () => {
  assert.equal(hasReadableBody(200, "text/html; charset=utf-8", "0"), false)
})

test("a live stream (text/event-stream) has no body to read: it does not end", () => {
  assert.equal(hasReadableBody(200, "text/event-stream; charset=utf-8", null), false)
})

test("a response with a body is read: a page, a script", () => {
  assert.equal(hasReadableBody(200, "text/html; charset=utf-8", "4096"), true)
  assert.equal(hasReadableBody(200, "application/javascript", null), true)
})
