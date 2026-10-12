// What each tool's work looks like in the world, moment by moment: a pure choreography the page hands to the world
// (lib/space/sprites.ts draws it). No words carry the proof: the inbox is a swarm of envelopes the AI sweeps into
// order; what needs you comes close and lights up, what can wait settles into a calm ring, junk falls away into the
// dark. Positions are in world units, relative to the tool's world. The timing follows the ask (lib/home/proof.ts pace):
// typing, then the work, then the answer.
import type { ToolProof } from "./proof"
import { pace } from "./proof"

type Tone = "plain" | "hot" | "done" | "dim" | "new"
type Icon = "mail" | "invoice" | "box" | "coin" | "bar" | "spark"
type P3 = { x: number; y: number; z: number }
type SceneThing = P3 & { id: string; size: number; icon: Icon; tone: Tone; alpha: number; aspect?: number; label?: string }
type SceneLabel = P3 & { id: string; text: string; tone: Tone }
export type SceneMoment = { things: SceneThing[]; agent: P3 | null; labels: SceneLabel[] }

// A fixed pseudo-random number per thing and use, so every visit plays the same.
const rnd = (i: number, k: number) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s) }
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const mix = (a: P3, b: P3, t: number): P3 => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t })

// The receptionist's day: 29 calls and emails; 9 it answers itself, 4 need you, 16 are junk (the same counts as lib/home/proof.ts, Example).
const INBOX = { need: 4, wait: 9, junk: 16 }
const N = INBOX.need + INBOX.wait + INBOX.junk
const groupOf = (i: number) => (i < INBOX.need ? 0 : i < INBOX.need + INBOX.wait ? 1 : 2)

/** Where envelope i drifts before the AI touches it: its own tilted orbit round the world. */
function loose(i: number, T: number): P3 {
  const r = 1.3 + 1.7 * rnd(i, 1), w = (0.22 + 0.3 * rnd(i, 2)) * (rnd(i, 3) > 0.5 ? 1 : -1), a = rnd(i, 4) * Math.PI * 2 + w * T
  const inc = (rnd(i, 5) - 0.5) * 1.3, x = Math.cos(a) * r, z0 = Math.sin(a) * r
  return { x, y: 0.15 + z0 * Math.sin(inc) + 0.12 * Math.sin(T * 0.9 + i), z: z0 * Math.cos(inc) }
}

/** Where envelope i settles once sorted. */
function settled(i: number, T: number, since: number): P3 {
  const g = groupOf(i)
  if (g === 0) { const a = (i / INBOX.need) * Math.PI * 2 + T * 0.35; return { x: Math.cos(a) * 0.85, y: 1.0, z: Math.sin(a) * 0.85 } }
  if (g === 1) { const j = i - INBOX.need, a = (j / INBOX.wait) * Math.PI * 2 + T * 0.12; return { x: Math.cos(a) * 2.2, y: 0.25, z: Math.sin(a) * 2.2 } }
  // Junk falls into the world's well and fades.
  const at = loose(i, T); return { ...at, y: at.y - 3.4 * smooth(0, 1.2, since) }
}

