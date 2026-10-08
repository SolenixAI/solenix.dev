import { POSTHOG_SNIPPET, SPEED_INSIGHTS_SNIPPET } from "@/lib/analytics"
import { headTags } from "@/lib/site-meta"
import { withSiteNav } from "@/lib/site-nav.mjs"

// Every page served as raw HTML (the homepage, Articles, each article) goes out through here,
// so each one gets the same things and no page has to remember them:
//   dark from the first byte, the design tokens, "Title · Solenix" in the tab,
//   tab icons and link-preview tags, measurement, and the site nav (lib/site-nav.mjs).

export type PageMeta = { title: string; description: string; path: string; cover?: string }

export function servePage(html: string, meta: PageMeta) {
  // The browser paints its white default canvas unless it knows at once that the page is dark.
  const first = `<meta charset="utf-8"><meta name="color-scheme" content="dark">` +
    (/href="\/?tokens\.css"/.test(html) ? "" : `<link rel="stylesheet" href="/tokens.css">`)
  const page = html
    .replace(/<meta charset="[^"]*">/i, "")
    .replace(/<head>/i, `<head>${first}`)
    .replace(/<title>([^<]*)<\/title>/, (t, x: string) => (x.includes("Solenix") ? t : `<title>${x} · Solenix</title>`))
    .replace("</head>", `${headTags({ ...meta, image: meta.cover })}${POSTHOG_SNIPPET}${SPEED_INSIGHTS_SNIPPET}</head>`)
  return new Response(withSiteNav(page), { headers: { "content-type": "text/html; charset=utf-8" } })
}
