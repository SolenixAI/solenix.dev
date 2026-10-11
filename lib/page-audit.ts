// What a public page owes a search engine and a visitor who clicks: every link on it goes somewhere, and its head says
// what it is. auditSite runs both over every page the sitemap lists; scripts/link-check.ts runs it on the local site.
// Nothing here throws on a page's content, and every request has a time limit, so a check can never hold up a commit.

/** Each tag's attributes as a map, whatever their order or quotes; a ">" inside a quoted value stays in the value. */
const tags = (html: string, name: string) =>
  [...html.matchAll(new RegExp(`<${name}\\b((?:[^>"']|"[^"]*"|'[^']*')*)>`, "gi"))].map((m) =>
    Object.fromEntries([...m[1].matchAll(/([a-z][a-z:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi)].map((a) => [a[1].toLowerCase(), a[2] ?? a[3] ?? a[4] ?? ""])))
const point = (n: number, raw: string) => (n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : raw)
const decode = (s: string) => s.replace(/&#x([0-9a-f]+);/gi, (raw, h) => point(parseInt(h, 16), raw)).replace(/&#(\d+);/g, (raw, d) => point(+d, raw))
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")

const URL_ATTRS: Record<string, string[]> = {
  a: ["href"], link: ["href"], img: ["src", "data-src"], script: ["src"], source: ["src"], iframe: ["src"], audio: ["src"],
  video: ["src", "poster"], track: ["src"], embed: ["src"], object: ["data"], use: ["href", "xlink:href"], image: ["href", "xlink:href"],
}

/** The site's own paths a page links to or loads, each once, with queries kept and fragments dropped. Relative URLs are
 * read against the page `at`; an absolute URL is the site's own when its origin is the page's or one of `own`. */
export function internalLinks(html: string, at = "http://site.invalid/", own: string[] = []): string[] {
  // A script's own text is code, not markup: its templates are not links. Its src stays.
  const markup = html.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, "$1</script>")
  const raw: string[] = []
  for (const [name, attrs] of Object.entries(URL_ATTRS))
    for (const t of tags(markup, name)) {
      for (const k of attrs) if (t[k]) raw.push(t[k])
      if (t.srcset) raw.push(...t.srcset.split(",").map((c) => c.trim().split(/\s+/)[0]))
    }
  for (const m of tags(markup, "meta")) if (/^(og|twitter):image$/i.test(m.property ?? m.name ?? "") && m.content) raw.push(m.content)
  // CSS url() in style blocks and style attributes.
  for (const m of markup.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)/gi)) raw.push(m[1] ?? m[2] ?? m[3])
  const page = new URL(at), origins = new Set([page.origin, ...own.map((o) => new URL(o).origin)])
  const out = new Set<string>()
  for (const u of raw) {
    if (u.trim().startsWith("#")) continue // a jump within the page itself
    let url: URL
    try { url = new URL(decode(u).trim(), page) } catch { continue }
    // /_vercel/ is the host's own (Speed Insights): it exists only on Vercel, never on the local site.
    if (!origins.has(url.origin) || url.pathname.startsWith("/_vercel/")) continue
    out.add(url.pathname + url.search)
  }
  return [...out]
}

