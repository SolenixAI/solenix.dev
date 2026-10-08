import type { MetadataRoute } from "next"
import { listArticles } from "@/lib/articles"
import { SITE_URL } from "@/lib/site-meta"

// Search engines find every public page, and each new article folder, with no extra step.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listArticles()
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/agents`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/articles`, changeFrequency: "weekly", priority: 0.8 },
    ...articles.map((a) => ({
      url: `${SITE_URL}${a.path}`,
      lastModified: a.date || undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
