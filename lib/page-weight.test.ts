import { test } from "node:test"
import assert from "node:assert/strict"
import { budgetFor, DEFAULT, overBudget } from "./page-weight.ts"

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
