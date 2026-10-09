import "server-only"
import { cache } from "react"
import { githubHeaders } from "@/lib/github"
import { fresh } from "@/lib/fresh"

/**
 * The Agents Marketplace: the core toolkit and the worlds Solenix stands behind.
 * - The catalog (worlds.json in SolenixAI/agents-marketplace) is read through GitHub's contents API (not
 *   raw.githubusercontent.com, whose copies can be five minutes old) and kept in Next's data cache under its
 *   branch's tag. A push to that branch expires it (app/api/github), so an open page hears the change within
 *   about a second (app/(site)/agents/live). A missed webhook still heals within a minute.
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
/** A catalog read is kept at most this long: the backstop for a missed webhook. A push expires it at once. */
const CATALOG_REVALIDATE = 60
/** The cache tag of the catalog on one branch. app/api/github expires it when that branch is pushed. */
export const catalogTag = (ref: string) => `marketplace:${ref}`
/** The cache tag of every other source's facts. A push refreshes them behind the page, never in its way. */
export const FACTS_TAG = "marketplace:facts"
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
/** One thing inside a piece (a skill, agent or command), described by its own file. */
export type Part = { id: string; kind: "skill" | "agent" | "command"; name: string; blurb: string | null; href: string }
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
  /** What is inside, each described by its makers: the piece's own sub-world. */
  parts: Part[]
  /** What it does for you, in one plain sentence with live numbers. */
  gives: string | null
  /** The AI apps it ships a package for, read from its manifests. */
  works: string[]
  refs: Link[]
}
export type Orbit = { sun: Source; planets: Source[] }

const sentence = (name: string, skill: string) =>
  `Set up ${name} for me. Run \`npx skills add ${MARKETPLACE_SLUG} --skill ${skill}\`, then follow the ${skill} skill.`

/** worlds.json on one branch, read through Next's data cache: kept until the backstop or a push to that branch. */
const catalogFile = async (ref: string) =>
  fresh<{ content?: string; sha?: string }>(`https://api.github.com/repos/${MARKETPLACE_SLUG}/contents/worlds.json?ref=${ref}`, await githubHeaders(), { tags: [catalogTag(ref)], revalidate: CATALOG_REVALIDATE })
/** Which version of the catalog a branch holds right now (its file's git hash); null when unreadable. */
export const catalogVersion = async (ref = REF) => (await catalogFile(ref))?.sha ?? null

/** The catalog as the data cache holds it (a push to its branch refreshes it); null when it can't be read. */
export const getCatalog = cache(async (): Promise<Entry[] | null> => {
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
})

