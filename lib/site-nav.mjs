// The site nav: the one source of truth for every page on solenix.dev.
// Pages hold no nav markup, style or script. The server adds this nav to each page:
//   raw HTML pages (homepage, Articles, each article) through lib/site-page.ts,
//   React pages through components/site/chrome.tsx.
// The links, the mark, the platform button and the footer links all come from NAV below.
// An article's own section links come from the page: each element with id and data-nav="Label".
// scripts/sot-check.mjs fails the commit if any nav copy appears anywhere else.

export const NAV = {
  home: { href: "/", label: "Solenix", aria: "Solenix home" },
  links: [
    { href: "/articles", label: "Articles" },
    { href: "/agents", label: "Agents Marketplace", wide: true },
  ],
  platform: { href: "/app", label: "Solenix platform", short: "Platform", aria: "Solenix platform: sign in" },
  contact: { href: "mailto:hello@solenix.dev", label: "hello@solenix.dev" },
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")

/** The mark's shapes (DESIGN.md §12): sun, one orbit ring, one agent dot. `fill` paints the sun. */
export const markShapes = (fill) =>
  `<circle cx="16" cy="16" r="14" fill="none" stroke="var(--ring)" stroke-opacity=".45" stroke-width="1.5"/>` +
  `<circle cx="16" cy="16" r="8" fill="${fill}"/><circle cx="27" cy="9" r="2.2" fill="var(--ring)"/>`

/** The sun's light: warm at the upper left, deeper at the edge. */
export const sunGradient = (id) =>
  `<radialGradient id="${id}" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="var(--sun1)"/><stop offset="1" stop-color="var(--sun2)"/></radialGradient>`

/** The mark as a standalone SVG, with its own sun gradient. */
export const markSvg = (id = "snav-sun") =>
  `<svg viewBox="0 0 32 32" aria-hidden="true"><defs>${sunGradient(id)}</defs>${markShapes(`url(#${id})`)}</svg>`

/** Section links an article declares: <section id="x" data-nav="Label">. */
export function pageSections(html) {
  const out = []
  for (const m of html.matchAll(/<[a-z][a-z0-9]*\b[^>]*\bdata-nav="([^"]+)"[^>]*>/gi)) {
    const id = m[0].match(/\bid="([^"]+)"/)?.[1]
    if (id) out.push({ id, label: m[1] })
  }
  return out
}

/** Platform, then the nav links, then contact: the same list in every footer. */
export const footerLinks = () => [NAV.platform, ...NAV.links, NAV.contact]

