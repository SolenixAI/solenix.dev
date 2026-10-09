// An article's own bar: slides in as the site nav leaves (moving with the scroll, no timer), keeps the
// section you are in marked, the reading line in step, closes the section list on a pick, and shares
// through the device's own share sheet (a copied link where there is none). Inlined after the bar's
// markup by scripts/build-client.ts.
export {}

const bar = document.currentScript?.previousElementSibling as HTMLElement | null
const siteNav = document.querySelector<HTMLElement>("[data-snav]")
if (bar && window.top !== window.self) bar.remove()
else if (bar) {
  const links = [...bar.querySelectorAll<HTMLAnchorElement>(".lnav-in a, .lnav-list a")]
  const list = bar.querySelector<HTMLElement>("[popover]")
  const current = bar.querySelector<HTMLElement>(".lnav-cur .lab")
  const progress = bar.querySelector<HTMLElement>(".lnav-prog")
  const share = bar.querySelector<HTMLButtonElement>(".lnav-share")
  const shareLabel = share?.querySelector<HTMLElement>(".lab")
  const shareText = shareLabel?.textContent ?? ""
  const noSection = current?.textContent ?? ""
  const ids = [...new Set(links.map((a) => a.hash.slice(1)))]

  // First layout that fits: every section link; l1 the section you are in; l2 Share as an icon;
  // l3 without the mark; l4 without the title.
  const layouts = [[], ["l1"], ["l1", "l2"], ["l1", "l2", "l3"], ["l1", "l2", "l3", "l4"]]
  const fit = () => {
    for (const classes of layouts) {
      bar.classList.remove("l1", "l2", "l3", "l4")
      bar.classList.add(...classes)
      if (bar.scrollWidth <= bar.clientWidth) return
    }
  }
  fit()
  new ResizeObserver(fit).observe(bar)
  document.fonts?.ready.then(fit)

  let frame = 0
  let shown: string | null | undefined
  const update = () => {
    frame = 0
    const navBottom = siteNav ? siteNav.offsetTop + siteNav.offsetHeight : 0
    const height = bar.offsetTop + bar.offsetHeight + 4
    const offset = Math.min(0, Math.max(0, scrollY - navBottom) - height)
    bar.style.setProperty("--ly", offset + "px")
    bar.classList.toggle("is-on", offset > -height)

    let section: string | null = null
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el && el.getBoundingClientRect().top <= height) section = id
    }
    if (section !== shown) {
      shown = section
      let on: HTMLAnchorElement | undefined
      for (const a of links) {
        if (a.hash === "#" + section) { a.setAttribute("aria-current", "location"); on = a }
        else a.removeAttribute("aria-current")
      }
      if (current) current.textContent = on?.textContent ?? noSection
    }
    const root = document.documentElement
    if (progress) progress.style.transform = `scaleX(${Math.min(1, root.scrollTop / Math.max(1, root.scrollHeight - innerHeight))})`
  }
  addEventListener("scroll", () => { frame ||= requestAnimationFrame(update) }, { passive: true })
  addEventListener("resize", update)
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", update)
  else update()

  list?.addEventListener("click", (e) => { if ((e.target as Element).closest("a")) list.hidePopover() })
  share?.addEventListener("click", async () => {
    const url = location.origin + location.pathname
    if (navigator.share) {
      try { await navigator.share({ title: document.title, url }) } catch { /* the visitor closed the sheet */ }
      return
    }
    try { await navigator.clipboard.writeText(url); if (shareLabel) shareLabel.textContent = "Link copied" } catch { /* no clipboard */ }
  })
  for (const type of ["mouseleave", "blur"]) share?.addEventListener(type, () => { if (shareLabel) shareLabel.textContent = shareText })
}
