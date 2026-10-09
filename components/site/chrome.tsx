import { Mail } from "lucide-react"
import { Lockup } from "@/components/brand/mark"
import { NAV, footerLinks, siteNav } from "@/lib/site-nav"

// The nav and the footer links come from lib/site-nav.ts, the one source for every page.
export function SiteHeader() {
  // The nav's own script marks the current page before React loads; React leaves it as it is.
  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: siteNav() }} />
}

export function SiteFooter() {
  const links = footerLinks().filter((l) => l.href !== NAV.contact.href)
  return (
    <footer className="mt-(--space-section) border-t border-line py-12">
      <div className="mx-auto flex w-full max-w-wide flex-wrap items-start justify-between gap-6 px-(--gutter)">
        <div className="flex flex-col gap-2">
          <Lockup />
          <p className="text-xs text-faint">The tech person your business does not have · St. John&apos;s, Newfoundland</p>
        </div>
        <div className="flex flex-col gap-3">
          <a href={NAV.contact.href} className="inline-flex min-h-tap items-center gap-2 font-semibold no-underline hover:underline hover:underline-offset-3">
            <Mail className="size-4" aria-hidden="true" />
            {NAV.contact.label}
          </a>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="inline-flex min-h-6 items-center text-muted-foreground no-underline hover:text-foreground">
                {l.label}
              </a>
            ))}
          </nav>
          <p className="text-xs text-faint">© {new Date().getFullYear()} Solenix</p>
        </div>
      </div>
    </footer>
  )
}
