import { articleSlugs, readArticle, serveArticle } from "@/lib/articles"

// One self-contained article page per folder in articles/ (lib/articles.ts).
export const dynamic = "force-static"
export const dynamicParams = false

export async function generateStaticParams() {
  return (await articleSlugs()).map((slug) => ({ slug }))
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const article = await readArticle(slug)
  if (!article) return new Response("Not found", { status: 404 })
  return serveArticle(article.meta, article.html)
}
