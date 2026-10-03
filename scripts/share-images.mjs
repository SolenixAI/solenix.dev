// Renders the images a shared link and a browser tab need, from things that already exist:
//   public/favicon.ico  the brand avatar (public/brand/out/avatar.svg) at 32, 48 and 256 px
//   public/og.png       the live homepage hero at 1200x630, the size link previews use
// Run with the dev server up, after the hero changes:   npm run share-images [-- <url>]
import { readFile, writeFile } from "node:fs/promises"
import { launch } from "./browser.mjs"

const URL = process.argv[2] ?? "http://localhost:3000/"
const browser = await launch()
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => browser.close().finally(() => process.exit(130)))
try {
  // Favicon: one .ico holding PNG images (every current browser reads PNG inside .ico).
  const svg = await readFile("public/brand/out/avatar.svg", "utf8")
  const sizes = [32, 48, 256]
  const pngs = []
  for (const s of sizes) {
    const page = await browser.newPage({ viewport: { width: s, height: s }, deviceScaleFactor: 1 })
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${s}px;height:${s}px}</style>${svg}`)
    pngs.push(await page.screenshot({ omitBackground: true }))
    await page.close()
  }
  const header = Buffer.alloc(6 + 16 * sizes.length)
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4)
  let offset = header.length
  sizes.forEach((s, i) => {
    const e = 6 + 16 * i
    header.writeUInt8(s >= 256 ? 0 : s, e); header.writeUInt8(s >= 256 ? 0 : s, e + 1)
    header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6)
    header.writeUInt32LE(pngs[i].length, e + 8); header.writeUInt32LE(offset, e + 12)
    offset += pngs[i].length
  })
  await writeFile("public/favicon.ico", Buffer.concat([header, ...pngs]))

  // Link preview: the real hero, after the scene has had time to settle into frame.
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 }).catch(() => page.waitForTimeout(3000))
  await page.waitForTimeout(Number(process.env.SETTLE_MS ?? 4000))
  await page.screenshot({ path: "public/og.png" })
  console.log("wrote public/favicon.ico and public/og.png")
} finally {
  await browser.close()
}
