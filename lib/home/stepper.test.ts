// Tests for the homepage's scroll stepper through its pure parts: where a gesture goes, and when a gesture is new.
//   node --test lib/home/stepper.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { gesture, nextStop } from "./stepper.ts"

const STOPS = [0, 800, 2200, 2700, 4000]

test("one gesture moves to the next stop in its direction, from a stop or from between two", () => {
  assert.equal(nextStop(STOPS, 0, 1), 800)
  assert.equal(nextStop(STOPS, 800, 1), 2200)
  assert.equal(nextStop(STOPS, 1500, 1), 2200)
  assert.equal(nextStop(STOPS, 1500, -1), 800)
  assert.equal(nextStop(STOPS, 2200, -1), 800)
})

test("a stop within a couple of pixels counts as where the page is", () => {
  assert.equal(nextStop(STOPS, 801.5, 1), 2200)
  assert.equal(nextStop(STOPS, 798.5, -1), 0)
})

test("at either end there is nowhere further to go", () => {
  assert.equal(nextStop(STOPS, 4000, 1), null)
  assert.equal(nextStop(STOPS, 0, -1), null)
})

test("a wheel gesture is new after a pause, or when it turns around; its momentum is not", () => {
  const g = gesture()
  assert.equal(g(0, 40), true, "the first event starts a gesture")
  assert.equal(g(30, 60), false, "the same swipe, still going")
  assert.equal(g(60, 20), false, "its momentum, fading")
  assert.equal(g(90, -30), true, "turning around starts a new one")
  assert.equal(g(120, -30), false)
  assert.equal(g(500, -10), true, "a pause starts a new one")
})

test("a fresh swipe during the last one's momentum starts a new gesture", () => {
  const g = gesture()
  g(0, 80); g(20, 40); g(40, 12); g(60, 6)
  assert.equal(g(80, 70), true, "a jump back up in speed is a new swipe")
})
