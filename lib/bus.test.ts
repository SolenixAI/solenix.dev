// Tests for lib/bus.ts through its interface, with an in-memory Redis at the seam (makeHub(connect)).
//   node --test lib/bus.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { makeHub, type Listener, type Wire } from "./bus.ts"

function fakeRedis() {
  const subs = new Map<string, Listener>()
  const log: string[] = []
  const wire: Wire = {
    publish: async (c, m) => { subs.get(c)?.(m) },
    subscribe: async (c, l) => { log.push(`sub ${c}`); subs.set(c, l) },
    unsubscribe: async (c) => { log.push(`unsub ${c}`); subs.delete(c) },
  }
  let connects = 0
  return { connect: async () => { connects++; return wire }, log, connects: () => connects }
}

test("a message published anywhere reaches every open page on the channel", async () => {
  const r = fakeRedis()
  const hub = makeHub(r.connect)
  const a: string[] = [], b: string[] = []
  await hub.subscribe("m", (x) => a.push(x))
  await hub.subscribe("m", (x) => b.push(x))
  await hub.publish("m", "v2")
  assert.deepEqual([a, b], [["v2"], ["v2"]])
  assert.deepEqual(r.log, ["sub m"], "one Redis subscription per channel, however many pages")
  assert.equal(r.connects(), 1, "one connection per instance")
})

test("the last page to leave closes the channel; a page that left hears nothing", async () => {
  const r = fakeRedis()
  const hub = makeHub(r.connect)
  const heard: string[] = []
  const stopA = await hub.subscribe("m", (x) => heard.push(`a:${x}`))
  const stopB = await hub.subscribe("m", (x) => heard.push(`b:${x}`))
  stopA()
  await hub.publish("m", "v2")
  stopB()
  await new Promise((done) => setImmediate(done))
  assert.deepEqual(heard, ["b:v2"])
  assert.deepEqual(r.log, ["sub m", "unsub m"])
})

test("a failed connection is retried on the next use, not remembered", async () => {
  let tries = 0
  const r = fakeRedis()
  const hub = makeHub(async () => { if (++tries === 1) throw new Error("down"); return r.connect() })
  await assert.rejects(hub.publish("m", "x"))
  await hub.publish("m", "x")
  assert.equal(tries, 2)
})

test("a failed subscribe does not leave the channel deaf: the next page subscribes for real", async () => {
  const r = fakeRedis()
  let fail = true
  const hub = makeHub(async () => {
    const w = await r.connect()
    return { ...w, subscribe: async (c: string, l: Listener) => { if (fail) { fail = false; throw new Error("down") } return w.subscribe(c, l) } }
  })
  await assert.rejects(hub.subscribe("m", () => {}))
  const heard: string[] = []
  await hub.subscribe("m", (x) => heard.push(x))
  await hub.publish("m", "v2")
  assert.deepEqual(heard, ["v2"])
})

test("a failed unsubscribe is handled, never an unhandled rejection", async () => {
  const r = fakeRedis()
  const hub = makeHub(async () => ({ ...(await r.connect()), unsubscribe: async () => { throw new Error("gone") } }))
  let unhandled = 0
  const onUnhandled = () => { unhandled++ }
  process.on("unhandledRejection", onUnhandled)
  const stop = await hub.subscribe("m", () => {})
  stop()
  await new Promise((done) => setTimeout(done, 20))
  process.off("unhandledRejection", onUnhandled)
  assert.equal(unhandled, 0)
})
