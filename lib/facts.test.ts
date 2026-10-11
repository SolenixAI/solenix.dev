// Tests for lib/facts.ts through its interface, with a fake source at the seam (makeFacts(get, cached)).
//   node --test lib/facts.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { makeFacts } from "./facts.ts"

const cached = { revalidate: 3600, tags: ["t"] }
const answer = (status: number, body?: unknown) => new Response(body === undefined ? null : JSON.stringify(body), { status })

test("a fact is read through Next's data cache, under its tags and revalidate time", async () => {
  let seen: RequestInit | undefined
  const facts = makeFacts(async (_u, init) => { seen = init; return answer(200, { stars: 5 }) }, cached)
  assert.deepEqual(await facts("https://x/repo"), { stars: 5 })
  assert.deepEqual((seen as { next?: unknown }).next, cached)
})

test("an optional fact that does not exist (404) gives null quietly; any other failure logs once", async (t) => {
  const warn = t.mock.method(console, "warn", () => {})
  const facts = makeFacts(async (url) => answer(url.endsWith("/release") ? 404 : 500), cached)
  assert.equal(await facts("https://x/release", {}, { optional: true }), null)
  assert.equal(warn.mock.callCount(), 0, "a missing release is not a failure")
  assert.equal(await facts("https://x/release"), null)
  assert.equal(await facts("https://x/down", {}, { optional: true }), null)
  assert.equal(warn.mock.callCount(), 2, "a required 404 and an optional 500 are failures")
})

test("a source that throws, or answers with a body that is not JSON, gives null and logs once", async (t) => {
  const warn = t.mock.method(console, "warn", () => {})
  assert.equal(await makeFacts(() => { throw new Error("offline") }, cached)("https://x/a"), null)
  assert.equal(await makeFacts(async () => new Response("<html>", { status: 200 }), cached)("https://x/b"), null)
  assert.equal(warn.mock.callCount(), 2)
})
