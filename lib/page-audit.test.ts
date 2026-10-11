import { test } from "node:test"
import assert from "node:assert/strict"
import { internalLinks, seoProblems } from "./page-audit.ts"

const page = (head: string, body = "") => `<!doctype html><html><head>${head}</head><body>${body}</body></html>`
const GOOD = `<title>Articles · Solenix</title><meta name="description" content="Stories about what AI can do now, told as pages you can play with."><link rel="canonical" href="https://example.org/articles"><meta property="og:image" content="https://example.org/og.png">`

test("internal links are the site's own paths and assets, each once; outside links, anchors and mail are left out", () => {
  const html = page(GOOD, `<a href="/agents">a</a><a href="/agents">again</a><a href="#top">top</a><a href="mailto:x@y.z">m</a><a href="https://github.com/x">gh</a><img src="/og.png"><link href="/tokens.css" rel="stylesheet"><a href="//cdn.example/x">cdn</a><a href="/book?x=1#y">b</a><img src="/_next/image?url=a&amp;w=64"><script src="/_vercel/speed-insights/script.js"></script>`)
  assert.deepEqual(internalLinks(html).sort(), ["/_next/image?url=a&w=64", "/agents", "/book?x=1", "/og.png", "/tokens.css"])
})

test("a page with its title, description, canonical and share image, and no noindex, has no SEO problem", () => {
  assert.deepEqual(seoProblems(page(GOOD)), [])
})

test("each missing or wrong tag is named", () => {
  assert.match(seoProblems(page("")).join(), /title/)
  assert.match(seoProblems(page(GOOD.replace(/<meta name="description"[^>]*>/, ""))).join(), /description/)
  assert.match(seoProblems(page(GOOD.replace(/<link rel="canonical"[^>]*>/, ""))).join(), /canonical/)
  assert.match(seoProblems(page(GOOD.replace(/<meta property="og:image"[^>]*>/, ""))).join(), /share image/)
  assert.match(seoProblems(page(GOOD + `<meta name="robots" content="noindex">`)).join(), /noindex/)
  assert.match(seoProblems(page(GOOD.replace("Stories about what AI can do now, told as pages you can play with.", "Short."))).join(), /description/)
})
