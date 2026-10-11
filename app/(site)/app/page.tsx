import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { HERO_CSS } from "@/lib/site-hero"
import { OG_IMAGE, SITE_URL } from "@/lib/site-meta"
import { NAV } from "@/lib/site-nav"

// solenix.dev/app: the platform page. The platform is being rebuilt from scratch, so the nav's platform button
// lands here: one screen that says so, and the one action that still works today. The world's first-frame still shows
// behind it (components/space/world.tsx); the words are shaded from the scene as on the homepage, never panelled.
const SHADE = ".sx-hero-text{text-shadow:0 0 26px var(--bg),0 0 10px var(--bg),0 1px 2px var(--bg)}.sx-hero-text a{text-shadow:none}"
const title = NAV.platform.label
const description = `The ${title} is being rebuilt. Start with one call, where a fixed price is agreed in writing. Then we set up one AI on the tools you already use.`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/app` },
  robots: { index: false },
  openGraph: { type: "website", siteName: "Solenix", locale: "en_CA", title: `${title} · Solenix`, description, url: "/app", images: [OG_IMAGE] },
}

export default function Platform() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS + SHADE }} />
      <header className="sx-hero" data-hero>
        <div className="sx-hero-in">
          <div className="sx-hero-text">
            <h1>The {title} is being rebuilt.</h1>
            <p className="sx-sub">Until it opens, start with one call. A fixed price, in writing, agreed on the call.</p>
            <p style={{ display: "inline-flex", alignItems: "center", gap: 8, width: "fit-content", margin: 0, padding: "6px 12px", borderRadius: 999, border: "1px solid var(--line-strong)", font: "600 0.8rem/1 var(--font-mono)", color: "#fbbf24" }}>
              <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} />
              Building
            </p>
            <div>
              <Button asChild size="lg">
                <a href="/book">Book a call</a>
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
