// Tests for lib/home/labels.ts through its interface: the numbers in, the places out. No page, no frame.
//   node --test lib/home/labels.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { placeTags, type Box, type Smooth, type Sun } from "./labels.ts"

// A straight ramp, so each opacity in a test is the number it reads as.
const linear: Smooth = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)))
const tags = (suns: Sun[], extra: Partial<Parameters<typeof placeTags>[1]> = {}) =>
  placeTags(suns, { width: 680, tagW: [90, 90, 90], tagH: 28, readBox: [], show: 1, smooth: linear, ...extra })
const at = (places: ReturnType<typeof placeTags>, i: number) => places.find(p => p.i === i)!

test("two tags that would touch: the lower one steps down by a whole tag", () => {
  const places = tags([{ i: 0, x: 200, y: 100, vis: 1 }, { i: 1, x: 210, y: 105, vis: 1 }])
  assert.equal(at(places, 0).y, 100)
  assert.equal(at(places, 1).y, 134) // 100 + tagH 28 + 6
})

test("tags far enough apart do not step", () => {
  const places = tags([{ i: 0, x: 100, y: 100, vis: 1 }, { i: 1, x: 500, y: 105, vis: 1 }])
  assert.equal(at(places, 0).y, 100)
  assert.equal(at(places, 1).y, 105)
})

test("three tags in a column stack one tag apart, none touching", () => {
  const places = tags([{ i: 0, x: 300, y: 10, vis: 1 }, { i: 1, x: 300, y: 11, vis: 1 }, { i: 2, x: 300, y: 12, vis: 1 }])
  assert.deepEqual([at(places, 0).y, at(places, 1).y, at(places, 2).y], [10, 44, 78])
})

test("a tag is held inside the viewport, at both edges", () => {
  const places = tags([{ i: 0, x: 2, y: 100, vis: 1 }, { i: 1, x: 675, y: 300, vis: 1 }])
  assert.equal(at(places, 0).x, 55) // half a tag (45) + the edge (10)
  assert.equal(at(places, 1).x, 625) // 680 - 55
})

test("a sun that is not shown has no opacity", () => {
  const places = tags([{ i: 0, x: 200, y: 100, vis: 0 }])
  assert.equal(at(places, 0).opacity, 0)
})

test("with no words to keep clear of, a shown tag is fully opaque", () => {
  const places = tags([{ i: 0, x: 200, y: 100, vis: 1 }])
  assert.equal(at(places, 0).opacity, 1)
})

test("a tag that lands on the words fades out", () => {
  const readBox: Box[] = [[150, 90, 250, 130]] // the tag at x 200 sits on it
  const places = tags([{ i: 0, x: 200, y: 100, vis: 1 }], { readBox })
  assert.equal(at(places, 0).opacity, 0)
})

test("a tag clear of the words by the full fade distance shows fully", () => {
  const readBox: Box[] = [[0, 300, 40, 340]]
  const places = tags([{ i: 0, x: 200, y: 100, vis: 1 }], { readBox })
  assert.equal(at(places, 0).opacity, 1)
})

test("a tag halfway out of the fade shows halfway", () => {
  // The clearance to this box is 14 pixels, half the 28-pixel fade.
  const readBox: Box[] = [[120, 100, 131, 110]]
  const places = tags([{ i: 0, x: 200, y: 100, vis: 1 }], { readBox })
  assert.equal(at(places, 0).opacity, 0.5)
})

test("show scales the opacity of every tag", () => {
  const places = tags([{ i: 0, x: 200, y: 100, vis: 1 }], { show: 0.5 })
  assert.equal(at(places, 0).opacity, 0.5)
})
