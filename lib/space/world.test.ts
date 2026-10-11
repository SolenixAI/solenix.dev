// Tests for lib/space/world.ts through its interface (makeSpaceWorld(load)), with a fake engine and a fake page.
//   node --test lib/space/world.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { makeSpaceWorld, type SpaceBinding } from "./world.ts"

type Engine = Parameters<typeof makeSpaceWorld>[0] extends () => Promise<infer E> ? E : never

// The page: only what the world touches. `inBody` holds the elements appended to <body> and not removed.
function fakePage() {
  const inBody = new Set<object>()
  const g = globalThis as unknown as Record<string, unknown>
  g.document = {
    createElement: () => { const el = { style: {} as Record<string, string>, remove: () => { inBody.delete(el) } }; return el },
    body: { append: (el: object) => { inBody.add(el) } },
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
  await tick()
  for (let i = 0; i < 3; i++) { const b = binding(); world.bind(b); world.unbind(b) }
  assert.equal(inBody.size, 0)
})

test("a world that starts keeps exactly one probe through any binds and unbinds", async () => {
  const inBody = fakePage()
  let started = 0
  const world = makeSpaceWorld(async () => ({ createSpace: () => { started++; return { setActive() {} } } }) as unknown as Engine)
  world.mount(stage, canvas)
  await tick()
  for (let i = 0; i < 3; i++) { const b = binding(); world.bind(b); world.unbind(b) }
  assert.equal(started, 1)
  assert.equal(inBody.size, 1)
})
