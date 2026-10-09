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
