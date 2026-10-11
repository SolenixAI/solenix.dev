// What AI does in each tool, shown in the world rather than told. At a tool stop the tool's things (invoices, emails,
// rows) stand as cards in the world beside its world (lib/home/scene.ts, lib/space/cards.ts). The AI does the ask live:
// the ask types out, the agent goes to each thing and changes it there, then the answer appears (playProof). Most
// visitors have never seen AI do real work in their own tools; this is where they watch it
// (.impeccable/surfaces/design-home-html.md). All data is an example and says Example in the world.

type ProofState = "plain" | "hot" | "dim" | "done" | "new"
type ProofThing = { id: string; label: string; value: string }
type ProofAsk = {
  /** The plain words a visitor would say. */
  say: string
  /** What came back, in a few words. */
  reply: string
  /** Each thing's state after this ask; a thing not named is dim. */
  states: Record<string, ProofState>
  /** Things that exist only after this ask (a drafted invoice, a booked meeting). */
  adds?: ProofThing[]
  /** Sort order of the things after this ask, by id; the first is nearest the viewer. */
  order?: string[]
}
export type ToolProof = { tool: string; things: ProofThing[]; asks: ProofAsk[] }

export const PROOF: ToolProof[] = [
  {
    tool: "quickbooks",
    things: [
      { id: "hillside", label: "Hillside Roofing", value: "$2,400 · 64 days" },
      { id: "eastend", label: "East End Yoga", value: "$850 · 31 days" },
      { id: "harbour", label: "Harbour Dental", value: "$1,200 · 12 days" },
      { id: "cove", label: "Cove Road Cafe", value: "$430 · paid" },
    ],
    asks: [
      { say: "Who owes me money?", reply: "Three owe you $4,450. One is past 60 days.", states: { hillside: "hot", eastend: "plain", harbour: "plain", cove: "dim" }, order: ["hillside", "eastend", "harbour", "cove"] },
      { say: "Invoice Harbour Dental for the retainer", reply: "The invoice is ready. You check it, then it goes.", states: { harbour: "done" }, adds: [{ id: "retainer", label: "Retainer invoice", value: "ready to send" }], order: ["retainer", "harbour", "hillside", "eastend", "cove"] },
    ],
  },
  {
    tool: "gmail",
    things: [
      { id: "reply", label: "Needs a reply today", value: "4" },
      { id: "wait", label: "Can wait", value: "9" },
      { id: "junk", label: "Junk", value: "16" },
    ],
    asks: [
      { say: "Sort today's inbox", reply: "Four need you today. Sixteen are junk.", states: { reply: "hot", wait: "plain", junk: "dim" }, order: ["reply", "wait", "junk"] },
      { say: "Book 30 minutes with Harbour Dental", reply: "Tuesday at 10:30 works. The invite waits for your OK.", states: { reply: "plain" }, adds: [{ id: "invite", label: "Tue 10:30 · Harbour Dental", value: "invite ready" }], order: ["invite", "reply", "wait", "junk"] },
    ],
  },
  {
    tool: "shopify",
    things: [
      { id: "caramels", label: "Sea salt caramels", value: "14 left · 3 sell a day" },
      { id: "mitts", label: "Wool mitts", value: "9 left · 2 sell a day" },
      { id: "jam", label: "Partridgeberry jam", value: "120 left" },
    ],
    asks: [
      { say: "What runs out this month?", reply: "Caramels and mitts run out within 30 days.", states: { caramels: "hot", mitts: "hot", jam: "dim" }, order: ["caramels", "mitts", "jam"] },
      { say: "Reorder the two running low", reply: "Both reorders are drafted. You approve them.", states: { caramels: "done", mitts: "done", jam: "dim" }, adds: [{ id: "reorder", label: "Reorder · caramels and mitts", value: "drafted" }], order: ["reorder", "caramels", "mitts", "jam"] },
    ],
  },
  {
    tool: "meta",
    things: [
      { id: "local", label: "Local awareness", value: "$9.40 a sale · was $5.90" },
      { id: "arrivals", label: "New arrivals", value: "$6.80 a sale · was $6.10" },
      { id: "fall", label: "Fall sale", value: "$4.10 a sale · was $4.60" },
    ],
    asks: [
      { say: "Which ad is wasting money?", reply: "Local awareness now costs far more per sale.", states: { local: "hot", arrivals: "plain", fall: "plain" }, order: ["local", "arrivals", "fall"] },
      { say: "Move its budget to the fall sale", reply: "The change is ready. You make the call.", states: { local: "dim", fall: "done", arrivals: "plain" }, adds: [{ id: "shift", label: "Budget moved to Fall sale", value: "waiting for your OK" }], order: ["shift", "fall", "arrivals", "local"] },
    ],
  },
  {
    tool: "microsoftexcel",
    things: [
      { id: "bread", label: "Bread", value: "$4,210 · up 8%" },
      { id: "pastry", label: "Pastry", value: "$3,180 · down 4%" },
      { id: "coffee", label: "Coffee", value: "$2,640 · up 10%" },
    ],
    asks: [
      { say: "What slipped this month?", reply: "Pastry slipped 4%. Bread and coffee are up.", states: { bread: "plain", pastry: "hot", coffee: "plain" }, order: ["pastry", "bread", "coffee"] },
      { say: "Make me a chart of it", reply: "The chart is in your sales sheet.", states: { bread: "done", pastry: "done", coffee: "done" }, adds: [{ id: "chart", label: "Sales by product", value: "chart added" }], order: ["chart", "bread", "pastry", "coffee"] },
    ],
  },
]

