// Tests for lib/github.ts through its interface, with a fake GitHub at the seam (makeToken(app, get, now)).
//   node --test lib/github.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { createHmac, createVerify, generateKeyPairSync } from "node:crypto"
import { appJwt, makeToken, signedByGitHub, type Get } from "./github.ts"

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } })
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

test("the app JWT is RS256-signed, names the app, and lasts under GitHub's ten minutes", () => {
  const now = Date.UTC(2026, 9, 9)
  const [h, b, s] = appJwt("123", privateKey, now).split(".")
  assert.ok(createVerify("RSA-SHA256").update(`${h}.${b}`).verify(publicKey, Buffer.from(s, "base64url")))
  const claims = JSON.parse(Buffer.from(b, "base64url").toString())
  assert.equal(claims.iss, "123")
  assert.ok(claims.exp - claims.iat <= 600)
})

test("one installation token serves every read until five minutes before it expires, then renews", async () => {
  let t = 0, minted = 0
  const get: Get = async (url) => {
    if (url.endsWith("/installation")) return json({ id: 7 })
    minted++
    return json({ token: `tok${minted}`, expires_at: new Date(t + 60 * 60_000).toISOString() })
  }
  const token = makeToken({ id: "1", key: privateKey, org: "o" }, get, () => t)
  assert.equal(await token(), "tok1")
  t = 54 * 60_000
  assert.equal(await token(), "tok1", "still inside its hour, less five minutes")
  t = 56 * 60_000
  assert.equal(await token(), "tok2", "renewed before it runs out")
})

test("reads at the same moment share one mint, and a failed mint gives null", async () => {
  let calls = 0
  const token = makeToken({ id: "1", key: privateKey, org: "o" }, async (url) => {
    calls++
    return url.endsWith("/installation") ? json({ id: 7 }) : json({ token: "x", expires_at: new Date(Date.now() + 3600_000).toISOString() })
  })
  await Promise.all([token(), token(), token()])
  assert.equal(calls, 2, "one installation lookup and one token, not three of each")
  const broken = makeToken({ id: "1", key: privateKey, org: "o" }, async () => json({ message: "Not Found" }, 404))
  assert.equal(await broken(), null)
})

test("only a body signed with the shared secret counts as GitHub's", () => {
  const body = '{"ref":"refs/heads/main"}'
  const sig = `sha256=${createHmac("sha256", "s3cret").update(body).digest("hex")}`
  assert.equal(signedByGitHub("s3cret", body, sig), true)
  assert.equal(signedByGitHub("s3cret", body + " ", sig), false)
  assert.equal(signedByGitHub("other", body, sig), false)
  assert.equal(signedByGitHub("s3cret", body, null), false)
})
