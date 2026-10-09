import { existsSync } from "node:fs"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { servePage } from "@/lib/site-page"
import { SLUG, articleProblems } from "@/lib/article-rules"

// Articles are self-contained interactive pages: one folder per article in articles/,
// holding index.html and whatever data it loads. Adding an article = adding a folder.
// The page is the one source of truth for its title, description and date
// (<title>, <meta name="description">, <meta name="article:published_time">).
// At serve time lib/site-page.ts adds what every page shares: the nav, head tags and measurement.

const DIR = path.join(process.cwd(), "articles")

// The stills: a 1x picture for each screen, and its 2x (retina) version where one exists (scripts/article-covers.ts).
export type Article = { slug: string; title: string; description: string; date: string; path: string; cover?: string; hero?: string; hero2x?: string; heroPhone?: string; heroPhone2x?: string }

export async function articleSlugs(): Promise<string[]> {
  const entries = await readdir(DIR, { withFileTypes: true }).catch(() => [])
  return entries.filter((e) => e.isDirectory() && SLUG.test(e.name)).map((e) => e.name)
}

export async function readArticle(slug: string): Promise<{ meta: Article; html: string } | null> {
  if (!SLUG.test(slug)) return null
  const html = await readFile(path.join(DIR, slug, "index.html"), "utf8").catch(() => null)
  if (html === null) throw new Error(`articles/${slug}: index.html is missing`)
  // Build gate: a page that breaks the article rules fails the build, so it can never ship.
  const problems = articleProblems(slug, html)
  if (problems.length) throw new Error(`articles/${slug}:\n  - ${problems.join("\n  - ")}`)
  const pick = (re: RegExp) => html.match(re)?.[1]?.trim() ?? ""
  // The file's URL if it exists, else undefined.
  const still = (file: string) => existsSync(path.join(process.cwd(), "public/articles", slug, file)) ? `/articles/${slug}/${file}` : undefined
  const meta: Article = {
    slug,
    title: pick(/<title>([^<]*)<\/title>/) || slug,
    description: pick(/<meta name="description" content="([^"]*)"/),
    date: pick(/<meta name="article:published_time" content="([^"]*)"/),
    path: `/articles/${slug}`,
    // From npm run article-covers; also the share image.
    cover: still("cover.png"),
    hero: still("hero.png"),
    hero2x: still("hero@2x.webp"),
    heroPhone: still("hero-phone.png"),
    heroPhone2x: still("hero-phone@2x.webp"),
  }
  return { meta, html }
}

/** Newest first. */
export async function listArticles(): Promise<Article[]> {
  const all = await Promise.all((await articleSlugs()).map(readArticle))
  return all
    .flatMap((a) => (a ? [a.meta] : []))
    .sort((a, b) => b.date.localeCompare(a.date))
}

/** Serve an article: wrap a bare page in a document, then add what every page shares. */
export function serveArticle(meta: Article, html: string) {
  return servePage(/<html[\s>]/i.test(html) ? html : wrapFragment(html), meta)
}

// A page written as a fragment (no <html>): its leading meta, title, link and style tags
// form the head; everything after them is the body.
function wrapFragment(html: string) {
  const m = html.match(/^(\s*(?:<meta[^>]*>|<title>[^<]*<\/title>|<link[^>]*>|<style[\s\S]*?<\/style>|\s)*)([\s\S]*)$/i)
  const head = m?.[1] ?? ""
  const body = m?.[2] ?? html
  return `<!doctype html><html lang="en"><head>${head}</head><body>${body}</body></html>`
}