export type ShownThing = ProofThing & { state: ProofState }

/** The things a tool shows after ask `a` (-1: before any ask), in the order its answer puts them, each with its look:
 * what the answer found is lit, what it made is new, the rest is dim. */
export function placeProof(p: ToolProof, a: number): ShownThing[] {
  const ask = p.asks[a]
  const all = [...(ask?.adds ?? []), ...p.things]
  const ids = ask?.order ?? p.things.map((t) => t.id)
  return ids.map((id) => all.find((t) => t.id === id)).filter((t): t is ProofThing => !!t).map((t) => ({
    ...t, state: !ask ? "plain" : ask.adds?.some((n) => n.id === t.id) ? "new" : ask.states[t.id] ?? "dim",
  }))
}

/** One moment of an ask being done, live: what has been typed, each thing's look and place, where the agent is. */
export type ProofMoment = {
  /** The ask as typed so far. */
  typed: string
  /** The things on show, each with its place in the stack (0 is the top) and whether it is there yet. */
  things: (ShownThing & { slot: number; show: number })[]
  /** The thing the agent is working at ("say" while the ask is being typed), or null. */
  at: string | null
  /** How far the answer is shown, 0 to 1. */
  reply: number
}

// The pace of one ask: a beat, the typing, a beat, then one thing after another, then the answer.
const BEAT = 0.3, PER_CHAR = 0.035, STEP = 0.9, FLIP = 0.45

/** When ask `a` types, starts its work and finishes it, in seconds from its start. */
export const pace = (p: ToolProof, a: number) => { const typeEnd = BEAT + Math.min(1.2, p.asks[a].say.length * PER_CHAR), s0 = typeEnd + BEAT
  return { typeEnd, s0, last: s0 + STEP * placeProof(p, a).length } }

/** How long ask `a` takes to play, in seconds. */
export const proofLength = (p: ToolProof, a: number) => pace(p, a).last + 0.4

/** Ask `a`, `t` seconds after it starts: the AI reads the ask, goes to each thing in the order its answer puts
 * them, and changes it there, so the visitor watches the work happen. Things it has done take the top of the stack;
 * the rest wait below in their old order. A thing the ask makes appears only when the agent makes it. */
export function playProof(p: ToolProof, a: number, t: number): ProofMoment {
  const ask = p.asks[a], end = placeProof(p, a), { typeEnd, s0, last } = pace(p, a)
  const typed = ask.say.slice(0, Math.max(0, Math.round((t - BEAT) / (typeEnd - BEAT) * ask.say.length)))
  const doneN = end.filter((_, k) => t >= s0 + STEP * k + FLIP).length
  const waiting = p.things.filter((x) => !end.slice(0, doneN).some((d) => d.id === x.id))
  const things = end.map((x, k) => {
    if (k < doneN) return { ...x, slot: k, show: 1 }
    const isNew = !p.things.some((o) => o.id === x.id)
    const w = waiting.findIndex((o) => o.id === x.id)
    return { ...x, state: "plain" as ProofState, slot: doneN + Math.max(0, w), show: isNew ? 0 : 1 }
  })
  const k = Math.floor((t - s0) / STEP), at = t < BEAT ? null : t < s0 ? "say" : k >= 0 && k < end.length ? end[k].id : null
  return { typed, things, at, reply: t >= last + 0.4 ? 1 : Math.max(0, (t - last) / 0.4) }
}
