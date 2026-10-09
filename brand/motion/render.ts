// Renders the motion piece frame by frame from brand/motion/index.html (served by make.sh).
//   node render.ts <outDir> [t1,t2,... to render only those stills]
import { mkdir } from "node:fs/promises"
import { launch } from "../../scripts/browser.ts"
// What brand/motion/index.html exposes for rendering.
type Motion = { ready: Promise<void>; EVENTS: { DUR: number; FPS: number }; renderFrame: (t: number) => void }
const OUT = process.argv[2] ?? "frames", STILLS = process.argv[3] ? process.argv[3].split(",").map(Number) : null
const URL = process.env.MOTION_URL ?? "http://127.0.0.1:8812/brand/motion/"
await mkdir(OUT, { recursive: true })
const browser = await launch()
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => browser.close().finally(() => process.exit(130)))
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
  const errs: string[] = []; page.on("pageerror", (e) => errs.push(String(e)))
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 })
  await page.evaluate(() => (window as unknown as Motion).ready)
  const { DUR, FPS } = await page.evaluate(() => (window as unknown as Motion).EVENTS)
  const times = STILLS ?? Array.from({ length: Math.round(DUR * FPS) }, (_, i) => i / FPS)
  const canvas = await page.$("#c")
  if (!canvas) throw new Error("render: the page has no #c canvas")
  for (const [i, t] of times.entries()) {
    await page.evaluate((t) => (window as unknown as Motion).renderFrame(t), t)
    await canvas.screenshot({ path: `${OUT}/${STILLS ? "s-" + t.toFixed(2) : String(i).padStart(5, "0")}.jpg`, type: "jpeg", quality: 94 })
  }
  console.log(`${times.length} frames`, errs.length ? "PAGE ERRORS: " + errs.slice(0, 3).join(" | ") : "")
} finally { await browser.close() }
