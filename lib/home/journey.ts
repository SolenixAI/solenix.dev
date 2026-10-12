// The homepage journey: one entry per stop, in order. Each stop owns an equal stretch of the scroll and holds still
// through the middle of it (HOLD, lib/home/ui.ts); the camera glides to the next stop's state through the rest.
// The words for each stop are in design/home.html (.cap, in the same order); lib/home/journey.test.ts keeps the two
// in step and holds every caption to the brief (.impeccable/surfaces/design-home-html.md).
//
// A stop's scene is either its own values or a tool world to fly to. Values a stop leaves out carry on from the stop
// before, so each one names only what changes.

import { TOOL_ORDER } from "./worlds.ts"

/** The role stops, by world id, in the order the journey visits them (each world's stop in lib/home/worlds.ts): the hats
 * an owner wears: receptionist (customer service, 54% of owners), bookkeeper (43%), ad manager (marketer, 44%),
 * stock manager and analyst (survey of 1,000 owners, NY Post 2026-05-21). Why these tools:
 * design/research/site-playbook.md (Sources). To add a tool, follow lib/home/worlds.ts. */
export const TOOL_STOPS = TOOL_ORDER

export type JourneyStop = {
  /** What the stop shows, in a few words (for analytics and the tests). */
  id: string
  /** The part of the story the scene engine knows this stop by: its reduced-motion view, its open band. */
  sec: "chaos" | "guide" | "tools" | "plan" | "promises"
  /** The scene's values at this stop, or the tool world to fly to. */
  scene: Partial<HomeSceneParams> | { tool: (typeof TOOL_STOPS)[number] }
}

/** The plan's steps: five stops on the orbit, lit one at a time on one stop of the journey (design/home.html, the
 * plan's <ol class="steps">, holds their words; lib/home/journey.test.ts checks the two agree). */
export const PLAN_STEPS = 5

export const JOURNEY: JourneyStop[] = [
  // 1 · Chaos: the three bodies, seen from above, pulling apart.
  { id: "chaos", sec: "chaos", scene: { k: 0, free: 0, order: 0, ink: 0, third: 0, el: 30, az: 0, dist: 11.5, ox: 0.25, oy: 0.05, poy: 0.2, calm: 0, dim: 0, conn: 0, agent: 0, stops: 0, tx: 0, tz: 0, fly: 0, wsel: -9, hero: 1, lens: 4, rf: 0, rs: 0, sp: 1, rw: 0 } },
  // 2 · Every tool pulls: the camera pulls back and up; the five tool worlds come into view round the business, each
  // one tugging the bodies its own way (their wells pull while nothing steers).
  { id: "tools-pull", sec: "guide", scene: { hero: 0, lens: 0, el: 74, az: -18, dist: 23, ox: 0, oy: -0.04, poy: -0.08, fly: 0.62, wsel: -9, rf: 0, rs: 0, sp: 1.5, rw: 1.3 } },
  // 3 · Talk to one: the AI lights at the centre; every world is joined to it; the bodies are held.
  { id: "talk-to-one", sec: "guide", scene: { conn: 1, el: 48, az: 14, dist: 16, fly: 0.4, sp: 1.2, rw: 0.6 } },
  // 4 to 8 · The tools: the camera flies to each world, where the AI does a job live (lib/home/proof.ts playProof).
  ...TOOL_STOPS.map((tool): JourneyStop => ({ id: `tool-${tool}`, sec: "tools", scene: { tool } })),
  // 9 · The plan: back to the centre, where the orbit forms and its five stops light one at a time, each with its step.
  { id: "plan", sec: "plan", scene: { fly: 0, conn: 0, tx: 0, tz: 0, k: 1, free: 1, ink: 1, order: 1, dim: 0, stops: 1, el: 62, az: 38, dist: 9.6, ox: 0.21, oy: 0.02, poy: 0.02, calm: 1, third: 1, rf: 0, rs: 0, sp: 1, rw: 0 } },
  // 10 · The promises: down inside the orbit, close, as the bodies glide past in order.
  { id: "promises", sec: "promises", scene: { stops: 0, el: 17, az: 78, dist: 8.8, lens: 8, ox: 0.24, oy: 0.03, poy: -0.04 } },
]

/** The close, after the journey: steering lets go and the orbit holds, seen whole from high above. */
export const FINALE: Partial<HomeSceneParams> = { k: 0, agent: 1, lens: 0, el: 58, az: 176, dist: 15.5, ox: 0.28, oy: 0.08, poy: 0.24 }
