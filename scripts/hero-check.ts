// Every page's first screen is its hero, and a hero that does not fit the screen has failed. Its first frame is
// dark too: with every stylesheet, script, font and image held back, the page still paints dark (the site's ground,
// or the browser's own dark from color-scheme on an article), so a visitor never sees a bright flash while the rest loads.
// For every page, at the first size in design/viewports.json, it checks that first frame. Then for each page with a
// hero and each size, it opens the page and checks:
//   the [data-hero] element starts at the top and is exactly one screen tall,
//   nothing inside it spills out, hides under the nav or sits on other text, the page never scrolls sideways,
//   and the headline (its h1) has 12 words or fewer.
// Pages come from the code (the same list the journey check reads), so a new page is checked
// without being listed here. Runs against a local server only: nothing outside the repo.
//   npm run hero-check [-- <base url>]   (starts its own dev server unless :3000 serves this checkout)
import { execFileSync, spawn } from "node:child_process"
import { createServer, type AddressInfo } from "node:net"
import { readdirSync, statSync } from "node:fs"
import { inflateSync } from "node:zlib"
import { launch } from "./browser.ts"
import { loadViewports } from "../lib/viewports.ts"

const sizes = loadViewports().hero
// Every public page, found from the routes (never a hand-kept list): app/**/route.ts and page.tsx,
// route groups dropped, non-page routes (feeds, files, dynamic
// segments) left out; each article from articles/.
const routes = (dir: string, at = ""): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  if (e.isDirectory()) return /^\[|^api$|\./.test(e.name) ? [] : routes(`${dir}/${e.name}`, /^\(.*\)$/.test(e.name) ? at : `${at}/${e.name}`)
  return /^(route\.ts|page\.tsx)$/.test(e.name) ? [at || "/"] : []
})
const candidates = [...new Set([...routes("app"), ...readdirSync("articles").filter((a) => !a.startsWith("_") && statSync(`articles/${a}`).isDirectory()).map((a) => `/articles/${a}`)])]

// The pages measured must be this checkout's. A base URL given by the caller (argument or SITE_URL, the variable
// scripts/check.sh uses) is used as given. Otherwise the dev server on :3000 is used only when it runs from this
// checkout: one started from another worktree serves other code. Else this check starts its own, on a free port.
const given = process.argv[2] ?? process.env.SITE_URL?.replace(/\/$/, "")
let base = given ?? "http://localhost:3000"
const up = () => fetch(base).then((r) => r.ok, () => false)
const servesHere = (port: number) => {
  try {
    const pids = execFileSync("lsof", ["-tiTCP:" + port, "-sTCP:LISTEN"], { encoding: "utf8" }).trim().split("\n")
    return pids.some((pid) => execFileSync("lsof", ["-a", "-p", pid, "-d", "cwd", "-Fn"], { encoding: "utf8" }).split("\n").includes("n" + process.cwd()))
  } catch { return false }
}
const freePort = () => new Promise<number>((resolve) => {
  const s = createServer().listen(0, () => { const { port } = s.address() as AddressInfo; s.close(() => resolve(port)) })
})
let server
if (!(await up()) || (!given && !servesHere(3000))) {
  const port = await freePort()
  base = `http://localhost:${port}`
  execFileSync("node", ["scripts/vendor.ts"]); execFileSync("node", ["--no-warnings", "scripts/build-client.ts"]) // what predev does for npm run dev
  server = spawn("npx", ["next", "dev", "-p", String(port)], { stdio: "ignore" })
  for (let i = 0; i < 120 && !(await up()); i++) await new Promise((r) => setTimeout(r, 500))
}

// A page is whatever answers with HTML: a route that streams events, JSON or text is not one, so a new
// API-like route can never stall the check. Only the response headers are read.
const isPage = async (path: string) => {
  const stop = new AbortController()
  const type = await fetch(base + path, { signal: stop.signal }).then((r) => r.headers.get("content-type") ?? "", () => "")
  stop.abort()
  return type.startsWith("text/html")
}
const pages = (await Promise.all(candidates.map(async (p) => ((await isPage(p)) ? p : null)))).filter((p): p is string => p !== null)
// No page answering means no server, not a pass: a check that measured nothing must never say all is well.
if (!pages.length) {
  console.log(`hero: no page answered at ${base} (the dev server did not start), so nothing was checked`)
  server?.kill()
  process.exit(1)
}