/** What a listed page's head is missing; empty means a search engine can read it. */
export function seoProblems(html: string): string[] {
  const out: string[] = []
  const metas = tags(html, "meta"), links = tags(html, "link")
  const meta = (key: string, value: string) => metas.find((m) => m[key]?.toLowerCase() === value)?.content
  const title = decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "")
  if (title.length < 3) out.push("has no <title>")
  const description = decode(meta("name", "description") ?? "").trim()
  if (description.length < 50) out.push(`has no meta description of 50 characters or more (now ${description.length})`)
  const canonicals = links.filter((l) => l.rel?.toLowerCase() === "canonical")
  if (canonicals.length !== 1) out.push(canonicals.length ? `has ${canonicals.length} canonical links, not one` : "has no canonical link")
  else if (!/^https?:\/\//.test(canonicals[0].href ?? "")) out.push("has a canonical link that is not an absolute URL")
  if (!/^https?:\/\//.test(meta("property", "og:image") ?? "")) out.push("has no share image (og:image)")
  if (/noindex/i.test(meta("name", "robots") ?? "")) out.push("is listed in the sitemap but says noindex")
  return out
}

type Landing = { ok: boolean; why: string }

/** Whether a path ends at a page or file: a 2xx, after redirects within the site. A redirect to one of `own` (the site's
 * production address) is followed on `base` by its path; one that leaves the site has landed (its target is someone
 * else's). A redirect with no or a broken Location, a 4xx or 5xx, or no answer within the time has not. A HEAD that
 * fails is asked again with GET, since some servers answer HEAD wrongly. */
export async function landed(base: string, path: string, ms = 10_000, own: string[] = []): Promise<Landing> {
  const home = new URL(base), mine = new Set([home.origin, ...own.map((o) => new URL(o).origin)])
  const ask = async (url: URL, method: string) => fetch(url, { method, redirect: "manual", signal: AbortSignal.timeout(ms) })
  try {
    let url = new URL(path, base)
    for (let hop = 0; hop < 5; hop++) {
      let r = await ask(url, "HEAD").catch(() => null)
      if (!r || r.status >= 400) r = await ask(url, "GET")
      if (r.status >= 300 && r.status < 400) {
        const to = r.headers.get("location")
        if (!to) return { ok: false, why: `redirects (${r.status}) with no Location` }
        const next = new URL(to, url)
        if (!mine.has(next.origin)) return { ok: true, why: "leaves the site" }
        url = new URL(next.pathname + next.search, home)
        continue
      }
      return r.ok ? { ok: true, why: String(r.status) } : { ok: false, why: `answers ${r.status}` }
    }
    return { ok: false, why: "redirects more than 5 times" }
  } catch (e) {
    if (e instanceof Error && e.name === "TimeoutError") return { ok: false, why: `no answer within ${ms / 1000} s` }
    return { ok: false, why: e instanceof TypeError && /URL/.test(e.message) ? "redirects to a broken Location" : `cannot be reached (${e instanceof Error ? e.message : e})` }
  }
}

/** Every page the sitemap on `base` lists: its head, and every link and asset on it. Links are checked six at a time,
 * and the whole run stops at `deadline` ms with what it found, so it always ends. */
export async function auditSite(base: string, { own = [] as string[], ms = 10_000, deadline = 120_000 } = {}) {
  base = base.replace(/\/$/, "")
  const stop = Date.now() + deadline, problems: string[] = [], seen = new Map<string, Promise<Landing>>()
  const get = (path: string) => fetch(base + path, { signal: AbortSignal.timeout(ms * 2) }).then((r) => (r.ok ? r.text() : Promise.reject(new Error(`answers ${r.status}`))))
  const sitemap = await get("/sitemap.xml").catch(() => "")
  const pages = [...new Set([...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].flatMap((m) => {
    try { const u = new URL(decode(m[1])); return [u.pathname + u.search] } catch { return [] }
  }))]
  if (!pages.length) problems.push("the sitemap lists no pages (or did not answer)")
  for (const page of pages) {
    if (Date.now() > stop) { problems.push(`stopped after ${deadline / 1000} s, before ${page} and the pages after it`); break }
    let html: string
    try { html = await get(page) } catch (e) { problems.push(`${page} did not load (${e instanceof Error ? e.message : e})`); continue }
    for (const p of seoProblems(html)) problems.push(`${page} ${p}`)
    const links = internalLinks(html, base + page, own), queue = links.filter((l) => !seen.has(l))
    // Six at a time, and none started after the deadline.
    const worker = async () => {
      for (let l = queue.shift(); l !== undefined; l = queue.shift())
        if (Date.now() <= stop) await seen.set(l, landed(base, l, ms, own)).get(l)
    }
    await Promise.all(Array.from({ length: 6 }, worker))
    for (const link of links) {
      const r = seen.get(link)
      if (!r) problems.push(`stopped after ${deadline / 1000} s, before checking ${link} on ${page}`)
      else if (!(await r).ok) problems.push(`${page} links to ${link}, which ${(await r).why}`)
    }
  }
  return { pages: pages.length, links: seen.size, problems }
}
