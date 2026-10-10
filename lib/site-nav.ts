// The site nav: the one source of truth for every page on solenix.dev.
// Pages hold no nav markup, style or script. The server adds this nav to each page:
//   raw HTML pages (homepage, Articles, each article) through lib/site-page.ts,
//   React pages through components/site/chrome.tsx.
// The links, the mark, the platform button and the footer links all come from NAV below.
// An article gets its own bar too (localNav): its title, its sections and Share. The sections come from
// the page: each element with id and data-nav="Label". The site nav stays the same on every page.
// scripts/sot-check.ts fails the commit if any nav copy appears anywhere else.

import { CLIENT } from "./client.generated.ts"

export const NAV = {
  home: { href: "/", label: "Solenix", aria: "Solenix home" },
  // app: the app router serves the page, so next/link moves there and the nav stays mounted. No app: a raw
  // page, a plain link (the browser loads it).
  links: [
    { href: "/articles", label: "Articles" },
    { href: "/agents", label: "Agents Marketplace", wide: true, app: true },
  ],
  platform: { href: "/app", label: "Solenix platform", short: "Platform", aria: "Solenix platform: being rebuilt" },
  contact: { href: "mailto:hello@solenix.dev", label: "hello@solenix.dev" },
}

const esc = (s: unknown) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")

/** The mark's shapes (DESIGN.md §12): sun, one orbit ring, one agent dot. `fill` paints the sun. */
export const markShapes = (fill: string) =>
  `<circle cx="16" cy="16" r="14" fill="none" stroke="var(--ring)" stroke-opacity=".45" stroke-width="1.5"/>` +
  `<circle cx="16" cy="16" r="8" fill="${fill}"/><circle cx="27" cy="9" r="2.2" fill="var(--ring)"/>`

/** The sun's light: warm at the upper left, deeper at the edge. */
export const sunGradient = (id: string) =>
  `<radialGradient id="${id}" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="var(--sun1)"/><stop offset="1" stop-color="var(--sun2)"/></radialGradient>`

/** The mark's drawing, for an svg that carries its own sun gradient (`id`). */
export const markInner = (id = "snav-sun") => `<defs>${sunGradient(id)}</defs>${markShapes(`url(#${id})`)}`

/** The mark as a standalone SVG, with its own sun gradient. */
export const markSvg = (id = "snav-sun") => `<svg viewBox="0 0 32 32" aria-hidden="true">${markInner(id)}</svg>`

/** Section links an article declares: <section id="x" data-nav="Label">. */
export type Section = { id: string; label: string }

export function pageSections(html: string): Section[] {
  const out = []
  for (const m of html.matchAll(/<[a-z][a-z0-9]*\b[^>]*\bdata-nav="([^"]+)"[^>]*>/gi)) {
    const id = m[0].match(/\bid="([^"]+)"/)?.[1]
    if (id) out.push({ id, label: m[1] })
  }
  return out
}

/** Platform, then the nav links, then contact: the same list in every footer. */
export const footerLinks = () => [NAV.platform, ...NAV.links, NAV.contact]

// The two bars share one shape: a glass pill, floating 12px from the top, as wide as the page.
const BAR = `position:fixed;z-index:var(--z-nav);top:calc(12px + env(safe-area-inset-top,0px));left:50%;box-sizing:border-box;width:min(calc(100% - 24px),var(--container-wide));height:calc(var(--nav-height) - 12px);display:flex;align-items:center;gap:var(--space-1);margin:0;border-radius:var(--radius-pill);background:color-mix(in srgb,var(--surface-solid) 62%,transparent);backdrop-filter:blur(var(--glass-blur)) saturate(140%);-webkit-backdrop-filter:blur(var(--glass-blur)) saturate(140%);border:1px solid var(--line);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-lg);color:var(--text);font:500 var(--fs-sm)/1 var(--font-text);letter-spacing:normal;text-align:left`

// Moving between pages is plain browser navigation: no cross-fade, no snapshot. Each added transition layer made
// flashes; the native move had none.

