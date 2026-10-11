// Tests for lib/failed.ts: one log line per failed read.
//   node --test lib/failed.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { failed } from "./failed.ts"

test("the reason is one short line, whatever the error holds", (t) => {
  const warn = t.mock.method(console, "warn", () => {})
  assert.equal(failed("https://x/y", new SyntaxError(`Unexpected token '<', "<html>\n<body>${"x".repeat(500)}`)), null)
  const line = String(warn.mock.calls[0].arguments[0])
  assert.doesNotMatch(line, /\n/)
  assert.ok(line.length <= 300, `${line.length} characters`)
  assert.match(line, /^read failed · https:\/\/x\/y · Unexpected token/)
})
