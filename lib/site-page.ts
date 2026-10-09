import { POSTHOG_SNIPPET, SPEED_INSIGHTS_SNIPPET } from "@/lib/analytics"
import { headTags } from "@/lib/site-meta"
import { fontHead } from "@/lib/site-fonts"
import { withHero } from "@/lib/site-hero"
import { withSiteNav } from "@/lib/site-nav"
import { withClientScripts } from "@/lib/client-script"

// Every page served as raw HTML (Articles, each article) goes out through here,
// so each one gets the same things and no page has to remember them:
//   dark from the first byte, the design tokens, the fonts (from the site itself), "Title · Solenix" in the tab,
//   tab icons and link-preview tags, measurement, the site nav (lib/site-nav.ts), for a page
//   that uses it the hero frame (lib/site-hero.ts), and the page's own scripts: each
//   <!--client:name--> marker becomes the compiled client/name.ts (lib/client-script.ts).

const DEV_RELOAD = "<!--client:dev-reload-->"

export type PageMeta = { title: string; description: string; path: string; cover?: string }

export function servePage(html: string, meta: PageMeta) {
  // The browser paints its white default canvas unless it knows at once that the page is dark.
  const first = `<meta charset="utf-8"><meta name="color-scheme" content="dark">` +
    (/href="\/?tokens\.css"/.test(html) ? "" : `<link rel="stylesheet" href="/tokens.css">`) +
    fontHead()
  const page = html
    .replace(/<meta charset="[^"]*">/i, "")
    .replace(/<head>/i, `<head>${first}`)
    .replace(/<title>([^<]*)<\/title>/, (t, x: string) => (x.includes("Solenix") ? t : `<title>${x} · Solenix</title>`))
    .replace("</head>", `${headTags({ ...meta, image: meta.cover })}${POSTHOG_SNIPPET}${SPEED_INSIGHTS_SNIPPET}</head>`)
  // In development only, every page listens for saves and reloads itself (client/dev-reload.ts, lib/dev-reload.ts).
  // Production gets the same bytes as before: the marker is added only when NODE_ENV is development.
  const live = process.env.NODE_ENV === "development"
    ? (page.includes("</body>") ? page.replace("</body>", `${DEV_RELOAD}</body>`) : page + DEV_RELOAD)
    : page
  return new Response(withClientScripts(withSiteNav(withHero(live))), { headers: { "content-type": "text/html; charset=utf-8" } })
}
