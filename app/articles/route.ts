import { listArticles, type Article } from "@/lib/articles"
import { servePage } from "@/lib/site-page"
import { CLIENT } from "@/lib/client.generated"

// solenix.dev/articles: every article, newest first and featured, built from the pages themselves.
export const dynamic = "force-static"

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
const day = (iso: string) =>
  iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : ""


// The card's picture is the article itself, live: a full-screen frame scaled into the card.
// The cover image shows until the page inside has loaded. A click grows the live page to fill
// the screen, then the browser opens the article, which paints the same pixels.
function card(a: Article, feature = false) {
  const still = a.cover
    ? `<img src="${a.cover}" alt="" loading="${feature ? "eager" : "lazy"}" width="1200" height="630">`
    : `<div class="noimg" aria-hidden="true"></div>`
  return `<article class="card${feature ? " feature" : ""}" data-live-scope>
  <div class="cover live">${still}<iframe data-src="${a.path}" hidden tabindex="-1" aria-hidden="true" title=""></iframe></div>
  <div class="text">
    <h3><a href="${a.path}">${esc(a.title)}</a></h3>
    <p>${esc(a.description)}</p>
    <div class="meta"><span class="date">${esc(day(a.date))}${feature ? ` · <b>New</b>` : ""}</span><span class="go" aria-hidden="true">Play with it<svg viewBox="0 0 16 16" focusable="false"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
  </div>
</article>`
}

// A still at its 1x file, and at 2x (retina) where the 2x file exists: the browser picks the density.
const srcset = (one: string, two?: string) => (two ? `${one} 1x, ${two} 2x` : one)

// The hero is the newest article itself, live and playable in place, in a window whose bottom edge
// names it and lets you in. Nothing covers the article.
function newestHero(a: Article, more: number) {
  const t = esc(a.title)
  // The still is the article's own picture at the layout width the live page uses (desktop or phone), taken at the
  // moment the live page starts drawing (scripts/article-covers.ts): the first paint is the live page's first frame.
  // The page itself loads after that paint and is shown once it has drawn (client/articles-live.ts).
  const still = a.hero && a.heroPhone
    ? `<picture><source media="(max-width:760px)" srcset="${srcset(a.heroPhone, a.heroPhone2x)}" width="390" height="844"><img src="${a.hero}" srcset="${srcset(a.hero, a.hero2x)}" alt="" width="1440" height="900" decoding="sync" fetchpriority="high"></picture>`
    : a.cover ? `<img src="${a.cover}" alt="" width="1200" height="630">` : `<div class="noimg" aria-hidden="true"></div>`
  const live = `<div class="cover live play">${still}<iframe data-src="${a.path}" hidden tabindex="-1" aria-hidden="true" title=""></iframe></div>`
  const enter = `<a class="enter" href="${a.path}" aria-label="Enter ${t}">Enter<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`
  const cue = `<a class="sx-cue" href="#more">${more ? "More articles" : "About Solenix"} ↓</a>`
  return `
<header class="sx-hero ar-hero" data-hero data-live-scope>
 <h1 class="sr">Articles: pages you can play with</h1>
 <div class="win">
  ${live}
  <div class="win-bar"><span class="win-cap"><b>New</b><span class="win-name">${t}</span><span class="win-hint">Tap anything. Links take you in.</span></span>${enter}</div>
 </div>
 ${cue}
</header>`
}

