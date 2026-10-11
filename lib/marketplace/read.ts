// The Agents Marketplace, read: the catalog (worlds.json on one branch) and each world's orbit, every fact read from
// its own source (GitHub, npm, the MCP registry). The network is one injected function, `get`, so this module imports
// nothing from Next, and node --test runs it against a fake GitHub (lib/marketplace/read.test.ts). lib/marketplace.ts
// wires it to the site: Next's data cache, React's per-request cache and the GitHub key.
//
// - The catalog is read through GitHub's contents API (not raw.githubusercontent.com, whose copies can be five
//   minutes old), under its branch's tag. A push to that branch expires it (app/api/github), so an open page hears
//   the change within about a second (app/(site)/agents/live). A missed webhook still heals within a minute.
// - orbit(entry) turns one entry into its system: the maker at the centre, each piece around it, every fact read
//   from the piece's own source. Those change slowly, so they refresh at most hourly and never hold up the catalog.
//   A source that fails drops only its own facts.

import { makeFacts } from "../facts.ts"
import { failed } from "../failed.ts"
import { makeFresh, type Get } from "../fresh.ts"
import { makeDescriber, type Part } from "./parts.ts"

export type { Part }

const HOUR = 3600
/** A catalog read is kept at most this long: the backstop for a missed webhook. A push expires it at once. */
const CATALOG_REVALIDATE = 60
const MCP_REGISTRY = "https://registry.modelcontextprotocol.io"

/**
 * One branch's catalog, by key: its cache tag (a push expires it) and its bus channel (a push announces on it).
 * The "catalog:" prefix keeps these keys apart from every other tag, so no branch name can equal FACTS_TAG.
 */
export const catalogKey = (ref: string) => `catalog:${ref}`
/** The cache tag of every other source's facts. A push refreshes them behind the page, never in its way. */
export const FACTS_TAG = "marketplace:facts"

/** What the read model takes from its host: the network, GitHub's headers, and the marketplace it reads. */
export type Deps = {
  /** The network: fetch in production, a fake GitHub in a test. */
  get: Get
  /** GitHub's headers, with the app's token when there is one. */
  headers: () => Promise<Record<string, string>>
  /** The marketplace repo, as owner/name. */
  marketplace: string
  /** The branch the catalog is read from, unless a caller names another. */
  ref: string
}

type Pieces = {
  plugin?: { repo: string }
  skills?: { repo: string }
  mcp?: { registry: string }
  cli?: { npm: string; docs: string }
  api?: { docs: string }
}
/** A world as worlds.json records it. */
type WorldRecord = { id: string; name: string; maker: string; for: string; site: string; starsRepo: string; pieces: Pieces }
/** A tool of the toolkit as worlds.json records it. */
type ToolRecord = { id: string; name: string; maker: string; for: string; site: string; starsRepo: string; install: { repo: string; skills: string[] }; cli?: { npm: string; docs: string } }
/** The open standards each kind of piece follows, as the marketplace names them. */
type Specs = Partial<Record<"skills" | "mcp" | "plugin", string>>
type RepoFacts = { slug: string; blurb: string | null; stars: number | null; forks: number | null; license: string | null; avatar: string | null; pushed: string | null; homepage: string | null }
/** What every piece of one world is built with: the maker's name and the open standards its pieces follow. */
type Ctx = { maker: string; specs: Specs }

/** One entry of the catalog: what the catalog says. Its facts come from orbit(). */
export type Entry = {
  /** The core toolkit (the tools every AI needs) or a tool's whole world. */
  part: "toolkit" | "world"
  id: string
  name: string
  maker: string
  for: string
  site: string
  /** The one sentence a person pastes into their AI. */
  sentence: string
  /** The setup steps the AI follows (the skill, on GitHub). */
  setup: string
  starsRepo: string | null
  pieces: Pieces | null
  tools: ToolRecord[] | null
  specs: Specs
}

