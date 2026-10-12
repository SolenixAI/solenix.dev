// Tests for lib/space/world.ts through its interface (makeSpaceWorld(load)), with a fake engine and a fake page.
//   node --test lib/space/world.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { makeSpaceWorld, type SpaceBinding } from "./world.ts"

type Engine = Parameters<typeof makeSpaceWorld>[0] extends () => Promise<infer E> ? E : never

// The page: only what the world touches. `inBody` holds the elements appended to <body> and not removed; `marks`
// holds the classes on <html>, which start with type3d as the root layout's pre-paint script sets it.
const marks = new Set<string>()
function fakePage() {
  const inBody = new Set<object>()
  marks.clear(); marks.add("type3d")
  const g = globalThis as unknown as Record<string, unknown>
  g.document = {
    createElement: () => { const el = { style: {} as Record<string, string>, remove: () => { inBody.delete(el) } }; return el },
    body: { append: (el: object) => { inBody.add(el) } },
    documentElement: { classList: { add: (c: string) => { marks.add(c) }, remove: (c: string) => { marks.delete(c) } } },
  }
  g.getComputedStyle = () => ({ color: "rgb(0, 0, 0)" })
  return inBody
}
const stage = { classList: { add() {} } } as unknown as HTMLElement
const canvas = {} as HTMLCanvasElement
const binding = () => ({ wells: [], motion: () => false, story: {}, openBand: () => null, onFrame() {}, onLock() {}, onPayoff() {}, onResize() {} }) as unknown as SpaceBinding
const tick = () => new Promise<void>((r) => setImmediate(r))

test("an engine that fails to start leaves no probe in the page, however many times a page binds", async (t) => {
  t.mock.method(console, "error", () => {})
  const inBody = fakePage()
  const world = makeSpaceWorld(async () => ({ createSpace: () => { throw new Error("no WebGL") } }) as unknown as Engine)
  world.mount(stage, canvas)
  for (let i = 0; i < 3; i++) { const b = binding(); world.bind(b); await tick(); world.unbind(b) }
  assert.equal(inBody.size, 0)
  assert.equal(marks.has("type3d"), false, "the page's own words show when the world cannot start")
})

test("a world that starts reads its colours through the probe, then leaves no probe, through any binds", async () => {
  const inBody = fakePage()
  let started = 0, colour = "", during = 0
  const world = makeSpaceWorld(async () => ({
    createSpace: (env: { token: (n: string) => string }) => { started++; colour = env.token("--bg"); during = inBody.size; return { setActive() {} } },
  }) as unknown as Engine)
  world.mount(stage, canvas)
  const first = binding(); world.bind(first); await tick(); world.unbind(first)
  for (let i = 0; i < 3; i++) { const b = binding(); world.bind(b); world.unbind(b) }
  assert.equal(started, 1)
  assert.equal(colour, "rgb(0, 0, 0)", "the token is read through the probe")
  assert.equal(during, 1, "the probe is in the page while the engine starts")
  assert.equal(inBody.size, 0)
})

test("the engine module loads only when a page binds: a page that shows no world downloads none of it", async () => {
  fakePage()
  let loads = 0
  const world = makeSpaceWorld(async () => { loads++; return { createSpace: () => ({ setActive() {} }) } as unknown as Engine })
  world.mount(stage, canvas)
  await tick()
  assert.equal(loads, 0, "mounting the stage loads nothing")
  const b = binding(); world.bind(b); await tick(); world.unbind(b)
  world.bind(binding()); await tick()
  assert.equal(loads, 1, "the first bind loads it, once")
})

test("a load that fails is tried again on the next bind, and a page that leaves before the load starts no engine", async (t) => {
  t.mock.method(console, "error", () => {})
  fakePage()
  let loads = 0, started = 0
  const world = makeSpaceWorld(async () => {
    if (++loads === 1) throw new Error("chunk gone")
    return { createSpace: () => { started++; return { setActive() {} } } } as unknown as Engine
  })
  world.mount(stage, canvas)
  const a = binding(); world.bind(a); await tick(); world.unbind(a)
  assert.equal(started, 0, "the failed load starts nothing")
  const b = binding(); world.bind(b); world.unbind(b); await tick()
  assert.equal(loads, 2, "the next bind loads again")
  assert.equal(started, 0, "the page left before the load arrived, so no engine starts")
  world.bind(binding()); await tick()
  assert.equal(started, 1)
})