/** The inbox at time t of ask a (T is the clock that keeps the drift going). */
function inbox(p: ToolProof, a: number, t: number, T: number): SceneMoment {
  const { s0, last } = pace(p, a)
  const order = [...Array(N).keys()].sort((i, j) => rnd(i, 4) - rnd(j, 4))
  const span = (last - s0) * 0.92, at = (i: number) => s0 + (order.indexOf(i) / N) * span
  const things: SceneThing[] = []
  let agent: P3 | null = null
  for (let i = 0; i < N; i++) {
    const g = groupOf(i), sorted = a > 0 ? 99 : t - at(i), b = smooth(0, 0.7, sorted)
    const pos = b <= 0 ? loose(i, T) : mix(loose(i, T), settled(i, T, sorted), b)
    const tone: Tone = b < 0.5 ? "plain" : g === 0 ? "new" : g === 1 ? "done" : "dim"
    things.push({ id: `mail${i}`, ...pos, size: g === 0 ? 0.24 + 0.16 * b : g === 2 ? 0.24 - 0.06 * b : 0.24, icon: "mail", tone, alpha: g === 2 ? 1 - 0.8 * smooth(0.4, 1.4, sorted) : 1 })
    if (a === 0 && sorted >= 0 && sorted < span / N) agent = loose(i, T)
  }
  const labels: SceneLabel[] = []
  if (a === 0 && t < s0) labels.push({ id: "count", text: `${N} calls and emails`, tone: "plain", x: 0, y: 1.6, z: 0 })
  if (a > 0 || t >= last) {
    labels.push({ id: "need", text: `${INBOX.need} need you today`, tone: "new", x: 0, y: 1.55, z: 0 })
    labels.push({ id: "junk", text: `${INBOX.junk} junk, gone`, tone: "dim", x: -0.9, y: -1.7, z: 0 })
    labels.push({ id: "wait", text: `${INBOX.wait} answered for you`, tone: "done", x: 0.9, y: -0.6, z: 0.8 })
  }
  // The second ask: book Harbour Dental. The AI goes to their email and an invite comes out of it, waiting for your OK.
  if (a === 1) {
    const from = settled(0, T, 9), done = smooth(s0, last, t), inv = mix(from, { x: from.x * 1.6, y: 2.0, z: from.z * 1.6 }, done)
    things[0].tone = "hot"
    if (t >= s0) things.push({ id: "invite", ...inv, size: 0.34 * done, icon: "mail", tone: "new", alpha: done })
    if (t >= s0 && t < last) agent = from
    if (t >= last) labels.push({ id: "invite", text: "Invite ready · you send it", tone: "new", x: inv.x, y: inv.y + 0.45, z: inv.z })
  }
  return { things, agent, labels }
}

// When the AI reaches thing k of n during the work, and how far along that thing's change is.
const visit = (p: ToolProof, a: number, k: number, n: number) => { const { s0, last } = pace(p, a); return s0 + (k / n) * (last - s0) }
const agentOver = (p: ToolProof, a: number, t: number, n: number) => { const { s0, last } = pace(p, a); return t >= s0 && t < last ? Math.min(n - 1, Math.floor(((t - s0) / (last - s0)) * n)) : -1 }

// The books: the invoices drift round the world; asked who owes, the AI lines them up by how late they are. The one
// past 60 days burns red at the top; the paid one turns green and falls away.
const BOOKS = [{ id: "hillside", days: 64, tone: "hot" as Tone, label: "Hillside Roofing · $2,400" }, { id: "eastend", days: 31, tone: "plain" as Tone, label: "East End Yoga · $850" }, { id: "harbour", days: 12, tone: "plain" as Tone, label: "Harbour Dental · $1,200" }, { id: "cove", days: 0, tone: "done" as Tone, label: "Cove Road Cafe · paid" }]
function books(p: ToolProof, a: number, t: number, T: number): SceneMoment {
  const things: SceneThing[] = [], labels: SceneLabel[] = [], { last } = pace(p, a), n = BOOKS.length
  BOOKS.forEach((b, k) => {
    const ang = (k / n) * Math.PI * 2 + T * 0.2, free = { x: Math.cos(ang) * 1.9, y: 0.3 + 0.15 * Math.sin(T + k), z: Math.sin(ang) * 1.9 }
    const lined = b.days ? { x: -1.5 + k * 1.0, y: 0.2 + (b.days / 64) * 1.5, z: 0.6 } : { x: 1.6, y: -1.6, z: 0.6 }
    const f = a > 0 ? 1 : smooth(0, 0.7, t - visit(p, a, k, n))
    things.push({ id: b.id, ...mix(free, lined, f), size: b.tone === "hot" && f > 0.5 ? 0.62 : 0.42, icon: "invoice", tone: f > 0.5 ? b.tone : "plain", alpha: b.days ? 1 : 1 - 0.6 * f, label: b.label })
  })
  if (a > 0 || t >= last) { labels.push({ id: "owed", text: "$4,450 owed to you", tone: "new", x: 0, y: -1.0, z: 0.6 }); labels.push({ id: "late", text: "64 days late", tone: "hot", x: -1.5, y: 2.4, z: 0.6 }) }
  // Asked to invoice Harbour Dental: a new invoice comes out of the world and waits beside theirs for your OK.
  if (a === 1) { const { s0 } = pace(p, a), g = smooth(s0, last, t); things.push({ id: "retainer", ...mix({ x: 0, y: 0, z: 0 }, { x: 0.5, y: 1.2, z: 1.2 }, g), size: 0.5 * g, icon: "invoice", tone: "new", alpha: g }); if (t >= last) labels.push({ id: "ready", text: "Invoice ready · you send it", tone: "new", x: 0.5, y: 1.8, z: 1.2 }) }
  const k = agentOver(p, a, t, n)
  return { things, labels, agent: k >= 0 ? things[a === 1 ? 2 : k] : null }
}

