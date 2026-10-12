import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { agentsStructuredData, articleStructuredData, articlesStructuredData, homeStructuredData, jsonLd } from "./structured-data.ts"
import { ARTICLES_PAGE } from "./articles-page.ts"
import { NAV } from "./site-nav.ts"
import { HOME_URL, SITE_URL } from "./site-meta.ts"

// The homepage's graph as plain JSON, so each node is read by its own keys.
const homeGraph = (description?: string) => (JSON.parse(jsonLd(homeStructuredData(description))) as { "@graph": Array<Record<string, any>> })["@graph"]

test("the homepage describes one business, its founder and its site, and the page's own description", () => {
  const [business, site] = homeGraph("A test description.")
  assert.equal(business["@type"], "ProfessionalService")
  assert.equal(business.name, "Solenix")
  assert.equal(business.url, HOME_URL)
  assert.equal(business.description, "A test description.")
  assert.equal(business.areaServed, "St. John's, Newfoundland and Labrador")
  assert.equal(business.founder.name, "Jager Cooper")
  assert.equal(site["@type"], "WebSite")
  assert.equal(site.publisher["@id"], business["@id"], "the site is published by the business it names")
})

test("the homepage's email is the address its visible contact text shows", () => {
  const business = homeGraph()[0]
  assert.equal(business.email, NAV.contact.label)
  const html = readFileSync(new URL("../design/home.html", import.meta.url), "utf8")
  assert.ok(html.includes(`href="mailto:${business.email}"`), "the homepage shows that address as a link")
})

test("the business is located in St. John's, with a locality and no street address", () => {
  const business = homeGraph()[0]
  assert.equal(business.address["@type"], "PostalAddress")
  assert.equal(business.address.addressLocality, "St. John's")
  assert.equal(business.address.addressRegion, "NL")
  assert.equal(business.address.addressCountry, "CA")
  assert.equal(business.address.streetAddress, undefined, "the repo holds no street address, so none is published")
})

test("an article's JSON-LD parses, and describes an Article with its headline, date, cover and publisher, and no author", () => {
  const data = JSON.parse(jsonLd(articleStructuredData({ title: "OpenAI's 372 math results, explained", description: "A description.", date: "2026-10-08", cover: "/articles/proof-flood/cover.png" })))
  assert.equal(data["@type"], "Article")
  assert.equal(data.headline, "OpenAI's 372 math results, explained")
  assert.equal(data.description, "A description.")
  assert.equal(data.datePublished, "2026-10-08")
  assert.equal(data.image, `${SITE_URL}/articles/proof-flood/cover.png`)
  assert.deepEqual(data.publisher, { "@type": "Organization", name: "Solenix", url: HOME_URL })
  assert.equal("author" in data, false, "an article that names no person has no author")
})

test("the articles index is named as its page is, and lists each article in order with its own title and link", () => {
  const index = articlesStructuredData([
    { title: "First", path: "/articles/first" },
    { title: "Second", path: "/articles/second" },
  ])
  assert.equal(index["@type"], "CollectionPage")
  assert.equal(index.name, ARTICLES_PAGE.title, "one name for the page: its tab, its share card and its structured data")
  const items = index.mainEntity.itemListElement
  assert.deepEqual(items.map((i) => i.position), [1, 2])
  assert.equal(items[1].url, `${SITE_URL}/articles/second`)
  assert.equal(items[1].name, "Second")
})

test("the Agents Marketplace lists each world by name and line, and links the one page: a world is not a URL of its own", () => {
  const list = agentsStructuredData([{ name: "Vercel", for: "Put your website online." }])
  assert.equal(list["@type"], "ItemList")
  assert.equal(list.url, `${SITE_URL}/agents`)
  assert.equal(list.itemListElement[0].name, "Vercel")
  assert.equal(list.itemListElement[0].description, "Put your website online.")
  assert.equal(JSON.stringify(list).includes("?world="), false)
})

test("the JSON-LD text cannot end its script element, and parses back to the same data", () => {
  const value = { headline: "</script><script>alert(1)</script>" }
  const text = jsonLd(value)
  assert.equal(text.includes("</script"), false)
  assert.deepEqual(JSON.parse(text), value)
})
