import type { MetadataRoute } from "next"

// The pages a search engine should index, each once, at the one URL form the page canonicalises to (app/sitemap.ts).
// The worlds on /agents are query variants (?world=...) of that one page, so none is listed: /agents is their canonical.
// lastmod is the article's own publication date, the only real date the repo holds for a page; a page without one has none.
export function sitemapEntries(siteUrl: string, articles: { path: string; date: string }[]): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/agents`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/articles`, changeFrequency: "weekly", priority: 0.8 },
    ...articles.map((a) => ({
      url: `${siteUrl}${a.path}`,
      lastModified: a.date || undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
