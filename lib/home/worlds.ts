// The tool worlds round the business, one source for the scene (lib/home/scene.ts: the wells, their marks) and the
// camera (lib/home/ui.ts: each world's view). Each sits in a slot on a wide circle, one every 60 degrees from 40; its
// view and the place where the three bodies roam beside it were tuned to that slot. To add a tool: a world here (a free
// slot and its journey stop), then its mark and its ask in design/home.html (an <svg> symbol lg-<id>, a .world-tag with
// data-world="<id>", an .asks with data-tool="<id>") and its things in lib/home/proof.ts. lib/home/worlds.test.ts fails
// until every copy agrees with this record.
const R = 12
const D2R = (d: number) => (d * Math.PI) / 180

type World = { id: string; slot: number; stop: number; mass: number; el: number; dist: number; roam: [number, number]; sp: number; rw: number }

const WORLDS: World[] = [
  { id: "shopify", slot: 0, stop: 3, mass: 1, el: 24, dist: 8.6, roam: [-0.8, -2.6], sp: 1.0, rw: 1.1 },
  { id: "meta", slot: 1, stop: 2, mass: 0.8, el: 12, dist: 8.2, roam: [5.5, -2.5], sp: 1.5, rw: 2.0 },
  { id: "quickbooks", slot: 2, stop: 1, mass: 1.2, el: 56, dist: 11.5, roam: [0.5, 0], sp: 2.0, rw: 1.6 },
  { id: "gmail", slot: 3, stop: 0, mass: 0.85, el: 30, dist: 7.4, roam: [1.2, 3.0], sp: 1.0, rw: 1.0 },
  { id: "microsoftexcel", slot: 4, stop: 4, mass: 1.1, el: 16, dist: 10.5, roam: [3.5, -3.6], sp: 1.3, rw: 2.0 },
]

/** Where a slot sits on the circle, and its compass angle (degrees). */
export const slotAz = (slot: number) => 40 + 60 * slot
const place = (slot: number) => { const th = D2R(90 - slotAz(slot)); return { x: Math.cos(th) * R, z: Math.sin(th) * R } }

/** Each world with its place, in one order: index i is the same world everywhere (wells, marks, views). */
export const TOOL_WORLDS = WORLDS.map((w) => ({ ...w, ...place(w.slot) }))

/** The world ids in the order the journey visits them: each world's stop, 0 up. */
export const TOOL_ORDER = [...TOOL_WORLDS].sort((a, b) => a.stop - b.stop).map((w) => w.id)
