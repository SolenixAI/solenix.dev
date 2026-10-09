// The site nav's fit and scroll state, for every page that has the nav: the raw HTML pages and the React
// pages. It runs right after the nav markup, before the first paint (compiled and inlined by
// scripts/build-client.ts): it fits the nav to its real width and marks it solid once the page scrolls.
// No timers, no fades. A page shown inside a frame (the live preview on an article card) belongs to the
// page around it, which already has the one nav; so a framed page draws none.
export {}

const nav = document.currentScript?.previousElementSibling as HTMLElement | null
if (nav && window.top !== window.self) nav.remove()
else if (nav) {
  // No width guesses: the first layout that fits, in order (lib/site-nav.ts explains each step).
  const layouts = [[], ["c1"], ["c1", "c2"], ["c1", "c3"], ["c1", "c2", "c3"]]
  const fit = () => {
    for (const classes of layouts) {
      nav.classList.remove("c1", "c2", "c3")
      nav.classList.add(...classes)
      if (nav.scrollWidth <= nav.clientWidth) return
    }
  }
  fit()
  new ResizeObserver(fit).observe(nav)
  document.fonts?.ready.then(fit)

  let frame = 0
  const solid = () => { frame = 0; nav.classList.toggle("is-solid", scrollY > 0) }
  addEventListener("scroll", () => { frame ||= requestAnimationFrame(solid) }, { passive: true })
  solid()
}
