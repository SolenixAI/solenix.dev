// Tests for lib/marketplace/read.ts through its interface, with a fake GitHub (and fake npm and MCP registry) at the
// seam: makeMarketplace({ get, headers, marketplace, ref }). The fake serves example.test hosts, so no real repo is named.
//   node --test lib/marketplace/read.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { makeMarketplace, type Entry } from "./read.ts"

const MARKETPLACE = "example-org/marketplace"
const MAKER = "Example Maker"
const b64 = (s: string) => Buffer.from(s).toString("base64")
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const noHeaders = async () => ({})
const skill = (name: string, description: string) => `---\nname: ${name}\ndescription: ${description}\n---\n# ${name}\n`

type Handler = (url: string, init: RequestInit) => Response
type Route = [string, Handler]

/** A fake network at the seam: a URL is answered by the first route with that exact text; any other URL is a 404. Every request is recorded. */
function fakeWeb(routes: Route[]) {
  const requested: string[] = []
  const get = (url: string, init: RequestInit) => {
    requested.push(url)
    const hit = routes.find(([match]) => match === url)
    return Promise.resolve(hit ? hit[1](url, init) : json({ message: "Not Found" }, 404))
  }
  return { get, requested }
}

const marketOver = (routes: Route[]) => {
  const web = fakeWeb(routes)
  return { market: makeMarketplace({ get: web.get, headers: noHeaders, marketplace: MARKETPLACE, ref: "main" }), web }
}