export async function GET() {
  const [first, ...rest] = await listArticles()
  const title = "Articles"
  const description = "Explorable stories about what AI can do now. Each one is a page you can play with."
  const hero = first
    ? newestHero(first, rest.length)
    : `<header class="sx-hero" data-hero><div class="sx-hero-in"><div class="sx-hero-text"><h1>Pages you can play with, on their way</h1><p class="sx-sub">The first one is almost ready.</p></div></div></header>`
  const list = rest.length ? `<h2 class="more-h">More pages to play with</h2><div class="grid">${rest.map((a) => card(a)).join("")}</div>` : ""
  // The newest article's still is requested with the head, before the body that shows it (the still is the first frame).
  const preload = first?.hero && first.heroPhone
    ? `<link rel="preload" as="image" href="${first.hero}" imagesrcset="${srcset(first.hero, first.hero2x)}" media="(min-width:761px)" fetchpriority="high">` +
      `<link rel="preload" as="image" href="${first.heroPhone}" imagesrcset="${srcset(first.heroPhone, first.heroPhone2x)}" media="(max-width:760px)" fetchpriority="high">`
    : ""
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title><meta name="description" content="${esc(description)}">
${preload}<style>
*{box-sizing:border-box}
html { background: var(--bg); }body{margin:0;background:radial-gradient(ellipse 90% 60% at 78% -10%,color-mix(in srgb,var(--sun2) 16%,transparent),transparent 60%),var(--bg);color:var(--text);font:17px/1.6 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;min-height:100vh}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(var(--grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--grid-line) 1px,transparent 1px);background-size:32px 32px}
.btn{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;font-weight:600;text-decoration:none;color:var(--text);border:1px solid var(--line-strong);font-size:.92rem;white-space:nowrap}
.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.btn.primary:hover{background:var(--accent-hover)}
.wrap{position:relative;max-width:var(--container);margin:0 auto;padding:24px 20px 96px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
::selection{background:var(--accent);color:var(--accent-ink)}
.enter{display:inline-flex;align-items:center;gap:10px;min-height:var(--tap-min);padding:0 20px 0 22px;border-radius:var(--radius-pill);background:var(--accent);color:var(--accent-ink);font:600 clamp(.9rem,2cqmin,1.05rem)/1 var(--font-text);text-decoration:none;white-space:nowrap;box-shadow:0 8px 24px -8px color-mix(in srgb,var(--accent) 60%,transparent);transition:background .2s,transform .2s}
.enter:hover{background:var(--accent-hover);transform:translateY(-1px)}
.enter svg{width:16px;height:16px}
.live.play iframe{pointer-events:auto}
/* Window: no words above it. The live article fills the first screen; a bar names it and lets you in. */
.ar-hero{padding-top:var(--nav-height)}
.touched .win-hint{display:none}
.win{position:relative;height:100%;display:flex;flex-direction:column;border-radius:var(--radius-2xl);overflow:hidden;background:var(--surface-solid);box-shadow:inset 0 1px 0 var(--glass-edge),0 0 0 1px var(--line-strong),var(--shadow-lg)}
.win .live{flex:1;min-height:0;aspect-ratio:auto}
.win-bar{flex:none;display:flex;gap:10px 16px;align-items:center;justify-content:space-between;padding:8px 8px 8px 20px;border-top:1px solid var(--line)}
.win-cap{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;min-width:0;color:var(--text)}
.win-name{font:650 clamp(1rem,3.2cqmin,1.4rem)/1.15 var(--font-display);letter-spacing:-.01em}
.win-cap b{display:inline-flex;align-items:center;gap:7px;padding:6px 9px;border-radius:999px;border:1px solid color-mix(in srgb,var(--accent) 40%,transparent);background:color-mix(in srgb,var(--accent) 14%,transparent);font:600 .72rem/1 var(--font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--accent-text)}
.win-cap b::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--accent)}
.win-hint{font:400 .9rem/1.2 var(--font-text);color:var(--muted)}
@container (max-width:480px){.win-hint{display:none}}
.card{position:relative;display:grid;grid-template-rows:auto 1fr;border-radius:var(--radius-xl);overflow:hidden;background:var(--glass-bg);border:1px solid var(--line);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-md);color:var(--text);text-decoration:none;transition:transform .4s var(--ease-out),border-color .4s var(--ease-out),box-shadow .4s var(--ease-out)}
.card:hover{transform:translateY(-3px);border-color:color-mix(in oklch,var(--accent) 45%,transparent);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-lg),0 28px 60px -28px color-mix(in srgb,var(--sun2) 45%,transparent)}
.cover{position:relative;aspect-ratio:1200/630;overflow:hidden;background:var(--bg2);border-bottom:1px solid var(--line)}
.live iframe{position:absolute;left:0;top:0;width:var(--vw,100vw);height:var(--fh,100vh);border:0;transform-origin:0 0;transform:scale(var(--s,0));pointer-events:none;visibility:hidden;background:var(--bg)}
.live.ready iframe{visibility:visible}
.live.ready>img,.live.ready>picture,.live.ready>.noimg{visibility:hidden}
.card h3 a{color:inherit;text-decoration:none}
.card h3 a::after{content:"";position:absolute;inset:0;border-radius:inherit}
.card:focus-within{outline:2px solid var(--accent);outline-offset:3px}
.card h3 a:focus-visible{outline:none}
.cover img{display:block;width:100%;height:100%;object-fit:cover;object-position:left top}
/* One light sweep across a card on hover: the one motion moment a card has. Reduced motion removes it. */
.card::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0;transform:translateX(-100%);background:linear-gradient(100deg,transparent 36%,var(--sweep-light) 50%,transparent 64%)}
.card:hover::before{opacity:.2;animation:card-sweep 1.2s var(--ease-out) 1 both}
@keyframes card-sweep{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
/* No live page yet: the grid and the orbit ring of the mark, drawn, not a colour wash. */
.noimg{position:relative;width:100%;height:100%;background-color:var(--bg2);background-image:linear-gradient(var(--grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--grid-line) 1px,transparent 1px);background-size:32px 32px}
.noimg::before{content:"";position:absolute;left:50%;top:50%;height:70%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;border:1px solid var(--line-strong)}
.noimg::after{content:"";position:absolute;left:50%;top:15%;width:9px;height:9px;transform:translate(-50%,-50%);border-radius:50%;background:var(--accent)}
.text{display:flex;flex-direction:column;gap:12px;padding:24px 26px 22px}
.feature{grid-template-columns:1.35fr 1fr}
.grid>.card:last-child:nth-child(odd){grid-column:1/-1;grid-template-columns:1.2fr 1fr;grid-template-rows:auto}
.grid>.card:last-child:nth-child(odd) .cover{aspect-ratio:auto;min-height:100%;border-bottom:0;border-right:1px solid var(--line)}
.meta{margin-top:auto;padding-top:8px;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between}
.feature .cover{aspect-ratio:auto;min-height:100%}
.feature h3{font-size:clamp(1.8rem,1.4rem + 1.6vw,2.6rem)}
.more-h{font:650 clamp(1.4rem,3.4vw,1.75rem)/1.1 Sora,ui-sans-serif,sans-serif;letter-spacing:-.015em;margin:48px 0 20px;text-wrap:balance}
.card h3{font:650 clamp(1.25rem,2.4vw,1.5rem)/1.12 Sora,ui-sans-serif,sans-serif;letter-spacing:-.02em;margin:0;text-wrap:balance}
.card p{margin:0;color:var(--muted);text-wrap:pretty;max-width:34rem}
.date{font:500 .8rem ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--faint);letter-spacing:.06em}
.date b{color:var(--accent-text);font-weight:600}
.go{display:inline-flex;align-items:center;gap:8px;color:var(--accent-text);font-weight:600;transition:transform .25s var(--ease-out)}
.go svg{width:16px;height:16px;flex:none}
.card:hover .go{transform:translateX(3px)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:24px}
footer{margin-top:72px;display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;padding:28px;border-radius:28px;border:1px solid var(--line);background:var(--glass-bg);box-shadow:inset 0 1px 0 var(--glass-edge)}
footer p{margin:0;color:var(--muted);max-width:34rem}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
@media (max-width:760px){.feature,.grid>.card:last-child:nth-child(odd){grid-template-columns:1fr}.feature .cover,.grid>.card:last-child:nth-child(odd) .cover{aspect-ratio:1200/630;border-right:0;border-bottom:1px solid var(--line)}}
@media (prefers-reduced-motion:reduce){.card,.go{transition:none}.card::before{display:none}}
</style>
</head><body>
${hero}
<div class="wrap" id="more">
${list}
<footer><p>Solenix sets up one AI at the centre of the tools your business already uses, cuts the ones you don't, and teaches your team. A fixed price, in writing.</p><a class="btn primary" href="/book">Book a call</a></footer>
</div><script>${CLIENT["articles-live"]}</script></body></html>`
  return servePage(html, { title, description, path: "/articles" })
}