export const NAV_CSS = `
html{scroll-padding-top:var(--nav-height)}
.snav{${BAR};transform:translateX(-50%);padding:0 var(--space-2) 0 var(--space-4)}
.snav[data-local]{position:absolute}
.snav.is-solid{background:color-mix(in srgb,var(--surface-solid) 86%,transparent)}
.snav a,.lnav a{color:inherit;text-decoration:none}
.snav-brand{flex:none;display:inline-flex;align-items:center;gap:var(--space-2);min-height:var(--tap-min);padding-right:var(--space-2);font:var(--fw-brand) 1.1rem/1 var(--font-display);letter-spacing:-.01em}
.snav-brand svg{display:block;width:28px;height:28px}
.snav-links{flex:none;display:flex;align-items:center;gap:var(--space-1);margin-left:auto}
.snav-links a,.lnav-in a{flex:none;display:inline-flex;align-items:center;min-height:var(--tap-min);padding:0 var(--space-3);border-radius:var(--radius-pill);color:var(--muted);white-space:nowrap}
.snav-links a:hover,.lnav-in a:hover,.lnav-list a:hover{background:var(--line);color:var(--text)}
.snav-links a[aria-current],.lnav-in a[aria-current],.lnav-list a[aria-current]{color:var(--accent-text);background:var(--accent-quiet)}
.snav-act{flex:none;display:inline-flex;align-items:center;gap:10px;min-height:var(--tap-min);margin-left:var(--space-2);padding:0 var(--space-4) 0 var(--space-3);border-radius:var(--radius-pill);border:1px solid var(--line-strong);font-weight:600;white-space:nowrap}
.snav-act:hover,.lnav-share:hover,.lnav-cur:hover{background:var(--line)}
.snav-act .short{display:none}
.snav-orb{position:relative;width:20px;height:20px;border-radius:50%;border:1.5px solid color-mix(in srgb,var(--ring) 55%,transparent);flex:none}
.snav-orb::before{content:"";position:absolute;inset:5px;border-radius:50%;background:radial-gradient(circle at 40% 38%,var(--sun1),var(--sun2));box-shadow:0 0 8px color-mix(in srgb,var(--sun2) 60%,transparent)}
.snav-orb i{position:absolute;inset:-1.5px;border-radius:50%;animation:snav-orbit 12s linear infinite}
.snav-orb i::after{content:"";position:absolute;top:-2px;left:50%;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--text);box-shadow:0 0 6px var(--sun1)}
.snav-act:hover .snav-orb i,.snav-act:focus-visible .snav-orb i{animation-duration:1.4s}
@keyframes snav-orbit{to{transform:rotate(360deg)}}
.snav :focus-visible,.lnav :focus-visible,.lnav-list :focus-visible{outline:2px solid var(--accent);outline-offset:3px}
/* No width guesses: the script measures the real space and uses the first layout that fits, in this
   order: everything; c1 tighter + "Platform"; + c2 the mark without the name; c3 without the wide link
   (the name back); both. */
.snav.c1{padding-left:var(--space-3)}.snav.c1 .snav-links a{padding:0 var(--space-2)}.snav.c1 .snav-act{padding:0 var(--space-3) 0 10px}
.snav.c1 .snav-act .long{display:none}.snav.c1 .snav-act .short{display:inline}
.snav.c2 .snav-brand span{display:none}
.snav.c3 .snav-links a.wide{display:none}
/* An article's own bar takes the same place once the site nav has scrolled away, moving with the
   scroll (no timer). First layout that fits: every section link; l1 the section you are in, tap for
   the list; l2 Share as an icon; l3 without the mark (the title still leads home: one scroll up);
   l4 without the title. */
.lnav{${BAR};transform:translate(-50%,var(--ly,-200%));visibility:hidden;padding:0 var(--space-2)}
.lnav.is-on{visibility:visible}
.lnav-home{flex:none;display:inline-flex;align-items:center;justify-content:center;width:var(--tap-min);height:var(--tap-min);border-radius:50%}
.lnav-home svg{display:block;width:26px;height:26px}
.lnav-title{flex:none;display:inline-flex;align-items:center;min-height:var(--tap-min);padding-right:var(--space-3);font:var(--fw-brand) 1rem/1 var(--font-display);letter-spacing:-.01em;white-space:nowrap}
.lnav-in{flex:none;display:flex;align-items:center;gap:2px;margin-left:auto}
.lnav-cur,.lnav-share{flex:none;display:inline-flex;align-items:center;gap:8px;min-height:var(--tap-min);border-radius:var(--radius-pill);background:none;color:inherit;font:inherit;cursor:pointer;white-space:nowrap}
.lnav-cur{display:none;margin-left:auto;padding:0 var(--space-3);border:0;color:var(--accent-text)}
.lnav-cur .lab{overflow:hidden;text-overflow:ellipsis}
.lnav-cur svg,.lnav-share svg{flex:none;width:16px;height:16px}
.lnav-share{margin-left:var(--space-2);padding:0 var(--space-4) 0 var(--space-3);border:1px solid var(--line-strong);font-weight:600}
.lnav.l1 .lnav-in{display:none}.lnav.l1 .lnav-cur{display:inline-flex}
.lnav.l2 .lnav-share{width:var(--tap-min);padding:0;justify-content:center}.lnav.l2 .lnav-share .lab{display:none}
.lnav.l3 .lnav-home{display:none}.lnav.l3 .lnav-title{padding-left:var(--space-3)}
.lnav.l4 .lnav-title{display:none}.lnav.l4 .lnav-cur{flex:0 1 auto;min-width:0}
.lnav-prog{position:absolute;left:24px;right:24px;bottom:0;height:2px;border-radius:2px;background:var(--grad-sun);transform-origin:left;transform:scaleX(0)}
.lnav-list{position:fixed;inset:auto;top:calc(var(--nav-height) + 4px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);box-sizing:border-box;width:min(calc(100% - 24px),360px);max-height:calc(100svh - var(--nav-height) - 24px);overflow:auto;margin:0;padding:var(--space-2);border-radius:var(--radius-xl);background:color-mix(in srgb,var(--surface-solid) 94%,transparent);backdrop-filter:blur(var(--glass-blur));-webkit-backdrop-filter:blur(var(--glass-blur));border:1px solid var(--line);box-shadow:var(--shadow-lg);color:var(--text);font:500 var(--fs-sm)/1.2 var(--font-text)}
.lnav-list nav{display:flex;flex-direction:column;gap:2px}
.lnav-list a{display:flex;align-items:center;min-height:var(--tap-min);padding:0 var(--space-3);border-radius:var(--radius-md);color:var(--muted);text-decoration:none}
.lnav-list::backdrop{background:transparent}
.lnav-cur{anchor-name:--lnav-cur}
@supports (position-area:bottom){.lnav-list{position-anchor:--lnav-cur;position-area:bottom span-left;position-try-fallbacks:flip-inline;inset:auto;transform:none;margin-top:var(--space-2)}}
@media (prefers-reduced-motion:reduce){.snav-orb i{animation:none;transform:rotate(45deg)}}
`.trim()

