import { NAV_CSS, NAV_FIT, NAV_PREFETCH, navHeader } from "@/lib/site-nav"
import { NavLink } from "./nav-link"

// The site nav on the React pages: the one nav header (navHeader in lib/site-nav.ts, the same markup the raw
// pages get), with each link drawn by NavLink. The current link comes from the path, so it is right after
// every client navigation. The fit and scroll script (client/site-fit.ts) follows the markup at once, so the
// nav is fitted before the first paint, as it is on the raw pages.
export function SiteNav() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: NAV_CSS }} />
      {navHeader((l) => <NavLink key={l.href} href={l.href} label={l.label} wide={l.wide} app={l.app} />)}
      <script dangerouslySetInnerHTML={{ __html: NAV_FIT }} />
      <script type="speculationrules" dangerouslySetInnerHTML={{ __html: NAV_PREFETCH }} />
    </>
  )
}
