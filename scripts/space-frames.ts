// Frame hashes for the homepage space (the engine in lib/space/engine.ts, drawn by the layout's world and bound by lib/home/scene.ts).
// Deterministic by construction: a seeded Math.random, a virtual clock, and a requestAnimationFrame that runs
// only when this script steps it. Fixed viewports, fixed scroll points, transitions off. Every frame hashes the
// pixels of the WebGL canvas and the label and stop styles the page writes. The same code gives the same
// hashes on every run, so a refactor that keeps the output keeps every hash.
// The scene's generator restarts when the page first sets its scene (window.solenix): React and Next.js draw from
// the same generator while they load, before the scene starts. A run waits until the scene is bound and the engine
// has sized its canvas (on a timer, not on frames), and a run cut short by a navigation is run again from a fresh page.
//
//   node scripts/space-frames.ts <outDir> [url] [--points N]   capture 2 viewports x 2 motion modes
//   node scripts/space-frames.ts --compare <a.json> <b.json>   count the frames compared, list any mismatch
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { launch } from "./browser.ts"

type Pair = [canvas: number, dom: number]
interface Run { viewport: string; motion: string; width: number; height: number; max: number; motionFlag: boolean | null; engine: boolean; errors: string[]; points: { y: number; frames: Pair[] }[] }
interface Capture { url: string; seed: number; stepMs: number; points: number; runs: Run[] }

declare global {
  interface Window {
    __step: (dt: number) => void
    __flush: (n: number) => Promise<void>
    __measure: () => Pair
  }
}

const VIEWPORTS: Record<string, { width: number; height: number }> = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } }
const MOTIONS = ["motion", "reduce"]
const SEED = 12345
const STEP_MS = 1000 / 60
const WARM_STEPS = 60
const FLUSH_FRAMES = 3
const STEPS_PER_POINT = 2
const SHOT_POINTS = [0, 15, 30, 45, 59]
// Input at fixed points of the sweep: pointer moves and a press (the pointer is a mass on the plane), and a resize to the same size.
interface Interaction { type: "pointermove" | "pointerdown" | "resize"; x: number; y: number }
function interaction(i: number, w: number, h: number): Interaction | null {
  if (i === 10) return { type: "pointermove", x: Math.round(w * 0.3), y: Math.round(h * 0.6) }
  if (i === 20) return { type: "pointerdown", x: Math.round(w * 0.8), y: Math.round(h * 0.2) }
  if (i === 30) return { type: "pointermove", x: Math.round(w * 0.5), y: Math.round(h * 0.5) }
  if (i === 40) return { type: "resize", x: 0, y: 0 }
  if (i === 50) return { type: "pointermove", x: Math.round(w * 0.1), y: Math.round(h * 0.9) }
  return null
}
const STILL_CSS = "*,*::before,*::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}"

// Runs before any page script. Replaces the page's three non-deterministic inputs with fixed ones:
// Math.random (seeded), performance.now (virtual), and requestAnimationFrame (runs only when stepped).
// Written as one function so it can be sent into the page as text.
function installClock(seed: number) {
  let s = seed | 0
  Math.random = () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  // The page's scene starts from a fresh seed. React and Next.js draw from this same generator while they load, before
  // the scene is set up (the raw page drew nothing first), so the first time the page sets its scene the generator
  // is reseeded; the scene's own draws follow in the same order as before. Later sets (React strict mode attaches twice) do not reseed.
  let sceneState: unknown = undefined
  Object.defineProperty(window, "solenix", { configurable: true, get: () => sceneState, set: (v: unknown) => { if (sceneState === undefined) s = seed | 0; sceneState = v } })
  let now = 1000000
  let id = 0
  let queue: [number, FrameRequestCallback][] = []
  // Timers run on the same virtual clock, so a 210 ms timer lands on the same frame in every run.
  const timers = new Map<number, { at: number; every: number; fn: () => void }>()
  let timerId = 0
  performance.now = () => now
  // The browser's own frames, kept for flush(): waiting for them lets it deliver the scroll and intersection events it owes.
  const nativeRaf = window.requestAnimationFrame.bind(window)
  window.__flush = (n) => new Promise<void>((resolve) => { let left = n; const next = () => { if (--left <= 0) resolve(); else nativeRaf(next) }; nativeRaf(next) })
  window.requestAnimationFrame = (cb) => { queue.push([++id, cb]); return id }
  window.cancelAnimationFrame = (handle) => { queue = queue.filter(([k]) => k !== handle) }
  Object.assign(window, {
    setTimeout: (fn: () => void, ms = 0) => { const k = ++timerId; timers.set(k, { at: now + Math.max(0, ms), every: 0, fn }); return k },
    clearTimeout: (k: number) => { timers.delete(k) },
    setInterval: (fn: () => void, ms = 0) => { const k = ++timerId; timers.set(k, { at: now + Math.max(1, ms), every: Math.max(1, ms), fn }); return k },
    clearInterval: (k: number) => { timers.delete(k) },
  })
  const nextDue = (): number | undefined => {
    let best: [number, number] | undefined
    for (const [k, t] of timers) if (t.at <= now && (!best || t.at < best[0] || (t.at === best[0] && k < best[1]))) best = [t.at, k]
    return best?.[1]
  }
  window.__step = (dt) => {
    now += dt
    for (let k = nextDue(); k !== undefined; k = nextDue()) {
      const t = timers.get(k)!
      if (t.every) t.at += t.every; else timers.delete(k)
      t.fn()
    }
    const run = queue; queue = []; for (const [, cb] of run) cb(now)
  }
  window.__measure = () => {
    const fnv = (bytes: Uint8Array, seed: number) => { let h = seed; for (let i = 0; i < bytes.length; i++) h = Math.imul(h ^ bytes[i], 16777619); return h >>> 0 }
    const text = (str: string, seed: number) => fnv(new TextEncoder().encode(str), seed)
    let canvasHash = 0
    const canvas = document.getElementById("gl") as HTMLCanvasElement | null
    const gl = canvas ? canvas.getContext("webgl2") : null
    if (canvas && gl) {
      const px = new Uint8Array(canvas.width * canvas.height * 4)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, px)
      canvasHash = text(`${canvas.width}x${canvas.height}`, fnv(px, 0x811c9dc5))
    }
    const lines: string[] = []
    for (const el of document.querySelectorAll<HTMLElement>(".body-tag, .world-tag, .stop-mk, #after, .world, #gl")) lines.push(`${el.id}.${el.className}|${el.style.opacity}|${el.style.transform}|${el.style.visibility}`)
    lines.push(`ui:${document.querySelector<HTMLElement>(".body-tag")?.parentElement?.className ?? ""}`)
    return [canvasHash, text(lines.join("\n"), 0x811c9dc5)]
  }
}

