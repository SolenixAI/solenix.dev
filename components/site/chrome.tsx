import { Mail } from "lucide-react"
import { Lockup } from "@/components/brand/mark"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

const SECTIONS = [
  { href: "/#demo", label: "See it work" },
  { href: "/#what", label: "What we do" },
  { href: "/#portal", label: "Your portal" },
  { href: "/#faq", label: "Questions" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-(--z-nav) border-b border-line bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] backdrop-blur-(--glass-blur)">
      <div className="mx-auto flex min-h-nav w-full max-w-wide items-center gap-4 px-(--gutter)">
        <Lockup />
        <nav aria-label="Sections" className="ml-auto hidden items-center gap-1 lg:flex">
          {SECTIONS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="inline-flex min-h-tap items-center rounded-pill px-3 text-sm text-muted-foreground no-underline transition-colors hover:bg-line hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <a href="/app">Client sign in</a>
          </Button>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-(--space-section) border-t border-line py-12">
      <div className="mx-auto flex w-full max-w-wide flex-wrap items-start justify-between gap-6 px-(--gutter)">
        <div className="flex flex-col gap-2">
          <Lockup />
          <p className="text-xs text-faint">The tech person your business does not have · St. John&apos;s, Newfoundland</p>
        </div>
        <div className="flex flex-col gap-3">
          <a href="mailto:hello@solenix.dev" className="inline-flex min-h-tap items-center gap-2 font-semibold no-underline hover:underline hover:underline-offset-3">
            <Mail className="size-4" aria-hidden="true" />
            hello@solenix.dev
          </a>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <a href="/app" className="inline-flex min-h-6 items-center text-muted-foreground no-underline hover:text-foreground">Client sign in</a>
            <a href="/agents" className="inline-flex min-h-6 items-center text-muted-foreground no-underline hover:text-foreground">Tools we use</a>
          </nav>
          <p className="text-xs text-faint">© {new Date().getFullYear()} Solenix</p>
        </div>
      </div>
    </footer>
  )
}
