import type { MetadataRoute } from "next"
import { listArticles } from "@/lib/articles"
import { sitemapEntries } from "@/lib/sitemap"
import { SITE_URL } from "@/lib/site-meta"

// Search engines find every public page and each new article folder, with no extra step (lib/sitemap.ts says which URLs).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return sitemapEntries(SITE_URL, await listArticles())
}
