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
const description = `The ${title} is being rebuilt from scratch. Book a call and we set up your AI on the tools you already use.`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/app` },
  robots: { index: false },
  openGraph: { title: `${title} · Solenix`, description, url: "/app", images: [OG_IMAGE] },
}

export default function Platform() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS + SHADE }} />
      <header className="sx-hero" data-hero>
        <div className="sx-hero-in">
          <div className="sx-hero-text">
            <h1>The {title} is being rebuilt.</h1>
            <p className="sx-sub">Your own AI, on the tools you already use. Until it opens, we set it up with you on a call.</p>
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
