import "server-only"
import type { Service } from "@/lib/portal"
import { getSiteStatus, getVisitors, type SiteStatus, type VisitorsResult } from "@/lib/site-status"

/**
 * A service with its live facts attached. For a website, status, last deploy
 * and visitors come from Vercel and PostHog at request time — the stored row
 * only says which domain and project to ask about.
 */
export type LiveService = Service & {
  live: SiteState
  site: SiteStatus | null
  visitors: VisitorsResult | null
}
type SiteState = "live" | "building" | "down"

export async function resolveServices(services: Service[]): Promise<LiveService[]> {
  return Promise.all(
    services.map(async (s) => {
      if (!s.site_domain) return { ...s, live: s.state, site: null, visitors: null }
      const [site, visitors] = await Promise.all([getSiteStatus(s.site_domain, s.vercel_project), getVisitors(s.site_domain)])
      const live: SiteState = site.state === "none" ? s.state : site.state
      return { ...s, live, site, visitors }
    })
  )
}

export const posthogWebAnalyticsUrl = () => {
  const project = process.env.POSTHOG_PROJECT_ID
  const host = (process.env.POSTHOG_HOST ?? "https://us.posthog.com").replace("//us.i.", "//us.").replace("//eu.i.", "//eu.")
  return project ? `${host}/project/${project}/web` : null
}
