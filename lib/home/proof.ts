// What AI does in each tool, shown in the world rather than told. At a tool stop the tool's things (invoices, emails,
// rows) stand in a stack beside its world (lib/home/scene.ts); the visitor asks in plain words (a tap on an ask) and the things answer
// at once: the overdue one glows, the inbox sorts itself, the chart grows. Most visitors have never seen AI do real
// work in their own tools; this is where they watch it (.impeccable/surfaces/design-home-html.md). All data is an
// example and wears the Example tag on the page.

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
      { say: "What sold best this month?", reply: "Bread and coffee are up. Pastry slipped.", states: { bread: "plain", pastry: "hot", coffee: "plain" }, order: ["pastry", "bread", "coffee"] },
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
