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
  return `<article class="card${feature ? " feature" : ""}">
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
const box=c=>{const r=c.getBoundingClientRect(),s=Math.min(r.width/innerWidth,r.height/innerHeight);return{r,s,x:(r.width-innerWidth*s)/2,y:(r.height-innerHeight*s)/2}};
function fit(){document.querySelectorAll(".live").forEach(c=>{const b=box(c);c.style.setProperty("--s",b.s);c.style.setProperty("--x",b.x+"px");c.style.setProperty("--y",b.y+"px")})}
fit();addEventListener("resize",fit);new ResizeObserver(fit).observe(document.body);
document.querySelectorAll(".live iframe").forEach(f=>{const on=()=>f.parentElement.classList.add("ready");f.addEventListener("load",on);try{if(f.contentDocument&&f.contentDocument.readyState=="complete"&&f.contentDocument.URL!="about:blank")on()}catch(e){}});
document.addEventListener("click",e=>{const a=e.target.closest(".card a[href]");if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 const card=a.closest(".card"),c=card.querySelector(".live.ready");if(!c)return;e.preventDefault();
 const f=c.querySelector("iframe"),b=box(c),rad=parseFloat(getComputedStyle(f).borderTopLeftRadius)||0;
 card.style.transition="none";card.style.transform="none";
 f.style.cssText="position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:calc(var(--z-nav) - 1);transform-origin:0 0";
 f.animate([{transform:"translate("+(b.r.left+b.x)+"px,"+(b.r.top+b.y)+"px) scale("+b.s+")",borderRadius:rad/b.s+"px"},{transform:"none",borderRadius:"0px"}],
  {duration:ms(tok("--dur-slow")),easing:tok("--ease-out"),fill:"forwards"}).finished.then(()=>location.assign(a.href))});
addEventListener("pageshow",e=>{if(!e.persisted)return;document.querySelectorAll(".live iframe").forEach(f=>{f.getAnimations().forEach(x=>x.cancel());f.style.cssText=""});document.querySelectorAll(".card").forEach(c=>c.style.cssText="");fit()});
})()`

export async function GET() {
  const [first, ...rest] = await listArticles()
  const title = "Articles"
  const description = "Explorable stories about what AI can do now. Each one is a page you can play with."
  const list = first
    ? card(first, true) + (rest.length ? `<div class="grid">${rest.map((a) => card(a)).join("")}</div>` : "")
    : `<p class="lede">The first article is on its way.</p>`
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
.wrap{position:relative;max-width:64rem;margin:0 auto;padding:120px 20px 96px}
.eyebrow{font:600 .8rem/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
h1{font:700 clamp(2.6rem,1.9rem + 3vw,4.6rem)/.98 Sora,ui-sans-serif,sans-serif;letter-spacing:-.045em;margin:16px 0 14px;text-wrap:balance}
h1 .grad{background:var(--grad-headline);-webkit-background-clip:text;background-clip:text;color:transparent}
.lede{color:var(--muted);font-size:clamp(1.05rem,2.6vw,1.25rem);max-width:34rem;margin:0 0 44px}
.card{position:relative;display:grid;border-radius:var(--radius-2xl);overflow:hidden;background:var(--glass-bg);border:1px solid var(--line);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-md);color:var(--text);text-decoration:none;transition:transform .25s,border-color .25s,box-shadow .25s}
.card:hover{transform:translateY(-3px);border-color:color-mix(in oklch,var(--accent) 45%,transparent);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-lg),0 0 60px color-mix(in srgb,var(--sun2) 14%,transparent)}
.cover{position:relative;aspect-ratio:1200/630;overflow:hidden;background:var(--bg2)}
.live iframe{position:absolute;left:0;top:0;width:100vw;height:100vh;border:0;border-radius:calc(var(--radius-lg) / var(--s,1));transform-origin:0 0;transform:translate(var(--x,0),var(--y,0)) scale(var(--s,0));pointer-events:none;visibility:hidden;background:var(--bg);box-shadow:0 0 0 calc(1px / var(--s,1)) var(--line-strong)}
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
<div class="wrap">
<div class="eyebrow">Articles</div>
<h1>What AI can do now, in pages you can <span class="grad">play with</span></h1>
<p class="lede">${esc(description)}</p>
${list}
<footer><p>Solenix sets up one AI at the centre of the tools your business already uses, cuts the ones you don't, and teaches your team. A fixed price, in writing.</p><a class="btn primary" href="/book">Book a call</a></footer>
</div><script>${LIVE_JS}</script></body></html>`
  return servePage(html, { title, description, path: "/articles" })
}
