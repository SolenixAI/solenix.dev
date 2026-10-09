import { createHmac, createSign, timingSafeEqual } from "node:crypto"
import { fresh } from "./fresh.ts"

/**
 * GitHub, as SolenixAI: the org's own GitHub App, one app for everything Solenix builds, installed
 * on the org. The app signs a short JWT with its private key, trades it for an installation token that
 * lasts an hour, and renews it before it runs out: 5,000 reads an hour, free 304s, tied to no
 * person. Set up once with `node scripts/github-app.ts`. Without the app's keys it falls back to
 * GITHUB_TOKEN, then to no key at all (60 reads an hour).
 */
export type Get = (url: string, init: RequestInit) => Promise<Response>
type App = { id: string; key: string; org: string }
const API = "https://api.github.com"
const BASE = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" }

const b64url = (s: string | Buffer) => Buffer.from(s).toString("base64url")
/** A GitHub App JWT: valid from a minute ago (clock drift) for nine minutes (GitHub allows ten). */
export function appJwt(id: string, key: string, now = Date.now()) {
  const t = Math.floor(now / 1000)
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const body = b64url(JSON.stringify({ iat: t - 60, exp: t + 540, iss: id }))
  const sig = createSign("RSA-SHA256").update(`${head}.${body}`).sign(key)
  return `${head}.${body}.${b64url(sig)}`
}

/** The app's installation token, renewed five minutes before it expires; null when it can't get one. */
export function makeToken(app: App, get: Get, now = () => Date.now()) {
  let held: { token: string; until: number } | null = null
  let pending: Promise<string | null> | null = null
  const mint = async () => {
    const auth = { ...BASE, authorization: `Bearer ${appJwt(app.id, app.key, now())}` }
    const inst = await get(`${API}/orgs/${app.org}/installation`, { headers: auth, cache: "no-store" })
    if (!inst.ok) return null
    const { id } = (await inst.json()) as { id: number }
    const res = await get(`${API}/app/installations/${id}/access_tokens`, { method: "POST", headers: auth, cache: "no-store" })
    if (!res.ok) return null
    const { token, expires_at } = (await res.json()) as { token: string; expires_at: string }
    held = { token, until: Date.parse(expires_at) - 5 * 60_000 }
    return token
  }
  return async (): Promise<string | null> => {
    if (held && now() < held.until) return held.token
    pending ??= mint().catch(() => null).finally(() => { pending = null })
    return pending
  }
}

const env = process.env
const app = env.GITHUB_APP_ID && env.GITHUB_APP_PRIVATE_KEY
  ? makeToken({ id: env.GITHUB_APP_ID, key: env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n"), org: "SolenixAI" }, (u, i) => fetch(u, i))
  : null

/** The headers every GitHub read carries: the API version, and the best key the site has. */
export async function githubHeaders(): Promise<Record<string, string>> {
  const token = (app && (await app())) || env.GITHUB_TOKEN
  return token ? { ...BASE, authorization: `Bearer ${token}` } : BASE
}

/** A live GitHub read (lib/fresh: asks every time; an unchanged answer is a free 304 with a key). */
export const github = async <T = unknown>(path: string) => fresh<T>(`${API}/${path}`, await githubHeaders())

/** Whether a webhook body really came from GitHub: its HMAC-SHA256 under the shared secret. */
export function signedByGitHub(secret: string, body: string, signature: string | null) {
  const want = Buffer.from(`sha256=${createHmac("sha256", secret).update(body).digest("hex")}`)
  const got = Buffer.from(signature ?? "")
  return got.length === want.length && timingSafeEqual(got, want)
}
