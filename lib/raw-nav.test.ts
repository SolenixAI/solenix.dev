// Tests for lib/raw-nav.ts: the raw pages get the same nav header as the React pages, from one source.
//   node --test lib/raw-nav.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { renderToStaticMarkup } from "react-dom/server"
import { navHeader, plainLink } from "./site-nav.ts"
import { withSiteNav } from "./raw-nav.ts"

const page = (body: string) => `<html><head><title>T · Solenix</title></head><body>${body}</body></html>`

test("a raw page's nav is the one nav header, drawn with plain links", () => {
  const html = withSiteNav(page("<main></main>"))
  assert.ok(html.includes(renderToStaticMarkup(navHeader(plainLink))), "the header markup is the shared one")
  assert.equal(html.match(/class="snav"/g)?.length, 1, "one nav")
})

test("a page with its own sections gets the local bar and a nav marked data-local", () => {
  const html = withSiteNav(page('<section id="a" data-nav="Alpha"></section>'))
  assert.ok(html.includes(renderToStaticMarkup(navHeader(plainLink, { local: true }))))
  assert.match(html, /class="lnav"/)
})
