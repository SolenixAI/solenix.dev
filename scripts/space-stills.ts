// The world's own still at retina size: the first frame of the sky on /app (a page that shows the world), at device pixel ratio 2, as WebP.
// The engine draws at most 2x (lib/space/engine.ts: dprMax = min(devicePixelRatio, 2)), so 2x is the sharpest the live sky ever shows.
// The article headers paint these where a screen is 2x or denser; the 1x posters stay for every other screen.
//   public/space/poster@2x.webp        desktop layout, 2x
//   public/space/poster-phone@2x.webp  phone layout, 2x
// Run with the dev server up, after the world's look changes:   npm run space-stills [-- <origin>]
import { writeFile } from "node:fs/promises"
import type { Browser } from "playwright"
import { launch } from "./browser.ts"
import { loadViewports } from "../lib/viewports.ts"

const ORIGIN = process.argv[2] ?? "http://localhost:3000"
const { desktop, phone } = loadViewports()
const browser = await launch()
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => browser.close().finally(() => process.exit(130)))

// Only the sky shows: the page's text, bars and footer are hidden, so the still is the world alone.
const SKY_ONLY = "html body :is(header,main,footer,nav,.snav,.lnav,[data-hero]){visibility:hidden!important}"

// The sky at device pixel ratio 2, written as WebP by the browser's canvas (no image library needed).
async function retinaSky(browser: Browser, viewport: { width: number; height: number }, file: string) {
  const shot = await browser.newPage({ viewport, deviceScaleFactor: 2, reducedMotion: "no-preference" })
  await shot.goto(`${ORIGIN}/app`, { waitUntil: "load", timeout: 60000 })
  await shot.addStyleTag({ content: SKY_ONLY })
  // The world is shown once the page has set its scene; wait for that, then for its first frames to land.
  await shot.waitForFunction(() => {
    const w = document.querySelector<HTMLElement>(".world")
    return !!w && !w.hidden && !!document.getElementById("gl")
  }, null, { timeout: 30000 })
  await shot.waitForTimeout(2000)
  const png = (await shot.locator(".world").screenshot()).toString("base64")
  await shot.close()
  const encoder = await browser.newPage()
  const dataUrl: string = await encoder.evaluate(async (b64) => {
    const img = new Image()
    img.src = "data:image/png;base64," + b64
    await img.decode()
    const canvas = document.createElement("canvas")
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    canvas.getContext("2d")?.drawImage(img, 0, 0)
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/webp", 0.85))
    if (!blob || blob.type !== "image/webp") throw new Error("this browser cannot write WebP")
    return await new Promise<string>((done) => {
      const reader = new FileReader()
      reader.onload = () => done(String(reader.result))
      reader.readAsDataURL(blob)
    })
  }, png)
  await encoder.close()
  await writeFile(file, Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64"))
}

try {
  await retinaSky(browser, desktop, "public/space/poster@2x.webp")
  console.log("wrote public/space/poster@2x.webp")
  await retinaSky(browser, phone, "public/space/poster-phone@2x.webp")
  console.log("wrote public/space/poster-phone@2x.webp")
} finally {
  await browser.close()
}