async function capture(url: string, outDir: string, points: number): Promise<Capture> {
  const origin = new URL(url).origin
  const browser = await launch()
  const runs: Run[] = []
  try {
    // One run is one fresh page. A run that is cut short (the page navigates while it is measured) is run again from
    // a fresh page: the frames of a run depend only on its own clock, so a retry gives the same hashes.
    const runOne = async (vp: string, size: { width: number; height: number }, motion: string) => {
      const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1, reducedMotion: motion === "reduce" ? "reduce" : "no-preference" })
      await ctx.addInitScript(`(${installClock.toString()})(${SEED})`)
      const page = await ctx.newPage()
      const errors: string[] = []
      page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)))
      // The dev server's live-reload stream is not part of the page: it would reload the page on a save to design/ or lib/site-*.
      await page.route("**/*", (route) => (route.request().url().includes("/dev/reload") || !route.request().url().startsWith(origin) ? route.abort() : route.continue()))
      await page.goto(url, { waitUntil: "load" })
      // Ready when the world is: the homepage has bound to it and the engine has sized the canvas (before any step, so the clock is still at its start).
      // Polled on a timer, not on animation frames: the virtual clock below holds every animation frame until a step.
      await page.waitForFunction(() => Boolean((window as unknown as { solenix?: unknown }).solenix) && ((document.getElementById("gl") as HTMLCanvasElement | null)?.width ?? 0) > 300, undefined, { polling: 50, timeout: 60000 })
      await page.evaluate(async () => { await document.fonts.ready })
      await page.addStyleTag({ content: STILL_CSS })
      await page.evaluate(() => window.__flush(30))
      await page.evaluate(([steps, dt]: [number, number]) => { for (let i = 0; i < steps; i++) window.__step(dt) }, [WARM_STEPS, STEP_MS] as [number, number])
      const info = await page.evaluate(() => ({
        max: document.documentElement.scrollHeight - innerHeight,
        width: innerWidth,
        height: innerHeight,
        motionFlag: (window as unknown as { solenix?: { motion?: boolean } }).solenix?.motion ?? null,
        // The page runs the space engine: its canvas has the size the engine gave it.
        engine: ((document.getElementById("gl") as HTMLCanvasElement | null)?.width ?? 0) > 300,
      }))
      const ys = Array.from({ length: points }, (_, i) => Math.round(info.max * i / (points - 1)))
      const out: Run["points"] = []
      const rereads: string[] = []
      for (const [i, y] of ys.entries()) {
        const act = interaction(i, info.width, info.height)
        if (i === 0) rereads.length = 0
        const frames = await page.evaluate(([yy, steps, dt, input]: [number, number, number, Interaction | null]) => {
          window.scrollTo({ top: yy, behavior: "instant" })
          window.dispatchEvent(new Event("scroll"))
          if (input) window.dispatchEvent(input.type === "resize" ? new Event("resize") : new PointerEvent(input.type, { clientX: input.x, clientY: input.y, pointerType: "mouse" }))
          const f: [number, number][] = []
          for (let k = 0; k < steps; k++) { window.__step(dt); f.push(window.__measure()); const again = window.__measure(); if (again[0] !== f[f.length - 1][0] || again[1] !== f[f.length - 1][1]) rereads.push(`${yy}:${k}`) }
          return f
        }, [y, STEPS_PER_POINT, STEP_MS, act] as [number, number, number, Interaction | null])
        out.push({ y, frames })
        if (rereads.length) { console.log('reread-mismatch', vp, motion, i, rereads.join(' ')); rereads.length = 0 }
        await page.evaluate((n) => window.__flush(n), FLUSH_FRAMES)
        if (SHOT_POINTS.includes(i) && points === 60) await page.screenshot({ path: path.join(outDir, `shot-${vp}-${motion}-${i}.png`) })
      }
      runs.push({ viewport: vp, motion, width: info.width, height: info.height, max: info.max, motionFlag: info.motionFlag, engine: info.engine, errors, points: out })
      await ctx.close()
    }
    for (const [vp, size] of Object.entries(VIEWPORTS)) for (const motion of MOTIONS) {
      for (let attempt = 1; ; attempt++) {
        try { await runOne(vp, size, motion); break } catch (e) { if (attempt >= 3) throw e; console.log("retry", vp, motion, String(e).slice(0, 160)) }
      }
    }
  } finally {
    await browser.close()
  }
  return { url, seed: SEED, stepMs: STEP_MS, points, runs }
}

