// Screenshots of every [data-scene] the way a visitor sees it, for review.
//   npm run shots -- [url] [outDir]
// Writes <outDir>/<viewport>-<motion>-<scene id>-<n>.png (one per screen-height
// step through the scene, after the scene has had time to play) and index.json.
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { chromium } from "playwright"

const URL = process.argv[2] ?? "http://localhost:3000/"
const OUT = process.argv[3] ?? "shots"
// "pane" is the size Jager reviews in (the Claude app browser pane).
const VIEWPORTS = { pane: { width: 872, height: 837 }, desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } }
const PLAY_MS = Number(process.env.PLAY_MS ?? 2500)
const ONLY = process.env.ONLY?.split(",") // e.g. ONLY=pane

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const index = []
for (const [vp, viewport] of Object.entries(VIEWPORTS)) {
  if (ONLY && !ONLY.includes(vp)) continue
  for (const motion of ["no-preference", "reduce"]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: motion })
    await page.goto(URL, { waitUntil: "networkidle" })
    const scenes = await page.$$eval("[data-scene]", (els) =>
      els.map((e) => ({ id: e.id, scene: e.dataset.scene, top: e.getBoundingClientRect().top + scrollY, height: e.offsetHeight })))
    for (const s of scenes) {
      const steps = Math.max(1, Math.round(s.height / viewport.height))
      for (let k = 0; k < steps; k++) {
        await page.evaluate((y) => scrollTo(0, y), s.top + k * viewport.height)
        await page.waitForTimeout(PLAY_MS)
        const file = `${vp}-${motion === "reduce" ? "reduced" : "motion"}-${s.id}-${k + 1}.png`
        await page.screenshot({ path: path.join(OUT, file) })
        index.push({ file, viewport: vp, motion, scene: s.scene, id: s.id, step: k + 1, of: steps })
      }
    }
    await page.close()
  }
}
await browser.close()
await writeFile(path.join(OUT, "index.json"), JSON.stringify(index, null, 2))
console.log(`${index.length} screenshots in ${OUT}`)
