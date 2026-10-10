// Tests for lib/marketplace/parts.ts through its interface, with a fake GitHub at the seam: makeDescriber(get, headers, memo).
//   node --test lib/marketplace/parts.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { makeDescriber, type Answer, type Tree } from "./parts.ts"

const SLUG = "SolenixAI/agents-marketplace"
const skillPath = (id: string) => `skills/${id}/SKILL.md`
const skill = (name: string, description: string) => `---\nname: ${name}\ndescription: ${description}\n---\n# ${name}\n`
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
/** A tree as its caller holds it: the read that gave it may still be in flight. */
const tree = (sha: string | null, paths: string[]): Promise<Tree> => Promise.resolve({ sha, paths })
/** The id fallback: a part whose description could not be read. It shows its id and no blurb. */
const bare = (id: string) => ({ id, kind: "skill", name: id, blurb: null, href: `https://github.com/${SLUG}/blob/HEAD/${skillPath(id)}` })
const noHeaders = async () => ({})

/** A describer over a fake GitHub. Its memo is passed in, so a test can count what the describer holds. */
function describerOver(get: (url: string, init: RequestInit) => Promise<Response>) {
  const memo = new Map<string, Answer>()
  return { parts: makeDescriber(get, noHeaders, memo), memo }
}

/** GitHub's answer to one GraphQL request: each aliased file's text at HEAD, null for a file that is not there. */
function answerFrom(query: string, files: Record<string, string>): Response {
  const repository: Record<string, { text: string } | null> = {}
  for (const m of query.matchAll(/(f\d+): object\(expression: ("(?:[^"\\]|\\.)*")\)/g)) {
    const path = (JSON.parse(m[2]) as string).replace(/^HEAD:/, "")
    repository[m[1]] = Object.hasOwn(files, path) ? { text: files[path] } : null
  }
  return json({ data: { repository } })
}

/** A fake GitHub at the network seam. Each GraphQL request is recorded; `reply` decides the answer, so a test can make a read fail. */
function fakeGitHub(files: Record<string, string>) {
  const fake: { queries: string[]; reply: (query: string) => Response; get: (url: string, init: RequestInit) => Promise<Response> } = {
    queries: [],
    reply: (query) => answerFrom(query, files),
    get: (_url, init) => {
      const query = (JSON.parse(String(init.body)) as { query: string }).query
      fake.queries.push(query)
      return Promise.resolve(fake.reply(query))
    },
  }
  return fake
}

/** Lets every request already sent run up to its reply, so the test decides when each one answers. */
const tick = () => new Promise<void>((done) => setImmediate(done))

test("the same tree twice is one GraphQL request: the second read is held", async () => {
  const gh = fakeGitHub({ [skillPath("fetch")]: skill("Fetch", "Get a web page") })
  const { parts } = describerOver(gh.get)
  const t = tree("t1", [skillPath("fetch")])
  const first = await parts(SLUG, t, ["skill"])
  assert.deepEqual(first, [{ id: "fetch", kind: "skill", name: "Fetch", blurb: "Get a web page", href: `https://github.com/${SLUG}/blob/HEAD/${skillPath("fetch")}` }])
  assert.deepEqual(await parts(SLUG, t, ["skill"]), first)
  assert.equal(gh.queries.length, 1, "one request for one tree")
})

test("a new tree replaces the held answer: its descriptions are read again, and the older tree is not held", async () => {
  const files: Record<string, string> = { [skillPath("fetch")]: skill("Fetch", "Get a web page") }
  const gh = fakeGitHub(files)
  const { parts } = describerOver(gh.get)
  await parts(SLUG, tree("t1", [skillPath("fetch")]), ["skill"])
  files[skillPath("fetch")] = skill("Fetch", "Get a web page, faster")
  const after = await parts(SLUG, tree("t2", [skillPath("fetch")]), ["skill"])
  assert.equal(after[0].blurb, "Get a web page, faster", "the new tree's description")
  assert.equal(gh.queries.length, 2)
  await parts(SLUG, tree("t1", [skillPath("fetch")]), ["skill"])
  assert.equal(gh.queries.length, 3, "t1 was replaced, so it is read again rather than held")
})

test("a slow read of an older tree never replaces the newer answer: a later failed read serves the newer text", async () => {
  const files: Record<string, string> = { [skillPath("fetch")]: skill("Fetch", "Get a web page") }
  const gh = fakeGitHub(files)
  // Each request reads the files as they are when it is sent, and answers only when the test releases it.
  const release: Array<() => void> = []
  const get = (url: string, init: RequestInit) => {
    const answer = gh.get(url, init)
    return new Promise<Response>((resolve) => release.push(() => answer.then(resolve)))
  }
  const { parts } = describerOver(get)
  const older = parts(SLUG, tree("t1", [skillPath("fetch")]), ["skill"])
  await tick()
  files[skillPath("fetch")] = skill("Fetch", "Get a web page, faster")
  const newer = parts(SLUG, tree("t2", [skillPath("fetch")]), ["skill"])
  await tick()
  release[1]()
  assert.equal((await newer)[0].blurb, "Get a web page, faster", "the newer tree is read and held")
  release[0]()
  assert.equal((await older)[0].blurb, "Get a web page", "the older tree still gets its own answer")
  gh.reply = () => new Response("<!doctype html><title>Bad gateway</title>", { status: 200 })
  const later = parts(SLUG, tree("t3", [skillPath("fetch")]), ["skill"])
  await tick()
  release[2]()
  assert.equal((await later)[0].blurb, "Get a web page, faster", "a failed read serves the newer answer, never the older one")
  assert.equal(gh.queries.length, 3)
})

test("100 trees of one repo keep one entry: the memo does not grow with every push", async () => {
  const gh = fakeGitHub({ [skillPath("fetch")]: skill("Fetch", "Get a web page") })
  const { parts, memo } = describerOver(gh.get)
  for (let push = 1; push <= 100; push++) await parts(SLUG, tree(`t${push}`, [skillPath("fetch")]), ["skill"])
  assert.equal(memo.size, 1, "one entry for the repo, not one per commit")
  await parts(SLUG, tree("t100", [skillPath("fetch")]), ["skill"])
  assert.equal(gh.queries.length, 100, "the newest tree is still held: no request for it")
})

test("a 200 reply that is not JSON gives the id fallback, not a rejection, and nothing is kept", async () => {
  const gh = fakeGitHub({ [skillPath("fetch")]: skill("Fetch", "Get a web page") })
  const healthy = gh.reply
  gh.reply = () => new Response("<!doctype html><title>Bad gateway</title>", { status: 200 })
  const { parts, memo } = describerOver(gh.get)
  const t = tree("t1", [skillPath("fetch")])
  assert.deepEqual(await parts(SLUG, t, ["skill"]), [bare("fetch")], "the id fallback, not a rejection")
  assert.equal(memo.size, 0, "a bad body leaves nothing held")
  gh.reply = healthy
  assert.equal((await parts(SLUG, t, ["skill"]))[0].blurb, "Get a web page", "the next read asks again")
  assert.equal(gh.queries.length, 2)
})

test("a request that throws gives the id fallback, not a rejection, and nothing is kept", async () => {
  const gh = fakeGitHub({ [skillPath("fetch")]: skill("Fetch", "Get a web page") })
  const healthy = gh.reply
  gh.reply = () => { throw new Error("offline") }
  const { parts, memo } = describerOver(gh.get)
  const t = tree("t1", [skillPath("fetch")])
  assert.deepEqual(await parts(SLUG, t, ["skill"]), [bare("fetch")], "the id fallback, not a rejection")
  assert.equal(memo.size, 0, "a failed request leaves nothing held")
  gh.reply = healthy
  assert.equal((await parts(SLUG, t, ["skill"]))[0].blurb, "Get a web page", "the next read asks again")
})

test("a per-field error is not kept: the read gives the id fallback, and the next read asks again", async () => {
  const files = { [skillPath("fetch")]: skill("Fetch", "Get a web page"), [skillPath("search")]: skill("Search", "Find a page") }
  const gh = fakeGitHub(files)
  const healthy = gh.reply
  gh.reply = () => json({ data: { repository: { f0: null, f1: { text: skill("Search", "Find a page") } } }, errors: [{ message: "Could not resolve to a Blob" }] })
  const { parts, memo } = describerOver(gh.get)
  const t = tree("t1", [skillPath("fetch"), skillPath("search")])
  const degraded = await parts(SLUG, t, ["skill"])
  assert.ok(degraded.every((p) => p.blurb === null), "a partial read is not shown as complete")
  assert.equal(memo.size, 0, "a partial read leaves nothing held")
  gh.reply = healthy
  const complete = await parts(SLUG, t, ["skill"])
  assert.equal(gh.queries.length, 2, "the partial answer was not kept, so the next read asks GitHub again")
  assert.deepEqual(complete.map((p) => p.blurb), ["Get a web page", "Find a page"])
})

test("a tree that could not be read gives the last good answer, and sends no request", async () => {
  const gh = fakeGitHub({ [skillPath("fetch")]: skill("Fetch", "Get a web page") })
  const { parts } = describerOver(gh.get)
  const good = await parts(SLUG, tree("t1", [skillPath("fetch")]), ["skill"])
  assert.deepEqual(await parts(SLUG, tree(null, []), ["skill"]), good, "the last good answer stays on screen")
  assert.equal(gh.queries.length, 1, "an unreadable tree sends no request")
  await parts(SLUG, tree("t2", [skillPath("fetch")]), ["skill"])
  assert.equal(gh.queries.length, 2, "the next readable tree is read as usual")
})

test("a repo's part files are read in requests of at most 100 files", async () => {
  const files = Object.fromEntries(Array.from({ length: 250 }, (_, i) => [skillPath(`skill-${i}`), skill(`Skill ${i}`, `Does thing ${i}`)]))
  const gh = fakeGitHub(files)
  const { parts } = describerOver(gh.get)
  const described = await parts(SLUG, tree("t1", Object.keys(files)), ["skill"])
  assert.equal(described.length, 250)
  assert.ok(described.every((p) => p.blurb !== null), "every file described")
  assert.equal(gh.queries.length, 3, "250 files: requests of 100, 100 and 50")
  for (const q of gh.queries) assert.ok((q.match(/object\(expression:/g) ?? []).length <= 100, "no request names more than 100 files")
})
