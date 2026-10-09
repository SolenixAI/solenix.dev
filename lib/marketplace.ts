import "server-only"
import { cache } from "react"
import { github, githubHeaders } from "@/lib/github"

/**
 * The Agents Marketplace: the core toolkit and the worlds Solenix stands behind.
 * - The catalog (worlds.json in SolenixAI/agents-marketplace) is read live on every visit through
 *   lib/fresh: a change there shows on the next page load. It is read through GitHub's contents API,
 *   not raw.githubusercontent.com, whose copies can be five minutes old.
 * - orbit(entry) turns one entry into its system: the maker at the centre, each piece around it, every
 *   fact read from the piece's own source (GitHub, the MCP registry, npm). Those change slowly, so
 *   they refresh at most hourly and never hold up the catalog. A source that fails drops only its facts.
 */
export const MARKETPLACE_SLUG = "SolenixAI/agents-marketplace"
export const MARKETPLACE_REPO = `https://github.com/${MARKETPLACE_SLUG}`
// The branch the page reads. main in production; a preview can point at a branch under review.
export const MARKETPLACE_REF = process.env.MARKETPLACE_REF ?? "main"
const REF = MARKETPLACE_REF
const HOUR = 3600
const MCP_REGISTRY = "https://registry.modelcontextprotocol.io"

export type Pieces = {
  plugin?: { repo: string }
  skills?: { repo: string }
  mcp?: { registry: string }
  cli?: { npm: string; docs: string }
  api?: { docs: string }
}
type WorldSource = { id: string; name: string; maker: string; for: string; site: string; starsRepo: string; pieces: Pieces }
type ToolSource = { id: string; name: string; maker: string; for: string; site: string; starsRepo: string; install: { repo: string; skills: string[] }; cli?: { npm: string; docs: string } }
/** The open standards each kind of piece follows, as the marketplace names them. */
type Specs = Partial<Record<"skills" | "mcp" | "plugin", string>>

/** One card: what the catalog says. Its live facts come from orbit(). */
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
  tools: ToolSource[] | null
  specs: Specs
}

export type Kind = "maker" | "plugin" | "skills" | "connector" | "cli" | "api" | "tool"
export type Link = { label: string; href: string }
/** One body in a world's orbit, with everything its own source says about it right now. */
export type Source = {
  /** Unique in its world; the address uses it (?world=vercel&piece=skills). */
  id: string
  kind: Kind
  name: string
  /** The source's own one-line description, in its makers' words. */
  blurb: string | null
  /** Where it lives: its repo, registry entry or docs. */
  href: string
  repo: { slug: string; stars: number | null; forks: number | null; license: string | null; avatar: string | null } | null
  version: string | null
  /** ISO time of the newest change the source reports. */
  updated: string | null
  weekly: number | null
  /** What is inside, counted: 33 skills, 3 agents. */
  contents: { label: string; n: number }[]
  /** Names of what is inside (skill names). */
  items: string[]
  /** The AI apps it ships a package for, read from its manifests. */
  works: string[]
  refs: Link[]
}
export type Orbit = { sun: Source; planets: Source[] }

const sentence = (name: string, skill: string) =>
  `Set up ${name} for me. Run \`npx skills add ${MARKETPLACE_SLUG} --skill ${skill}\`, then follow the ${skill} skill.`

const catalogFile = (ref: string) => github<{ content?: string; sha?: string }>(`repos/${MARKETPLACE_SLUG}/contents/worlds.json?ref=${ref}`)
/** Which version of the catalog a branch holds right now (its file's git hash); null when unreadable. */
export const catalogVersion = async (ref = REF) => (await catalogFile(ref))?.sha ?? null

/** The catalog as it is right now; null when it can't be read. */
export async function getCatalog(): Promise<Entry[] | null> {
  const file = await catalogFile(REF)
  let d: { toolkit?: { for: string; tools: ToolSource[] }; worlds?: WorldSource[]; specs?: Specs }
  try { d = JSON.parse(Buffer.from(file?.content ?? "", "base64").toString("utf8")) } catch { return null }
  if (!Array.isArray(d.worlds)) return null
  const specs = d.specs ?? {}
  const toolkit = d.toolkit
  const kit: Entry[] = toolkit?.tools?.length
    ? [{ part: "toolkit", id: "toolkit", name: "Core toolkit", maker: "Solenix", for: toolkit.for, site: MARKETPLACE_REPO, sentence: sentence("the Solenix core toolkit", "toolkit"), setup: `${MARKETPLACE_REPO}/blob/${REF}/skills/toolkit/SKILL.md`, starsRepo: MARKETPLACE_SLUG, pieces: null, tools: toolkit.tools, specs }]
    : []
  const worlds: Entry[] = d.worlds.map((w) => ({
    part: "world", id: w.id, name: w.name, maker: w.maker, for: w.for, site: w.site, sentence: sentence(w.name, w.id),
    setup: `${MARKETPLACE_REPO}/blob/${REF}/skills/${w.id}/SKILL.md`, starsRepo: w.starsRepo, pieces: w.pieces, tools: null, specs,
  }))
  return [...kit, ...worlds]
}

