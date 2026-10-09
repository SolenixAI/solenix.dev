import { NAV } from "./site-nav.ts"

// The rules every article must pass, in one place. Two gates use them:
// the build (lib/articles.ts refuses a failing page) and the commit check (scripts/check.sh).

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_BYTES = 8 * 1024 * 1024

// Things that must never reach a public page.
const PRIVATE: [RegExp, string][] = [
  [/\/Users\/[a-z]/i, "a local file path"],
  [/\bjdcooper\b|jagerdcooper@|jagerabe@/i, "a private email or inbox name"],
  [/\b(?:localhost|127\.0\.0\.1):\d+/i, "a localhost link"],
  [/\bSOL-\d{2,}\b|linear\.app\/solenix/i, "an internal Linear reference"],
  [/\b(?:sk|rk)_live_[A-Za-z0-9]{8,}|\bghp_[A-Za-z0-9]{20,}|\bxox[bp]-[A-Za-z0-9-]{10,}/, "a secret key"],
]

/** Problems with one article page; empty means it passes. */
export function articleProblems(slug: string, html: string): string[] {
  const out: string[] = []
  const pick = (re: RegExp) => html.match(re)?.[1]?.trim() ?? ""
  if (!SLUG.test(slug)) out.push(`folder name "${slug}" must be lower-case words joined by hyphens`)
  const title = pick(/<title>([^<]*)<\/title>/)
  if (title.length < 3 || title.length > 70) out.push(`<title> must be 3–70 characters (now ${title.length})`)
  const description = pick(/<meta name="description" content="([^"]*)"/)
  if (description.length < 50 || description.length > 200) out.push(`<meta name="description"> must be 50–200 characters (now ${description.length})`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pick(/<meta name="article:published_time" content="([^"]*)"/)))
    out.push(`<meta name="article:published_time" content="YYYY-MM-DD"> is missing or not a date`)
  if (!/<meta name="viewport"[^>]*width=device-width/i.test(html)) out.push(`<meta name="viewport" content="width=device-width, initial-scale=1"> is missing`)
  if (Buffer.byteLength(html) > MAX_BYTES) out.push(`page is larger than 8 MB`)
  // The site adds the nav (lib/site-nav.ts); a page that brings its own would show two.
  if (/<nav\b|class="f?nav"/i.test(html) || html.includes(NAV.platform.label))
    out.push(`holds its own nav: remove it; the site adds one, and lists each id + data-nav="Label" as a link`)
  // The first screen is a hero that the site can check and derive the card and share image from.
  if (!/<[a-z]+\b[^>]*\bdata-hero\b/i.test(html)) out.push(`has no hero: mark the first screen with data-hero (see articles/_template)`)
  // Colours come from /tokens.css by name, so a brand change reaches every article.
  const raw = html.match(/[\s:,("'`]#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b|rgba?\(\s*(?!0\s*,\s*0\s*,\s*0\b)\d+\s*,/i)
  if (raw) out.push(`has a raw colour "${raw[0].trim()}": use a token by name, var(--name), from design/tokens.css`)
  for (const [re, what] of PRIVATE) {
    const m = html.match(re)
    if (m) out.push(`contains ${what}: "${m[0].slice(0, 40)}"`)
  }
  return out
}