// Other people's facts: hourly at most, tagged so a push refreshes them behind the page. A source that
// fails, or answers with something that is not JSON, gives null: it drops only its own facts.
const hourly = (url: string, headers: Record<string, string> = {}) =>
  fetch(url, { headers, next: { revalidate: HOUR, tags: [FACTS_TAG] } }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
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
/** Every file path in a repo at HEAD, and the tree's hash (one call). */
const treeOf = async (slug: string): Promise<{ sha: string | null; paths: string[] }> => {
  const t = await gh(`repos/${slug}/git/trees/HEAD?recursive=1`)
  return { sha: t?.sha ?? null, paths: Array.isArray(t?.tree) ? (t.tree as { path: string }[]).map((f) => f.path) : [] }
}
const tree = async (slug: string) => (await treeOf(slug)).paths

/** A Markdown file's frontmatter name and description (YAML, including folded > and | blocks). */
export function frontmatter(text: string): { name?: string; description?: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  if (!m) return {}
  const lines = m[1].split(/\r?\n/), out: Record<string, string> = {}
  lines.forEach((line, i) => {
    const kv = /^(name|description):\s*(.*)$/.exec(line)
    if (!kv) return
    let v = kv[2].trim()
    if (/^[>|][+-]?$/.test(v)) { const block: string[] = []; for (let j = i + 1; j < lines.length && /^\s+\S/.test(lines[j]); j++) block.push(lines[j].trim()); v = block.join(" ") }
    out[kv[1]] = v.replace(/^(["'])(.*)\1$/, "$2")
  })
  return out
}

// The parts of a repo, each described by its own file. All the files come in one GraphQL request,
// remembered by the repo's tree hash: a new commit is a new hash, so a description is never stale.
const described = new Map<string, Promise<Part[]>>()
const PART_FILES: Record<Part["kind"], RegExp> = { skill: /^skills\/([^/]+)\/SKILL\.md$/, agent: /^agents\/([^/]+)\.md$/, command: /^commands\/([^/]+)\.md$/ }
async function partsOf(slug: string, kinds: Part["kind"][], only?: string[]): Promise<Part[]> {
  const { sha, paths } = await treeOf(slug)
  const files = paths.flatMap((path) => kinds.flatMap((kind) => {
    const id = PART_FILES[kind].exec(path)?.[1]
    return id && (!only || only.includes(id)) ? [{ kind, id, path }] : []
  }))
  if (!sha || files.length === 0) return []
  const key = `${slug}@${sha}:${kinds}:${only ?? ""}`
  if (!described.has(key)) described.set(key, (async () => {
    const [owner, name] = slug.split("/")
    const fields = files.map((f, i) => `f${i}: object(expression: ${JSON.stringify(`HEAD:${f.path}`)}) { ... on Blob { text } }`).join(" ")
    const r = await fetch("https://api.github.com/graphql", { method: "POST", headers: await githubHeaders(), body: JSON.stringify({ query: `{ repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { ${fields} } }` }) })
      .then((x) => (x.ok ? x.json() : null), () => null)
    const repo = r?.data?.repository
    if (!repo) { described.delete(key); return files.map((f) => ({ id: f.id, kind: f.kind, name: f.id, blurb: null, href: `https://github.com/${slug}/blob/HEAD/${f.path}` })) }
    return files.map((f, i) => {
      const fm = frontmatter(repo[`f${i}`]?.text ?? "")
      return { id: f.id, kind: f.kind, name: fm.name || f.id, blurb: fm.description || null, href: `https://github.com/${slug}/blob/HEAD/${f.path}` }
    })
  })())
  return described.get(key)!
}
const npm = async (name: string) => {
  const [latest, week] = await Promise.all([hourly(`https://registry.npmjs.org/${name}/latest`), hourly(`https://api.npmjs.org/downloads/point/last-week/${name}`)])
  return { version: (latest?.version as string) ?? null, blurb: (latest?.description as string) ?? null, weekly: (week?.downloads as number) ?? null }
}
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`)
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
  ({ blurb: null, repo: null, version: null, updated: null, weekly: null, contents: [], items: [], parts: [], gives: null, works: [], refs: [], ...s })

async function plugin(slug: string, specs: Specs, maker: string): Promise<Source> {
  const [f, paths, parts] = await Promise.all([repoFacts(slug), tree(slug), partsOf(slug, ["agent", "command", "skill"])])
  const s = shape(paths)
  const manifest = paths.find((p) => /^\.[a-z]+-plugin\/plugin\.json$/.test(p))
  const m = manifest ? await gh(`repos/${slug}/contents/${manifest}`) : null
  let version: string | null = null
  try { version = m?.content ? JSON.parse(Buffer.from(m.content, "base64").toString("utf8")).version ?? null : null } catch {}
  const extra = [...(s.mcp ? [{ label: "connector", n: 1 }] : []), ...(s.hooks ? [{ label: "hooks", n: 1 }] : [])]
  return { ...blank({ id: "plugin", kind: "plugin", name: "Plugin", href: `https://github.com/${slug}` }), blurb: f.blurb, repo: asRepo(f), version, updated: f.pushed,
    contents: [...s.contents, ...extra], works: s.works, parts,
    gives: `One install gives your AI everything ${maker} built for it${s.works.length ? `, in ${list(s.works)}` : ""}.`,
    refs: [gitHub(slug), ...(f.homepage ? [{ label: "Docs", href: f.homepage }] : []), ...spec(specs, "plugin", "Agent Plugins spec")] }
}
async function skills(slug: string, specs: Specs, maker: string): Promise<Source> {
  const [f, paths, parts] = await Promise.all([repoFacts(slug), tree(slug), partsOf(slug, ["skill"])])
  const s = shape(paths)
  return { ...blank({ id: "skills", kind: "skills", name: "Skills", href: `https://github.com/${slug}/tree/HEAD/skills` }), blurb: f.blurb, repo: asRepo(f), updated: f.pushed,
    contents: s.skills.length ? [{ label: "skills", n: s.skills.length }] : [], items: s.skills, parts,
    gives: s.skills.length ? `Your AI knows how to do ${s.skills.length} things the way ${maker} does them.` : null,
    refs: [gitHub(slug), { label: "skills.sh", href: `https://skills.sh/${slug}` }, ...spec(specs, "skills", "Agent Skills spec")] }
}
async function connector(name: string, specs: Specs, maker: string): Promise<Source> {
  const entry = `${MCP_REGISTRY}/v0.1/servers/${encodeURIComponent(name)}/versions/latest`
  const d = await hourly(entry)
  const server = d?.server
  const slug = slugOf(server?.repository?.url)
  const f = slug ? await repoFacts(slug) : null
  const remote: string | undefined = server?.remotes?.[0]?.url
  return { ...blank({ id: "connector", kind: "connector", name: "Connector", href: server?.websiteUrl ?? remote ?? entry }), blurb: server?.description ?? null,
    repo: f && asRepo(f), version: server?.version ?? null, gives: `Your AI can see and change what is in your ${maker} account.`, updated: d?._meta?.["io.modelcontextprotocol.registry/official"]?.updatedAt ?? f?.pushed ?? null,
    refs: [...(remote ? [{ label: remote.replace(/^https:\/\//, ""), href: remote }] : []), { label: "MCP registry entry", href: entry }, ...(slug ? [gitHub(slug)] : []), ...spec(specs, "mcp", "MCP spec")] }
}
async function cli(name: string, docs: string, maker: string): Promise<Source> {
  const n = await npm(name)
  return { ...blank({ id: "cli", kind: "cli", name: "Command line", href: docs }), blurb: n.blurb, version: n.version, weekly: n.weekly,
    gives: `Your AI can run ${maker} for you, the way its engineers do.`,
    items: [`npm i -g ${name}`], refs: [{ label: "Docs", href: docs }, npmPage(name)] }
}
const api = (docs: string, maker: string): Source => ({ ...blank({ id: "api", kind: "api", name: "API", href: docs }), gives: `Anything else ${maker} can do, your AI can reach directly.`, refs: [{ label: "API reference", href: docs }] })

async function tool(t: ToolSource, specs: Specs): Promise<Source> {
  const [f, n, release, parts] = await Promise.all([repoFacts(t.starsRepo), t.cli ? npm(t.cli.npm) : null, gh(`repos/${t.starsRepo}/releases/latest`), partsOf(t.install.repo, ["skill"], t.install.skills)])
  return { ...blank({ id: t.id, kind: "tool", name: t.name, href: t.site }), blurb: f.blurb ?? t.for, repo: asRepo(f), parts, gives: t.for,
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
  if (p?.plugin) planets.push(plugin(p.plugin.repo, e.specs, e.maker))
  if (p?.skills) planets.push(skills(p.skills.repo, e.specs, e.maker))
  if (p?.mcp) planets.push(connector(p.mcp.registry, e.specs, e.maker))
  if (p?.cli) planets.push(cli(p.cli.npm, p.cli.docs, e.maker))
  if (p?.api) planets.push(Promise.resolve(api(p.api.docs, e.maker)))
  for (const t of e.tools ?? []) planets.push(tool(t, e.specs))
  const [f, list] = await Promise.all([sunFacts, Promise.all(planets)])
  const sun: Source = {
    ...blank({ id: "maker", kind: "maker", name: e.maker, href: e.site }), blurb: f?.blurb ?? null, repo: f && asRepo(f), updated: f?.pushed ?? null,
    refs: [{ label: new URL(e.site).host + (new URL(e.site).pathname.length > 1 ? new URL(e.site).pathname : ""), href: e.site }, ...(f ? [gitHub(f.slug)] : []), { label: "The steps your AI follows", href: e.setup }],
  }
  return { sun: once(sun), planets: list.map(once) }
})
