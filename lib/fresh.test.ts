// Tests for lib/fresh.ts through its interface, with a fake source at the seam (makeFresh(get)).
//   node --test lib/fresh.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { makeFresh, type Get } from "./fresh.ts"

const answer = (status: number, body?: unknown, etag?: string) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: etag ? { etag } : {} })

test("every call asks the source; an unchanged source (304) gives the remembered answer", async () => {
  const seen: (string | undefined)[] = []
  const get: Get = async (_url, init) => {
    const tag = (init.headers as Record<string, string>)["if-none-match"]
    seen.push(tag)
    return tag === '"v1"' ? answer(304) : answer(200, { stars: 1 }, '"v1"')
  }
  const fresh = makeFresh(get)
  assert.deepEqual(await fresh("https://x/a"), { stars: 1 })
  assert.deepEqual(await fresh("https://x/a"), { stars: 1 })
  assert.deepEqual(seen, [undefined, '"v1"'], "the second read asks again, with the remembered ETag")
})

test("a changed source gives the new answer at once", async () => {
  let version = 1
  const get: Get = async (_url, init) => {
    const tag = (init.headers as Record<string, string>)["if-none-match"]
    return tag === `"v${version}"` ? answer(304) : answer(200, { v: version }, `"v${version}"`)
  }
  const fresh = makeFresh(get)
  assert.deepEqual(await fresh("https://x/b"), { v: 1 })
  version = 2
  assert.deepEqual(await fresh("https://x/b"), { v: 2 })
})

test("identical reads in flight share one request", async () => {
  let calls = 0
  const get: Get = async () => { calls++; await new Promise((r) => setImmediate(r)); return answer(200, { ok: true }) }
  const fresh = makeFresh(get)
  const [a, b, c] = await Promise.all([fresh("https://x/c"), fresh("https://x/c"), fresh("https://x/c")])
  assert.equal(calls, 1)
  assert.deepEqual([a, b, c], [{ ok: true }, { ok: true }, { ok: true }])
})

test("a failing source gives null and never throws", async () => {
  const fresh = makeFresh(async (url) => { if (url.endsWith("down")) throw new Error("offline"); return answer(500) })
  assert.equal(await fresh("https://x/down"), null)
  assert.equal(await fresh("https://x/error"), null)
})

test("a source whose request throws before it starts gives null and never throws", async () => {
  const fresh = makeFresh(() => { throw new Error("offline") })
  assert.equal(await fresh("https://x/throws"), null)
})

test("a source that fails after answering once gives its last answer, not nothing", async () => {
  let up = true
  const fresh = makeFresh(async () => { if (!up) return answer(403); return answer(200, { worlds: 2 }) })
  assert.deepEqual(await fresh("https://x/limit"), { worlds: 2 })
  up = false
  assert.deepEqual(await fresh("https://x/limit"), { worlds: 2 }, "a rate limit or outage keeps the last real answer on screen")
})

test("a cached read is kept by Next under its tags and revalidate time, never sent as no-store", async () => {
  let seen: (RequestInit & { next?: unknown }) | undefined
  const fresh = makeFresh(async (_url, init) => { seen = init; return answer(200, { worlds: 1 }) })
  assert.deepEqual(await fresh("https://x/cached", {}, { tags: ["marketplace:main"], revalidate: 60 }), { worlds: 1 })
  assert.deepEqual(seen?.next, { tags: ["marketplace:main"], revalidate: 60 }, "Next's data cache holds it under the tag")
  assert.equal(seen?.cache, undefined, "no-store would switch the cache off, so the tag could never expire it")
})

test("a cached read that fails after answering keeps its last real answer", async () => {
  let up = true
  const fresh = makeFresh(async () => (up ? answer(200, { sha: "a1" }) : answer(503)))
  const cached = { tags: ["marketplace:main"], revalidate: 60 }
  assert.deepEqual(await fresh("https://x/catalog", {}, cached), { sha: "a1" })
  up = false
  assert.deepEqual(await fresh("https://x/catalog", {}, cached), { sha: "a1" }, "a bad revalidation never blanks the catalog")
})