const CSS = `
html{scroll-padding-top:var(--nav-height)}
.snav{position:fixed;z-index:var(--z-nav);top:calc(12px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);box-sizing:border-box;width:min(calc(100% - 24px),var(--container-wide));height:calc(var(--nav-height) - 12px);display:flex;align-items:center;gap:var(--space-1);margin:0;padding:0 var(--space-2) 0 var(--space-4);border-radius:var(--radius-pill);background:color-mix(in srgb,var(--surface-solid) 62%,transparent);backdrop-filter:blur(var(--glass-blur)) saturate(140%);-webkit-backdrop-filter:blur(var(--glass-blur)) saturate(140%);border:1px solid var(--line);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-lg);color:var(--text);font:500 var(--fs-sm)/1 var(--font-text);letter-spacing:normal;text-align:left}
.snav.is-solid{background:color-mix(in srgb,var(--surface-solid) 86%,transparent)}
.snav a{color:inherit;text-decoration:none}
.snav-brand{flex:none;display:inline-flex;align-items:center;gap:var(--space-2);min-height:var(--tap-min);padding-right:var(--space-2);font:var(--fw-brand) 1.1rem/1 var(--font-display);letter-spacing:-.01em}
.snav-brand svg{display:block;width:28px;height:28px}
.snav-links{flex:none;display:flex;align-items:center;gap:var(--space-1);margin-left:auto}
.snav-links a,.snav-in a{flex:none;display:inline-flex;align-items:center;min-height:var(--tap-min);padding:0 var(--space-3);border-radius:var(--radius-pill);color:var(--muted);white-space:nowrap}
.snav-links a:hover,.snav-in a:hover{background:var(--line);color:var(--text)}
.snav-links a[aria-current],.snav-in a[aria-current]{color:var(--accent-text);background:var(--accent-quiet)}
.snav-in{flex:1;min-width:var(--in-min,0);display:flex;align-items:center;gap:2px;overflow-x:auto;scrollbar-width:none;padding-left:var(--space-2);margin-left:var(--space-1);border-left:1px solid var(--line-strong);-webkit-mask-image:linear-gradient(90deg,transparent,black 12px,black calc(100% - 24px),transparent);mask-image:linear-gradient(90deg,transparent,black 12px,black calc(100% - 24px),transparent)}
.snav-in::-webkit-scrollbar{display:none}
.snav-in a{min-height:40px}
.snav-act{flex:none;display:inline-flex;align-items:center;gap:10px;min-height:var(--tap-min);margin-left:var(--space-2);padding:0 var(--space-4) 0 var(--space-3);border-radius:var(--radius-pill);border:1px solid var(--line-strong);font-weight:600;white-space:nowrap}
.snav-links+.snav-act{margin-left:var(--space-2)}
.snav-act:hover{background:var(--line)}
.snav-act .short{display:none}
.snav-orb{position:relative;width:20px;height:20px;border-radius:50%;border:1.5px solid color-mix(in srgb,var(--ring) 55%,transparent);flex:none}
.snav-orb::before{content:"";position:absolute;inset:5px;border-radius:50%;background:radial-gradient(circle at 40% 38%,var(--sun1),var(--sun2));box-shadow:0 0 8px color-mix(in srgb,var(--sun2) 60%,transparent)}
.snav-orb i{position:absolute;inset:-1.5px;border-radius:50%;animation:snav-orbit 12s linear infinite}
.snav-orb i::after{content:"";position:absolute;top:-2px;left:50%;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--text);box-shadow:0 0 6px var(--sun1)}
.snav-act:hover .snav-orb i,.snav-act:focus-visible .snav-orb i{animation-duration:1.4s}
@keyframes snav-orbit{to{transform:rotate(360deg)}}
.snav-prog{position:absolute;left:24px;right:24px;bottom:0;height:2px;border-radius:2px;background:var(--grad-sun);transform-origin:left;transform:scaleX(0)}
.snav :focus-visible{outline:2px solid var(--accent);outline-offset:3px}
/* No width guesses: the script measures the real space and uses the first layout that fits, in this
   order: everything; c1 tighter + "Platform"; + c2 the mark without the name; c3 without the wide link
   (the name back); both. */
.snav.c1{padding-left:var(--space-3)}.snav.c1 .snav-links a,.snav.c1 .snav-in a{padding:0 var(--space-2)}.snav.c1 .snav-act{padding:0 var(--space-3) 0 10px}
.snav.c1 .snav-act .long{display:none}.snav.c1 .snav-act .short{display:inline}
.snav.c2 .snav-brand span{display:none}
.snav.c3 .snav-links a.wide{display:none}
@media (prefers-reduced-motion:reduce){.snav-orb i{animation:none;transform:rotate(45deg)}}
`.trim()