// The shop: each product is a stack of boxes that a month of sales drains, day by day. Two run out; the jam does not.
// Asked to reorder, crates fall in and the two stacks fill again, waiting for your OK.
const STOCK = [{ id: "caramels", boxes: 7, out: 5, name: "Sea salt caramels" }, { id: "mitts", boxes: 5, out: 4.5, name: "Wool mitts" }, { id: "jam", boxes: 8, out: 99, name: "Partridgeberry jam" }]
function shop(p: ToolProof, a: number, t: number, T: number): SceneMoment {
  const things: SceneThing[] = [], labels: SceneLabel[] = [], { s0, last } = pace(p, a)
  const day = a > 0 ? 30 : 30 * smooth(s0, last, t), refill = a === 1 ? smooth(s0, last, t) : 0
  STOCK.forEach((st, k) => {
    const x = -1.4 + k * 1.4, left = Math.max(0, 1 - day / st.out), shownN = st.out > 30 ? st.boxes : Math.ceil(st.boxes * left)
    for (let b = 0; b < st.boxes; b++) {
      const there = b < shownN, back = st.out < 30 && b < Math.round(st.boxes * refill)
      const y = -0.6 + b * 0.34 + (back && !there ? 2.5 * (1 - smooth(0, 1, refill * st.boxes - b)) : 0)
      things.push({ id: `${st.id}${b}`, x, y, z: 0.5, size: 0.36, icon: "box", tone: back && !there ? "done" : st.out < 30 && day >= st.out ? "hot" : "plain", alpha: there || back ? 1 : 0 })
    }
    labels.push({ id: `name-${st.id}`, text: st.name, tone: "plain", x, y: -1.05 - (k % 2) * 0.35, z: 0.5 })
    if (st.out < 30 && day >= st.out && refill === 0) things.push({ id: `${st.id}-empty`, x, y: -0.6, z: 0.5, size: 0.4, icon: "box", tone: "hot", alpha: 0.5 + 0.3 * Math.sin(T * 4) })
  })
  labels.push({ id: "day", text: a > 0 ? "Next 30 days" : `Day ${Math.round(day)} of 30`, tone: "plain", x: 0, y: 3.0, z: 0.5 })
  if (a === 0 && t >= last) labels.push({ id: "out", text: "Caramels and mitts run out", tone: "hot", x: 0, y: 2.4, z: 0.5 })
  if (a === 1 && t >= last) labels.push({ id: "re", text: "Reorder drafted · you approve it", tone: "new", x: 0, y: 2.4, z: 0.5 })
  const k = agentOver(p, a, t, STOCK.length)
  return { things, labels, agent: k >= 0 ? { x: -1.4 + k * 1.4, y: 0.6, z: 0.5 } : null }
}

