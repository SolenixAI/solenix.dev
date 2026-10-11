import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-meta"

// Crawlers may read every public page and are pointed at the sitemap (app/sitemap.ts), which lists every indexable
// one. The webhook, the dev-only reload route and the analytics proxy are not pages, so they stay out. A Vercel
// preview is not the site: it asks crawlers to stay away entirely (Vercel sets VERCEL_ENV; off Vercel it is unset).
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return { rules: { userAgent: "*", disallow: "/" } }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dev/", "/lumen/", "/agents/live"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