export type Kind = "maker" | "plugin" | "skills" | "connector" | "cli" | "api" | "tool"
export type Link = { label: string; href: string }
/** One body in a world's orbit, with the facts its own fact source gives right now. */
export type Piece = {
  /** Unique in its world; the address uses it (?world=vercel&piece=skills). */
  id: string
  kind: Kind
  name: string
  /** The fact source's own one-line description, in its makers' words. */
  blurb: string | null
  /** Where it lives: its repo, registry entry or docs. */
  href: string
  repo: { slug: string; stars: number | null; forks: number | null; license: string | null; avatar: string | null } | null
  version: string | null
  /** ISO time of the newest change the fact source reports. */
  updated: string | null
  weekly: number | null
  /** What is inside, counted: 33 skills, 3 agents. */
  contents: { label: string; n: number }[]
  /** Names of what is inside (skill names). */
  items: string[]
  /** What is inside, each described by its makers: the piece's own sub-world. */
  parts: Part[]
  /** What it does for you, in one plain sentence with live numbers. */
  gives: string | null
  /** The AI apps it ships a package for, read from its manifests. */
  works: string[]
  refs: Link[]
}
export type Orbit = { sun: Piece; planets: Piece[] }

/** A world's sentence: the one line a person pastes into their AI to set the piece up. */
const sentence = (marketplace: string, name: string, skill: string) =>
  `Set up ${name} for me. Run \`npx skills add ${marketplace} --skill ${skill}\`, then follow the ${skill} skill.`
const asRepo = (f: RepoFacts): Piece["repo"] => ({ slug: f.slug, stars: f.stars, forks: f.forks, license: f.license, avatar: f.avatar })
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`)
const slugOf = (url: string | undefined) => url?.match(/github\.com[/:]([^/]+\/[^/.#]+)/)?.[1] ?? null
const repoUrl = (slug: string) => `https://github.com/${slug}`
const gitHub = (slug: string): Link => ({ label: "Source on GitHub", href: repoUrl(slug) })
const npmPage = (name: string): Link => ({ label: "Package page", href: `https://www.npmjs.com/package/${name}` })
const spec = (specs: Specs, k: keyof Specs, label: string): Link[] => (specs[k] ? [{ label, href: specs[k] }] : [])
const skillsHow = (specs: Specs) => spec(specs, "skills", "How skills work")

// What a plugin repo ships, read from its file tree: skills, agents, commands, and one manifest per AI app.
const APPS: Record<string, string> = { claude: "Claude", cursor: "Cursor", codex: "Codex", kimi: "Kimi", copilot: "Copilot", gemini: "Gemini", opencode: "OpenCode", windsurf: "Windsurf" }
function inventory(paths: string[]) {
  const under = (dir: string, file: RegExp) => paths.filter((p) => p.startsWith(`${dir}/`) && file.test(p.slice(dir.length + 1)))
  const skills = under("skills", /^[^/]+\/SKILL\.md$/).map((p) => p.split("/")[1])
  const contents = [
    { label: "skills", n: skills.length },
    { label: "agents", n: under("agents", /^[^/]+\.md$/).length },
    { label: "commands", n: under("commands", /^[^/]+\.md$/).length },
  ].filter((c) => c.n > 0)
  const works = paths.map((p) => p.match(/^\.([a-z]+)-plugin\/plugin\.json$/)?.[1]).filter((a): a is string => !!a).map((a) => APPS[a] ?? a)
  return { skills, contents, works, mcp: paths.includes(".mcp.json"), hooks: paths.some((p) => p.startsWith("hooks/")) }
}

const emptyPiece = (s: Pick<Piece, "id" | "kind" | "name" | "href">): Piece =>
  ({ blurb: null, repo: null, version: null, updated: null, weekly: null, contents: [], items: [], parts: [], gives: null, works: [], refs: [], ...s })
const api = (docs: string, maker: string): Piece => ({ ...emptyPiece({ id: "api", kind: "api", name: "Direct access", href: docs }), gives: `Anything else ${maker} can do, your AI can reach directly.`, refs: [{ label: "API reference", href: docs }] })

