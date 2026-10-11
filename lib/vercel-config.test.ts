import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

// vercel.json is the platform config Vercel reads before any code runs, so the headers every response carries live there.
type Config = { redirects?: unknown[]; headers?: { source: string; headers: { key: string; value: string }[] }[] }
const config: Config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"))

test("every response carries nosniff, a strict referrer policy, and a frame policy that allows only this site", () => {
  const rule = config.headers?.find((h) => h.source === "/(.*)")
  const got = Object.fromEntries((rule?.headers ?? []).map((h) => [h.key, h.value]))
  assert.equal(got["X-Content-Type-Options"], "nosniff")
  assert.equal(got["Referrer-Policy"], "strict-origin-when-cross-origin")
  assert.equal(got["Content-Security-Policy"], "frame-ancestors 'self'")
})

test("the host redirect the site already had is still the only redirect", () => {
  assert.equal(config.redirects?.length, 1)
})
