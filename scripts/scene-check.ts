// Review gate for the homepage: renders every [data-scene] the way visitors see
// it and fails when a scene is flat or dead. Run with the dev server up:
//   npm run scenes            (defaults to http://localhost:3000/)
// Measures, per scene, at desktop and phone widths, with Reduce Motion off and on:
//   world  % of sampled points where the 3D world is visible (not under an opaque
//          or blurred panel). Must be >= MIN_WORLD.
//   alive  whether the screen changes over time. Every scene must be alive with
//          motion allowed; demonstrations (DEMO_SCENES) must stay alive with
//          Reduce Motion on, because reduced motion stops camera movement, not
//          the demonstration.
import { launch } from "./browser.ts"
import { loadViewports } from "../lib/viewports.ts"

const URL = process.argv[2] ?? "http://localhost:3000/"
const MIN_WORLD = Number(process.env.MIN_WORLD ?? 60)
const DEMO_SCENES = (process.env.DEMO_SCENES ?? "").split(",").filter(Boolean)
const ONLY = process.env.ONLY // e.g. ONLY=pane to check one viewport
// The sizes are in design/viewports.json. "pane" is the size Jager reviews in (the Claude app browser pane).
const { pane, desktop, phone } = loadViewports()
const VIEWPORTS = { pane, desktop, phone }

// Runs in the page: share of a 10x9 grid of points that fall inside a visible
// 3D canvas with nothing opaque or blurred on top. The canvas ignores the
// pointer (pointer-events: none), so hit-testing can't see it; use geometry.
const worldShare = () => {
  const canvases = [...document.querySelectorAll("canvas")].filter((c) => {
    const cs = getComputedStyle(c)
    return cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.2 && c.offsetParent !== null
  })
  const inCanvas = (x: number, y: number) => canvases.some((c) => {
    const r = c.getBoundingClientRect()
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
  })
  const covers = (e: Element) => {
    const cs = getComputedStyle(e)
    const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/)
    const alpha = m ? Number(m[1].split(",")[3] ?? 1) : 0
    return alpha > 0.35 || (cs.backdropFilter && cs.backdropFilter !== "none")
  }
  let seen = 0, total = 0
  for (let fx = 0.05; fx < 1; fx += 0.1)
    for (let fy = 0.1; fy < 1; fy += 0.1) {
      total++
      const x = innerWidth * fx, y = innerHeight * fy
      if (!inCanvas(x, y)) continue
      const stack = document.elementsFromPoint(x, y).filter((e) => e !== document.documentElement && e !== document.body)
      if (!stack.some(covers)) seen++
    }
  return seen / total
}

const browser = await launch()
// Never leave a headless browser behind: an orphan keeps rendering the 3D scene and chokes the Mac
// (three orphans at ~250% CPU each made every timing on 2026-10-01 look slow).
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => browser.close().finally(() => process.exit(130)))
let failed = 0, flaky = 0
const rows = []
for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
  if (ONLY && vpName !== ONLY) continue
  for (const motion of ["no-preference", "reduce"] as const) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 2, reducedMotion: motion })
    await page.goto(URL, { waitUntil: "networkidle" })
    const scenes = await page.$$eval("[data-scene]", (els) => els.map((e) => ({ id: e.id, scene: (e as HTMLElement).dataset.scene ?? "" })))
    // One measurement of a scene: average world share over its screens, and whether anything moved.
    const measure = async (id: string) => {
      const box = await page.locator(`#${id}`).boundingBox()
      const top = await page.evaluate((sel) => document.querySelector(sel)!.getBoundingClientRect().top + scrollY, `#${id}`)
      if (!box) throw new Error(`scene ${id} has no box`)
      const steps = Math.max(1, Math.round(box.height / viewport.height))
      let world = 0, alive = false
      for (let k = 0; k < steps; k++) {
        await page.evaluate((y) => scrollTo(0, y), top + k * viewport.height)
        await page.waitForTimeout(600)
        world += await page.evaluate(worldShare)
        for (let t = 0; t < 3 && !alive; t++) { // up to ~2 s of watching before calling it frozen
          const a = await page.screenshot()
          await page.waitForTimeout(700)
          alive = !a.equals(await page.screenshot())
        }
      }
      return { world: Math.round((100 * world) / steps), alive }
    }
    for (const { id, scene } of scenes) {
      const needAlive = motion === "no-preference" || DEMO_SCENES.includes(scene)
      const problemsOf = (m: { world: number; alive: boolean }) => [m.world < MIN_WORLD && `world ${m.world}% < ${MIN_WORLD}%`, needAlive && !m.alive && "frozen"].filter(Boolean)
      let m = await measure(id)
      let problems = problemsOf(m)
      let status = problems.length ? "FAIL" : "ok  "
      if (problems.length) { // measure again: a failure must repeat, and a pass on retry is reported as flaky
        const again = await measure(id)
        if (!problemsOf(again).length) { status = "FLKY"; flaky++; m = again; problems = [`passed on retry (first: ${problems.join("; ")})`] }
      }
      if (status === "FAIL") failed++
      rows.push(`${status} ${vpName.padEnd(7)} ${motion === "reduce" ? "reduced" : "motion "} ${id.padEnd(20)} world ${String(m.world).padStart(3)}%  ${m.alive ? "alive " : "frozen"}  ${problems.join("; ")}`)
    }
    await page.close()
  }
}
await browser.close()
console.log(rows.join("\n"))
console.log((failed ? `\nscene-check: ${failed} failing scene renders` : "\nscene-check: every scene is in the world and alive") + (flaky ? ` (${flaky} flaky: passed on retry)` : ""))
process.exit(failed ? 1 : 0)
