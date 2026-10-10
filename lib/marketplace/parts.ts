// The descriptions of a repo's parts (its skills, agents and commands), each read from its own file.
// describe(slug, tree, kinds, only?) describes the files of a tree the caller already read. It holds only the
// newest complete answer per request (slug, kinds, only): a new tree replaces it. A read that fails is never
// held: it gives the last held answer, else each part's id with no blurb. Pure: the network and the GitHub key
// are injected (get, headers), so node --test runs it against a fake GitHub (lib/marketplace/parts.test.ts).
import type { Get } from "../fresh.ts"

export type PartKind = "skill" | "agent" | "command"
/** One thing inside a piece (a skill, agent or command), described by its own file. */
export type Part = { id: string; kind: PartKind; name: string; blurb: string | null; href: string }
/** A repo's tree at HEAD: its hash and every path. A null sha means the tree could not be read. */
export type Tree = { sha: string | null; paths: string[] }

const PART_FILES: Record<PartKind, RegExp> = { skill: /^skills\/([^/]+)\/SKILL\.md$/, agent: /^agents\/([^/]+)\.md$/, command: /^commands\/([^/]+)\.md$/ }
/** Files per GraphQL request: each request stays the same bounded size, however many files a repo has. */
const BATCH = 100
const GRAPHQL = "https://api.github.com/graphql"

type File = { kind: PartKind; id: string; path: string }
const hrefOf = (slug: string, path: string) => `https://github.com/${slug}/blob/HEAD/${path}`

/** A Markdown file's frontmatter name and description (YAML, including folded > and | blocks). */
function frontmatter(text: string): { name?: string; description?: string } {
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

export function makeDescriber(get: Get, headers: () => Promise<Record<string, string>> = async () => ({})) {
  // The newest complete answer per request. One entry per request, however many trees it has seen.
  const held = new Map<string, { sha: string; parts: Part[] }>()
  // Reads in flight, shared by identical requests. Removed once settled, so a failed read is never kept.
  const reading = new Map<string, Promise<Part[]>>()

  // The texts of the files, in order; null unless the request succeeded and every file's text came back.
  async function textsOf(owner: string, name: string, files: File[]): Promise<string[] | null> {
    const fields = files.map((f, i) => `f${i}: object(expression: ${JSON.stringify(`HEAD:${f.path}`)}) { ... on Blob { text } }`).join(" ")
    const query = `{ repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { ${fields} } }`
    try {
      const r = await get(GRAPHQL, { method: "POST", headers: await headers(), body: JSON.stringify({ query }) })
      const repo = r.ok ? (await r.json())?.data?.repository : null
      const texts = files.map((_, i) => repo?.[`f${i}`]?.text)
      return texts.every((t) => typeof t === "string") ? texts : null
    } catch {
      return null
    }
  }

  async function describe(slug: string, tree: Tree, kinds: PartKind[], only?: string[]): Promise<Part[]> {
    const { sha, paths } = tree
    const key = `${slug}|${kinds}|${only ?? ""}`
    // A tree that could not be read gives the last held answer; nothing is read or kept.
    if (!sha) return held.get(key)?.parts ?? []
    const files: File[] = paths.flatMap((path) => kinds.flatMap((kind) => {
      const id = PART_FILES[kind].exec(path)?.[1]
      return id && (!only || only.includes(id)) ? [{ kind, id, path }] : []
    }))
    if (files.length === 0) return []
    const have = held.get(key)
    if (have?.sha === sha) return have.parts
    const flight = `${key}@${sha}`
    const inFlight = reading.get(flight)
    if (inFlight) return inFlight
    const [owner, name] = slug.split("/")
    const batches = Array.from({ length: Math.ceil(files.length / BATCH) }, (_, i) => files.slice(i * BATCH, (i + 1) * BATCH))
    const read = Promise.all(batches.map((batch) => textsOf(owner, name, batch)))
      .then((replies): Part[] => {
        const texts = replies.includes(null) ? null : replies.flatMap((r) => r ?? [])
        if (texts) {
          const parts = files.map((f, i) => { const fm = frontmatter(texts[i]); return { id: f.id, kind: f.kind, name: fm.name || f.id, blurb: fm.description || null, href: hrefOf(slug, f.path) } })
          held.set(key, { sha, parts })
          return parts
        }
        // A failed read is never kept: the last held answer, else the id fallback.
        return held.get(key)?.parts ?? files.map((f) => ({ id: f.id, kind: f.kind, name: f.id, blurb: null, href: hrefOf(slug, f.path) }))
      })
      .finally(() => reading.delete(flight))
    reading.set(flight, read)
    return read
  }

  return Object.assign(describe, { held: () => held.size })
}
