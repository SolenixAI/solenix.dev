import { Reveals } from "@/components/brand/motion"
import { SiteFooter, SiteHeader } from "@/components/site/chrome"
import type { Viewport } from "next"
import { Analytics } from "./analytics"

// Dark from the first frame, so the browser never paints its white default canvas.
export const viewport: Viewport = { colorScheme: "dark" }

// Solenix is dark only, site and portal: space is the brand.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="dark" className="flex min-h-dvh flex-col overflow-x-clip bg-background text-foreground">
      <a
        href="#content"
        className="absolute -top-24 left-4 z-(--z-skip) rounded-pill border border-line-strong bg-surface-solid px-6 py-3 font-semibold no-underline transition-[top] focus-visible:top-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="content" className="flex-1">{children}</main>
      <SiteFooter />
      <Reveals />
      <Analytics />
    </div>
  )
}
