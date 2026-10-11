import { test } from "node:test"
import assert from "node:assert/strict"
import { headTags, SITE_URL, tabTitle } from "./site-meta.ts"

const DESCRIPTION = "OpenAI's AI produced 372 new math results in one week. Every one explained in plain words."

test("a tab title carries the site's name once", () => {
  assert.equal(tabTitle("Articles"), "Articles · Solenix")
  assert.equal(tabTitle("OpenAI's 372 math results, explained"), "OpenAI's 372 math results, explained · Solenix")
  assert.equal(tabTitle("Articles · Solenix"), "Articles · Solenix")
})

test("an article's link preview is typed as an article, and its og:title is the tab title", () => {
  const title = tabTitle("OpenAI's 372 math results, explained")
  const head = headTags({ title, description: DESCRIPTION, path: "/articles/proof-flood", type: "article" })
  assert.ok(head.includes('<meta property="og:type" content="article">'), "og:type is article")
  assert.ok(head.includes(`<meta property="og:title" content="${title}">`), "og:title equals the title")
  assert.ok(head.includes(`<link rel="canonical" href="${SITE_URL}/articles/proof-flood">`), "canonical is the page itself")
})

test("a page without a type is a website", () => {
  const head = headTags({ title: tabTitle("Articles"), description: DESCRIPTION, path: "/articles" })
  assert.ok(head.includes('<meta property="og:type" content="website">'))
  assert.equal(head.includes('og:type" content="article"'), false)
})

test("the link preview's Twitter tags carry the page's title and description", () => {
  const title = tabTitle("Articles: pages you can play with")
  const head = headTags({ title, description: DESCRIPTION, path: "/articles" })
  assert.ok(head.includes(`<meta name="twitter:title" content="${title}">`), "twitter:title is the title")
  assert.ok(head.includes(`<meta name="twitter:description" content="${DESCRIPTION}">`), "twitter:description is the description")
})
