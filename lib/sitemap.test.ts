import { test } from "node:test"
import assert from "node:assert/strict"
import { sitemapEntries } from "./sitemap.ts"
import { SITE_URL } from "./site-meta.ts"

const urls = (entries: { url: string }[]) => entries.map((e) => e.url)

test("the sitemap lists the homepage, then each page once, with no query variants", () => {
  const entries = sitemapEntries(SITE_URL, [{ path: "/articles/proof-flood", date: "2026-10-08" }])
  assert.deepEqual(urls(entries), [`${SITE_URL}/`, `${SITE_URL}/agents`, `${SITE_URL}/articles`, `${SITE_URL}/articles/proof-flood`])
  assert.ok(urls(entries).every((u) => !u.includes("?")), "a query variant is never listed: its canonical page is listed instead")
})

test("lastmod is set only for an article with its own publication date; pages without a real date carry none", () => {
  const entries = sitemapEntries(SITE_URL, [{ path: "/articles/proof-flood", date: "2026-10-08" }, { path: "/articles/undated", date: "" }])
  const byUrl = Object.fromEntries(entries.map((e) => [e.url, e]))
  assert.equal(byUrl[`${SITE_URL}/articles/proof-flood`].lastModified, "2026-10-08")
  assert.equal("lastModified" in byUrl[`${SITE_URL}/articles/undated`], true)
  assert.equal(byUrl[`${SITE_URL}/articles/undated`].lastModified, undefined)
  for (const page of [`${SITE_URL}/`, `${SITE_URL}/agents`, `${SITE_URL}/articles`]) assert.equal(byUrl[page].lastModified, undefined, page)
})
