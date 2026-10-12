import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-meta"

// Crawlers may read every public page and are pointed at the sitemap (app/sitemap.ts), which lists every indexable
// one. /api/ holds the GitHub webhook, and /lumen/ is the analytics proxy (lib/analytics.ts POSTHOG_PROXY): neither is a
// page, so both stay out. The dev-only reload route answers 404 in production, so it needs no rule. A Vercel preview is
// not the site: it asks crawlers to stay away entirely (Vercel sets VERCEL_ENV; off Vercel it is unset).
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return { rules: { userAgent: "*", disallow: "/" } }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dev/", "/lumen/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
