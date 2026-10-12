import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { articleStructuredData, homeStructuredData, jsonLd } from "./structured-data.ts"
import { NAV } from "./site-nav.ts"
import { HOME_URL, SITE_URL } from "./site-meta.ts"

test("the homepage's JSON-LD parses, and describes a ProfessionalService with the site's address and area", () => {
  const data = JSON.parse(jsonLd(homeStructuredData()))
  assert.equal(data["@type"], "ProfessionalService")
  assert.equal(data.name, "Solenix")
  assert.equal(data.url, HOME_URL)
  assert.equal(data.areaServed, "St. John's, Newfoundland and Labrador")
})

test("the homepage's email is the address its visible contact text shows", () => {
  const data = JSON.parse(jsonLd(homeStructuredData()))
  assert.equal(data.email, NAV.contact.label)
  const html = readFileSync(new URL("../design/home.html", import.meta.url), "utf8")
  assert.ok(html.includes(`href="mailto:${data.email}"`), "the homepage shows that address as a link")
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

test("the JSON-LD text cannot end its script element, and parses back to the same data", () => {
  const value = { headline: "</script><script>alert(1)</script>" }
  const text = jsonLd(value)
  assert.equal(text.includes("</script"), false)
  assert.deepEqual(JSON.parse(text), value)
})
