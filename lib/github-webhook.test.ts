// Tests for lib/github-webhook.ts through its interface: a request in, a status out, a push handed on.
//   node --test lib/github-webhook.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { makeWebhook, type Push } from "./github-webhook.ts"

const SECRET = "test-secret"
const sign = (body: string) => `sha256=${createHmac("sha256", SECRET).update(body).digest("hex")}`
const delivery = (body: string, event: string, signature = sign(body)) =>
  new Request("https://x/api/github", { method: "POST", body, headers: { "x-github-event": event, "x-hub-signature-256": signature } })

function hook() {
  const pushes: Push[] = []
  return { pushes, handle: makeWebhook(SECRET, async (p) => { pushes.push(p) }) }
}

test("an unsigned or wrongly signed delivery gets 401 and is not handed on", async () => {
  const { pushes, handle } = hook()
  assert.equal((await handle(delivery("{}", "push", "sha256=nope"))).status, 401)
  assert.equal((await makeWebhook(undefined, async () => {})(delivery("{}", "push"))).status, 401, "no secret set: nothing is trusted")
  assert.equal(pushes.length, 0)
})

test("a signed body that is not JSON gets 400, not 500, and logs one line", async (t) => {
  const warn = t.mock.method(console, "warn", () => {})
  const { pushes, handle } = hook()
  assert.equal((await handle(delivery("<html>not json", "push"))).status, 400)
  assert.equal(pushes.length, 0)
  assert.equal(warn.mock.callCount(), 1)
  assert.match(String(warn.mock.calls[0].arguments[0]), /GitHub webhook/)
})

test("ping gets 204, other events 202, and a push is handed on with its repo and branch", async () => {
  const { pushes, handle } = hook()
  assert.equal((await handle(delivery("{}", "ping"))).status, 204)
  assert.equal((await handle(delivery('{"action":"opened"}', "issues"))).status, 202)
  const body = JSON.stringify({ ref: "refs/heads/main", after: "abc1234def", repository: { full_name: "o/r" } })
  assert.equal((await handle(delivery(body, "push"))).status, 204)
  assert.deepEqual(pushes, [{ repo: "o/r", branch: "main", after: "abc1234def" }])
})
