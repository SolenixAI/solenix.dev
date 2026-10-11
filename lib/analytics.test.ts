// The goal events: one helper captures each goal by its own name, the raw pages get the same names, the
// project token keeps PostHog's shape, and only lib/analytics.ts calls PostHog's capture.
//   node --test lib/analytics.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { captureGoal, GOALS, type Goal, POSTHOG_KEY, POSTHOG_SNIPPET } from "./analytics.ts"

// One test per goal: the helper hands PostHog exactly that goal's event name, once.
for (const goal of GOALS) {
  test(`${goal} reaches PostHog by its own name`, () => {
    const sent: string[] = []
    captureGoal(goal, (event) => sent.push(event))
    assert.deepEqual(sent, [goal])
  })
}

test("a goal the helper does not know is refused and never sent", () => {
  const sent: string[] = []
  assert.throws(() => captureGoal("made_up" as Goal, (event) => sent.push(event)), /unknown goal/)
  assert.deepEqual(sent, [])
})

test("the raw pages' snippet names the same goals as the helper", () => {
  assert.ok(POSTHOG_SNIPPET.includes(JSON.stringify(GOALS)))
})

test("the project token has PostHog's shape, so a missing or cut key fails here, not on the live site", () => {
  assert.match(POSTHOG_KEY, /^phc_[A-Za-z0-9]{44}$/)
})

// Every app, lib and client source file, except tests and type declarations.
const root = fileURLToPath(new URL("..", import.meta.url))
function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sources(path)
    return /\.tsx?$/.test(entry.name) && !/\.(test|d)\.tsx?$/.test(entry.name) ? [path] : []
  })
}

test("only lib/analytics.ts calls PostHog's capture", () => {
  const callers = ["app", "lib", "client"]
    .flatMap((dir) => sources(join(root, dir)))
    .filter((file) => /\.capture\(/.test(readFileSync(file, "utf8")))
    .map((file) => relative(root, file))
  assert.deepEqual(callers, ["lib/analytics.ts"])
})
