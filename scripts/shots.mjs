// Screenshots of every [data-scene] the way a visitor sees it, for review.
//   npm run shots -- [url] [outDir]
// Writes <outDir>/<viewport>-<motion>-<scene id>-<n>.png (one per screen-height
// step through the scene, after the scene has had time to play) and index.json.
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { launch } from "./browser.mjs"

const URL = process.argv[2] ?? "http://localhost:3000/"
const OUT = process.argv[3] ?? "shots"
// "pane" is the size Jager reviews in (the Claude app browser pane). He resizes it, so measure the
// real tab first (innerWidth x innerHeight) and pass it: PANE=668x837. Reviewing at a stale size hid
// empty scenes from review on 2026-10-01.
const [paneW, paneH] = (process.env.PANE ?? "668x837").split("x").map(Number)
const VIEWPORTS = { pane: { width: paneW, height: paneH }, desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } }
const PLAY_MS = Number(process.env.PLAY_MS ?? 2500)
const ONLY = process.env.ONLY?.split(",") // e.g. ONLY=pane

await mkdir(OUT, { recursive: true })
const browser = await launch()
// Never leave a headless browser behind: an orphan keeps rendering the 3D scene and chokes the Mac
// (three orphans at ~250% CPU each made every timing on 2026-10-01 look slow).
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => browser.close().finally(() => process.exit(130)))
const index = []
for (const [vp, viewport] of Object.entries(VIEWPORTS)) {
  if (ONLY && !ONLY.includes(vp)) continue
  for (const motion of ["no-preference", "reduce"]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: motion })
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 }).catch(() => page.waitForTimeout(3000))
    let scenes = await page.$$eval("[data-scene]", (els) =>
      els.map((e) => ({ id: e.id, scene: e.dataset.scene, top: e.getBoundingClientRect().top + scrollY, height: e.offsetHeight })))
    // Any other site (e.g. a reference page to calibrate the review): its first three screens as one "page" scene.
    if (!scenes.length) scenes = [{ id: process.env.NAME ?? "page", scene: "page", top: 0, height: viewport.height * 3 }]
    for (const s of scenes) {
      const steps = Math.max(1, Math.round(s.height / viewport.height))
      for (let k = 0; k < steps; k++) {
        await page.evaluate((y) => scrollTo(0, y), s.top + k * viewport.height)
        await page.waitForTimeout(PLAY_MS)
        const file = `${vp}-${motion === "reduce" ? "reduced" : "motion"}-${s.id}-${k + 1}.png`
        await page.screenshot({ path: path.join(OUT, file) })
        index.push({ file, viewport: vp, motion, scene: s.scene, id: s.id, step: k + 1, of: steps })
      }
      // A scene that plays to an end (a race) also gets its finished frame: the payoff is what's judged.
      const hasEnd = await page.evaluate((id) => !!document.querySelector(`#${id} [data-state]`), s.id)
      if (hasEnd) {
        await page.evaluate((y) => scrollTo(0, y), s.top)
        const done = await page.waitForFunction((id) => document.querySelector(`#${id} [data-state]`)?.dataset.state === "done", s.id, { timeout: 45000 }).then(() => true, () => false)
        await page.waitForTimeout(800)
        const file = `${vp}-${motion === "reduce" ? "reduced" : "motion"}-${s.id}-done.png`
        await page.screenshot({ path: path.join(OUT, file) })
        index.push({ file, viewport: vp, motion, scene: s.scene, id: s.id, step: "done", reachedDone: done })
      }
    }
    await page.close()
  }
}
await browser.close()
await writeFile(path.join(OUT, "index.json"), JSON.stringify(index, null, 2))
console.log(`${index.length} screenshots in ${OUT}`)
