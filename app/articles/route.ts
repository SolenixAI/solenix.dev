import { listArticles, type Article } from "@/lib/articles"
import { servePage } from "@/lib/site-page"

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
  <div class="cover live">${still}<iframe src="${a.path}" loading="lazy" tabindex="-1" aria-hidden="true" title=""></iframe></div>
  <div class="text">
    <span class="date">${esc(day(a.date))}${feature ? ` · <b>New</b>` : ""}</span>
    <h2><a href="${a.path}">${esc(a.title)}</a></h2>
    <p>${esc(a.description)}</p>
    <span class="go" aria-hidden="true">Read the article →</span>
  </div>
</article>`
}

// Runs on /articles. Every size and time is read live: the screen, the box, the tokens.
// A live window shows a real page at your screen's width, scaled into its box and
// as tall as the box allows: no gaps, no crop. A window with "play" takes touches: the page inside
// reacts in place, and any link in it is a way in. Entering grows the window to the full screen, then
// the browser opens the page, which paints the same pixels.
const LIVE_JS = `(()=>{const css=getComputedStyle(document.documentElement),tok=n=>css.getPropertyValue(n).trim();
const ms=v=>parseFloat(v)*(v.endsWith("ms")?1:1000);
const box=c=>{const r=c.getBoundingClientRect(),w=innerWidth,s=r.width/w;return{r,w,s,h:r.height/s}};
function fit(){document.querySelectorAll(".live").forEach(c=>{const b=box(c);c.style.setProperty("--s",b.s);c.style.setProperty("--vw",b.w+"px");c.style.setProperty("--fh",b.h+"px")})}
fit();addEventListener("resize",fit);new ResizeObserver(fit).observe(document.body);
function enter(c,href){const f=c.querySelector("iframe"),b=box(c),cs=getComputedStyle(c),rad=parseFloat(cs.borderTopLeftRadius)||0,card=c.closest("[data-live-scope]");
 if(card){card.style.transition="none";card.style.transform="none"}
 f.style.cssText="position:fixed;left:0;top:0;z-index:calc(var(--z-nav) - 1);transform-origin:0 0;visibility:visible;pointer-events:none";
 f.animate([{transform:"translate("+b.r.left+"px,"+b.r.top+"px) scale("+b.s+")",width:b.w+"px",height:b.h+"px",borderRadius:Math.min(rad,b.r.width/2)/b.s+"px"},{transform:"none",width:innerWidth+"px",height:innerHeight+"px",borderRadius:"0px"}],
  {duration:ms(tok("--dur-slow")),easing:tok("--ease-out"),fill:"forwards"}).finished.then(()=>location.assign(href))}
document.querySelectorAll(".live iframe").forEach(f=>{const c=f.parentElement;function on(){c.classList.add("ready");if(!c.classList.contains("play"))return;try{const d=f.contentDocument;d.documentElement.style.overflow="hidden";
  d.addEventListener("click",e=>{const a=e.target.closest("a[href]");if(!a||e.defaultPrevented)return;e.preventDefault();enter(c,a.href)},true);
  d.addEventListener("pointerdown",()=>c.closest("[data-hero]")?.classList.add("touched"),{once:true})}catch(e){}}
 f.addEventListener("load",on);try{if(f.contentDocument&&f.contentDocument.readyState=="complete"&&f.contentDocument.URL!="about:blank")on()}catch(e){}});
document.addEventListener("click",e=>{const a=e.target.closest("a[href]"),scope=a&&a.closest("[data-live-scope]");if(!scope||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 const c=scope.querySelector(".live.ready");if(!c||c.offsetParent===null)return;e.preventDefault();enter(c,a.href)});
addEventListener("pageshow",e=>{if(!e.persisted)return;document.querySelectorAll(".live iframe").forEach(f=>{f.getAnimations().forEach(x=>x.cancel());f.style.cssText=""});document.querySelectorAll("[data-live-scope]").forEach(c=>c.style.cssText="");fit()});
})()`

// The hero is the newest article itself, live and playable in place, with no words laid over it but
// a bar that names it and lets you in.
function newestHero(a: Article, more: number) {
  const t = esc(a.title)
  const still = a.cover ? `<img src="${a.cover}" alt="" width="1200" height="630">` : `<div class="noimg" aria-hidden="true"></div>`
  const live = `<div class="cover live play">${still}<iframe src="${a.path}" tabindex="-1" aria-hidden="true" title=""></iframe></div>`
  const enter = `<a class="enter" href="${a.path}" aria-label="Enter ${t}">Enter<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`
  const cue = `<a class="sx-cue" href="#more">${more ? "More articles" : "About Solenix"} ↓</a>`
  return `
<header class="sx-hero ar-hero" data-hero data-live-scope>
 <h1 class="sr">Articles: pages you can play with</h1>
 <div class="win">
  ${live}
  <div class="win-bar"><span class="win-cap"><b>New</b> ${t}<span class="win-hint">Tap anything. Links take you in.</span></span>${enter}</div>
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
  const list = rest.length ? `<div class="grid">${rest.map((a) => card(a)).join("")}</div>` : ""
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title><meta name="description" content="${esc(description)}">
<style>
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
.win{position:relative;height:100%;border-radius:var(--radius-2xl);overflow:hidden;box-shadow:inset 0 1px 0 var(--glass-edge),0 0 0 1px var(--line-strong),var(--shadow-lg)}
.win .live{position:absolute;inset:0;aspect-ratio:auto}
.win-bar{position:absolute;left:12px;right:12px;bottom:12px;z-index:3;display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;justify-content:space-between;padding:8px 8px 8px 18px;border-radius:var(--radius-pill);background:color-mix(in srgb,var(--surface-solid) 88%,transparent);backdrop-filter:blur(var(--glass-blur));-webkit-backdrop-filter:blur(var(--glass-blur));border:1px solid var(--line)}
.win-cap{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:baseline;font:600 clamp(.85rem,2.2cqmin,1.05rem)/1.2 var(--font-display);color:var(--text)}
.win-cap b{font:500 .8rem/1 var(--font-mono);letter-spacing:.06em}
.win-hint{font:400 .9rem/1.2 var(--font-text);color:var(--muted)}
@container (max-width:480px){.win-hint{display:none}}
.card{position:relative;display:grid;border-radius:var(--radius-2xl);overflow:hidden;background:var(--glass-bg);border:1px solid var(--line);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-md);color:var(--text);text-decoration:none;transition:transform .25s,border-color .25s,box-shadow .25s}
.card:hover{transform:translateY(-3px);border-color:color-mix(in oklch,var(--accent) 45%,transparent);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-lg),0 0 60px color-mix(in srgb,var(--sun2) 14%,transparent)}
.cover{position:relative;aspect-ratio:1200/630;overflow:hidden;background:var(--bg2)}
.live iframe{position:absolute;left:0;top:0;width:var(--vw,100vw);height:var(--fh,100vh);border:0;transform-origin:0 0;transform:scale(var(--s,0));pointer-events:none;visibility:hidden;background:var(--bg)}
.live.ready iframe{visibility:visible}
.live.ready>img,.live.ready>.noimg{visibility:hidden}
.card h2 a{color:inherit;text-decoration:none}
.card h2 a::after{content:"";position:absolute;inset:0;border-radius:inherit}
.card:focus-within{outline:2px solid var(--accent);outline-offset:3px}
.card h2 a:focus-visible{outline:none}
.cover img{display:block;width:100%;height:100%;object-fit:cover;object-position:left top;transition:transform .6s}
.card:hover .cover img{transform:scale(1.03)}
.noimg{width:100%;height:100%;background:radial-gradient(circle at 30% 40%,color-mix(in srgb,var(--sun2) 30%,transparent),transparent 60%)}
.text{display:grid;gap:8px;align-content:center;padding:26px 28px 30px}
.feature{grid-template-columns:1.35fr 1fr}
.feature .cover{aspect-ratio:auto;min-height:100%}
.feature h2{font-size:clamp(1.8rem,1.4rem + 1.6vw,2.6rem)}
.card h2{font:650 clamp(1.35rem,3vw,1.7rem)/1.1 Sora,ui-sans-serif,sans-serif;letter-spacing:-.02em;margin:0;text-wrap:balance}
.card p{margin:0;color:var(--muted)}
.date{font:500 .8rem ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--faint);letter-spacing:.06em}
.date b{color:var(--accent-text);font-weight:600}
.go{color:var(--accent-text);font-weight:600;margin-top:6px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:16px;margin-top:16px}
footer{margin-top:72px;display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;padding:28px;border-radius:28px;border:1px solid var(--line);background:var(--glass-bg);box-shadow:inset 0 1px 0 var(--glass-edge)}
footer p{margin:0;color:var(--muted);max-width:34rem}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
@media (max-width:760px){.feature{grid-template-columns:1fr}.feature .cover{aspect-ratio:1200/630}}
@media (prefers-reduced-motion:reduce){.card,.cover img{transition:none}}
</style>
</head><body>
${hero}
<div class="wrap" id="more">
${list}
<footer><p>Solenix sets up one AI at the centre of the tools your business already uses, cuts the ones you don't, and teaches your team. A fixed price, in writing.</p><a class="btn primary" href="/book">Book a call</a></footer>
</div><script>${LIVE_JS}</script></body></html>`
  return servePage(html, { title, description, path: "/articles" })
}