function compare(a: Capture, b: Capture) {
  const mismatches: string[] = []
  let frames = 0, hashes = 0
  for (const ra of a.runs) {
    const rb = b.runs.find((r) => r.viewport === ra.viewport && r.motion === ra.motion)
    if (!rb) { mismatches.push(`no run ${ra.viewport} ${ra.motion} in the second capture`); continue }
    if (ra.points.length !== rb.points.length) mismatches.push(`${ra.viewport} ${ra.motion}: ${ra.points.length} points vs ${rb.points.length}`)
    ra.points.forEach((pa, i) => {
      const pb = rb.points[i]
      if (!pb) return
      if (pa.y !== pb.y) mismatches.push(`${ra.viewport} ${ra.motion} point ${i}: scroll ${pa.y} vs ${pb.y}`)
      pa.frames.forEach((fa, k) => {
        const fb = pb.frames[k]
        frames++; hashes += 2
        if (!fb) { mismatches.push(`${ra.viewport} ${ra.motion} y=${pa.y} frame ${k}: missing`); return }
        if (fa[0] !== fb[0]) mismatches.push(`${ra.viewport} ${ra.motion} y=${pa.y} frame ${k}: canvas ${fa[0]} vs ${fb[0]}`)
        if (fa[1] !== fb[1]) mismatches.push(`${ra.viewport} ${ra.motion} y=${pa.y} frame ${k}: dom ${fa[1]} vs ${fb[1]}`)
      })
    })
  }
  return { runs: a.runs.length, points: a.runs.reduce((n, r) => n + r.points.length, 0), frames, hashes, mismatches }
}

const argv = process.argv.slice(2)
if (argv[0] === "--compare") {
  const [fa, fb] = argv.slice(1)
  const result = compare(JSON.parse(readFileSync(fa, "utf8")) as Capture, JSON.parse(readFileSync(fb, "utf8")) as Capture)
  console.log(JSON.stringify({ runs: result.runs, points: result.points, frames: result.frames, hashes: result.hashes, mismatches: result.mismatches.length }))
  for (const m of result.mismatches.slice(0, 40)) console.log("mismatch:", m)
  process.exit(result.mismatches.length || result.frames === 0 ? 1 : 0)
}

const pointsArg = argv.indexOf("--points")
const points = pointsArg >= 0 ? Number(argv[pointsArg + 1]) : 60
const positional = argv.filter((a, i) => a !== "--points" && (pointsArg < 0 || i !== pointsArg + 1))
const outDir = positional[0]
if (!outDir) throw new Error("usage: node scripts/space-frames.ts <outDir> [url] [--points N] | --compare <a.json> <b.json>")
const url = positional[1] ?? "http://localhost:3000/"
mkdirSync(outDir, { recursive: true })
const result = await capture(url, outDir, points)
const file = path.join(outDir, "frames.json")
writeFileSync(file, JSON.stringify(result))
const frames = result.runs.reduce((n, r) => n + r.points.length * STEPS_PER_POINT, 0)
console.log(JSON.stringify({ file, url, runs: result.runs.map((r) => `${r.viewport}/${r.motion} ${r.width}x${r.height} motionFlag=${r.motionFlag} engine=${r.engine} points=${r.points.length} errors=${r.errors.length}`), frames, hashes: frames * 2 }))
