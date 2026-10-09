import { Reveals } from "@/components/brand/motion"
import { SpaceWorld } from "@/components/space/world"
import { FooterSlot } from "@/components/site/footer-slot"
import { SiteFooter, SiteHeader } from "@/components/site/chrome"
import type { Viewport } from "next"
import { Analytics } from "./analytics"

// Dark from the first frame, so the browser never paints its white default canvas.
export const viewport: Viewport = { colorScheme: "dark" }

// Solenix is dark only, site and portal: space is the brand. The 3D world (components/space/world.tsx) is mounted
// here once and kept for the life of the tab; each page binds to it while it is shown.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="dark" className="flex min-h-dvh flex-col overflow-x-clip bg-background text-foreground">
      {/* The night ground as a literal, hoisted into <head> by React, so even a frame painted before any stylesheet
          or token resolves is dark: a reload can never flash white. (#0b0d12 = --bg in design/tokens.css) */}
      <style href="site-ground" precedence="high">{"html,body{background:#0b0d12;color-scheme:dark}"}</style>
      <SpaceWorld />
      <a
        href="#content"
        className="absolute -top-24 left-4 z-(--z-skip) rounded-pill border border-line-strong bg-surface-solid px-6 py-3 font-semibold no-underline transition-[top] focus-visible:top-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="content" className="flex-1">{children}</main>
      <FooterSlot>
        <SiteFooter />
      </FooterSlot>
      <Reveals />
      <Analytics />
    </div>
  )
}
