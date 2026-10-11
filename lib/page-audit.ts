// What a public page owes a search engine and a visitor who clicks: every link on it goes somewhere, and its head says
// what it is. scripts/link-check.ts runs these over every page the sitemap lists, on the local site.

/** Each tag's attributes as a map, whatever their order or quotes. */
const tags = (html: string, name: string) =>
  [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "gi"))].map((m) =>
    Object.fromEntries([...m[1].matchAll(/([a-z:-]+)\s*=\s*("([^"]*)"|'([^']*)')/gi)].map((a) => [a[1].toLowerCase(), a[3] ?? a[4] ?? ""])))
const decode = (s: string) => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")

/** The site's own paths a page links to or loads (href, src, srcset), each once; fragments dropped, queries kept. */
export function internalLinks(html: string): string[] {
  const urls: string[] = []
  for (const name of ["a", "link", "img", "script", "source", "iframe", "video", "audio"])
    for (const t of tags(html, name)) {
      for (const k of ["href", "src", "data-src"]) if (t[k]) urls.push(t[k])
      if (t.srcset) urls.push(...t.srcset.split(",").map((c) => c.trim().split(/\s+/)[0]))
    }
  // /_vercel/ is the host's own (Speed Insights): it exists only on Vercel, never on the local site.
  return [...new Set(urls.map(decode).filter((u) => u.startsWith("/") && !u.startsWith("//") && !u.startsWith("/_vercel/")).map((u) => u.replace(/#.*$/, "")).filter(Boolean))]
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
  if (!links.some((l) => l.rel?.toLowerCase() === "canonical" && /^https?:\/\//.test(l.href ?? ""))) out.push("has no canonical link")
  if (!/^https?:\/\//.test(meta("property", "og:image") ?? "")) out.push("has no share image (og:image)")
  if (/noindex/i.test(meta("name", "robots") ?? "")) out.push("is listed in the sitemap but says noindex")
  return out
}

/** Whether a path ends at a page or file: a 2xx, after the site's own redirects; a redirect that leaves the site has
 * landed (its target is someone else's). A redirect with no Location, a 4xx or 5xx, or no answer within the time has not. */
export async function landed(base: string, path: string, ms = 10_000): Promise<{ ok: boolean; why: string }> {
  let url = new URL(path, base)
  for (let hop = 0; hop < 5; hop++) {
    let r: Response
    try {
      r = await fetch(url, { method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(ms) })
      if (r.status === 405) r = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(ms) })
    } catch (e) {
      return { ok: false, why: e instanceof Error && e.name === "TimeoutError" ? `no answer within ${ms / 1000} s` : `cannot be reached (${e instanceof Error ? e.message : e})` }
    }
    if (r.status >= 300 && r.status < 400) {
      const to = r.headers.get("location")
      if (!to) return { ok: false, why: `redirects (${r.status}) with no Location` }
      url = new URL(to, url)
      if (url.origin !== new URL(base).origin) return { ok: true, why: "leaves the site" }
      continue
    }
    return r.ok ? { ok: true, why: String(r.status) } : { ok: false, why: `answers ${r.status}` }
  }
  return { ok: false, why: "redirects more than 5 times" }
}
