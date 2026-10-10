import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site/chrome"
import { HERO_CSS } from "@/lib/site-hero"

// Any address the site does not have: one screen, in the site's own sky and nav, that says so in plain words
// and offers the two places most people were looking for.
export const metadata: Metadata = { title: "Page not found", robots: { index: false } }

export default function NotFound() {
  return (
    <div data-theme="dark" className="min-h-dvh bg-background text-foreground">
      <style href="site-ground" precedence="high">{"html,body{background:#0b0d12;color-scheme:dark}"}</style>
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />
      <SiteHeader />
      <main id="content">
        <header className="sx-hero" data-hero>
          <div className="sx-hero-in">
            <div className="sx-hero-text">
              <p className="sx-kicker">404</p>
              <h1>This page doesn&rsquo;t exist.</h1>
              <p className="sx-sub">The link may be old, or a letter may be off. These two pages are here.</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href="/">Go to the homepage</a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="/articles">Read the articles</a>
                </Button>
              </div>
            </div>
          </div>
        </header>
      </main>
    </div>
  )
}
