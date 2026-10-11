import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-meta"

// Crawlers may read every public page and are pointed at the sitemap (app/sitemap.ts), which lists each one.
// The webhook and the dev-only reload route are not pages, so they stay out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dev/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
