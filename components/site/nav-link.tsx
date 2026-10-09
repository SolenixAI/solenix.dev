"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

// One link of the site nav. Its copy and address come from lib/site-nav.ts, through SiteNav. The path decides
// the current page, so the mark follows every client navigation. A page the app router serves (app) is
// reached with next/link, so the nav stays mounted. Any other page is a plain link: the browser loads it,
// as it does today (next/link would fetch it first, then load it the same way).
export function NavLink({ href, label, wide, app }: { href: string; label: string; wide?: boolean; app?: boolean }) {
  const path = usePathname().replace(/\/$/, "") || "/"
  const current: "page" | "true" | undefined = path === href ? "page" : path.startsWith(`${href}/`) ? "true" : undefined
  const props = { className: wide ? "wide" : undefined, href, "aria-current": current }
  return app ? <Link {...props}>{label}</Link> : <a {...props}>{label}</a>
}
