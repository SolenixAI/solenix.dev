// One-time setup of SolenixAI, the org's own GitHub App, the native way (GitHub's App Manifest flow).
// One app for everything Solenix builds: install it on the org once, add permissions as new uses need them.
//   node scripts/github-app.ts            (--no-open: don't open a browser; visit the address yourself)
// 1. Opens a local page; you click Create, and GitHub makes the app from the manifest below.
// 2. GitHub hands back a one-hour code; this trades it for the app's id, private key and webhook
//    secret, and stores them straight into Vercel (production and preview, as sensitive values)
//    and .env.local (this machine). They are never printed.
// 3. Opens GitHub's install page: install it on the SolenixAI org.
import { spawnSync } from "node:child_process"
import { randomBytes } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { createServer } from "node:http"

const PORT = 8799
const ORG = "SolenixAI"
const SITE = "https://solenix.dev"
const state = randomBytes(16).toString("hex")
const manifest = {
  name: "Solenix",
  url: SITE,
  description: "Solenix's own GitHub App: how Solenix's sites and agents read and react to its repositories.",
  hook_attributes: { url: `${SITE}/api/github`, active: true },
  redirect_url: `http://127.0.0.1:${PORT}/done`,
  public: false,
  default_permissions: { contents: "read", metadata: "read" },
  default_events: ["push"],
}

const page = (body: string) => `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Solenix GitHub App</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0d12;color:#f4f2ee;font:16px/1.5 ui-sans-serif,system-ui}main{max-width:30rem;padding:24px}h1{font-size:1.6rem;margin:0 0 8px}p{color:#a39e97}button,a.b{display:inline-block;margin-top:16px;padding:12px 22px;border:0;border-radius:999px;background:#f59e0b;color:#1a1206;font-weight:600;font-size:1rem;cursor:pointer;text-decoration:none}</style><main>${body}</main>`
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")

/** Store one secret in Vercel (production and preview) by stdin, so it never appears on screen. */
function toVercel(name: string, value: string) {
  for (const target of ["production", "preview"]) {
    const r = spawnSync("vercel", ["env", "add", name, target, "--sensitive", "--force", "--yes"], { input: value, stdio: ["pipe", "ignore", "pipe"] })
    if (r.status !== 0) throw new Error(`vercel env add ${name} ${target} failed: ${r.stderr.toString().trim().split("\n").pop()}`)
  }
}
/** Store the secrets in .env.local, replacing any earlier copies. */
function toEnvLocal(vars: Record<string, string>) {
  const file = ".env.local"
  const keep = (existsSync(file) ? readFileSync(file, "utf8") : "").split("\n").filter((l) => !Object.keys(vars).some((k) => l.startsWith(`${k}=`)))
  const add = Object.entries(vars).map(([k, v]) => `${k}="${v.replace(/\n/g, "\\n")}"`)
  writeFileSync(file, [...keep.filter((l, i, a) => l || i < a.length - 1), "", "# SolenixAI, the org's GitHub App (scripts/github-app.ts)", ...add, ""].join("\n"), { mode: 0o600 })
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`)
  if (url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html" }).end(page(`<h1>Create Solenix, the org's GitHub App</h1>
<p>One app for everything Solenix builds. It starts able to read repositories and hear pushes, nothing else; add permissions when a new use needs them. GitHub shows you everything before you confirm.</p>
<form method="post" action="https://github.com/organizations/${ORG}/settings/apps/new?state=${state}"><input type="hidden" name="manifest" value="${esc(JSON.stringify(manifest))}"><button>Create on GitHub</button></form>`))
    return
  }
  if (url.pathname !== "/done") return void res.writeHead(404).end()
  const code = url.searchParams.get("code")
  if (!code || url.searchParams.get("state") !== state) return void res.writeHead(400).end(page("<h1>That link didn't come from this setup.</h1><p>Run the command again.</p>"))
  try {
    const r = await fetch(`https://api.github.com/app-manifests/${code}/conversions`, { method: "POST", headers: { accept: "application/vnd.github+json" } })
    if (!r.ok) throw new Error(`GitHub answered ${r.status} to the code exchange`)
    const app = (await r.json()) as { id: number; slug: string; html_url: string; pem: string; webhook_secret: string }
    const vars = { GITHUB_APP_ID: String(app.id), GITHUB_APP_PRIVATE_KEY: app.pem, GITHUB_WEBHOOK_SECRET: app.webhook_secret }
    for (const [k, v] of Object.entries(vars)) toVercel(k, v)
    toEnvLocal(vars)
    const install = `${app.html_url}/installations/new`
    res.writeHead(302, { location: install }).end()
    console.log(`github-app: created ${app.slug} (id ${app.id}); keys stored in Vercel (production, preview) and .env.local.`)
    console.log(`github-app: last step, in the page that opened: install it on the ${ORG} org.`)
  } catch (e) {
    res.writeHead(500).end(page(`<h1>Setup stopped.</h1><p>${esc(String((e as Error).message))}</p>`))
    console.error(`github-app: ${(e as Error).message}`)
    process.exitCode = 1
  }
  server.close()
})

server.listen(PORT, "127.0.0.1", () => {
  console.log(`github-app: opening http://127.0.0.1:${PORT} — click Create on GitHub.`)
  if (!process.argv.includes("--no-open")) spawnSync("open", [`http://127.0.0.1:${PORT}`])
})
