import { NAV, NAV_CSS, NAV_FIT, NAV_PREFETCH, markInner } from "@/lib/site-nav"
import { NavLink } from "./nav-link"

// The site nav on the React pages: the same markup and styles as siteNav() in lib/site-nav.ts (the raw pages
// get that string), with the same copy and links from NAV. The current link comes from the path (NavLink), so
// it is right after every client navigation. The fit and scroll script (client/site-fit.ts) follows the markup
// at once, so the nav is fitted before the first paint, as it is on the raw pages.
export function SiteNav() {
  const p = NAV.platform
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: NAV_CSS }} />
      {/* The fit script sets this header's layout classes before React hydrates: React leaves its attributes as they are. */}
      <header className="snav" data-snav="" suppressHydrationWarning>
        <a className="snav-brand" href={NAV.home.href} aria-label={NAV.home.aria}>
          <svg viewBox="0 0 32 32" aria-hidden="true" dangerouslySetInnerHTML={{ __html: markInner() }} />
          <span>{NAV.home.label}</span>
        </a>
        <nav className="snav-links" aria-label="Main">
          {NAV.links.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} wide={l.wide} app={l.app} />
          ))}
        </nav>
        <a className="snav-act" href={p.href} aria-label={p.aria}>
          <span className="snav-orb" aria-hidden="true">
            <i />
          </span>
          <span className="long">{p.label}</span>
          <span className="short">{p.short}</span>
        </a>
      </header>
      <script dangerouslySetInnerHTML={{ __html: NAV_FIT }} />
      <script type="speculationrules" dangerouslySetInnerHTML={{ __html: NAV_PREFETCH }} />
    </>
  )
}
