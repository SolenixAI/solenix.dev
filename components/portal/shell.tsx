import { ExternalLink, LogOut } from "lucide-react"
import { Lockup } from "@/components/brand/mark"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import type { Viewer } from "@/lib/portal"
import { Nav } from "./nav"

function SignOut({ compact }: { compact?: boolean }) {
  return (
    <form action="/app/auth/signout" method="post">
      {compact ? (
        <Button type="submit" variant="quiet" size="icon" aria-label="Sign out" title="Sign out">
          <LogOut className="size-5" />
        </Button>
      ) : (
        <Button type="submit" variant="quiet" size="sm" className="w-full justify-start px-3 text-sm">
          <LogOut />
          Sign out
        </Button>
      )}
    </form>
  )
}

/**
 * Sidebar at 1024px and up; top bar and bottom tab bar below. An admin's nav
 * items never change position when a client opens — they only switch on.
 */
export function Shell({ viewer, children }: { viewer: Viewer; children: React.ReactNode }) {
  const who = viewer.isAdmin ? "Solenix" : viewer.client?.business_name ?? "Your portal"
  const sub = viewer.isAdmin ? "Admin" : viewer.client?.business_name ?? "Portal"

  return (
    <div className="min-h-dvh xl:grid xl:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 self-start border-r border-line bg-[color-mix(in_oklch,var(--bg2)_60%,transparent)] px-6 py-8 xl:flex">
        <Lockup href="/app" label="Solenix portal home" sub="Portal" />
        <nav aria-label="Portal" className="flex-1">
          <Nav admin={viewer.isAdmin} variant="side" />
        </nav>
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <span className="grid min-w-0 flex-1">
              <span className="text-sm font-semibold">{who}</span>
              <span className="truncate text-xs text-faint">{viewer.profile.email}</span>
            </span>
            <ThemeToggle />
          </div>
          <Button asChild variant="quiet" size="sm" className="w-full justify-start px-3 text-sm">
            <a href="/"><ExternalLink />Visit the website</a>
          </Button>
          <SignOut />
        </div>
      </aside>

      <header className="sticky top-0 z-30 h-nav border-b border-line bg-[color-mix(in_oklch,var(--bg)_80%,transparent)] backdrop-blur-[14px] xl:hidden">
        <div className="flex h-full items-center gap-3 px-(--gutter)">
          <div className="flex-1"><Lockup href="/app" label="Solenix portal home" sub={sub} /></div>
          <Button asChild variant="quiet" size="icon" aria-label="Visit the website" title="Visit the website">
            <a href="/"><ExternalLink className="size-5" /></a>
          </Button>
          <ThemeToggle />
          <SignOut compact />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="px-(--gutter) pt-8 pb-[calc(var(--space-8)+76px)] outline-none xl:px-16 xl:pt-16 xl:pb-24">
        <div className="mx-auto max-w-[68rem] animate-in fade-in slide-in-from-bottom-2 duration-(--dur-slow) motion-reduce:animate-none">
          {children}
        </div>
      </main>

      <nav
        aria-label="Portal, bottom"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-[color-mix(in_oklch,var(--bg)_88%,transparent)] pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-[16px] xl:hidden"
      >
        <Nav admin={viewer.isAdmin} variant="bottom" />
      </nav>
    </div>
  )
}
