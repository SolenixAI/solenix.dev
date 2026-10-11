import { test } from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import type { AddressInfo } from "node:net"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { auditSite, internalLinks, landed, seoProblems } from "./page-audit.ts"

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

test("content never throws: out-of-range entities stay as text, and a > inside a quoted value stays in the value", () => {
  assert.doesNotThrow(() => internalLinks(`<a href="/x&#x110000;">x</a>`))
  assert.doesNotThrow(() => seoProblems(`<title>Agents &#99999999;</title>`))
  const head = GOOD.replace("Stories about", "Agents > tools: stories about")
  assert.deepEqual(seoProblems(head), [])
  assert.deepEqual(seoProblems(head.replace(/name="description" content="([^"]*)"/, "name=description content='$1'")), [])
})

test("links are read against the page: relative paths, unquoted values, SVG, embeds, posters, CSS url() and the own share image", () => {
  const html = `<a href=proof-flood>p</a><a href="../agents">a</a><svg><use href="/icons.svg#a"/></svg><object data="/o.pdf"></object><embed src="/e.swf"><video poster="/p.webp"><track src="/t.vtt"></video><style>.h{background:url('/bg.webp')}</style><div style="background:url(/d.webp)"></div><meta property="og:image" content="https://example.org/articles/x/cover.png"><a href="/\\evil.example/x">bad</a><img src="data:image/png;base64,AA"><script src="/app.js">el.style.background = "url(" + p + ")"; x.innerHTML = '<a href="\${u}">'</script>`
  assert.deepEqual(internalLinks(html, "http://localhost:3000/articles/", ["https://example.org"]).sort(),
    ["/agents", "/app.js", "/articles/proof-flood", "/articles/x/cover.png", "/bg.webp", "/d.webp", "/e.swf", "/icons.svg", "/o.pdf", "/p.webp", "/t.vtt"])
})

test("a head needs exactly one canonical link", () => {
  assert.match(seoProblems(GOOD + `<link rel="canonical" href="https://example.org/other">`).join(), /2 canonical/)
})

const serve = async (routes: (req: import("node:http").IncomingMessage) => [number, Record<string, string>?, string?] | null) => {
  const server = createServer((req, res) => {
    const r = routes(req)
    if (!r) return // never answers
    res.writeHead(r[0], r[1]).end(r[2] ?? "")
  })
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r))
  return { base: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, close: () => { server.closeAllConnections(); server.close() } }
}

test("HEAD that fails is asked again with GET; a broken Location and a redirect to the production address are handled", async () => {
  const s = await serve((req) => ({
    "/head-404": [req.method === "HEAD" ? 404 : 200], "/broken": [302, { location: "http://[::1" }],
    "/prod": [308, { location: "https://example.org/ok" }], "/prod-gone": [308, { location: "https://example.org/gone" }], "/ok": [200],
  } as Record<string, [number, Record<string, string>?]>)[req.url ?? ""] ?? [404])
  try {
    assert.equal((await landed(s.base, "/head-404")).ok, true)
    assert.match((await landed(s.base, "/broken")).why, /broken Location/)
    assert.equal((await landed(s.base, "/prod", 10_000, ["https://example.org"])).ok, true)
    assert.match((await landed(s.base, "/prod-gone", 10_000, ["https://example.org"])).why, /404/)
  } finally { s.close() }
})

test("the site audit reads the sitemap, reports each page's problems, and stops at its deadline", async () => {
  const head = GOOD
  const s = await serve((req) => {
    if (req.url === "/sitemap.xml") return [200, {}, `<urlset><url><loc>https://example.org/</loc></url><url><loc>https://example.org/b</loc></url></urlset>`]
    if (req.url === "/") return [200, {}, page(head, `<a href="/b">b</a><a href="/missing">m</a>`)]
    if (req.url === "/b") return [200, {}, page("", `<a href="/slow">s</a>`)]
    if (req.url === "/slow") return null
    return [404]
  })
  try {
    const r = await auditSite(s.base, { own: ["https://example.org"], ms: 300 })
    assert.equal(r.pages, 2)
    assert.ok(r.problems.some((p) => p === "/ links to /missing, which answers 404"))
    assert.ok(r.problems.some((p) => p.startsWith("/b has no <title>")))
    assert.ok(r.problems.some((p) => /\/b links to \/slow, which no answer/.test(p)))
    const late = await auditSite(s.base, { own: ["https://example.org"], ms: 300, deadline: 0 })
    assert.ok(late.problems.some((p) => /^stopped after/.test(p)))
  } finally { s.close() }
})

test("scripts/link-check.ts exits 1 with one line per problem, and 0 with a summary when all land", async () => {
  const run = promisify(execFile)
  const script = new URL("../scripts/link-check.ts", import.meta.url).pathname
  const bad = await serve(() => [404])
  try {
    const e = await run(process.execPath, ["--no-warnings", script, bad.base]).then(() => null, (err) => err)
    assert.equal(e?.code, 1)
    assert.match(e.stdout, /links: the sitemap lists no pages/)
  } finally { bad.close() }
  const good = await serve((req) => req.url === "/sitemap.xml" ? [200, {}, `<loc>https://example.org/</loc>`] : req.url === "/" ? [200, {}, page(GOOD)] : [404])
  try {
    const { stdout } = await run(process.execPath, ["--no-warnings", script, good.base])
    assert.match(stdout, /1 pages, \d+ links and assets, all land/)
  } finally { good.close() }
})