/** GitHub's answer to the part-file GraphQL request: each aliased file's text at HEAD, null for a file that is not there. */
function graphqlAnswer(query: string, files: Record<string, string>): Response {
  const repository: Record<string, { text: string } | null> = {}
  for (const m of query.matchAll(/(f\d+): object\(expression: ("(?:[^"\\]|\\.)*")\)/g)) {
    const path = (JSON.parse(m[2]) as string).replace(/^HEAD:/, "")
    repository[m[1]] = Object.hasOwn(files, path) ? { text: files[path] } : null
  }
  return json({ data: { repository } })
}

const graphql = (files: Record<string, string>): Route => [
  "https://api.github.com/graphql",
  (_url, init) => graphqlAnswer((JSON.parse(String(init.body)) as { query: string }).query, files),
]
const repo = (slug: string, body: unknown): Route => [`https://api.github.com/repos/${slug}`, () => json(body)]
const tree = (slug: string, paths: string[]): Route => [
  `https://api.github.com/repos/${slug}/git/trees/HEAD?recursive=1`,
  () => json({ sha: `tree-of-${slug}`, tree: paths.map((path) => ({ path })) }),
]
const npm = (name: string, { version, description, downloads }: { version: string; description: string; downloads: number }): Route[] => [
  [`https://registry.npmjs.org/${name}/latest`, () => json({ version, description })],
  [`https://api.npmjs.org/downloads/point/last-week/${name}`, () => json({ downloads })],
]
/** The catalog file on one branch: worlds.json as GitHub's contents API gives it. */
const catalogAt = (ref: string, catalog: unknown): Route => [
  `https://api.github.com/repos/${MARKETPLACE}/contents/worlds.json?ref=${ref}`,
  () => json({ sha: `sha-${ref}`, content: b64(JSON.stringify(catalog)) }),
]

const world = (id: string, name: string) => ({ id, name, maker: name, for: "Hosting", site: `https://${id}.example.test`, starsRepo: `example-org/${id}`, pieces: {} })
const toolSource = (id: string) => ({
  id, name: "Example tool", maker: MAKER, for: "Does one thing", site: `https://${id}.example.test`, starsRepo: `example-org/${id}`,
  install: { repo: `example-org/${id}`, skills: [id] },
})
/** A world's entry as the catalog gives it; orbit() reads its pieces. */
const makerEntry = (overrides: Partial<Entry> = {}): Entry => ({
  part: "world", id: "maker-world", name: MAKER, maker: MAKER, for: "Small businesses", site: "https://maker.example.test",
  sentence: "", setup: "https://example.test/setup", starsRepo: "example-org/maker-repo", pieces: {}, tools: null, specs: {}, ...overrides,
})

test("the catalog lists the core toolkit first, then each world in the order worlds.json gives", async () => {
  const { market } = marketOver([catalogAt("main", { toolkit: { for: "Every small business", tools: [toolSource("example-tool")] }, worlds: [world("vercel", "Vercel")], specs: {} })])
  const entries = await market.getCatalog()
  assert.deepEqual(entries?.map((e) => [e.part, e.id, e.name]), [["toolkit", "toolkit", "Core toolkit"], ["world", "vercel", "Vercel"]])
  assert.equal(entries?.[1].setup, `https://github.com/${MARKETPLACE}/blob/main/skills/vercel/SKILL.md`)
  assert.equal(entries?.[1].sentence, `Set up Vercel for me. Run \`npx skills add ${MARKETPLACE} --skill vercel\`, then follow the vercel skill.`)
})

test("a toolkit that lists no tools has no core toolkit entry, and its worlds still list", async () => {
  const { market } = marketOver([catalogAt("main", { toolkit: { for: "Every small business", tools: [] }, worlds: [world("vercel", "Vercel")], specs: {} })])
  assert.deepEqual((await market.getCatalog())?.map((e) => e.id), ["vercel"])
})

test("a catalog with no worlds list gives null and one log line that names it", async (t) => {
  const warn = t.mock.method(console, "warn", () => {})
  const { market } = marketOver([catalogAt("main", { toolkit: { for: "x", tools: [] } })])
  assert.equal(await market.getCatalog(), null)
  assert.equal(warn.mock.callCount(), 1)
  assert.match(String(warn.mock.calls[0].arguments[0]), /worlds\.json · it holds no worlds list/)
})

test("a catalog that is the JSON null gives null and one log line, never a throw", async (t) => {
  const warn = t.mock.method(console, "warn", () => {})
  const { market } = marketOver([catalogAt("main", null)])
  assert.equal(await market.getCatalog(), null, "a document that is not an object holds no worlds list")
  assert.equal(warn.mock.callCount(), 1)
  assert.match(String(warn.mock.calls[0].arguments[0]), /worlds\.json · it holds no worlds list/)
})

test("a world that is not an object is left out with one log line, and the other worlds still list", async (t) => {
  const warn = t.mock.method(console, "warn", () => {})
  const { market } = marketOver([catalogAt("main", { worlds: [null, world("vercel", "Vercel")] })])
  assert.deepEqual((await market.getCatalog())?.map((e) => e.id), ["vercel"], "one bad entry does not take the catalog down")
  assert.equal(warn.mock.callCount(), 1)
  assert.match(String(warn.mock.calls[0].arguments[0]), /worlds\.json · a world is not an object/)
})

test("a catalog that is not JSON gives null and one log line that names the file", async (t) => {
  const warn = t.mock.method(console, "warn", () => {})
  const { market } = marketOver([[`https://api.github.com/repos/${MARKETPLACE}/contents/worlds.json?ref=main`, () => json({ sha: "sha-main", content: b64("<!doctype html>") })]])
  assert.equal(await market.getCatalog(), null)
  assert.equal(warn.mock.callCount(), 1)
  assert.match(String(warn.mock.calls[0].arguments[0]), /worlds\.json/)
})

test("a catalog that cannot be read gives null, and the log line names the status", async (t) => {
  const warn = t.mock.method(console, "warn", () => {})
  const { market } = marketOver([[`https://api.github.com/repos/${MARKETPLACE}/contents/worlds.json?ref=main`, () => json({ message: "rate limited" }, 403)]])
  assert.equal(await market.getCatalog(), null)
  assert.equal(warn.mock.callCount(), 1)
  assert.match(String(warn.mock.calls[0].arguments[0]), /HTTP 403/)
})

test("catalogVersion is the catalog file's hash on that branch; a branch that cannot be read gives null and one log line", async (t) => {
  const warn = t.mock.method(console, "warn", () => {})
  const { market } = marketOver([catalogAt("main", { worlds: [] }), catalogAt("feature", { worlds: [] })])
  assert.equal(await market.catalogVersion(), "sha-main")
  assert.equal(await market.catalogVersion("feature"), "sha-feature")
  assert.equal(await market.catalogVersion("gone"), null)
  assert.equal(warn.mock.callCount(), 1, "only the missing branch is a failed read")
})

const makerRoutes: Route[] = [
  repo("example-org/maker-repo", { description: "The maker", stargazers_count: 10, forks_count: 2, license: { spdx_id: "MIT" }, owner: { avatar_url: "https://avatars.example.test/maker.png" }, pushed_at: "2026-10-01T00:00:00Z", homepage: null }),
  repo("example-org/skills-repo", { description: "Skills for the maker", stargazers_count: 3, forks_count: 1, license: { spdx_id: "NOASSERTION" }, owner: { avatar_url: null }, pushed_at: "2026-09-30T00:00:00Z", homepage: null }),
  tree("example-org/skills-repo", ["skills/fetch/SKILL.md", "skills/search/SKILL.md"]),
  graphql({ "skills/fetch/SKILL.md": skill("Fetch", "Get a web page"), "skills/search/SKILL.md": skill("Search", "Find a page") }),
  ...npm("example-cli", { version: "1.4.0", description: "The CLI", downloads: 500 }),
]
const makerPieces = makerEntry({ pieces: { skills: { repo: "example-org/skills-repo" }, cli: { npm: "example-cli", docs: "https://docs.example.test/cli" } } })

test("orbit: the maker is the centre, each piece a planet in the fixed order, and a repo is named only by its own source", async () => {
  const { market } = marketOver(makerRoutes)
  const orbit = await market.orbit(makerPieces)
  assert.equal(orbit.sun.id, "maker")
  assert.equal(orbit.sun.blurb, "The maker")
  assert.deepEqual(orbit.planets.map((p) => p.id), ["skills", "cli"])
  assert.deepEqual(orbit.sun.refs.map((r) => r.label), ["maker.example.test", "The steps your AI follows"], "the maker's repo links itself, so it is not named again")
  const skills = orbit.planets[0]
  assert.equal(skills.href, "https://github.com/example-org/skills-repo/tree/HEAD/skills")
  assert.deepEqual(skills.items, ["fetch", "search"])
  assert.deepEqual(skills.parts.map((p) => p.name), ["Fetch", "Search"])
  assert.equal(skills.gives, `Your AI knows how to do 2 things the way ${MAKER} does them.`)
  assert.deepEqual(skills.refs.map((r) => r.label), ["Skills directory"], "the piece's repo is not named again")
  assert.equal(skills.repo?.license, null, "NOASSERTION is no licence")
  const cli = orbit.planets[1]
  assert.equal(cli.name, "Runs on your computer")
  assert.equal(cli.version, "1.4.0")
  assert.equal(cli.weekly, 500)
  assert.deepEqual(cli.refs.map((r) => r.label), ["Docs", "Package page"])
})

test("a fact that fails drops only its own: the other facts stay, and one log line names the failed read", async (t) => {
  const warn = t.mock.method(console, "warn", () => {})
  const { market } = marketOver([[`https://api.github.com/repos/example-org/skills-repo`, () => json({ message: "boom" }, 500)], ...makerRoutes])
  const orbit = await market.orbit(makerPieces)
  assert.equal(orbit.sun.blurb, "The maker", "the maker's facts are its own")
  assert.equal(orbit.planets[0].blurb, null, "the failed repo drops its own description")
  assert.equal(orbit.planets[0].parts.length, 2, "the part files are read from the tree, not the repo")
  assert.equal(orbit.planets[1].version, "1.4.0", "the npm facts are unaffected")
  assert.equal(warn.mock.callCount(), 1)
  assert.match(String(warn.mock.calls[0].arguments[0]), /example-org\/skills-repo.*HTTP 500/)
})

test("a plugin reads its version from its manifest, counts its contents from its tree, and names the AI apps it ships for", async () => {
  const { market } = marketOver([
    repo("example-org/plugin-repo", { description: "The plugin", stargazers_count: 1, forks_count: 0, license: null, owner: { avatar_url: null }, pushed_at: "2026-10-02T00:00:00Z", homepage: "https://plugin.example.test/docs" }),
    tree("example-org/plugin-repo", [".claude-plugin/plugin.json", ".cursor-plugin/plugin.json", "agents/reviewer.md", "commands/ship.md", ".mcp.json", "hooks/pre-commit.sh"]),
    ["https://api.github.com/repos/example-org/plugin-repo/contents/.claude-plugin/plugin.json", () => json({ content: b64('{"version":"2.0.0"}') })],
    graphql({ "agents/reviewer.md": skill("reviewer", "Reviews code"), "commands/ship.md": "---\ndescription: Ships the change\n---\n" }),
  ])
  const orbit = await market.orbit(makerEntry({ pieces: { plugin: { repo: "example-org/plugin-repo" } } }))
  const plugin = orbit.planets[0]
  assert.equal(plugin.version, "2.0.0")
  assert.deepEqual(plugin.contents, [{ label: "agents", n: 1 }, { label: "commands", n: 1 }, { label: "connector", n: 1 }, { label: "hooks", n: 1 }])
  assert.deepEqual(plugin.works, ["Claude", "Cursor"])
  assert.equal(plugin.gives, `One install gives your AI everything ${MAKER} built for it.`)
  assert.deepEqual(plugin.parts.map((p) => [p.kind, p.name]), [["agent", "Reviewer"], ["command", "Ship"]])
  assert.deepEqual(plugin.refs, [{ label: "Docs", href: "https://plugin.example.test/docs" }], "the repo's own link is not repeated")
})

test("a tool's version is its latest release; with no release it is the npm version, and a repo with no release logs nothing", async (t) => {
  const warn = t.mock.method(console, "warn", () => {})
  const toolRoutes: Route[] = [
    repo("example-org/example-tool", { description: "The tool", stargazers_count: 4, forks_count: 0, license: null, owner: { avatar_url: null }, pushed_at: "2026-10-03T00:00:00Z", homepage: null }),
    tree("example-org/example-tool", ["skills/example-tool/SKILL.md"]),
    graphql({ "skills/example-tool/SKILL.md": skill("Example tool", "Does one thing") }),
    ...npm("example-cli", { version: "1.4.0", description: "The CLI", downloads: 500 }),
  ]
  const tool = { ...toolSource("example-tool"), cli: { npm: "example-cli", docs: "https://docs.example.test/cli" } }
  const entry = makerEntry({ starsRepo: null, tools: [tool] }) // no maker repo here: only the tool's own reads are in play
  const noRelease = await marketOver(toolRoutes).market.orbit(entry)
  assert.equal(noRelease.planets[0].kind, "tool")
  assert.equal(noRelease.planets[0].gives, "Does one thing")
  assert.equal(noRelease.planets[0].version, "1.4.0", "the npm version, when the repo has no release")
  assert.equal(warn.mock.callCount(), 0, "a repo with no release is an absent fact, not a failed read")
  const released = await marketOver([...toolRoutes, ["https://api.github.com/repos/example-org/example-tool/releases/latest", () => json({ tag_name: "v3.1.0", published_at: "2026-10-04T00:00:00Z" })]]).market.orbit(entry)
  assert.equal(released.planets[0].version, "v3.1.0", "the latest release wins over npm")
})
