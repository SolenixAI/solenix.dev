"use client"

import { CreditCard, Home, ListTodo, Monitor, Users } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const ICONS = { clients: Users, overview: Home, tech: Monitor, projects: ListTodo, billing: CreditCard }

export type NavItem = {
  id: keyof typeof ICONS
  label: string
  /** null = present but not usable yet (an admin with no client open). Position never changes. */
  href: string | null
  /** Exact path, or a prefix ending in "*". */
  match: string
}

function isCurrent(path: string, match: string) {
  return match.endsWith("*") ? path.startsWith(match.slice(0, -1)) : path === match
}

/** The four client screens, rooted at `base` — /app for a client, or a client's admin view. */
export function clientNav(base: string | null): NavItem[] {
  return [
    { id: "overview", label: "Overview", href: base, match: base ?? "" },
    { id: "tech", label: "Your tech", href: base && `${base}/tech`, match: `${base}/tech*` },
    { id: "projects", label: "Projects", href: base && `${base}/projects`, match: `${base}/projects*` },
    { id: "billing", label: "Billing", href: base && `${base}/billing`, match: `${base}/billing*` },
  ]
}

/** An admin has Clients plus the four client items, enabled only while a client is open. */
function adminNav(path: string): NavItem[] {
  const open = path.match(/^\/app\/admin\/clients\/([0-9a-f-]{36})/i)
  const base = open ? `/app/admin/clients/${open[1]}` : null
  return [{ id: "clients", label: "Clients", href: "/app/admin/clients", match: "/app/admin/clients" }, ...clientNav(base)]
}

export function Nav({ admin, variant }: { admin: boolean; variant: "side" | "bottom" }) {
  const path = usePathname()
  const items = admin ? adminNav(path) : clientNav("/app")
  const current = items.find((n) => n.href && isCurrent(path, n.match))

  return (
    <ul
      className={cn(variant === "side" ? "grid gap-1" : "grid")}
      style={variant === "bottom" ? { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` } : undefined}
    >
      {items.map((n) => {
        const Icon = ICONS[n.id]
        const on = current === n
        const base =
          variant === "side"
            ? "flex min-h-tap w-full items-center gap-3 rounded-pill px-4 text-sm"
            : "grid min-h-15 justify-items-center gap-[3px] px-1 pt-2 pb-3"
        const inner = (
          <>
            <Icon className="size-[22px] xl:size-5" strokeWidth={1.7} aria-hidden="true" />
            <span className={cn(variant === "bottom" && "relative text-2xs font-semibold tracking-[0.02em]")}>
              {n.label}
              {variant === "bottom" && on && (
                <span className="absolute -bottom-[5px] left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-sm bg-ember" aria-hidden="true" />
              )}
            </span>
          </>
        )
        return (
          <li key={n.id} className="grid">
            {n.href ? (
              <a
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  base,
                  "no-underline transition-colors",
                  on ? "text-ember-text" : "text-muted-foreground hover:text-foreground",
                  variant === "side" && on && "bg-ember-quiet",
                  variant === "side" && !on && "hover:bg-line"
                )}
              >
                {inner}
              </a>
            ) : (
              <span
                aria-disabled="true"
                title={`Open a client to see their ${n.label.toLowerCase()}`}
                className={cn(base, "cursor-not-allowed text-muted-foreground opacity-45")}
              >
                {inner}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
