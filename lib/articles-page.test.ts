import { test } from "node:test"
import assert from "node:assert/strict"
import { ARTICLES_PAGE } from "./articles-page.ts"
import { tabTitle } from "./site-meta.ts"

test("the Articles page is titled as the brief sets, and its tab title carries the site's name once", () => {
  assert.equal(ARTICLES_PAGE.title, "Articles: pages you can play with")
  assert.equal(tabTitle(ARTICLES_PAGE.title), "Articles: pages you can play with · Solenix")
})

test("the Articles page's description is 120 to 155 characters", () => {
  const n = ARTICLES_PAGE.description.length
  assert.ok(n >= 120 && n <= 155, `the description is ${n} characters`)
})