// The nav's behaviour lives in client/site-fit.ts (fit and scroll state, every page with the nav) and, on
// the raw pages only, client/site-nav.ts (the current page). The article bar's is client/article-bar.ts.
// They are TypeScript, compiled by scripts/build-client.ts and inlined right after their markup, so they
// run before the first paint.
const CHEVRON = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const SHARE = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8M5 5l3-3 3 3M3.5 8.5V14h9V8.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`

// The next page is fetched as soon as a pointer rests on its link (or a finger goes down), so the
// move is near instant. Fetch only: nothing runs until the visitor really goes. The analytics and API
// paths are left out.
export const NAV_PREFETCH = JSON.stringify({ prefetch: [{ where: { and: [{ href_matches: "/*" }, { not: { href_matches: ["/lumen/*", "/api/*"] } }] }, eagerness: "moderate" }] })

/** The fit and scroll script every page with the nav runs, right after the markup (client/site-fit.ts). */
export const NAV_FIT = CLIENT["site-fit"]

/** The site nav: style, markup and script, ready to place first in <body>. `local`: the page has its own bar. */
export function siteNav({ local = false } = {}) {
  const links = NAV.links.map((l) => `<a${l.wide ? ` class="wide"` : ""} href="${l.href}">${esc(l.label)}</a>`).join("")
  const p = NAV.platform
  return (
    `<style>${NAV_CSS}</style>` +
    `<header class="snav" data-snav${local ? " data-local" : ""}>` +
    `<a class="snav-brand" href="${NAV.home.href}" aria-label="${esc(NAV.home.aria)}">${markSvg()}<span>${esc(NAV.home.label)}</span></a>` +
    `<nav class="snav-links" aria-label="Main">${links}</nav>` +
    `<a class="snav-act" href="${p.href}" aria-label="${esc(p.aria)}"><span class="snav-orb" aria-hidden="true"><i></i></span><span class="long">${esc(p.label)}</span><span class="short">${esc(p.short)}</span></a>` +
    `</header><script>${NAV_FIT}</script><script>${CLIENT["site-nav"]}</script><script type="speculationrules">${NAV_PREFETCH}</script>`
  )
}

/** An article's own bar: its title, its sections, Share. Placed after the site nav. */
export function localNav(title: string, sections: Section[]) {
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

/** The markers a page's markup may hold: <!--site:brand--> (the mark and name, linked home), <!--site:footer-links--> (the footer
 * links), <!--site:mark--> (the mark alone, no link) and <!--site:sun--> (the sun's light as a gradient with id "site-sun",
 * for a page's own svg <defs>). */
export function fillSiteMarkers(html: string): string {
  return html
    .replaceAll("<!--site:brand-->", `<a class="brand" href="${NAV.home.href}" aria-label="${esc(NAV.home.aria)}">${markSvg("site-mark")}${esc(NAV.home.label)}</a>`)
    .replaceAll("<!--site:footer-links-->", footerLinks().map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join(""))
    .replaceAll("<!--site:sun-->", sunGradient("site-sun"))
    .replaceAll("<!--site:mark-->", markSvg("site-mark-solo"))
}
