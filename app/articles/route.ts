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
// A live window shows a real page at a real screen width (data-vw: a width, or "square" to lay it out
// as a square no smaller than its box; else your screen's), scaled into its box and
// as tall as the box allows: no gaps, no crop. A window with "play" takes touches: the page inside
// reacts in place, and any link in it is a way in. Entering grows the window to the full screen, then
// the browser opens the page, which paints the same pixels.
const LIVE_JS = `(()=>{const css=getComputedStyle(document.documentElement),tok=n=>css.getPropertyValue(n).trim();
const ms=v=>parseFloat(v)*(v.endsWith("ms")?1:1000);
const box=c=>{const r=c.getBoundingClientRect(),v=c.dataset.vw,w=v=="square"?Math.max(r.width,760):+v||innerWidth,s=r.width/w;return{r,w,s,h:r.height/s}};
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

// Three heroes to compare live (?hero=orbit, phone or window). Each leads with the newest article,
// playable in place. The chosen one stays; the others go.
const HEROES = ["orbit", "phone", "window"] as const
const PICK_JS = `(()=>{const v=new URLSearchParams(location.search).get("hero");document.documentElement.dataset.hv=${JSON.stringify(HEROES)}.includes(v)?v:"${HEROES[0]}"})()`

function heroes(a: Article, more: number) {
  const t = esc(a.title)
  const still = a.cover ? `<img src="${a.cover}" alt="" width="1200" height="630">` : `<div class="noimg" aria-hidden="true"></div>`
  const live = (vw = "") => `<div class="cover live play"${vw ? ` data-vw="${vw}"` : ""}>${still}<iframe src="${a.path}" tabindex="-1" aria-hidden="true" title=""></iframe></div>`
  const enter = `<a class="enter" href="${a.path}">Enter ${t}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`
  const cue = `<a class="sx-cue" href="#more">${more ? "More articles" : "About Solenix"} ↓</a>`
  return `
<header class="sx-hero hv hv-orbit" data-hero data-live-scope>
 <div class="sx-hero-in">
  <div class="sx-hero-text">
   <h1>Pages you can <em>play with</em></h1>
   <p class="sx-sub">Touch the live article. Then step inside.</p>
   <div>${enter}</div>
  </div>
  <div class="orbit"><div class="orbit-disc">
   <svg class="orbit-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="49" /></svg>
   <span class="orbit-dot" aria-hidden="true"><i></i></span>
   ${live("square")}
   <span class="orbit-tag"><b>New</b> ${t}</span>
  </div></div>
 </div>
 ${cue}
</header>
<header class="sx-hero hv hv-phone" data-hero data-live-scope>
 <div class="sx-hero-in">
  <div class="sx-hero-text">
   <h1>Pages you can <em>play with</em></h1>
   <p class="sx-sub">Made for the phone in your hand. Tap a square.</p>
   <div>${enter}</div>
  </div>
  <div class="phone">
   <div class="phone-body">${live("390")}<span class="tap" aria-hidden="true"></span></div>
  </div>
 </div>
 ${cue}
</header>
<header class="sx-hero hv hv-window" data-hero data-live-scope>
 <h1 class="sr">Articles: pages you can play with</h1>
 <div class="win">
  ${live()}
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
    ? heroes(first, rest.length)
    : `<header class="sx-hero" data-hero><div class="sx-hero-in"><div class="sx-hero-text"><h1>Pages you can <em>play with</em>, on their way</h1><p class="sx-sub">The first one is almost ready.</p></div></div></header>`
  const list = rest.length ? `<div class="grid">${rest.map((a) => card(a)).join("")}</div>` : ""
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title><script>${PICK_JS}</script><meta name="description" content="${esc(description)}">
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
/* The heroes being compared: only the picked one shows. */
html:not([data-hv="orbit"]) .hv-orbit,html:not([data-hv="phone"]) .hv-phone,html:not([data-hv="window"]) .hv-window{display:none}
.hv h1 em{font-style:normal;color:var(--accent-text)}
.enter{display:inline-flex;align-items:center;gap:10px;min-height:var(--tap-min);padding:0 20px 0 22px;border-radius:var(--radius-pill);background:var(--accent);color:var(--accent-ink);font:600 clamp(.9rem,2cqmin,1.05rem)/1 var(--font-text);text-decoration:none;white-space:nowrap;box-shadow:0 8px 24px -8px color-mix(in srgb,var(--accent) 60%,transparent);transition:background .2s,transform .2s}
.enter:hover{background:var(--accent-hover);transform:translateY(-1px)}
.enter svg{width:16px;height:16px}
.live.play iframe{pointer-events:auto}
/* Orbit: the article is the sun, seen through a round window, with the mark's ring and agent dot. */
.orbit{height:100%;width:100%;container-type:size;display:grid;place-items:center}
.orbit-disc{position:relative;width:calc(min(100cqw,100cqh) - 24px);aspect-ratio:1;display:grid;place-items:center}
.orbit .live{width:86%;aspect-ratio:1;border-radius:50%;box-shadow:0 0 0 1px var(--line-strong),0 30px 80px -20px color-mix(in srgb,var(--sun2) 45%,transparent),0 0 120px color-mix(in srgb,var(--sun2) 18%,transparent)}
.orbit-ring{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.orbit-ring circle{fill:none;stroke:var(--ring);stroke-opacity:.35;stroke-width:.3}
.orbit-dot{position:absolute;inset:0;animation:snav-orbit 90s linear infinite;pointer-events:none}
.orbit-dot i{position:absolute;top:calc(.7% - 6px);left:50%;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:var(--ring);box-shadow:0 0 14px var(--sun1)}
.orbit-tag{position:absolute;bottom:2%;left:50%;transform:translateX(-50%);z-index:3;padding:.55em 1em;border-radius:var(--radius-pill);background:color-mix(in srgb,var(--surface-solid) 86%,transparent);border:1px solid var(--line);font:500 clamp(.68rem,1.6cqmin,.9rem)/1 var(--font-mono);letter-spacing:.06em;color:var(--muted);white-space:nowrap}
.orbit-tag b,.win-cap b{color:var(--accent-text);font-weight:600;margin-right:.5em}
/* Phone: the article on the screen it was made for, at true size, beside the words. */
.phone{height:100%;width:100%;container-type:size;display:grid;place-items:center}
.phone-body{position:relative;box-sizing:border-box;height:min(100cqh,calc(100cqw * 844 / 390));aspect-ratio:390/844;padding:10px;border-radius:clamp(28px,6cqh,52px);background:var(--surface-solid);box-shadow:inset 0 1px 0 var(--glass-edge),0 0 0 1px var(--line-strong),0 40px 90px -30px color-mix(in srgb,var(--sun2) 40%,transparent)}
.phone .live{width:100%;height:100%;aspect-ratio:auto;border-radius:clamp(20px,5cqh,42px)}
.tap{position:absolute;left:50%;top:62%;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:2px solid var(--accent);pointer-events:none;animation:tap 1.8s var(--ease-out) infinite}
@keyframes tap{0%{transform:scale(.5);opacity:1}100%{transform:scale(1.6);opacity:0}}
.touched .tap,.touched .win-hint{display:none}
@container (aspect-ratio <= 1.15){.hv-phone .sx-hero-text{align-items:center;text-align:center}.hv-phone .sx-sub{margin-inline:auto}}
/* Window: no words above it. The live article fills the first screen; a bar names it and lets you in. */
.hv-window{padding-top:var(--nav-height)}
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