const measure = () => {
  const hero = [...document.querySelectorAll("[data-hero]")].find((e) => e.getClientRects().length) // the one shown
  if (!hero) return ["has no [data-hero] element (mark the first screen)"]
  const out = []
  const r = hero.getBoundingClientRect(), H = innerHeight, W = innerWidth
  if (Math.abs(r.top) > 1) out.push(`hero starts ${Math.round(r.top)}px from the top`)
  if (Math.abs(r.height - H) > 1) out.push(`hero is ${Math.round(r.height)}px tall; the screen is ${H}px`)
  if (document.documentElement.scrollWidth > W + 1) out.push(`page scrolls sideways (${document.documentElement.scrollWidth}px wide)`)
  const clipped = (el: Element) => {
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
  // scrolls away with an article (lib/site-nav.ts). A bar not shown yet (hidden) covers nothing.
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
    return [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim())
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

// The colour of a 1×1 PNG screenshot: its one row is a filter byte, then red, green and blue. With one pixel every
// PNG filter leaves the value as it is. Anything but a 1×1, 8-bit RGB or RGBA image is refused, never misread.
const firstPixelRGB = (png: Buffer) => {
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20), depth = png[24], colour = png[25]
  if (width !== 1 || height !== 1 || depth !== 8 || (colour !== 2 && colour !== 6))
    throw new Error(`hero-check: expected a 1×1 8-bit RGB(A) screenshot, got ${width}×${height}, depth ${depth}, colour type ${colour}`)
  const data: Buffer[] = []
  for (let at = 8; at < png.length; ) {
    const len = png.readUInt32BE(at), type = png.toString("ascii", at + 4, at + 8)
    if (type === "IDAT") data.push(png.subarray(at + 8, at + 8 + len))
    at += 12 + len
  }
  const row = inflateSync(Buffer.concat(data))
  return [row[1], row[2], row[3]]
}
// Dark, not a flash: every channel at 40 or less (the site's ground is #0b0d12; the browser's dark is #121212).
const DARK = 40

const browser = await launch()
let bad = 0
try {
  for (const path of pages) {
    const size = sizes[0]
    const page = await browser.newPage({ viewport: size })
    await page.route("**/*", (r) => (["stylesheet", "script", "font", "image", "media"].includes(r.request().resourceType()) ? r.abort() : r.continue()))
    await page.goto(base + path, { waitUntil: "domcontentloaded" })
    const { width, height } = size
    // Three points across the screen (top-left, centre, bottom-right): a ground that covers only part of it still fails.
    for (const [x, y] of [[1, 1], [width / 2, height / 2], [width - 2, height - 2]]) {
      const rgb = firstPixelRGB(await page.screenshot({ clip: { x, y, width: 1, height: 1 } }))
      if (rgb.some((c) => c > DARK)) { console.log(`first frame: ${path} paints rgb(${rgb}) at ${x},${y} before its styles load (the ground is dark)`); bad++; break }
    }
    await page.close()
  }
  for (const path of pages)
    for (const viewport of sizes) {
      const page = await browser.newPage({ viewport })
      await page.goto(base + path, { waitUntil: "load" })
      await page.evaluate(() => document.fonts.ready)
      // Judge the settled first screen: wait for one-off animations (not endless ones) to end.
      await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getComputedTiming().endTime === Infinity), null, { timeout: 10000 }).catch(() => {})
      for (const p of await page.evaluate(measure)) {
        console.log(`hero: ${path} at ${viewport.width}×${viewport.height}: ${p}`)
        bad++
      }
      await page.close()
    }
} finally {
  await browser.close()
  server?.kill()
}
if (!bad) console.log(`hero: ${pages.length} pages fit all ${sizes.length} screen sizes, and each first frame is dark`)
process.exit(bad ? 1 : 0)
