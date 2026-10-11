// The homepage is a journey of stops: one scroll gesture (a wheel turn, a trackpad swipe, a touch swipe, a key) moves
// to the next stop and holds there, so no scene or step is ever skipped. The stops are the top of the page, each
// .jr-stop that lib/home/ui.ts places in the pinned scenes (their data-stops), the close, and the end of the page.
// Native CSS snapping cannot do this: Chrome snaps a single wheel tick back to where it started.
import { listener } from "./listen.ts";

const NEAR = 3 // px: a stop this close is where the page is
const PAUSE = 180 // ms without a wheel event: the gesture has ended
const SPEED_UP = 1.8 // a delta this much bigger than the last one, during momentum, is a new swipe

/** The stop one gesture in direction `dir` goes to from `y`, or null at the end of the journey. */
export function nextStop(stops: readonly number[], y: number, dir: 1 | -1): number | null {
  if (dir > 0) { for (const s of stops) if (s > y + NEAR) return s; return null }
  for (let i = stops.length - 1; i >= 0; i--) if (stops[i] < y - NEAR) return stops[i]
  return null
}

/** A wheel gesture tracker: given each event's time and delta, says whether it starts a new gesture (a pause, a turn,
 * or a fresh swipe during the last one's momentum) or belongs to the one under way. */
export function gesture() {
  let last = -Infinity, lastDelta = 0
  return (t: number, delta: number): boolean => {
    const fresh = t - last > PAUSE || Math.sign(delta) !== Math.sign(lastDelta) || Math.abs(delta) > Math.abs(lastDelta) * SPEED_UP + 4
    last = t; lastDelta = delta
    return fresh
  }
}

/** Starts the stepper on the homepage; the function it returns removes every listener it added. */
export function startStepper(reduce: MediaQueryList): () => void {
  const l = listener()
  const isNew = gesture()
  let moving = 0, touchY: number | null = null
  const stops = () => {
    const end = document.documentElement.scrollHeight - innerHeight
    // The close is a stop of its own, for a screen too short to hold it with the footer.
    const ys = [...document.querySelectorAll<HTMLElement>(".jr-stop, .finale")].map((s) => Math.round(s.getBoundingClientRect().top + scrollY))
    return [...new Set([0, ...ys, end])].filter((y) => y <= end).sort((a, b) => a - b).filter((y, i, a) => i === 0 || y - a[i - 1] > NEAR)
  }
  // A gesture meant for something that scrolls on its own (a list, a code block) is left to it.
  const ownScroll = (target: EventTarget | null, dir: number) => {
    for (let el = target instanceof Element ? target : null; el && el !== document.documentElement; el = el.parentElement) {
      const o = getComputedStyle(el).overflowY
      if ((o === "auto" || o === "scroll") && el.scrollHeight > el.clientHeight + 1)
        if (dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true
    }
    return false
  }
  function go(dir: 1 | -1) {
    const to = nextStop(stops(), scrollY, dir)
    if (to === null) return
    cancelAnimationFrame(moving)
    if (reduce.matches) { scrollTo({ top: to, behavior: "instant" }); return }
    const from = scrollY, dist = to - from, ms = Math.min(1100, 520 + Math.abs(dist) * 0.25), t0 = performance.now()
    const ease = (x: number) => 1 - Math.pow(1 - x, 4)
    const frame = (now: number) => {
      const x = Math.min(1, (now - t0) / ms)
      scrollTo({ top: from + dist * ease(x), behavior: "instant" })
      moving = x < 1 ? requestAnimationFrame(frame) : 0
    }
    moving = requestAnimationFrame(frame)
  }
  l.on(window, "wheel", (e: WheelEvent) => {
    if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX) || ownScroll(e.target, e.deltaY)) return
    e.preventDefault()
    if (isNew(e.timeStamp, e.deltaY) && Math.abs(e.deltaY) >= 1) go(e.deltaY > 0 ? 1 : -1)
  }, { passive: false })
  l.on(window, "touchstart", (e: TouchEvent) => { touchY = e.touches.length === 1 ? e.touches[0].clientY : null }, { passive: true })
  l.on(window, "touchmove", (e: TouchEvent) => { if (touchY !== null && !ownScroll(e.target, touchY - e.touches[0].clientY)) e.preventDefault() }, { passive: false })
  l.on(window, "touchend", (e: TouchEvent) => {
    if (touchY === null) return
    const dy = touchY - e.changedTouches[0].clientY
    touchY = null
    if (Math.abs(dy) > 24) go(dy > 0 ? 1 : -1)
  }, { passive: true })
  l.on(window, "keydown", (e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey || (e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable], [role=tab], [role=tablist]"))) return
    const dir = ["ArrowDown", "PageDown", " "].includes(e.key) && !(e.key === " " && e.shiftKey) ? 1 : ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey) ? -1 : 0
    if (!dir) return
    e.preventDefault()
    go(dir)
  })
  l.add(() => cancelAnimationFrame(moving))
  return () => l.stop()
}
