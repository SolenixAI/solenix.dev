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

// Runs on /articles. Every size and time is read live: the screen, the card, the tokens.
const LIVE_JS = `(()=>{const css=getComputedStyle(document.documentElement),tok=n=>css.getPropertyValue(n).trim();
const ms=v=>parseFloat(v)*(v.endsWith("ms")?1:1000);
// The window fills its box: the page inside is your screen's width, and as tall as the box allows.
// Every hero fits any height, so the page lays itself out for the box. No gaps, no crop.
const box=c=>{const r=c.getBoundingClientRect(),s=r.width/innerWidth;return{r,s,h:r.height/s}};
function fit(){document.querySelectorAll(".live").forEach(c=>{const b=box(c);c.style.setProperty("--s",b.s);c.style.setProperty("--fh",b.h+"px")})}
fit();addEventListener("resize",fit);new ResizeObserver(fit).observe(document.body);
document.querySelectorAll(".live iframe").forEach(f=>{const on=()=>f.parentElement.classList.add("ready");f.addEventListener("load",on);try{if(f.contentDocument&&f.contentDocument.readyState=="complete"&&f.contentDocument.URL!="about:blank")on()}catch(e){}});
document.addEventListener("click",e=>{const a=e.target.closest("a[href]"),card=a&&a.closest("[data-live-scope]");if(!card||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 const c=card.querySelector(".live.ready");if(!c)return;e.preventDefault();
 const f=c.querySelector("iframe"),b=box(c),rad=parseFloat(getComputedStyle(f).borderTopLeftRadius)||0;
 card.style.transition="none";card.style.transform="none";
 f.style.cssText="position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:calc(var(--z-nav) - 1);transform-origin:0 0";
 f.animate([{transform:"translate("+b.r.left+"px,"+b.r.top+"px) scale("+b.s+")",height:b.h+"px",borderRadius:rad/b.s+"px"},{transform:"none",height:innerHeight+"px",borderRadius:"0px"}],
  {duration:ms(tok("--dur-slow")),easing:tok("--ease-out"),fill:"forwards"}).finished.then(()=>location.assign(a.href))});
addEventListener("pageshow",e=>{if(!e.persisted)return;document.querySelectorAll(".live iframe").forEach(f=>{f.getAnimations().forEach(x=>x.cancel());f.style.cssText=""});document.querySelectorAll("[data-live-scope]").forEach(c=>c.style.cssText="");fit()});
})()`

export async function GET() {
  const [first, ...rest] = await listArticles()
  const title = "Articles"
  const description = "Explorable stories about what AI can do now. Each one is a page you can play with."
  const hero = first
    ? `<header class="sx-hero" data-hero data-live-scope>
 <div class="sx-hero-in">
  <div class="sx-hero-text">
   <div class="sx-kicker">Articles · newest ${esc(day(first.date))}</div>
   <h1>What AI can do now, in pages you can <span class="grad">play with</span></h1>
   <p class="sx-sub">Not posts to scroll past: each one is a page you can touch. Which will you try first?</p>
   <div><a class="btn primary" href="${first.path}">Enter ${esc(first.title)} →</a></div>
  </div>
  <div class="hero-live">
   <div class="cover live">${first.cover ? `<img src="${first.cover}" alt="" width="1200" height="630">` : `<div class="noimg" aria-hidden="true"></div>`}<iframe src="${first.path}" tabindex="-1" aria-hidden="true" title=""></iframe></div>
   <a class="hero-live-hit" href="${first.path}" aria-label="Enter ${esc(first.title)}, shown live"></a>
   <p class="hero-live-cap"><b>New</b> · ${esc(first.title)} · live</p>
  </div>
 </div>
 <a class="sx-cue" href="#more">${rest.length ? "More articles" : "About Solenix"} ↓</a>
</header>`
    : `<header class="sx-hero" data-hero><div class="sx-hero-in"><div class="sx-hero-text"><div class="sx-kicker">Articles</div><h1>What AI can do now, in pages you can <span class="grad">play with</span></h1><p class="sx-sub">The first one is on its way.</p></div></div></header>`
  const list = rest.length ? `<div class="grid">${rest.map((a) => card(a)).join("")}</div>` : ""
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title><meta name="description" content="${esc(description)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400..800&display=swap">
<style>
*{box-sizing:border-box}
html { background: var(--bg); }body{margin:0;background:radial-gradient(ellipse 90% 60% at 78% -10%,color-mix(in srgb,var(--sun2) 16%,transparent),transparent 60%),var(--bg);color:var(--text);font:17px/1.6 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;min-height:100vh}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(var(--grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--grid-line) 1px,transparent 1px);background-size:32px 32px}
.btn{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;font-weight:600;text-decoration:none;color:var(--text);border:1px solid var(--line-strong);font-size:.92rem;white-space:nowrap}
.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.btn.primary:hover{background:var(--accent-hover)}
.wrap{position:relative;max-width:var(--container);margin:0 auto;padding:24px 20px 96px}
.grad{background:var(--grad-headline);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero-live{height:100%;display:flex;flex-direction:column;gap:1.2cqmin}
.hero-live .cover{flex:1;min-height:0;width:100%;aspect-ratio:auto;border-radius:var(--radius-2xl);border:1px solid var(--line);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-lg),0 0 80px color-mix(in srgb,var(--sun2) 12%,transparent)}
.hero-live-hit{position:absolute;inset:0;border-radius:var(--radius-2xl);z-index:3}
.hero-live:hover .cover{border-color:color-mix(in oklch,var(--accent) 45%,transparent)}
.hero-live-cap{margin:0;font:500 clamp(.68rem,1.6cqmin,.95rem)/1.3 var(--font-mono);letter-spacing:.06em;color:var(--faint)}
.hero-live-cap b{color:var(--accent-text);font-weight:600}
.hero-live-hit:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.card{position:relative;display:grid;border-radius:var(--radius-2xl);overflow:hidden;background:var(--glass-bg);border:1px solid var(--line);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-md);color:var(--text);text-decoration:none;transition:transform .25s,border-color .25s,box-shadow .25s}
.card:hover{transform:translateY(-3px);border-color:color-mix(in oklch,var(--accent) 45%,transparent);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-lg),0 0 60px color-mix(in srgb,var(--sun2) 14%,transparent)}
.cover{position:relative;aspect-ratio:1200/630;overflow:hidden;background:var(--bg2)}
.live iframe{position:absolute;left:0;top:0;width:100vw;height:var(--fh,100vh);border:0;transform-origin:0 0;transform:scale(var(--s,0));pointer-events:none;visibility:hidden;background:var(--bg)}
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
