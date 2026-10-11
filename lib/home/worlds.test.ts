// Each homepage tool is one record (lib/home/worlds.ts). Its other copies, the mark, world tag and ask in design/home.html
// and its things in lib/home/proof.ts, must name exactly the tools in that record: no tool missing, none extra.
//   node --test lib/home/worlds.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { TOOL_ORDER, TOOL_WORLDS } from "./worlds.ts"
import { PROOF } from "./proof.ts"

const html = readFileSync(fileURLToPath(new URL("../../design/home.html", import.meta.url)), "utf8")
const ids = TOOL_WORLDS.map((w) => w.id).sort()
const found = (re: RegExp) => [...html.matchAll(re)].map((m) => m[1]).sort()

test("every tool has its own journey stop, 0 up to the count, with no gap and no repeat", () => {
  assert.deepEqual(TOOL_WORLDS.map((w) => w.stop).sort((a, b) => a - b), TOOL_WORLDS.map((_, i) => i))
  assert.deepEqual([...TOOL_ORDER].sort(), ids)
})

test("design/home.html has one mark, one world tag and one ask for each tool, and for no other", () => {
  assert.deepEqual(found(/<symbol id="lg-([\w-]+)"/g), ids)
  assert.deepEqual(found(/data-world="([\w-]+)"/g), ids)
  assert.deepEqual(found(/data-tool="([\w-]+)"/g), ids)
})

test("lib/home/proof.ts has the things for each tool, and for no other", () => {
  assert.deepEqual(PROOF.map((p) => p.tool).sort(), ids)
})
