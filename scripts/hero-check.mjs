// Every page's first screen is its hero, and a hero that does not fit the screen has failed.
// For each page with a hero and each size in design/viewports.json, this opens the page and checks:
//   the [data-hero] element starts at the top and is exactly one screen tall,
//   nothing inside it spills out, hides under the nav or sits on other text, the page never scrolls sideways,
//   and the headline (its h1) has 12 words or fewer.
// Pages come from the code (the same list the journey check reads), so a new page is checked
// without being listed here. Runs against a local server only: nothing outside the repo.
//   npm run hero-check [-- <base url>]   (starts the dev server itself when none is running)
import { execFileSync, spawn } from "node:child_process"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { launch } from "./browser.mjs"

const sizes = (() => {
  const v = JSON.parse(readFileSync("design/viewports.json", "utf8"))
  const all = [...v.real.sizes, ...v.edges].map(({ w, h }) => ({ w, h }))
  return all.filter((s, i) => all.findIndex((t) => t.w === s.w && t.h === s.h) === i)
})()
// Every public page, found from the routes (never a hand-kept list): app/**/route.ts and page.tsx,
// route groups dropped, the client platform under /app and non-page routes (feeds, files, dynamic
// segments) left out; each article from articles/.
const routes = (dir, at = "") => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  if (e.isDirectory()) return /^\[|^\(portal\)$|^api$|\./.test(e.name) ? [] : routes(`${dir}/${e.name}`, /^\(.*\)$/.test(e.name) ? at : `${at}/${e.name}`)
  return /^(route\.ts|page\.tsx)$/.test(e.name) ? [at || "/"] : []
})
const pages = [...new Set([...routes("app"), ...readdirSync("articles").filter((a) => !a.startsWith("_") && statSync(`articles/${a}`).isDirectory()).map((a) => `/articles/${a}`)])]

let base = process.argv[2] ?? "http://localhost:3000"
const up = () => fetch(base).then((r) => r.ok, () => false)
let server
if (!(await up())) {
  base = "http://localhost:3123"
  execFileSync("node", ["scripts/vendor.mjs"]) // what predev does for npm run dev
  server = spawn("npx", ["next", "dev", "-p", "3123"], { stdio: "ignore" })
  for (let i = 0; i < 120 && !(await up()); i++) await new Promise((r) => setTimeout(r, 500))
}

const measure = () => {
  const hero = [...document.querySelectorAll("[data-hero]")].find((e) => e.getClientRects().length) // the one shown
  if (!hero) return ["has no [data-hero] element (mark the first screen)"]
  const out = []
  const r = hero.getBoundingClientRect(), H = innerHeight, W = innerWidth
  if (Math.abs(r.top) > 1) out.push(`hero starts ${Math.round(r.top)}px from the top`)
  if (Math.abs(r.height - H) > 1) out.push(`hero is ${Math.round(r.height)}px tall; the screen is ${H}px`)
  if (document.documentElement.scrollWidth > W + 1) out.push(`page scrolls sideways (${document.documentElement.scrollWidth}px wide)`)
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== hero; p = p.parentElement) if (getComputedStyle(p).overflow !== "visible") return true
    return false
  }
  for (const el of hero.querySelectorAll("h1,h2,p,a,button,canvas,svg,img,[role=button],li")) {
    const b = el.getBoundingClientRect(), cs = getComputedStyle(el)
    if (!b.width || !b.height || cs.visibility === "hidden" || cs.position === "fixed" || clipped(el)) continue
    if (b.bottom > r.bottom + 1 || b.top < r.top - 1 || b.right > W + 1 || b.left < -1) {
      out.push(`<${el.tagName.toLowerCase()}> "${(el.textContent || "").trim().slice(0, 40)}" spills out of the hero`)
      break
    }
  }
  // Nothing in the hero hides under a bar that floats over it: a fixed bar, or the site nav, which
  // scrolls away with an article (lib/site-nav.mjs). A bar not shown yet (hidden) covers nothing.
  const bars = [...document.querySelectorAll("body *")].filter((e) => {
    const cs = getComputedStyle(e)
    return (cs.position === "fixed" || e.matches("[data-snav]")) && cs.visibility !== "hidden" && !hero.contains(e)
  })
    .map((e) => e.getBoundingClientRect()).filter((b) => b.width > W / 2 && b.height && b.height < H / 3)
  for (const el of hero.querySelectorAll("h1,h2,p,a,button,.eyebrow,[role=button]")) {
    const b = el.getBoundingClientRect()
    if (b.width && b.height && !el.closest("[data-overlay]") && bars.some((bar) => b.top < bar.bottom - 1 && b.bottom > bar.top + 1)) {
      out.push(`"${el.textContent.trim().slice(0, 30)}" is hidden under a fixed bar (the nav)`)
      break
    }
  }
  // Text never sits on top of other text, except an overlay meant to float (data-overlay).
  const texts = [...hero.querySelectorAll("*")].filter((el) => {
    if (el.closest("[data-overlay]") || getComputedStyle(el).visibility === "hidden") return false
    return [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
  }).map((el) => ({ el, b: el.getBoundingClientRect() })).filter(({ b }) => b.width && b.height)
  overlap: for (let i = 0; i < texts.length; i++)
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], c = texts[j]
      if (a.el.contains(c.el) || c.el.contains(a.el)) continue
      const x = Math.min(a.b.right, c.b.right) - Math.max(a.b.left, c.b.left), y = Math.min(a.b.bottom, c.b.bottom) - Math.max(a.b.top, c.b.top)
      // Tight leading lets line boxes touch; a real collision covers over a quarter of a line.
      if (x > 2 && y > Math.min(a.b.height, c.b.height) / 4) {
        out.push(`"${a.el.textContent.trim().slice(0, 30)}" overlaps "${c.el.textContent.trim().slice(0, 30)}"`)
        break overlap
      }
    }
  const h1 = hero.querySelector("h1")
  if (!h1) out.push("hero has no h1 headline")
  else if (h1.textContent.trim().split(/\s+/).length > 12) out.push(`headline has ${h1.textContent.trim().split(/\s+/).length} words (12 at most)`)
  return out
}

const browser = await launch()
let bad = 0
try {
  for (const path of pages)
    for (const { w, h } of sizes) {
      const page = await browser.newPage({ viewport: { width: w, height: h } })
      await page.goto(base + path, { waitUntil: "load" })
      await page.evaluate(() => document.fonts.ready)
      // Judge the settled first screen: wait for one-off animations (not endless ones) to end.
      await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running" || a.effect.getComputedTiming().endTime === Infinity), null, { timeout: 10000 }).catch(() => {})
      for (const p of await page.evaluate(measure)) {
        console.log(`hero: ${path} at ${w}×${h}: ${p}`)
        bad++
      }
      await page.close()
    }
} finally {
  await browser.close()
  server?.kill()
}
if (!bad) console.log(`hero: ${pages.length} pages fit all ${sizes.length} screen sizes`)
process.exit(bad ? 1 : 0)
