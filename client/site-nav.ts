// The current page in the site nav, on the raw HTML pages (the homepage, Articles, each article). It reads
// the page's location, so the markup is the same on every page. A React page marks its own current link
// from its path (components/site/nav-link.tsx). Runs after client/site-fit.ts, which removes the nav in a frame.
export {}

const nav = document.querySelector<HTMLElement>("[data-snav]")
if (nav) {
  const path = location.pathname.replace(/\/$/, "") || "/"
  for (const a of nav.querySelectorAll<HTMLAnchorElement>(".snav-links a")) {
    const href = a.getAttribute("href") ?? ""
    if (path === href || path.startsWith(href + "/")) a.setAttribute("aria-current", path === href ? "page" : "true")
  }
}
