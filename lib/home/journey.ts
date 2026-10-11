// The homepage journey: one entry per stop, in order. Each stop owns an equal stretch of the scroll and holds still
// through it; the 3D world moves to the next stop's state between them (lib/home/ui.ts).
// The words for each stop are in design/home.html (.cap, in the same order); lib/home/journey.test.ts keeps the two
// in step and holds every caption to the brief (.impeccable/surfaces/design-home-html.md).
//
// A stop's scene is either its own values or a tool world to fly to. Values a stop leaves out carry on from the stop
// before, so each one names only what changes.

/** The tool stops, by world id (lib/home/ui.ts FLY), each a job an owner does by hand or pays someone for: the books
 * (46% of Canadian small businesses use accounting software; QuickBooks holds 83% of it), the inbox, stock, ads, and
 * the numbers. Sources: National Post / QuickBooks small-business survey, 2025-10-16; 6sense, Small Business
 * Accounting, 2026. Any list of worlds works: add a world to FLY, a stop here, its things in lib/home/proof.ts. */
export const TOOL_STOPS = ["quickbooks", "gmail", "shopify", "meta", "microsoftexcel"] as const

export type JourneyStop = {
  /** What the stop shows, in a few words (for analytics and the tests). */
  id: string
  /** The part of the story the scene engine knows this stop by: its reduced-motion view, its open band. */
  sec: "chaos" | "guide" | "tools" | "plan" | "promises"
  /** The scene's values at this stop, or the tool world to fly to. */
  scene: Partial<HomeSceneParams> | { tool: (typeof TOOL_STOPS)[number] }
  /** On the plan: which of its five steps this stop lights (0 to 4). */
  step?: number
}

// Where the plan's figure-eight is drawn to, at each of its five steps.
const INK = [0.12, 0.32, 0.52, 0.74, 1]

export const JOURNEY: JourneyStop[] = [
  // 1 · Chaos: the three bodies, seen from above, pulling apart.
  { id: "chaos", sec: "chaos", scene: { k: 0, free: 0, order: 0, ink: 0, third: 0, el: 30, az: 0, dist: 11.5, ox: 0.25, oy: 0.05, poy: 0.2, calm: 0, dim: 0, labels: 0, conn: 0, agent: 0, stops: 0, tx: 0, tz: 0, fly: 0, wsel: -9, hero: 1, lens: 4, rf: 0, rs: 0, sp: 1, rw: 0 } },
  // 2 · Every tool pulls: the camera pulls back and up; the six tool worlds come into view round the business, each
  // one tugging the bodies its own way (their wells pull while nothing steers).
  { id: "tools-pull", sec: "guide", scene: { hero: 0, lens: 0, el: 74, az: -18, dist: 23, ox: 0, oy: -0.04, poy: -0.08, fly: 0.62, wsel: -9, rf: 0, rs: 0, sp: 1.5, rw: 1.3 } },
  // 3 · Talk to one: the AI lights at the centre; every world is joined to it; the bodies are held.
  { id: "talk-to-one", sec: "guide", scene: { conn: 1, el: 48, az: 14, dist: 16, fly: 0.4, sp: 1.2, rw: 0.6 } },
  // 4 to 8 · The tools: the camera flies to each world, where the visitor asks and the answer shows at once.
  ...TOOL_STOPS.map((tool): JourneyStop => ({ id: `tool-${tool}`, sec: "tools", scene: { tool } })),
  // 9 to 13 · The plan: back to the centre, where the orbit forms one step at a time.
  ...INK.map((ink, step): JourneyStop => ({
    id: `plan-${step + 1}`, sec: "plan", step,
    scene: step === 0
      ? { fly: 0, conn: 0, tx: 0, tz: 0, k: 0.45, free: 0.4, dim: 0, stops: 1, el: 60, az: 34, dist: 9.6, ox: 0.21, oy: 0.02, poy: 0.02, calm: 0.35, rf: 0, rs: 0, sp: 1, rw: 0, ink, third: 0.6 }
      : { k: 1, free: 1, ink, order: step === 4 ? 1 : 0, calm: 0.35 + step * 0.16, third: 0.6 + step * 0.1, el: 60 + step, az: 34 + step * 2 },
  })),
  // 14 · The promises: down inside the orbit, close, as the bodies glide past in order.
  { id: "promises", sec: "promises", scene: { stops: 0, el: 17, az: 78, dist: 8.8, lens: 8, ox: 0.24, oy: 0.03, poy: -0.04 } },
]

/** The close, after the journey: steering lets go and the orbit holds, seen whole from high above. */
export const FINALE: Partial<HomeSceneParams> = { k: 0, agent: 1, lens: 0, el: 58, az: 176, dist: 15.5, ox: 0.28, oy: 0.08, poy: 0.24 }
