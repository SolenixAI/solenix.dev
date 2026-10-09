// The Articles page's live windows. Every size and time is read live: the screen, the box, the tokens.
// A live window shows a real page at your screen's width, scaled into its box and as tall as the box
// allows: no gaps, no crop. A window with "play" takes touches: the page inside reacts in place, and
// any link in it is a way in. Entering opens the page at once and grows the window toward the full
// screen while it loads; the browser's page-to-page cross-fade takes over from wherever the grow has
// reached when the page is ready. No waiting on a timer.
export {}

const rootStyle = getComputedStyle(document.documentElement)
const token = (name: string) => rootStyle.getPropertyValue(name).trim()
const ms = (v: string) => parseFloat(v) * (v.endsWith("ms") ? 1 : 1000)

const box = (c: HTMLElement) => {
  const r = c.getBoundingClientRect(), w = innerWidth, s = r.width / w
  return { r, w, s, h: r.height / s }
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

for (const frame of document.querySelectorAll<HTMLIFrameElement>(".live iframe")) {
  const c = frame.parentElement as HTMLElement
  const ready = () => {
    c.classList.add("ready")
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
  frame.addEventListener("load", ready)
  try { if (frame.contentDocument?.readyState === "complete" && frame.contentDocument.URL !== "about:blank") ready() } catch { /* not loaded */ }
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
