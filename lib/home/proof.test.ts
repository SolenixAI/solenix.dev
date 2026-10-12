// The tool results shown in the world (lib/home/proof.ts): each ask answers with the right things lit, and new
// things appear first.
//   node --test lib/home/proof.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { PROOF, placeProof, playProof, proofLength } from "./proof.ts"
import { TOOL_STOPS } from "./journey.ts"

test("every tool stop has its things and at least two asks, each in a few plain words", () => {
  for (const tool of TOOL_STOPS) {
    const p = PROOF.find((x) => x.tool === tool)
    assert.ok(p, tool)
    assert.ok(p.asks.length >= 2)
    for (const a of p.asks) { assert.ok(a.say.split(/\s+/).length <= 8, a.say); assert.ok(a.reply.split(/\s+/).length <= 10, a.reply) }
  }
})

test("before any ask every thing is plain; an ask lights what it found and dims the rest", () => {
  const qb = PROOF.find((x) => x.tool === "quickbooks")!
  assert.ok(placeProof(qb, -1).every((t) => t.state === "plain"))
  const asked = placeProof(qb, 0)
  assert.equal(asked.find((t) => t.id === "hillside")!.state, "hot")
  assert.equal(asked.find((t) => t.id === "cove")!.state, "dim")
  assert.equal(asked[0].id, "hillside", "what matters most comes first")
})

test("an ask that makes something adds it, first in the stack", () => {
  const qb = PROOF.find((x) => x.tool === "quickbooks")!
  const after = placeProof(qb, 1)
  assert.equal(after[0].id, "retainer")
  assert.equal(after[0].state, "new")
  assert.equal(placeProof(qb, 0).some((t) => t.id === "retainer"), false, "it does not exist before it is asked for")
})

test("an ask plays live: typed first, then each thing changes where the agent is, then the answer", () => {
  const gm = PROOF.find((x) => x.tool === "gmail")!
  const start = playProof(gm, 0, 0)
  assert.equal(start.typed, "")
  assert.ok(start.things.every((t) => t.state === "plain"), "nothing has changed before the AI starts")
  assert.equal(start.reply, 0)
  const typing = playProof(gm, 0, 0.6)
  assert.ok(typing.typed.length > 0 && typing.typed.length < gm.asks[0].say.length)
  assert.equal(typing.at, "say")
  const end = playProof(gm, 0, proofLength(gm, 0))
  assert.equal(end.typed, gm.asks[0].say)
  assert.deepEqual(end.things.map((t) => [t.id, t.state]), placeProof(gm, 0).map((t) => [t.id, t.state]), "the end is the answer")
  assert.equal(end.reply, 1)
  assert.equal(end.at, null)
})

test("mid-way, done things lead the stack, waiting ones keep their places below, and no two share a place", () => {
  for (const p of PROOF) for (let a = 0; a < p.asks.length; a++) for (let t = 0; t <= proofLength(p, a); t += 0.1) {
    const m = playProof(p, a, t), slots = m.things.filter((x) => x.show).map((x) => x.slot)
    assert.equal(new Set(slots).size, slots.length, `${p.tool} ask ${a} at ${t.toFixed(1)}s`)
  }
})

test("a thing an ask makes is not there until the agent makes it", () => {
  const qb = PROOF.find((x) => x.tool === "quickbooks")!
  assert.equal(playProof(qb, 1, 0.5).things.find((t) => t.id === "retainer")!.show, 0)
  assert.equal(playProof(qb, 1, proofLength(qb, 1)).things.find((t) => t.id === "retainer")!.show, 1)
})
