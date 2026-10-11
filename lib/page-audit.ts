// What a public page owes a search engine and a visitor who clicks: every link on it goes somewhere, and its head says
// what it is. scripts/link-check.ts runs these over every page the sitemap lists, on the local site.

const attr = (html: string, re: RegExp) => [...html.matchAll(re)].map((m) => m[1])

/** The site's own paths a page links to or loads (href, src), each once; fragments dropped, queries kept. */
export function internalLinks(html: string): string[] {
  const all = [...attr(html, /\bhref="([^"]+)"/g), ...attr(html, /\bsrc="([^"]+)"/g)].map((u) => u.replace(/&amp;/g, "&"))
  // /_vercel/ is the host's own (Speed Insights): it exists only on Vercel, never on the local site.
  return [...new Set(all.filter((u) => u.startsWith("/") && !u.startsWith("//") && !u.startsWith("/_vercel/")).map((u) => u.replace(/#.*$/, "")).filter(Boolean))]
}

/** What a listed page's head is missing; empty means a search engine can read it. */
export function seoProblems(html: string): string[] {
  const out: string[] = []
  const pick = (re: RegExp) => html.match(re)?.[1]?.trim() ?? ""
  const title = pick(/<title[^>]*>([^<]*)<\/title>/)
  if (title.length < 3) out.push("has no <title>")
  const description = pick(/<meta name="description" content="([^"]*)"/)
  if (description.length < 50) out.push(`has no meta description of 50 characters or more (now ${description.length})`)
  if (!/<link rel="canonical" href="https?:\/\/[^"]+"/.test(html)) out.push("has no canonical link")
  if (!/<meta property="og:image" content="https?:\/\/[^"]+"/.test(html)) out.push("has no share image (og:image)")
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) out.push("is listed in the sitemap but says noindex")
  return out
}