// The ads: the budget streams out as coins to three ads, and customers spark back from each. One ad eats coins and
// sends back almost no one. Asked to move its budget, the stream swings to the fall sale, which lights up.
const ADS = [{ id: "local", ang: 0.6, sales: 1, name: "Local awareness" }, { id: "arrivals", ang: 2.6, sales: 3, name: "New arrivals" }, { id: "fall", ang: 4.4, sales: 5, name: "Fall sale" }]
function ads(p: ToolProof, a: number, t: number, T: number): SceneMoment {
  const things: SceneThing[] = [], labels: SceneLabel[] = [], { s0, last } = pace(p, a), moved = a === 1 ? smooth(s0, last, t) : 0
  ADS.forEach((ad, k) => {
    const at = { x: Math.cos(ad.ang) * 1.8, y: 0.5, z: Math.sin(ad.ang) * 1.8 }, seen = a > 0 ? 1 : smooth(0, 0.6, t - visit(p, a, k, ADS.length))
    const tone: Tone = ad.id === "local" ? (moved > 0.5 ? "dim" : seen > 0.5 ? "hot" : "plain") : ad.id === "fall" && moved > 0.5 ? "done" : "plain"
    things.push({ id: ad.id, ...at, size: 0.6, icon: "spark", tone, alpha: 1, label: ad.name })
    // The coins out: the local ad gets the most until the budget moves; then the fall sale does.
    const coins = ad.id === "local" ? Math.round(7 * (1 - moved)) + 1 : ad.id === "fall" ? 3 + Math.round(5 * moved) : 3
    for (let c = 0; c < 8; c++) { const u = (T * 0.45 + c / 8) % 1; things.push({ id: `${ad.id}-c${c}`, ...mix({ x: 0, y: 0.2, z: 0 }, at, u), size: 0.2, icon: "coin", tone: "new", alpha: c < coins ? Math.sin(u * Math.PI) : 0 }) }
    // The customers back: sparks rising from the ad, as many as it brings.
    const sales = ad.id === "fall" ? ad.sales + Math.round(4 * moved) : ad.sales
    for (let c = 0; c < 9; c++) { const u = (T * 0.35 + c / 9 + k * 0.17) % 1; things.push({ id: `${ad.id}-s${c}`, x: at.x, y: at.y + u * 1.6, z: at.z, size: 0.16, icon: "spark", tone: "done", alpha: c < sales ? Math.sin(u * Math.PI) : 0 }) }
  })
  if (a === 0 && t >= last) labels.push({ id: "waste", text: "$9.40 a sale · was $5.90", tone: "hot", x: Math.cos(0.6) * 2.1, y: 1.6, z: Math.sin(0.6) * 2.1 })
  if (a === 1 && t >= last) labels.push({ id: "moved", text: "Budget moved · your OK first", tone: "new", x: Math.cos(4.4) * 2.1, y: 1.9, z: Math.sin(4.4) * 2.1 })
  const k = agentOver(p, a, t, ADS.length), ad = ADS[a === 1 ? 2 : Math.max(0, k)]
  return { things, labels, agent: k >= 0 ? { x: Math.cos(ad.ang) * 2.1, y: 0.7, z: Math.sin(ad.ang) * 2.1 } : null }
}

// The numbers: each product's month grows out of the grid as a bar. The one that slipped turns red. Asked for a
// chart, the bars settle into one, in your sales sheet.
const SALES = [{ id: "bread", v: 4210, tone: "plain" as Tone, name: "Bread" }, { id: "pastry", v: 3180, tone: "hot" as Tone, name: "Pastry" }, { id: "coffee", v: 2640, tone: "plain" as Tone, name: "Coffee" }]
function numbers(p: ToolProof, a: number, t: number): SceneMoment {
  const things: SceneThing[] = [], labels: SceneLabel[] = [], { last } = pace(p, a)
  SALES.forEach((b, k) => {
    const g = a > 0 ? 1 : smooth(0, 0.8, t - visit(p, a, k, SALES.length)), hgt = Math.max(0.02, (b.v / 4210) * 1.8 * (0.15 + 0.85 * g)), w = 0.55
    things.push({ id: b.id, x: -1.0 + k * 1.0, y: -0.4 + hgt / 2, z: 0.6, size: w, aspect: hgt / w, icon: "bar", tone: a === 1 && t >= last ? "done" : g > 0.5 ? b.tone : "plain", alpha: 0.9 })
    // Each bar wears its month's sales on top and its product under it.
    labels.push({ id: `name-${b.id}`, text: b.name, tone: "plain", x: -1.0 + k * 1.0, y: -0.75, z: 0.6 })
    labels.push({ id: `sum-${b.id}`, text: `$${b.v.toLocaleString("en-CA")}`, tone: b.tone === "hot" && g > 0.5 ? "hot" : "plain", x: -1.0 + k * 1.0, y: -0.4 + hgt + 0.3, z: 0.6 })
  })
  if (a === 0 && t >= last) labels.push({ id: "slip", text: "Pastry slipped 4%", tone: "hot", x: 0, y: 2.9, z: 0.6 })
  if (a === 1 && t >= last) labels.push({ id: "chart", text: "Chart added to your sales sheet", tone: "new", x: 0, y: 2.9, z: 0.6 })
  const k = agentOver(p, a, t, SALES.length)
  return { things, labels, agent: k >= 0 ? { x: -1.0 + k * 1.0, y: 2.3, z: 0.6 } : null }
}

const SCENES: Record<string, (p: ToolProof, a: number, t: number, T: number) => SceneMoment> = { gmail: inbox, quickbooks: books, shopify: shop, meta: ads, microsoftexcel: numbers }

/** Whether a tool's work is shown as things in the world (else as cards). */
export const hasScene = (tool: string) => Object.hasOwn(SCENES, tool)

/** Tool p's work at time t of ask a; T keeps the world's drift going between asks. */
export function playScene(p: ToolProof, a: number, t: number, T: number): SceneMoment {
  return SCENES[p.tool](p, a, t, T)
}
