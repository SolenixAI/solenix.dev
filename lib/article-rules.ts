import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
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

// The template's own placeholder text: every element articles/_template marks with data-placeholder (its text, or a
// meta tag's content). Read from the template itself, so the rule can never drift from it, and a copy that drops the
// mark but keeps the words still fails.
let templateTexts: string[] | null = null
// The template, found from this module where the file exists beside it, else from the repo root (a bundled build).
const readTemplate = () => {
  try { return readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../articles/_template/index.html"), "utf8") }
  catch { return readFileSync("articles/_template/index.html", "utf8") }
}
// Text as words: runs of spaces and line breaks count as one space, so spacing never hides template text.
const words = (t: string) => t.replace(/\s+/g, " ").trim()
// Each element of a page marked data-placeholder, as its tag and its whole text (a meta tag's content).
const marked = (html: string) => [...html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*\bdata-placeholder\b[^>]*)>([^<]*)/gi)]
  .map((m) => ({ tag: m[1].toLowerCase(), text: words(m[1].toLowerCase() === "meta" ? (m[2].match(/content="([^"]*)"/)?.[1] ?? "") : m[3]) }))
export const placeholderTexts = (template = readTemplate()): string[] => marked(template).map((m) => m.text).filter(Boolean)
// Every whole piece of text on a page: each run of text between tags, and each meta tag's content. A template text
// counts only when a whole piece equals it, so an article's own prose that happens to contain it never trips the rule.
const pieces = (html: string) => new Set([
  ...[...html.matchAll(/>([^<]+)</g)].map((m) => words(m[1])),
  ...[...html.matchAll(/<meta\b[^>]*\bcontent="([^"]*)"/gi)].map((m) => words(m[1])),
].filter(Boolean))
const short = (t: string) => (t.length > 48 ? `${t.slice(0, 45)}…` : t)

/** The horizontal paddings set on .wrap, in every form (padding, padding-inline and its -start and -end, padding-left, padding-right). */
export function pageEdges(html: string): string[] {
  const out: string[] = []
  for (const block of html.matchAll(/\.wrap\s*\{([^}]*)\}/g))
    for (const [, name, value] of block[1].matchAll(/(padding(?:-inline(?:-start|-end)?|-left|-right)?)\s*:\s*([^;}]+)/gi)) {
      const prop = name.toLowerCase(), v = value.replace(/!\s*important/i, "").trim().split(/\s+(?![^(]*\))/)
      if (prop === "padding") out.push(v[1] ?? v[0], v[3] ?? v[1] ?? v[0])
      else if (prop === "padding-inline") out.push(v[0], v[1] ?? v[0])
      else out.push(v[0])
    }
  return out
}

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
  // The site adds the nav (lib/raw-nav.ts); a page that brings its own would show two.
  if (/<nav\b|class="f?nav"/i.test(html) || html.includes(NAV.platform.label))
    out.push(`holds its own nav: remove it; the site adds one, and lists each id + data-nav="Label" as a link`)
  // The first screen is a hero that the site can check and derive the card and share image from.
  if (!/<[a-z]+\b[^>]*\bdata-hero\b/i.test(html)) out.push(`has no hero: mark the first screen with data-hero (see articles/_template)`)
  // The page edge is the site's: an article's .wrap reads var(--gutter), so it lines up with the nav and every page.
  if (pageEdges(html).some((v) => v !== "var(--gutter)")) out.push(`sets its own page edge: give .wrap padding-inline:var(--gutter)`)
  // articles/_template marks each piece of placeholder text with data-placeholder; a page that still holds one is a copy
  // not yet finished. The mark goes with the text, so a reworded template can never drift from this rule.
  const marks = marked(html)
  for (const m of marks) out.push(`still holds template text <${m.tag}>${m.text ? ` "${short(m.text)}"` : ""}: write the article's own, and drop data-placeholder`)
  templateTexts ??= placeholderTexts()
  const own = pieces(html)
  for (const text of templateTexts)
    if (own.has(text) && !marks.some((m) => m.text === text)) out.push(`still holds template text "${short(text)}": write the article's own`)
  // Colours come from /tokens.css by name, so a brand change reaches every article. A raw colour is a hex code, or a colour
  // function with numbers in it, in the comma or the space syntax: rgb(244 242 238), hsl(), oklch(), color(). Pure black
  // (rgb(0 0 0), rgba(0,0,0,.5)) stays free: a shadow or a scrim is not a brand colour.
  const raw = html.match(/[\s:,("'`]#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(\s*(?:[a-z][a-z0-9-]*\s+)?(?!0\s*[, ]\s*0\s*[, ]\s*0(?![\d.%]))[+-]?(?:\d|\.\d)[^)\n]{0,40}\)?/i)
  if (raw) out.push(`has a raw colour "${raw[0].trim()}": use a token by name, var(--name), from design/tokens.css`)
  for (const [re, what] of PRIVATE) {
    const m = html.match(re)
    if (m) out.push(`contains ${what}: "${m[0].slice(0, 40)}"`)
  }
  return out
}
