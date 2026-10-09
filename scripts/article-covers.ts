// A cover for every article, captured from its own page at 1200x630 (the link-preview size).
// The same image is the card on /articles and the share image of the article.
// The hero stills are the live page's first frame: each is taken the moment the article starts to draw its suns,
// which is the moment its live window starts on /articles, so the still and the live page swap without a jump.
//   hero.png, hero-phone.png        1x (PNG)
//   hero@2x.webp, hero-phone@2x.webp  2x for retina screens (WebP; the browser encodes it, so no image library is needed)
// Run with the dev server up, after an article's top changes:   npm run article-covers [-- <origin>]
import { mkdir, readdir, writeFile } from "node:fs/promises"
import type { Browser, Page } from "playwright"
import { launch } from "./browser.ts"

const ORIGIN = process.argv[2] ?? "http://localhost:3000"
const slugs = (await readdir("articles", { withFileTypes: true })).filter((e) => e.isDirectory() && !e.name.startsWith("_")).map((e) => e.name)
const browser = await launch()
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => browser.close().finally(() => process.exit(130)))

// Waits until the article has drawn its first suns (its orbit canvas holds pixels). Its live window draws from that
// same moment. A page whose orbit is off screen never draws here, so the wait gives up and the still is taken as it is.
async function atFirstFrame(page: Page) {
  await page.waitForFunction(() => {
    const c = document.getElementById("orbit") as HTMLCanvasElement | null
    const cx = c?.getContext("2d")
    if (!c || !cx || !c.width || !c.height) return false
    const px = cx.getImageData(0, 0, c.width, c.height).data
    for (let i = 3; i < px.length; i += 4 * 3) if (px[i]) return true
    return false
  }, null, { polling: "raf", timeout: 8000 }).catch(() => {})
}

// The same first frame at device pixel ratio 2, written as WebP by the browser's canvas.
async function retinaStill(browser: Browser, url: string, viewport: { width: number; height: number }, file: string) {
  const shot = await browser.newPage({ viewport, deviceScaleFactor: 2, reducedMotion: "no-preference" })
  await shot.goto(url, { waitUntil: "load", timeout: 60000 })
  await shot.addStyleTag({ content: ".snav,.lnav{display:none!important}" })
  await atFirstFrame(shot)
  const png = (await shot.screenshot()).toString("base64")
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
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/webp", 0.9))
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
  for (const slug of slugs) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: "no-preference" })
    await page.goto(`${ORIGIN}/articles/${slug}`, { waitUntil: "load", timeout: 60000 })
    // The cover is the story, not the chrome: hide any nav bar before the shot.
    await page.addStyleTag({ content: ".snav,.lnav{display:none!important}" })
    await atFirstFrame(page)
    await mkdir(`public/articles/${slug}`, { recursive: true })
    await page.screenshot({ path: `public/articles/${slug}/cover.png` })
    await page.close()
    console.log(`wrote public/articles/${slug}/cover.png`)
    // The hero window shows the article at the layout width of its still, so the still and the live page
    // are the same picture from the first paint: one desktop and one phone layout, each at 1x and 2x.
    for (const [name, viewport] of [["hero", { width: 1440, height: 900 }], ["hero-phone", { width: 390, height: 844 }]] as const) {
      const shot = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: "no-preference" })
      await shot.goto(`${ORIGIN}/articles/${slug}`, { waitUntil: "load", timeout: 60000 })
      await shot.addStyleTag({ content: ".snav,.lnav{display:none!important}" })
      await atFirstFrame(shot)
      await shot.screenshot({ path: `public/articles/${slug}/${name}.png` })
      await shot.close()
      console.log(`wrote public/articles/${slug}/${name}.png`)
      await retinaStill(browser, `${ORIGIN}/articles/${slug}`, viewport, `public/articles/${slug}/${name}@2x.webp`)
      console.log(`wrote public/articles/${slug}/${name}@2x.webp`)
    }
  }
} finally {
  await browser.close()
}