// Other people's facts: hourly at most, never in the catalog's way.
const hourly = (url: string, headers: Record<string, string> = {}) =>
  fetch(url, { headers, next: { revalidate: HOUR } }).then((r) => (r.ok ? r.json() : null), () => null)
const gh = async (path: string) => hourly(`https://api.github.com/${path}`, await githubHeaders())

type RepoFacts = { slug: string; blurb: string | null; stars: number | null; forks: number | null; license: string | null; avatar: string | null; pushed: string | null; homepage: string | null }
const repoFacts = async (slug: string): Promise<RepoFacts> => {
  const r = await gh(`repos/${slug}`)
  const license = r?.license?.spdx_id
  return {
    slug, blurb: r?.description ?? null, stars: r?.stargazers_count ?? null, forks: r?.forks_count ?? null,
    license: license && license !== "NOASSERTION" ? license : null, avatar: r?.owner?.avatar_url ?? null,
    pushed: r?.pushed_at ?? null, homepage: r?.homepage || null,
  }
}
const asRepo = (f: RepoFacts): Source["repo"] => ({ slug: f.slug, stars: f.stars, forks: f.forks, license: f.license, avatar: f.avatar })
/** Every file path in a repo at HEAD (one call). */
const tree = async (slug: string): Promise<string[]> => {
  const t = await gh(`repos/${slug}/git/trees/HEAD?recursive=1`)
  return Array.isArray(t?.tree) ? (t.tree as { path: string }[]).map((f) => f.path) : []
}
const npm = async (name: string) => {
  const [latest, week] = await Promise.all([hourly(`https://registry.npmjs.org/${name}/latest`), hourly(`https://api.npmjs.org/downloads/point/last-week/${name}`)])
  return { version: (latest?.version as string) ?? null, blurb: (latest?.description as string) ?? null, weekly: (week?.downloads as number) ?? null }
}
const slugOf = (url: string | undefined) => url?.match(/github\.com[/:]([^/]+\/[^/.#]+)/)?.[1] ?? null
const gitHub = (slug: string): Link => ({ label: "Source on GitHub", href: `https://github.com/${slug}` })
const npmPage = (name: string): Link => ({ label: "npm", href: `https://www.npmjs.com/package/${name}` })
const spec = (specs: Specs, k: keyof Specs, label: string): Link[] => (specs[k] ? [{ label, href: specs[k] }] : [])

// What a plugin repo ships, read from its file tree: skills, agents, commands, and one manifest per AI app.
const APPS: Record<string, string> = { claude: "Claude", cursor: "Cursor", codex: "Codex", kimi: "Kimi", copilot: "Copilot", gemini: "Gemini", opencode: "OpenCode", windsurf: "Windsurf" }
function shape(paths: string[]) {
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

const blank = (s: Pick<Source, "id" | "kind" | "name" | "href">): Source =>
  ({ blurb: null, repo: null, version: null, updated: null, weekly: null, contents: [], items: [], works: [], refs: [], ...s })

async function plugin(slug: string, specs: Specs): Promise<Source> {
  const [f, paths] = await Promise.all([repoFacts(slug), tree(slug)])
  const s = shape(paths)
  const manifest = paths.find((p) => /^\.[a-z]+-plugin\/plugin\.json$/.test(p))
  const m = manifest ? await gh(`repos/${slug}/contents/${manifest}`) : null
  let version: string | null = null
  try { version = m?.content ? JSON.parse(Buffer.from(m.content, "base64").toString("utf8")).version ?? null : null } catch {}
  const extra = [...(s.mcp ? [{ label: "connector", n: 1 }] : []), ...(s.hooks ? [{ label: "hooks", n: 1 }] : [])]
  return { ...blank({ id: "plugin", kind: "plugin", name: "Plugin", href: `https://github.com/${slug}` }), blurb: f.blurb, repo: asRepo(f), version, updated: f.pushed,
    contents: [...s.contents, ...extra], works: s.works,
    refs: [gitHub(slug), ...(f.homepage ? [{ label: "Docs", href: f.homepage }] : []), ...spec(specs, "plugin", "Agent Plugins spec")] }
}
async function skills(slug: string, specs: Specs): Promise<Source> {
  const [f, paths] = await Promise.all([repoFacts(slug), tree(slug)])
  const s = shape(paths)
  return { ...blank({ id: "skills", kind: "skills", name: "Skills", href: `https://github.com/${slug}/tree/HEAD/skills` }), blurb: f.blurb, repo: asRepo(f), updated: f.pushed,
    contents: s.skills.length ? [{ label: "skills", n: s.skills.length }] : [], items: s.skills,
    refs: [gitHub(slug), { label: "skills.sh", href: `https://skills.sh/${slug}` }, ...spec(specs, "skills", "Agent Skills spec")] }
}
async function connector(name: string, specs: Specs): Promise<Source> {
  const entry = `${MCP_REGISTRY}/v0.1/servers/${encodeURIComponent(name)}/versions/latest`
  const d = await hourly(entry)
  const server = d?.server
  const slug = slugOf(server?.repository?.url)
  const f = slug ? await repoFacts(slug) : null
  const remote: string | undefined = server?.remotes?.[0]?.url
  return { ...blank({ id: "connector", kind: "connector", name: "Connector", href: server?.websiteUrl ?? remote ?? entry }), blurb: server?.description ?? null,
    repo: f && asRepo(f), version: server?.version ?? null, updated: d?._meta?.["io.modelcontextprotocol.registry/official"]?.updatedAt ?? f?.pushed ?? null,
    refs: [...(remote ? [{ label: remote.replace(/^https:\/\//, ""), href: remote }] : []), { label: "MCP registry entry", href: entry }, ...(slug ? [gitHub(slug)] : []), ...spec(specs, "mcp", "MCP spec")] }
}
async function cli(name: string, docs: string): Promise<Source> {
  const n = await npm(name)
  return { ...blank({ id: "cli", kind: "cli", name: "Command line", href: docs }), blurb: n.blurb, version: n.version, weekly: n.weekly,
    items: [`npm i -g ${name}`], refs: [{ label: "Docs", href: docs }, npmPage(name)] }
}
const api = (docs: string): Source => ({ ...blank({ id: "api", kind: "api", name: "API", href: docs }), blurb: "Everything else, for what the other pieces don't cover.", refs: [{ label: "API reference", href: docs }] })

async function tool(t: ToolSource, specs: Specs): Promise<Source> {
  const [f, n, release] = await Promise.all([repoFacts(t.starsRepo), t.cli ? npm(t.cli.npm) : null, gh(`repos/${t.starsRepo}/releases/latest`)])
  return { ...blank({ id: t.id, kind: "tool", name: t.name, href: t.site }), blurb: f.blurb ?? t.for, repo: asRepo(f),
    version: release?.tag_name ?? n?.version ?? null, updated: release?.published_at ?? f.pushed, weekly: n?.weekly ?? null, items: t.install.skills,
    refs: [{ label: new URL(t.site).host, href: t.site }, gitHub(t.starsRepo), ...(t.cli ? [{ label: "Docs", href: t.cli.docs }, npmPage(t.cli.npm)] : []), ...spec(specs, "skills", "Agent Skills spec")] }
}

// Each source is named once: the repo already links itself (owner/name), so its links never repeat
// it or each other, whatever the catalog says.
const key = (href: string) => href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "").toLowerCase()
function once(s: Source): Source {
  const seen = new Set(s.repo ? [key(`https://github.com/${s.repo.slug}`)] : [])
  return { ...s, refs: s.refs.filter((r) => !seen.has(key(r.href)) && !!seen.add(key(r.href))) }
}

/** A world as a system: its maker at the centre, every piece around it, each read live from its own source. */
export const orbit = cache(async (e: Entry): Promise<Orbit> => {
  const sunFacts = e.starsRepo ? repoFacts(e.starsRepo) : null
  const planets: Promise<Source>[] = []
  const p = e.pieces
  if (p?.plugin) planets.push(plugin(p.plugin.repo, e.specs))
  if (p?.skills) planets.push(skills(p.skills.repo, e.specs))
  if (p?.mcp) planets.push(connector(p.mcp.registry, e.specs))
  if (p?.cli) planets.push(cli(p.cli.npm, p.cli.docs))
  if (p?.api) planets.push(Promise.resolve(api(p.api.docs)))
  for (const t of e.tools ?? []) planets.push(tool(t, e.specs))
  const [f, list] = await Promise.all([sunFacts, Promise.all(planets)])
  const sun: Source = {
    ...blank({ id: "maker", kind: "maker", name: e.maker, href: e.site }), blurb: f?.blurb ?? null, repo: f && asRepo(f), updated: f?.pushed ?? null,
    refs: [{ label: new URL(e.site).host + (new URL(e.site).pathname.length > 1 ? new URL(e.site).pathname : ""), href: e.site }, ...(f ? [gitHub(f.slug)] : []), { label: "The steps your AI follows", href: e.setup }],
  }
  return { sun: once(sun), planets: list.map(once) }
})
