import "server-only"

/**
 * The Agents Marketplace list, read from its source of truth (the marketplace
 * file on GitHub) with each tool's live GitHub signals attached. Refreshed at
 * most once an hour, so a visit never waits on GitHub and the unauthenticated
 * API limit (60 an hour) is never reached. A failed stats call drops the
 * stats for that tool; it never breaks the list.
 */
export const MARKETPLACE_REPO = "https://github.com/SolenixAI/agents-marketplace"
export const MARKETPLACE_FILE = `${MARKETPLACE_REPO}/blob/main/.agents/plugins/marketplace.json`
const CATALOG = "https://raw.githubusercontent.com/SolenixAI/agents-marketplace/main/.agents/plugins/marketplace.json"
const HOUR = 3600

export type RepoStats = { stars: number; pushedAt: number; license: string | null; archived: boolean }
export type Tool = {
  name: string
  description: string
  category: string
  /** The repo or folder the plugin lives in. */
  source: string
  /** "owner/name" of the tool's own GitHub repo (its `repository`, or its unshared source repo), or null. */
  repo: string | null
  stats: RepoStats | null
}

type RawPlugin = { name?: unknown; description?: unknown; category?: unknown; repository?: unknown; source?: { url?: unknown; source?: unknown; path?: unknown } }

const str = (v: unknown) => (typeof v === "string" ? v : "")

// A tool's stars are its own repo's: the entry's `repository`, or else the repo its source lives in,
// unless several tools share that source repo (a directory, whose stars aren't any one tool's).
const githubRepo = (u: unknown) => /^https:\/\/github\.com\/([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/.exec(str(u))?.[1] ?? null

function sourceUrl(src: RawPlugin["source"]) {
  const url = str(src?.url).replace(/\.git$/, "")
  const path = str(src?.path)
  return !/^https:\/\//.test(url) ? MARKETPLACE_REPO : src?.source === "git-subdir" && path ? `${url}/tree/HEAD/${path}` : url
}

async function repoStats(repo: string): Promise<RepoStats | null> {
  const headers: Record<string, string> = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" }
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}`, { headers, next: { revalidate: HOUR } })
    if (!r.ok) return null
    const d = await r.json()
    return {
      stars: Number(d.stargazers_count) || 0,
      pushedAt: Date.parse(d.pushed_at) || 0,
      license: d.license?.spdx_id && d.license.spdx_id !== "NOASSERTION" ? d.license.spdx_id : null,
      archived: Boolean(d.archived),
    }
  } catch {
    return null
  }
}

/** null when the marketplace file itself can't be read. */
export async function getTools(): Promise<Tool[] | null> {
  let plugins: RawPlugin[]
  try {
    const r = await fetch(CATALOG, { next: { revalidate: HOUR } })
    if (!r.ok) return null
    const d = await r.json()
    plugins = Array.isArray(d.plugins) ? d.plugins : []
  } catch {
    return null
  }
  const hosts = plugins.map((p) => githubRepo(p.source?.url))
  const shared = new Set(hosts.filter((h, i) => h && hosts.indexOf(h) !== i))
  const ownRepo = (p: RawPlugin, host: string | null) => githubRepo(p.repository) ?? (host && !shared.has(host) ? host : null)
  const tools = plugins.map((p, i) => ({ name: str(p.name), description: str(p.description), category: str(p.category) || "Plugin", source: sourceUrl(p.source), repo: ownRepo(p, hosts[i]) }))
  const repos = [...new Set(tools.map((t) => t.repo).filter((r): r is string => !!r))]
  const stats = new Map(await Promise.all(repos.map(async (r) => [r, await repoStats(r)] as const)))
  return tools.map((t) => ({ ...t, stats: t.repo ? stats.get(t.repo) ?? null : null }))
}
