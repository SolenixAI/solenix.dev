"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import type { PlatformProps } from "@/lib/site-nav"

// The platform button on the React pages. It is the nav's own button (navHeader in lib/site-nav.ts); the path decides
// its current mark, as NavLink does for the links, so it follows every client navigation. The platform is /app, which
// the app router serves, so next/link keeps the nav mounted.
export function PlatformLink({ className, href, "aria-label": label, children }: PlatformProps & { children: ReactNode }) {
  const path = usePathname().replace(/\/$/, "") || "/"
  const current: "page" | "true" | undefined = path === href ? "page" : path.startsWith(`${href}/`) ? "true" : undefined
  return <Link className={className} href={href} aria-label={label} aria-current={current}>{children}</Link>
}
