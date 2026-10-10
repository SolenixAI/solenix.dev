// Tests for lib/viewports.ts through its interface: loadViewports(file?).
// Fixture files hold their sizes written out here, so no expected value is read back from the code under test.
//   node --test lib/viewports.test.ts
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { loadViewports } from "./viewports.ts"

const dir = mkdtempSync(path.join(tmpdir(), "viewports-"))
after(() => rmSync(dir, { recursive: true, force: true }))
let made = 0
const fixture = (data: unknown): string => {
  const file = path.join(dir, `${made++}.json`)
  writeFileSync(file, JSON.stringify(data))
  return file
}

const named = {
  pane: { w: 668, h: 837 },
  desktop: { w: 1440, h: 900 },
  phone: { w: 390, h: 844 },
  preview: { w: 1200, h: 630 },
}

test("the file names the pane Jager reviews in, the review sizes and the link preview", () => {
  const v = loadViewports()
  assert.deepEqual(v.pane, { width: 668, height: 837 })
  assert.deepEqual(v.desktop, { width: 1440, height: 900 })
  assert.deepEqual(v.phone, { width: 390, height: 844 })
  assert.deepEqual(v.preview, { width: 1200, height: 630 })
})

test("the hero list is each real and edge size once, with the link preview", () => {
  const file = fixture({
    ...named,
    real: { sizes: [{ w: 636, h: 710 }, { w: 636, h: 710 }, { w: 305, h: 624 }] },
    edges: [{ w: 320, h: 568 }, { w: 1200, h: 630 }],
  })
  assert.deepEqual(loadViewports(file).hero, [
    { width: 636, height: 710 },
    { width: 305, height: 624 },
    { width: 320, height: 568 },
    { width: 1200, height: 630 },
  ])
})

test("a named size that is missing or not a whole number fails, and the error names it", () => {
  const withoutPane: Record<string, unknown> = { ...named }
  delete withoutPane.pane
  assert.throws(() => loadViewports(fixture({ ...withoutPane, real: { sizes: [] }, edges: [] })), /"pane"/)
  assert.throws(() => loadViewports(fixture({ ...named, pane: { w: 668.5, h: 837 }, real: { sizes: [] }, edges: [] })), /"pane"/)
})