// Each link is named once: the repo already links itself (owner/name), so a piece's links never repeat
// it or each other, whatever the catalog says.
const linkKey = (href: string) => href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "").toLowerCase()
function dedupeLinks(s: Piece): Piece {
  const seen = new Set(s.repo ? [linkKey(repoUrl(s.repo.slug))] : [])
  return { ...s, refs: s.refs.filter((r) => !seen.has(linkKey(r.href)) && !!seen.add(linkKey(r.href))) }
}

/**
 * The read model over one network. Each call is its own set of caches (the facts, the parts' descriptions, the
 * catalog), so a test that makes one gets a fresh model; production makes one, once, at module load.
 */
export function makeMarketplace({ get, headers, marketplace, ref }: Deps) {
  const MARKETPLACE_REPO = repoUrl(marketplace)
  const fresh = makeFresh(get)
  // Other people's facts: hourly at most, tagged so a push refreshes them behind the page (lib/facts: a failure
  // logs and drops only its own facts; an optional fact that does not exist is quiet).
  const hourly = makeFacts(get, { revalidate: HOUR, tags: [FACTS_TAG] })
  const gh = async (path: string, opts?: { optional?: boolean }) => hourly(`https://api.github.com/${path}`, await headers(), opts)

  const repoFacts = async (slug: string): Promise<RepoFacts> => {
    const r = await gh(`repos/${slug}`)
    const license = r?.license?.spdx_id
    return {
      slug, blurb: r?.description ?? null, stars: r?.stargazers_count ?? null, forks: r?.forks_count ?? null,
      license: license && license !== "NOASSERTION" ? license : null, avatar: r?.owner?.avatar_url ?? null,
      pushed: r?.pushed_at ?? null, homepage: r?.homepage || null,
    }
  }
  /** Every file path in a repo at HEAD, and the tree's hash (one call). */
  const treeOf = async (slug: string): Promise<{ sha: string | null; paths: string[] }> => {
    const t = await gh(`repos/${slug}/git/trees/HEAD?recursive=1`)
    return { sha: t?.sha ?? null, paths: Array.isArray(t?.tree) ? (t.tree as { path: string }[]).map((f) => f.path) : [] }
  }

  // The parts of a repo, each described by its own file. makeDescriber (lib/marketplace/parts.ts) reads them as soon as
  // the tree its caller started is in, beside the repo's other reads, so no read fetches a repo's tree twice. It holds
  // only the newest complete answer per request, and never a failed one. A new commit is a new tree, so its descriptions
  // are read again. The tree itself is as fresh as treeOf: an hour at most, and at once after a push.
  const describeParts = makeDescriber(get, headers, new Map())
  const npm = async (name: string) => {
    const [latest, week] = await Promise.all([hourly(`https://registry.npmjs.org/${name}/latest`), hourly(`https://api.npmjs.org/downloads/point/last-week/${name}`)])
    return { version: (latest?.version as string) ?? null, blurb: (latest?.description as string) ?? null, weekly: (week?.downloads as number) ?? null }
  }

  async function plugin(slug: string, { maker, specs }: Ctx): Promise<Piece> {
    const tree = treeOf(slug)
    const [f, parts, t] = await Promise.all([repoFacts(slug), describeParts(slug, tree, ["agent", "command", "skill"]), tree])
    const paths = t.paths
    const s = inventory(paths)
    const manifest = paths.find((p) => /^\.[a-z]+-plugin\/plugin\.json$/.test(p))
    const m = manifest ? await gh(`repos/${slug}/contents/${manifest}`) : null
    let version: string | null = null
    try { version = m?.content ? JSON.parse(Buffer.from(m.content, "base64").toString("utf8")).version ?? null : null } catch (e) { failed(`${slug} ${manifest}`, e) }
    const extra = [...(s.mcp ? [{ label: "connector", n: 1 }] : []), ...(s.hooks ? [{ label: "hooks", n: 1 }] : [])]
    return { ...emptyPiece({ id: "plugin", kind: "plugin", name: "Add-on", href: repoUrl(slug) }), blurb: f.blurb, repo: asRepo(f), version, updated: f.pushed,
      contents: [...s.contents, ...extra], works: s.works, parts,
      gives: `One install gives your AI everything ${maker} built for it${s.works.length ? `, in ${list(s.works)}` : ""}.`,
      refs: [gitHub(slug), ...(f.homepage ? [{ label: "Docs", href: f.homepage }] : []), ...spec(specs, "plugin", "How add-ons work")] }
  }
  async function skills(slug: string, { maker, specs }: Ctx): Promise<Piece> {
    const tree = treeOf(slug)
    const [f, parts, t] = await Promise.all([repoFacts(slug), describeParts(slug, tree, ["skill"]), tree])
    const s = inventory(t.paths)
    return { ...emptyPiece({ id: "skills", kind: "skills", name: "Skills", href: `${repoUrl(slug)}/tree/HEAD/skills` }), blurb: f.blurb, repo: asRepo(f), updated: f.pushed,
      contents: s.skills.length ? [{ label: "skills", n: s.skills.length }] : [], items: s.skills, parts,
      gives: s.skills.length ? `Your AI knows how to do ${s.skills.length} things the way ${maker} does them.` : null,
      refs: [gitHub(slug), { label: "Skills directory", href: `https://skills.sh/${slug}` }, ...skillsHow(specs)] }
  }
  async function connector(name: string, { maker, specs }: Ctx): Promise<Piece> {
    const entry = `${MCP_REGISTRY}/v0.1/servers/${encodeURIComponent(name)}/versions/latest`
    const d = await hourly(entry)
    const server = d?.server
    const slug = slugOf(server?.repository?.url)
    const f = slug ? await repoFacts(slug) : null
    const remote: string | undefined = server?.remotes?.[0]?.url
    return { ...emptyPiece({ id: "connector", kind: "connector", name: "Account link", href: server?.websiteUrl ?? remote ?? entry }), blurb: server?.description ?? null,
      repo: f && asRepo(f), version: server?.version ?? null, gives: `Your AI can see and change what is in your ${maker} account.`, updated: d?._meta?.["io.modelcontextprotocol.registry/official"]?.updatedAt ?? f?.pushed ?? null,
      refs: [...(remote ? [{ label: "Connection address", href: remote }] : []), { label: "Official listing", href: entry }, ...(slug ? [gitHub(slug)] : []), ...spec(specs, "mcp", "How account links work")] }
  }
  async function cli(name: string, docs: string, { maker }: Ctx): Promise<Piece> {
    const n = await npm(name)
    return { ...emptyPiece({ id: "cli", kind: "cli", name: "Pro tools", href: docs }), blurb: n.blurb, version: n.version, weekly: n.weekly,
      gives: `Your AI can run ${maker} for you, the way its engineers do.`,
      refs: [{ label: "Docs", href: docs }, npmPage(name)] }
  }
  async function tool(t: ToolRecord, { specs }: Ctx): Promise<Piece> {
    const tree = treeOf(t.install.repo)
    const [f, n, release, parts] = await Promise.all([repoFacts(t.starsRepo), t.cli ? npm(t.cli.npm) : null, gh(`repos/${t.starsRepo}/releases/latest`, { optional: true }), describeParts(t.install.repo, tree, ["skill"], t.install.skills)])
    return { ...emptyPiece({ id: t.id, kind: "tool", name: t.name, href: t.site }), blurb: f.blurb ?? t.for, repo: asRepo(f), parts, gives: t.for,
      version: release?.tag_name ?? n?.version ?? null, updated: release?.published_at ?? f.pushed, weekly: n?.weekly ?? null, items: t.install.skills,
      refs: [{ label: new URL(t.site).host, href: t.site }, gitHub(t.starsRepo), ...(t.cli ? [{ label: "Docs", href: t.cli.docs }, npmPage(t.cli.npm)] : []), ...skillsHow(specs)] }
  }

  /** worlds.json on one branch, read through lib/fresh's cache: kept until the backstop or a push to that branch. */
  const catalogFile = async (branch: string) =>
    fresh<{ content?: string; sha?: string }>(`https://api.github.com/repos/${marketplace}/contents/worlds.json?ref=${branch}`, await headers(), { tags: [catalogKey(branch)], revalidate: CATALOG_REVALIDATE })
  /** Which version of the catalog a branch holds right now (its file's git hash); null when unreadable. */
  const catalogVersion = async (branch = ref) => (await catalogFile(branch))?.sha ?? null

  /** The catalog as the data cache holds it (a push to its branch refreshes it); null when it can't be read. */
  const getCatalog = async (): Promise<Entry[] | null> => {
    const file = await catalogFile(ref)
    let d: { toolkit?: { for: string; tools: ToolRecord[] }; worlds?: WorldRecord[]; specs?: Specs } | null
    if (!file) return null // the read failed, and lib/fresh logged it
    const source = `${marketplace} worlds.json`
    try { d = JSON.parse(Buffer.from(file.content ?? "", "base64").toString("utf8")) } catch (e) { return failed(source, e) }
    // A document that is not an object (the JSON null, a bare number) holds no worlds list: it is logged, never thrown.
    if (!Array.isArray(d?.worlds)) return failed(source, "it holds no worlds list")
    const specs = d.specs ?? {}
    const toolkit = d.toolkit
    const kit: Entry[] = toolkit?.tools?.length
      ? [{ part: "toolkit", id: "toolkit", name: "Core toolkit", maker: "Solenix", for: toolkit.for, site: MARKETPLACE_REPO, sentence: sentence(marketplace, "the Solenix core toolkit", "toolkit"), setup: `${MARKETPLACE_REPO}/blob/${ref}/skills/toolkit/SKILL.md`, starsRepo: marketplace, pieces: null, tools: toolkit.tools, specs }]
      : []
    // A world that is not an object is left out and logged: the other worlds still list.
    const worlds = d.worlds.flatMap((w): Entry[] => {
      if (!w || typeof w !== "object") { failed(source, "a world is not an object"); return [] }
      return [{
        part: "world", id: w.id, name: w.name, maker: w.maker, for: w.for, site: w.site, sentence: sentence(marketplace, w.name, w.id),
        setup: `${MARKETPLACE_REPO}/blob/${ref}/skills/${w.id}/SKILL.md`, starsRepo: w.starsRepo, pieces: w.pieces, tools: null, specs,
      }]
    })
    return [...kit, ...worlds]
  }

  /** A world as a system: its maker at the centre, every piece around it, each read live from its own source. */
  const orbit = async (e: Entry): Promise<Orbit> => {
    const ctx: Ctx = { maker: e.maker, specs: e.specs }
    const sunFacts = e.starsRepo ? repoFacts(e.starsRepo) : null
    const planets: Promise<Piece>[] = []
    const p = e.pieces
    if (p?.plugin) planets.push(plugin(p.plugin.repo, ctx))
    if (p?.skills) planets.push(skills(p.skills.repo, ctx))
    if (p?.mcp) planets.push(connector(p.mcp.registry, ctx))
    if (p?.cli) planets.push(cli(p.cli.npm, p.cli.docs, ctx))
    if (p?.api) planets.push(Promise.resolve(api(p.api.docs, e.maker)))
    for (const t of e.tools ?? []) planets.push(tool(t, ctx))
    const [f, planetFacts] = await Promise.all([sunFacts, Promise.all(planets)])
    const site = new URL(e.site)
    const sun: Piece = {
      ...emptyPiece({ id: "maker", kind: "maker", name: e.maker, href: e.site }), blurb: f?.blurb ?? null, repo: f && asRepo(f), updated: f?.pushed ?? null,
      refs: [{ label: site.host + (site.pathname.length > 1 ? site.pathname : ""), href: e.site }, ...(f ? [gitHub(f.slug)] : []), { label: "The steps your AI follows", href: e.setup }],
    }
    return { sun: dedupeLinks(sun), planets: planetFacts.map(dedupeLinks) }
  }

  return { catalogVersion, getCatalog, orbit }
}
