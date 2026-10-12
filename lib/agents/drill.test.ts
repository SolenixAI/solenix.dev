// Tests for lib/agents/drill.ts through its interface: a path in, the level, trail, address and dive out. A small fake orbit; no page.
//   node --test lib/agents/drill.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { addressFor, crumbsOf, diveOf, enterPart, initialPath, levelOf } from "./drill.ts"
import type { Orbit, Part, Piece } from "@/lib/marketplace"

const part = (id: string, name: string): Part => ({ id, kind: "skill", name, blurb: null, href: "" })
const piece = (id: string, name: string, kind: Piece["kind"], parts: Part[] = []): Piece => ({
  id, kind, name, blurb: null, href: "", repo: null, version: null, updated: null, weekly: null,
  contents: [], items: [], parts, gives: null, works: [], refs: [],
})
const skills = piece("skills", "Skills", "skills", [part("ai-sdk", "AI SDK"), part("next", "Next")])
const orbit: Orbit = { sun: piece("vercel", "Vercel", "maker"), planets: [skills, piece("cli", "CLI", "cli")] }

test("the empty path is the world; a piece id is its piece; a part under it is the part", () => {
  assert.deepEqual(levelOf(orbit, []), { kind: "world" })
  assert.deepEqual(levelOf(orbit, ["skills"]), { kind: "piece", piece: skills })
  assert.deepEqual(levelOf(orbit, ["skills", "ai-sdk"]), { kind: "part", piece: skills, part: skills.parts[0] })
})

test("an unknown piece is the world, and an unknown part leaves you at its piece", () => {
  assert.deepEqual(levelOf(orbit, ["nope"]), { kind: "world" })
  assert.deepEqual(levelOf(orbit, ["nope", "ai-sdk"]), { kind: "world" })
  assert.deepEqual(levelOf(orbit, ["skills", "nope"]), { kind: "piece", piece: skills })
})

test("the trail is the sun, then each level you are inside, each pointing back to its own path", () => {
  assert.deepEqual(crumbsOf(orbit, []), [{ label: "Vercel", to: [] }])
  assert.deepEqual(crumbsOf(orbit, ["skills"]), [{ label: "Vercel", to: [] }, { label: "Skills", to: ["skills"] }])
  assert.deepEqual(crumbsOf(orbit, ["skills", "ai-sdk"]), [
    { label: "Vercel", to: [] },
    { label: "Skills", to: ["skills"] },
    { label: "AI SDK", to: ["skills", "ai-sdk"] },
  ])
})

test("an address names its own world, keeps the other parameters, and carries the piece and part", () => {
  assert.equal(addressFor("vercel", "?world=vercel&theme=dark", ["skills", "ai-sdk"]), "?world=vercel&theme=dark&piece=skills&part=ai-sdk")
  assert.equal(addressFor("vercel", "?world=vercel&piece=cli&part=x", ["skills"]), "?world=vercel&piece=skills")
  assert.equal(addressFor("vercel", "?world=vercel&piece=skills&part=ai-sdk", []), "?world=vercel")
})

test("another world's page gets no address, so its drill-down never rewrites the page", () => {
  assert.equal(addressFor("vercel", "?world=toolkit", ["skills"]), null)
  assert.equal(addressFor("vercel", "", ["skills"]), null)
})

test("a link with a part lands on its piece, then steps in to the part; anything else stays where it is", () => {
  assert.deepEqual(enterPart(orbit, ["skills"], "vercel", "?world=vercel&piece=skills&part=ai-sdk"), ["skills", "ai-sdk"])
  assert.deepEqual(enterPart(orbit, ["skills"], "vercel", "?world=toolkit&part=ai-sdk"), ["skills"])
  assert.deepEqual(enterPart(orbit, ["skills"], "vercel", "?world=vercel&part=missing"), ["skills"])
  assert.deepEqual(enterPart(orbit, [], "vercel", "?world=vercel&part=ai-sdk"), [])
  assert.deepEqual(enterPart(orbit, ["skills", "next"], "vercel", "?world=vercel&part=ai-sdk"), ["skills", "next"])
})

test("the page opens on a piece only when the orbit holds it", () => {
  assert.deepEqual(initialPath(orbit, "skills"), ["skills"])
  assert.deepEqual(initialPath(orbit, "nope"), [])
  assert.deepEqual(initialPath(orbit, null), [])
  assert.deepEqual(initialPath(orbit, undefined), [])
})

test("a dive flies in as the path gets as deep or deeper, and out when it gets shallower", () => {
  assert.equal(diveOf([], ["skills"]), "in")
  assert.equal(diveOf(["skills"], ["skills", "ai-sdk"]), "in")
  assert.equal(diveOf(["skills"], ["skills"]), "in")
  assert.equal(diveOf(["skills", "ai-sdk"], ["skills"]), "out")
  assert.equal(diveOf(["skills"], []), "out")
})
