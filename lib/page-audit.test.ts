import { test } from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import type { AddressInfo } from "node:net"
import { internalLinks, landed, seoProblems } from "./page-audit.ts"

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

test("links are found in any attribute order or quotes, in srcset, and with entities decoded", () => {
  const html = `<a class='x' href='/agents'>a</a><img srcset="/a.webp 1x, /a@2x.webp 2x" src="/a.png"><source srcset='/b.webp'><a href="/x?a=1&amp;b=2">x</a>`
  assert.deepEqual(internalLinks(html).sort(), ["/a.png", "/a.webp", "/a@2x.webp", "/agents", "/b.webp", "/x?a=1&b=2"])
})

test("a head's tags are read in any attribute order, and a description is measured as text", () => {
  const head = `<title>Articles</title><meta content="Stories about what AI can do now &amp; the pages you can play with." name="description"><link href="https://example.org/a" rel="canonical"><meta content="https://example.org/og.png" property="og:image">`
  assert.deepEqual(seoProblems(head), [])
  assert.match(seoProblems(head + `<meta content="noindex, follow" name="robots">`).join(), /noindex/)
})

test("a path lands at a 2xx after the site's redirects; off-site redirects land; dead ends, bare redirects and silence do not", async () => {
  const server = createServer((req, res) => {
    const routes: Record<string, [number, Record<string, string>?]> = {
      "/ok": [200], "/rel": [307, { location: "ok" }], "/abs": [301, { location: "/ok" }], "/out": [307, { location: "https://example.org/x" }],
      "/bare": [302], "/gone": [404], "/head-no": [req.method === "HEAD" ? 405 : 200],
    }
    if (req.url === "/slow") return // never answers
    const [code, headers] = routes[req.url ?? ""] ?? [404]
    res.writeHead(code, headers).end()
  })
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r))
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  try {
    for (const p of ["/ok", "/rel", "/abs", "/out", "/head-no"]) assert.equal((await landed(base, p)).ok, true, p)
    assert.match((await landed(base, "/bare")).why, /no Location/)
    assert.match((await landed(base, "/gone")).why, /404/)
    assert.match((await landed(base, "/slow", 300)).why, /no answer/)
  } finally { server.closeAllConnections(); server.close() }
})
