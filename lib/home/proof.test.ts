// The tool results shown in the world (lib/home/proof.ts): each ask answers with the right things lit, and new
// things appear first.
//   node --test lib/home/proof.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { PROOF, placeProof } from "./proof.ts"
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
