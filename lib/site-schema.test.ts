// The structured data: one business and its site on the homepage, one article per article page, and JSON that cannot
// close its own script tag.
//   node --test lib/site-schema.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { SITE_URL } from "./site-meta.ts"
import { articleSchema, homeSchema, ldJson } from "./site-schema.ts"

// The homepage's graph as plain JSON, so each node is read by its own keys.
const homeGraph = (description: string) =>
  (JSON.parse(ldJson(homeSchema(description))) as { "@graph": Array<Record<string, any>> })["@graph"]

test("the homepage describes one business, its founder and its site", () => {
  const [business, site] = homeGraph("A test description.")
  assert.equal(business["@type"], "ProfessionalService")
  assert.equal(business.name, "Solenix")
  assert.equal(business.url, `${SITE_URL}/`)
  assert.equal(business.description, "A test description.")
  assert.equal(business.email, "hello@solenix.dev")
  assert.equal(business.areaServed.name, "St. John's, Newfoundland and Labrador")
  assert.equal(business.founder.name, "Jager Cooper")
  assert.equal(site["@type"], "WebSite")
  assert.equal(site.publisher["@id"], business["@id"], "the site is published by the business it names")
})

test("an article describes its own title, description and date", () => {
  const a = articleSchema({ title: "The Proof Flood", description: "Plain words.", date: "2026-10-08", path: "/articles/proof-flood" })
  assert.equal(a["@type"], "Article")
  assert.equal(a.headline, "The Proof Flood")
  assert.equal(a.description, "Plain words.")
  assert.equal(a.datePublished, "2026-10-08")
  assert.equal(a.mainEntityOfPage, `${SITE_URL}/articles/proof-flood`)
  assert.equal(a.image, `${SITE_URL}/og.png`, "an article without a cover uses the site's share image")
  assert.equal(a.author.name, "Solenix")
})

test("ldJson cannot close its own script tag, and parses back to the same data", () => {
  const data = { headline: "</script><script>alert(1)</script>" }
  const out = ldJson(data)
  assert.doesNotMatch(out, /<\/?script/i)
  assert.deepEqual(JSON.parse(out), data)
})
