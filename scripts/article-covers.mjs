// A cover for every article, captured from its own page at 1200x630 (the link-preview size).
// The same image is the card on /articles and the share image of the article.
// Run with the dev server up, after an article's top changes:   npm run article-covers [-- <origin>]
import { mkdir, readdir } from "node:fs/promises"
import { launch } from "./browser.mjs"

const ORIGIN = process.argv[2] ?? "http://localhost:3000"
const slugs = (await readdir("articles", { withFileTypes: true })).filter((e) => e.isDirectory() && !e.name.startsWith("_")).map((e) => e.name)
const browser = await launch()
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => browser.close().finally(() => process.exit(130)))
try {
  for (const slug of slugs) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: "no-preference" })
    await page.goto(`${ORIGIN}/articles/${slug}`, { waitUntil: "networkidle", timeout: 60000 }).catch(() => page.waitForTimeout(3000))
    // The cover is the story, not the chrome: hide any nav bar before the shot.
    await page.addStyleTag({ content: "nav,.nav,.fnav{display:none!important}" })
    await page.waitForTimeout(Number(process.env.SETTLE_MS ?? 3500))
    await mkdir(`public/articles/${slug}`, { recursive: true })
    await page.screenshot({ path: `public/articles/${slug}/cover.png` })
    await page.close()
    console.log(`wrote public/articles/${slug}/cover.png`)
  }
} finally {
  await browser.close()
}
