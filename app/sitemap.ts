import type { MetadataRoute } from "next"
import { listArticles } from "@/lib/articles"
import { getCatalog } from "@/lib/marketplace"
import { SITE_URL } from "@/lib/site-meta"

// Search engines find every public page, each new article folder and each marketplace world, with no extra step.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, catalog] = await Promise.all([listArticles(), getCatalog()])
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/agents`, changeFrequency: "weekly", priority: 0.6 },
    ...(catalog ?? []).map((e) => ({ url: `${SITE_URL}/agents?world=${e.id}`, changeFrequency: "weekly" as const, priority: 0.5 })),
    { url: `${SITE_URL}/articles`, changeFrequency: "weekly", priority: 0.8 },
    ...articles.map((a) => ({
      url: `${SITE_URL}${a.path}`,
      lastModified: a.date || undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
