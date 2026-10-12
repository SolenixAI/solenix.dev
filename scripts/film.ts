// A film of the homepage journey the way a visitor scrolls it, for review: a wheel-like glide into each stop, a rest
// while the stop plays, then the close. It writes <outDir>/journey-<w>x<h>.mp4 and one frame a second
// (<outDir>/<w>x<h>/f001.jpg ...), so a reviewer can watch the film or read it frame by frame.
//   npm run film -- [url] [outDir] [WxH ...]      (defaults: :3000, film, 1440x900 375x812)
import { execFileSync } from "node:child_process"
import { mkdir, readdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { launch } from "./browser.ts"
import { JOURNEY } from "../lib/home/journey.ts"

const URL = process.argv[2] ?? "http://localhost:3000/"
const OUT = path.resolve(process.argv[3] ?? "film")
const SIZES = (process.argv.length > 4 ? process.argv.slice(4) : ["1440x900", "375x812"]).map((s) => s.split("x").map(Number))
// A stop rests long enough to play; a tool stop's scene runs longest (lib/home/proof.ts).
const REST_MS = (k: number) => ("tool" in JOURNEY[k].scene ? 6500 : 3000)

const browser = await launch()
try {
  for (const [w, h] of SIZES) {
    const tmp = path.join(OUT, `raw-${w}x${h}`)
    await rm(tmp, { recursive: true, force: true })
    await mkdir(tmp, { recursive: true })
    // Frames come from the browser's screencast (CDP), stamped with the time each was painted, and ffmpeg encodes them
    // after: Playwright's own recorder took 15 minutes to flush a two-minute film at 1440x900.
    const ctx = await browser.newContext({ viewport: { width: w, height: h } })
    const page = await ctx.newPage()
    const cdp = await ctx.newCDPSession(page)
    const shots: { file: string; at: number }[] = []
    cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
      const file = path.join(tmp, `s${String(shots.length).padStart(5, "0")}.jpg`)
      shots.push({ file, at: metadata.timestamp ?? performance.now() / 1000 })
      await writeFile(file, Buffer.from(data, "base64"))
      await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {})
    })
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 85, maxWidth: w, maxHeight: h })
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(String(e)))
    await page.goto(URL, { waitUntil: "load" })
    await page.waitForTimeout(3000)
    const n = JOURNEY.length, t0 = performance.now()
    for (let k = 0; k <= n; k++) {
      const to = await page.evaluate(([k, n]) => {
        const j = document.getElementById("journey")!, stage = j.querySelector<HTMLElement>(".stage")!
        const run = j.offsetHeight - stage.offsetHeight, top = j.getBoundingClientRect().top + scrollY
        return k < n ? top + ((k + 0.5) / n) * run : document.documentElement.scrollHeight
      }, [k, n])
      const from = await page.evaluate(() => scrollY)
      for (let i = 1; i <= 30; i++) {
        await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), from + ((to - from) * i) / 30)
        await page.waitForTimeout(33)
      }
      await page.waitForTimeout(k < n ? REST_MS(k) : 3000)
      console.log(`film: ${w}x${h} stop ${k + 1}/${n + 1} at ${((performance.now() - t0) / 1000).toFixed(1)} s`)
    }
    await cdp.send("Page.stopScreencast")
    await page.close()
    await ctx.close()
    // Each frame is held until the next one was painted, so the film plays at the speed the visitor saw.
    const list = shots.map((s, i) => `file '${s.file}'\nduration ${Math.max(0.001, (shots[i + 1]?.at ?? s.at + 0.04) - s.at).toFixed(4)}`).join("\n")
    await writeFile(path.join(tmp, "list.txt"), `${list}\nfile '${shots.at(-1)!.file}'\n`)
    const mp4 = path.join(OUT, `journey-${w}x${h}.mp4`), frames = path.join(OUT, `${w}x${h}`)
    await rm(frames, { recursive: true, force: true })
    await mkdir(frames, { recursive: true })
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", path.join(tmp, "list.txt"), "-vf", "fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4])
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", mp4, "-vf", "fps=1", "-q:v", "4", path.join(frames, "f%03d.jpg")])
    await rm(tmp, { recursive: true, force: true })
    console.log(`film: ${w}x${h} → ${path.relative(process.cwd(), mp4)}, ${(await readdir(frames)).length} frames, ${errors.length ? errors.join("; ") : "no page errors"}`)
  }
} finally {
  await browser.close()
}
