// The copy-for-AI state, through its interface: press and blur, and what the page is told.
//   node --test lib/copy-for-ai.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { COPIED, createCopyForAi, FAILED, RESET_AFTER_MS, type CopyStatus } from "./copy-for-ai.ts"

// A clipboard the test controls: it records each write and resolves or rejects as the test says.
type FakeClipboard = { allow: boolean; writes: string[]; writeText(text: string): Promise<void> }
function fakeClipboard(allow: boolean): FakeClipboard {
  const board: FakeClipboard = {
    allow,
    writes: [],
    writeText(text) {
      board.writes.push(text)
      return board.allow ? Promise.resolve() : Promise.reject(new Error("clipboard denied"))
    },
  }
  return board
}

// A clock the test moves by hand: a timer runs when the clock reaches it.
function fakeClock() {
  let now = 0
  let next = 1
  const timers = new Map<number, { at: number; run: () => void }>()
  return {
    setTimeout(run: () => void, ms: number): unknown {
      const id = next++
      timers.set(id, { at: now + ms, run })
      return id
    },
    clearTimeout(id: unknown): void {
      timers.delete(id as number)
    },
    advance(ms: number): void {
      const end = now + ms
      for (;;) {
        let due: [number, { at: number; run: () => void }] | undefined
        for (const entry of timers) if (entry[1].at <= end && (!due || entry[1].at < due[1].at)) due = entry
        if (!due) break
        timers.delete(due[0])
        now = due[1].at
        due[1].run()
      }
      now = end
    },
    get pending(): number {
      return timers.size
    },
  }
}

function setup(clipboard: { writeText(text: string): Promise<void> } | undefined) {
  const clock = fakeClock()
  const changes: CopyStatus[] = []
  const fails = { count: 0 }
  const copy = createCopyForAi({
    clipboard: () => clipboard,
    clock,
    onChange: (status) => changes.push(status),
    onFail: () => {
      fails.count++
    },
  })
  return { copy, clock, changes, fails }
}

test("a copy the clipboard accepts writes the sentence and reports it copied", async () => {
  const clipboard = fakeClipboard(true)
  const page = setup(clipboard)
  await page.copy.press("Set up Vercel for me.")
  assert.deepEqual(clipboard.writes, ["Set up Vercel for me."])
  assert.equal(page.copy.status, "copied")
  assert.equal(COPIED, "Copied. Paste it into your AI")
})

test("a failure reported without a copy shows failed and calls onFail, and writes nothing", () => {
  const clipboard = fakeClipboard(true)
  const page = setup(clipboard)
  page.copy.fail()
  assert.equal(page.copy.status, "failed")
  assert.equal(page.fails.count, 1)
  assert.deepEqual(clipboard.writes, [], "the page already knows the copy does not work here")
})

test("the failure message says what happened, what is selected, and how to copy it", () => {
  assert.match(FAILED, /^Couldn't copy here\./)
  assert.match(FAILED, /The sentence is selected\./)
  assert.match(FAILED, /Ctrl\+C or Cmd\+C/, "keys for a computer")
  assert.match(FAILED, /menu/, "the menu, for a phone")
})

test("a copy the clipboard refuses shows failed, and calls onFail once", async () => {
  const page = setup(fakeClipboard(false))
  await page.copy.press("Set up Vercel for me.")
  assert.equal(page.copy.status, "failed")
  assert.equal(page.fails.count, 1)
  assert.deepEqual(page.changes, ["failed"])
})

test("with no clipboard at all, a copy fails the same way", async () => {
  const page = setup(undefined)
  await page.copy.press("Set up Vercel for me.")
  assert.equal(page.copy.status, "failed")
  assert.equal(page.fails.count, 1)
})

test("a failure stays until blur, because the selected text it describes stays too", async () => {
  const page = setup(fakeClipboard(false))
  await page.copy.press("Set up Vercel for me.")
  page.clock.advance(10 * RESET_AFTER_MS)
  assert.equal(page.copy.status, "failed")
  assert.equal(page.clock.pending, 0, "a failure has no timer")
  page.copy.blur()
  assert.equal(page.copy.status, "idle")
})

test("a second copy restarts the 3 seconds", async () => {
  const page = setup(fakeClipboard(true))
  await page.copy.press("Set up Vercel for me.")
  page.clock.advance(2000)
  await page.copy.press("Set up Vercel for me.")
  page.clock.advance(2000)
  assert.equal(page.copy.status, "copied", "the window started again at the second copy")
  page.clock.advance(1000)
  assert.equal(page.copy.status, "idle")
})

test("a copy that fails after a success cancels the success timer", async () => {
  const clipboard = fakeClipboard(true)
  const page = setup(clipboard)
  await page.copy.press("Set up Vercel for me.")
  clipboard.allow = false
  await page.copy.press("Set up Vercel for me.")
  assert.equal(page.copy.status, "failed")
  assert.equal(page.clock.pending, 0)
  page.clock.advance(RESET_AFTER_MS)
  assert.equal(page.copy.status, "failed", "the old success timer does not clear the failure")
})

test("a write that settles after a newer copy does not overwrite it", async () => {
  const pending: { resolve: () => void; reject: () => void }[] = []
  const clipboard = {
    writeText: () => new Promise<void>((resolve, reject) => {
      pending.push({ resolve, reject })
    }),
  }
  const page = setup(clipboard)
  const first = page.copy.press("Set up Vercel for me.")
  const second = page.copy.press("Set up Vercel for me.")
  pending[1].resolve()
  await second
  pending[0].reject()
  await first
  assert.equal(page.copy.status, "copied")
  assert.equal(page.fails.count, 0, "the late refusal changes nothing")
  assert.deepEqual(page.changes, ["copied"])
})

test("the success message also clears on blur, and its timer is cancelled", async () => {
  const page = setup(fakeClipboard(true))
  await page.copy.press("Set up Vercel for me.")
  page.copy.blur()
  assert.equal(page.copy.status, "idle")
  assert.equal(page.clock.pending, 0, "no reset is left waiting")
  page.clock.advance(RESET_AFTER_MS)
  assert.deepEqual(page.changes, ["copied", "idle"], "nothing changes after the blur")
})

test("the success message clears after 3 seconds", async () => {
  const page = setup(fakeClipboard(true))
  await page.copy.press("Set up Vercel for me.")
  page.clock.advance(RESET_AFTER_MS - 1)
  assert.equal(page.copy.status, "copied", "still shown just before 3 seconds")
  page.clock.advance(1)
  assert.equal(page.copy.status, "idle", "cleared at 3 seconds")
  assert.deepEqual(page.changes, ["copied", "idle"])
})
