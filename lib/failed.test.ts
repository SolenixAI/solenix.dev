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

test("the line names what failed: a read by default, or the kind given", (t) => {
  const warn = t.mock.method(console, "warn", () => {})
  failed("x", "y")
  failed("bus", "down", "publish")
  assert.match(String(warn.mock.calls[0].arguments[0]), /^read failed · x · y$/)
  assert.match(String(warn.mock.calls[1].arguments[0]), /^publish failed · bus · down$/)
})
