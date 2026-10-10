// The descriptions of a repo's parts (its skills, agents and commands), each read from its own file.
// makeDescriber(get, headers, memo) returns describeParts(slug, tree, kinds, only?), which describes the files of a
// tree its caller is reading. The describer holds state, so each one is a cache: the memo keeps one complete answer
// per request (slug, kinds, only), and only the newest tree asked for may fill it. A read that fails is never kept:
// it gives the last held answer, else each part's id with no blurb. The network, the GitHub key and the memo are
// injected, so node --test runs the describer against a fake GitHub (lib/marketplace/parts.test.ts).
import type { Get } from "../fresh.ts"

export type PartKind = "skill" | "agent" | "command"
/** One thing inside a piece (a skill, agent or command), described by its own file. */
export type Part = { id: string; kind: PartKind; name: string; blurb: string | null; href: string }
/** A repo's tree at HEAD: its hash and every path. A null sha means the tree could not be read. */
export type Tree = { sha: string | null; paths: string[] }
/** The complete answer for one tree, as the memo keeps it. */
export type Answer = { sha: string; parts: Part[] }

const PART_FILES: Record<PartKind, RegExp> = { skill: /^skills\/([^/]+)\/SKILL\.md$/, agent: /^agents\/([^/]+)\.md$/, command: /^commands\/([^/]+)\.md$/ }
/** Files per GraphQL request: each request stays the same bounded size, however many files a repo has. */
const BATCH = 100
const GRAPHQL = "https://api.github.com/graphql"

/** A part's file: its kind, its id (the file's name) and its path at HEAD. */
type PartFile = { kind: PartKind; id: string; path: string }
const hrefOf = (slug: string, path: string) => `https://github.com/${slug}/blob/HEAD/${path}`
/** A part from its file. Its text gives the name and blurb from its frontmatter; with no text, it is its id and no blurb. */
const toPart = (slug: string, f: PartFile, text = ""): Part => {
  const fm = frontmatter(text)
  return { id: f.id, kind: f.kind, name: fm.name || f.id, blurb: fm.description || null, href: hrefOf(slug, f.path) }
}

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

/** The describer. The memo is the caller's Map, so a test can count what the describer holds. */
export function makeDescriber(get: Get, headers: () => Promise<Record<string, string>>, memo: Map<string, Answer>) {
  // The newest tree asked for per request. Only its complete answer may fill the memo.
  const newest = new Map<string, string>()
  // Reads in flight, shared by identical requests. Removed once settled, so a failed read is never kept.
  const reading = new Map<string, Promise<Part[]>>()

  // The texts of the files, in order; null unless the request succeeded and every file's text came back.
  async function textsOf(owner: string, name: string, files: PartFile[]): Promise<string[] | null> {
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

  async function describeParts(slug: string, tree: Promise<Tree>, kinds: PartKind[], only?: string[]): Promise<Part[]> {
    const { sha, paths } = await tree
    const key = `${slug}|${kinds}|${only ?? ""}`
    // A tree that could not be read gives the last held answer; nothing is read or kept.
    if (!sha) return memo.get(key)?.parts ?? []
    newest.set(key, sha)
    const files: PartFile[] = paths.flatMap((path) => kinds.flatMap((kind) => {
      const id = PART_FILES[kind].exec(path)?.[1]
      return id && (!only || only.includes(id)) ? [{ kind, id, path }] : []
    }))
    if (files.length === 0) return []
    const have = memo.get(key)
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
          const parts = files.map((f, i) => toPart(slug, f, texts[i]))
          // An older tree whose read finishes late is not kept: a newer tree was asked for after it.
          if (newest.get(key) === sha) memo.set(key, { sha, parts })
          return parts
        }
        // A failed read is never kept: the last held answer, else the id fallback.
        return memo.get(key)?.parts ?? files.map((f) => toPart(slug, f))
      })
      .finally(() => reading.delete(flight))
    reading.set(flight, read)
    return read
  }

  return describeParts
}
