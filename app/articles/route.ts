import { listArticles, sharedHead, type Article } from "@/lib/articles"

// solenix.dev/articles: every article, newest first and featured, built from the pages themselves.
export const dynamic = "force-static"

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
const day = (iso: string) =>
  iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : ""

const MARK = `<svg viewBox="0 0 32 32" aria-hidden="true"><defs><radialGradient id="mk" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="var(--sun1)"/><stop offset="1" stop-color="var(--sun2)"/></radialGradient></defs><circle cx="16" cy="16" r="14" fill="none" stroke="var(--ring)" stroke-opacity=".45" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="url(#mk)"/><circle cx="27" cy="9" r="2.2" fill="var(--ring)"/></svg>`

function card(a: Article, feature = false) {
  const cover = a.cover
    ? `<img src="${a.cover}" alt="" loading="${feature ? "eager" : "lazy"}" width="1200" height="630">`
    : `<div class="noimg" aria-hidden="true"></div>`
  return `<a class="card${feature ? " feature" : ""}" href="${a.path}">
  <div class="cover">${cover}</div>
  <div class="text">
    <span class="date">${esc(day(a.date))}${feature ? ` · <b>New</b>` : ""}</span>
    <h2>${esc(a.title)}</h2>
    <p>${esc(a.description)}</p>
    <span class="go">Read the article →</span>
  </div>
</a>`
}

export async function GET() {
  const [first, ...rest] = await listArticles()
  const title = "Articles · Solenix"
  const description = "Explorable stories about what AI can do now. Each one is a page you can play with."
  const list = first
    ? card(first, true) + (rest.length ? `<div class="grid">${rest.map((a) => card(a)).join("")}</div>` : "")
    : `<p class="lede">The first article is on its way.</p>`
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="color-scheme" content="dark"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title><meta name="description" content="${esc(description)}">
<link rel="stylesheet" href="/tokens.css">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400..800&display=swap">
<style>
*{box-sizing:border-box}
html { background: var(--bg); }body{margin:0;background:radial-gradient(ellipse 90% 60% at 78% -10%,rgba(249,115,22,.16),transparent 60%),var(--bg);color:var(--text);font:17px/1.6 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;min-height:100vh}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(var(--grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--grid-line) 1px,transparent 1px);background-size:32px 32px}
.nav{position:fixed;top:calc(12px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);z-index:20;width:min(calc(100% - 24px),1040px);height:60px;display:flex;align-items:center;gap:12px;padding:0 8px 0 18px;border-radius:999px;background:color-mix(in srgb,var(--surface-solid) 70%,transparent);backdrop-filter:blur(20px) saturate(140%);-webkit-backdrop-filter:blur(20px) saturate(140%);border:1px solid var(--line);box-shadow:inset 0 1px 0 var(--glass-edge),0 12px 40px rgba(0,0,0,.42)}
.brand{display:inline-flex;align-items:center;gap:8px;color:var(--text);text-decoration:none;font:650 1.15rem/1 Sora,ui-sans-serif,sans-serif;letter-spacing:-.01em;min-height:44px}
.brand svg{width:28px;height:28px}
.links{display:flex;gap:4px;margin-left:auto}
.links a{display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border-radius:999px;color:var(--muted);text-decoration:none;font-size:.92rem}
.links a:hover{background:var(--line);color:var(--text)}
.links a[aria-current]{color:var(--accent-text);background:var(--accent-quiet)}
.btn{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;font-weight:600;text-decoration:none;color:var(--text);border:1px solid var(--line-strong);font-size:.92rem;white-space:nowrap}
.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.btn.primary:hover{background:var(--accent-hover)}
.portal{gap:10px;padding-left:12px}.portal .short{display:none}
.portal .orb{position:relative;width:20px;height:20px;border-radius:50%;border:1.5px solid color-mix(in srgb,var(--ring) 55%,transparent);flex:none}
.portal .orb::before{content:"";position:absolute;inset:5px;border-radius:50%;background:radial-gradient(circle at 40% 38%,var(--sun1),var(--sun2));box-shadow:0 0 8px color-mix(in srgb,var(--sun2) 60%,transparent)}
.portal .orb i{position:absolute;inset:-1.5px;border-radius:50%;animation:orb-spin 12s linear infinite}
.portal .orb i::after{content:"";position:absolute;top:-2px;left:50%;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--text);box-shadow:0 0 6px var(--sun1)}
.portal:hover .orb i,.portal:focus-visible .orb i{animation-duration:1.4s}
@keyframes orb-spin{to{transform:rotate(360deg)}}
.wrap{position:relative;max-width:64rem;margin:0 auto;padding:120px 20px 96px}
.eyebrow{font:600 .8rem/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
h1{font:700 clamp(2.6rem,1.9rem + 3vw,4.6rem)/.98 Sora,ui-sans-serif,sans-serif;letter-spacing:-.045em;margin:16px 0 14px;text-wrap:balance}
h1 .grad{background:var(--grad-headline);-webkit-background-clip:text;background-clip:text;color:transparent}
.lede{color:var(--muted);font-size:clamp(1.05rem,2.6vw,1.25rem);max-width:34rem;margin:0 0 44px}
.card{display:grid;border-radius:28px;overflow:hidden;background:var(--glass-bg);border:1px solid var(--line);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-md);color:var(--text);text-decoration:none;transition:transform .25s,border-color .25s,box-shadow .25s}
.card:hover{transform:translateY(-3px);border-color:color-mix(in oklch,var(--accent) 45%,transparent);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-lg),0 0 60px color-mix(in srgb,var(--sun2) 14%,transparent)}
.cover{aspect-ratio:1200/630;overflow:hidden;background:var(--bg2)}
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
@media (max-width:760px){.feature{grid-template-columns:1fr}.feature .cover{aspect-ratio:1200/630}.links a.wide{display:none}}
@media (max-width:420px){.nav{padding-left:12px;gap:6px}.links a{padding:0 10px}.btn{padding:0 14px}.portal .long{display:none}.portal .short{display:inline}}
@media (prefers-reduced-motion:reduce){.card,.cover img{transition:none}.portal .orb i{animation:none;transform:rotate(45deg)}}
</style>
</head><body>
<nav class="nav" aria-label="Main"><a class="brand" href="/" aria-label="Solenix home">${MARK}Solenix</a>
  <span class="links"><a href="/articles" aria-current="page">Articles</a><a class="wide" href="/agents">Agents Marketplace</a></span>
  <a class="btn portal" href="/app" aria-label="Solenix platform: sign in"><span class="orb" aria-hidden="true"><i></i></span><span class="long">Solenix platform</span><span class="short">Platform</span></a></nav>
<div class="wrap">
<div class="eyebrow">Articles</div>
<h1>What AI can do now, in pages you can <span class="grad">play with</span></h1>
<p class="lede">${esc(description)}</p>
${list}
<footer><p>Solenix sets up one AI at the centre of the tools your business already uses, cuts the ones you don't, and teaches your team. A fixed price, in writing.</p><a class="btn primary" href="/book">Book a call</a></footer>
</div></body></html>`
  return new Response(html.replace("</head>", `${sharedHead({ title, description, path: "/articles" })}</head>`), {
    headers: { "content-type": "text/html; charset=utf-8" },
  })
}