// Runs right after the nav markup, before the first paint: it marks the current page from
// location (so the markup is the same on every page), then keeps the section links and the
// reading line in step with the scroll. No timers, no fades.
// A page shown inside a frame (the live preview on an article card) belongs to the page around it,
// which already has the one nav; so a framed page draws none.
const JS = `(()=>{const n=document.currentScript.previousElementSibling,p=location.pathname.replace(/\\/$/,"")||"/";if(window.top!==window.self){n.remove();return}
for(const a of n.querySelectorAll(".snav-links a")){const h=a.getAttribute("href");if(p==h||p.startsWith(h+"/"))a.setAttribute("aria-current",p==h?"page":"true")}
const L=[...n.querySelectorAll(".snav-in a")],P=n.querySelector(".snav-prog"),I=n.querySelector(".snav-in");let t=0,cur;
const F=[[],["c1"],["c1","c2"],["c1","c3"],["c1","c2","c3"]];
function fit(){if(I)n.style.setProperty("--in-min",(L[0]?L[0].offsetWidth:0)+"px");for(const f of F){n.classList.remove("c1","c2","c3");n.classList.add(...f);if(n.scrollWidth<=n.clientWidth)break}}
fit();new ResizeObserver(fit).observe(n);document.fonts&&document.fonts.ready.then(fit);
function f(){t=0;n.classList.toggle("is-solid",scrollY>0);const S=L.map(a=>document.getElementById(a.hash.slice(1))),edge=n.getBoundingClientRect().bottom;let c=null;S.forEach(s=>{if(s&&s.getBoundingClientRect().top<=edge+1)c=s.id});
if(c!==cur){cur=c;L.forEach(a=>{const on=a.hash=="#"+c;on?a.setAttribute("aria-current","location"):a.removeAttribute("aria-current");if(on)a.parentElement.scrollTo({left:Math.max(0,a.offsetLeft-a.parentElement.clientWidth/2),behavior:"smooth"})})}
if(P){const h=document.documentElement;P.style.transform="scaleX("+Math.min(1,h.scrollTop/Math.max(1,h.scrollHeight-innerHeight))+")"}}
addEventListener("scroll",()=>{t||(t=requestAnimationFrame(f))},{passive:true});document.readyState=="loading"?addEventListener("DOMContentLoaded",f):f()})()`

/** The whole nav: style, markup and script, ready to place first in <body>. */
export function siteNav(sections = []) {
  const links = NAV.links.map((l) => `<a${l.wide ? ` class="wide"` : ""} href="${l.href}">${esc(l.label)}</a>`).join("")
  const inPage = sections.length
    ? `<nav class="snav-in" aria-label="On this page">${sections.map((s) => `<a href="#${esc(s.id)}">${esc(s.label)}</a>`).join("")}</nav>`
    : ""
  const p = NAV.platform
  return (
    `<style>${CSS}</style>` +
    `<header class="snav" data-snav>` +
    `<a class="snav-brand" href="${NAV.home.href}" aria-label="${esc(NAV.home.aria)}">${markSvg()}<span>${esc(NAV.home.label)}</span></a>` +
    `<nav class="snav-links" aria-label="Main">${links}</nav>${inPage}` +
    `<a class="snav-act" href="${p.href}" aria-label="${esc(p.aria)}"><span class="snav-orb" aria-hidden="true"><i></i></span><span class="long">${esc(p.label)}</span><span class="short">${esc(p.short)}</span></a>` +
    (sections.length ? `<i class="snav-prog" aria-hidden="true"></i>` : "") +
    `</header><script>${JS}</script>`
  )
}

/**
 * Add the site chrome to a raw HTML page: the nav first in <body> (after a skip link, if any),
 * and the markers a page may use: <!--site:brand--> (the mark and name, linked home) and
 * <!--site:footer-links--> (the footer links as <li> items).
 */
export function withSiteNav(html) {
  const nav = siteNav(pageSections(html))
  return html
    .replace(/(<body[^>]*>\s*(?:<a class="skip"[^>]*>[^<]*<\/a>)?)/i, `$1${nav}`)
    .replaceAll("<!--site:brand-->", `<a class="brand" href="${NAV.home.href}" aria-label="${esc(NAV.home.aria)}">${markSvg("site-mark")}${esc(NAV.home.label)}</a>`)
    .replaceAll("<!--site:footer-links-->", footerLinks().map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join(""))
}
