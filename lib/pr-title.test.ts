import { test } from "node:test"
import assert from "node:assert/strict"
import { prTitleProblems } from "./pr-title.ts"

test("a plain sentence about the outcome passes", () => {
  for (const t of ["Crawlers get a robots.txt that names the sitemap", "One nav header and one dev-reload client", "The webhook answers a bad body with 400, not 500",
    "Agents: the marketplace shows outcomes", "next.config drops the deprecated flag", "useEffect cleanup runs before the next render",
    "Draft posts stay private until they publish", "404 page offers two ways back"])
    assert.deepEqual(prTitleProblems(t), [], t)
})

test("a commit-type prefix, a lower-case start, a closing full stop and a length out of range each fail", () => {
  assert.match(prTitleProblems("feat: add robots.txt").join(), /type prefix/)
  assert.match(prTitleProblems("fix(nav)!: keep the bar").join(), /type prefix/)
  assert.match(prTitleProblems("feat:add robots.txt to the site").join(), /type prefix/)
  assert.match(prTitleProblems("crawlers get a robots.txt").join(), /capital/)
  assert.match(prTitleProblems("Crawlers get a robots.txt.").join(), /full stop/)
  assert.match(prTitleProblems("Fix it").join(), /characters/)
  assert.match(prTitleProblems("A".repeat(121)).join(), /characters/)
  assert.match(prTitleProblems("WIP robots for the site").join(), /work in progress/)
  assert.match(prTitleProblems("[Draft] robots for the site").join(), /work in progress/)
})
