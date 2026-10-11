// The nav on the raw HTML pages (Articles, each article), as a string for lib/site-page.ts. The header is the
// one nav header (navHeader in lib/site-nav.ts) drawn with plain links, rendered at build time
// (scripts/build-client.ts → lib/nav.generated.ts): a Next route may not import react-dom/server. This file
// adds the nav's style and scripts, and an article's own bar.

import { CLIENT } from "./client.generated.ts"
import { NAV_HTML } from "./nav.generated.ts"
import { NAV, NAV_CSS, NAV_FIT, NAV_PREFETCH, esc, fillSiteMarkers, markSvg, pageSections, type Section } from "./site-nav.ts"

const CHEVRON = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const SHARE = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8M5 5l3-3 3 3M3.5 8.5V14h9V8.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`

/** The site nav: style, markup and script, ready to place first in <body>. `local`: the page has its own bar. */
function siteNav({ local = false } = {}) {
  return (
    `<style>${NAV_CSS}</style>` + NAV_HTML[local ? "local" : "plain"] +
    `<script>${NAV_FIT}</script><script>${CLIENT["site-nav"]}</script><script type="speculationrules">${NAV_PREFETCH}</script>`
  )
}

/** An article's own bar: its title, its sections, Share. Placed after the site nav. */
function localNav(title: string, sections: Section[]) {
  const items = sections.map((s) => `<a href="#${esc(s.id)}">${esc(s.label)}</a>`).join("")
  return (
    `<header class="lnav" data-lnav>` +
    `<a class="lnav-home" href="${NAV.home.href}" aria-label="${esc(NAV.home.aria)}">${markSvg("lnav-sun")}</a>` +
    `<a class="lnav-title" href="#">${esc(title)}</a>` +
    `<nav class="lnav-in" aria-label="On this page">${items}</nav>` +
    `<button class="lnav-cur" type="button" popovertarget="lnav-list" aria-label="Sections on this page"><span class="lab">Sections</span>${CHEVRON}</button>` +
    `<button class="lnav-share" type="button">${SHARE}<span class="lab" aria-live="polite">Share</span></button>` +
    `<i class="lnav-prog" aria-hidden="true"></i>` +
    `<div class="lnav-list" id="lnav-list" popover><nav aria-label="Sections">${items}</nav></div>` +
    `</header><script>${CLIENT["article-bar"]}</script>`
  )
}

/**
 * Add the site chrome to a raw HTML page: the nav first in <body> (after a skip link, if any),
 * and the markers a page may use: <!--site:brand--> (the mark and name, linked home),
 * <!--site:footer-links--> (the footer links as <li> items), <!--site:mark--> (the mark alone) and <!--site:sun--> (the sun's
 * light, id "site-sun").
 */
export function withSiteNav(html: string): string {
  const sections = pageSections(html)
  const title = (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "").replace(/\s*·\s*Solenix$/, "")
  const nav = siteNav({ local: sections.length > 0 }) + (sections.length ? localNav(title, sections) : "")
  return fillSiteMarkers(html.replace(/(<body[^>]*>\s*(?:<a class="skip"[^>]*>[^<]*<\/a>)?)/i, `$1${nav}`))
}
