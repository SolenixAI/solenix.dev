// The one reader of design/viewports.json: every script takes its screen sizes from here.
// Sizes are Playwright viewports ({ width, height }).
import { readFileSync } from "node:fs"

type Viewport = { width: number; height: number }

export type Viewports = {
  pane: Viewport // the browser pane Jager reviews in
  desktop: Viewport
  phone: Viewport
  preview: Viewport // the link-preview card
  hero: Viewport[] // every size a page's first screen must fit, each once
}

const DEFAULT_FILE = new URL("../design/viewports.json", import.meta.url)

const whole = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n > 0

// One size from the file: { "w": 1, "h": 1 } with whole numbers above zero. Anything else fails, naming where.
function size(raw: unknown, where: string): Viewport {
  const { w, h } = (raw ?? {}) as { w?: unknown; h?: unknown }
  if (!whole(w) || !whole(h)) throw new Error(`${where} needs whole-number w and h above zero`)
  return { width: w, height: h }
}

export function loadViewports(file: URL | string = DEFAULT_FILE): Viewports {
  const data = JSON.parse(readFileSync(file, "utf8"))
  const named = (key: string): Viewport => size(data[key], `${file}: "${key}"`)
  const preview = named("preview")
  const listed: Viewport[] = [
    ...(data.real?.sizes ?? []).map((s: unknown, i: number) => size(s, `${file}: real.sizes[${i}]`)),
    ...(data.edges ?? []).map((s: unknown, i: number) => size(s, `${file}: edges[${i}]`)),
    preview,
  ]
  const hero = listed.filter((v, i) => listed.findIndex((u) => u.width === v.width && u.height === v.height) === i)
  return { pane: named("pane"), desktop: named("desktop"), phone: named("phone"), preview, hero }
}
