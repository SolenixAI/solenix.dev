// The Articles page's live windows. Every size and time is read live: the screen, the box, the tokens.
// A live window shows a real page at your screen's width, scaled into its box and as tall as the box
// allows: no gaps, no crop. A window with "play" takes touches: the page inside reacts in place, and
// any link in it is a way in. Entering opens the page at once and grows the window toward the full
// screen while it loads; the browser's page-to-page cross-fade takes over from wherever the grow has
// reached when the page is ready. No waiting on a timer.
//
// The page inside loads once its still is decoded (a hero: after two more frames, so the still shows first, alone)
// or as it nears the screen (a card). It is display:none until it is on screen and loaded, so nothing in it runs
// while it is not shown. Then it runs for three frames under its still, so it has drawn what it shows, and the
// still gives way without a jump. Once it scrolls away, its own observers stop its loops.
export {}

const rootStyle = getComputedStyle(document.documentElement)
const token = (name: string) => rootStyle.getPropertyValue(name).trim()
const ms = (v: string) => parseFloat(v) * (v.endsWith("ms") ? 1 : 1000)

// The page renders at the width of its still (the picture it replaces), so the still and the live page
// are the same picture scaled by the same amount. Until the still has loaded, the screen's width stands in.
// Its height is the still's too: the page's first screen is sized from its own box, so a page laid out at
// the still's size is the still's picture, and the window shows the top of it, as the still does.
const layout = (c: HTMLElement) => c.querySelector<HTMLImageElement>(":scope > picture img, :scope > img")
const box = (c: HTMLElement) => {
  const r = c.getBoundingClientRect(), still = layout(c), w = still?.naturalWidth || innerWidth, s = r.width / w
  return { r, w, s, h: still?.naturalHeight || r.height / s }
}
const fit = () => {
  for (const c of document.querySelectorAll<HTMLElement>(".live")) {
    const b = box(c)
    c.style.setProperty("--s", String(b.s))
    c.style.setProperty("--vw", b.w + "px")
    c.style.setProperty("--fh", b.h + "px")
  }
}
fit()
addEventListener("resize", fit)
for (const img of document.querySelectorAll<HTMLImageElement>(".live :is(picture img, img)")) img.addEventListener("load", fit)
new ResizeObserver(fit).observe(document.body)

function enter(c: HTMLElement, href: string) {
  const frame = c.querySelector("iframe")
  if (!frame) { location.assign(href); return }
  const b = box(c), radius = parseFloat(getComputedStyle(c).borderTopLeftRadius) || 0
  const card = c.closest<HTMLElement>("[data-live-scope]")
  if (card) { card.style.transition = "none"; card.style.transform = "none" }
  frame.style.cssText = "position:fixed;left:0;top:0;z-index:calc(var(--z-nav) - 1);transform-origin:0 0;visibility:visible;pointer-events:none"
  frame.animate(
    [
      { transform: `translate(${b.r.left}px,${b.r.top}px) scale(${b.s})`, width: b.w + "px", height: b.h + "px", borderRadius: Math.min(radius, b.r.width / 2) / b.s + "px" },
      { transform: "none", width: innerWidth + "px", height: innerHeight + "px", borderRadius: "0px" },
    ],
    { duration: ms(token("--dur-slow")), easing: token("--ease-out"), fill: "forwards" },
  )
  location.assign(href)
}

// Runs fn once n more frames have been drawn.
function frames(n: number, fn: () => void) {
  if (n > 0) requestAnimationFrame(() => frames(n - 1, fn))
  else fn()
}

// A play window: the page's own links take you in, and the page reacts to a touch.
function touch(frame: HTMLIFrameElement, c: HTMLElement) {
  if (!c.classList.contains("play")) return
  try {
    const doc = frame.contentDocument
    if (!doc) return
    doc.documentElement.style.overflow = "hidden"
    doc.addEventListener("click", (e) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>("a[href]")
      if (!a || e.defaultPrevented) return
      e.preventDefault()
      enter(c, a.href)
    }, true)
    doc.addEventListener("pointerdown", () => c.closest("[data-hero]")?.classList.add("touched"), { once: true })
  } catch { /* another origin: the window stays a picture */ }
}

// Reduced motion draws the page once, when it loads, from its box: that page must be laid out at load.
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches

for (const frame of document.querySelectorAll<HTMLIFrameElement>(".live iframe[data-src]")) {
  const c = frame.parentElement as HTMLElement
  const hero = c.closest("[data-hero]") !== null
  let loaded = false, onScreen = false, shown = false
  if (reduced) frame.hidden = false
  const show = () => {
    if (shown || !loaded || !onScreen) return
    shown = true
    frame.hidden = false
    frames(3, () => c.classList.add("ready"))
  }
  // The page loads once its still is decoded, so the still's size (which the page is laid out at) is final. A hero
  // waits two more frames too: its still shows first, alone.
  const load = () => {
    const img = c.querySelector<HTMLImageElement>("img")
    const go = () => { fit(); frames(hero ? 2 : 0, () => { frame.src = frame.dataset.src ?? "" }) }
    if (img) img.decode().then(go, go)
    else go()
  }
  if (hero) load()
  else new IntersectionObserver((entries, io) => {
    if (!entries[0]?.isIntersecting) return
    io.disconnect()
    load()
  }, { rootMargin: "200px" }).observe(c)
  new IntersectionObserver((entries) => {
    onScreen = entries[0]?.isIntersecting ?? false
    show()
  }).observe(c)
  frame.addEventListener("load", () => {
    if (frame.contentDocument?.URL === "about:blank") return // the empty page an iframe starts with
    loaded = true
    touch(frame, c)
    show()
  })
}

document.addEventListener("click", (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>("a[href]")
  const scope = a?.closest("[data-live-scope]")
  if (!a || !scope || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const c = scope.querySelector<HTMLElement>(".live.ready")
  if (!c || c.offsetParent === null) return
  e.preventDefault()
  enter(c, a.href)
})

addEventListener("pageshow", (e) => {
  if (!e.persisted) return
  for (const frame of document.querySelectorAll<HTMLIFrameElement>(".live iframe")) {
    for (const anim of frame.getAnimations()) anim.cancel()
    frame.style.cssText = ""
  }
  for (const c of document.querySelectorAll<HTMLElement>("[data-live-scope]")) c.style.cssText = ""
  fit()
})
